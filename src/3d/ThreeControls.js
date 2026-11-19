(function (global) {
    const game = global.Huisha3D || (global.Huisha3D = {});
    const THREE = global.THREE;
    class ThreeControls {
        constructor({ camera, domElement, map, story, isPaused, getDoorAngle, getPreferences }) {
            Object.assign(this, { camera, domElement, map, story, isPaused, getDoorAngle, getPreferences });
            this.keys = new Set();
            this.lastForwardTap = -Infinity;
            this.height = 0; this.verticalSpeed = 0; this.grounded = true;
            this.touchMove = { x: 0, y: 0 };
            const start = this.startPose();
            this.yaw = start.yaw;
            this.pitch = 0;
            this.playerRadius = map.playerRadius;
            this.handlers = [];
            camera.position.set(start.x, map.playerStart.y, start.z);
            const saved = story.state.position && { ...story.state.position };
            if (saved) for (const obstacle of map.obstacles) if (obstacle.pushForward) this.clearMovingObstacle(obstacle, saved);
            if (saved) this.height = this.supportHeight(saved.x, saved.z);
            if (saved && this.canOccupy(saved.x, saved.z)) {
                camera.position.x = saved.x;
                camera.position.z = saved.z;
                this.yaw = saved.yaw;
                this.pitch = Math.max(-1.15, Math.min(1.15, saved.pitch));
            }
            this.height = this.supportHeight(camera.position.x, camera.position.z);
            camera.position.y = this.map.playerStart.y + this.height;
            this.bind();
            this.applyLook();
        }
        startPose() {
            const state = this.story.state;
            return game.MEMORIES?.[state.memory]?.start || (['letter','ledger','keys','gate'].includes(state.arrival) && this.map.roadStart) || this.map.playerStart;
        }
        listen(target, type, handler, options) {
            target.addEventListener(type, handler, options);
            this.handlers.push([target, type, handler, options]);
        }
        bind() {
            this.listen(global, 'keydown', event => {
                if (this.isPaused() || event.defaultPrevented || event.isComposing || /INPUT|TEXTAREA|SELECT/.test(event.target?.tagName)) return;
                if (/^(Key[WASD]|Arrow(Up|Down|Left|Right)|ShiftLeft|ShiftRight|Space)$/.test(event.code)) {
                    event.preventDefault();
                    if (!event.repeat && !this.keys.has(event.code)) {
                        if (event.code === 'KeyW') this.tapForward(event.timeStamp);
                        if (event.code === 'Space') this.jump();
                    }
                    this.keys.add(event.code);
                }
            });
            this.listen(global, 'keyup', event => {
                this.keys.delete(event.code);
                if (event.code === 'KeyW') this.sprinting = false;
            });
            this.listen(global, 'blur', () => this.clear());
            this.listen(document, 'visibilitychange', () => { if (document.hidden) this.clear(); });
            this.listen(document, 'pointerlockchange', () => { if (!document.pointerLockElement) this.clear(); });
            this.listen(this.domElement, 'pointerdown', event => {
                if (this.isPaused() || (event.pointerType === 'mouse' && event.button !== 0)
                    || (this.drag && this.drag.id !== event.pointerId)) return;
                this.drag = { id: event.pointerId, type: event.pointerType, x: event.clientX, y: event.clientY, travel: 0,
                    locked: document.pointerLockElement === this.domElement };
                this.domElement.focus?.({preventScroll:true});
                if (event.pointerType === 'mouse' && this.getPreferences?.()?.pointerLock !== false && !this.drag.locked && this.domElement.requestPointerLock) {
                    try { this.domElement.requestPointerLock()?.catch?.(() => {}); } catch (_) { /* drag remains available */ }
                }
            });
            this.listen(global, 'pointermove', event => {
                if (this.isPaused()) return;
                const locked = document.pointerLockElement === this.domElement;
                if (!locked && (!this.drag || this.drag.id !== event.pointerId)) return;
                if (locked && event.pointerType === 'touch') return;
                if (!locked && event.pointerType === 'mouse' && event.buttons === 0) { this.drag = null; return; }
                const dx = locked ? event.movementX : event.clientX - this.drag.x;
                const dy = locked ? event.movementY : event.clientY - this.drag.y;
                if (!Number.isFinite(dx) || !Number.isFinite(dy)) return;
                const preferences = this.getPreferences?.() || {};
                const touch = !locked && this.drag?.type === 'touch';
                const sensitivity = touch ? preferences.touchSensitivity : preferences.mouseSensitivity;
                const scale = 0.0024 * (sensitivity ?? 1);
                this.yaw -= dx * scale;
                this.pitch = Math.max(-1.15, Math.min(1.15, this.pitch - dy * scale * (preferences.invertY ? -1 : 1)));
                if (this.drag) this.drag.travel += Math.hypot(dx,dy);
                if (this.drag) Object.assign(this.drag, { x: event.clientX, y: event.clientY });
                this.applyLook();
            });
            const release = event => {
                const press = this.drag;
                if (press?.id !== event.pointerId) return;
                this.drag = null;
                if (event.type === 'pointerup' && event.target === this.domElement && press.travel <= 7 && !this.isPaused()) {
                    this.onTap?.(press.locked ? null : {x: press.x, y: press.y});
                }
            };
            this.listen(global, 'pointerup', release);
            this.listen(global, 'pointercancel', release);
        }
        tapForward(time) {
            this.sprinting = time - this.lastForwardTap <= 320;
            this.lastForwardTap = time;
        }
        jump() {
            if (!this.grounded || this.isPaused()) return;
            this.verticalSpeed = 4.6; this.grounded = false;
        }
        supportHeight(x,z) {
            let floor = this.story.state.memory ? 0 : game.storeyHeight(x,z);
            for (const rect of this.map.obstacles) {
                if (!rect.height || (rect.space || 'house') !== (this.story.state.memory || 'house')) continue;
                if (this.overlaps(rect,x,z)) floor = Math.max(floor,rect.height);
            }
            return floor;
        }
        clear() { this.sprinting = false; this.lastForwardTap = -Infinity; this.keys.clear(); this.touchMove = { x: 0, y: 0 }; this.drag = null; }
        applyLook() {
            this.camera.lookAt(this.camera.position.clone().add(new THREE.Vector3(
                Math.sin(this.yaw) * Math.cos(this.pitch), Math.sin(this.pitch), Math.cos(this.yaw) * Math.cos(this.pitch))));
        }
        update(delta) {
            if (this.isPaused()) { this.clear(); return; }
            const step = Math.min(delta, .05);
            const pos = this.camera.position;
            this.verticalSpeed -= 12.5 * step;
            const floor = this.supportHeight(pos.x,pos.z);
            this.height = Math.max(floor, this.height + this.verticalSpeed * step);
            this.grounded = this.height <= floor && this.verticalSpeed <= 0;
            if (this.grounded) this.verticalSpeed = 0;
            pos.y = this.map.playerStart.y + this.height;
            const forward = Number(this.keys.has('KeyW') || this.keys.has('ArrowUp')) - Number(this.keys.has('KeyS') || this.keys.has('ArrowDown')) + this.touchMove.y;
            const right = Number(this.keys.has('KeyD') || this.keys.has('ArrowRight')) - Number(this.keys.has('KeyA') || this.keys.has('ArrowLeft')) + this.touchMove.x;
            // Forward cross up yields the camera's right axis; the old prototype reversed it.
            const move = new THREE.Vector3(Math.sin(this.yaw) * forward - Math.cos(this.yaw) * right, 0,
                Math.cos(this.yaw) * forward + Math.sin(this.yaw) * right);
            if (move.lengthSq() > 0) {
                const speed = this.sprinting || this.keys.has('ShiftLeft') || this.keys.has('ShiftRight') ? 4.35 : 2.35;
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
        clearMovingObstacle(rect, pose) {
            if ((rect.space || 'house') !== (this.story.state.memory || 'house') || (rect.requiresState && !this.story.state[rect.requiresState])) return false;
            const radius = this.playerRadius;
            const dx = pose.x - Math.max(rect.xMin, Math.min(rect.xMax, pose.x));
            const dz = pose.z - Math.max(rect.zMin, Math.min(rect.zMax, pose.z));
            if (dx * dx + dz * dz >= radius * radius) return false;
            const clearZ = rect.zMax + radius + 0.01;
            if (!this.canOccupy(pose.x, clearZ)) return false;
            pose.z = clearZ; return true;
        }
        overlaps(rect,x,z) {
            const dx = x - Math.max(rect.xMin, Math.min(rect.xMax,x));
            const dz = z - Math.max(rect.zMin, Math.min(rect.zMax,z));
            return dx*dx + dz*dz < this.playerRadius*this.playerRadius;
        }
        fitsFloor(x,z,space,r) {
            const left=x-r, right=x+r, near=z-r, far=z+r;
            const tiles = this.map.walkable.filter(rect => (rect.space || 'house') === space
                && (!rect.requiresState || this.story.state[rect.requiresState])
                && rect.xMax >= left && rect.xMin <= right && rect.zMax >= near && rect.zMin <= far);
            if (tiles.some(t => t.xMin <= left && t.xMax >= right && t.zMin <= near && t.zMax >= far)) return true;
            if (tiles.length < 2) return false;
            // Across a seam, the union of the floor tiles must cover each vertical strip of the footprint.
            const cuts = [left,right,...tiles.flatMap(t => [t.xMin,t.xMax]).filter(edge => edge > left && edge < right)].sort((a,b)=>a-b);
            tiles.sort((a,b)=>a.zMin-b.zMin);
            for (let i=1;i<cuts.length;i++) {
                const mid=(cuts[i-1]+cuts[i])/2;
                let covered=near;
                for (const t of tiles) if (t.xMin<=mid && t.xMax>=mid && t.zMin<=covered) covered=Math.max(covered,t.zMax);
                if (covered<far) return false;
            }
            return true;
        }
        canOccupy(x, z) {
            const radius = this.playerRadius;
            const space = this.story.state.memory || 'house';
            const inside = this.fitsFloor(x,z,space,radius);
            return inside && !this.blocksDoor(x, z) && !this.map.obstacles.some(rect => {
                if ((rect.space || 'house') !== space) return false;
                if (rect.requiresState && !this.story.state[rect.requiresState]) return false;
                if (rect.untilState && this.story.state[rect.untilState]) return false;
                if (rect.height && this.height >= rect.height) return false;
                return this.overlaps(rect,x,z);
            });
        }
        blocksDoor(x, z) {
            if (this.story.state.memory) return false;
            return [this.map.door, ...(this.map.extraDoors || [])].filter(Boolean).some(door => this.blocksLeaf(x, z, door));
        }
        blocksLeaf(x, z, door, angle = this.getDoorAngle?.(door.id)) {
            const opened = this.story.state[door.stateField || 'opened'] === (door.openValue ?? true);
            angle ??= opened ? door.openAngle : 0;
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
        teleport(pose) {
            this.clear();
            const start = this.startPose();
            this.height = pose ? this.supportHeight(pose.x,pose.z) : 0;
            this.verticalSpeed = 0; this.grounded = true;
            const target = pose && this.canOccupy(pose.x, pose.z) ? pose : start;
            this.height = this.supportHeight(target.x,target.z);
            this.camera.position.set(target.x, this.map.playerStart.y + this.height, target.z);
            this.yaw = Number.isFinite(target.yaw) ? target.yaw : start.yaw;
            this.pitch = Number.isFinite(target.pitch) ? Math.max(-1.15, Math.min(1.15, target.pitch)) : 0;
            this.applyLook();
        }
        dispose() {
            this.clear();
            this.handlers.forEach(([target, type, handler, options]) => target.removeEventListener(type, handler, options));
            if (document.pointerLockElement === this.domElement) document.exitPointerLock();
        }
    }
    game.ThreeControls = ThreeControls;
})(window);
