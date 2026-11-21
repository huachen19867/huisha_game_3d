(function(global){
    const copyText=global.HuishaCopy;
    const game=global.Huisha3D, THREE=global.THREE;
    game.buildClerk=function(h){
        const group=new THREE.Group(); group.position.set(3.37,0,20.38);group.rotation.y=-Math.PI/2;h.scene.add(group);
        const cloth=new THREE.MeshStandardMaterial({color:0x414744,roughness:.94});
        const skin=new THREE.MeshStandardMaterial({color:0xab8165,roughness:.82});
        const ellipsoid=(name,x,y,z,w,height,depth,mat)=>{
            const mesh=h.mesh(name,new THREE.SphereGeometry(1,16,14),mat,[x,y,z],'clerk',group);
            mesh.scale.set(w,height,depth); return mesh;
        };
        const jacket=(h.materials.denim||cloth).clone();jacket.color.setHex(0x78817e);
        const profile=[[.16,.94],[.215,1.00],[.195,1.13],[.209,1.25],[.242,1.36],[.22,1.415],[.116,1.465]];
        const torso=h.mesh('buttoned-jacket',new THREE.LatheGeometry(profile.map(([r,y])=>new THREE.Vector2(r,y)),32),jacket,[0,0,0],'clerk',group);
        torso.scale.z=.71;
        h.box('jacket-placket',[.022,.36,.012],[.005,1.22,.15],jacket,'clerk',group);
        for(const y of [1.10,1.19,1.28,1.38]) ellipsoid('jacket-button',.005,y,.162,.011,.011,.006,h.materials.darkWood);
        for(const side of [-1,1]){
            const collar=h.box('turn-down-collar',[.077,.104,.032],[side*.067,1.433,.085],jacket,'clerk',group);
            collar.rotation.z=side*.58;
            h.box('jacket-pocket',[.086,.07,.021],[side*.108,1.274,.126],jacket,'clerk',group);
            h.box('pocket-flap',[.092,.027,.028],[side*.108,1.306,.13],jacket,'clerk',group);
        }
        for(const side of [-1,1]){
            ellipsoid('jacket-sleeve',side*.223,1.255,.034,.080,.191,.087,jacket).rotation.x=-.44;
            ellipsoid('bent-sleeve',side*.219,1.10,.134,.073,.082,.149,jacket).rotation.x=.24;
            ellipsoid('resting-hand',side*.206,1.073,.27,.056,.034,.086,skin);
        }
        const skull=new THREE.Group();skull.position.y=1.482;group.add(skull);
        const face=ellipsoid('clerk-head',0,1.62,.016,.117,.154,.115,skin);
        const features=new THREE.Group();group.add(features);
        for(const x of [-.043,.043]) {
            h.mesh('brow',new THREE.BoxGeometry(.046,.009,.016),h.materials.darkWood,[x,1.654,.112],'clerk',features);
            h.mesh('eye',new THREE.SphereGeometry(.009,8,8),h.materials.cloth,[x,1.638,.12],'clerk',features);
        }
        h.box('smile',[.054,.006,.009],[0,1.573,.124],h.materials.darkWood,'clerk',features);
        ellipsoid('work-cap',0,1.752,-.010,.116,.053,.115,cloth);
        h.box('cap-bill',[.169,.014,.084],[0,1.735,.102],cloth,'clerk',group);
        for(const mesh of [...group.children]){
            if(mesh===face||mesh===features||mesh.name==='work-cap'||mesh.name==='cap-bill')
                skull.attach(mesh);
        }
        for(const x of [-.046,.046]){
            const lens=h.mesh('reading-glasses',new THREE.TorusGeometry(.039,.0026,7,26),h.materials.brass,[x,.143,.098],'clerk',skull);
            lens.scale.y=.73;
            h.box('glasses-temple',[.004,.004,.099],[Math.sign(x)*.087,.147,.052],h.materials.brass,'clerk',skull);
        }
        h.box('glasses-bridge',[.020,.004,.005],[0,.146,.099],h.materials.brass,'clerk',skull);
        h.clerkHead=skull;
        h.label('clerk-badge',copyText('clerk.clerk-badge'),[.082,.029],[-.095,1.349,.141],[0,0,0],'clerk',group);
        h.clerk=group;
        if(!h.renderer?.isWebGLRenderer) return;
        const base='assets/models/night-clerk/';
        new game.GLTFLoader().load(base+'LeePerrySmith.glb',gltf=>{
            if(h.disposed) return;
            const head=gltf.scene, bounds=new THREE.Box3().setFromObject(head);
            const size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
            const scale=.435/size.y, texture=new THREE.TextureLoader().load(base+'Map-COL.jpg');
            texture.colorSpace=THREE.SRGBColorSpace;texture.flipY=false;h.textures.push(texture);
            const material=new THREE.MeshStandardMaterial({map:texture,roughness:.85});
            head.traverse(node=>{if(node.isMesh){node.material=material;node.userData.item='clerk';}});
            head.scale.setScalar(scale);head.position.set(-center.x*scale,1.552-center.y*scale,.01-center.z*scale);
            group.add(head);skull.attach(head);face.visible=false;features.visible=false;
            // The shuttle is built before the asynchronous portrait finishes loading.
            if(h.driverPortrait){
                const driver=head.clone(true);
                driver.traverse(node=>{if(node.isMesh)node.userData.item='road_exit';});
                h.driverPortrait.add(driver);
                h.driverPortrait.getObjectByName('driver-face').visible=false;
                h.driverPortrait.getObjectByName('driver-hair').visible=false;
            }
        },undefined,()=>{/* The painted head stays visible while offline. */});
    };
    game.buildBusDriver=function(h,bus){
        const driver=new THREE.Group();driver.position.set(.51,.21,1.36);bus.add(driver);
        const navy=(h.materials.denim||h.materials.cloth).clone();
        navy.color.setHex(0x455361);
        const skin=new THREE.MeshStandardMaterial({color:0xa7785a,roughness:.88});
        const form=(name,xyz,scale,mat,parent=driver)=>{
            const mesh=h.mesh(name,new THREE.SphereGeometry(1,24,16),mat,xyz,'road_exit',parent);
            mesh.scale.set(...scale);return mesh;
        };
        const jacket=[[.18,.94],[.205,1.02],[.205,1.21],[.269,1.34],[.262,1.39],[.20,1.43],[.093,1.475]];
        h.mesh('driver-jacket',new THREE.LatheGeometry(jacket.map(([r,y])=>new THREE.Vector2(r,y)),32),navy,[0,0,0],'road_exit',driver).scale.z=.85;
        h.box('driver-placket',[.018,.35,.012],[0,1.21,.174],navy,'road_exit',driver);
        for(const side of [-1,1]){
            h.box('driver-collar',[.074,.088,.025],[side*.060,1.432,.092],navy,'road_exit',driver).rotation.z=side*.54;
            form('driver-sleeve',[side*.205,1.22,.034],[.081,.217,.104],navy).rotation.x=-.44;
            form('driver-forearm',[side*.19,1.025,.19],[.065,.068,.17],navy).rotation.x=-.18;
            form('driver-hand',[side*.16,1.066,.34],[.052,.047,.077],skin);
        }
        const head=new THREE.Group();head.position.y=1.47;head.rotation.y=-.30;
        head.scale.set(1.10,.97,1.04);driver.add(head);h.driverPortrait=head;
        form('driver-face',[0,.128,.008],[.117,.15,.12],skin,head);
        form('driver-hair',[0,.220,-.018],[.12,.085,.117],h.materials.cloth,head);
    };
})(window);
