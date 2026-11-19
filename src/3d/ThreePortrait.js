(function (global) {
    const copyText=global.HuishaCopy;
    const game = global.Huisha3D, THREE = global.THREE;
    class ThreePortrait {
        constructor(house) { this.house = house; this.angle = 0; this.tilt = 0; this.lift = 0; }
        build() {
            const h = this.house, m = h.materials;
            this.root = new THREE.Group(); this.root.name = 'portrait-object'; this.home = new THREE.Vector3(-2.75, 1.94, -3.88);
            this.root.position.copy(this.home); h.scene.add(this.root);
            h.box('portrait-backing', [1.03, 1.23, 0.06], [0, 0, 0], m.wood, 'portrait', this.root);
            for (const side of [-1, 1]) {
                h.box(`portrait-side-${side}`, [0.07, 1.35, 0.12], [side * 0.54, 0, 0], m.darkWood, 'portrait', this.root);
                h.box(`portrait-edge-${side}`, [1.15, 0.07, 0.12], [0, side * 0.64, 0], m.darkWood, 'portrait', this.root);
                for (const end of [-1, 1]) h.box(`portrait-corner-${side}-${end}`, [0.13, 0.035, 0.018],
                    [side * 0.49, end * 0.64, 0.068], m.brass, 'portrait', this.root, false);
            }
            h.mesh('portrait-photo', new THREE.PlaneGeometry(0.99, 1.19), m.portrait, [0, 0, 0.043], 'portrait', this.root, false);
            this.back = h.label('portrait-back-inscription', copyText('portrait.portrait-back-inscription'), [0.96, 0.76], [0, 0, -0.071],
                [0, Math.PI, 0], 'portrait', this.root, '#71503c', '#dfcba4');
            this.back.material = new THREE.MeshStandardMaterial({ map: this.back.material.map, roughness: 0.94, side: THREE.DoubleSide });
            const cloth = new THREE.PlaneGeometry(1.14, 1.38, 18, 24), vertices = cloth.attributes.position;
            for (let i = 0; i < vertices.count; i++) {
                const x = vertices.getX(i), y = vertices.getY(i);
                vertices.setZ(i, Math.sin(x * 28) * 0.018 + Math.cos(x * 13 + y * 2) * 0.012);
            }
            cloth.computeVertexNormals(); const fabric = m.cloth.clone(); fabric.side = THREE.DoubleSide;
            this.cloth = h.mesh('portrait-cloth', cloth, fabric, [0, 0.015, 0.105], 'portrait', this.root);
            this.sync(true);
        }
        sync(immediate = false) {
            this.back.visible = this.house.story.state.portrait;
            if (immediate) this.lift = this.house.story.state.portrait ? 1 : 0;
            this.applyCloth();
        }
        applyCloth() {
            this.cloth.visible = this.lift < 0.995;
            this.cloth.position.y = 0.015 + this.lift * 1.1;
            this.cloth.scale.y = 1 - this.lift * 0.8;
        }
        begin() {
            this.angle = 0; this.tilt = 0; this.root.rotation.set(0, 0, 0);
            this.root.position.set(-2.75, 1.72, -2.05); this.sync(true); this.frame();
        }
        frame() {
            const h = this.house, camera = h.camera;
            const height = h.root?.clientHeight || 720, width = h.root?.clientWidth || height * camera.aspect;
            const side = height <= 520 && width > 680;
            camera.fov = 50; camera.setViewOffset(width, height, side ? width * 0.19 : 0, side ? 0 : height * 0.2, width, height);
            const tangent = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
            const distance = Math.max(1.35 / (2 * tangent * (side ? 0.82 : 0.48)), 1.15 / (2 * tangent * camera.aspect * (side ? 0.55 : 0.88)));
            camera.position.set(this.root.position.x, this.root.position.y, this.root.position.z + distance);
            camera.lookAt(this.root.position); camera.updateProjectionMatrix(); camera.updateMatrixWorld(true);
        }
        flip() {
            if (!this.house.story.state.portrait) return;
            this.angle = Math.cos(this.angle) < 0 ? Math.round(this.angle / (Math.PI * 2)) * Math.PI * 2
                : Math.round((this.angle - Math.PI) / (Math.PI * 2)) * Math.PI * 2 + Math.PI;
            this.tilt = 0;
        }
        drag(dx, dy) {
            if (!this.house.story.state.portrait) return;
            this.angle += dx * 0.01; this.tilt = Math.max(-0.22, Math.min(0.22, this.tilt + dy * 0.005));
        }
        get backVisible() { return this.house.story.state.portrait && this.lift >= 0.995 && Math.cos(this.root.rotation.y) < -0.9; }
        update(delta) {
            if (this.house.inspectionKind !== 'portrait' || this.house.isReading?.()) return;
            const immediate = this.house.reducedMotion?.matches;
            const blend = immediate ? 1 : Math.min(1, delta * 12);
            this.root.rotation.y += (this.angle - this.root.rotation.y) * blend;
            this.root.rotation.x += (this.tilt - this.root.rotation.x) * blend;
            this.lift += ((this.house.story.state.portrait ? 1 : 0) - this.lift) * blend; this.applyCloth();
        }
        end() { this.root.position.copy(this.home); this.root.rotation.set(0, 0, 0); this.angle = 0; this.tilt = 0; this.sync(true); }
    }
    game.ThreePortrait = ThreePortrait;
})(window);
