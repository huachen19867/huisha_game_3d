import * as T from '../vendor/three.module.mjs';

const smooth = T.MathUtils.smoothstep;
const laneX = z => 2.3 * Math.sin(z / 32) + 0.8 * Math.sin(z / 15);
const heading = z => Math.atan(2.3 / 32 * Math.cos(z / 32) + 0.8 / 15 * Math.cos(z / 15));

// The film owns its camera, road, lights and poses. Borrowed prop geometry stays in the playable scene.
export function drivingScene(house) {
    const film = new T.Scene();
    const camera = new T.PerspectiveCamera(57,1,.035,165);
    film.background = house.nightSky || new T.Color(0x25353d);
    film.backgroundIntensity=.38;
    film.fog = new T.FogExp2(0x27353b,.021);
    film.environment = house.scene.environment;
    film.add(new T.HemisphereLight(0xc9dbdf,0x56564b,1.42));
    const moon = new T.DirectionalLight(0xb4d4ea,2.0);
    moon.position.set(-15,18,-9);
    film.add(moon);
    const owned = new Set();
    const own = resource => { owned.add(resource); return resource; };
    const basic = color => own(new T.MeshBasicMaterial({color}));
    const standard = (color,roughness) => own(new T.MeshStandardMaterial({color,roughness}));
    const box = own(new T.BoxGeometry());
    const transform = new T.Object3D();
    const batch = (geometry, material, placements) => {
        const mesh = new T.InstancedMesh(geometry,material,placements.length);
        for (const [i,[x,y,z,sx,sy,sz,turn=0]] of placements.entries()) {
            transform.position.set(x,y,z); transform.scale.set(sx,sy,sz);
            transform.rotation.set(0,turn,0); transform.updateMatrix();
            mesh.setMatrixAt(i,transform.matrix);
        }
        mesh.computeBoundingSphere(); film.add(mesh); owned.add(mesh);
        return mesh;
    };
    const roadMaterial = own(house.materials.paving.clone());
    roadMaterial.color.setHex(0x424b4f); roadMaterial.roughness=.40; roadMaterial.normalScale.setScalar(.23);
    const positions=[],uv=[],indices=[],dashes=[],posts=[],reflectors=[],rails=[],hills=[];
    for(let i=0;i<=165;i++){
        const z=36-i*2, x=laneX(z);
        positions.push(x-3.55,0,z,x+3.55,0,z);
        uv.push(0,i*.55,1.9,i*.55);
        if(i<165) { const j=i*2; indices.push(j,j+1,j+2,j+1,j+3,j+2); }
        if(i%4===0)dashes.push([x,.012,z,.095,.015,1.8,heading(z)]);
        if(i%3===0)for(const side of [-1,1]){
            const edge=x+side*3.7;
            posts.push([edge,.38,z,.19,.79,.19]);
            reflectors.push([edge,.65,z+.102,.115,.075,.014]);
            if(z<-145)rails.push([edge,.51,z-3,.14,.22,6.08,heading(z)]);
        }
        if(i%5===0)for(const side of [-1,1]){
            hills.push([x+side*(42+7*Math.cos(i)),-.7,z,19+5*Math.sin(i),4+2.5*Math.cos(i*.8),15,i]);
        }
    }
    const road=own(new T.BufferGeometry());
    road.setAttribute('position',new T.Float32BufferAttribute(positions,3));road.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
    road.setIndex(indices);road.computeVertexNormals();film.add(new T.Mesh(road,roadMaterial));
    batch(box,standard(0x252e2b,.88),[[0,-.23,-130,155,.38,340]]);
    batch(box,standard(0xb6aa85,.52),dashes);
    batch(box,house.materials.wellStone || house.materials.stone,posts);
    batch(box,basic(0xceb47a),reflectors);
    batch(box,house.materials.stone,rails);
    batch(own(new T.IcosahedronGeometry(1,1)),standard(0x213530,.98),hills);
    const homes=new Set();
    house.scene.traverse(o=>{if(o.name==='village-facade')homes.add(o.parent);});
    [...homes].forEach((original,i)=>{
        for(let row=0;row<3;row++){
            const cottage=original.clone();const z=4-i*8-row*67;
            cottage.position.set(laneX(z)+(i%2?1:-1)*(9+i%3),0,z);
            film.add(cottage);
        }
    });
    const shrubs=house.scene.getObjectByName('shrub_02');
    const trunks=[], poles=[], wires=[];
    for(let j=0;j<42;j++){
        const z=12-j*7,side=j%2?1:-1,x=laneX(z)+side*(6.2+1.1*Math.sin(j*7));
        trunks.push([x,2.1,z,.18,4.25,.19,j]);
    }
    batch(own(new T.CylinderGeometry(.55,1,1,8)),house.materials.darkWood,trunks);
    for(let i=0;i<17;i++){
        const z=18-i*18,x=laneX(z)-4.8;
        poles.push([x,2.95,z,.17,5.92,.17],[x,5.64,z,1.55,.13,.12]);
        if(i<16){
            for(const dx of [-.55,.35]){
                for(let k=0;k<7;k++){
                    const a=k/7,b=(k+1)/7;
                    for(const u of [a,b])wires.push(x+dx+(laneX(z-18)-laneX(z))*u,5.8-.57*Math.sin(u*Math.PI),z-18*u);
                }
            }
        }
    }
    batch(box,standard(0x574b40,.94),poles);
    const wireGeo=own(new T.BufferGeometry());wireGeo.setAttribute('position',new T.Float32BufferAttribute(wires,3));
    film.add(new T.LineSegments(wireGeo,own(new T.LineBasicMaterial({color:0x171b19}))));
    const bushes=[];
    function updateFoliage(z){
        if(!bushes.length && shrubs?.children[0]?.getObjectByProperty('isMesh',true)){
            for(let i=0;i<22;i++){const bush=shrubs.clone();film.add(bush);bushes.push(bush);}
        }
        const first=Math.floor((12-z)/7)-2;
        bushes.forEach((bush,i)=>{
            const j=first+Math.floor(i/2);
            bush.visible=j>=0 && j<trunks.length;
            if(!bush.visible)return;
            const [x,,pz]=trunks[j],canopy=i%2===0;
            const k=canopy ? 3.7+.65*Math.cos(j) : .9+.35*Math.sin(j);
            bush.position.set(x+(canopy?0:Math.sign(x)*-.9),canopy?3.45:0,pz+(canopy?0:1.6));
            bush.rotation.y=j*1.74;
            bush.scale.set(k,canopy?k*.73:k,k);
        });
    }
    const car=house.villageCar.clone();
    car.name='film-wagon'; film.add(car);
    // SpotLight.clone creates an unattached target. Aim each headlamp from its own axle.
    for(const lamp of car.children.filter(o=>o.isSpotLight)){
        lamp.target.position.set(lamp.position.x*1.9,.06,-21);
        lamp.distance=46;lamp.angle=.49;lamp.intensity=126;lamp.decay=1.25;car.add(lamp.target);
    }
    car.children.filter(o=>o.name==='wiper-pigment').forEach(o=>o.visible=false);
    const cabinPart=(name,geo,mat,x,y,z,parent=car)=>{
        const mesh=new T.Mesh(geo,mat);mesh.name=name;mesh.position.set(x,y,z);parent.add(mesh);return mesh;
    };
    const rubber=standard(0x222524,.73), amber=basic(0xdfa264);
    const wipers=[-.72,.09].map(x=>{
        const mount=new T.Group();mount.position.set(x,1.001,-.90);mount.rotation.x=.81;car.add(mount);
        const pivot=new T.Group();mount.add(pivot);
        const arm=cabinPart('wiper-arm',box,rubber,.17,0,.012,pivot);arm.scale.set(.34,.011,.009);
        const blade=cabinPart('wiper-blade',box,rubber,.40,0,.014,pivot);blade.scale.set(.35,.022,.011);
        return pivot;
    });
    const driver=new T.Group();driver.position.set(-.45,.90,-.15);car.add(driver);
    const coat=standard(0x292d2c,.95),hair=standard(0x242222,.88);
    const ellipsoid=own(new T.SphereGeometry(1,18,14));
    const shoulder=cabinPart('driver-shoulders',ellipsoid,coat,0,.26,.02,driver);shoulder.scale.set(.226,.218,.131);
    const skull=cabinPart('driver-head',ellipsoid,hair,0,.46,-.015,driver);skull.scale.set(.095,.121,.101);
    const shade=cabinPart('wheel-contact-shadow',own(new T.PlaneGeometry(1,1)),own(new T.MeshBasicMaterial({color:0x0a0e0d,transparent:true,opacity:.35,depthWrite:false})),0,.007,0);
    shade.rotation.x=-Math.PI/2;shade.scale.set(1.67,3.71,1);
    const dialGeo=own(new T.RingGeometry(.035,.039,28));
    for(const x of [-.48,-.38]){
        cabinPart('instrument-dial',dialGeo,amber,x,1.085,-.50);
        const needle=cabinPart('dial-needle',box,amber,x,1.086,-.496);needle.scale.set(.034,.003,.002);needle.rotation.z=.57;
    }
    const wheel=car.getObjectByName('steering-wheel');
    const radio=cabinPart('radio-display',box,amber,.015,1.075,-.498);
    radio.scale.set(.132,.016,.004);
    const figure=house.watch.root.clone();
    film.add(figure);
    const head=figure.getObjectByName('pasted-head-shell')?.parent;
    // The well rig normally poses these loose joints in its chase update.
    figure.children.filter(o=>o.name==='folded-shoulder'||o.name==='paper-sleeve'||o.children.some(c=>c.name==='paper-mitten')).forEach((o,i)=>{
        const side=i<3?-1:1, part=i%3;
        o.position.set(side*(.27+.045*part),1.04-part*.24,.025+part*.038);
        if(part<2){o.scale.y=.25;o.rotation.z=side*.14;}
    });
    const flash=new T.PointLight(0xffd19a,0,7,1.1);film.add(flash);
    const rainPoints=[];
    for(let i=0;i<540;i++){
        const x=((i*97)%251)/251*19-9.5, y=((i*71)%239)/239*7, z=-((i*53)%233)/233*17;
        rainPoints.push(x,y,z,x+.018,y-.145,z+.045);
    }
    const rainGeo=own(new T.BufferGeometry());rainGeo.setAttribute('position',new T.Float32BufferAttribute(rainPoints,3));
    const rain=new T.LineSegments(rainGeo,own(new T.LineBasicMaterial({color:0x9eadb4,transparent:true,opacity:.28,depthWrite:false})));film.add(rain);
    const eye=new T.Vector3(),target=new T.Vector3();
    return {
        draw(t, beats, reduced) {
            const {inside,cut,scare,impact,wake,end}=beats;
            const aspect=house.root.clientWidth/Math.max(1,house.root.clientHeight);
            const progress=Math.min(t,impact);
            const z=4-6.9*progress;
            const dodge=smooth(t,scare+.22,impact);
            car.position.set(laneX(z)+1.22-.50*dodge,.012,z);
            car.rotation.set(.006*Math.sin(t*6)+.035*dodge,heading(z)+.20*dodge,reduced?0:-.048*dodge);
            car.updateMatrixWorld(true);
            driver.visible=t<inside;updateFoliage(z);
            film.environment=house.scene.environment;
            for(const pivot of wipers)pivot.rotation.z=.10+1.35*(.5-.5*Math.cos(t*4.8));
            radio.visible=t<cut;
            wheel.visible=t<inside;
            const strikeZ=4-6.9*impact;
            const rush=smooth(t,scare,impact);
            figure.visible=t>cut-.45 && t<=impact-.27;
            figure.position.set(laneX(strikeZ)+1.05,.025-.22*rush,strikeZ-1.5+.74*rush);
            figure.rotation.set(-.16*rush,0,.045);if(head)head.rotation.z=-.08-.14*rush;
            flash.position.set(car.position.x,1.22,z-1.25);flash.intensity=.30+.8*rush;
            if(t<inside){
                const u=smooth(t,0,inside);
                eye.set(-3.1-u*1.1,1.0+u*.48,4.9-u*2.25);target.set(0,.87,-1.35);
            }else{
                const gl=smooth(t,inside,inside+2.5);
                eye.set(-.43,1.39+.01*Math.sin(t*6)*(reduced?0:1),-.20);
                target.set(.18-.54*gl,1.01+.31*gl,-1.13-gl*5.5);
                if(t>scare)target.x-=.28*dodge;
            }
            car.localToWorld(eye);car.localToWorld(target);
            camera.position.copy(eye);camera.lookAt(target);
            camera.aspect=aspect;camera.fov=t<inside?50:69;camera.updateProjectionMatrix();
            rain.position.set(camera.position.x,-(t*3.4%1.3),camera.position.z+1);
            if(t<wake){house.renderer.render(film,camera);return;}
            const lift=smooth(t,wake,end);
            camera.position.set(.15,1.34+.26*lift,31.1);
            camera.lookAt(2.7,1.15+.43*lift,21.3);
            const visible=house.homeRoot.visible;
            house.homeRoot.visible=true;
            try{house.renderer.render(house.scene,camera);}finally{house.homeRoot.visible=visible;}
        },
        dispose(){for(const resource of owned)resource.dispose();}
    };
}
