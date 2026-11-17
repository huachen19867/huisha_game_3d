(function (global) {
    const game = global.Huisha3D;
    const THREE = global.THREE;
    class ThreeCourtyard {
        constructor(house) { this.house = house; this.selected = 0; this.waterParts = []; this.targets = []; this.releaseProgress = 0; }
        build() {
            const h = this.house, m = h.materials;
            h.box('yard-floor', [12, 0.12, 13.6], [0, -0.1, -20.6], m.stone);
            h.box('yard-left-wall', [0.2, 3.1, 13.4], [-6, 1.5, -20.7], m.plaster);
            for (const side of [-1, 1]) {
                h.box(`yard-front-wall-${side}`, [4.65, 3.1, 0.2], [side * 3.7, 1.5, -14.1], m.plaster);
                h.box(`yard-back-wall-${side}`, [5, 3.1, 0.2], [side * 3.5, 1.5, -27.5], m.plaster);
                h.box(`yard-roof-${side}`, [1.5, 0.16, 13.1], [side * 5.25, 3.12, -20.7], m.darkWood);
                for (let i = 0; i < 4; i++) h.box(`yard-post-${side}-${i}`, [0.18, 3, 0.18], [side * 4.75, 1.5, -16 - i * 3.1], m.wood);
                h.box(`yard-gate-jamb-${side}`, [0.16, 2.9, 0.24], [side * 1.1, 1.4, -27.5], m.wood);
            }
            h.box('yard-right-wall-north', [0.2, 3.1, 3.9], [6, 1.5, -25.45], m.plaster);
            h.box('yard-right-wall-south', [0.2, 3.1, 5.4], [6, 1.5, -16.8], m.plaster);
            h.box('kitchen-floor', [5, 0.15, 7.4], [8.5, -0.1, -21.2], m.floor);
            h.box('kitchen-back-wall', [5, 3.2, 0.2], [8.5, 1.5, -24.9], m.plaster);
            h.box('kitchen-front-wall', [5, 3.2, 0.2], [8.5, 1.5, -17.5], m.plaster);
            h.box('kitchen-right-wall', [0.2, 3.2, 7.4], [11, 1.5, -21.2], m.plaster);
            h.box('kitchen-roof', [5.3, 0.18, 7.7], [8.5, 3.15, -21.2], m.darkWood);
            h.box('kitchen-lintel', [0.28, 0.24, 4], [6, 2.8, -21.5], m.wood);
            h.label('kitchen-sign', '余　温', [1.3, 0.42], [5.87, 2.45, -21.4], [0, -Math.PI / 2, 0]);
            for (let i = 0; i < 6; i++) h.box(`yard-step-${i}`, [2.5, 0.05, 0.65], [0, 0, -18 - i * 1.5], m.paper);
            for (let i = 0; i < 6; i++) h.box(`kitchen-step-${i}`, [0.65, 0.05, 1.6], [1 + i * 0.85, 0.01, -21.2], m.stone);
            const rim = new THREE.TorusGeometry(0.66, 0.14, 8, 40); rim.rotateX(Math.PI / 2);
            h.mesh('well-rim', rim, m.stone, [-3, 0.83, -22], 'yard_well');
            h.mesh('well-wall', new THREE.CylinderGeometry(0.68, 0.77, 0.8, 32, 1, true), m.stone, [-3, 0.4, -22], 'yard_well');
            const water = new THREE.MeshStandardMaterial({ color: 0x41615e, roughness: 0.19, metalness: 0.18 });
            h.cylinder('well-water', 0.54, 0.54, 0.015, [-3, 0.18, -22], water, 'yard_well');
            h.label('well-note', '三升　五升', [0.65, 0.2], [-3, 0.91, -21.5], [-Math.PI / 2.6, 0, 0], 'yard_well');
            h.box('kitchen-stove', [1.25, 0.85, 1.1], [10, 0.4, -18.6], m.stone, 'kitchen_note');
            h.cylinder('stove-pot', 0.31, 0.25, 0.2, [10, 0.91, -18.6], m.darkWood, 'kitchen_note');
            h.label('calibration-note', '五升　与　三升\n四升水压秤\n不许嫌孩子慢', [0.72, 0.55], [10.45, 1.55, -17.62], [0, Math.PI, 0], 'kitchen_note');
            this.buildWater(water);
            const door = h.map.extraDoors[0];
            this.gate = new THREE.Group(); this.gate.position.set(door.hingeX, 0, door.hingeZ); h.scene.add(this.gate);
            h.box('yard-gate', [door.width, 2.7, door.thickness], [door.width / 2, 1.35, 0], m.wood, 'yard_gate', this.gate);
            this.gateBolt = h.box('yard-gate-latch', [1.2, 0.1, 0.1], [1.6, 1.3, 0.14], m.brass, 'yard_gate', this.gate);
            for (const x of [0.45, 1.2]) for (const side of [-1, 1]) h.box(`yard-bolt-guide-${x}-${side}`, [0.1, 0.04, 0.16],
                [x, 1.3 + side * 0.09, 0.15], m.brass, 'yard_gate', this.gate);
            for (const side of [-1, 1]) h.box(`yard-bolt-receiver-${side}`, [0.14, 0.045, 0.17],
                [door.hingeX + door.width + 0.16, 1.3 + side * 0.09, door.hingeZ + 0.15], m.brass, 'yard_gate');
            this.buildLinkage();
            h.label('yard-gate-sign', '归　路', [1.1, 0.3], [1, 2, 0.1], [0, 0, 0], 'yard_gate', this.gate);
            h.box('road', [2.6, 0.16, 5], [0, -0.1, -30], m.stone, 'road_exit');
            for (const side of [-1, 1]) h.box(`road-edge-${side}`, [0.18, 0.25, 4.2], [side * 1.35, 0.05, -30], m.wood);
            h.label('road-note', '天　亮　了', [1.1, 0.25], [0, 0.08, -31.1], [-Math.PI / 2, 0, 0], 'road_exit');
            // These fill lights add no shadow maps; the existing candle remains the sole shadow caster.
            for (const [color, intensity, distance, position] of [
                [0xaec7db, 15, 17, [0, 5, -21]], [0xffc38a, 12, 9, [8.6, 2.4, -21]], [0xd3dfdb, 10, 9, [0, 3, -30]]
            ]) { const light = new THREE.PointLight(color, intensity, distance, 1.6); light.position.set(...position); h.scene.add(light); }
            h.cylinder('kitchen-lantern', 0.16, 0.13, 0.36, [8.6, 2.55, -21], m.paper);
        }
        buildWater(water) {
            const h = this.house, m = h.materials;
            this.buckets = [];
            for (let i = 0; i < 2; i++) {
                const group = new THREE.Group(); group.position.set(7.65 + i * 0.8, 0.98, -22.55); h.scene.add(group);
                const radius = i ? 0.25 : 0.21, height = i ? 0.62 : 0.46;
                const body = h.mesh(`bucket-${i}`, new THREE.CylinderGeometry(radius, radius * 0.82, height, 32, 1, true),
                    m.wood, [0, height / 2, 0], 'water_station', group);
                body.material = m.wood.clone(); body.material.side = THREE.DoubleSide;
                h.cylinder(`bucket-bottom-${i}`, radius * 0.82, radius * 0.82, 0.025, [0, 0.02, 0], m.wood, 'water_station', group);
                for (const y of [0.06, height - 0.035]) {
                    const band = new THREE.TorusGeometry(radius * (0.83 + y / height * 0.17), 0.015, 6, 32); band.rotateX(Math.PI / 2);
                    h.mesh(`bucket-band-${i}-${y}`, band, m.brass, [0, y, 0], 'water_station', group);
                }
                const handle = new THREE.TorusGeometry(radius * 0.88, 0.018, 6, 24, Math.PI);
                h.mesh(`bucket-handle-${i}`, handle, m.brass, [0, height, 0], 'water_station', group);
                h.label(`bucket-capacity-${i}`, i ? '五升' : '三升', [0.28, 0.16], [0, height * 0.55, radius + 0.012], [0, 0, 0], 'water_station', group);
                for (let mark = 1; mark <= (i ? 5 : 3); mark++) h.box(`bucket-mark-${i}-${mark}`, [0.07, 0.008, 0.012],
                    [radius * 0.5, mark / (i ? 5 : 3) * (height - 0.08) + 0.03, radius * 0.88], m.paper, 'water_station', group, false);
                const level = h.cylinder(`bucket-water-${i}`, radius * 0.8, radius * 0.8, 1, [0, 0.03, 0], water, 'water_station', group);
                level.userData.levelHeight = height - 0.08;
                this.waterParts.push(level); this.buckets.push(group); this.target(group, `bucket${i}`);
            }
            h.cylinder('kitchen-water-tank', 0.35, 0.29, 0.95, [10.3, 0.48, -23], m.darkWood, 'water_station');
            const tank = h.cylinder('kitchen-tank-water', 0.32, 0.32, 0.02, [10.3, 0.89, -23], water, 'water_station');
            this.target(tank, 'fill');
            this.target(h.scene.getObjectByName('kitchen-water-tank'), 'fill');
            h.label('tank-sign', '添水', [0.38, 0.22], [10.3, 0.65, -22.64], [0, 0, 0], 'water_station');
            const sink = h.box('water-sink', [0.6, 0.12, 0.65], [6.8, 0.32, -22.4], m.stone, 'water_station'); this.target(sink, 'empty');
            for (const side of [-1, 1]) this.target(h.box(`sink-rim-${side}`, [0.05, 0.14, 0.7], [6.8 + side * 0.3, 0.42, -22.4], m.stone, 'water_station'), 'empty');
            h.label('sink-sign', '倒水', [0.38, 0.2], [6.8, 0.4, -22.02], [0, 0, 0], 'water_station');
            this.scale = new THREE.Group(); this.scale.position.set(9.4, 1.02, -22.5); h.scene.add(this.scale);
            h.cylinder('scale-base', 0.27, 0.32, 0.08, [0, 0, 0], m.brass, 'water_station', this.scale);
            this.pan = h.cylinder('scale-pan', 0.31, 0.25, 0.06, [0, 0.16, 0], m.brass, 'water_station', this.scale);
            h.label('scale-sign', '四升', [0.32, 0.18], [0, 0.06, 0.33], [0, 0, 0], 'water_station', this.scale);
            this.target(this.scale, 'weigh');
            this.drawer = new THREE.Group(); this.drawer.position.set(8.5, 0.66, -22.23); h.scene.add(this.drawer);
            h.box('drawer-front', [1.05, 0.22, 0.08], [0, 0, 0], m.wood, 'water_station', this.drawer);
            h.box('drawer-bottom', [1.05, 0.05, 0.6], [0, -0.09, -0.3], m.darkWood, 'water_station', this.drawer);
            h.box('drawer-handle', [0.19, 0.04, 0.06], [0, 0, 0.07], m.brass, 'water_station', this.drawer);
            this.letter = h.label('unmailed-letter', '没有寄出的信', [0.73, 0.36], [0, -0.057, -0.33], [-Math.PI / 2, 0, 0], 'medicine_letter', this.drawer);
            const letterRecord = h.map.interactables.find(item => item.id === 'medicine_letter');
            letterRecord.targetObject = this.letter;
            this.marker = h.mesh('bucket-selection', new THREE.TorusGeometry(0.31, 0.012, 6, 32),
                new THREE.MeshBasicMaterial({ color: 0xd7b875 }), [7.65, 1, -22.55], undefined, undefined, false);
            this.marker.rotation.x = Math.PI / 2;
        }
        target(object, action) { object.userData.waterAction = action; this.targets.push(object); }
        buildLinkage() {
            const h = this.house, m = h.materials;
            const points = [[9.4, 0.72, -22.55], [10.75, 0.72, -22.7], [10.75, 2.65, -24.72], [6.2, 2.65, -24.72],
                [5.8, 2.65, -24.72], [5.8, 2.65, -27.25], [1.2, 2.65, -27.25], [-1.15, 2.65, -27.25], [-1.15, 1.3, -27.25]]
                .map(point => new THREE.Vector3(...point));
            h.mesh('water-to-gate-copper-cable', new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points, false, 'centripetal'), 120, 0.012, 6, false),
                m.brass, [0, 0, 0], undefined, undefined, false);
            for (const [index, position] of [[10.75, 2.65, -24.72], [5.8, 2.65, -27.25], [-1.15, 2.65, -27.25], [-1.15, 1.3, -27.25]].entries()) {
                h.mesh(`cable-pulley-${index}`, new THREE.TorusGeometry(0.075, 0.016, 6, 16), m.darkWood, position, undefined, undefined, false);
            }
            this.linkLead = h.cylinder('gate-cable-free-end', 0.012, 0.012, 1, [0, 1.3, -27.25], m.brass);
            this.linkLead.userData.blocksSight = false;
            this.linkStart = new THREE.Vector3(-1.15, 1.3, -27.25); this.linkEnd = new THREE.Vector3();
            this.linkDirection = new THREE.Vector3(); this.linkUp = new THREE.Vector3(0, 1, 0);
        }
        updateLinkage() {
            if (this.renderedRelease === this.releaseProgress) return;
            const clamp = value => Math.max(0, Math.min(1, value)), ease = value => { const t = clamp(value); return t * t * (3 - 2 * t); };
            const pull = ease(this.releaseProgress / 0.65), drop = ease((this.releaseProgress - 0.65) / 0.35);
            this.gateBolt.position.x = 1.6 - 0.8 * pull;
            this.linkEnd.set(0.6 - 0.8 * pull - 0.75 * drop, 1.3 - 1.27 * drop, -27.25);
            this.linkLead.position.addVectors(this.linkStart, this.linkEnd).multiplyScalar(0.5);
            this.linkDirection.subVectors(this.linkEnd, this.linkStart); this.linkLead.scale.y = this.linkDirection.length();
            this.linkLead.quaternion.setFromUnitVectors(this.linkUp, this.linkDirection.normalize()); this.renderedRelease = this.releaseProgress;
        }
        placeFurniture(place) {
            place('chinese_console_table', [2.75, 0.98, 1.05], [8.5, 0, -22.75], 0, 'water_station', true);
            place('chinese_cabinet', [1.45, 1.9, 0.7], [7.75, 0, -24.3], 0);
        }
        sync(immediate) {
            const s = this.house.story.state;
            this.letter.visible = s.waterSolved && this.drawer.position.z > -21.75;
            this.marker.visible = this.house.inspectionKind === 'water' && !s.waterSolved;
            if (immediate) {
                this.releaseProgress = s.waterSolved ? 1 : 0;
                this.gate.rotation.y = s.waterSolved ? this.house.map.extraDoors[0].openAngle : 0;
                this.update(1, true);
            }
        }
        update(delta, immediate = false) {
            if (!immediate && this.house.isReading?.()) return;
            const s = this.house.story.state;
            this.releaseProgress = immediate || this.house.reducedMotion?.matches ? Number(s.waterSolved)
                : Math.max(0, Math.min(1, this.releaseProgress + (s.waterSolved ? 1 : -1) * delta / 0.75));
            if (Math.abs(Number(s.waterSolved) - this.releaseProgress) < 1e-8) this.releaseProgress = Number(s.waterSolved);
            this.updateLinkage();
            const step = immediate || this.house.reducedMotion?.matches ? 1 : Math.min(1, delta * 8);
            this.buckets.forEach((bucket, i) => {
                const targetX = s.waterSolved && i === 1 ? 9.4 : 7.65 + i * 0.8;
                const targetY = s.waterSolved && i === 1 ? 1.15 : 0.98;
                bucket.position.x += (targetX - bucket.position.x) * step;
                bucket.position.y += (targetY - bucket.position.y) * step;
                const level = this.waterParts[i], capacity = i ? 5 : 3;
                const height = level.userData.levelHeight * s.buckets[i] / capacity;
                level.scale.y += (Math.max(0.002, height) - level.scale.y) * step;
                level.position.y = 0.035 + level.scale.y / 2; level.visible = s.buckets[i] > 0;
            });
            this.drawer.position.z += ((s.waterSolved ? -21.57 : -22.23) - this.drawer.position.z) * step;
            this.letter.visible = s.waterSolved && this.drawer.position.z > -21.75;
            const obstacle = this.house.map.obstacles.find(item => item.id === 'open-drawer');
            obstacle.zMin = this.drawer.position.z - 0.68; obstacle.zMax = this.drawer.position.z + 0.11;
            // The opening drawer may gently push the real player/return pose forward; it must not trap them on exit.
            const h = this.house, pose = h.inspectionReturn || h.camera?.position;
            if (pose && h.controls?.clearMovingObstacle(obstacle, pose) && !h.inspectionReturn) h.controls.applyLook();
            this.pan.position.y += ((s.waterSolved ? 0.1 : 0.16) - this.pan.position.y) * step;
            this.marker.position.x = this.buckets[this.selected].position.x;
        }
        moveGate(delta) {
            const target = this.house.story.state.waterSolved && this.releaseProgress >= 1 ? this.house.map.extraDoors[0].openAngle : 0;
            const remaining = target - this.gate.rotation.y;
            this.gate.rotation.y += this.house.reducedMotion?.matches || Math.abs(remaining) < 0.001 ? remaining : remaining * Math.min(1, delta * 4);
        }
        frame() {
            const h = this.house, width = h.root?.clientWidth || 1280, height = h.root?.clientHeight || 720;
            const sidePanel = width >= 900 || (height <= 520 && width > 680);
            h.camera.setViewOffset(width, height, sidePanel ? width * 0.19 : 0, sidePanel ? 0 : height * 0.12, width, height);
            const distance = 3.8;
            h.camera.fov = Math.max(h.inspectionFov || 66, THREE.MathUtils.radToDeg(2 * Math.atan(4.8 / (2 * distance * h.camera.aspect * (sidePanel ? 0.55 : 1)))));
            h.camera.updateProjectionMatrix();
            h.camera.position.set(8.5, 2.7, -22.55 + distance);
            h.camera.lookAt(8.5, 0.7, -22.55); h.camera.updateMatrixWorld(true);
        }
        pick(clientX, clientY) {
            if (this.house.inspectionKind !== 'water') return null;
            const h = this.house, bounds = h.renderer.domElement.getBoundingClientRect();
            const pointer = new THREE.Vector2((clientX - bounds.left) / bounds.width * 2 - 1, 1 - (clientY - bounds.top) / bounds.height * 2);
            const ray = new THREE.Raycaster(); h.scene.updateMatrixWorld(true); h.camera.updateMatrixWorld(true); ray.setFromCamera(pointer, h.camera);
            const hits = ray.intersectObjects(h.scene.children, true);
            for (const hit of hits) {
                for (let object = hit.object; object; object = object.parent) {
                    if (object.userData.waterAction) return object.userData.waterAction;
                }
                if (hit.object.userData.blocksSight) return null;
            }
            return null;
        }
    }
    game.ThreeCourtyard = ThreeCourtyard;
})(window);
