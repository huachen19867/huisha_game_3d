(function (global) {
    const copyText=global.HuishaCopy;
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
            if (ids.includes('lock')) tasks.push([s.opened, s.opened ? copyText('explorationmap.status') : copyText('explorationmap.status.2')]);
            if (ids.includes('water_station')) tasks.push([s.waterSolved, s.waterSolved ? copyText('explorationmap.status.3') : copyText('explorationmap.status.4')]);
            if (ids.includes('yard_gate')) tasks.push([s.waterSolved, s.waterSolved ? copyText('explorationmap.status.5') : copyText('explorationmap.status.6')]);
            if (ids.includes('portrait') || ids.includes('portrait_back')) tasks.push([s.portraitBackRead,
                s.portraitBackRead ? copyText('explorationmap.status.7') : s.portrait ? copyText('explorationmap.status.8') : copyText('explorationmap.status.9')]);
            if (area.space) tasks.push([s.deductions[area.space], s.deductions[area.space] ? copyText('explorationmap.status.10') : copyText('explorationmap.status.11')]);
            return { kind: tasks.some(([done]) => !done) ? 'pending' : tasks.length ? 'resolved' : 'visited',
                text: tasks.length ? tasks.map(([, text]) => text).join(' · ') : copyText('explorationmap.status.text') };
        }
        show(options) {
            this.options = options; const active = this.story.state.memory || 'house';
            if (options.resetScope || !this.scope) this.scope = active;
            if (options.resetScope) this.focusBySpace[active] = 'all';
            this.open(copyText('explorationmap.show'), copyText('explorationmap.show.2'),
                [[options.exitLabel, options.onExit]], copyText('explorationmap.show.3'));
            this.render(document.getElementById('reader-body'));
        }
        render(container) {
            container.querySelector('.exploration-map')?.remove();
            const root = document.createElement('section'); root.className = 'exploration-map';
            const areas = ThreeExplorationMap.areas().filter(area => this.story.state.visitedAreas.includes(area.id) && ThreeExplorationMap.allowed(area, this.story.state));
            const spaces = [...new Set(areas.map(area => area.space || 'house'))];
            if (!spaces.includes(this.scope)) this.scope = spaces[0];
            const nav = document.createElement('nav'); nav.className = 'map-spaces'; nav.setAttribute('aria-label', copyText('explorationmap.render'));
            for (const space of spaces) {
                const button = document.createElement('button'); button.type = 'button'; button.dataset.mapSpace = space;
                button.textContent = space === 'house' ? copyText('evidencejournal.append.7') : game.MEMORIES[space].title;
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
                const empty = document.createElement('p'); empty.textContent = copyText('explorationmap.render.2'); root.append(empty);
            } else this.floor(root, visible, records);
            const legend = document.createElement('p'); legend.className = 'map-legend';
            for (const [kind, text] of [['visited', copyText('explorationmap.render.3')], ['pending', copyText('explorationmap.render.4')], ['resolved', copyText('explorationmap.render.5')]]) {
                const span = document.createElement('span'); span.className = `map-key ${kind}`; span.textContent = text; legend.append(span);
            }
            root.append(legend);
            for (const area of visible) {
                const section = document.createElement('section'); section.className = 'map-area-notes'; section.dataset.mapAreaNotes = area.id;
                const heading = document.createElement('h3'); heading.textContent = area.title;
                const known = records.filter(record => record.area === area.id), status = this.status(area, known);
                const note = document.createElement('p'); note.className = `map-status ${status.kind}`; note.textContent = status.text;
                section.append(heading, note);
                if (!known.length) { const empty = document.createElement('p'); empty.className = 'map-empty'; empty.textContent = copyText('explorationmap.render.6'); section.append(empty); }
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
            svg.setAttribute('aria-label', copyText('explorationmap.floor', this.scope === 'house' ? copyText('explorationmap.floor.2') : game.MEMORIES[this.scope].title));
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
                const title = element('title', {}, group); title.textContent = current ? copyText('explorationmap.floor.3') : copyText('explorationmap.floor.4');
            }
            const label = document.createElement('label'); label.className = 'map-focus'; label.textContent = copyText('explorationmap.floor.5');
            const select = document.createElement('select'); select.setAttribute('aria-label', copyText('explorationmap.floor.6')); select.dataset.mapFocus = '';
            for (const [id, title] of [['all', copyText('explorationmap.floor.7')], ...areas.map(area => [area.id, area.title])]) {
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
