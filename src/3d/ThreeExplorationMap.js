(function (global) {
    const game = global.Huisha3D;
    class ThreeExplorationMap {
        constructor(options) { Object.assign(this, options); this.focusBySpace = {}; }
        static areas() { return (game.WORLD_MAP || game.MAIN_HALL_MAP).walkable; }
        static allowed(area, state) { return !!area && (!area.requiresState || !!state[area.requiresState]); }
        static areaAt(pose, space, state) {
            if (!pose || !Number.isFinite(pose.x) || !Number.isFinite(pose.z)) return null;
            const areas = this.areas();
            for (let i = areas.length - 1; i >= 0; i--) {
                const area = areas[i];
                if ((area.space || 'house') === space && this.allowed(area, state)
                    && pose.x >= area.xMin && pose.x <= area.xMax && pose.z >= area.zMin && pose.z <= area.zMax) return area;
            }
            return null;
        }
        status(area, records) {
            const s = this.story.state, ids = records.map(record => record.id), tasks = [];
            if (ids.includes('lock')) tasks.push([s.opened, s.opened ? '归门字轮已解开' : '归门字轮尚未解开']);
            if (ids.includes('water_station')) tasks.push([s.waterSolved, s.waterSolved ? '量水秤已压平' : '量水秤尚未压平']);
            if (ids.includes('yard_gate')) tasks.push([s.waterSolved, s.waterSolved ? '院门铜索已松开' : '院门被铜索扣着']);
            if (ids.includes('portrait') || ids.includes('portrait_back')) tasks.push([s.portraitBackRead,
                s.portraitBackRead ? '相框背字已读' : s.portrait ? '相框已揭布，可以继续翻看' : '相框仍蒙着黑布']);
            if (area.space) tasks.push([s.deductions[area.space], s.deductions[area.space] ? '这段记忆已核对' : '这段记忆尚未核对']);
            return { kind: tasks.some(([done]) => !done) ? 'pending' : tasks.length ? 'resolved' : 'visited',
                text: tasks.length ? tasks.map(([, text]) => text).join(' · ') : '已走过这里' };
        }
        show(options) {
            this.options = options; const active = this.story.state.memory || 'house';
            if (options.resetScope || !this.scope) this.scope = active;
            if (options.resetScope) this.focusBySpace[active] = 'all';
            this.open('探索地图', '只记下走过的地方和已经观察过的器物。颜色表示已知事项，不代表房间已经搜完。',
                [[options.exitLabel, options.onExit]], '旧宅 · 随走随记');
            this.render(document.getElementById('reader-body'));
        }
        render(container) {
            container.querySelector('.exploration-map')?.remove();
            const root = document.createElement('section'); root.className = 'exploration-map';
            const areas = ThreeExplorationMap.areas().filter(area => this.story.state.visitedAreas.includes(area.id) && ThreeExplorationMap.allowed(area, this.story.state));
            const spaces = [...new Set(areas.map(area => area.space || 'house'))];
            if (!spaces.includes(this.scope)) this.scope = spaces[0];
            const nav = document.createElement('nav'); nav.className = 'map-spaces'; nav.setAttribute('aria-label', '已走过的空间');
            for (const space of spaces) {
                const button = document.createElement('button'); button.type = 'button'; button.dataset.mapSpace = space;
                button.textContent = space === 'house' ? '老宅与雨庭' : game.MEMORIES[space].title;
                button.setAttribute('aria-pressed', String(this.scope === space));
                button.addEventListener('click', () => {
                    this.scope = space; this.render(container);
                    [...container.querySelectorAll('[data-map-space]')].find(element => element.dataset.mapSpace === space)?.focus();
                }); nav.append(button);
            }
            root.append(nav);
            const visible = areas.filter(area => (area.space || 'house') === this.scope);
            const records = this.knownRecords().filter(record => visible.some(area => area.id === record.area));
            if (!visible.length) {
                const empty = document.createElement('p'); empty.textContent = '还没有画下路线。走进一个房间后再看看。'; root.append(empty);
            } else this.floor(root, visible, records);
            const legend = document.createElement('p'); legend.className = 'map-legend';
            for (const [kind, text] of [['visited', '走过'], ['pending', '已知事项待处理'], ['resolved', '已知事项已处理']]) {
                const span = document.createElement('span'); span.className = `map-key ${kind}`; span.textContent = text; legend.append(span);
            }
            root.append(legend);
            for (const area of visible) {
                const section = document.createElement('section'); section.className = 'map-area-notes'; section.dataset.mapAreaNotes = area.id;
                const heading = document.createElement('h3'); heading.textContent = area.title;
                const known = records.filter(record => record.area === area.id), status = this.status(area, known);
                const note = document.createElement('p'); note.className = `map-status ${status.kind}`; note.textContent = status.text;
                section.append(heading, note);
                if (!known.length) { const empty = document.createElement('p'); empty.className = 'map-empty'; empty.textContent = '还没有收录这里的原文。'; section.append(empty); }
                for (const record of known) {
                    const button = document.createElement('button'); button.type = 'button'; button.dataset.mapRecord = record.id;
                    button.textContent = record.title; button.addEventListener('click', () => this.onRead(record.id)); section.append(button);
                }
                root.append(section);
            }
            container.append(root);
        }
        floor(container, areas, records) {
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.classList.add('map-floor');
            const minX = Math.min(...areas.map(area => area.xMin)) - 1, maxX = Math.max(...areas.map(area => area.xMax)) + 1;
            const minZ = Math.min(...areas.map(area => area.zMin)) - 1, maxZ = Math.max(...areas.map(area => area.zMax)) + 1;
            const span = Math.max(maxX - minX, maxZ - minZ), unit = span / 40;
            const fullBounds = `${minX} ${minZ} ${maxX - minX} ${maxZ - minZ}`;
            svg.setAttribute('viewBox', fullBounds); svg.setAttribute('role', 'img');
            svg.setAttribute('aria-label', `${this.scope === 'house' ? '老宅' : game.MEMORIES[this.scope].title}已走路线；房间与器物记录见下方`);
            const element = (name, attributes, parent = svg) => {
                const node = document.createElementNS('http://www.w3.org/2000/svg', name);
                for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, String(value)); parent.append(node); return node;
            };
            for (const area of areas) {
                const known = records.filter(record => record.area === area.id), status = this.status(area, known);
                const group = element('g', { 'data-map-area': area.id, class: `map-room ${status.kind}` });
                element('rect', { x: area.xMin, y: area.zMin, width: area.xMax - area.xMin, height: area.zMax - area.zMin, rx: 0.1 }, group);
                const label = area.mapLabel || area.title;
                const text = element('text', { x: (area.xMin + area.xMax) / 2, y: (area.zMin + area.zMax) / 2,
                    'font-size': Math.min(unit * 1.2, (area.xMax - area.xMin) / (label.length + 1)), 'text-anchor': 'middle', 'dominant-baseline': 'middle' }, group);
                text.textContent = label;
            }
            for (const record of records) {
                const point = record.position || (record.id === 'portrait_back' ? game.MAIN_HALL_MAP.interactables.find(item => item.id === 'portrait').position : null);
                if (!point) continue;
                const marker = element('circle', { cx: point.x, cy: point.z, r: unit * 0.18, class: 'map-record-point', 'data-map-point': record.id });
                const title = element('title', {}, marker); title.textContent = record.title;
            }
            const activeSpace = this.story.state.memory || 'house';
            const pose = this.scope === activeSpace ? this.options.pose : this.scope === 'house' && this.story.state.memory ? this.story.state.memoryReturn : null;
            const poseArea = ThreeExplorationMap.areaAt(pose, this.scope, this.story.state);
            if (pose && poseArea && areas.some(area => area.id === poseArea.id)) {
                const current = this.scope === activeSpace;
                const yaw = Number.isFinite(pose.yaw) ? pose.yaw % (Math.PI * 2) : 0;
                const group = element('g', { class: current ? 'map-player' : 'map-return', 'data-map-player': current ? 'current' : 'return',
                    transform: `translate(${pose.x} ${pose.z}) rotate(${180 - yaw * 180 / Math.PI})` });
                element('circle', { cx: 0, cy: 0, r: unit * 0.43 }, group);
                element('path', { d: `M 0 ${-unit * 0.9} L ${unit * 0.35} ${-unit * 0.2} L ${-unit * 0.35} ${-unit * 0.2} Z` }, group);
                const title = element('title', {}, group); title.textContent = current ? '你的位置与朝向' : '厨房的返回位置';
            }
            const label = document.createElement('label'); label.className = 'map-focus'; label.textContent = '查看范围';
            const select = document.createElement('select'); select.setAttribute('aria-label', '地图查看范围'); select.dataset.mapFocus = '';
            for (const [id, title] of [['all', '完整已走路线'], ...areas.map(area => [area.id, area.title])]) {
                const option = document.createElement('option'); option.value = id; option.textContent = title; select.append(option);
            }
            select.value = areas.some(area => area.id === this.focusBySpace[this.scope]) ? this.focusBySpace[this.scope] : 'all';
            const focus = () => {
                this.focusBySpace[this.scope] = select.value;
                const area = areas.find(area => area.id === select.value);
                svg.setAttribute('viewBox', area ? `${area.xMin - 1} ${area.zMin - 1} ${area.xMax - area.xMin + 2} ${area.zMax - area.zMin + 2}` : fullBounds);
            };
            select.addEventListener('change', focus); focus(); label.append(select); container.append(label, svg);
        }
    }
    game.ThreeExplorationMap = ThreeExplorationMap;
})(window);
