(function (global) {
    const game = global.Huisha3D, THREE = global.THREE;
    class ThreeMemoryScenes {
        constructor(house) { this.house = house; this.rooms = {}; }
        build() {
            const h = this.house, m = h.materials;
            for (const [id, definition] of Object.entries(game.MEMORIES)) {
                const root = new THREE.Group(); root.name = `memory-${id}`; root.userData.memorySpace = id;
                root.position.set(definition.center[0], 0, definition.center[1]); h.scene.add(root); this.rooms[id] = root;
                if (id === 'crash') continue;
                const floor = id === 'school' ? m.floor : m.stone;
                h.box(`${id}-floor`, [10.5, 0.16, 10], [0, -0.1, 0], floor, undefined, root);
                h.box(`${id}-roof`, [10.5, 0.16, 10], [0, 3.25, 0], m.darkWood, undefined, root);
                h.box(`${id}-back-wall`, [10.5, 3.3, 0.18], [0, 1.55, -4.85], m.plaster, undefined, root);
                for (const side of [-1, 1]) {
                    game.ThreeWindowWall.build(h, { name: `${id}-window-wall-${side}`, side, x: 5.15, length: 10, top: 3.2,
                        sill: 1.08, width: 3.1, height: 1.45, thickness: 0.18, center: 0, style: id, parent: root });
                    h.box(`${id}-front-${side}`, [4.2, 3.3, 0.18], [side * 3.15, 1.55, 4.85], m.plaster, undefined, root);
                }
                h.box(`${id}-return-door`, [1.9, 2.75, 0.12], [0, 1.35, 4.5], m.wood, `${id}_return`, root);
                h.label(`${id}-return-sign`, '回到厨房', [1.15, 0.32], [0, 1.7, 4.42], [0, Math.PI, 0], `${id}_return`, root);
                const light = new THREE.PointLight(id === 'school' ? 0xffd09a : 0xc9e3eb, 21, 12, 1.6);
                light.position.set(0, 2.7, 0); root.add(light);
            }
            this.school(); this.hospital(); this.crash();
            h.box('memory-album-cover', [0.68, 0.45, 0.06], [7.75, 1.25, -23.93], m.darkWood, 'memory_album');
            h.label('memory-album-label', '相 册\n录取 · 复诊 · 归途', [0.61, 0.39], [7.75, 1.25, -23.892], [0, 0, 0], 'memory_album');
        }
        school() {
            const h = this.house, m = h.materials, root = this.rooms.school;
            const chalk = new THREE.MeshStandardMaterial({ color: 0x253933, roughness: 1 });
            h.box('school-blackboard', [5.6, 1.45, 0.08], [0, 1.9, -4.7], chalk, 'school_rules', root);
            h.label('school-board-writing', '二〇一四年　七月\n你的志愿，由谁决定', [3.5, 0.9], [0, 1.95, -4.65], [0, 0, 0], 'school_rules', root, '#253933', '#c9cdb8');
            h.documents = new game.ThreeDocument(h); h.documents.build(root);
        }
        hospital() {
            const h = this.house, m = h.materials, root = this.rooms.hospital;
            const pale = new THREE.MeshStandardMaterial({ color: 0xa8b9b3, roughness: 0.75 });
            for (let i = -4; i <= 4; i++) {
                h.box(`hospital-grout-x-${i}`, [0.012, 0.003, 9.5], [i, 0, 0], m.ash, undefined, root, false);
                h.box(`hospital-grout-z-${i}`, [10, 0.003, 0.012], [0, 0, i], m.ash, undefined, root, false);
            }
            h.label('hospital-label', '门　诊', [1.7, 0.45], [2.7, 2, -4.73], [0, 0, 0], undefined, root, '#a8b9b3', '#304743');
            h.box('hospital-clipboard', [0.55, 0.62, 0.04], [-2.8, 1.32, -0.83], pale, 'hospital_plan', root);
            h.documents.build(root);
            h.cylinder('clipboard-stand', 0.018, 0.018, 1.25, [-2.8, 0.62, -0.9], m.brass, 'hospital_plan', root);
            const clock = h.cylinder('hospital-clock', 0.32, 0.32, 0.07, [0, 2.1, -4.7], pale, 'hospital_clock', root); clock.rotation.x = Math.PI / 2;
            h.box('clock-hand-hour', [0.025, 0.17, 0.015], [-0.06, 2.15, -4.65], m.darkWood, 'hospital_clock', root).rotation.z = 0.6;
            h.box('clock-hand-minute', [0.02, 0.27, 0.015], [0, 2.18, -4.64], m.darkWood, 'hospital_clock', root);
        }
        crash() {
            const h = this.house, m = h.materials, root = this.rooms.crash;
            const asphalt = new THREE.MeshStandardMaterial({ color: 0x252d32, roughness: 0.28, metalness: 0.1 });
            h.box('memory-road', [8.6, 0.16, 19], [0, -0.1, 0], asphalt, undefined, root);
            for (let i = -4; i <= 4; i++) h.box(`road-line-${i}`, [0.12, 0.008, 0.85], [0, 0.001, i * 2], m.paper, undefined, root, false);
            for (const side of [-1, 1]) for (let i = -4; i <= 4; i++) {
                if (side === -1 && i === 0) continue;
                h.box(`guard-post-${side}-${i}`, [0.08, 0.9, 0.1], [side * 3.8, 0.42, i * 2], m.stone, undefined, root);
                h.box(`guard-rail-${side}-${i}`, [0.08, 0.22, 1.98], [side * 3.8, 0.7, i * 2], m.ash, undefined, root);
            }
            const bent = h.box('bent-guardrail', [0.08, 0.22, 2], [-3.5, 0.65, 0], m.ash, undefined, root); bent.rotation.y = 0.5;
            h.box('phone-stone', [0.55, 0.65, 0.55], [-1.65, 0.32, 1.2], m.stone, 'crash_phone', root);
            h.phone = new game.ThreePhone(h); h.phone.build(root);
            h.box('emergency-case', [0.8, 1, 0.65], [1.7, 0.5, -4.5], m.red, 'crash_report', root);
            h.label('handover-sheet', '救护交接\n呼吸存在', [0.64, 0.42], [1.7, 1.012, -4.5], [-Math.PI / 2, 0, 0], 'crash_report', root);
            for (const side of [-1, 1]) {
                h.box(`rescue-post-${side}`, [0.08, 1.15, 0.08], [side * 0.9, 0.57, -7], m.stone, 'rescue_light', root);
                const lens = new THREE.MeshBasicMaterial({ color: side === -1 ? 0xd74c3c : 0x6a9fbd });
                h.cylinder(`rescue-lens-${side}`, 0.13, 0.13, 0.14, [side * 0.9, 1.2, -7], lens, 'rescue_light', root);
                const light = new THREE.PointLight(side === -1 ? 0xe0573e : 0x7baec9, 5, 8, 1.6); light.position.set(side * 0.9, 1.4, -7); root.add(light);
            }
            h.label('crash-return-sign', '回到厨房', [1.1, 0.32], [0, 1.4, 7.2], [0, Math.PI, 0], 'crash_return', root);
            const returnLight = new THREE.PointLight(0xc1d4de, 12, 13, 1.6); returnLight.position.set(0, 3, 3); root.add(returnLight);
        }
        placeFurniture(place) {
            for (const x of [-2, 2]) for (const z of [-1.5, 1]) {
                const item = x === -2 && z === 1 ? 'school_notice' : x === 2 && z === -1.5 ? 'school_receipt' : undefined;
                this.rooms.school.add(place('SchoolDesk_01', [1.2, 0.95, 0.85], [x, 0, z], 0, item, true));
                this.rooms.school.add(place('SchoolChair_01', [0.5, 0.85, 0.5], [x, 0, z + 0.85], 0));
            }
            this.rooms.hospital.add(place('wheelchair_01', [0.95, 1.15, 1], [-2.8, 0, -1.2], 0, 'hospital_plan'));
            this.rooms.hospital.add(place('chinese_console_table', [2.5, 1, 0.95], [2.7, 0, -3.35], 0, 'hospital_record', true));
        }
        sealHome() {
            const h = this.house; h.homeRoot = new THREE.Group(); h.homeRoot.name = 'old-house';
            for (const object of [...h.scene.children]) {
                if (!object.userData.memorySpace && !object.isHemisphereLight && object !== h.flashlight && object !== h.flashTarget) h.homeRoot.add(object);
            }
            h.scene.add(h.homeRoot);
        }
        sync() {
            const h = this.house, space = h.story.state.memory;
            if (space === this.lastSpace) return;
            this.lastSpace = space;
            if (h.homeRoot) h.homeRoot.visible = !space;
            for (const [id, root] of Object.entries(this.rooms)) root.visible = id === space;
            h.scene.background = !space && h.nightSky ? h.nightSky : new THREE.Color(space ? game.MEMORIES[space].color : 0x151b21);
            if (h.scene.fog) { h.scene.fog.color.setHex(space ? game.MEMORIES[space].color : 0x222329); h.scene.fog.density = space === 'crash' ? 0.07 : 0.027; }
        }
    }
    game.ThreeMemoryScenes = ThreeMemoryScenes;
})(window);
