(function (global) {
    const copyText=global.HuishaCopy;
    const THREE=global.THREE, game = global.Huisha3D, world = game.WORLD_MAP;
    world.walkable.push(
        {id:'west_room',title:copyText('westroom.west_room.title'),xMin:-12.5,xMax:-5.8,zMin:-21,zMax:-15,requiresState:'opened'},
        {id:'workshop',title:copyText('westroom.workshop.title'),xMin:-17.5,xMax:-12.5,zMin:-21,zMax:-15,requiresState:'wardrobeOpen'}
    );
    const block = (id,xMin,xMax,zMin,zMax,extra={}) => world.obstacles.push({id,xMin,xMax,zMin,zMax,...extra});
    for (const x of [-6,-12.5]) {
        block('west-jamb-north'+x,x-.1,x+.1,-21,-19);
        block('west-jamb-south'+x,x-.1,x+.1,-17,-15);
    }
    block('closed-wardrobe',-12.5,-11.78,-19.02,-16.98,{untilState:'wardrobeOpen'});
    block('moved-wardrobe',-12.5,-11.78,-17.02,-15,{requiresState:'wardrobeOpen'});
    block('nightstand',-8.52,-7.92,-20.93,-20.47);
    block('bed',-10.7,-8.7,-20.95,-19.48);
    block('wedding-chest',-8.5,-7.35,-15.75,-15.08);
    block('workbench',-17.4,-16.55,-20.1,-17.2);
    function site(id,title,area,x,y,z,text,extra={}) {
        world.interactables.push({id,title,area,location:{west_room:copyText('westroom.site.west_room'),workshop:copyText('storeys.addsite.workshop'),kitchen:copyText('courtyardmap.kitchen.title')}[area],
            position:{x,y,z},radius:2,requiresOpen:true,text,...extra});
    }
    site('wardrobe',copyText('westroom.wardrobe'),'west_room',-11.72,1.28,-18,copyText('westroom.wardrobe.2'));
    site('wedding_photo',copyText('westroom.wedding_photo'),'west_room',-9.35,1.52,-20.83,copyText('westroom.wedding_photo.2'));
    site('wedding_chest',copyText('westroom.wedding_chest'),'west_room',-7.92,.82,-15.78,copyText('westroom.wedding_chest.2'));
    site('cardigan_bed',copyText('cardigan.bed'),'west_room',-9.35,.71,-19.89,copyText('cardigan.bedText'),{journal:false});
    site('cardigan_detail',copyText('cardigan.name'),'west_room',-9.35,.71,-19.89,copyText('cardigan.inspect'),{inventoryOnly:true});
    site('wedding_sitting',copyText('cardigan.memoryTitle'),'west_room',-9.35,1.52,-20.83,copyText('cardigan.memory'),{inventoryOnly:true});
    site('brass_weight',copyText('westroom.brass_weight'),'workshop',-16.52,1.09,-19.47,copyText('westroom.brass_weight.2'),{requiresState:'wardrobeOpen'});
    site('matchbox',copyText('westroom.matchbox'),'workshop',-16.52,1.04,-17.58,copyText('westroom.matchbox.2'),{requiresState:'wardrobeOpen'});
    site('rice_bowl',copyText('westroom.rice_bowl'),'kitchen',10,1.08,-18.65,copyText('westroom.rice_bowl.2'),{journal:false});
    site('leak_basin',copyText('westroom.leak_basin'),'kitchen',7.24,.47,-18.65,copyText('westroom.leak_basin.2'));
    block('basin-stool',6.98,7.50,-18.91,-18.39);
    game.buildWestRoom = function(h) {
        const m=h.materials;
        const box=(name,size,pos,mat,item,parent)=>h.box(name,size,pos,mat,item,parent);
        for(const [z,length] of [[-23.2,8.4],[-15.5,3]]) box('yard-west-wall',[.2,3.1,length],[-6,1.5,z],m.plaster);
        for(const x of [-6,-12.5]){
            if(x===-12.5) for(const z of [-20,-16]) box('workshop-wall',[.2,2.95,2],[x,1.47,z],m.plaster);
            box('west-lintel',[.26,.42,2.07],[x,2.78,-18],m.darkWood);
        }
        box('west-floor',[11.6,.15,6.05],[-11.75,-.08,-18],m.floor);
        box('west-roof',[11.6,.14,6.08],[-11.75,3.04,-18],m.darkWood);
        const plaster=m.plaster.clone();plaster.userData.tileMeters=[5,2.5];
        box('bedroom-wall',[11.65,3.08,.2],[-11.78,1.5,-21.1],plaster);
        game.buildStoreys(h);
        for(const z of [-20.95]) {
            box('timber-skirting',[11.54,.2,.08],[-11.77,.1,z],m.darkWood);
            box('wall-rail',[11.54,.055,.07],[-11.77,.83,z],m.wood);
        }
        for(const x of [-17.22,-14.8,-12.4,-10.1,-7.7]) box('ceiling-joist',[.13,.19,6.0],[x,2.90,-18],m.darkWood);
        box('workshop-back-wall',[.2,3.08,6.2],[-17.61,1.5,-18],m.wall);
        h.label('west-sign',copyText('westroom.west-sign'),[.74,.3],[-5.86,2.62,-18],[0,Math.PI/2,0]);
        // The quilt sags over the mattress edges; each stitched panel has a little loft.
        const quilting=new THREE.PlaneGeometry(1.62,1.68,54,42);
        quilting.rotateX(-Math.PI/2);
        const verts=quilting.attributes.position;
        for (let i=0;i<verts.count;i++) {
            const x=verts.getX(i),z=verts.getZ(i),edge=Math.max(0,Math.abs(z)-.655);
            const seam=Math.pow(Math.abs(Math.cos(x*12.1)*Math.cos(z*11.4)),.52);
            verts.setXYZ(i,x+.018*Math.sin(z*14+x*7),.028*seam-1.12*edge+.012*Math.sin(x*8+z*11),
                z-Math.sign(z)*edge*.64);
        }
        quilting.computeVertexNormals();
        const blanket=(m.quilt||m.cloth).clone();blanket.side=THREE.DoubleSide;
        const lining=(m.paper).clone();lining.color.setHex(0xb5a88d);
        const mattress=h.mesh('cotton-mattress',new THREE.SphereGeometry(1,36,20),lining,[-9.7,.52,-20.19]);
        mattress.scale.set(.963,.084,.645);
        h.mesh('stitched-quilt',quilting,blanket,[-9.58,.625,-20.19]);
        const pillow=h.mesh('pillow',new THREE.SphereGeometry(1,30,16),lining,[-10.36,.655,-20.19]);
        pillow.scale.set(.235,.092,.48);pillow.rotation.z=.06;
        box('bedside-cupboard',[.56,.57,.42],[-8.22,.285,-20.7],m.wood);
        box('bedside-top',[.60,.05,.46],[-8.22,.594,-20.7],m.darkWood);
        box('bedside-drawer',[.49,.18,.04],[-8.22,.45,-20.477],m.darkWood);
        h.cylinder('bedside-lamp-base',.108,.13,.042,[-8.22,.643,-20.7],m.brass);
        h.cylinder('bedside-lamp-post',.018,.024,.24,[-8.22,.775,-20.7],m.brass);
        const shade=new THREE.MeshStandardMaterial({color:0xc7a276,emissive:0xbf7544,emissiveIntensity:.52,side:THREE.DoubleSide});
        h.mesh('bedside-lampshade',new THREE.CylinderGeometry(.103,.172,.22,32,1,true),shade,[-8.22,.952,-20.7]);
        const readingLamp=new THREE.PointLight(0xffcc88,2.7,3.4,1.65);readingLamp.position.set(-8.2,1.08,-20.64);h.scene.add(readingLamp);
        box('wedding-frame',[.93,.73,.065],[-9.35,1.52,-20.95],m.darkWood,'wedding_photo');
        if (h.renderer?.isWebGLRenderer) {
            const photo=new THREE.TextureLoader().load('assets/art/silver-wedding.jpg');
            photo.colorSpace=THREE.SRGBColorSpace;h.textures.push(photo);
            h.mesh('wedding-print',new THREE.PlaneGeometry(.84,.56),new THREE.MeshStandardMaterial({map:photo,roughness:.62}),[-9.35,1.57,-20.909],'wedding_photo');
        }
        h.label('wedding-date',copyText('westroom.wedding-date'),[.76,.088],[-9.35,1.235,-20.907],[0,0,0],'wedding_photo');
        h.wardrobe = new THREE.Group(); h.wardrobe.position.set(-12.14,0,-18);h.scene.add(h.wardrobe);
        h.wardrobeSite=world.interactables.find(item=>item.id==='wardrobe');
        for(const z of [-18.65,-17.35]) box('wardrobe-track',[.5,.026,2.35],[-12.11,.013,z+.82],m.stone);
        const chest=new THREE.Group();chest.position.set(-7.92,0,-15.42);h.scene.add(chest);
        const plank=(name,size,pos,mat=m.wood)=>box(name,size,pos,mat,'wedding_chest',chest);
        plank('chest-bottom',[1.13,.09,.64],[0,.055,0]);
        for(const z of [-.30,.30])plank('chest-long-wall',[1.15,.61,.045],[0,.375,z]);
        for(const x of [-.55,.55])plank('chest-end-wall',[.05,.61,.56],[x,.375,0]);
        plank('chest-tray',[.30,.04,.53],[-.35,.44,0]);plank('chest-tray-lip',[.035,.12,.56],[-.19,.48,0]);
        h.westLid=new THREE.Group();chest.add(h.westLid);h.westLid.position.set(0,.68,.32);
        box('chest-lid',[1.19,.08,.68],[0,.04,-.32],m.darkWood,'wedding_chest',h.westLid);
        h.chestKey=new THREE.Group();chest.add(h.chestKey);h.chestKey.position.set(-.34,.473,-.055);
        h.chestKey.rotation.y=-.35;
        h.mesh('key-bow',new THREE.TorusGeometry(.036,.007,8,24),m.brass,[0,0,0],'wedding_chest',h.chestKey).rotation.x=Math.PI/2;
        box('key-shank',[.014,.012,.11],[0,0,.084],m.brass,'wedding_chest',h.chestKey);
        for(const z of [.10,.13])box('key-tooth',[.035,.014,.012],[.012,0,z],m.brass,'wedding_chest',h.chestKey);
        box('key-tag',[.082,.014,.12],[0,0,-.08],m.wood,'wedding_chest',h.chestKey);
        const stamp=new THREE.Shape();
        stamp.moveTo(-.021,.014);stamp.lineTo(.021,.014);stamp.lineTo(.016,-.018);
        stamp.lineTo(-.016,-.018);stamp.closePath();
        const stampAt=[0,.0072,-.08];
        h.mesh('bucket-on-key-tag',new THREE.ShapeGeometry(stamp),m.darkWood,stampAt,'wedding_chest',h.chestKey).rotation.x=-Math.PI/2;
        const handle=new THREE.TorusGeometry(.017,.002,5,12,Math.PI);
        h.mesh('stamped-pail-handle',handle,m.darkWood,[0,.0073,-.094],'wedding_chest',h.chestKey).rotation.x=-Math.PI/2;
        const knit=new THREE.MeshStandardMaterial({roughness:.97,color:0xe7d9d5,alphaTest:.5,side:THREE.DoubleSide});
        if(h.renderer?.isWebGLRenderer){
            knit.map=new THREE.TextureLoader().load('assets/art/west-cardigan.webp');
            knit.map.colorSpace=THREE.SRGBColorSpace;h.textures.push(knit.map);
        }
        h.foldedCardigan=new THREE.Group();chest.add(h.foldedCardigan);
        h.foldedCardigan.position.set(.17,.47,0);
        const wool=new THREE.MeshStandardMaterial({color:0x612e3b,roughness:.98});
        for(let i=0;i<3;i++){
            const fold=h.mesh('knitted-fold',new THREE.SphereGeometry(1,28,10),wool,[0,.026*i,0],'wedding_chest',h.foldedCardigan);
            fold.scale.set(.285,.036,.205);
        }
        const top=new THREE.PlaneGeometry(.47,.33,20,14);top.rotateX(-Math.PI/2);
        const tu=top.attributes.uv,tv=top.attributes.position;
        for(let i=0;i<tu.count;i++){
            tv.setY(i,.073+.025*(1-(2*tu.getX(i)-1)**2)*(1-(2*tu.getY(i)-1)**2));
            tu.setXY(i,.31+.38*tu.getX(i),.41+.38*tu.getY(i));
        }
        top.computeVertexNormals();h.mesh('folded-button-band',top,knit,[0,0,0],'wedding_chest',h.foldedCardigan);
        const spread=new THREE.PlaneGeometry(1.16,.79,32,24);spread.rotateX(-Math.PI/2);
        const fabric=spread.attributes.position;
        for(let i=0;i<fabric.count;i++){
            const x=fabric.getX(i),z=fabric.getZ(i);
            fabric.setY(i,.012*Math.cos(x*14+z*7)+.007*Math.sin(z*22)-.5*Math.max(0,z-.29));
        }
        spread.computeVertexNormals();
        h.cardiganBedSite=new THREE.Group();h.scene.add(h.cardiganBedSite);
        world.interactables.find(item=>item.id==='cardigan_bed').targetObject=h.cardiganBedSite;
        h.spreadCardigan=h.mesh('cardigan-on-quilt',spread,knit,[-9.34,.691,-19.97],'cardigan_bed',h.cardiganBedSite);
        h.label('chest-lock',copyText('westroom.chest-lock'),[.19,.17],[-7.92,.55,-15.76],[0,Math.PI,0],'wedding_chest');
        box('repair-table',[.86,.12,2.9],[-17,.91,-18.65],m.wood);
        for(const z of [-19.86,-17.4]) box('bench-legs',[.76,.87,.12],[-17,.43,z],m.darkWood);
        h.spareWeight=h.cylinder('brass-counterweight',.096,.15,.22,[-16.74,1.09,-19.47],m.brass,'brass_weight');
        h.matchTin=box('match-tin',[.23,.08,.13],[-16.7,1.04,-17.58],m.brass,'matchbox');
        for(const [x,z] of [[-9,-18],[-15.8,-18.8]]){
            box('ceiling-bulb',[.12,.18,.12],[x,2.76,z],m.paper);
            const lamp=new THREE.PointLight(0xffcb91,7,8,1.6);lamp.position.set(x,2.55,z);h.scene.add(lamp);
        }
    };
})(window);
