(function (global) {
    const game = global.Huisha3D || (global.Huisha3D = {});
    const THREE = global.THREE;
    class ThreeHouseScene {
        constructor({ root, prompt, story, isPaused, onInspect, onAssetError, onFrame }) {
            Object.assign(this, { root, prompt, story, isPaused, onInspect, onAssetError, onFrame });
            this.map = game.WORLD_MAP || game.MAIN_HALL_MAP;
            this.clock = new THREE.Clock();
            this.textures = [];
            this.labelCache = new Map();
            this.reducedMotion = global.matchMedia?.('(prefers-reduced-motion: reduce)');
        }
        async start() {
            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(0x151b21);
            this.scene.fog = new THREE.FogExp2(0x222329, 0.027);
            this.camera = new THREE.PerspectiveCamera(66, this.root.clientWidth / this.root.clientHeight, 0.06, 60);
            this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
            this.renderer.setPixelRatio(Math.min(global.devicePixelRatio || 1, 1.6));
            this.renderer.setSize(this.root.clientWidth, this.root.clientHeight);
            this.renderer.outputColorSpace = THREE.SRGBColorSpace;
            this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
            this.renderer.toneMappingExposure = 1.28;
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            this.root.appendChild(this.renderer.domElement);
            this.createMaterials();
            this.createArchitecture();
            this.createProps();
            this.createLights();
            await this.loadModels();
            this.syncState(true);
            this.controls = new game.ThreeControls({ camera: this.camera, domElement: this.renderer.domElement,
                map: this.map, story: this.story, isPaused: this.isPaused,
                getDoorAngle: id => id === 'yard' ? this.courtyard.gate.rotation.y : this.door.rotation.y });
            this.interaction = new game.ThreeInteraction({ camera: this.camera, map: this.map, scene: this.scene,
                prompt: this.prompt, story: this.story, isPaused: this.isPaused, onInspect: this.onInspect });
            this.onResize = () => {
                this.camera.aspect = this.root.clientWidth / Math.max(1, this.root.clientHeight);
                this.camera.updateProjectionMatrix();
                this.renderer.setSize(this.root.clientWidth, this.root.clientHeight);
                if (this.inspectionReturn) this.frameInspection();
            };
            global.addEventListener('resize', this.onResize);
            this.animate();
        }
        texture(name, repeat) {
            const texture = new THREE.TextureLoader().load(`assets/art/${name}.png`, undefined, () => this.onAssetError?.(name));
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(...repeat);
            this.textures.push(texture);
            return texture;
        }
        pbr(name, repeat, color) {
            const load = (suffix, srgb = false) => {
                const texture = new THREE.TextureLoader().load(`assets/materials/${name}-${suffix}.jpg`, undefined, () => this.onAssetError?.(`${name}-${suffix}`));
                if (srgb) texture.colorSpace = THREE.SRGBColorSpace;
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(...repeat);
                texture.anisotropy = Math.min(4, this.renderer.capabilities.getMaxAnisotropy());
                this.textures.push(texture);
                return texture;
            };
            return new THREE.MeshStandardMaterial({ color, map: load('color', true), normalMap: load('normal'),
                roughnessMap: load('roughness'), roughness: 0.95, normalScale: new THREE.Vector2(0.55, 0.55) });
        }
        createMaterials() {
            const mat = (color, map) => new THREE.MeshStandardMaterial({ color, map, roughness: 0.88 });
            this.materials = {
                wall: mat(0x9b8d7c, this.texture('木墙', [2.5, 1])),
                floor: this.pbr('wood', [3, 3], 0xb0a99b),
                plaster: this.pbr('plaster', [2.5, 1.2], 0xa7a69a),
                wood: mat(0x7d5036, this.texture('木梁', [1, 1])),
                darkWood: mat(0x352321), brass: mat(0xa98b54), red: mat(0x862f24),
                cloth: mat(0x17171b), paper: mat(0xc6b689), stone: mat(0x555f63),
                wax: mat(0xbfa77b), ash: mat(0x8c8a80)
            };
        }
        mesh(name, geometry, material, position, item, parent = this.scene, blocks = true) {
            const mesh = new THREE.Mesh(geometry, material);
            mesh.name = name;
            mesh.position.set(...position);
            mesh.castShadow = blocks;
            mesh.receiveShadow = true;
            Object.assign(mesh.userData, { item, blocksSight: blocks });
            parent.add(mesh);
            return mesh;
        }
        box(name, size, position, material = this.materials.wood, item, parent, blocks = true) {
            return this.mesh(name, new THREE.BoxGeometry(...size), material, position, item, parent, blocks);
        }
        cylinder(name, top, bottom, height, position, material, item, parent) {
            return this.mesh(name, new THREE.CylinderGeometry(top, bottom, height, 20), material, position, item, parent);
        }
        labelMaterial(text, background = '#c9ba96', color = '#30261f') {
            const key = [text, background, color].join('|');
            if (this.labelCache.has(key)) return this.labelCache.get(key);
            const canvas = document.createElement('canvas');
            canvas.width = 768; canvas.height = 512;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = background; ctx.fillRect(0, 0, 768, 512);
            ctx.strokeStyle = color; ctx.lineWidth = 5; ctx.strokeRect(22, 22, 724, 468);
            ctx.fillStyle = color; ctx.font = '52px "Songti SC", "SimSun", serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            const lines = text.split('\n');
            lines.forEach((line, i) => ctx.fillText(line, 384, 256 + (i - (lines.length - 1) / 2) * 80, 670));
            const texture = new THREE.CanvasTexture(canvas);
            texture.colorSpace = THREE.SRGBColorSpace;
            this.textures.push(texture);
            const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
            this.labelCache.set(key, material);
            return material;
        }
        label(name, text, size, position, rotation, item, parent, background, color) {
            const mesh = this.mesh(name, new THREE.PlaneGeometry(...size), this.labelMaterial(text, background, color), position, item, parent, false);
            mesh.rotation.set(...rotation);
            return mesh;
        }
        createArchitecture() {
            const m = this.materials;
            this.box('hall-floor', [10, 0.15, 8.7], [0, -0.1, 0], m.floor);
            this.box('hall-ceiling', [10, 0.15, 8.7], [0, 3.35, 0], m.darkWood);
            this.box('left-wall', [0.2, 3.4, 8.7], [-5, 1.6, 0], m.plaster);
            this.box('right-wall', [0.2, 3.4, 8.7], [5, 1.6, 0], m.plaster);
            this.box('entrance-wall', [10, 3.4, 0.2], [0, 1.6, 4.45], m.plaster);
            this.box('entrance-door', [1.9, 2.7, 0.12], [0, 1.35, 4.3], m.darkWood);
            for (const side of [-1, 1]) {
                this.box(`back-wall-${side}`, [3.65, 3.4, 0.2], [side * 3.175, 1.6, -4.3], m.wall);
                this.box(`corridor-wall-${side}`, [0.2, 3.1, 7.2], [side * 1.4, 1.5, -7.8], m.wall);
                this.box(`door-jamb-${side}`, [0.16, 2.9, 0.3], [side * 1.25, 1.45, -11.5], m.wood);
                this.box(`pillar-${side}`, [0.5, 3.3, 0.5], [side * 4.1, 1.6, -1.5], m.wood);
                this.box(`hall-footboard-${side}`, [0.08, 0.22, 8.5], [side * 4.85, 0.1, 0], m.darkWood);
                this.box(`wainscot-${side}`, [0.08, 0.85, 8.5], [side * 4.88, 0.55, 0], m.wall);
                this.box(`chair-rail-${side}`, [0.1, 0.065, 8.5], [side * 4.8, 0.99, 0], m.wood);
                // Open lattice windows catch cool exterior light instead of a scene photograph.
                this.box(`window-recess-${side}`, [0.03, 1.35, 1.9], [side * 4.88, 1.85, -0.3], m.darkWood);
                for (let i = 0; i < 6; i++) this.box(`window-bar-${side}-${i}`, [0.08, 1.45, 0.045], [side * 4.82, 1.85, -1.15 + i * 0.34], m.wood);
                for (let i = 0; i < 3; i++) this.box(`window-cross-${side}-${i}`, [0.08, 0.045, 1.95], [side * 4.81, 1.28 + i * 0.58, -0.3], m.wood);
            }
            this.box('crossbeam', [9.5, 0.25, 0.3], [0, 2.95, -1.5], m.wood);
            for (let i = -3; i <= 3; i++) this.box(`ceiling-rafter-${i}`, [0.12, 0.18, 8.5], [i * 1.3, 3.16, 0], m.wood);
            for (const side of [-1, 1]) {
                const bracket = this.box(`beam-brace-${side}`, [1, 0.13, 0.18], [side * 3.7, 2.6, -1.5], m.wood);
                bracket.rotation.z = side * 0.65;
            }
            this.box('corridor-floor', [2.7, 0.15, 7.4], [0, -0.1, -7.8], m.floor);
            this.box('corridor-ceiling', [2.8, 0.15, 7.4], [0, 3.1, -7.8], m.darkWood);
            this.box('door-lintel', [2.7, 0.22, 0.35], [0, 2.95, -11.5], m.wood);
            for (let i = 0; i < 4; i++) this.box(`corridor-beam-${i}`, [2.6, 0.15, 0.18], [0, 2.85, -4.5 - i * 2], m.wood);
            this.box('threshold', [2.6, 0.09, 0.25], [0, 0.01, -13.9], m.stone, 'threshold');
            this.createOutside();
            for (let i = 0; i < 7; i++) this.box(`height-mark-${i}`, [0.015, 0.012, 0.23 + i * 0.025], [1.285, 0.62 + i * 0.15, -7.1], m.paper, 'wall_marks', undefined, false);
            this.label('height-note', '灯与门之间\n是回家的人', [0.65, 0.43], [1.278, 1.7, -7.1], [0, -Math.PI / 2, 0], 'wall_marks');
            this.label('hall-sign', '归　门', [1.5, 0.5], [0, 2.55, -4.16], [0, 0, 0]);
        }
        createOutside() {
            const m = this.materials;
            this.box('outside-ground', [28, 0.15, 23], [0, -0.23, -23], m.stone);
            for (let i = 0; i < 8; i++) {
                this.box(`path-stone-${i}`, [1.85, 0.12, 0.63], [(i % 2 ? 1 : -1) * 0.015, -0.03, -11.9 - i * 0.72], m.stone, 'threshold');
            }
            for (const side of [-1, 1]) {
                this.box(`stone-edging-${side}`, [0.24, 0.25, 4], [side * 1.2, 0, -13.5], m.darkWood);
                this.box(`stone-post-${side}`, [0.36, 1.2, 0.36], [side * 1.2, 0.5, -14.2], m.stone, 'threshold');
                this.box(`stone-post-cap-${side}`, [0.48, 0.13, 0.48], [side * 1.2, 1.15, -14.2], m.stone, 'threshold');
            }
            this.label('path-sign', '归\n路', [0.22, 0.5], [1.2, 0.7, -13.995], [0, 0, 0], 'threshold', undefined, '#4e5551', '#b4b6a4');
            const foliage = new THREE.MeshStandardMaterial({ color: 0x1d302d, roughness: 1 });
            for (let i = 0; i < 16; i++) {
                const side = i % 2 ? 1 : -1, x = side * (13.5 + (i % 3) * 1.65), z = -18 - Math.floor(i / 2) * 2.1;
                const height = 3.2 + (i % 4) * 0.55;
                this.cylinder(`tree-trunk-${i}`, 0.06, 0.15, height, [x, height / 2, z], m.darkWood);
                for (let j = 0; j < 3; j++) {
                    const canopy = this.mesh(`tree-canopy-${i}-${j}`, new THREE.IcosahedronGeometry(1.05 - j * 0.14, 1), foliage,
                        [x + Math.sin(i + j) * 0.3, height - 0.7 + j * 0.5, z], undefined);
                    canopy.scale.set(1.35, 0.55, 1.1);
                }
            }
            const distant = new THREE.MeshBasicMaterial({ color: 0x182127 });
            for (let i = 0; i < 6; i++) {
                const mountain = this.mesh(`mountain-${i}`, new THREE.ConeGeometry(7, 6 + i % 3, 7), distant,
                    [-17 + i * 7, 0.8, -35 - i % 2 * 3]); mountain.scale.z = 0.5;
            }
        }
        createProps() {
            const m = this.materials;
            const altar = new THREE.Group(); altar.position.set(-2.75, 0, -3.12); this.scene.add(altar);
            this.label('altar-note', '灯照亡人\n人面归门\n雨留在外', [0.67, 0.48], [0, 1.1, 0.3], [-Math.PI / 2.7, 0, 0], 'altar', altar);
            const profile = [new THREE.Vector2(0.1, 0), new THREE.Vector2(0.2, 0.06), new THREE.Vector2(0.26, 0.18), new THREE.Vector2(0.29, 0.25)];
            this.mesh('incense-bowl', new THREE.LatheGeometry(profile, 24), m.brass, [0, 1.1, -0.18], 'altar', altar);
            this.cylinder('incense-ash', 0.24, 0.24, 0.02, [0, 1.29, -0.18], m.ash, 'altar', altar);
            for (let i = -1; i <= 1; i++) this.cylinder(`incense-${i}`, 0.008, 0.009, 0.33, [i * 0.06, 1.45, -0.18], m.darkWood, 'altar', altar);
            for (const x of [-1, 1]) this.createCandle(x, altar);
            this.box('portrait-frame', [1.15, 1.35, 0.12], [-2.75, 1.94, -3.96], m.brass, 'portrait');
            this.label('portrait-face', '母亲\n一九六八 — 二〇一六', [1.02, 1.2], [-2.75, 1.94, -3.886], [0, 0, 0], 'portrait', undefined, '#514b44', '#ccc2ac');
            this.portraitCloth = this.box('portrait-cloth', [1.1, 1.3, 0.025], [-2.75, 1.94, -3.86], m.cloth, 'portrait');
            // A tapered solid coffin, with bevels and separate lid, can be viewed from either side.
            const outline = new THREE.Shape();
            outline.moveTo(-1.3, -0.55); outline.lineTo(0.95, -0.55); outline.lineTo(1.3, -0.32);
            outline.lineTo(1.3, 0.32); outline.lineTo(0.95, 0.55); outline.lineTo(-1.3, 0.55); outline.closePath();
            const body = new THREE.ExtrudeGeometry(outline, { depth: 0.54, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.045, bevelThickness: 0.04 });
            body.rotateX(-Math.PI / 2);
            this.mesh('coffin-body', body, m.darkWood, [0, 0.17, 0.65], 'coffin');
            this.box('coffin-lid', [2.72, 0.16, 1.35], [0, 0.81, 0.65], m.wood, 'coffin');
            this.label('coffin-inscription', '左位留灯　右位留门', [1.75, 0.33], [0, 0.899, 0.65], [-Math.PI / 2, 0, 0], 'coffin', undefined, '#5c3b2c', '#c5b38c');
            this.cords = [];
            for (let i = -1; i <= 1; i++) {
                this.box(`coffin-cord-${i}`, [0.025, 0.025, 1.38], [i * 0.76, 0.905, 0.65], m.red, 'coffin', undefined, false);
                const cord = this.box(`floor-cord-${i}`, [0.018, 0.014, 11.25], [i * 0.24, 0.015, -5.65], m.red, undefined, undefined, false);
                cord.userData.cord = true;
                this.cords.push(cord);
            }
            this.box('letter-shelf', [0.95, 0.1, 0.35], [2.65, 0.95, 4.07], m.wood, 'letter');
            this.label('letter', '七月十四\n回来一趟', [0.6, 0.4], [2.65, 1.15, 3.98], [0, Math.PI, 0], 'letter');
            const door = this.map.door;
            this.door = new THREE.Group(); this.door.position.set(door.hingeX, 0, door.hingeZ); this.scene.add(this.door);
            this.box('sealed-door', [door.width, 2.8, door.thickness], [door.width / 2, 1.4, 0], m.darkWood, 'lock', this.door);
            for (let i = 0; i < 6; i++) this.box(`door-plank-${i}`, [0.025, 2.67, 0.025], [0.2 + i * 0.39, 1.4, 0.107], m.wood, 'lock', this.door);
            this.box('lock-plate', [1.85, 0.72, 0.12], [1.17, 1.42, 0.16], m.brass, 'lock', this.door);
            this.wheels = [];
            for (let i = 0; i < 3; i++) {
                const drum = new THREE.Group(); drum.name = `wheel-${i}`;
                drum.userData.wheelIndex = i;
                drum.position.set(0.6 + i * 0.57, 1.42, 0.3); this.door.add(drum);
                const core = this.cylinder(`wheel-core-${i}`, 0.245, 0.245, 0.4, [0, 0, 0], m.darkWood, 'lock', drum);
                core.rotation.z = Math.PI / 2;
                for (let face = 0; face < 4; face++) {
                    const angle = face * Math.PI / 2;
                    this.label(`wheel-face-${i}-${face}`, game.ThreeStory.symbols[face], [0.3, 0.28],
                        [0, Math.sin(angle) * 0.26, Math.cos(angle) * 0.26], [-angle, 0, 0], 'lock', drum, '#473a28', '#e9d5a1');
                }
                this.box(`wheel-index-${i}`, [0.05, 0.07, 0.055], [0.6 + i * 0.57, 1.76, 0.32], m.red, 'lock', this.door);
                this.wheels.push(drum);
            }
            this.wheelTargets = [0, 0, 0]; this.wheelSymbols = [0, 0, 0];
            this.label('lock-heading', '归　门', [1.3, 0.4], [1.17, 2.2, 0.11], [0, 0, 0], 'lock', this.door, '#352321', '#c9b389');
            if (game.ThreeCourtyard) { this.courtyard = new game.ThreeCourtyard(this); this.courtyard.build(); }
            if (game.ThreeMemoryScenes) { this.memories = new game.ThreeMemoryScenes(this); this.memories.build(); }
        }
        createCandle(x, parent) {
            const m = this.materials;
            this.cylinder(`candle-base-${x}`, 0.13, 0.18, 0.1, [x, 1.14, 0], m.brass, 'altar', parent);
            this.cylinder(`candle-${x}`, 0.055, 0.065, 0.35, [x, 1.35, 0], m.wax, 'altar', parent);
            const flame = new THREE.MeshBasicMaterial({ color: 0xffcc70 });
            const mesh = this.mesh(`flame-${x}`, new THREE.SphereGeometry(0.045, 10, 10), flame, [x, 1.57, 0], 'altar', parent, false);
            mesh.scale.y = 2.1;
        }
        async loadModels() {
            const loader = new game.GLTFLoader();
            const entries = await Promise.all(['chinese_armchair', 'chinese_console_table', 'chinese_cabinet', 'SchoolDesk_01', 'SchoolChair_01', 'wheelchair_01'].map(async id => {
                const gltf = await loader.loadAsync(`assets/models/${id}/model.gltf`);
                return [id, gltf.scene];
            }));
            const models = Object.fromEntries(entries);
            const place = (id, size, position, rotation, item, stretch = false) => {
                const model = models[id].clone(true);
                const bounds = new THREE.Box3().setFromObject(model), dimensions = bounds.getSize(new THREE.Vector3());
                const center = bounds.getCenter(new THREE.Vector3());
                const ratios = size.map((n, i) => n / [dimensions.x, dimensions.y, dimensions.z][i]);
                const scale = stretch ? ratios : [Math.min(...ratios), Math.min(...ratios), Math.min(...ratios)];
                const normalized = new THREE.Group();
                model.position.sub(new THREE.Vector3(center.x, bounds.min.y, center.z));
                normalized.add(model); normalized.scale.set(...scale);
                const group = new THREE.Group(); group.add(normalized); group.position.set(...position); group.rotation.y = rotation;
                group.name = id; this.scene.add(group);
                group.traverse(mesh => {
                    if (!mesh.isMesh) return;
                    mesh.castShadow = true; mesh.receiveShadow = true;
                    Object.assign(mesh.userData, { blocksSight: true, item });
                    for (const material of (Array.isArray(mesh.material) ? mesh.material : [mesh.material])) {
                        for (const property of ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap']) {
                            const texture = material[property];
                            if (texture && !this.textures.includes(texture)) this.textures.push(texture);
                        }
                    }
                });
                return group;
            };
            place('chinese_console_table', [2.5, 1.08, 0.95], [-2.75, 0, -3.12], 0, 'altar', true);
            place('chinese_armchair', [0.78, 1.22, 0.78], [-3.5, 0, 0.8], 0.15);
            place('chinese_armchair', [0.78, 1.22, 0.78], [3.5, 0, 0.8], -0.15);
            place('chinese_cabinet', [1.45, 2.15, 0.85], [3.4, 0, -3.4], 0);
            this.courtyard?.placeFurniture(place);
            this.memories?.placeFurniture(place); this.memories?.sealHome();
        }
        createLights() {
            this.scene.add(new THREE.HemisphereLight(0xb1bec8, 0x51402e, 1.8));
            const add = (color, intensity, distance, position, shadow = false) => {
                const light = new THREE.PointLight(color, intensity, distance, 1.6);
                light.position.set(...position); light.castShadow = shadow;
                if (shadow) { light.shadow.mapSize.set(512, 512); light.shadow.bias = -0.002; }
                this.scene.add(light); return light;
            };
            this.candleLight = add(0xffc17b, 10, 8, [-2.75, 1.85, -2.9], true);
            add(0xaac5df, 5, 9, [3.7, 2.4, -0.3]);
            add(0xd2b58d, 4, 9, [0, 2.6, 2.8]);
            add(0x9aafc4, 4.5, 9, [0, 2.5, -7.1]);
            this.outsideLight = add(0xdce5e1, 4, 8, [0, 2.4, -13.1]);
            this.flashlight = new THREE.SpotLight(0xffedd1, 5, 9, 0.5, 0.75, 1.4);
            this.flashTarget = new THREE.Object3D(); this.scene.add(this.flashlight, this.flashTarget); this.flashlight.target = this.flashTarget;
        }
        syncState(immediate = false) {
            const s = this.story.state;
            this.portraitCloth.visible = !s.portrait;
            this.wheels.forEach((wheel, i) => {
                if (immediate) this.wheelTargets[i] = s.wheels[i] * Math.PI / 2;
                else this.wheelTargets[i] += ((s.wheels[i] - this.wheelSymbols[i] + 4) % 4) * Math.PI / 2;
                this.wheelSymbols[i] = s.wheels[i];
                if (immediate) wheel.rotation.x = this.wheelTargets[i];
            });
            if (immediate) this.door.rotation.y = s.opened ? this.map.door.openAngle : 0;
            this.cords.forEach(cord => { cord.visible = !s.opened; });
            this.outsideLight.intensity = s.opened ? 9 : 4;
            this.courtyard?.sync(immediate);
            this.memories?.sync();
        }
        moveWheels(delta) {
            const immediate = this.reducedMotion?.matches;
            this.wheels.forEach((wheel, i) => {
                const remaining = this.wheelTargets[i] - wheel.rotation.x;
                wheel.rotation.x += immediate || Math.abs(remaining) < 0.001 ? remaining : remaining * Math.min(1, delta * 15);
            });
        }
        playerSnapshot() { return this.inspectionReturn || this.controls.snapshot(); }
        frameLock() {
            const height = this.root?.clientHeight || 720;
            const width = this.root?.clientWidth || height * this.camera.aspect;
            const sidePanel = height <= 520 && width > 680;
            if (sidePanel) this.camera.setViewOffset(width, height, width * 0.19, 0, width, height);
            else this.camera.clearViewOffset();
            const distance = Math.max(1.2, 2.15 / (2 * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2)) * this.camera.aspect * (sidePanel ? 0.55 : 1)));
            this.camera.position.set(0, 1.42, -10.94 + distance);
            this.camera.lookAt(0, 1.25, -11.2);
            this.camera.updateMatrixWorld(true);
        }
        pickWheel(clientX, clientY) {
            if (this.inspectionKind !== 'lock') return null;
            const bounds = this.renderer.domElement.getBoundingClientRect();
            const pointer = new THREE.Vector2((clientX - bounds.left) / bounds.width * 2 - 1, 1 - (clientY - bounds.top) / bounds.height * 2);
            const ray = new THREE.Raycaster();
            this.scene.updateMatrixWorld(true); this.camera.updateMatrixWorld(true);
            ray.setFromCamera(pointer, this.camera);
            const hit = ray.intersectObjects(this.wheels, true)[0];
            for (let object = hit?.object; object; object = object.parent) {
                if (Number.isInteger(object.userData.wheelIndex)) return object.userData.wheelIndex;
            }
            return null;
        }
        beginLockInspection() {
            if (!this.inspectionReturn) { this.inspectionReturn = this.controls.snapshot(); this.inspectionFov = this.camera.fov; }
            this.inspectionKind = 'lock';
            this.controls.clear(); this.frameLock();
        }
        beginWaterInspection() {
            if (!this.inspectionReturn) { this.inspectionReturn = this.controls.snapshot(); this.inspectionFov = this.camera.fov; }
            this.inspectionKind = 'water'; this.controls.clear(); this.courtyard.frame(); this.syncState();
        }
        frameInspection() { this.inspectionKind === 'water' ? this.courtyard.frame() : this.frameLock(); }
        endInspection() {
            const pose = this.inspectionReturn;
            if (!pose) return;
            this.camera.position.set(pose.x, this.map.playerStart.y, pose.z);
            this.camera.fov = this.inspectionFov; this.camera.clearViewOffset(); this.camera.updateProjectionMatrix();
            this.controls.yaw = pose.yaw; this.controls.pitch = pose.pitch;
            this.inspectionReturn = null; this.inspectionKind = null; this.controls.clear(); this.controls.applyLook(); this.syncState();
        }
        animate() {
            this.animationId = global.requestAnimationFrame(() => this.animate());
            const delta = Math.min(this.clock.getDelta(), 0.05);
            this.controls.update(delta); this.syncState(); this.moveWheels(delta);
            this.moveDoor(delta);
            this.courtyard?.update(delta);
            this.scene.updateMatrixWorld(true); this.camera.updateMatrixWorld(true);
            this.interaction.update(delta);
            this.onFrame?.(this.inspectionReturn || this.camera.position, this.isPaused());
            const direction = new THREE.Vector3(); this.camera.getWorldDirection(direction);
            this.flashlight.position.copy(this.camera.position);
            this.flashTarget.position.copy(this.camera.position).add(direction.multiplyScalar(4));
            this.renderer.render(this.scene, this.camera);
        }
        moveDoor(delta) {
            if (this.isPaused()) return;
            const target = this.story.state.opened ? this.map.door.openAngle : 0;
            const remaining = target - this.door.rotation.y;
            this.door.rotation.y += this.reducedMotion?.matches || Math.abs(remaining) < 0.001 ? remaining : remaining * Math.min(1, delta * 4);
            this.courtyard?.moveGate(delta);
        }
        dispose() {
            global.cancelAnimationFrame(this.animationId);
            global.removeEventListener('resize', this.onResize);
            this.controls?.dispose(); this.interaction?.dispose();
            const geometries = new Set(), materials = new Set(this.labelCache.values());
            Object.values(this.materials || {}).forEach(m => materials.add(m));
            this.scene?.traverse(obj => {
                if (obj.geometry) geometries.add(obj.geometry);
                if (obj.material) (Array.isArray(obj.material) ? obj.material : [obj.material]).forEach(m => materials.add(m));
                if (obj.isLight) obj.dispose?.();
            });
            geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); this.textures.forEach(t => t.dispose());
            this.renderer?.dispose(); this.renderer?.domElement.remove();
        }
    }
    game.ThreeHouseScene = ThreeHouseScene;
})(window);
