(function (global) {
    const game = global.Huisha3D || (global.Huisha3D = {});
    const THREE = global.THREE;
    class ThreeControls {
        constructor({ camera, domElement, map, story, isPaused, getDoorAngle }) {
            Object.assign(this, { camera, domElement, map, story, isPaused, getDoorAngle });
            this.keys = new Set();
            this.touchMove = { x: 0, y: 0 };
            this.yaw = map.playerStart.yaw;
            this.pitch = 0;
            this.playerRadius = map.playerRadius;
            this.handlers = [];
            camera.position.set(map.playerStart.x, map.playerStart.y, map.playerStart.z);
            const saved = story.state.position;
            if (saved && this.canOccupy(saved.x, saved.z)) {
                camera.position.x = saved.x;
                camera.position.z = saved.z;
                this.yaw = saved.yaw;
                this.pitch = Math.max(-1.15, Math.min(1.15, saved.pitch));
            }
            this.bind();
            this.applyLook();
        }
        listen(target, type, handler, options) {
            target.addEventListener(type, handler, options);
            this.handlers.push([target, type, handler, options]);
        }
        bind() {
            this.listen(global, 'keydown', event => {
                if (this.isPaused() || event.isComposing || /INPUT|TEXTAREA|SELECT/.test(event.target?.tagName)) return;
                if (/^(Key[WASD]|Arrow(Up|Down|Left|Right)|ShiftLeft|ShiftRight)$/.test(event.code)) {
                    event.preventDefault(); this.keys.add(event.code);
                }
            });
            this.listen(global, 'keyup', event => this.keys.delete(event.code));
            this.listen(global, 'blur', () => this.clear());
            this.listen(document, 'visibilitychange', () => { if (document.hidden) this.clear(); });
            this.listen(document, 'pointerlockchange', () => this.clear());
            this.listen(this.domElement, 'pointerdown', event => {
                if (this.isPaused()) return;
                this.drag = { id: event.pointerId, x: event.clientX, y: event.clientY };
                if (event.pointerType === 'mouse' && this.domElement.requestPointerLock) {
                    try { this.domElement.requestPointerLock()?.catch?.(() => {}); } catch (_) { /* drag remains available */ }
                }
            });
            this.listen(global, 'pointermove', event => {
                if (this.isPaused()) return;
                const locked = document.pointerLockElement === this.domElement;
                if (!locked && (!this.drag || this.drag.id !== event.pointerId)) return;
                const dx = locked ? event.movementX : event.clientX - this.drag.x;
                const dy = locked ? event.movementY : event.clientY - this.drag.y;
                if (!Number.isFinite(dx) || !Number.isFinite(dy)) return;
                this.yaw -= dx * 0.0024;
                this.pitch = Math.max(-1.15, Math.min(1.15, this.pitch - dy * 0.0024));
                if (this.drag) Object.assign(this.drag, { x: event.clientX, y: event.clientY });
                this.applyLook();
            });
            const release = event => { if (this.drag?.id === event.pointerId) this.drag = null; };
            this.listen(global, 'pointerup', release);
            this.listen(global, 'pointercancel', release);
        }
        clear() { this.keys.clear(); this.touchMove = { x: 0, y: 0 }; this.drag = null; }
        applyLook() {
            this.camera.lookAt(this.camera.position.clone().add(new THREE.Vector3(
                Math.sin(this.yaw) * Math.cos(this.pitch), Math.sin(this.pitch), Math.cos(this.yaw) * Math.cos(this.pitch))));
        }
        update(delta) {
            if (this.isPaused()) { this.clear(); return; }
            const forward = Number(this.keys.has('KeyW') || this.keys.has('ArrowUp')) - Number(this.keys.has('KeyS') || this.keys.has('ArrowDown')) + this.touchMove.y;
            const right = Number(this.keys.has('KeyD') || this.keys.has('ArrowRight')) - Number(this.keys.has('KeyA') || this.keys.has('ArrowLeft')) + this.touchMove.x;
            // Forward cross up yields the camera's right axis; the old prototype reversed it.
            const move = new THREE.Vector3(Math.sin(this.yaw) * forward - Math.cos(this.yaw) * right, 0,
                Math.cos(this.yaw) * forward + Math.sin(this.yaw) * right);
            if (move.lengthSq() > 0) {
                const speed = this.keys.has('ShiftLeft') || this.keys.has('ShiftRight') ? 3.5 : 2.35;
                move.normalize().multiplyScalar(speed * Math.min(delta, 0.05)); this.tryMove(move);
            }
            this.applyLook();
        }
        tryMove(move) {
            const steps = Math.max(1, Math.ceil(Math.hypot(move.x, move.z) / 0.08));
            const dx = move.x / steps, dz = move.z / steps;
            for (let i = 0; i < steps; i++) {
                const p = this.camera.position;
                if (this.canOccupy(p.x + dx, p.z)) p.x += dx;
                if (this.canOccupy(p.x, p.z + dz)) p.z += dz;
            }
        }
        canOccupy(x, z) {
            const radius = this.playerRadius;
            const inside = this.map.walkable.some(rect => (!rect.requiresState || this.story.state[rect.requiresState])
                && x >= rect.xMin + radius && x <= rect.xMax - radius
                && z >= rect.zMin + radius && z <= rect.zMax - radius);
            return inside && !this.blocksDoor(x, z) && !this.map.obstacles.some(rect => {
                if (rect.requiresState && !this.story.state[rect.requiresState]) return false;
                const dx = x - Math.max(rect.xMin, Math.min(rect.xMax, x));
                const dz = z - Math.max(rect.zMin, Math.min(rect.zMax, z));
                return dx * dx + dz * dz < radius * radius;
            });
        }
        blocksDoor(x, z) {
            return [this.map.door, ...(this.map.extraDoors || [])].filter(Boolean).some(door => this.blocksLeaf(x, z, door));
        }
        blocksLeaf(x, z, door) {
            const opened = this.story.state[door.stateField || 'opened'];
            const angle = this.getDoorAngle?.(door.id) ?? (opened ? door.openAngle : 0);
            const dx = x - door.hingeX, dz = z - door.hingeZ;
            // Transform the player into the rotating leaf's local space, then test circle vs rectangle.
            const localX = Math.cos(angle) * dx - Math.sin(angle) * dz;
            const localZ = Math.sin(angle) * dx + Math.cos(angle) * dz;
            const gapX = localX - Math.max(0, Math.min(door.width, localX));
            const halfDepth = door.thickness / 2;
            // Include the plate and drums projecting from the front, so the camera cannot enter them.
            const gapZ = localZ - Math.max(-halfDepth, Math.min(door.frontDepth ?? halfDepth, localZ));
            return gapX * gapX + gapZ * gapZ < this.playerRadius * this.playerRadius;
        }
        snapshot() { return { x: this.camera.position.x, z: this.camera.position.z, yaw: this.yaw, pitch: this.pitch }; }
        dispose() {
            this.clear();
            this.handlers.forEach(([target, type, handler, options]) => target.removeEventListener(type, handler, options));
            if (document.pointerLockElement === this.domElement) document.exitPointerLock();
        }
    }
    game.ThreeControls = ThreeControls;
})(window);
