(function(global){
    const copyText=global.HuishaCopy;
    const {THREE,Huisha3D:game}=global, world=game.WORLD_MAP;
    const flights=[
        {id:'attic',x:-10.2,level:2.52,title:copyText('storeys.attic.title'),requires:'opened'},
        {id:'cellar',x:-15.2,level:-2.4,title:copyText('storeys.cellar.title'),requires:'cellarOpen'}
    ];
    const bottom=-15, landing=-9.5, end=-4.8, half=1.85, stairHalf=.76, steps=15;
    for(const f of flights){
        world.walkable.push({id:f.id+'_steps',title:f.title+copyText('storeys.title'),xMin:f.x-stairHalf,xMax:f.x+stairHalf,zMin:bottom-.12,zMax:landing+.12,requiresState:f.requires},
            {id:f.id,title:f.title,xMin:f.x-half,xMax:f.x+half,zMin:landing,zMax:end,requiresState:f.requires});
    }
    // Camera, saved poses and interaction rays share the elevation of the visible treads.
    game.storeyHeight=(x,z)=>{
        if(z<bottom || z>end) return 0;
        const flight=flights.find(f=>Math.abs(f.x-x)<=half);
        return flight ? flight.level*Math.min(steps,1+Math.floor((z-bottom)/(landing-bottom)*steps))/steps : 0;
    };
    const addSite=(id,title,area,x,y,z,text,requiresState)=>{
        world.interactables.push({id,title,area,location:{attic:copyText('storeys.attic.title'),cellar:copyText('storeys.cellar.title'),workshop:copyText('storeys.addsite.workshop')}[area],position:{x,y,z},text,radius:2.15,requiresOpen:true,requiresState});
    };
    addSite('cellar_door',copyText('storeys.text'),'workshop',-15.2,1.21,-15.15,copyText('storeys.text.2'),'wardrobeOpen');
    addSite('attic_winch',copyText('storeys.text.3'),'attic',-11.62,3.57,-6.75,copyText('storeys.text.4'),'opened');
    addSite('sump_grate',copyText('storeys.text.5'),'cellar',-16.46,-1.97,-5.51,copyText('storeys.text.6'),'cellarOpen');
    addSite('sump_pump',copyText('storeys.text.7'),'cellar',-13.83,-1.45,-6.87,copyText('storeys.text.8'),'cellarOpen');
    addSite('cellar_keyring',copyText('storeys.text.9'),'cellar',-16.32,-1.92,-6.53,copyText('storeys.text.10'),'sumpDrained');
    world.obstacles.push({id:'cellar-rack',xMin:-15.48,xMax:-14.30,zMin:-5.38,zMax:-4.85,requiresState:'cellarOpen'},{id:'attic-crates',xMin:-11.02,xMax:-9.49,zMin:-5.55,zMax:-4.92,requiresState:'opened'},{id:'sump-trough',xMin:-16.98,xMax:-16.19,zMin:-7.18,zMax:-5.17,requiresState:'cellarOpen'});
    game.buildStoreys=h=>{
        const m=h.materials, brick=m.brick||m.stone;
        const box=(name,size,position,mat,item,parent)=>h.box(name,size,position,mat,item,parent);
        // The two cut-outs are in the same west-wing wall as the real staircase mouths.
        let left=-17.61;
        for(const x of [-15.2,-10.2,-5.96+stairHalf]){
            const right=x-stairHalf;
            box('west-partition',[right-left,3.08,.2],[(left+right)/2,1.5,-14.9],m.plaster);
            if(x < -6){
                box('stair-door-head',[stairHalf*2,.41,.2],[x,2.82,-14.9],m.darkWood);
                for(const side of [-1,1]) box('stair-jamb',[.10,2.65,.25],[x+side*(stairHalf+.04),1.32,-14.9],m.darkWood);
            }
            left=x+stairHalf;
        }
        for(const f of flights){
            const dx=(landing-bottom)/steps, mat=f.level>0?m.floor:brick;
            for(let i=0;i<steps;i++){
                const y=(i+1)*f.level/steps,z=bottom+(i+.5)*dx;
                box('stair-tread',[stairHalf*2,.20,dx+.014],[f.x,y-.10,z],mat);
            }
            const middle=(bottom+landing)/2, slope=-Math.atan2(f.level,landing-bottom), length=Math.hypot(f.level,landing-bottom);
            for(const side of [-1,1]){
                box('stair-stringer',[.11,.24,length],[f.x+side*.72,f.level*.5-.09,middle],m.darkWood).rotation.x=slope;
                box('stair-side-wall',[.17,3.25,length+.15],[f.x+side*.85,1.45+f.level*.5,middle],mat).rotation.x=slope;
                box('stair-handrail',[.055,.068,length],[f.x+side*.693,.91+f.level*.5,middle],m.darkWood).rotation.x=slope;
            }
            box('stair-roof',[1.84,.15,length+.12],[f.x,2.85+f.level*.5,middle],m.darkWood).rotation.x=slope;
            const c=(end+landing)/2,depth=end-landing, floor=f.level;
            box('storey-landing',[2*half+.25,.18,depth+.18],[f.x,floor-.09,c],f.level>0?m.floor:m.paving);
            box('storey-end-wall',[2*half+.22,2.7,.18],[f.x,floor+1.35,end+.09],mat);
            for(const side of [-1,1]){
                box('storey-side-wall',[.18,2.7,depth],[f.x+side*(half+.09),floor+1.35,c],mat);
                box('storey-entry-wing',[half-stairHalf,2.7,.15],[f.x+side*(half+stairHalf)*.5,floor+1.35,landing],mat);
            }
            h.label('stair-sign',f.title,[.69,.25],[f.x,2.36,-15.015],[0,Math.PI,0],f.id==='cellar'?'cellar_door':undefined);
            const light=new THREE.PointLight(f.level>0?0xe8b57c:0xb3d2ce,7,7,1.65);
            light.position.set(f.x+.4,floor+2.2,c);h.scene.add(light);
            if(f.level>0){
                h.cylinder('bulb-cord',.008,.008,.50,[f.x+.4,floor+2.65,c],m.cloth);
                h.cylinder('bulb-holder',.043,.043,.085,[f.x+.4,floor+2.38,c],m.stone);
                h.mesh('storey-bulb',new THREE.SphereGeometry(.062,16,12),new THREE.MeshBasicMaterial({color:0xffe7ae}),[f.x+.4,floor+2.30,c]);
            }
            if(f.level<0) box('cellar-ceiling',[3.95,.18,depth+.2],[f.x,floor+2.67,c],m.stone);
            else for(const side of [-1,1]){
                box('loft-roof',[2.33,.15,depth+.47],[f.x+side*.99,floor+2.55,c],m.roof||m.darkWood).rotation.z=-side*.36;
                for (const z of [landing+.37,c,end-.27])
                    box('loft-rafter',[2.23,.13,.13],[f.x+side*.99,floor+2.42,z],m.darkWood).rotation.z=-side*.36;
            }
        }
        // Open the door away from the stair, retaining the iron hardware in view.
        h.cellarDoor=new THREE.Group();h.cellarDoor.position.set(-15.96,0,-14.99);h.scene.add(h.cellarDoor);
        box('cellar-door-leaf',[1.5,2.34,.11],[.75,1.17,0],m.darkWood,'cellar_door',h.cellarDoor);
        for(const y of [.36,1.85]) box('strap-hinge',[.8,.07,.032],[.43,y,-.069],m.stone,'cellar_door',h.cellarDoor);
        h.box('padlock',[.12,.14,.07],[1.34,1.11,-.092],m.brass,'cellar_door',h.cellarDoor);
        h.atticBasket=new THREE.Group();h.atticBasket.position.set(-11.52,0,-6.68);h.scene.add(h.atticBasket);
        h.paperParcel=box('ritual-parcel',[.34,.12,.24],[0,.14,0],m.paper,'attic_winch',h.atticBasket);
        h.basketCord=h.cylinder('basket-cord',.012,.012,1,[-11.52,4.42,-6.68],m.wood,'attic_winch');
        box('rope-cleat',[.13,.12,.19],[-11.88,3.54,-6.75],m.brass,'attic_winch');
        // The cord runs from the basket to the pulley, then down the wall to the cleat.
        h.mesh('hoist-pulley',new THREE.TorusGeometry(.079,.022,10,24),m.brass,[-11.52,4.96,-6.68]);
        h.cylinder('rope-tail',.01,.01,1.42,[-11.63,4.24,-6.68],m.wood).rotation.z=-.13;
        h.cylinder('hanging-rope-coil',.063,.064,.13,[-11.84,3.48,-6.73],m.wood).rotation.z=Math.PI/2;
        for(const side of [-1,1]){
            const sling=h.cylinder('basket-sling',.009,.009,.39,[side*.16,.32,0],m.wood,'attic_winch',h.atticBasket);
            sling.rotation.z=side*.87;
        }
        // The trough, intake and outlet show where the water goes when pumped.
        box('sump-bed',[.81,.18,2.0],[-16.58,-2.29,-6.22],m.stone);
        for(const x of [-16.96,-16.2]) box('sump-rim',[.08,.56,2.01],[x,-2.08,-6.22],m.stone,'sump_grate');
        for(const z of [-7.18,-5.26]) box('sump-rim',[.81,.56,.08],[-16.58,-2.08,z],m.stone,'sump_grate');
        const coping=m.wellStone||m.stone;
        for(const x of [-16.96,-16.2]) box('trough-coping',[.092,.051,2.06],[x,-1.80,-6.22],coping,'sump_grate');
        for(const z of [-7.18,-5.26]) box('trough-coping',[.80,.051,.09],[-16.58,-1.80,z],coping,'sump_grate');
        h.sumpSurface=box('sump-water',[.68,.02,1.82],[-16.58,-1.866,-6.22],new THREE.MeshStandardMaterial({color:0x556e6b,normalMap:m.paving.normalMap,normalScale:new THREE.Vector2(.08,.13),roughness:.19,metalness:.36}),'sump_grate');
        h.filterRag=h.mesh('clogged-filter',new THREE.IcosahedronGeometry(1,1),m.denim||m.cloth,[-16.48,-1.83,-5.52],'sump_grate');h.filterRag.scale.set(.19,.058,.14);
        for(let i=0;i<7;i++) box('filter-bar',[.035,.032,.31],[-16.69+i*.058,-1.89,-5.54],m.stone,'sump_grate');
        h.sumpKey=h.mesh('dropped-key',new THREE.TorusGeometry(.06,.013,8,20),m.brass,[-16.42,-2.17,-6.54],'cellar_keyring');
        h.sumpKey.rotation.x=-Math.PI/2;
        box('key-shank',[.025,.135,.025],[0,-.1,0],m.brass,'cellar_keyring',h.sumpKey);
        const pipeMaterial=new THREE.MeshStandardMaterial({color:0x675e49,roughness:.54,metalness:.55});
        for(const y of [-1.71,-1.43]){
            const supply=h.cylinder('wall-pipe',.040,.040,3.68,[-15.2,y,-4.93],pipeMaterial);
            supply.rotation.z=Math.PI/2;
            for(const x of [-16.65,-15.45,-14.42]){
                const joint=h.cylinder('pipe-union',.055,.055,.078,[x,y,-4.93],m.brass); joint.rotation.z=Math.PI/2;
            }
        }
        h.mesh('drain-valve',new THREE.TorusGeometry(.11,.013,8,26),m.red,[-16.42,-1.43,-5.046]);
        for(const turn of [0,Math.PI/3,2*Math.PI/3])box('valve-spoke',[.21,.012,.019],[-16.42,-1.43,-5.046],m.red).rotation.z=turn;
        const castIron=new THREE.MeshStandardMaterial({color:0x49605b,roughness:.57,metalness:.49,normalMap:m.paving.normalMap,normalScale:new THREE.Vector2(.04,.04)});
        const profile=[[.14,0],[.15,.055],[.11,.078],[.086,.31],[.102,.37],[.125,.40],[.124,.64],[.13,.66],[.13,.71],[.078,.73],[.066,.88],[.091,.90]];
        const pump=h.mesh('pump-barrel',new THREE.LatheGeometry(profile.map(([r,y])=>new THREE.Vector2(r,y)),32),castIron,[-13.73,-2.3,-6.87],'sump_pump');
        for(const x of [-.12,.12]) for(const z of [-.091,.091])
            h.mesh('pump-anchor',new THREE.CylinderGeometry(.021,.022,.032,6),m.brass,[x,.019,z],'sump_pump',pump);
        const pipe=(name,coords,radius,material)=>{
            const line=new THREE.CatmullRomCurve3(coords.map(p=>new THREE.Vector3(...p)));
            return h.mesh(name,new THREE.TubeGeometry(line,28,radius,10,false),material,[0,0,0],'sump_pump');
        };
        pipe('curved-spout',[[-13.79,-1.74,-6.87],[-13.95,-1.7,-6.87],[-14.08,-1.7,-6.87],[-14.14,-1.78,-6.87]],.047,castIron);
        pipe('sump-intake',[[-13.71,-2.25,-6.87],[-13.59,-2.22,-6.7],[-13.56,-2.24,-5.13],[-13.72,-2.24,-5.04],[-16.27,-2.23,-5.04],[-16.48,-2.05,-5.52]],.032,pipeMaterial);
        for(const x of [-13.78,-13.68]) box('pump-rocker-lug',[.024,.144,.051],[x,-1.398,-6.87],castIron,'sump_pump');
        h.cylinder('piston',.021,.021,.19,[-13.73,-1.356,-6.87],m.brass,'sump_pump');

        box('pump-foot',[.42,.12,.34],[-13.73,-2.33,-6.87],m.stone,'sump_pump');
        for(const y of [-2.13,-1.99,-1.66]) h.cylinder('pump-collar',.142,.142,.065,[-13.73,y,-6.87],pipeMaterial,'sump_pump');
        h.pumpHandle=new THREE.Group();h.scene.add(h.pumpHandle);h.pumpHandle.position.set(-13.73,-1.33,-6.87);
        box('pump-lever',[.5,.033,.042],[-.17,0,0],castIron,'sump_pump',h.pumpHandle);
        h.cylinder('wooden-grip',.028,.036,.21,[-.35,0,0],m.wood,'sump_pump',h.pumpHandle).rotation.z=Math.PI/2;
        const outlet=h.cylinder('outlet-pipe',.043,.043,1.15,[-13.59,-1.73,-6.37],m.stone,'sump_pump');outlet.rotation.x=Math.PI/2;
    };
    game.placeStoreyModels=(h,place)=>{
        const ids=new Set();
        function prop(id,size,pos,rot=0,item,variant){
            ids.add(id);return place(id,size,pos,rot,item,true,variant);
        }
        h.atticBasket.add(prop('wicker_basket_01',[.66,.28,.52],[0,-.14,0],0,'attic_winch'));
        for(const [x,z,y,w,angle] of [[-10.6,-5.23,0,.71,.08],[-9.87,-5.28,0,.61,-.12],[-10.59,-5.22,.42,.58,.22]])
            prop('wooden_crate_01',[w,.42,.53],[x,2.52+y,z],angle);
        prop('worn_metal_rack',[1.18,1.75,.51],[-14.89,-2.4,-5.12],Math.PI);
        prop('pot_enamel_01',[.34,.23,.31],[-15.11,-1.556,-5.1],.1);
        prop('garden_hose_wall_mounted_01',[.81,.91,.34],[-16.15,-1.56,-4.98],Math.PI);
        prop('industrial_caged_sconce',[.20,.37,.20],[-15.4,-.55,-4.97],Math.PI,undefined,'industrial_caged_sconce_a');
        const wallLight=new THREE.PointLight(0xffdcab,3,4.6,1.7);wallLight.position.set(-15.40,-.27,-5.35);h.scene.add(wallLight);
        return ids;
    };
    game.syncStoreys=(h,s,delta)=>{
        h.cellarDoor.rotation.y=s.cellarOpen?-1.53:0;
        const blend=delta===undefined?1:1-Math.exp(-delta*3.4);
        h.atticBasket.position.y=THREE.MathUtils.lerp(h.atticBasket.position.y,s.basketDown?3.27:4.45,blend);
        h.paperParcel.visible=!s.gear.includes('paper');
        const top=4.96,low=h.atticBasket.position.y+.46;
        h.basketCord.scale.y=top-low;h.basketCord.position.y=(top+low)/2;
        h.filterRag.visible=!s.filterClear;
        h.sumpSurface.position.y=THREE.MathUtils.lerp(h.sumpSurface.position.y,s.sumpDrained?-2.198:-1.866,blend);
        h.sumpKey.visible=s.sumpDrained&&!s.gear.includes('coffinKey');
        h.pumpHandle.rotation.z=-.25+(s.sumpDrained?.60:0)+Math.sin((h.sumpSurface.position.y+2.198)*32)*(s.sumpDrained?.36:0);
    };
})(window);
