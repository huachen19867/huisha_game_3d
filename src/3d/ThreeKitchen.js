(function (global) {
    const game=global.Huisha3D, THREE=global.THREE;
    const lathe = points => new THREE.LatheGeometry(points.map(p=>new THREE.Vector2(...p)),64);
    function porkPiece(h,parent,item,position) {
        const cut=new THREE.SphereGeometry(1,24,16),v=cut.attributes.position, colors=[];
        const lean=new THREE.Color(0x7c4025), fat=new THREE.Color(0xca9964), skin=new THREE.Color(0x8d5126);
        for(let i=0;i<v.count;i++){
            const x=v.getX(i),y=v.getY(i),z=v.getZ(i);
            const round=q=>Math.sign(q)*Math.pow(Math.abs(q),.45);
            v.setXYZ(i,.027*round(x),.015*round(y),.022*round(z));
            const band=y+.14*x+.08*Math.sin(3*z);
            const c=band>.68?skin:band>.19 || (band<-.23 && band>-.41)?fat:lean;
            colors.push(c.r,c.g,c.b);
        }
        cut.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));cut.computeVertexNormals();
        const meat=h.mesh('braised-pork',cut,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.35}),position,item,parent);
        meat.rotation.set(.12,.52,-.18);return meat;
    }
    class ThreeKitchen {
        constructor(house) {
            this.house=house;
            this.dripTime=0; this.dripCount=0;
            this.buildStove();
            this.buildBasin();
        }
        static bowl(h,parent,position,item) {
            const bowl=new THREE.Group(); bowl.position.set(...position); parent.add(bowl);
            const shell=lathe([[.001,0],[.053,0],[.055,.008],[.068,.018],[.092,.045],[.11,.085],[.112,.092],[.108,.094],[.103,.084],[.085,.046],[.055,.020],[.001,.017]]);
            const vertices=shell.attributes.position, colors=[];
            const china=new THREE.Color(0xe4ddc5), blue=new THREE.Color(0x315469), biscuit=new THREE.Color(0xa58b68);
            for(let i=0;i<vertices.count;i++){
                const x=vertices.getX(i),y=vertices.getY(i),z=vertices.getZ(i);
                const nearChip=Math.max(0,1-Math.abs(Math.atan2(x,-z)-.49)/.12);
                if(y>.083) vertices.setY(i,y-nearChip*.012);
                const color=nearChip>.2 && y>.083 ? biscuit : y>.083 ? blue : china;
                colors.push(color.r,color.g,color.b);
            }
            shell.setAttribute('color',new THREE.Float32BufferAttribute(colors,3)); shell.computeVertexNormals();
            h.mesh('chipped-blue-bowl',shell,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.27}),[0,0,0],item,bowl);
            const serving=new THREE.Group(); serving.name='rice-serving'; bowl.add(serving);
            const starch=new THREE.MeshStandardMaterial({color:0xe2dcc7,roughness:.68});
            const mound=h.mesh('rice-mound',new THREE.SphereGeometry(1,32,16),starch,[0,.066,0],item,serving);
            mound.scale.set(.094,.027,.093);
            const grains=new THREE.InstancedMesh(new THREE.SphereGeometry(1,6,5),starch,143);
            const grain=new THREE.Object3D();
            for(let i=0;i<grains.count;i++){
                const radius=Math.sqrt((i+.5)/grains.count), angle=i*2.39996;
                grain.position.set(.092*radius*Math.cos(angle),.067+.027*Math.sqrt(1-radius*radius),.092*radius*Math.sin(angle));
                grain.rotation.set(.22*Math.cos(i),i*.83,.18*Math.sin(i));
                grain.scale.set(.0021,.0017,.0052);grain.updateMatrix();grains.setMatrixAt(i,grain.matrix);
            }
            grains.userData.item=item;serving.add(grains);
            porkPiece(h,serving,item,[-.014,.102,.011]);
            return bowl;
        }
        buildStove() {
            const h=this.house, m=h.materials, item='rice_bowl';
            const iron=new THREE.MeshStandardMaterial({color:0x363731,roughness:.63,metalness:.45,side:THREE.DoubleSide});
            const soot=m.brick.clone(); soot.color.setHex(0x4d453e);
            for(const x of [9.52,10.48]) h.box('hearth-cheek',[.32,.74,1.10],[x,.35,-18.6],m.brick);
            h.box('hearth-back',[.64,.74,.19],[10,.35,-18.15],soot);
            h.box('hearth-floor',[.65,.14,.95],[10,.06,-18.69],soot);
            h.box('hearth-lintel',[.66,.23,.22],[10,.606,-19.04],soot);
            const slab=new THREE.Shape();
            slab.moveTo(-.67,-.57);slab.lineTo(.67,-.57);slab.lineTo(.67,.57);slab.lineTo(-.67,.57);slab.closePath();
            const opening=new THREE.Path();opening.absarc(0,0,.275,0,Math.PI*2,true);slab.holes.push(opening);
            const top=new THREE.ExtrudeGeometry(slab,{depth:.10,bevelEnabled:true,bevelThickness:.008,bevelSize:.007,bevelSegments:2,curveSegments:32});
            const wornStone=m.paving.clone();wornStone.color.setHex(0x979188);wornStone.roughness=.86;
            top.rotateX(-Math.PI/2);h.mesh('hearth-slab',top,wornStone,[10,.722,-18.6]);
            h.mesh('wok-seat',lathe([[.29,0],[.30,.021],[.273,.122],[.252,.122],[.242,.099],[.26,0]]),iron,[10,.821,-18.6],item);
            for(const x of [9.84,10.16]){
                const rest=h.cylinder('lid-rest',.009,.012,.47,[x,1.057,-18.088],iron);
                rest.rotation.x=-.12;
                h.mesh('lid-rest-tip',new THREE.SphereGeometry(.015,12,8),iron,[x,1.29,-18.116]);
            }
            this.fire=new THREE.Group();h.scene.add(this.fire);
            const ember=new THREE.MeshBasicMaterial({color:0xda6232});
            for(let i=0;i<4;i++){
                const x=9.78+i*.14,z=-18.93+.025*Math.cos(i);
                const log=h.cylinder('hearth-split-wood',.042,.05,.44,[x,.174,z],m.darkWood);
                log.rotation.set(Math.PI/2,0,(i-1.5)*.08);
                h.mesh('hearth-ember',new THREE.SphereGeometry(.032,10,6),ember,[x,.177,z-.216],undefined,this.fire,false);
            }
            const glow=new THREE.PointLight(0xef8646,1.7,2.7);glow.position.set(10,.32,-19.10);this.fire.add(glow);
            h.mesh('seasoned-wok',lathe([[.035,0],[.15,.026],[.24,.083],[.321,.177],[.334,.185],[.328,.191],[.309,.179],[.229,.090],[.14,.039],[.035,.012]]),iron,[10,.825,-18.6],item);
            for(let i=-4;i<=4;i++){
                const x=i*.038, length=2*Math.sqrt(.201**2-x*x);
                h.box('bamboo-steaming-slat',[.031,.009,length],[10+x,.89,-18.6],m.wood,item);
            }
            this.bowl=ThreeKitchen.bowl(h,h.scene,[10,.895,-18.6],item);
            this.rice=this.bowl.getObjectByName('rice-serving');
            this.pork=this.rice.getObjectByName('braised-pork');
            this.lid=new THREE.Group(); this.lid.position.set(10,1.018,-18.29);h.scene.add(this.lid);
            h.mesh('stove-wok-lid',lathe([[0,.128],[.09,.124],[.23,.076],[.32,.012],[.334,0]]),iron,[0,0,-.31],item,this.lid);
            for(const [radius,height] of [[.21,.082],[.295,.025]]) {
                const ridge=h.mesh('lid-rolled-rib',new THREE.TorusGeometry(radius,.004,8,56),iron,[0,height,-.31],item,this.lid);
                ridge.rotation.x=Math.PI/2;
            }
            for(const x of [-.046,.046]) h.mesh('lid-grip-rivet',new THREE.SphereGeometry(.011,10,8),m.brass,[x,.121,-.31],item,this.lid);
            h.mesh('wok-lid-grip',new THREE.TorusGeometry(.048,.009,8,24,Math.PI),m.wood,[0,.123,-.31],item,this.lid);
            this.buildLunchbox();
        }
        buildLunchbox() {
            const h=this.house,item='rice_bowl';
            this.lunchbox=new THREE.Group();this.lunchbox.name='open-work-lunchbox';this.lunchbox.position.set(9.55,.831,-18.72);h.scene.add(this.lunchbox);
            const steel=new THREE.MeshStandardMaterial({color:0xbac1b9,metalness:.65,roughness:.32});
            const rounded=(p,x,y,w,d,r)=>{
                p.moveTo(x+r,y);p.lineTo(x+w-r,y);p.quadraticCurveTo(x+w,y,x+w,y+r);
                p.lineTo(x+w,y+d-r);p.quadraticCurveTo(x+w,y+d,x+w-r,y+d);
                p.lineTo(x+r,y+d);p.quadraticCurveTo(x,y+d,x,y+d-r);
                p.lineTo(x,y+r);p.quadraticCurveTo(x,y,x+r,y);p.closePath();return p;
            };
            const tray=rounded(new THREE.Shape(),-.132,-.084,.264,.168,.024);
            for(const x of [-.127,.003]) tray.holes.push(rounded(new THREE.Path(),x,-.078,.122,.156,.018));
            const walls=new THREE.ExtrudeGeometry(tray,{depth:.057,bevelEnabled:true,bevelSize:.0018,bevelThickness:.0018,bevelSegments:2});
            walls.rotateX(-Math.PI/2);h.mesh('divided-steel-tin',walls,steel,[0,0,0],item,this.lunchbox);
            h.box('tin-bottom',[.237,.004,.15],[0,.002,0],steel,item,this.lunchbox);
            const rice=h.mesh('packed-rice',new THREE.SphereGeometry(1,20,12),this.rice.children[0].material,[-.064,.02,0],item,this.lunchbox);
            rice.scale.set(.054,.017,.071);
            const beans=new THREE.MeshStandardMaterial({color:0x606c37,roughness:.42});
            for(let i=0;i<9;i++) {
                const bean=h.cylinder('cooked-bean',.004,.005,.054,[.038+(i%3)*.023,.022+(i%2)*.006,(Math.floor(i/3)-1)*.038],beans,item,this.lunchbox);
                bean.rotation.set(1.5,i*.18,i*.62);
            }
            porkPiece(h,this.lunchbox,item,[.067,.042,.012]);
            const lid=rounded(new THREE.Shape(),-.13,-.083,.26,.166,.025);
            const plate=new THREE.ExtrudeGeometry(lid,{depth:.006,bevelEnabled:true,bevelSize:.003,bevelThickness:.002,bevelSegments:2});
            plate.rotateX(-Math.PI/2);h.mesh('lunchbox-lid',plate,steel,[0,0,.19],item,this.lunchbox);
            this.spoon=new THREE.Group();this.lunchbox.add(this.spoon);
            const scoop=h.mesh('rice-spoon',new THREE.SphereGeometry(1,16,8),steel,[0,0,0],item,this.spoon);
            scoop.scale.set(.019,.004,.03);
            h.box('spoon-handle',[.011,.004,.095],[0,.006,.067],steel,item,this.spoon).rotation.x=-.09;
        }
        buildBasin() {
            const h=this.house, m=h.materials, item='leak_basin';
            const root=new THREE.Group(); root.position.set(7.24,0,-18.65);h.scene.add(root);
            for(const x of [-.146,.146]) for(const z of [-.135,.135]) h.box('basin-stool-leg',[.046,.291,.05],[x,.144,z],m.wood,item,root);
            h.box('basin-stool-seat',[.42,.042,.39],[0,.307,0],m.wood,item,root);
            const glaze=new THREE.MeshStandardMaterial({color:0xc1d1b8,roughness:.27,metalness:.12});
            h.mesh('enamel-washbasin',lathe([[.001,0],[.137,.001],[.157,.014],[.194,.064],[.224,.13],[.231,.135],[.225,.141],[.216,.135],[.183,.069],[.144,.018],[.001,.012]]),glaze,[0,.328,0],item,root);
            const rim=h.mesh('basin-blue-rim',new THREE.TorusGeometry(.226,.004,8,64),new THREE.MeshStandardMaterial({color:0x25495a,roughness:.29}),[0,.467,0],item,root);
            rim.rotation.x=Math.PI/2;
            h.cylinder('rainwater',.169,.169,.002,[0,.371,0],new THREE.MeshStandardMaterial({color:0x829b98,transparent:true,opacity:.7,roughness:.12}),item,root);
            const cotton=(m.quilt||m.cloth).clone();cotton.side=THREE.DoubleSide;cotton.color.setHex(0x94a6a1);
            const towel=(name,section)=>{
                const fabric=new THREE.PlaneGeometry(.22,1,12,20), v=fabric.attributes.position;
                for(let i=0;i<v.count;i++){
                    const x=v.getX(i),t=v.getY(i)+.5,p=section.getPointAt(t);
                    v.setXYZ(i,x+.008*Math.sin(t*7),p.y+.006*Math.cos(x*90+t*4),p.x+.004*Math.sin(x*100));
                }
                fabric.computeVertexNormals();
                return h.mesh(name,fabric,cotton,[0,0,0],item,root,false);
            };
            const curve=points=>new THREE.SplineCurve(points.map(p=>new THREE.Vector2(...p)));
            this.hanging=towel('dishcloth-over-rim',curve([[.16,.392],[.198,.442],[.222,.475],[.243,.435],[.246,.324],[.254,.29]]));
            this.folded=towel('dishcloth-in-basin',curve([[-.095,.374],[-.03,.378],[.05,.375],[.139,.386]]));
            const wet=new THREE.MeshStandardMaterial({color:0xb6cfce,roughness:.12,metalness:.18});
            this.drop=h.mesh('roof-drip',new THREE.SphereGeometry(.014,10,8),wet,[.032,2.9,0],item,root,false);
            this.drop.scale.set(.7,1.6,.7);
            this.ripple=h.mesh('drip-ring',new THREE.TorusGeometry(.039,.0018,6,32),wet,[.032,.374,0],item,root,false);
            this.ripple.rotation.x=-Math.PI/2;
            h.box('leaking-joist',[.14,.17,1.46],[0,3.01,0],m.darkWood,item,root);
        }
        sync(immediate,delta) {
            const h=this.house,s=h.story.state;
            this.fire.visible=s.stoveLit;
            const open=s.riceStage!=='covered', angle=open ? 1.83 : 0;
            this.lid.rotation.x=immediate||h.reducedMotion?.matches ? angle : THREE.MathUtils.damp(this.lid.rotation.x,angle,10,delta);
            this.bowl.visible=!s.gear.includes('rice') && !s.offerings.includes('rice');
            this.rice.visible=s.riceStage==='served';
            this.pork.visible=s.porkOnRice;
            this.lunchbox.visible=this.bowl.visible && s.riceStage==='served';
            if (this.lastStage==='empty' && s.riceStage==='served') this.servingTime=0;
            this.lastStage=s.riceStage;
            if (this.lunchbox.visible) {
                if (immediate || h.reducedMotion?.matches || this.servingTime===undefined) this.servingTime=1;
                else if (!h.isPaused?.()) this.servingTime=Math.min(1,this.servingTime+delta*.85);
                const reach=Math.sin(Math.PI*this.servingTime)**2;
                this.spoon.position.set(-.06+.51*reach,.048+.25*reach,.01+.11*reach);
                this.spoon.rotation.z=-.75*reach;
                this.rice.scale.setScalar(.01+.99*THREE.MathUtils.smoothstep(this.servingTime,.37,.5));
            }
            this.hanging.visible=!s.leakMuffled;this.folded.visible=s.leakMuffled;
        }
        updateDrip(delta) {
            const h=this.house,s=h.story.state;
            if (!h.controls || s.arrival!=='home' || s.memory || h.isPaused?.()) return;
            const dx=7.272-h.camera.position.x, dz=-18.65-h.camera.position.z, distance=Math.hypot(dx,dz);
            if(distance>19 || h.camera.position.z>-.5) return;
            const intervals=[1.04,.77,1.62], period=intervals[this.dripCount%intervals.length];
            this.dripTime+=delta;
            if (this.dripTime>=period) {
                this.dripTime-=period; this.dripCount++;
                if(!s.leakMuffled){
                    const pan=(-Math.cos(h.controls.yaw)*dx+Math.sin(h.controls.yaw)*dz)/Math.max(1,distance);
                    h.onKitchenDrip?.(.49*(1-distance/20),pan);
                }
            }
            const untilImpact=intervals[this.dripCount%intervals.length]-this.dripTime;
            const fall=Math.max(0,1-untilImpact/.72);
            this.drop.visible=fall>0; this.drop.position.y=2.92-2.546*fall*fall;
            this.ripple.visible=!s.leakMuffled && this.dripTime<.36;
            this.ripple.scale.setScalar(.15+this.dripTime*7);
        }
    }
    game.ThreeKitchen=ThreeKitchen;
})(window);
