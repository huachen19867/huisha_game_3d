(function (global) {
    const game = global.Huisha3D || (global.Huisha3D = {});
    const THREE = global.THREE;
    class ThreeInteraction {
        constructor({ camera, map, scene, prompt, story, isPaused, onInspect }) {
            Object.assign(this, { camera, map, scene, prompt, story, isPaused, onInspect });
            this.ray = new THREE.Raycaster(); this.direction = new THREE.Vector3(); this.current = null;
            this.onKey = event => {
                if (event.code === 'KeyE' && !event.repeat && !event.isComposing && !event.defaultPrevented
                    && !/INPUT|TEXTAREA|SELECT/.test(event.target?.tagName) && !this.isPaused()) this.activate();
            };
            global.addEventListener('keydown', this.onKey);
        }
        update() {
            this.current = null;
            if (!this.isPaused()) {
                this.camera.getWorldDirection(this.direction);
                let best = Infinity;
                for (const item of this.map.interactables) {
                    if ((item.space || 'house') !== (this.story.state.memory || 'house')) continue;
                    if (item.requiresOpen && !this.story.state.opened) continue;
                    if (item.requiresWater && !this.story.state.waterSolved) continue;
                    if (item.requiresTruth && !this.story.truthSolved()) continue;
                    const delta = new THREE.Vector3(item.position.x, item.position.y, item.position.z).sub(this.camera.position);
                    const distance = delta.length();
                    const facing = delta.clone().normalize().dot(this.direction);
                    if (distance > item.radius || facing < 0.78) continue;
                    this.ray.set(this.camera.position, delta.clone().normalize()); this.ray.far = distance;
                    const blocked = this.ray.intersectObjects(this.scene.children, true).some(hit =>
                        hit.distance < distance - 0.12 && hit.object.userData.blocksSight && hit.object.userData.item !== item.id);
                    if (blocked) continue;
                    const score = distance + (1 - facing) * 3;
                    if (score < best) { this.current = item; best = score; }
                }
            }
            this.prompt.hidden = !this.current;
            if (this.current) this.prompt.textContent = `E · ${this.current.title}${this.story.state.records.includes(this.current.id) ? ' · 已观察' : ''}`;
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
