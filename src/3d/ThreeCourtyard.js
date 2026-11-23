(function (global) {
    const copyText=global.HuishaCopy;
    const game = global.Huisha3D;
    const THREE = global.THREE;
    class ThreeCourtyard {
        constructor(house) { this.house = house; this.selected = 0; this.waterParts = []; this.targets = []; this.releaseProgress = 0; }
        build() {
            const h = this.house, m = h.materials;
            h.box('yard-floor', [12, 0.12, 13.6], [0, -0.1, -20.6], m.paving);
            game.buildWestRoom(h);
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
            const stool=new THREE.Group();stool.position.set(6.40,0,-20.30);h.scene.add(stool);
            h.box('stool-top',[.35,.047,.40],[0,.304,0],m.wood,'well_seat',stool);
            for(const x of [-.126,.126]){
                for(const z of [-.147,.147])h.box('stool-leg',[.042,.289,.048],[x,.144,z],m.darkWood,'well_seat',stool);
                h.box('stool-stretcher',[.032,.037,.29],[x,.113,0],m.wood,'well_seat',stool);
            }
            for(let i=0;i<4;i++)h.box('knife-mark',[.049+i*.009,.0018,.002],[.048+i*.009,.328,-.055+i*.017],m.darkWood,'well_seat',stool).rotation.y=-.36+i*.19;
            h.label('kitchen-sign', copyText('courtyard.kitchen-sign'), [1.0, 0.32], [5.87, 2.45, -21.4], [0, -Math.PI / 2, 0],undefined,h.scene,'#392d22','#ddbd8a');
            this.buildMask();
            const wetStone = m.paving.clone(); wetStone.color.setHex(0x83887d); wetStone.roughness=.43;
            for (let i = 0; i < 6; i++) {
                const slab=h.box(`yard-step-${i}`, [1.62+i%3*.13,.045,.61], [Math.sin(i*2)*.08,-.005,-18-i*1.5],wetStone);
                slab.rotation.y=Math.sin(i*3.8)*.048;
                const tread=h.box(`kitchen-step-${i}`, [.69,.045,1.24], [1+i*.85,-.006,-21.2+Math.sin(i)*.08],wetStone);
                tread.rotation.y=Math.sin(i*2.1)*.042;
            }
            this.buildWell();
            const water = new THREE.MeshStandardMaterial({ color: 0x41615e, roughness: 0.19, metalness: 0.18 });
            h.cylinder('well-water', 0.54, 0.54, 0.015, [-3, 0.18, -22], water, 'yard_well');
            this.kitchen=new game.ThreeKitchen(h);
            this.buildWater(water);
            const door = this.gateSpec = h.map.extraDoors.find(leaf=>leaf.id==='yard');
            this.gate = new THREE.Group(); this.gate.position.set(door.hingeX, 0, door.hingeZ); h.scene.add(this.gate);
            h.box('yard-gate', [door.width, 2.7, door.thickness], [door.width / 2, 1.35, 0], m.wood, 'yard_gate', this.gate);
            this.gateBolt = h.box('yard-gate-latch', [1.2, 0.1, 0.1], [1.6, 1.3, 0.14], m.brass, 'yard_gate', this.gate);
            for (const x of [0.45, 1.2]) for (const side of [-1, 1]) h.box(`yard-bolt-guide-${x}-${side}`, [0.1, 0.04, 0.16],
                [x, 1.3 + side * 0.09, 0.15], m.brass, 'yard_gate', this.gate);
            for (const side of [-1, 1]) h.box(`yard-bolt-receiver-${side}`, [0.14, 0.045, 0.17],
                [door.hingeX + door.width + 0.16, 1.3 + side * 0.09, door.hingeZ + 0.15], m.brass, 'yard_gate');
            this.buildLinkage();
            h.label('yard-gate-sign', copyText('courtyard.yard-gate-sign'), [1.1, 0.3], [1, 2, 0.1], [0, 0, 0], 'yard_gate', this.gate,'#382b23','#ccb189');
            h.box('road', [2.6, 0.16, 5], [0, -0.1, -30], m.paving, 'road_exit');
            for (const side of [-1, 1]) h.box(`road-edge-${side}`, [0.18, 0.76, 18.5], [side * 1.35, 0.36, -36.85], m.wood);
            h.box('bus-path',[2.7,.16,18.7],[0,-.1,-36.8],m.paving);
            h.box('bus-turnout',[7.1,.16,13.8],[0,-.102,-53.05],m.paving);
            h.box('bus-stop-post', [.10,1.43,.10], [1.45,.72,-44.96], m.stone, 'road_exit');
            h.label('road-end-sign', copyText('courtyard.road-end-sign'), [.83,.25], [1.45,1.38,-44.89], [0,-.25,0], 'road_exit');
            h.box('bus-notice-post',[.09,1.9,.09],[1.22,.95,-31.4],m.wood,'bus_notice');
            h.label('bus-notice',copyText('courtyard.bus-notice'),[.9,.6],[.99,1.55,-31.22],[0,-.32,0],'bus_notice');
            h.box('shelter-roof',[2.82,.15,3.4],[0,2.65,-40.8],m.darkWood);
            for(const z of [-39.25,-42.35]) for(const x of [-1.32,1.32]) h.box('shelter-post',[.11,2.6,.11],[x,1.3,z],m.wood);
            h.box('signal-pole',[.1,1.71,.11],[-1.21,.86,-40.5],m.stone,'stop_signal');
            this.signalBoard=h.box('signal-board',[.63,.37,.06],[-.98,1.54,-40.5],m.brass,'stop_signal');
            h.label('stop-name',copyText('courtyard.stop-name'),[1.44,.33],[0,2.36,-39.12],[0,0,0],'stop_signal');
            this.buildShuttle();

            // These fill lights add no shadow maps; the existing candle remains the sole shadow caster.
            for (const [color, intensity, distance, position] of [
                [0xaec7db, 15, 17, [0, 5, -21]], [0xffc38a, 12, 9, [8.6, 2.4, -21]], [0xd3dfdb, 10, 9, [0, 3, -30]]
            ]) { const light = new THREE.PointLight(color, intensity, distance, 1.6); light.position.set(...position); h.scene.add(light); }
            h.cylinder('kitchen-lamp-chain',.009,.009,.34,[9.83,2.94,-23.47],m.darkWood);
            this.dressEaves();
            this.dressStove();
        }
        buildShuttle() {
            const h=this.house, m=h.materials;
            const bus=new THREE.Group();
            this.busLights=bus; bus.name='county-shuttle';bus.position.set(-.16,0,-48.34);bus.rotation.y=.18;h.scene.add(bus);
            const enamel=new THREE.MeshStandardMaterial({color:0xb6b49e,metalness:.34,roughness:.45});
            const stripe=new THREE.MeshStandardMaterial({color:0x325851,roughness:.51});
            const glass=new THREE.MeshStandardMaterial({color:0x839b98,transparent:true,opacity:.19,depthWrite:false,side:THREE.DoubleSide});
            const part=(name,size,at,material)=>h.box(name,size,at,material,'road_exit',bus);
            part('bus-floor',[2.29,.17,4.50],[0,.51,0],m.cloth);
            part('bus-nose',[2.28,.72,.33],[0,.84,2.09],enamel);
            part('bus-bumper',[2.32,.12,.15],[0,.49,2.27],stripe);
            part('bus-roof',[2.3,.16,4.56],[0,2.36,0],enamel);
            part('bus-header',[2.27,.26,.14],[0,2.19,2.14],stripe);
            part('bus-dashboard',[2.02,.18,.43],[0,1.13,1.89],m.cloth);
            part('bus-windscreen',[2.09,.91,.025],[0,1.64,2.16],glass).rotation.x=-.066;
            part('bus-rear',[2.21,1.66,.16],[0,1.37,-2.18],enamel);
            for(const side of [-1,1]){
                const x=side*1.09;
                // The passenger side ends before the front step, leaving the door open.
                const front=side<0?.93:2.12, length=front+2.18;
                part('bus-side-panel',[.10,.64,length],[x,.84,front-length/2],enamel);
                part('bus-side-stripe',[.11,.10,length],[x,1.06,front-length/2],stripe);
                part('bus-side-glass',[.025,1.1,length],[x,1.71,front-length/2],glass);
                for(const z of [-2.16,-1.09,-.06,.94,2.12])part('bus-pillar',[.082,1.18,.08],[x,1.72,z],stripe);
                for(const z of [-1.47,1.36]){
                    const tire=h.cylinder('bus-tire',.36,.36,.19,[x,.36,z],m.cloth,'road_exit',bus);
                    tire.rotation.z=Math.PI/2;
                    h.cylinder('bus-hub',.18,.18,.018,[side*1.19,.36,z],enamel,'road_exit',bus).rotation.z=Math.PI/2;
                }
                part('bus-headlamp',[.36,.14,.036],[side*.82,.89,2.274],new THREE.MeshBasicMaterial({color:0xffdfaa}));
                part('headlamp-surround',[.45,.21,.04],[side*.82,.89,2.252],m.cloth);
                part('bus-indicator',[.14,.055,.04],[side*.90,.72,2.274],m.brass);
                part('bus-wiper',[.51,.023,.027],[side*.44,1.245,2.205],m.cloth).rotation.z=side*.12;
                part('bus-mirror-arm',[.22,.033,.036],[side*1.20,1.95,2.01],stripe);
                part('bus-mirror',[.13,.23,.08],[side*1.34,1.88,2.01],m.cloth);
                for(const z of [-1.60,-.66,.22]){
                    part('bench-back',[.75,.61,.11],[side*.58,1.22,z],stripe);
                    part('bench-seat',[.75,.12,.46],[side*.58,.93,z+.16],stripe);
                }
            }
            part('bus-tread',[.39,.08,.93],[-1.08,.30,1.56],m.stone);
            part('door-handrail',[.034,1.25,.034],[-.98,1.24,1.03],m.brass);
            for(const y of [.70,.77,.84])part('bus-grille',[.77,.027,.032],[0,y,2.27],m.cloth);
            h.label('bus-destination',copyText('courtyard.bus-destination'),[.85,.20],[0,2.19,2.22],[0,0,0],'road_exit',bus);
            const wheel=h.mesh('bus-steering-wheel',new THREE.TorusGeometry(.19,.018,8,32),m.cloth,[.51,1.29,1.75],'road_exit',bus);
            wheel.rotation.x=-.59;
            game.buildBusDriver(h,bus);
            const light=new THREE.PointLight(0xffdfb0,2.5,4,1.7);
            light.position.set(-.18,2.15,1.92);bus.add(light);
        }
        buildMask() {
            const h=this.house, geometry=new THREE.PlaneGeometry(.315,.345,24,26);
            const vertices=geometry.attributes.position;
            for(let i=0;i<vertices.count;i++){
                const x=vertices.getX(i)/.158,y=vertices.getY(i)/.173;
                vertices.setZ(i,.075*Math.max(0,1-x*x-.78*y*y)+.023*Math.exp(-22*x*x-11*y*y));
            }
            geometry.computeVertexNormals();
            const makeMaterial=(side)=>{
                const material=new THREE.MeshStandardMaterial({color:0xe6d7b8,roughness:.94,alphaTest:.36,side:side==='front'?THREE.FrontSide:THREE.BackSide});
                if(h.renderer?.isWebGLRenderer){
                    material.map=new THREE.TextureLoader().load('assets/art/paper-mask-'+side+'.webp',undefined,undefined,()=>h.onAssetError?.(copyText('courtyard.buildmask')));
                    material.map.colorSpace=THREE.SRGBColorSpace;
                    if(side==='back'){material.map.repeat.x=-1;material.map.offset.x=1;}
                    h.textures.push(material.map);
                }
                return material;
            };
            this.mask=new THREE.Group();this.mask.name='paper-mask';h.scene.add(this.mask);
            this.mask.rotation.order='YXZ';
            h.mesh('mask-printed-face',geometry,makeMaterial('front'),[0,0,.002],'paper_mask',this.mask,false);
            h.mesh('mask-check-strap',geometry,makeMaterial('back'),[0,0,0],'paper_mask',this.mask,false);
            this.maskSite=h.map.interactables.find(item=>item.id==='paper_mask');
            h.cylinder('mask-peg',.015,.017,.115,[5.85,1.46,-19.15],h.materials.wood).rotation.z=Math.PI/2;
            this.syncMask();
        }
        syncMask() {
            const {crossedYard,maskHung}=this.house.story.state;
            this.mask.visible=crossedYard;
            this.mask.position.set(5.78,maskHung?1.35:.21,-19.15);
            this.mask.rotation.set(maskHung ? 0 : -.47,-Math.PI/2,maskHung ? .06 : -.28);
            Object.assign(this.maskSite.position,{x:this.mask.position.x,y:this.mask.position.y,z:this.mask.position.z});
        }
        buildWell() {
            const h=this.house,m=h.materials, blocks=[], count=11, step=Math.PI*2/count;
            const section=new THREE.Shape();
            section.absarc(0,0,.78,.014,step-.014,false);
            section.absarc(0,0,.51,step-.014,.014,true);section.closePath();
            const stone=new THREE.ExtrudeGeometry(section,{depth:.193,bevelEnabled:true,bevelThickness:.017,bevelSize:.012,bevelSegments:1,curveSegments:10});
            stone.rotateX(-Math.PI/2);
            for(let row=0;row<4;row++) for(let i=0;i<count;i++){
                const g=stone.clone();g.scale(row===3?1.04:1,1,row===3?1.04:1);
                g.rotateY(step*(i+(row%2)*.5));g.translate(0,row*.216,0);blocks.push(g);
            }
            const wall=game.mergeGeometries(blocks);blocks.forEach(g=>g.dispose());stone.dispose();
            h.mesh('well-masonry',wall,m.wellStone||m.paving,[-3,.019,-22],'yard_well');
            const scrap=new THREE.PlaneGeometry(1,1,24,18);
            const points=scrap.attributes.position,uv=scrap.attributes.uv;
            const backingUV=[];
            for(let i=0;i<points.count;i++){
                const u=uv.getX(i),v=1-uv.getY(i),end=v===0||v===1;
                const fray=end ? .006*Math.sin(i*4.17) : 0;
                const tornEdge=(u===0||u===1) ? .004*Math.cos(i*2.31) : 0;
                const x=(u-.5)*(.195+.055*v)+.024*v+tornEdge;
                const crease=.98-.42*u,tail=Math.max(0,(v-crease)*.34);
                const angle=Math.min(2.72,tail/.025),tip=Math.max(0,tail-.025*angle);
                const z=-.22+.34*Math.min(v,crease)+.025*Math.sin(angle)+tip*Math.cos(angle)+fray;
                const sag=Math.max(0,-.15-z)*1.4;
                const y=.008-sag+.003*Math.sin(25*u-7*v)+.025*(1-Math.cos(angle))+tip*Math.sin(angle);
                points.setXYZ(i,x,y,z);
                uv.setXY(i,.21+.23*u,.24-.213*v);
                backingUV.push(.42+.13*u,.82+.065*v);
            }
            scrap.computeVertexNormals();
            this.scrapPrint=new THREE.MeshStandardMaterial({color:0xb99077,roughness:.82});
            this.rimScrap=h.mesh('bridal-paper-on-well',scrap,this.scrapPrint,[-3.14,.881,-21.35],'yard_well');
            const back=scrap.clone();back.setAttribute('uv',new THREE.Float32BufferAttribute(backingUV,2));
            this.scrapPulp=new THREE.MeshStandardMaterial({color:0xb2a38b,roughness:.96,side:THREE.BackSide});
            h.mesh('bridal-paper-reverse',back,this.scrapPulp,[0,0,0],'yard_well',this.rimScrap);
            this.rimScrap.visible=false;
            for(const x of [-3.62,-2.38])h.box('well-windlass-upright',[.115,1.31,.14],[x,1.06,-22.15],m.darkWood,'yard_well');
            const drum=h.cylinder('well-windlass',.105,.105,1.51,[-3,1.61,-22.15],m.wood,'yard_well');drum.rotation.z=Math.PI/2;
            this.wellCrank=new THREE.Group();this.wellCrank.position.set(-2.25,1.61,-22.15);h.scene.add(this.wellCrank);
            const iron=new THREE.MeshStandardMaterial({color:0x684c39,roughness:.88,metalness:.38});
            h.box('well-crank',[.052,.23,.052],[0,-.105,0],iron,'well_grip',this.wellCrank);
            h.cylinder('crank-axle',.038,.038,.32,[.14,-.211,0],iron,'well_grip',this.wellCrank).rotation.z=Math.PI/2;
            const grip=h.cylinder('rubber-wrapped-grip',.042,.045,.29,[.135,-.211,0],
                new THREE.MeshStandardMaterial({color:0x974939,roughness:.85}),'well_grip',this.wellCrank);
            grip.rotation.z=-Math.PI/2;
            this.gripSite=h.map.interactables.find(item=>item.id==='well_grip');
            for(const x of [.025,.037,.24,.253]){
                const tie=h.mesh('twine-around-grip',new THREE.TorusGeometry(.045,.003,6,24),m.wood,[x,-.211,0],'well_grip',this.wellCrank);
                tie.rotation.y=Math.PI/2;
            }
            this.rubberFlap=new THREE.Group();this.rubberFlap.position.set(.137,-.190,.035);this.wellCrank.add(this.rubberFlap);
            const tab=h.box('loose-rubber-edge',[.145,.067,.007],[0,-.033,0],grip.material,'well_grip',this.rubberFlap);
            const glue=new THREE.MeshStandardMaterial({color:0x353430,roughness:.92});
            const patch=h.mesh('ball-inner-patch',new THREE.CircleGeometry(.026,17),glue,[.024,0,-.004],'well_grip',tab);
            patch.rotation.y=Math.PI;patch.scale.x=1.35;
            const valve=h.cylinder('ball-valve',.007,.012,.012,[-.032,0,-.011],glue,'well_grip',tab);
            valve.rotation.x=Math.PI/2;
            for(const z of [-21.86,-21.65])h.box('well-bucket-rest',[.60,.055,.078],[-2.48,.881,z],m.darkWood,'yard_well');
            this.wellPail=new THREE.Group();h.scene.add(this.wellPail);
            this.pailLift=0;this.wellBeat=0;
            const rope=new THREE.MeshStandardMaterial({color:0x8b7151,roughness:1});
            for(let i=0;i<7;i++){
                const turn=h.mesh('hemp-winding',new THREE.TorusGeometry(.109,.014,6,20),rope,[-3.15+i*.026,1.61,-22.15],'yard_well');turn.rotation.y=Math.PI/2;
            }
            this.pailRope=h.cylinder('bucket-rope',.014,.014,1,[-3,1.29,-22.045],rope,'yard_well');
            this.ropeAnchor=new THREE.Vector3(-3,1.61,-22.045);
            this.ropeEnd=new THREE.Vector3();this.ropeUp=new THREE.Vector3(0,1,0);
            const wetPaper=new THREE.MeshStandardMaterial({color:0xb29555,roughness:.64,side:THREE.DoubleSide});
            this.ropePaper=Array.from({length:4},(_,i)=>{
                const geometry=new THREE.PlaneGeometry(.033+i*.002,.123-i*.007,3,8);
                geometry.translate(0,-.055,0);
                const v=geometry.attributes.position;
                for(let j=0;j<v.count;j++){
                    const t=Math.max(0,-v.getY(j)/.12);
                    v.setXYZ(j,v.getX(j)+.014*t*t,v.getY(j)+.004*Math.sin(j*2.9)*t,.012*Math.sin(t*4+i)*t);
                }
                geometry.computeVertexNormals();
                const strip=h.mesh('paper-on-well-rope',geometry,wetPaper,[0,0,0],'yard_well',undefined,false);
                strip.rotation.y=i*1.17;strip.rotation.z=.12+i*.17;
                return strip;
            });
        }
        syncWell(immediate,delta){
            const h=this.house,s=h.story.state,phase=h.watch?.phase;
            this.rimScrap.visible=s.wellEscaped && (phase==='quiet' || (phase==='lowering' && h.watch.time<6.4));
            if(!this.scrapPrint.map && h.watch?.coat?.material?.map){
                this.scrapPrint.map=h.watch.coat.material.map;this.scrapPrint.needsUpdate=true;
                this.scrapPulp.map=h.watch.head.getObjectByName('effigy-painted-face').material.map;
                this.scrapPulp.needsUpdate=true;
            }
            const near=h.controls && !s.memory && s.opened && h.camera.position.distanceToSquared(this.ropeAnchor)<105;
            const folded=s.wellGripOpen;
            const inPursuit=phase==='film' || phase==='chase';
            const target=Number(s.bucketParked && !inPursuit);
            if(!immediate && !near && this.pailLift===target && this.gripWasOpen===folded && phase!=='film')return;
            this.gripWasOpen=folded;
            this.rubberFlap.rotation.x=folded?-2.64:-.22;
            const seated=h.inspectionKind==='wellSeat' && !h.isReading?.();
            const live=near && (seated || !h.isPaused?.()) && phase!=='chase' && phase!=='film';
            if(immediate || phase==='film' || h.reducedMotion?.matches)this.pailLift=target;
            else if(!h.isPaused?.())this.pailLift+=THREE.MathUtils.clamp(target-this.pailLift,-delta*.85,delta*.85);
            const lift=this.pailLift, sweep=THREE.MathUtils.smoothstep(lift,.55,.89);
            const last=this.wellBeat;
            if(live && !s.bucketParked)this.wellBeat=(last+delta)%3.2;
            const beat=this.wellBeat;
            const tap=Math.max(0,1-Math.abs(beat-.54)*3.4, .83-Math.abs(beat-1.18)*3.1);
            const tug=phase==='film'?THREE.MathUtils.smoothstep(h.watch.time,0,.7)*(1-THREE.MathUtils.smoothstep(h.watch.time,.78,1.25)):0;
            const x=-2.75+.085*tap*(1-lift)*(1-tug)-.20*tug;
            this.wellPail.position.set(THREE.MathUtils.lerp(x,-2.48,sweep),
                .37+.66*THREE.MathUtils.smoothstep(lift,0,.55)-.1215*THREE.MathUtils.smoothstep(lift,.89,1)+.29*tug,
                THREE.MathUtils.lerp(-22.01,-21.755,sweep));
            this.wellPail.rotation.z=(.09+.10*tap)*(1-lift)*(1-tug);
            this.wellCrank.rotation.x=-Math.PI*2*THREE.MathUtils.smoothstep(lift,0,.65);
            this.gripSite.position.y=1.61-.211*Math.cos(this.wellCrank.rotation.x);
            this.gripSite.position.z=-22.15-.211*Math.sin(this.wellCrank.rotation.x);
            this.ropeEnd.set(0,.60,0).applyQuaternion(this.wellPail.quaternion).add(this.wellPail.position);
            this.ropePaper.forEach((strip,i)=>{
                strip.visible=phase==='film'?h.watch.time<2.76:!s.wellRopeFreed;
                if(!strip.visible)return;
                strip.position.copy(this.ropeAnchor).lerp(this.ropeEnd,.35+i*.14);
                strip.rotation.x=i===0 ? .17 : 1.08-i*.23;
            });
            this.pailRope.position.copy(this.ropeAnchor).lerp(this.ropeEnd,.5);
            this.ropeEnd.sub(this.ropeAnchor);this.pailRope.scale.y=this.ropeEnd.length();
            this.pailRope.quaternion.setFromUnitVectors(this.ropeUp,this.ropeEnd.normalize());
            if(live && !target && ((last<.54 && beat>=.54)||(last<1.18 && beat>=1.18))){
                const dx=x-h.camera.position.x,dz=-22.01-h.camera.position.z,d=Math.hypot(dx,dz);
                const right=h.camera.matrixWorld.elements;
                h.onWellKnock?.(.42*(1-Math.min(1,d/12))*(beat<1?1:.68),(dx*right[0]+dz*right[2])/Math.max(1,d));
            }
        }
        dressEaves() {
            const h=this.house, m=h.materials;
            // Stagger two courses of fired pan tiles; each course shares a single draw call.
            const tile=new THREE.CylinderGeometry(.13,.15,.78,12,1,true,0,Math.PI);
            tile.rotateZ(Math.PI/2);tile.rotateX(-Math.PI/2);
            const ceramic=new THREE.MeshStandardMaterial({color:0x484a46,roughness:.46,side:THREE.DoubleSide});
            const rows=50, instances=new THREE.InstancedMesh(tile,ceramic,rows*4);
            instances.name='yard-fired-pan-tiles';instances.receiveShadow=true;
            const pose=new THREE.Object3D();let i=0;
            for(const side of [-1,1]) {
                for(let course=0;course<2;course++) {
                    for(let row=0;row<rows;row++) {
                        pose.position.set(side*(4.75+course*.69),3.22+course*.16,-14.25-row*.257-course*.06);
                        pose.rotation.set(0,0,side*.22);pose.updateMatrix();instances.setMatrixAt(i++,pose.matrix);
                    }
                }
                for(let j=0;j<4;j++)
                    h.box('eave-stone-foot',[.38,.22,.38],[side*4.75,.11,-16-j*3.1],m.stone);
            }
            h.scene.add(instances);
            h.box('yard-gate-crossbeam',[3.08,.23,.43],[0,2.94,-27.54],m.darkWood);
            h.box('yard-gate-ridge',[3.42,.10,.9],[0,3.19,-27.53],m.stone);
            for(const side of [-1,1]) {
                h.box('yard-wall-coping',[4.89,.105,.36],[side*3.65,3.12,-27.5],m.stone);
                h.box('yard-wall-plinth',[4.78,.34,.25],[side*3.67,.14,-27.47],m.paving);
                const strut=h.box('yard-gate-knee',[.47,.12,.22],[side*1.12,2.78,-27.43],m.wood);
                strut.rotation.z=side*.48;
            }
        }
        dressStove() {
            const h=this.house, m=h.materials;
            const profile=(points)=>new THREE.LatheGeometry(points.map(p=>new THREE.Vector2(...p)),28);
            const lanternPaper=new THREE.MeshStandardMaterial({color:0xf0d4a0,emissive:0xffa650,emissiveIntensity:.7,roughness:.9});
            h.mesh('kitchen-entry-lantern',profile([[.10,0],[.18,.055],[.20,.20],[.18,.33],[.10,.39]]),lanternPaper,[5.69,1.98,-19.68]);
            for(const y of [1.98,2.37])h.cylinder('entry-lamp-hoop',.115,.115,.043,[5.69,y,-19.68],m.darkWood);
            h.cylinder('entry-lamp-cord',.009,.009,.52,[5.69,2.64,-19.68],m.darkWood);
            const wick=new THREE.PointLight(0xffb96e,4,4.7);wick.position.set(5.59,2.12,-19.85);h.scene.add(wick);
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
                h.label(`bucket-capacity-${i}`, i ? copyText('courtyard.buildwater') : copyText('courtyard.buildwater.2'), [0.28, 0.16], [0, height * 0.55, radius + 0.012], [0, 0, 0], 'water_station', group);
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
            h.label('tank-sign', copyText('courtyard.tank-sign'), [0.38, 0.22], [10.3, 0.65, -22.64], [0, 0, 0], 'water_station');
            const sink = h.box('water-sink', [0.6, 0.12, 0.65], [6.8, 0.32, -22.4], m.stone, 'water_station'); this.target(sink, 'empty');
            for (const side of [-1, 1]) this.target(h.box(`sink-rim-${side}`, [0.05, 0.14, 0.7], [6.8 + side * 0.3, 0.42, -22.4], m.stone, 'water_station'), 'empty');
            h.label('sink-sign', copyText('courtyard.sink-sign'), [0.38, 0.2], [6.8, 0.4, -22.02], [0, 0, 0], 'water_station');
            this.scale = new THREE.Group(); this.scale.position.set(9.4, 1.02, -22.5); h.scene.add(this.scale);
            h.cylinder('scale-base', 0.27, 0.32, 0.08, [0, 0, 0], m.brass, 'water_station', this.scale);
            this.pan = h.cylinder('scale-pan', 0.31, 0.25, 0.06, [0, 0.16, 0], m.brass, 'water_station', this.scale);
            h.box('calibration-plate',[.39,.13,.023],[9.45,.899,-22.218],m.brass,'kitchen_note');
            h.label('scale-inscription',copyText('courtyard.scale-inscription'),[.32,.105],[9.45,.899,-22.204],[0,0,0],'kitchen_note',undefined,'#4d4839','#e4d4af');
            for(const x of [9.272,9.628]) h.mesh('plate-rivet',new THREE.SphereGeometry(.009,8,6),m.brass,[x,.899,-22.204],'kitchen_note');
            h.box('scale-dial-support', [0.06, 0.42, 0.08], [-0.5, 0.14, 0], m.brass, 'water_station', this.scale);
            const dial = h.cylinder('scale-dial', 0.19, 0.19, 0.045, [-0.5, 0.39, 0], m.paper, 'water_station', this.scale);
            dial.rotation.x = Math.PI / 2;
            h.mesh('scale-dial-rim', new THREE.TorusGeometry(0.19, 0.013, 6, 32), m.brass,
                [-0.5, 0.39, 0.027], 'water_station', this.scale);
            for (let mark = 0; mark <= 5; mark++) {
                const tick = h.box(`scale-dial-tick-${mark}`, [0.012, mark === 4 ? 0.055 : 0.028, 0.012],
                    [-0.5 - Math.sin((4 - mark) * 0.26) * 0.145, 0.39 + Math.cos((4 - mark) * 0.26) * 0.145, 0.031],
                    mark === 4 ? m.red : m.darkWood, 'water_station', this.scale, false);
                tick.rotation.z = (4 - mark) * 0.26;
            }
            this.needle = new THREE.Group(); this.needle.name = 'scale-needle'; this.needle.position.set(-0.5, 0.39, 0.045); this.scale.add(this.needle);
            h.box('scale-needle-hand', [0.016, 0.14, 0.012], [0, 0.06, 0], m.darkWood, 'water_station', this.needle, false);
            h.label('scale-dial-key', copyText('courtyard.scale-dial-key'), [0.44, 0.1], [-0.5, 0.14, 0.055], [0, 0, 0], 'water_station', this.scale);
            this.target(this.scale, 'weigh');
            this.drawer = new THREE.Group(); this.drawer.position.set(8.5, 0.66, -22.23); h.scene.add(this.drawer);
            h.box('drawer-front', [1.05, 0.22, 0.08], [0, 0, 0], m.wood, 'water_station', this.drawer);
            h.box('drawer-bottom', [1.05, 0.05, 0.6], [0, -0.09, -0.3], m.darkWood, 'water_station', this.drawer);
            h.box('drawer-handle', [0.19, 0.04, 0.06], [0, 0, 0.07], m.brass, 'water_station', this.drawer);
            this.packetSite=new THREE.Group();this.drawer.add(this.packetSite);
            h.label('appointment-slip',copyText('family.printedStub'),[.48,.29],[.13,-.062,-.34],[-Math.PI/2,0,-.10],'medicine_letter',this.packetSite,'#c59f98','#544340');
            this.letter = h.label('unmailed-letter', copyText('courtyard.unmailed-letter'), [.53,.26], [-.055,-.057,-.33], [-Math.PI / 2,0,.045], 'medicine_letter', this.packetSite,'#bdae89','#3c332c');
            const letterRecord = h.map.interactables.find(item => item.id === 'medicine_letter');
            this.drawerSite=new THREE.Group();this.drawer.add(this.drawerSite);
            letterRecord.targetObject=this.drawerSite;
            this.marker = h.mesh('bucket-selection', new THREE.TorusGeometry(0.31, 0.012, 6, 32),
                new THREE.MeshBasicMaterial({ color: 0xd7b875 }), [7.65, 1, -22.55], undefined, undefined, false);
            this.marker.rotation.x = Math.PI / 2;
        }
        target(object, action) { object.userData.waterAction = action; this.targets.push(object); }
        beginWeigh() {
            const s = this.house.story.state;
            if (this.weighing || !s.opened || s.waterSolved || this.house.inspectionKind !== 'water') return false;
            this.weighing = { time: 0, amount: s.buckets[1], checked: false, accepted: false };
            // Accessibility preference skips travel, but still requires this explicit action.
            if (this.house.reducedMotion?.matches) this.update(2);
            return true;
        }
        cancelWeigh() { this.weighing = null; this.updateScalePose(1); }
        updateScalePose(step) {
            const s = this.house.story.state, trial = this.weighing;
            const ease = value => { const t = Math.max(0, Math.min(1, value)); return t * t * (3 - 2 * t); };
            let load = Number(s.waterSolved), lift = 0;
            if (trial) {
                if (trial.time <= 0.55) { const t = trial.time / 0.55; load = ease(t); lift = Math.sin(Math.PI * t) * 0.32; }
                else if (!trial.accepted && trial.time > 1.3) { const t = (trial.time - 1.3) / 0.55; load = 1 - ease(t); lift = Math.sin(Math.PI * Math.min(1, t)) * 0.32; }
                else load = 1;
            }
            const amount = trial ? trial.amount : s.buckets[1], weight = amount * load;
            const panY = 0.16 - 0.015 * weight;
            this.pan.position.y = panY;
            this.needle.rotation.z = (4 - weight) * 0.26;
            this.buckets.forEach((bucket, i) => {
                const targetX = i === 1 ? THREE.MathUtils.lerp(8.45, 9.4, load) : 7.65;
                const targetY = i === 1 ? THREE.MathUtils.lerp(0.98, 1.02 + panY + 0.03, load) + lift : 0.98;
                const targetZ = i === 1 ? THREE.MathUtils.lerp(-22.55, -22.5, load) : -22.55;
                const move = trial ? 1 : step;
                bucket.position.x += (targetX - bucket.position.x) * move;
                bucket.position.y += (targetY - bucket.position.y) * move;
                bucket.position.z += (targetZ - bucket.position.z) * move;
            });
        }
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
            place('wooden_lantern_01',[.29,.44,.29],[9.83,2.34,-23.47],.25);
            this.wellPail.add(place('wooden_bucket_01',[.48,.60,.48],[0,0,0],.09,'yard_well'));
            place('chinese_console_table', [2.75, 0.98, 1.05], [8.5, 0, -22.75], 0, 'water_station', true);
            place('chinese_cabinet', [1.45, 1.9, 0.7], [7.75, 0, -24.3], 0);
        }
        syncPacket(s){
            this.drawerSite.visible=s.waterSolved && this.drawer.position.z> -21.75;
            this.packetSite.visible=this.drawerSite.visible && !s.familyLetterTaken;
        }
        sync(immediate,delta=0) {
            this.syncMask();
            this.syncWell(immediate,delta);
            this.kitchen.sync(immediate,delta);
            const s = this.house.story.state;
            this.busLights.visible = s.busCalled;
            this.signalBoard.rotation.y = s.busCalled ? -.64 : Math.PI / 2;
            this.syncPacket(s);
            this.marker.visible = this.house.inspectionKind === 'water' && !s.waterSolved;
            if (immediate) {
                this.weighing = null;
                this.releaseProgress = s.waterSolved ? 1 : 0;
                this.house.swingLeaf('yard_gate',this.gate,this.gateSpec,s.waterSolved,0,true);
                this.update(1, true);
            }
        }
        update(delta, immediate = false) {
            if (!immediate && this.house.isReading?.()) return;
            if (!immediate) this.kitchen.updateDrip(delta);
            const s = this.house.story.state;
            const trial = this.weighing;
            if (trial) {
                trial.time = Math.min(1.85, trial.time + (this.house.reducedMotion?.matches ? 2 : Math.max(0, delta)));
                if (!trial.checked && trial.time >= 0.55) {
                    trial.checked = true; trial.accepted = this.house.story.weighWater();
                    this.house.onScaleEvent?.({ phase: 'weighed', success: trial.accepted, amount: trial.amount });
                }
            }
            this.releaseProgress = immediate || this.house.reducedMotion?.matches ? Number(s.waterSolved)
                : Math.max(0, Math.min(1, this.releaseProgress + (s.waterSolved ? 1 : -1) * delta / 0.75));
            if (Math.abs(Number(s.waterSolved) - this.releaseProgress) < 1e-8) this.releaseProgress = Number(s.waterSolved);
            this.updateLinkage();
            const step = immediate || this.house.reducedMotion?.matches ? 1 : Math.min(1, delta * 8);
            this.updateScalePose(step);
            this.buckets.forEach((bucket, i) => {
                const level = this.waterParts[i], capacity = i ? 5 : 3;
                const height = level.userData.levelHeight * s.buckets[i] / capacity;
                level.scale.y += (Math.max(0.002, height) - level.scale.y) * step;
                level.position.y = 0.035 + level.scale.y / 2; level.visible = s.buckets[i] > 0;
            });
            this.drawer.position.z += ((s.waterSolved ? -21.57 : -22.23) - this.drawer.position.z) * step;
            this.busLights.visible = s.busCalled;
            this.signalBoard.rotation.y = s.busCalled ? -.64 : Math.PI / 2;
            this.syncPacket(s);
            const obstacle = this.house.map.obstacles.find(item => item.id === 'open-drawer');
            obstacle.zMin = this.drawer.position.z - 0.68; obstacle.zMax = this.drawer.position.z + 0.11;
            // The opening drawer may gently push the real player/return pose forward; it must not trap them on exit.
            const h = this.house, pose = h.inspectionReturn || h.camera?.position;
            if (pose && h.controls?.clearMovingObstacle(obstacle, pose) && !h.inspectionReturn) h.controls.applyLook();
            if (trial && trial.time >= (trial.accepted ? 1.3 : 1.85)) {
                this.weighing = null;
                this.house.onScaleEvent?.({ phase: 'ready' });
            }
            this.marker.position.x = this.buckets[this.selected].position.x;
        }
        moveGate(delta) {
            this.house.swingLeaf('yard_gate',this.gate,this.gateSpec,this.house.story.state.waterSolved && this.releaseProgress>=1,delta);
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
