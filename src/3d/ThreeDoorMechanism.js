(function (global) {
    const game = global.Huisha3D, THREE = global.THREE;
    const ease = value => { const t = Math.max(0, Math.min(1, value)); return t * t * (3 - 2 * t); };
    class ThreeDoorMechanism {
        constructor(house) {
            this.house = house; this.progress = 0; this.duration = 0.75; this.cords = [];
            this.up = new THREE.Vector3(0, 1, 0); this.previous = new THREE.Vector3(); this.next = new THREE.Vector3();
            this.direction = new THREE.Vector3(); this.midpoint = new THREE.Vector3(); this.scale = new THREE.Vector3();
            this.rotation = new THREE.Quaternion(); this.matrix = new THREE.Matrix4();
        }
        build() {
            const h = this.house, m = h.materials;
            this.bolt = h.box('door-sliding-bolt', [1.45, 0.11, 0.14], [1.85, 0.92, 0.27], m.wood, 'lock', h.door);
            for (const x of [0.55, 1.35, 2.15]) {
                h.box(`bolt-guide-back-${x}`, [0.12, 0.3, 0.025], [x, 0.92, 0.17], m.brass, 'lock', h.door);
                for (const side of [-1, 1]) h.box(`bolt-guide-${x}-${side}`, [0.12, 0.055, 0.23], [x, 0.92 + side * 0.125, 0.27], m.brass, 'lock', h.door);
            }
            this.lever = new THREE.Group(); this.lever.position.set(1.17, 0.94, 0.4); h.door.add(this.lever);
            h.box('bolt-release-lever', [0.25, 0.075, 0.075], [0, -0.07, 0.04], m.brass, 'lock', this.lever);
            const door = h.map.door;
            for (const side of [-1, 1]) h.box(`bolt-receiver-${side}`, [0.16, 0.055, 0.23],
                [door.hingeX + door.width + 0.17, 0.92 + side * 0.125, door.hingeZ + 0.27], m.brass, 'lock');
            const segmentGeometry = new THREE.CylinderGeometry(0.009, 0.009, 1, 6);
            for (let index = 0; index < 3; index++) {
                const sign = index - 1;
                const points = Array.from({ length: 10 }, () => new THREE.Vector3());
                const curve = new THREE.CatmullRomCurve3(points, false, 'centripetal');
                const mesh = new THREE.InstancedMesh(segmentGeometry, m.red, 80); mesh.name = `release-cord-${index}`;
                mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); mesh.userData.blocksSight = false; mesh.userData.cord = true;
                mesh.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0.7, -5.2), 7); h.scene.add(mesh);
                const eyelet = h.mesh(`cord-eyelet-${index}`, new THREE.TorusGeometry(0.05, 0.012, 6, 16), m.brass,
                    [0.6 + index * 0.57, 1.1, 0.58], 'lock', h.door);
                this.cords.push({ sign, points, curve, mesh, eyelet });
            }
            this.sync(true);
        }
        sync(immediate = false) {
            this.target = this.house.story.state.opened ? 1 : 0;
            if (immediate) { this.progress = this.target; this.notified = this.target === 1; }
            this.apply(immediate); this.updateLight(immediate);
        }
        apply(force = false) {
            if (!force && this.progress === this.renderedProgress) return;
            const bolt = ease(this.progress / 0.45), drop = ease((this.progress - 0.2) / 0.75);
            this.bolt.position.x = 1.85 - bolt * 0.93; this.lever.rotation.x = -0.7 * ease(this.progress / 0.2);
            for (const cord of this.cords) {
                const s = cord.sign, p = cord.points;
                p[0].set(s * 0.76, 0.905, 1.32); p[1].set(s * 0.76, 0.905, 0.65);
                p[2].set(s * 0.76, 0.905, -0.055); p[3].set(s * 0.76, 0.15, -0.13);
                p[4].set(s * 0.24, 0.028, -0.75);
                for (let i = 5; i <= 7; i++) p[i].set(s * 0.24 + Math.sin(i * 2.8 + s) * drop * 0.14, 0.028, -3 - (i - 5) * 2.8);
                p[8].set(s * 0.57, 0.028, -10.45);
                p[9].set(s * 0.57 + s * drop * 0.12, 1.1 * (1 - drop) + 0.028 * drop, -10.92 + drop * 0.3);
                cord.curve.getPoint(0, this.previous); this.previous.y = Math.max(0.024, this.previous.y);
                for (let index = 0; index < cord.mesh.count; index++) {
                    cord.curve.getPoint((index + 1) / cord.mesh.count, this.next); this.next.y = Math.max(0.024, this.next.y);
                    this.direction.subVectors(this.next, this.previous); const length = this.direction.length();
                    this.rotation.setFromUnitVectors(this.up, this.direction.normalize());
                    this.midpoint.addVectors(this.previous, this.next).multiplyScalar(0.5); this.scale.set(1, length, 1);
                    this.matrix.compose(this.midpoint, this.rotation, this.scale); cord.mesh.setMatrixAt(index, this.matrix);
                    this.previous.copy(this.next);
                }
                cord.mesh.instanceMatrix.needsUpdate = true;
            }
            this.renderedProgress = this.progress;
        }
        update(delta) {
            const h = this.house;
            if (h.isPaused()) return;
            this.target = h.story.state.opened ? 1 : 0;
            const step = Math.max(0, delta) / this.duration;
            this.progress = h.reducedMotion?.matches ? this.target : this.progress < this.target
                ? Math.min(this.target, this.progress + step) : Math.max(this.target, this.progress - step);
            if (Math.abs(this.target - this.progress) < 1e-8) this.progress = this.target;
            this.apply();
            if (this.progress === 1 && !this.notified) { this.notified = true; h.onMechanismEvent?.('door-release'); }
        }
        get ready() { return this.progress >= 1; }
        updateLight(force = false) {
            const h = this.house, angle = h.door.rotation.y;
            if (!h.outsideLight || (!force && angle === this.lightAngle)) return;
            h.outsideLight.intensity = 4 + 5 * ease(Math.abs(angle / h.map.door.openAngle)); this.lightAngle = angle;
        }
    }
    game.ThreeDoorMechanism = ThreeDoorMechanism;
})(window);
