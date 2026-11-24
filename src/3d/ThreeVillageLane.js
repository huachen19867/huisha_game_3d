(function (global) {
    const copyText=global.HuishaCopy;
    const { THREE, Huisha3D: game } = global;

    function buildCar(h) {
        const body = new THREE.MeshStandardMaterial({ color: 0x536765, metalness: .62, roughness: .26 });
        const glass = new THREE.MeshStandardMaterial({ color: 0x405153, metalness: .18, roughness: .13, transparent:true, opacity:.52, depthWrite:false });
        const rubber = new THREE.MeshStandardMaterial({ color:0x202224, roughness:.91 });
        const trim = new THREE.MeshStandardMaterial({ color:0xb1b6b4, metalness:.75, roughness:.27 });
        const inside = new THREE.MeshStandardMaterial({color:0x333531,roughness:.94});
        const car = new THREE.Group();
        car.position.set(-2.15, 0, 29.7);
        h.scene.add(car);
        // Each section gives the underside and roof widths of the same cross-section.
        function shell(name, sections, material, splitWindow=false) {
            const positions = [], indices = [], driverPane=[];
            for (const [z, bottom, top, lowWidth, highWidth] of sections) {
                positions.push(-lowWidth,bottom,z, lowWidth,bottom,z, highWidth,top,z, -highWidth,top,z);
            }
            for (let j = 0; j < sections.length - 1; j++) for (let k = 0; k < 4; k++) {
                const a = j * 4 + k, b = j * 4 + (k + 1) % 4;
                const face=splitWindow && k===3 && sections[j+1][0]<=.33 ? driverPane : indices;
                face.push(a,b,b+4, a,b+4,a+4);
            }
            const last = (sections.length - 1) * 4;
            indices.push(0,2,1,0,3,2,last,last+1,last+2,last,last+2,last+3);
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            geometry.setIndex(indices); geometry.computeVertexNormals();
            h.mesh(name, geometry, material, [0,0,0], 'car_envelope', car);
            if(driverPane.length){
                const pane=geometry.clone();pane.setIndex(driverPane);pane.computeVertexNormals();
                h.mesh('driver-window-glass',pane,material,[0,0,0],'car_envelope',car);
            }
        }
        shell('station-wagon', [[-2.18,.38,.73,.83,.87],[-1.64,.64,.91,.83,.94],[-.82,.65,.99,.82,.94],[1.68,.64,.96,.82,.93],[2.15,.43,.87,.85,.86]], body);
        shell('wagon-windows', [[-.91,.95,.99,.94,.92],[-.27,.95,1.51,.95,.76],[.33,.943,1.517,.943,.767],[1.44,.93,1.53,.93,.78],[1.95,.9,1,.87,.86]], glass,true);
        h.box('car-roof',[1.57,.08,1.78],[0,1.54,.6],body,'car_envelope',car);
        const panel = new THREE.Shape();
        panel.moveTo(-2.14,.43); panel.lineTo(-1.72,.38);
        panel.absarc(-1.29,.37,.43,Math.PI,0,true);
        panel.lineTo(.87,.37); panel.absarc(1.3,.37,.43,Math.PI,0,true);
        panel.lineTo(2.12,.43); panel.lineTo(2.11,.83); panel.lineTo(1.67,.935);
        panel.lineTo(-.83,.966); panel.lineTo(-1.67,.89); panel.lineTo(-2.14,.70); panel.closePath();
        const wing=new THREE.ExtrudeGeometry(panel,{depth:.025,bevelEnabled:true,bevelSize:.017,bevelThickness:.016,bevelSegments:3,curveSegments:18});
        const bar=(name,a,b,r,material)=>{
            const start=new THREE.Vector3(...a),delta=new THREE.Vector3(...b).sub(start);
            const mesh=h.mesh(name,new THREE.CylinderGeometry(r,r,delta.length(),10),material,start.addScaledVector(delta,.5).toArray(),undefined,car);
            mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());
        };
        for (const row of [-.17,.86]) for (const x of [-.45,.45]) {
            const cushion=h.mesh('seat-cushion',new THREE.SphereGeometry(1,20,12),inside,[x,.925,row],undefined,car);
            cushion.scale.set(.278,.071,.267);
            const back=h.mesh('seat-back',new THREE.SphereGeometry(1,20,12),inside,[x,1.105,row+.22],undefined,car);
            back.scale.set(.258,.246,.095);back.rotation.x=.12;
            for(const offset of [-.072,.072]) bar('headrest-pin',[x+offset,1.29,row+.23],[x+offset,1.397,row+.24],.009,trim);
            const headrest=h.mesh('headrest',new THREE.SphereGeometry(1,18,12),inside,[x,1.408,row+.246],undefined,car);
            headrest.scale.set(.15,.087,.068);
        }
        h.box('dash',[1.64,.16,.32],[0,1.02,-.67],inside,undefined,car);
        h.mesh('steering-wheel',new THREE.TorusGeometry(.172,.021,9,30),rubber,[-.45,1.145,-.49],undefined,car).rotation.x=-.5;
        const reflectorMat=new THREE.MeshStandardMaterial({color:0xc5beb0,metalness:.65,roughness:.27,side:THREE.DoubleSide,
            emissive:0xffce82,emissiveIntensity:.30,flatShading:true});
        const filament=new THREE.MeshBasicMaterial({color:0xffebbb});
        const indicator=new THREE.MeshStandardMaterial({color:0xaa541c,roughness:.39,emissive:0x9a4617,emissiveIntensity:.27});
        const lensMat=new THREE.MeshStandardMaterial({color:0xe6e2cc,metalness:.09,roughness:.18,transparent:true,opacity:.13,depthWrite:false});
        const reflector=new THREE.LatheGeometry([[.012,0],[.047,.009],[.082,.023],[.099,.044]].map(([r,y])=>new THREE.Vector2(r,y)),20);
        reflector.rotateX(-Math.PI/2);
        const rim=new THREE.TorusGeometry(.099,.004,5,28);
        const bulb=new THREE.SphereGeometry(1,14,8);
        function headlamp(side){
            const housing=new THREE.Group();housing.position.set(side*.576,.67,-2.19);
            housing.rotation.y=-side*.09;car.add(housing);
            const pieces=(name,geo,mat,pos)=>h.mesh(name,geo,mat,pos,'car_front',housing,false);
            h.box('lamp-seal',[.492,.155,.069],[0,0,.007],rubber,'car_front',housing);
            for(const x of [-.114,.088]){
                const center=x*side;
                pieces('fluted-reflector',reflector,reflectorMat,[center,0,-.026]).scale.y=.65;
                pieces('reflector-lip',rim,trim,[center,0,-.071]).scale.y=.65;
                pieces('halogen-bulb',bulb,filament,[center,0,-.045]).scale.set(.027,.016,.021);
            }
            h.box('corner-indicator',[.044,.118,.032],[side*.209,0,-.038],indicator,'car_front',housing);
            h.box('headlight-lens',[.475,.143,.008],[0,0,-.077],lensMat,'car_front',housing,false);
        }
        for (const side of [-1,1]) {
            h.mesh('arched-fender',wing,body,[side*.926,0,0],undefined,car).rotation.y=-Math.PI/2;
            for(const [a,b] of [
                [[side*.937,.96,-.90],[side*.76,1.515,-.27]],[[side*.76,1.515,-.27],[side*.78,1.515,1.44]],
                [[side*.78,1.515,1.44],[side*.875,.94,1.95]],[[side*.94,.96,-.87],[side*.90,.94,1.93]]
            ]) bar('window-surround',a,b,.024,trim);
            for(const pillar of [.33,1.04]){
                bar('door-pillar',[side*.94,.96,pillar],[side*.775,1.52,pillar+.045],.035,rubber);
                bar('door-shut-line',[side*.95,.46,pillar],[side*.95,.929,pillar+.02],.009,rubber);
                h.box('recessed-handle',[.035,.045,.14],[side*.96,.86,pillar-.12],trim,undefined,car);
            }
            h.box('car-rub-strip',[.04,.06,3.65],[side*.958,.61,.08],rubber,'car_envelope',car);
            h.box('side-mirror',[.24,.12,.21],[side*1.025,1.04,-.62],body,'car_envelope',car);
            h.box('roof-rail',[.045,.055,1.52],[side*.69,1.61,.58],trim,'car_envelope',car);
            for (const z of [-1.29,1.3]) {
                const wheel = h.cylinder('road-tire',.36,.36,.19,[side*.91,.36,z],rubber,'car_envelope',car);
                wheel.rotation.z = Math.PI/2;
                h.mesh('rim-edge',new THREE.TorusGeometry(.2,.019,6,24),trim,[side*1.024,.36,z],'car_envelope',car).rotation.y=Math.PI/2;
                h.cylinder('hub',.069,.069,.035,[side*1.025,.36,z],trim,undefined,car).rotation.z=Math.PI/2;
                for(let k=0;k<6;k++){
                    const t=k*Math.PI/3;
                    bar('alloy-spoke',[side*1.025,.36+Math.cos(t)*.064,z+Math.sin(t)*.064],
                        [side*1.028,.36+Math.cos(t+.23)*.19,z+Math.sin(t+.23)*.19],.018,trim);
                }
            }
            const beam=new THREE.SpotLight(0xffebbc,24,12,.31,.78,1.45);
            beam.position.set(side*.65,.66,-2.21);beam.target.position.set(side*.92,-.27,-9.2);
            car.add(beam,beam.target);
            headlamp(side);
            h.box('rear-light',[.31,.18,.05],[side*.67,.71,2.14],new THREE.MeshBasicMaterial({color:0xb54032}),'car_envelope',car);
        }
        for (let slot=0;slot<4;slot++) h.box('grille-louvre',[.66,.017,.037],[0,.57+slot*.04,-2.183],rubber,undefined,car);
        for (const side of [-1,1]) {
            bar('windscreen-wiper',[side*.67,1.034,-.814],[side*.11,1.08,-.77],.012,rubber);
            h.label('wagon-registration',copyText('villagelane.wagon-registration'),[.46,.13],[0,.54,side*(side>0?2.215:2.231)],[0,side>0?0:Math.PI,0],side>0?undefined:'car_front',car,'#20394a','#c8cebd');
        }
        h.box('rear-bumper',[1.75,.11,.12],[0,.44,2.14],rubber,'car_envelope',car);
        const ink=new THREE.MeshStandardMaterial({transparent:true,roughness:.84,depthWrite:false,side:THREE.DoubleSide});
        if(h.renderer?.isWebGLRenderer){
            ink.map=new THREE.TextureLoader().load('assets/art/cheek-impression.svg');
            ink.map.colorSpace=THREE.SRGBColorSpace;h.textures.push(ink.map);
        }
        const dab=h.mesh('wiper-pigment',new THREE.PlaneGeometry(.126,.087),ink,[.452,1.09,-.810],'wiper_print',car,false);
        dab.rotation.set(-2.25,0,Math.PI);
        dab.scale.x=-1; // The mark seen from outside the car is reversed by the first contact.
        h.wiperInk=ink;
        h.box('front-plate-mount',[.484,.143,.03],[0,.54,-2.215],rubber,'car_front',car);
        for(const x of [-.208,.208])h.mesh('number-plate-screw',bulb,trim,[x,.577,-2.232],'car_front',car,false).scale.set(.005,.005,.0025);
        h.box('front-bumper',[1.76,.12,.11],[0,.45,-2.16],rubber,'car_front',car);
        return car;
    }

    // Bake the small timber and masonry details together per building for frustum culling.
    function buildHouse(h, side, x, z, index) {
        const m=h.materials, batches=new Map();
        const root=new THREE.Group();root.position.set(x,0,z);h.scene.add(root);
        const eaves=[3.3,2.82,4.15,3.06][index]+(side>0?.19:0);
        const half=[2.1,1.85,2.28,1.94][index], length=[4.95,5.18,4.64,5.31][index];
        const brick=m.brick||m.plaster, roof=m.roof||m.darkWood;
        function piece(dimensions,position,material,tilt=0) {
            const mesh=h.box('joinery',dimensions,position,material,undefined,root);
            mesh.rotation.z=tilt;mesh.updateMatrix();mesh.geometry.applyMatrix4(mesh.matrix);
            root.remove(mesh);
            if (!batches.has(material)) batches.set(material,[]);
            batches.get(material).push(mesh.geometry);
        }
        piece([half*2,eaves,length],[0,eaves/2,0],index===1?brick:m.plaster);
        piece([half*2+.09,.82,length+.09],[0,.41,0],brick);
        const pitch=.39, ridge=eaves+half*Math.tan(pitch), reach=half+.40;
        for(const slope of [-1,1]) {
            piece([reach/Math.cos(pitch),.16,length+.67],[slope*reach*.5,ridge-reach*.5*Math.tan(pitch)+.08,0],roof,-slope*pitch);
            piece([.12,.16,length+.72],[slope*reach,eaves-.10,0],m.darkWood);
        }
        piece([.21,.20,length+.84],[0,ridge+.14,0],roof);
        for (const end of [-1,1]) {
            // Stepped brick firewalls close the gables and carry their own rain caps.
            for (let j=-2;j<=2;j++) {
                const width=half*2/5, top=ridge+.28-Math.abs(j)*width*Math.tan(pitch);
                piece([width,top-eaves+.1,.19],[j*width,(top+eaves-.1)*.5,end*length*.5],brick);
                piece([width+.05,.085,.28],[j*width,top+.035,end*length*.5],roof);
            }
        }
        const front=-side*half, timber=m.darkWood;
        for(const edge of [-1,1]) piece([.14,eaves,.14],[front,eaves/2,edge*(length*.5-.09)],timber);
        for (let r=0;r<14;r++) piece([.48,.08,.073],[front-side*.19,eaves-.12,-length*.5+r*length/13],timber,-side*pitch);
        const glazing=h.villageGlass[(index+(side>0?1:0))%3];
        for(const bay of [-1,1]) {
            const along=bay*length*.245, center=eaves*.62;
            piece([.07,1.23,1.48],[front-side*.038,center,along],timber);
            piece([.05,1.02,1.28],[front-side*.083,center,along],glazing);
            for (const offset of [-.45,0,.45]) piece([.065,1.07,.045],[front-side*.11,center,along+offset],timber);
            for (const offset of [-.27,.26]) piece([.07,.045,1.32],[front-side*.11,center+offset,along],timber);
            piece([.32,.09,1.62],[front-side*.12,center-.64,along],brick);
        }
        for (const [material,geometries] of batches) {
            const merged=game.mergeGeometries(geometries);
            h.mesh('village-facade',merged,material,[0,0,0],undefined,root);
            geometries.forEach(geometry=>geometry.dispose());
        }
    }

    game.buildVillageLane = function (h) {
        const m = h.materials;
        h.villageGlass=[0x997447,0x435253,0x4e4c3d].map((color,i)=>new THREE.MeshStandardMaterial({
            color, emissive:color, emissiveIntensity:i===0?.52:.08, roughness:.32, metalness:.18
        }));
        const wetPaving = m.paving.clone(); wetPaving.color.setHex(0x878f90); wetPaving.roughness = .46;
        h.box('lane-paving',[7.4,.15,29],[0,-.08,19.55],wetPaving);
        const drops = [];
        for (let i=0; i<370; i++) {
            const x = Math.sin(i*71.37)*3.58, z = 5.3+(i*7.713)%28.5, y = (i*.697)%5;
            drops.push(x,y,z,x+.018,y-.11,z);
        }
        const rainGeometry = new THREE.BufferGeometry();
        rainGeometry.setAttribute('position', new THREE.Float32BufferAttribute(drops,3));
        h.laneRain = new THREE.LineSegments(rainGeometry, new THREE.LineBasicMaterial({color:0xadbdc7,transparent:true,opacity:.23,depthWrite:false}));
        h.scene.add(h.laneRain);
        const moon=new THREE.DirectionalLight(0xabc6da,.83);
        moon.position.set(-12,16,30);moon.target.position.set(0,0,19);
        moon.castShadow=true;moon.shadow.mapSize.set(1024,1024);
        Object.assign(moon.shadow.camera,{left:-14,right:14,top:17,bottom:-17,far:55});
        moon.shadow.camera.updateProjectionMatrix();moon.shadow.bias=-.0005;moon.shadow.normalBias=.035;
        h.scene.add(moon,moon.target);
        h.box('porch-step',[2,.15,1.1],[0,-.07,4.65],m.stone);
        for (const side of [-1,1]) {
            h.box('front-plaster',[4,3.4,.22],[side*3,1.6,4.43],m.plaster);
            h.box('front-stoop-wing',[2.65,.68,.75],[side*2.325,.31,4.75],m.wellStone || m.stone);
            h.box('lane-wall',[.22,1.12,29],[side*3.72,.54,19.55],m.brick||m.plaster);
            h.box('lane-wall-cap',[.36,.1,29],[side*3.72,1.13,19.55],m.roof||m.darkWood);
            for (let i=0; i<4; i++) {
                const z = 8+i*6.5+side*.7, x = side*(6.1+i%2);
                buildHouse(h, side, x, z, i);
            }
        }
        const cable=new THREE.MeshStandardMaterial({color:0x23282a,roughness:.88});
        for (const poleZ of [8.3,20,32]) {
            h.cylinder('utility-pole',.084,.16,6.1,[-4.03,3.03,poleZ],m.stone);
            h.box('crossarm',[1.47,.1,.12],[-4.03,5.74,poleZ],m.darkWood);
            for (const dx of [-.54,.05,.59]) {
                h.cylinder('porcelain-insulator',.067,.087,.17,[-4.03+dx,5.87,poleZ],m.paper);
                if (poleZ===32) continue;
                const end=poleZ===8.3?20:32, wireX=-4.03+dx;
                const curve=new THREE.QuadraticBezierCurve3(new THREE.Vector3(wireX,5.94,poleZ),
                    new THREE.Vector3(wireX+.12,4.85,(poleZ+end)/2),new THREE.Vector3(wireX,5.94,end));
                h.mesh('service-wire',new THREE.TubeGeometry(curve,14,.014,5,false),cable,[0,0,0],undefined,undefined,false);
            }
        }
        h.box('front-lintel',[2,.52,.28],[0,3.08,4.45],m.darkWood);
        h.frontDoorSpec=h.map.extraDoors.find(door=>door.id==='front');
        h.frontHinge=new THREE.Group();
        h.frontHinge.position.set(h.frontDoorSpec.hingeX,0,h.frontDoorSpec.hingeZ); h.scene.add(h.frontHinge);
        h.frontDoor = h.box('village-front-door',[2,2.84,.2],[1,1.42,0],m.darkWood,'front_gate',h.frontHinge);
        for(const y of [.42,2.42]) {
            h.box('gate-hinge-strap',[.23,.046,.013],[-.89,y-1.42,.107],m.brass,'front_gate',h.frontDoor);
            h.cylinder('gate-hinge-pin',.019,.019,.125,[-.992,y-1.42,.108],m.brass,'front_gate',h.frontDoor);
        }
        h.label('old-number',copyText('villagelane.old-number'),[.57,.45],[1.41,1.78,4.56],[0,0,0],'front_gate',undefined,'#304745','#e2e2bc');
        h.box('front-handle',[.08,.23,.06],[.45,-.15,.12],m.brass,'front_gate',h.frontDoor);
        h.cylinder('front-key-escutcheon',.04,.04,.012,[.45,-.33,.108],m.brass,'front_gate',h.frontDoor).rotation.x=Math.PI/2;
        h.box('front-keyway',[.009,.027,.004],[.45,-.335,.117],m.cloth,'front_gate',h.frontDoor);
        h.box('carpenter-chalk',[.16,.007,.003],[-.63,-.93,.103],m.paper,'front_gate',h.frontDoor).rotation.z=.07;
        h.box('landslide-barrier',[7.3,.82,.24],[0,.4,34.14],m.stone);
        h.label('landslide-sign',copyText('villagelane.landslide-sign'),[2,.4],[0,.58,34],[0,Math.PI,0],undefined,undefined,'#593c31','#ffdfa5');
        for (const slope of [-1,1]) {
            h.box('gate-eave',[10.45,.18,1.07],[0,3.51,4.4+slope*.48],m.roof||m.darkWood).rotation.x=slope*.36;
            h.box('gate-fascia',[10.46,.12,.14],[0,3.32,4.4+slope*.96],m.darkWood);
        }
        h.box('gate-ridge',[10.61,.18,.21],[0,3.73,4.4],m.brick||m.stone);
        for (const x of [-1.14,1.14]){
            h.box('gate-doorpost',[.21,2.96,.27],[x,1.46,4.60],m.wood,'front_gate');
            h.box('gate-foot',[.33,.42,.37],[x,.21,4.62],m.wellStone||m.stone,'front_gate');
        }
        h.box('duty-counter',[1,1.02,2.4],[3.1,.51,21],m.wood,'duty_book');
        h.box('booth-back',[.16,2.67,3.13],[4.22,1.33,21],m.brick||m.plaster);
        for (const end of [-1,1]) {
            h.box('booth-post',[.13,2.66,.13],[2.62,1.33,21+end*1.55],m.darkWood);
            h.box('booth-side',[1.52,1.02,.12],[3.47,.5,21+end*1.53],m.brick||m.plaster);
        }
        h.box('counter-edge',[1.12,.09,2.55],[3.1,1,21],m.darkWood,'duty_book');
        h.box('work-order-board',[.40,.028,.48],[2.94,1.065,20.22],m.wood,'repair_order');
        h.label('work-order-form',copyText('workorder.tag'),[.42,.34],[2.94,1.082,20.22],[-Math.PI/2,0,Math.PI/2],'repair_order',undefined,'#c1b18a','#474238');
        h.repairNote=h.label('carpenter-note',copyText('workorder.noteTag'),[.27,.18],[2.87,1.087,20.24],[-Math.PI/2,0,Math.PI/2+.06],'repair_order',undefined,'#e2d7bd','#34342e');
        h.box('work-order-clip',[.04,.015,.14],[3.09,1.085,20.22],m.brass,'repair_order');
        h.box('logbook-cover',[.56,.025,.84],[2.99,1.063,21.1],m.cloth,'duty_book');
        h.parkingNote=h.label('parking-handover',copyText('bridge.parkingWriting',copyText('villagelane.wagon-registration')),
            [.28,.13],[3.11,1.048,21.69],[-Math.PI/2,0,Math.PI/2-.08],'duty_book',undefined,'#dbcdac','#30302d');
        h.cylinder('tea-mug',.074,.068,.14,[3.22,1.12,21.73],m.paper,'duty_book');
        h.mesh('mug-handle',new THREE.TorusGeometry(.048,.011,7,16),m.paper,[3.22,1.13,21.81],'duty_book').rotation.y=Math.PI/2;
        const phone=new THREE.Group();phone.position.set(3.18,1.046,19.92);phone.rotation.y=-.24;h.scene.add(phone);
        h.box('booth-telephone',[.20,.053,.205],[0,.027,0],m.cloth,'clerk',phone);
        h.box('phone-receiver',[.055,.031,.18],[-.065,.083,0],m.darkWood,'clerk',phone);
        for(const z of [-.073,.073])h.box('receiver-end',[.065,.043,.053],[-.065,.071,z],m.darkWood,'clerk',phone);
        for(let row=0;row<4;row++)for(let col=0;col<3;col++){
            h.box('telephone-key',[.017,.009,.014],[.006+col*.023,.057,-.035+row*.023],m.paper,'clerk',phone);
        }
        game.buildClerk(h);
        h.box('duty-canopy',[2.4,.15,3.4],[3.52,2.79,21],m.roof||m.darkWood);
        h.label('duty-sign',copyText('housemap.clerk_holdall.location'),[1.64,.42],[2.66,2.55,21],[0,-Math.PI/2,0],'duty_book');
        h.label('open-ledger',copyText('villagelane.open-ledger'),[.69,.46],[2.99,1.079,21.1],[-Math.PI/2,0,Math.PI/2],'duty_book');
        const cabinet=new THREE.Group();
        cabinet.position.set(3.48,1.57,21.82); cabinet.rotation.y=-Math.PI/2; h.scene.add(cabinet);
        for (const x of [-.42,.42]) h.box('key-stand-foot',[.052,.23,.13],[x,-.42,0],m.wood,'key_board',cabinet);
        h.box('key-board',[1.06,.65,.09],[0,0,0],m.darkWood,'key_board',cabinet);
        h.label('key-sign',copyText('villagelane.key-sign'),[.74,.13],[0,.21,.051],[0,0,0],'key_board',cabinet);
        for (let i=0;i<3;i++) {
            const x=(i-1)*.31, number=[9,6,16][i], key=new THREE.Group();
            key.position.set(x,.01,.094); cabinet.add(key);
            if (number===6) h.houseKey=key;
            h.mesh('key-ring',new THREE.TorusGeometry(.039,.007,8,20),m.brass,[0,0,0],'key_board',key);
            h.box('key-shaft',[.018,.101,.011],[-.018,-.078,.003],m.brass,'key_board',key).rotation.z=-.16;
            for (const y of [-.109,-.126]) h.box('key-tooth',[.029,.009,.014],[-.015,y,.003],m.brass,'key_board',key);
            h.label('hanging-key-tag',String(number),[.083,.092],[.046,-.064,.014],[0,0,.13],'key_board',key,'#a78150','#271b13');
            h.box('key-peg',[.018,.018,.066],[x,.047,.073],m.brass,'key_board',cabinet);
        }
        h.box('lane-repair-post',[.08,1.65,.08],[-3.52,.825,11.5],m.wood);
        h.box('lane-repair-board',[.06,.41,.83],[-3.46,1.37,11.5],m.darkWood);
        h.label('lane-repair-contact',copyText('villagelane.lane-repair-contact'),[.78,.36],[-3.425,1.37,11.5],[0,Math.PI/2,0],undefined,undefined,'#aca998','#283c37');
        for (const [x,z] of [[2.94,21],[-3.26,11.5],[1.2,4.85]]) {
            const light = new THREE.PointLight(0xffca83,5,7,1.65);
            light.position.set(x-.26,2.14,z); h.scene.add(light);
            h.box('porch-lamp',[.09,.14,.09],[x,2.37,z],new THREE.MeshBasicMaterial({color:0xffda9a}));
        }
        h.villageCar=buildCar(h);
    };
})(window);
