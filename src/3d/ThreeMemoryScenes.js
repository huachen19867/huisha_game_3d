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
            h.label('school-board-writing', '毕业班　志愿填报\n交表前核对院校、专业代码。草表自己留。', [3.6, 0.82], [0, 1.95, -4.65], [0, 0, 0], 'school_rules', root, '#253933', '#c9cdb8');
            h.box('chalk-tray',[5.65,.055,.15],[0,1.17,-4.64],m.wood,'school_rules',root);
            h.box('board-eraser',[.16,.047,.065],[.72,1.219,-4.615],m.darkWood,'school_rules',root);
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
            for (const end of [-1, 1]) {
                h.box('accident-cordon', [7.5,.16,.06], [0,.95,end*8.06], m.wax, undefined, root);
                for (const x of [-3.3,0,3.3]) h.box('cordon-post', [.07,1.12,.07], [x,.55,end*8.09], m.stone, undefined, root);
            }
            const postOutline=new THREE.Shape();
            postOutline.moveTo(-.23,0);postOutline.lineTo(.23,0);postOutline.lineTo(.23,.88);
            postOutline.lineTo(.065,1.06);postOutline.lineTo(-.23,1.06);postOutline.closePath();
            const post=new THREE.ExtrudeGeometry(postOutline,{depth:.42,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.018,bevelThickness:.018});
            h.mesh('chipped-bridge-pier',post,m.wellStone||m.stone,[-3.43,0,3.79],'bridge_post',root);
            h.box('gravel-verge',[1.9,.24,18.6],[-4.65,-.22,0],m.paving,undefined,root);
            for(const side of [-1,1]){
                const bent=h.box('bent-guardrail', [.08,.22,1.18], [-4.15,.42,side*.64], m.ash, undefined, root);
                bent.rotation.y=side*.72;bent.rotation.x=-side*.36;
            }
            const wagon=new THREE.Group();wagon.name='crashed-wagon';root.add(wagon);
            wagon.position.set(-2.65,-.045,0);wagon.rotation.order='YXZ';wagon.rotation.set(-.075,Math.PI/2,.025);
            for (const part of h.villageCar.children) {
                if(!part.isMesh || part.name==='wiper-pigment' || part.name==='driver-window-glass') continue;
                const copy=part.clone();copy.userData.item='crash_belt';wagon.add(copy);
                if(part.name==='front-bumper') {copy.rotation.z=-.13;copy.position.y-=.08;}
            }
            // Both cut ends remain attached, one to the upper guide and one to the buckle.
            const webbing=new THREE.MeshStandardMaterial({color:0x393d3a,roughness:.98,side:THREE.DoubleSide});
            function strap(name,points){
                const path=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
                const coords=[],indices=[];
                for(let i=0;i<=16;i++){
                    const p=path.getPoint(i/16);
                    coords.push(p.x,p.y,p.z-.027,p.x,p.y+(i===16 ? .028 : 0),p.z+.027);
                    if(i<16){const k=i*2;indices.push(k,k+1,k+2,k+1,k+3,k+2);}
                }
                const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(coords,3));geo.setIndex(indices);geo.computeVertexNormals();
                h.mesh(name,geo,webbing,[0,0,0],'crash_belt',wagon,false);
            }
            strap('belt-upper-cut',[[-.79,1.46,.31],[-.89,1.17,.22],[-.965,.995,.12],[-.974,.84,.09]]);
            strap('belt-buckle-cut',[[-.30,.96,-.11],[-.43,1.0,-.10],[-.60,.987,-.07]]);
            h.box('seatbelt-release',[.067,.04,.083],[-.30,.956,-.11],m.red,'crash_belt',wagon);
            for(const [x,z,size] of [[-4.7,-.26,.54],[-4.38,.28,.37],[-3.77,-.82,.21],[-3.81,.86,.16]]){
                const rock=h.mesh('rockfall',new THREE.DodecahedronGeometry(size,0),m.wellStone||m.stone,[x,size*.35,z],undefined,root);
                rock.rotation.set(z,.6+x,.7);rock.scale.set(1.26,.76,1);
            }
            const markerOutline=new THREE.Shape();
            markerOutline.moveTo(-.27,-.20);markerOutline.lineTo(-.20,-.27);markerOutline.lineTo(.22,-.27);
            markerOutline.lineTo(.27,-.195);markerOutline.lineTo(.27,.20);markerOutline.lineTo(.20,.27);
            markerOutline.lineTo(-.21,.27);markerOutline.lineTo(-.27,.20);markerOutline.closePath();
            const marker=new THREE.ExtrudeGeometry(markerOutline,{depth:.622,bevelEnabled:true,bevelSegments:2,bevelSize:.012,bevelThickness:.012});
            marker.rotateX(-Math.PI/2);
            h.mesh('phone-stone',marker,m.wellStone||m.stone,[-1.65,.012,1.2],'crash_phone',root);
            const bag=new THREE.MeshStandardMaterial({color:0xc3cdba,transparent:true,opacity:.46,roughness:.47,depthWrite:false});
            h.box('open-effects-bag',[.32,.004,.41],[-1.65,.648,1.2],bag,'crash_phone',root,false);
            h.box('bag-zip',[.006,.007,.39],[-1.502,.651,1.2],m.paper,'crash_phone',root,false);
            h.phone = new game.ThreePhone(h); h.phone.build(root);
            h.box('emergency-case', [0.8, 1, 0.65], [1.7, 0.5, -4.5], m.red, 'crash_report', root);
            h.label('handover-sheet', '院前救护记录\n21:18　李 明', [0.53, 0.41], [1.7, 1.014, -4.5], [-Math.PI / 2, 0, 0], 'crash_report', root,'#c9c6ae','#294344');
            h.box('clipboard-clip',[.18,.022,.047],[1.7,1.027,-4.69],m.stone,'crash_report',root);
            const bed=new THREE.PlaneGeometry(.62,1.81,12,20);
            bed.rotateX(-Math.PI/2);
            const fabric=bed.attributes.position;
            for(let i=0;i<fabric.count;i++){
                const x=fabric.getX(i)/.31,z=fabric.getZ(i);
                fabric.setY(i,-.045*(1-x*x)+.028*Math.max(0,-z-.5)+.007*Math.cos(z*19)*(1-x*x));
            }
            bed.computeVertexNormals();
            const stretcherFabric=(m.denim||m.cloth).clone();stretcherFabric.color.setHex(0x8b7854);stretcherFabric.side=THREE.DoubleSide;
            h.mesh('empty-stretcher',bed,stretcherFabric,[0,.73,-7],'rescue_light',root);
            for(const side of [-1,1]){
                h.cylinder('cot-rail',.026,.026,1.9,[side*.32,.73,-7],m.stone,'rescue_light',root).rotation.x=Math.PI/2;
                for(const end of [-1,1]){
                    const brace=h.cylinder('cot-folding-leg',.021,.021,1.24,[side*.265,.422,-7],m.stone,'rescue_light',root);
                    brace.rotation.x=end*1.09;
                    const caster=h.cylinder('cot-caster',.082,.082,.052,[side*.265,.082,-7+end*.56],m.cloth,'rescue_light',root);
                    caster.rotation.z=Math.PI/2;
                }
            }
            for (const side of [-1, 1]) {
                h.box(`rescue-post-${side}`, [0.08, 1.15, 0.08], [side * 0.9, 0.57, -7], m.stone, 'rescue_light', root);
                const lens = new THREE.MeshBasicMaterial({ color: side === -1 ? 0xd74c3c : 0x6a9fbd });
                h.cylinder(`rescue-lens-${side}`, 0.13, 0.13, 0.14, [side * 0.9, 1.2, -7], lens, 'rescue_light', root);
                const light = new THREE.PointLight(side === -1 ? 0xe0573e : 0x7baec9, 5, 8, 1.6); light.position.set(side * 0.9, 1.4, -7); root.add(light);
            }
            h.label('crash-return-sign', '回到厨房', [1.1, 0.32], [0, 1.4, 7.2], [0, Math.PI, 0], 'crash_return', root);
            const returnLight = new THREE.PointLight(0xc1d4de, 12, 13, 1.6); returnLight.position.set(0, 3, 3); root.add(returnLight);
            const workLight=new THREE.PointLight(0xffedd4,12,9,1.7);workLight.position.set(-.5,2.65,-2);root.add(workLight);
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
