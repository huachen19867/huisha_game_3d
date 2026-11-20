(function (global) {
    const copyText=global.HuishaCopy;
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
                h.label(`${id}-return-sign`, copyText('memoryjournal.show.3'), [1.15, 0.32], [0, 1.7, 4.42], [0, Math.PI, 0], `${id}_return`, root);
                const light = new THREE.PointLight(id === 'school' ? 0xffd09a : 0xc9e3eb, 21, 12, 1.6);
                light.position.set(0, 2.7, 0); root.add(light);
            }
            this.school(); this.hospital(); this.crash();
            h.box('memory-album-cover', [0.68, 0.45, 0.06], [7.75, 1.25, -23.93], m.darkWood, 'memory_album');
            h.label('memory-album-label', copyText('memoryscenes.memory-album-label'), [0.61, 0.39], [7.75, 1.25, -23.892], [0, 0, 0], 'memory_album');
        }
        school() {
            const h = this.house, m = h.materials, root = this.rooms.school;
            const chalk = new THREE.MeshStandardMaterial({ color: 0x253933, roughness: 1 });
            h.box('school-blackboard', [5.6, 1.45, 0.08], [0, 1.9, -4.7], chalk, 'school_rules', root);
            h.label('school-board-writing', copyText('memoryscenes.school-board-writing'), [3.6, 0.82], [0, 1.95, -4.65], [0, 0, 0], 'school_rules', root, '#253933', '#c9cdb8');
            h.box('chalk-tray',[5.65,.055,.15],[0,1.17,-4.64],m.wood,'school_rules',root);
            h.box('board-eraser',[.16,.047,.065],[.72,1.219,-4.615],m.darkWood,'school_rules',root);
            h.documents = new game.ThreeDocument(h); h.documents.build(root);
        }
        hospital() {
            const h = this.house, m = h.materials, root = this.rooms.hospital;
            const pale = new THREE.MeshStandardMaterial({ color: 0xa8b9b3, roughness: 0.75 });
            h.box('hospital-clipboard', [0.55, 0.62, 0.04], [-2.8, 1.32, -0.83], pale, 'hospital_plan', root);
            h.documents.build(root);
            h.cylinder('clipboard-stand', 0.018, 0.018, 1.25, [-2.8, 0.62, -0.9], m.brass, 'hospital_plan', root);
            const enamel = new THREE.MeshStandardMaterial({ color: 0xe7e2ca, roughness: .47 });
            const steel = new THREE.MeshStandardMaterial({ color: 0xadb1aa, metalness: .69, roughness: .72 });
            this.clinicSteel = steel;
            const rail = new THREE.MeshStandardMaterial({ color: 0x456760, roughness: .7 });
            h.box('hospital-wall-dado', [10.2, 1.04, .036], [0,.52,-4.738], pale, undefined, root);
            h.box('clinic-skirting',[10.2,.105,.055],[0,.052,-4.722],rail,undefined,root);
            h.box('hospital-wall-rail', [10.2,.085,.055], [0,1.08,-4.72], rail, undefined, root);
            h.cylinder('hospital-clock', .335,.335,.065,[0,2.1,-4.7],rail,'hospital_clock',root).rotation.x = Math.PI / 2;
            h.cylinder('clock-dial', .309,.309,.018,[0,2.1,-4.658],enamel,'hospital_clock',root).rotation.x = Math.PI / 2;
            const clockBar = (name, angle, radius, length, width, z) => {
                const pos = [Math.sin(angle)*radius, 2.1+Math.cos(angle)*radius, z];
                h.box(name,[width,length,.009],pos,m.darkWood,'hospital_clock',root).rotation.z = -angle;
            };
            for (let i=0; i<12; i++) clockBar('clock-tick', i*Math.PI/6, .268, i%3===0 ? .053 : .028, .013, -4.643);
            clockBar('clock-hand-hour', (4+20/60)*Math.PI/6, .075,.15,.024,-4.63);
            clockBar('clock-hand-minute', 20*Math.PI/30, .115,.23,.012,-4.618);
            h.cylinder('clock-hub',.022,.022,.018,[0,2.1,-4.61],steel,'hospital_clock',root).rotation.x = Math.PI/2;
            this.waitingBench(root, steel, rail);
            this.fareTin(root, steel);
            const counter = new THREE.Group();
            counter.position.set(2.7,0,-3.84); root.add(counter);
            h.box('clinic-counter-plinth',[2.39,.11,1.60],[0,.055,-.025],rail,undefined,counter);
            h.box('clinic-counter-body',[2.46,.83,1.62],[0,.515,-.015],pale,undefined,counter);
            for (let i=-1; i<=1; i++) {
                h.box('clinic-cabinet-door',[.795,.76,.028],[i*.812,.514,.811],enamel,undefined,counter);
                h.box('clinic-cabinet-pull',[.13,.018,.036],[i*.812+.22,.83,.841],steel,undefined,counter);
            }
            h.box('clinic-counter-edge',[2.55,.069,1.8],[0,.9545,0],steel,'hospital_record',counter);
            h.box('clinic-countertop',[2.55,.011,1.8],[2.7,.9945,-3.84],enamel,'hospital_record',root);
            h.box('clinic-writing-mat',[.58,.002,.63],[2.3,1.001,-3.27],rail,'hospital_record',root);
            const pen = h.cylinder('clinic-ballpoint',.006,.006,.145,[2.54,1.01,-3.31],m.cloth,'hospital_record',root);
            pen.rotation.set(Math.PI/2,0,-.21);
            h.mesh('clinic-pen-cord',new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
                [2.553,1.013,-3.38],[2.58,1.008,-3.46],[2.63,1.007,-3.43],[2.69,1.008,-3.54]
            ].map(p=>new THREE.Vector3(...p))),16,.0025,5,false),m.cloth,[0,0,0],'hospital_record',root);
            // The appointment window faces the aisle, behind the desk holding the chart.
            h.box('clinic-window-frame',[2.7,.91,.085],[2.7,1.56,-4.69],steel,undefined,root);
            const glass = new THREE.MeshStandardMaterial({color:0x84988b,metalness:.36,roughness:.23});
            h.box('clinic-window-glass',[2.62,.78,.024],[2.7,1.59,-4.635],glass,undefined,root);
            h.box('clinic-pass-slot',[1.01,.13,.024],[2.32,1.2,-4.615],m.cloth,undefined,root);
            h.cylinder('clinic-speaker',.082,.082,.016,[2.35,1.64,-4.607],steel,undefined,root).rotation.x=Math.PI/2;
            for(const offset of [-.033,0,.033]) h.box('clinic-intercom-slot',[.071,.006,.008],[2.35,1.64+offset,-4.594],m.cloth,undefined,root);
            h.box('clinic-window-rail',[.036,.85,.045],[2.88,1.56,-4.61],steel,undefined,root);
            h.box('clinic-window-sill',[2.8,.055,.25],[2.7,1.1,-4.6],enamel,undefined,root);
            h.label('clinic-window-sign',copyText('memoryscenes.clinic-window-sign'),[1.2,.28],[2.7,2.24,-4.70],[0,0,0],undefined,root,'#d6ded4','#285449');
            h.box('clinic-strip-housing',[1.46,.055,.18],[1.2,3.12,-3.0],steel,undefined,root);
            h.box('clinic-strip-diffuser',[1.38,.025,.15],[1.2,3.08,-3.0],new THREE.MeshBasicMaterial({color:0xe3eee8}),undefined,root);
            const fill = new THREE.SpotLight(0xf1f1d9,18,8,1.1,.58,2);
            fill.position.set(1.2,2.93,-3.0); fill.target.position.set(-.7,.08,-4.1);
            fill.castShadow = true; fill.shadow.mapSize.set(1024,1024);
            fill.shadow.normalBias=.012; fill.shadow.autoUpdate=false; fill.shadow.needsUpdate=true;
            root.add(fill,fill.target);
        }
        waitingBench(root, steel, rail) {
            const h = this.house, bench = new THREE.Group();
            bench.position.set(-1.3,0,-4.24); root.add(bench);
            h.box('bench-crossbeam',[1.88,.07,.075],[0,.34,0],steel,undefined,bench);
            for (const x of [-.73,.73]) {
                h.box('bench-leg',[.06,.31,.07],[x,.18,0],steel,undefined,bench);
                h.box('bench-foot',[.09,.052,.59],[x,.035,0],rail,undefined,bench);
            }
            const pan = new THREE.Shape();
            // Cross section of the rolled metal seat, extruded across its width.
            pan.moveTo(.29,.449); pan.quadraticCurveTo(.32,.489,.23,.484);
            pan.lineTo(-.13,.466); pan.quadraticCurveTo(-.215,.467,-.222,.57);
            pan.lineTo(-.235,.568); pan.quadraticCurveTo(-.228,.448,-.13,.453);
            pan.lineTo(.23,.471); pan.quadraticCurveTo(.30,.478,.278,.451); pan.closePath();
            const seat = new THREE.ExtrudeGeometry(pan,{depth:.54,bevelEnabled:false});
            seat.rotateY(-Math.PI/2); seat.translate(.27,0,0);
            const outline = new THREE.Shape();
            outline.moveTo(-.27,0); outline.lineTo(.27,0); outline.lineTo(.27,.30);
            outline.quadraticCurveTo(.27,.34,.23,.34); outline.lineTo(-.23,.34);
            outline.quadraticCurveTo(-.27,.34,-.27,.30); outline.closePath();
            for (let row=0; row<5; row++) for (let col=-3; col<=3; col++) {
                const hole = new THREE.Path();
                hole.absellipse(col*.052,.066+row*.048,.012,.013,0,Math.PI*2,true,0);
                outline.holes.push(hole);
            }
            const backrest = new THREE.ExtrudeGeometry(outline,{depth:.012,curveSegments:4,bevelEnabled:false});
            for (const x of [-.62,0,.62]) {
                h.mesh('clinic-waiting-seat',seat,steel,[x,0,0],undefined,bench);
                h.mesh('clinic-seat-back',backrest,steel,[x,.567,-.235],undefined,bench).rotation.x=-.18;
            }
            for (const x of [-.945,.945]) {
                const curve = new THREE.CatmullRomCurve3([[x,.35,.21],[x,.61,.20],[x,.64,.12],[x,.64,-.17],[x,.47,-.22]].map(p=>new THREE.Vector3(...p)));
                h.mesh('bench-armrest',new THREE.TubeGeometry(curve,18,.018,8,false),rail,[0,0,0],undefined,bench);
            }
        }
        fareTin(root, steel) {
            const h = this.house, item = 'hospital_fare', tin = new THREE.Group();
            tin.position.set(-1.3,.48,-4.16); root.add(tin);
            const lacquer = new THREE.MeshStandardMaterial({color:0x953b2c,metalness:.38,roughness:.43});
            const coin = new THREE.MeshStandardMaterial({color:0xc3bda8,metalness:.6,roughness:.39});
            const profile=[[0,.003],[.104,.003],[.109,.009],[.109,.044],[.111,.046],[.108,.049],[.105,.046],[.103,.01],[0,.01]];
            h.mesh('fare-tin',new THREE.LatheGeometry(profile.map(p=>new THREE.Vector2(...p)),48),steel,[0,0,0],item,tin);
            for (const x of [-.048,.048]) {
                for (let i=0;i<5;i++) h.cylinder('fare-coin',.013,.013,.0024,[x+.0008*(i%2),.0115+i*.0027,0],coin,item,tin);
            }
            h.box('folded-sweet-wrapper',[.028,.002,.086],[-.005,.016,0],h.materials.paper,item,tin).rotation.z=.42;
            h.box('folded-sweet-wrapper',[.028,.002,.086],[.019,.016,0],h.materials.paper,item,tin).rotation.z=-.42;
            this.tinLid = new THREE.Group(); this.tinLid.position.set(0,.049,-.106); tin.add(this.tinLid);
            h.cylinder('fare-tin-lid',.113,.113,.012,[0,0,.106],lacquer,item,this.tinLid);
            h.cylinder('tin-lid-inside',.107,.107,.002,[0,-.006,.106],steel,item,this.tinLid);
            const edging = new THREE.TorusGeometry(.103,.0017,6,48);
            h.mesh('tin-gold-edging',edging,h.materials.brass,[0,.007,.106],item,this.tinLid).rotation.x=Math.PI/2;
            h.label('tin-lid-print',copyText('memoryscenes.tin-lid-print'),[.142,.058],[0,.0075,.106],[-Math.PI/2,0,0],item,this.tinLid,'#8e3528','#eed49c');
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
            h.box('emergency-case', [1.36, 1, 0.65], [1.7, 0.5, -4.5], m.red, undefined, root);
            const effects = new THREE.Group();
            effects.position.set(1.35, 1, -4.5);
            root.add(effects);
            const bag = new THREE.MeshStandardMaterial({color:0xc3cdba,transparent:true,opacity:.46,roughness:.47,depthWrite:false});
            h.box('open-effects-bag',[.42,.004,.41],[0,.002,0],bag,'crash_phone',effects,false);
            h.box('bag-zip',[.006,.007,.39],[.20,.005,0],m.paper,'crash_phone',effects,false);
            h.box('driving-licence-cover',[.091,.009,.126],[.119,.009,.05],m.cloth,'crash_phone',effects,false);
            h.label('driving-licence-title',copyText('memoryscenes.licence'),[.079,.026],[.119,.014,.043],[-Math.PI/2,0,0],'crash_phone',effects,'#302c26','#c4aa70');
            h.phone = new game.ThreePhone(h); h.phone.build(effects);
            h.label('handover-sheet', copyText('memoryscenes.handover-sheet'), [0.53, 0.41], [2.03, 1.014, -4.5], [-Math.PI / 2, 0, 0], 'crash_report', root,'#c9c6ae','#294344');
            h.box('clipboard-clip',[.18,.022,.047],[2.03,1.027,-4.69],m.stone,'crash_report',root);
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
            h.label('crash-return-sign', copyText('memoryjournal.show.3'), [1.1, 0.32], [0, 1.4, 7.2], [0, Math.PI, 0], 'crash_return', root);
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
        }
        sealHome() {
            const h = this.house; h.homeRoot = new THREE.Group(); h.homeRoot.name = 'old-house';
            for (const object of [...h.scene.children]) {
                if (!object.userData.memorySpace && !object.isHemisphereLight && object !== h.flashlight && object !== h.flashTarget) h.homeRoot.add(object);
            }
            h.scene.add(h.homeRoot);
        }
        sync(delta) {
            const h = this.house, space = h.story.state.memory;
            if (space === 'hospital' && this.tinLid) {
                const angle = h.story.state.fareTinOpen ? -1.93 : 0;
                this.tinLid.rotation.x = this.lastSpace !== space || !delta || h.reducedMotion?.matches
                    ? angle : THREE.MathUtils.damp(this.tinLid.rotation.x,angle,11,delta);
            }
            if (space === this.lastSpace) return;
            if (space === 'hospital' && !this.clinicFinished) {
                h.loadClinicFinishes(this.rooms.hospital, this.clinicSteel);
                this.clinicFinished = true;
            }
            this.lastSpace = space;
            if (h.homeRoot) h.homeRoot.visible = !space;
            for (const [id, root] of Object.entries(this.rooms)) root.visible = id === space;
            h.scene.background = !space && h.nightSky ? h.nightSky : new THREE.Color(space ? game.MEMORIES[space].color : 0x151b21);
            if (h.scene.fog) { h.scene.fog.color.setHex(space ? game.MEMORIES[space].color : 0x222329); h.scene.fog.density = space === 'crash' ? 0.07 : 0.027; }
        }
    }
    game.ThreeMemoryScenes = ThreeMemoryScenes;
})(window);
