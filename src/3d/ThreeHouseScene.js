(function (global) {
    const copyText=global.HuishaCopy;
    const game = global.Huisha3D || (global.Huisha3D = {});
    const THREE = global.THREE;
    class ThreeHouseScene {
        constructor({ root, prompt, focusMarker, story, isPaused, isReading, onInspect, onAssetError, onFrame, getPreferences, onMechanismEvent, onScaleEvent, onWatchEvent, onKitchenDrip, onWellKnock }) {
            Object.assign(this, { root, prompt, focusMarker, story, isPaused, isReading, onInspect, onAssetError, onFrame, getPreferences, onMechanismEvent, onScaleEvent, onWatchEvent, onKitchenDrip, onWellKnock });
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
            this.renderer.domElement.tabIndex = -1;
            this.root.appendChild(this.renderer.domElement);
            this.createMaterials();
            this.createArchitecture();
            this.createProps();
            this.createLights();
            this.modelLoading = this.loadModels();
            this.watch = new game.ThreeWellChase(this);
            this.syncState(true);
            this.controls = new game.ThreeControls({ camera: this.camera, domElement: this.renderer.domElement,
                map: this.map, story: this.story, isPaused: this.isPaused,
                getDoorAngle: id => this.doorAngle(id), getPreferences: this.getPreferences });
            this.interaction = new game.ThreeInteraction({ camera: this.camera, map: this.map, scene: this.scene,
                prompt: this.prompt, focusMarker: this.focusMarker, story: this.story, isPaused: this.isPaused, onInspect: this.onInspect });
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
        pbr(name, repeat, color, tileMeters) {
            const load = (suffix, srgb = false) => {
                const texture = new THREE.TextureLoader().load(`assets/materials/${name}-${suffix}.jpg`, undefined, () => this.onAssetError?.(`${name}-${suffix}`));
                if (srgb) texture.colorSpace = THREE.SRGBColorSpace;
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(...repeat);
                texture.anisotropy = Math.min(4, this.renderer.capabilities.getMaxAnisotropy());
                this.textures.push(texture);
                return texture;
            };
            const material = new THREE.MeshStandardMaterial({ color, map: load('color', true), normalMap: load('normal'),
                roughnessMap: load('roughness'), roughness: 0.95, normalScale: new THREE.Vector2(0.55, 0.55) });
            if (tileMeters) material.userData.tileMeters = [...tileMeters];
            return material;
        }
        loadClinicFinishes(room, steel) {
            room.getObjectByName('hospital-floor').material = this.pbr('terrazzo',[5.25,5],0xd0d0c5);
            const plaster = this.pbr('clinic-plaster',[3,1],0xe1ded1);
            plaster.normalScale.setScalar(.25);
            room.traverse(object => {
                if (object.material === this.materials.plaster || object.name === 'hospital-roof') object.material = plaster;
            });
            const wainscot = plaster.clone();
            wainscot.color.setHex(0x799d92);
            room.getObjectByName('hospital-wall-dado').material = wainscot;
            const wear = new THREE.TextureLoader().load('assets/materials/seat-roughness.jpg', undefined,
                () => this.onAssetError?.('seat-roughness'));
            wear.wrapS = wear.wrapT = THREE.RepeatWrapping;
            steel.roughnessMap = wear;
            steel.needsUpdate = true;
            this.textures.push(wear);
        }
        createMaterials() {
            const mat = (color, map) => new THREE.MeshStandardMaterial({ color, map, roughness: 0.88 });
            const planks = this.pbr('wood', [3, 3], 0xb0a99b);
            const oldWood = planks.clone(); oldWood.color.setHex(0x916e55); oldWood.roughness=.68;
            const sky = new THREE.TextureLoader().load('assets/materials/night-court.jpg', texture => {
                texture.mapping = THREE.EquirectangularReflectionMapping;
                texture.colorSpace = THREE.SRGBColorSpace;
                // Grade the LDR panorama once; r160 also samples this texture for indirect light.
                const skyCanvas=document.createElement('canvas'), source=texture.image;
                skyCanvas.width=source.width; skyCanvas.height=source.height;
                const skyContext=skyCanvas.getContext('2d'); skyContext.drawImage(source,0,0);
                skyContext.globalCompositeOperation='multiply';skyContext.fillStyle='#687d99';
                skyContext.fillRect(0,0,source.width,source.height);
                texture.image=skyCanvas;texture.needsUpdate=true;
                this.nightSky = texture;
                this.scene.environment = texture;
                this.scene.backgroundIntensity = .19;
                if (!this.story.state.memory) this.scene.background = texture;
                this.materials.paving.envMap = texture; this.materials.paving.envMapIntensity = .57;
                this.materials.paving.needsUpdate = true;
            }, undefined, () => this.onAssetError?.('night-court'));
            this.textures.push(sky);
            const portrait = new THREE.TextureLoader().load('assets/art/mother-portrait.png', undefined, () => this.onAssetError?.('mother-portrait'));
            portrait.colorSpace = THREE.SRGBColorSpace; this.textures.push(portrait);
            const campus = new THREE.TextureLoader().load('assets/art/school-postcard.webp', undefined, () => this.onAssetError?.('school-postcard'));
            campus.colorSpace = THREE.SRGBColorSpace;
            this.textures.push(campus);
            this.materials = {
                postcardPhoto: new THREE.MeshBasicMaterial({map: campus, toneMapped: false}),
                portrait: new THREE.MeshStandardMaterial({ map: portrait, roughness: 0.85 }),
                wall: mat(0x9b8d7c, this.texture('木墙', [2.5, 1])),
                floor: planks,
                quilt: this.pbr('quilt',[3,2],0x949f9d),
                denim: this.pbr('denim',[1.4,1.4],0xa5a9a6),
                brick: this.pbr('brick', [1,1], 0xb5aca2, [2.1,2.1]),
                roof: this.pbr('roof', [1,1], 0xaeb8b8, [2.4,2.4]),
                plaster: this.pbr('plaster', [2.5, 1.2], 0xa7a69a),
                paving: this.pbr('paving', [1, 1], 0xffffff, [2, 2]),
                wellStone: this.pbr('well', [1, 1], 0xaaa89c, [1.8, 1.8]),
                wood: mat(0x7d5036, this.texture('木梁', [1, 1])),
                darkWood: oldWood, brass: new THREE.MeshStandardMaterial({color:0xab8654,roughness:.47,metalness:.62}), red: mat(0x862f24),
                cloth: mat(0x17171b), paper: mat(0xc6b689), stone: mat(0x555f63),
                heightStrip: mat(0xe7dfce, this.texture('height-strip-front',[1,1])),
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
            const geometry = new THREE.BoxGeometry(...size), tile = material.userData.tileMeters;
            if (tile) {
                const { position: vertices, normal, uv } = geometry.attributes;
                for (let i = 0; i < vertices.count; i++) {
                    const x = vertices.getX(i) + position[0], y = vertices.getY(i) + position[1], z = vertices.getZ(i) + position[2];
                    const nx = normal.getX(i), ny = normal.getY(i), nz = normal.getZ(i);
                    // Keep metres per tile and tangent orientation on each face; adjoining floors share one origin.
                    const u = Math.abs(nx) > 0.5 ? -Math.sign(nx) * z : x * (Math.abs(nz) > 0.5 ? Math.sign(nz) : 1);
                    const v = Math.abs(ny) > 0.5 ? -Math.sign(ny) * z : y;
                    uv.setXY(i, u / tile[0], v / tile[1]);
                }
            }
            return this.mesh(name, geometry, material, position, item, parent, blocks);
        }
        cylinder(name, top, bottom, height, position, material, item, parent) {
            return this.mesh(name, new THREE.CylinderGeometry(top, bottom, height, 20), material, position, item, parent);
        }
        labelMaterial(text, background = '#c9ba96', color = '#30261f', aspect = 1.5) {
            const key = [text, background, color, aspect].join('|');
            if (this.labelCache.has(key)) return this.labelCache.get(key);
            const canvas = document.createElement('canvas');
            canvas.width = 768; canvas.height = Math.max(96,Math.min(1024,Math.round(768/aspect)));
            const height=canvas.height, inset=Math.max(5,Math.min(20,height*.05));
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = background; ctx.fillRect(0, 0, 768, height);
            ctx.strokeStyle = color; ctx.lineWidth = Math.max(2,inset*.2); ctx.strokeRect(inset,inset,768-2*inset,height-2*inset);
            const lines = text.split('\n');
            const fontSize = Math.floor(Math.min(height*.7/lines.length, 670/Math.max(1,...lines.map(line=>line.length))));
            ctx.fillStyle = color; ctx.font = `bold ${fontSize}px "KaiTi", "SimSun", serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            lines.forEach((line, i) => ctx.fillText(line, 384, height*.5 + (i - (lines.length - 1) / 2) * fontSize * 1.18, 670));
            const texture = new THREE.CanvasTexture(canvas);
            texture.colorSpace = THREE.SRGBColorSpace;
            this.textures.push(texture);
            const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
            this.labelCache.set(key, material);
            return material;
        }
        label(name, text, size, position, rotation, item, parent, background, color) {
            const mesh = this.mesh(name, new THREE.PlaneGeometry(...size), this.labelMaterial(text, background, color,size[0]/size[1]), position, item, parent, false);
            mesh.rotation.set(...rotation);
            return mesh;
        }
        createArchitecture() {
            const m = this.materials;
            this.box('hall-floor', [10, 0.15, 8.7], [0, -0.1, 0], m.floor);
            this.box('hall-ceiling', [10, 0.15, 8.7], [0, 3.35, 0], m.darkWood);
            game.buildVillageLane(this);
            for (const side of [-1, 1]) {
                this.box(`back-wall-${side}`, [3.65, 3.4, 0.2], [side * 3.175, 1.6, -4.3], m.wall);
                if (side > 0) this.box('corridor-wall-right', [0.2, 3.1, 7.2], [1.4, 1.5, -7.8], m.wall);
                else {
                    this.box('draft-wall-far', [.2,3.1,5.4], [-1.4,1.5,-8.7], m.wall);
                    this.box('draft-wall-sill', [.2,1.18,1.8], [-1.4,.54,-5.1], m.wall);
                    this.box('draft-wall-head', [.2,.65,1.8], [-1.4,2.725,-5.1], m.wall);
                    for (const z of [-5.9,-5.57,-5.24,-4.91,-4.58,-4.25])
                        this.box('draft-window-bar', [.055,1.27,.038], [-1.4,1.765,z], m.darkWood);
                    this.draftPaper = new THREE.Group(); this.draftPaper.position.set(-1.32,2.4,-5.30); this.scene.add(this.draftPaper);
                    const paper = this.box('torn-window-paper', [.012,.48,.16], [0,-.24,0], m.paper, undefined, this.draftPaper, false);
                    paper.rotation.x = .17;
                }
                this.box(`door-jamb-${side}`, [0.16, 2.9, 0.3], [side * 1.25, 1.45, -11.5], m.wood);
                this.box(`pillar-${side}`, [0.5, 3.3, 0.5], [side * 4.1, 1.6, -1.5], m.wood);
                this.box(`hall-footboard-${side}`, [0.08, 0.22, 8.5], [side * 4.85, 0.1, 0], m.darkWood);
                this.box(`wainscot-${side}`, [0.08, 0.85, 8.5], [side * 4.88, 0.55, 0], m.wall);
                this.box(`chair-rail-${side}`, [0.1, 0.065, 8.5], [side * 4.8, 0.99, 0], m.wood);
                game.ThreeWindowWall.build(this, { name: `hall-window-wall-${side}`, side, x: 5, length: 8.7, top: 3.3 });
                this.box(`side-court-ground-${side}`, [2.8, 0.12, 9.2], [side * 6.4, -0.1, 0], m.paving);
                this.box(`side-court-wall-${side}`, [0.18, 1.65, 9.2], [side * 7.75, 0.75, 0], m.plaster);
                this.box(`side-court-wall-cap-${side}`, [0.28, 0.08, 9.2], [side * 7.75, 1.61, 0], m.stone);
                this.box(`side-court-eave-${side}`, [1.05, 0.14, 9], [side * 5.32, 3.38, 0], m.darkWood);
                for (const end of [-1, 1]) this.box(`side-court-end-${side}-${end}`, [2.8, 1.65, 0.18], [side * 6.4, 0.75, end * 4.5], m.plaster);
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
            this.buildHeightStrip();
            this.label('hall-sign', copyText('housescene.hall-sign'), [1.5, 0.5], [0, 2.55, -4.16], [0, 0, 0],undefined,this.scene,'#312821','#ceb386');
        }
        buildHeightStrip() {
            const wall = new THREE.Group(), item = 'wall_marks';
            wall.position.set(1.293,1.27,-7.1); wall.rotation.y = -Math.PI/2;
            this.scene.add(wall);
            const cloth = new THREE.PlaneGeometry(.16,1.12,10,48), vertices = cloth.attributes.position;
            for (let i=0; i<vertices.count; i++) {
                const x=vertices.getX(i), y=vertices.getY(i), drop=(.56-y)/1.12;
                const fold=.004*Math.cos(x*107+y*3) + .006*Math.sin(y*13);
                const hem = Math.max(0,(drop-.96)/.04);
                vertices.setXYZ(i,x+.009*drop*Math.sin(y*7),y+.006*hem*Math.sin(x*76),.014+drop*(fold+.012*drop)+hem*.012*Math.cos(x*29));
            }
            cloth.computeVertexNormals();
            this.heightStrip=this.mesh('hanging-height-strip',cloth,this.materials.heightStrip || this.materials.paper,[0,0,0],item,wall,false);
            const fringe=[];
            for (let i=0; i<31; i++) {
                const x=-.07+i*.0049, hemY=-.56+.006*Math.sin(x*76);
                fringe.push(x+.007,hemY,.03,x+.008+.002*Math.sin(i*9),hemY-.004-.006*(.5+.5*Math.sin(i*17)),.032);
            }
            const geometry=new THREE.BufferGeometry();
            geometry.setAttribute('position',new THREE.Float32BufferAttribute(fringe,3));
            this.heightStrip.add(new THREE.LineSegments(geometry,new THREE.LineBasicMaterial({color:0xb2a080})));
            for (const x of [-.055,.055]) {
                const eyelet=this.mesh('stitched-buttonhole',new THREE.TorusGeometry(.007,.0016,5,16),this.materials.paper,[x,.543,.015],item,this.heightStrip,false);
                eyelet.scale.x=.71;
                const pin=this.cylinder('height-strip-nail',.004,.004,.03,[x,.544,.016],this.materials.darkWood,item,wall);
                pin.rotation.x=Math.PI/2;
                this.cylinder('nail-head',.0065,.0065,.0025,[x,.544,.032],this.materials.brass,item,wall).rotation.x=Math.PI/2;
            }
        }
        createOutside() {
            const m = this.materials;
            this.box('outside-ground', [28, 0.15, 23], [0, -0.23, -23], m.paving);
            for (let i = 0; i < 8; i++) {
                this.box(`path-stone-${i}`, [1.85, 0.12, 0.63], [(i % 2 ? 1 : -1) * 0.015, -0.03, -11.9 - i * 0.72], m.stone, 'threshold');
            }
            for (const side of [-1, 1]) {
                this.box('stone-court-side',[.22,1.55,2.5],[side*3.67,.77,-12.88],m.brick||m.stone);
                this.box('stone-court-cap',[.32,.1,2.58],[side*3.67,1.59,-12.88],m.roof||m.darkWood);
                this.box('stone-court-return',[2.41,2.76,.19],[side*2.46,1.34,-11.56],m.plaster);
                this.box(`stone-edging-${side}`, [0.24, 0.25, 4], [side * 1.2, 0, -13.5], m.darkWood);
                this.box(`stone-post-${side}`, [0.36, 1.2, 0.36], [side * 1.2, 0.5, -14.2], m.stone, 'threshold');
                this.box(`stone-post-cap-${side}`, [0.48, 0.13, 0.48], [side * 1.2, 1.15, -14.2], m.stone, 'threshold');
            }
            this.label('path-sign', copyText('housescene.path-sign'), [0.22, 0.5], [1.2, 0.7, -13.995], [0, 0, 0], 'threshold', undefined, '#4e5551', '#b4b6a4');
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
                    [-17 + i * 7, 0.8, -55 - i % 2 * 3]); mountain.scale.z = 0.5;
            }
        }
        createProps() {
            const m = this.materials;
            const altar = new THREE.Group(); altar.position.set(-2.75, 0, -3.12); this.scene.add(altar);
            const profile = [new THREE.Vector2(0.1, 0), new THREE.Vector2(0.2, 0.06), new THREE.Vector2(0.26, 0.18), new THREE.Vector2(0.29, 0.25)];
            this.mesh('incense-bowl', new THREE.LatheGeometry(profile, 24), m.brass, [0, 1.1, -0.18], 'altar', altar);
            this.cylinder('incense-ash', 0.24, 0.24, 0.02, [0, 1.29, -0.18], m.ash, 'altar', altar);
            for (let i = -1; i <= 1; i++) this.cylinder(`incense-${i}`, 0.008, 0.009, 0.33, [i * 0.06, 1.45, -0.18], m.darkWood, 'altar', altar);
            for (const x of [-1, 1]) this.createCandle(x, altar);
            this.portrait = new game.ThreePortrait(this); this.portrait.build();
            const outline = new THREE.Shape();
            outline.moveTo(-1.3, -0.55); outline.lineTo(0.95, -0.55); outline.lineTo(1.3, -0.32);
            outline.lineTo(1.3, 0.32); outline.lineTo(0.95, 0.55); outline.lineTo(-1.3, 0.55); outline.closePath();
            const rim=outline.clone(), cavity=new THREE.Path();
            cavity.moveTo(-1.19,-.45);cavity.lineTo(-1.19,.45);cavity.lineTo(.92,.45);
            cavity.lineTo(1.19,.265);cavity.lineTo(1.19,-.265);cavity.lineTo(.92,-.45);cavity.closePath();
            rim.holes.push(cavity);
            const floor=new THREE.ExtrudeGeometry(outline,{depth:.09,bevelEnabled:false});
            floor.rotateX(-Math.PI/2);
            this.mesh('coffin-floor',floor,m.wood,[0,.17,.65],'coffin');
            const body = new THREE.ExtrudeGeometry(rim, { depth: 0.54, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.022, bevelThickness: 0.022 });
            body.rotateX(-Math.PI / 2);
            this.mesh('coffin-body', body, m.darkWood, [0, 0.17, 0.65], 'coffin');
            this.coffinLid = new THREE.Group(); this.coffinLid.position.set(0,.714,.09); this.scene.add(this.coffinLid);
            this.coffinPadlock=this.box('coffin-padlock',[.122,.135,.058],[-.48,.713,1.273],m.brass,'coffin');
            this.mesh('lock-shackle',new THREE.TorusGeometry(.043,.012,8,18,Math.PI),m.stone,[0,.071,0],'coffin',this.coffinPadlock);
            // An open holdall with a low front lip keeps the folded sleeves visible from the aisle.
            const canvas=m.cloth.clone();canvas.color.setHex(0x997b4c);canvas.side=THREE.DoubleSide;
            if(m.denim) {canvas.normalMap=m.denim.normalMap;canvas.roughnessMap=m.denim.roughnessMap;}
            const bag=new THREE.Group();bag.position.set(0,.27,.64);this.scene.add(bag);
            const base=this.mesh('holdall-base',new THREE.SphereGeometry(1,28,12),canvas,[0,.034,0],'coffin',bag);
            base.scale.set(.50,.043,.29);
            const bagWall=new THREE.CylinderGeometry(1,1,1,48,5, true);
            const vertices=bagWall.attributes.position;
            for(let i=0;i<vertices.count;i++){
                const x=vertices.getX(i), z=vertices.getZ(i), height=vertices.getY(i)+.5;
                const fold=Math.cos(Math.atan2(z,x)*8);
                vertices.setXYZ(i,Math.sign(x)*Math.pow(Math.abs(x),.72)*(.45+.095*height+.016*fold*height),
                    .026+height*(.095+.12*x*x+.019*fold),Math.sign(z)*Math.pow(Math.abs(z),.72)*(.26+.064*height));
            }
            bagWall.computeVertexNormals();
            this.mesh('holdall-canvas',bagWall,canvas,[0,0,0],'coffin',bag);
            const rimPoints=Array.from({length:48},(_,i)=>new THREE.Vector3().fromBufferAttribute(vertices,i));
            const binding=canvas.clone();binding.color.setHex(0x685837);
            this.mesh('holdall-bound-edge',new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rimPoints,true),64,.009,6,true),binding,[0,0,0],'coffin',bag);
            for(const side of [-1,1]){
                const handle=new THREE.CatmullRomCurve3([[-.23,.145,.30],[0,.074,.425],[.23,.145,.30]].map(([x,y,z])=>new THREE.Vector3(x,y,z*side)));
                this.mesh('holdall-handle',new THREE.TubeGeometry(handle,16,.016,6,false),canvas,[0,0,0],'coffin',bag);
            }
            this.uniform=new THREE.Group();this.uniform.position.set(0,.405,.64);this.scene.add(this.uniform);
            const twill=(m.denim||m.cloth).clone();twill.color.setHex(0x304265);
            const fold=this.mesh('folded-school-jacket',new THREE.SphereGeometry(1,24,12),twill,[0,.012,0],'coffin',this.uniform);
            fold.scale.set(.35,.052,.235);
            for(const side of [-1,1]){
                const sleeve=new THREE.Group();sleeve.position.set(side*.19,.046,-.014);sleeve.rotation.y=side*.24;this.uniform.add(sleeve);
                const cloth=this.mesh('folded-sleeve',new THREE.SphereGeometry(1,20,12),twill,[0,0,0],'coffin',sleeve);
                cloth.scale.set(.071,.037,.205);
                for(const offset of [-.018,.018]) this.box('school-stripe',[.012,.006,.306],[offset,.034,0],m.paper,'coffin',sleeve);
                if(side===-1) for(const z of [-.125,-.04,.045]) this.cylinder('sleeve-snap',.013,.013,.008,[-.039,.03,z],m.brass,'coffin',sleeve);
            }
            this.offeringRice = game.ThreeKitchen.bowl(this,altar,[-.66,1.09,.14],'altar');
            this.offeringRice.rotation.y=Math.PI;
            this.offeredPork=this.offeringRice.getObjectByName('braised-pork');
            this.offeringEmber = new THREE.Group();
            altar.add(this.offeringEmber);
            const ember = new THREE.MeshBasicMaterial({color:0xd45c36});
            for (const x of [-.06,0,.06]) this.cylinder('incense-ember',.008,.009,.013,[x,1.615,-.18],ember,'altar',this.offeringEmber);
            for (const x of [.37,.392]) this.cylinder('offering-chopstick',.005,.009,.28,[x,1.102,.03],m.wood,'altar',altar).rotation.x = Math.PI/2;
            const basinProfile = [[.001,0],[.15,.008],[.217,.07],[.231,.125],[.223,.128],[.19,.066],[.144,.02],[.001,.018]];
            const basin = this.mesh('offering-enamel-basin',new THREE.LatheGeometry(basinProfile.map(([x,y])=>new THREE.Vector2(x,y)),40),m.stone,[.59,.015,.64],'altar',altar);
            const ashes = this.cylinder('old-paper-ash',.15,.137,.018,[0,.032,0],m.ash,'altar',basin);
            ashes.rotation.y = .2;
            this.paperAsh = new THREE.Group();
            basin.add(this.paperAsh);
            for (let i=0; i<8; i++) {
                const angle=i*2.4;
                const flake=this.box('burnt-paper-fold',[.074,.007,.042],[Math.cos(angle)*.10,.053+i*.001,Math.sin(angle)*.10],i%2 ? m.cloth : m.ash,'altar',this.paperAsh,false);
                flake.rotation.set(.19,angle,.13);
            }
            this.caughtSleeve = new THREE.Group();
            this.caughtSleeve.position.set(.21,.71,1.216);
            this.scene.add(this.caughtSleeve);
            const flapGeometry = new THREE.PlaneGeometry(.16,.16,8,8);
            const points = flapGeometry.attributes.position;
            for (let i=0;i<points.count;i++) {
                const x=points.getX(i), t=(.08-points.getY(i))/.16;
                points.setXYZ(i,x+.021*t,-.09*t,.04*Math.sin(t*Math.PI/2)+.006*Math.cos(x*87)*t);
            }
            flapGeometry.computeVertexNormals();
            const cuff=twill.clone();cuff.side=THREE.DoubleSide;
            this.mesh('pinched-sleeve',flapGeometry,cuff,[0,0,0],'coffin',this.caughtSleeve,false);
            for(const x of [-.046,-.023]) {
                const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(x,0,.002),new THREE.Vector3(x+.011,-.045,.031),new THREE.Vector3(x+.021,-.09,.042+.006*Math.cos(x*87))]);
                this.mesh('pinched-sleeve-stripe',new THREE.TubeGeometry(curve,8,.003,4,false),m.paper,[0,0,0],'coffin',this.caughtSleeve,false);
            }
            for (const [name,width,depth,y,thickness,material] of [
                ['coffin-lid-lip',1.039,1.12,.714,.045,m.darkWood],
                ['coffin-lid',1.025,1.09,.787,.070,m.wood],
                ['coffin-lid-crown',.99,1.045,.862,.025,m.darkWood]
            ]) {
                const lid = new THREE.ExtrudeGeometry(outline,{depth:thickness,bevelEnabled:true,bevelSegments:3,
                    steps:1,bevelSize:.038,bevelThickness:.012});
                lid.rotateX(-Math.PI/2); lid.scale(width,1,depth);
                this.mesh(name,lid,material,[0,y-.714,.56],'coffin',this.coffinLid);
            }
            for (const x of [-.86,.69]) {
                this.box('coffin-trestle',[.18,.15,1.22],[x,.077,.65],m.darkWood,'coffin');
                for (const side of [-1,1]) {
                    const z=.65+side*.555;
                    this.box('coffin-iron-backplate',[.14,.13,.03],[x,.49,z],m.darkWood,'coffin');
                    this.mesh('coffin-carry-ring',new THREE.TorusGeometry(.076,.012,8,26),m.brass,[x,.43,z+side*.024],'coffin');
                }
            }
            this.box('letter-shelf', [0.95, 0.1, 0.35], [2.65, 0.95, 4.07], m.wood, 'letter');
            const print=this.label('letter', copyText('housescene.letter'), [0.6, 0.4], [2.65, 1.15, 3.98], [0, Math.PI, 0], 'letter');
            if (this.renderer?.isWebGLRenderer) {
                const photo=new THREE.TextureLoader().load('assets/art/family-new-year.jpg');
                photo.colorSpace=THREE.SRGBColorSpace;this.textures.push(photo);
                print.material=new THREE.MeshStandardMaterial({map:photo,roughness:.67,side:THREE.DoubleSide});
            }
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
            this.label('lock-heading', copyText('housescene.hall-sign'), [1.3, 0.4], [1.17, 2.2, 0.11], [0, 0, 0], 'lock', this.door, '#352321', '#c9b389');
            this.doorMechanism = new game.ThreeDoorMechanism(this); this.doorMechanism.build();
            this.buildWakeLamp();
            if (game.ThreeCourtyard) { this.courtyard = new game.ThreeCourtyard(this); this.courtyard.build(); }
            if (game.ThreeMemoryScenes) { this.memories = new game.ThreeMemoryScenes(this); this.memories.build(); }
        }
        buildWakeLamp() {
            const m = this.materials;
            this.lamp = new THREE.Group(); this.scene.add(this.lamp);
            const lathe = (name, points, material) => this.mesh(name,
                new THREE.LatheGeometry(points.map(([r,y]) => new THREE.Vector2(r,y)), 32),
                material, [0,0,0], undefined, this.lamp, false);
            lathe('wake-lamp-oil-pot', [[.025,0],[.115,.012],[.128,.045],[.111,.085],[.07,.105],[.032,.11]], m.brass);
            const glass = new THREE.MeshStandardMaterial({color:0xb5b19a, transparent:true, opacity:.22, roughness:.27, side:THREE.DoubleSide, depthWrite:false});
            lathe('wake-lamp-chimney', [[.061,.095],[.09,.15],[.076,.22],[.048,.28],[.052,.34]], glass);
            const flame = new THREE.MeshBasicMaterial({color:0xffcf78});
            this.lampFlame = lathe('wake-lamp-flame', [[.001,.103],[.023,.123],[.018,.155],[.002,.211]], flame);
            const bail = this.mesh('wake-lamp-bail', new THREE.TorusGeometry(.123,.008,6,36,Math.PI), m.darkWood,
                [0,.275,0], undefined, this.lamp, false);
            for (const x of [-.122,.122]) this.mesh('wake-lamp-bail-wire', new THREE.CylinderGeometry(.008,.008,.23,8),m.brass,[x,.165,0],undefined,this.lamp,false);
            bail.rotation.y = .12;
            const tie=new THREE.CatmullRomCurve3([[.04,.389,.008],[.066,.375,-.014],[.056,.384,.022],[.103,.323,.032],[.094,.264,.048]].map(p=>new THREE.Vector3(...p)));
            this.mesh('red-shoelace',new THREE.TubeGeometry(tie,18,.009,6,false),m.red,[0,0,0],undefined,this.lamp,false);
            this.lampLight = new THREE.PointLight(0xffaa57,1.4,3.3); this.lampLight.position.y=.17; this.lamp.add(this.lampLight);
            const hook = this.mesh('inside-latch-loop',new THREE.TorusGeometry(.082,.012,8,32,Math.PI*1.8),m.brass,[2.02,1.03,.39],'lock',this.door,false);
            hook.rotation.z = -.5;
            this.lampOffset = new THREE.Vector3(); this.lampTime = 0;
            this.lamp.position.set(-2.16,1.09,-2.91);
        }
        updateWakeLamp(delta) {
            const s=this.story.state, held=s.lamp==='lit'||s.lamp==='out';
            const inspectingLock=this.inspectionKind==='lock';
            if (!this.isPaused()) this.lampTime+=delta;
            const sway=this.reducedMotion?.matches ? 0 : Math.sin(this.lampTime*4.3);
            this.draftPaper.rotation.z=.43+sway*.18;
            this.lamp.visible=!s.memory && (!held || !this.inspectionReturn || inspectingLock);
            if (!this.lamp.visible) return;
            this.lamp.rotation.set(0,0,0);
            if (s.lamp==='hook'||(held&&inspectingLock)) {
                this.lamp.position.copy(this.door.localToWorld(this.lampOffset.set(2.02,.66,.40)));
                this.lamp.rotation.y=this.door.rotation.y;
            } else if (held) {
                const halfWidth=.72*Math.tan(THREE.MathUtils.degToRad(this.camera.fov/2))*this.camera.aspect;
                this.lamp.position.copy(this.camera.localToWorld(this.lampOffset.set(Math.min(.32,halfWidth*.6),-.29,-.72)));
                this.lamp.rotation.y=this.controls.yaw-Math.PI;
            } else this.lamp.position.set(-2.16,1.09,-2.91);
            this.lampFlame.visible=s.lamp!=='out';
            this.lampFlame.scale.y = s.shielded ? .78 : 1+sway*.05;
            this.lampLight.intensity = this.lampFlame.visible ? (s.shielded ? .48 : 1.6) : 0;
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
            const instances = new Map();
            const place = (id, size, position, rotation, item, stretch = false, variant) => {
                const group = new THREE.Group();
                group.name = id; group.position.set(...position); group.rotation.y = rotation; this.scene.add(group);
                const proxy = new THREE.Group(); group.add(proxy);
                const [w,h,d] = size;
                if (variant) { /* Vegetation fills in without a solid proxy. */ }
                else if (/table|Desk/.test(id)) {
                    this.box('tabletop',[w,.09,d],[0,h-.045,0],this.materials.wood,item,proxy);
                    for (const side of [-1,1]) this.box('trestle',[.1,h-.09,d*.78],[side*w*.39,(h-.09)/2,0],this.materials.darkWood,item,proxy);
                } else if (/chair/i.test(id)) {
                    this.box('chair-seat',[w,h*.41,d],[0,h*.205,0],this.materials.darkWood,item,proxy);
                    this.box('chair-back',[w,h*.59,.07],[0,h*.705,-d*.45],this.materials.wood,item,proxy);
                } else if (id.includes('bucket')) this.cylinder('bucket',w/2,w*.4,h,[0,h/2,0],this.materials.wood,item,proxy);
                else this.box('cabinet',size,[0,h/2,0],this.materials.wood,item,proxy);
                if (!instances.has(id)) instances.set(id,[]);
                instances.get(id).push({group,proxy,size,stretch,item,variant});
                return group;
            };
            const install = ({group,proxy,size,stretch,item,variant}, source) => {
                const model = (variant ? source.getObjectByName(variant) : source).clone(true);
                const bounds = new THREE.Box3().setFromObject(model), dimensions = bounds.getSize(new THREE.Vector3());
                const center = bounds.getCenter(new THREE.Vector3());
                const ratios = size.map((n, i) => n / [dimensions.x, dimensions.y, dimensions.z][i]);
                const scale = stretch ? ratios : [Math.min(...ratios), Math.min(...ratios), Math.min(...ratios)];
                const normalized = new THREE.Group();
                model.position.sub(new THREE.Vector3(center.x, bounds.min.y, center.z));
                normalized.add(model); normalized.scale.set(...scale);
                group.add(normalized); group.remove(proxy);
                proxy.traverse(obj => obj.geometry?.dispose());
                normalized.traverse(mesh => {
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
            place('dead_tree_trunk_02',[4.5,.36,.49],[-1.35,0,16.13],0,undefined,true);
            for(const [x,z,width,variant] of [[-3.49,28.7,.63,'a'],[3.58,25.8,.64,'c'],[-3.52,15.32,.63,'b'],[3.45,10.5,.56,'d'],[-3.53,7.7,.71,'a']])
                place('fern_02',[width,.5,width],[x,.006,z],z,undefined,false,'fern_02_'+variant);
            for(const [x,z,width,height,variant] of [[-4.12,25.4,2.7,2.5,'a'],[4.23,27,2.4,2.6,'b'],[4.38,15.45,3,3.15,'c'],[-4.32,11.83,2.7,2.85,'d'],[-2.9,3.7,2.6,3.3,'a'],[4,4,2.8,3.65,'b']])
                place('shrub_02',[width,height,width],[x,.025,z],z*.5,undefined,true,'shrub_02_'+variant);
            place('old_bed_frame', [1.46,1.02,2.02], [-9.7,0,-20.19], Math.PI/2, undefined, true);
            const slidingCabinet=place('chinese_cabinet',[1.95,2.4,.71],[0,0,0],Math.PI/2,'wardrobe',true);
            this.wardrobe.add(slidingCabinet);
            place('bench_vice_01', [.45,.31,.33], [-16.87,.98,-18.59], -Math.PI/2);
            for (const [x,z] of [[2.94,21],[-3.26,11.5],[1.2,4.85]]) {
                place('wooden_lantern_01', [.34,.53,.34], [x,2.22,z], 0);
            }
            const storeyAssets=game.placeStoreyModels(this,place);
            this.courtyard?.placeFurniture(place);
            this.memories?.placeFurniture(place); this.memories?.sealHome();
            const fetchModel=async ([id, placements]) => {
                try {
                    const gltf = await loader.loadAsync(`assets/models/${id}/model.gltf`);
                    if (this.disposed) return;
                    for (const placement of placements) install(placement,gltf.scene);
                    this.interaction?.rebuildOccluders();
                } catch (_) { if (!this.disposed) this.onAssetError?.(id); }
            };
            const deferred=[], initial=[];
            for(const entry of instances) {
                if(this.renderer?.isWebGLRenderer && storeyAssets.has(entry[0])) deferred.push(entry);
                else initial.push(entry);
            }
            this.loadStoreyModels=()=>{this.loadStoreyModels=null;return Promise.all(deferred.map(fetchModel));};
            await Promise.all(initial.map(fetchModel));
        }
        createLights() {
            this.hemisphere=new THREE.HemisphereLight(0xb1bec8,0x51402e,1.8);
            this.scene.add(this.hemisphere);
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
        swingLeaf(id,leaf,spec,unlocked,delta,immediate=false) {
            const target=unlocked && !this.story.state.closedDoors.includes(id)?spec.openAngle:0;
            const from=leaf.rotation.y;
            if(immediate || from!==target){
                const distance=target-from;
                const step=immediate || this.reducedMotion?.matches ? Math.abs(distance) : Math.min(Math.abs(distance),2.4*delta);
                const parts=Math.ceil(step/.065);
                for(let n=1;n<=parts;n++){
                    const angle=n===parts && step===Math.abs(distance)?target:from+Math.sign(distance)*step*n/parts;
                    if(!immediate && this.controls?.blocksLeaf(this.camera.position.x,this.camera.position.z,spec,angle))break;
                    leaf.rotation.y=angle;
                }
            }
            const site=leaf.userData.handleSite??=this.map.interactables.find(item=>item.id===id);
            const x=spec.handleX,z=spec.handleZ;
            const a=leaf.rotation.y;
            site.position.x=spec.hingeX+x*Math.cos(a)+z*Math.sin(a);
            site.position.z=spec.hingeZ-x*Math.sin(a)+z*Math.cos(a);
        }
        doorAngle(id) {
            if (id === 'cellar') return this.cellarDoor.rotation.y;
            if (id === 'front') return this.frontHinge.rotation.y;
            return id === 'yard' ? this.courtyard.gate.rotation.y : this.door.rotation.y;
        }
        syncState(immediate = false, delta = 0) {
            const s = this.story.state;
            this.parkingNote.visible=s.records.includes('bridge_parking');
            this.wiperInk.opacity = s.records.includes('glass_impression') ? 0.49 : 0.90;
            this.documents?.syncTear();
            game.syncStoreys(this,s,this.storeysReady && !immediate ? delta : undefined);this.storeysReady=true;
            this.wardrobe.position.z = s.wardrobeOpen ? -16.01 : -18;
            this.wardrobeSite.position.z = this.wardrobe.position.z;
            this.westLid.rotation.x = s.chestOpen ? 1.36 : 0;
            this.chestKey.visible=s.chestOpen && !s.gear.includes('cellarKey');
            this.foldedCardigan.visible=s.cardiganPlace==='chest';
            this.cardiganBedSite.visible=s.cardiganPlace!=='chest';
            this.spreadCardigan.visible=s.cardiganPlace==='bed';
            this.spareWeight.visible = !s.gear.includes('weight');
            this.matchTin.visible = !s.gear.includes('matches');
            this.offeringRice.visible = s.offerings.includes('rice');
            this.offeredPork.visible = s.porkOnRice;
            this.offeringEmber.visible = s.offerings.includes('incense');
            this.paperAsh.visible = s.offerings.includes('paper');
            this.caughtSleeve.visible=!s.coffinOpen;
            this.coffinPadlock.visible=!s.oldCoffinLatch && !s.coffinOpen;
            this.coffinLid.rotation.x = s.coffinOpen ? -1.37 : 0;
            this.uniform.visible = s.coffinOpen && !s.records.includes('uniform_collar');
            this.swingLeaf('front_gate',this.frontHinge,this.frontDoorSpec,s.arrival==='home',delta,immediate);
            this.repairNote.visible=s.stripNoteLeft;
            this.heightStrip.visible = !s.heightStripTaken;
            this.houseKey.visible = s.keyAtBooth || s.arrival !== 'gate' && !(s.arrival === 'home' && s.records.includes('key_board'));
            this.portrait.sync(immediate);
            this.wheels.forEach((wheel, i) => {
                if (immediate) this.wheelTargets[i] = s.wheels[i] * Math.PI / 2;
                else this.wheelTargets[i] += ((s.wheels[i] - this.wheelSymbols[i] + 4) % 4) * Math.PI / 2;
                this.wheelSymbols[i] = s.wheels[i];
                if (immediate) wheel.rotation.x = this.wheelTargets[i];
            });
            if(immediate)this.swingLeaf('lock',this.door,this.map.door,s.opened,0,true);
            this.doorMechanism.sync(immediate);
            this.courtyard?.sync(immediate,delta);
            this.memories?.sync(delta);
        }
        moveWheels(delta) {
            const immediate = this.reducedMotion?.matches;
            this.wheels.forEach((wheel, i) => {
                const remaining = this.wheelTargets[i] - wheel.rotation.x;
                wheel.rotation.x += immediate || Math.abs(remaining) < 0.001 ? remaining : remaining * Math.min(1, delta * 15);
            });
        }
        playerSnapshot() { return this.watch?.returnPose || this.inspectionReturn || this.controls.snapshot(); }
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
        sitAtWellDoorway() {
            if (!this.inspectionReturn) { this.inspectionReturn=this.controls.snapshot();this.inspectionFov=this.camera.fov; }
            this.controls.clear();this.inspectionKind='wellSeat';this.frameInspection();
        }
        beginPortraitInspection() {
            if (!this.inspectionReturn) { this.inspectionReturn = this.controls.snapshot(); this.inspectionFov = this.camera.fov; }
            const entering = this.inspectionKind !== 'portrait'; this.inspectionKind = 'portrait'; this.controls.clear();
            if (entering) this.portrait.begin(); else this.portrait.frame();
        }
        beginPhoneInspection() {
            if (!this.inspectionReturn) { this.inspectionReturn = this.controls.snapshot(); this.inspectionFov = this.camera.fov; }
            const entering = this.inspectionKind !== 'phone'; this.inspectionKind = 'phone'; this.controls.clear();
            if (entering) this.phone.begin(); else this.phone.frame();
        }
        beginDocumentInspection(id) {
            if (!this.documents.papers.has(id)) return;
            if (!this.inspectionReturn) { this.inspectionReturn = this.controls.snapshot(); this.inspectionFov = this.camera.fov; }
            const entering = this.inspectionKind !== 'document' || this.documents.activeId !== id;
            this.inspectionKind = 'document'; this.controls.clear();
            if (entering) this.documents.begin(id); else this.documents.frame();
        }
        frameInspection() {
            if (this.inspectionKind === 'wellSeat') {
                this.camera.position.set(6.40,1.04,-20.30);
                this.camera.lookAt(-3,1.05,-22);this.camera.fov=49;this.camera.updateProjectionMatrix();
            } else if (this.inspectionKind === 'document') this.documents.frame();
            else if (this.inspectionKind === 'phone') this.phone.frame();
            else if (this.inspectionKind === 'portrait') this.portrait.frame();
            else if (this.inspectionKind === 'water') this.courtyard.frame(); else this.frameLock();
        }
        endInspection() {
            const pose = this.inspectionReturn;
            if (!pose) return;
            if (this.inspectionKind === 'portrait') this.portrait.end();
            if (this.inspectionKind === 'phone') this.phone.end();
            if (this.inspectionKind === 'document') this.documents.end();
            if (this.inspectionKind === 'water') this.courtyard.cancelWeigh();
            this.controls.teleport(pose);
            this.camera.fov = this.inspectionFov; this.camera.clearViewOffset(); this.camera.updateProjectionMatrix();
            this.controls.yaw = pose.yaw; this.controls.pitch = pose.pitch;
            this.inspectionReturn = null; this.inspectionKind = null; this.controls.clear(); this.controls.applyLook(); this.syncState();
        }
        animate() {
            this.animationId = global.requestAnimationFrame(() => this.animate());
            const elapsed=this.clock.getDelta();
            const delta = Math.min(elapsed, 0.05);
            if (this.showingFilm) return;
            if(this.handleTime>0){
                this.handleTime=Math.max(0,this.handleTime-delta);
                const t=.76-this.handleTime;
                this.rearHandle.rotation.z=1.05*THREE.MathUtils.smoothstep(t,0,.21)*(1-THREE.MathUtils.smoothstep(t,.49,.76));
            }
            this.laneRain.visible = this.camera.position.z > 3.8 && !this.story.state.memory;
            this.hemisphere.intensity = this.laneRain.visible ? .79 : 1.8;
            if (this.laneRain.visible && !this.reducedMotion?.matches) this.laneRain.position.y = -((-this.laneRain.position.y+delta*4.8)%1.3);
            this.controls.update(delta);
            if(this.loadStoreyModels && !this.story.state.memory && this.story.state.opened && this.camera.position.x < -4) this.loadStoreyModels();
            this.syncState(false,delta); this.moveWheels(delta);
            if (this.clerkHead && this.laneRain.visible && !this.isPaused()) {
                const dx=this.camera.position.x-this.clerk.position.x, dz=this.camera.position.z-this.clerk.position.z;
                const nearby=dx*dx+dz*dz<22;
                const turn=nearby ? THREE.MathUtils.clamp(Math.atan2(dz,-dx),-.65,.65) : .13;
                this.clerkHead.rotation.y=THREE.MathUtils.damp(this.clerkHead.rotation.y,turn,4,delta);
                this.clerkHead.rotation.x=THREE.MathUtils.damp(this.clerkHead.rotation.x,nearby?0:.21,3,delta);
            }
            this.watch.update(this.watch.phase==='film'?Math.min(elapsed,.25):delta);
            this.portrait.update(delta);
            this.documents?.update(delta);
            this.moveDoor(delta);
            this.updateWakeLamp(delta);
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
            this.doorMechanism.update(delta);
            this.swingLeaf('lock',this.door,this.map.door,this.story.state.opened && this.doorMechanism.ready,delta);
            this.doorMechanism.updateLight();
            this.courtyard?.moveGate(delta);
        }
        dispose() {
            this.disposed = true;
            global.cancelAnimationFrame(this.animationId);
            global.removeEventListener('resize', this.onResize);
            this.controls?.dispose(); this.interaction?.dispose();
            const geometries = new Set(), materials = new Set(this.labelCache.values());
            Object.values(this.materials || {}).forEach(m => materials.add(m));
            Object.values(this.windowMaterials || {}).forEach(m => materials.add(m));
            this.scene?.traverse(obj => {
                if (obj.geometry) geometries.add(obj.geometry);
                if (obj.material) (Array.isArray(obj.material) ? obj.material : [obj.material]).forEach(m => materials.add(m));
                if (obj.isLight) obj.dispose?.();
                if (obj.isInstancedMesh) obj.dispose();
            });
            geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); this.textures.forEach(t => t.dispose());
            this.renderer?.dispose(); this.renderer?.domElement.remove();
        }
    }
    game.ThreeHouseScene = ThreeHouseScene;
})(window);
