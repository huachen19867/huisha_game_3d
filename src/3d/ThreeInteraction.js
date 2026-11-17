(function (global) {
    const game = global.Huisha3D || (global.Huisha3D = {});
    const THREE = global.THREE;
    class ThreeInteraction {
        constructor({ camera, map, scene, prompt, focusMarker, story, isPaused, onInspect }) {
            Object.assign(this, { camera, map, scene, prompt, focusMarker, story, isPaused, onInspect });
            this.ray = new THREE.Raycaster(); this.direction = new THREE.Vector3(); this.delta = new THREE.Vector3(); this.current = null;
            this.projected = new THREE.Vector3();
            this.hits = []; this.queryInterval = 0.05; this.untilQuery = 0; this.rebuildOccluders();
            this.onKey = event => {
                if (event.code === 'KeyE' && !event.repeat && !event.isComposing && !event.defaultPrevented
                    && !/INPUT|TEXTAREA|SELECT/.test(event.target?.tagName) && !this.isPaused()) this.activate();
            };
            global.addEventListener('keydown', this.onKey);
        }
        rebuildOccluders() {
            this.occluders = new Map();
            const visit = (object, inherited = 'house') => {
                const space = object.userData.memorySpace || inherited;
                if (object.userData.blocksSight && typeof object.raycast === 'function') {
                    if (!this.occluders.has(space)) this.occluders.set(space, []);
                    this.occluders.get(space).push(object);
                }
                object.children.forEach(child => visit(child, space));
            };
            visit(this.scene); this.untilQuery = 0;
        }
        visible(object) {
            for (let node = object; node; node = node.parent) if (!node.visible) return false;
            return true;
        }
        update(delta) {
            if (this.isPaused()) {
                this.current = null; this.untilQuery = 0; this.showPrompt(); return;
            }
            const space = this.story.state.memory || 'house';
            if (Number.isFinite(delta) && space === this.lastSpace) {
                this.untilQuery -= delta;
                if (this.untilQuery > 1e-6) { this.updateMarker(); return; }
            }
            this.lastSpace = space; this.untilQuery = this.queryInterval;
            this.current = null;
            this.camera.getWorldDirection(this.direction);
            const candidates = [];
            for (const item of this.map.interactables) {
                if ((item.space || 'house') !== space) continue;
                if (item.requiresOpen && !this.story.state.opened) continue;
                if (item.requiresWater && !this.story.state.waterSolved) continue;
                if (item.requiresTruth && !this.story.truthSolved()) continue;
                this.delta.set(item.position.x, item.position.y, item.position.z).sub(this.camera.position);
                const distanceSquared = this.delta.lengthSq();
                if (distanceSquared > item.radius * item.radius) continue;
                this.projected.set(item.position.x, item.position.y, item.position.z).project(this.camera);
                if (!this.inViewport()) continue;
                const distance = Math.sqrt(distanceSquared), facing = distance ? this.delta.dot(this.direction) / distance : 1;
                if (facing >= 0.78) candidates.push({ item, distance, score: distance + (1 - facing) * 3 });
            }
            candidates.sort((a, b) => a.score - b.score);
            const occluders = this.occluders.get(space) || [];
            for (const { item, distance } of candidates) {
                this.delta.set(item.position.x, item.position.y, item.position.z).sub(this.camera.position);
                if (distance) this.delta.divideScalar(distance); else this.delta.copy(this.direction);
                this.ray.set(this.camera.position, this.delta); this.ray.far = Math.max(0, distance - 0.12);
                this.hits.length = 0;
                this.ray.intersectObjects(occluders.filter(object => object.userData.item !== item.id && this.visible(object)), false, this.hits);
                if (!this.hits.length || this.hits[0].distance >= distance - 0.12) { this.current = item; break; }
            }
            this.showPrompt();
        }
        showPrompt() {
            const hidden = !this.current;
            if (this.prompt.hidden !== hidden) this.prompt.hidden = hidden;
            if (this.current) {
                const label = `E · ${this.current.title}${this.story.state.records.includes(this.current.id) ? ' · 已观察' : ''}`;
                if (this.prompt.textContent !== label) this.prompt.textContent = label;
            }
            this.updateMarker();
        }
        inViewport() {
            const p = this.projected;
            return Number.isFinite(p.x) && Number.isFinite(p.y) && Number.isFinite(p.z)
                && Math.abs(p.x) <= 0.96 && Math.abs(p.y) <= 0.96 && p.z >= -1 && p.z <= 1;
        }
        updateMarker() {
            if (!this.focusMarker) return;
            if (!this.current || this.isPaused()) { this.focusMarker.hidden = true; return; }
            const position = this.current.position;
            this.camera.updateWorldMatrix(true, false);
            this.projected.set(position.x, position.y, position.z).project(this.camera);
            const visible = this.inViewport();
            this.focusMarker.hidden = !visible;
            if (!visible) { this.prompt.hidden = true; return; }
            this.focusMarker.style.left = `${(this.projected.x + 1) * 50}%`;
            this.focusMarker.style.top = `${(1 - this.projected.y) * 50}%`;
            this.focusMarker.dataset.observed = String(this.story.state.records.includes(this.current.id));
        }
        activate() {
            this.update();
            if (!this.current || this.isPaused()) return;
            if (this.current.journal !== false) this.story.record(this.current.id);
            this.onInspect(this.current);
        }
        dispose() { global.removeEventListener('keydown', this.onKey); }
    }
    game.ThreeInteraction = ThreeInteraction;
})(window);
