(function(global){
    const game=global.Huisha3D,T=global.THREE;
    const smooth=(t,a,b)=>T.MathUtils.smoothstep(t,a,b);
    const inKitchen=p=>p.x>6.12 && p.z>-23.5 && p.z< -19.5;
    class ThreeWellChase {
        constructor(h){
            this.house=h;this.phase='quiet';this.root=new T.Group();this.root.name='well-visitor';
            (h.homeRoot || h.scene).add(this.root);this.root.visible=false;
            const paper=new T.MeshStandardMaterial({color:0xb9a57d,roughness:.89,flatShading:true,side:T.DoubleSide});
            const bamboo=new T.MeshStandardMaterial({color:0x8c6940,roughness:.68});
            const black=new T.MeshStandardMaterial({color:0x262324,roughness:.72,flatShading:true});
            const red=new T.MeshStandardMaterial({color:0x712923,roughness:.95,side:T.DoubleSide,flatShading:true});
            const gold=new T.MeshStandardMaterial({color:0xa18249,roughness:.79});
            const print=paper.clone(),face=paper.clone();
            print.color.setHex(0xffebe2);face.color.setHex(0xf1ede5);
            print.alphaTest=.4;face.alphaTest=.4;face.flatShading=false;
            if(h.renderer?.isWebGLRenderer){
                const loader=new T.TextureLoader();
                for(const [material,file] of [[print,'bride-crown-and-robe'],[face,'bride-paper-face']]){
                    material.map=loader.load('assets/art/'+file+'.webp');
                    material.map.colorSpace=T.SRGBColorSpace;h.textures.push(material.map);
                }
            }
            const part=(name,geo,mat,parent=this.root)=>h.mesh(name,geo,mat,[0,0,0],undefined,parent,false);
            const printed=(geometry,left,top,right,bottom)=>{
                const uv=geometry.attributes.uv;
                for(let i=0;i<uv.count;i++)uv.setXY(i,left+(right-left)*uv.getX(i),1-bottom+(bottom-top)*uv.getY(i));
                return geometry;
            };
            const shell=(rings,sides)=>new T.LatheGeometry(rings.map(([r,y])=>new T.Vector2(r,y)),sides);
            this.coat=part('pasted-paper-robe',printed(shell([[.37,.09],[.32,.39],[.22,.85],[.22,.99],[.29,1.22],[.14,1.32]],16),.02,.41,.98,.987),print);
            this.coat.scale.z=.68;
            const overCollar=part('folded-bridal-collar',printed(shell([[.30,1.14],[.31,1.22],[.12,1.34]],16),.04,.85,.97,.98),print,this.coat);
            overCollar.scale.z=1.02;
            const neckband=part('high-wedding-collar',printed(shell([[.142,1.275],[.108,1.35],[.087,1.425]],12),.05,.83,.34,.975),print,this.coat);
            neckband.scale.z=1.14;
            for(const x of [-.074,0,.074]){
                const splint=part('exposed-bamboo-neck',new T.CylinderGeometry(.009,.014,.20,5),bamboo);
                splint.position.set(x,1.34,0);splint.rotation.z=x*.7;
            }
            for(const y of [1.22,1.27]){
                const rib=part('torn-shoulder-splint',new T.CylinderGeometry(.008,.009,.19,5),bamboo);
                rib.rotation.z=1.39;rib.position.set(.27,y,0);
            }
            this.head=new T.Group();this.root.add(this.head);this.head.position.set(0,1.62,.03);
            const backing=part('pasted-head-shell',shell([[.05,-.18],[.12,-.08],[.138,.055],[.11,.16],[.03,.19]],12),black,this.head);
            backing.scale.z=.81;
            const curvedPanel=(width,height,bend)=>{
                const panel=new T.PlaneGeometry(width,height,20,10),points=panel.attributes.position;
                for(let i=0;i<points.count;i++){
                    const x=2*points.getX(i)/width;
                    points.setZ(i,bend*(1-x*x));
                }
                panel.computeVertexNormals();return panel;
            };
            const mask=part('effigy-painted-face',curvedPanel(.285,.377,.085),face,this.head);
            mask.position.set(0,-.013,.074);
            // An open front leaves the painted paper visible beneath the folded bridal veil.
            const hoodProfile=[[.32,-.54],[.23,-.19],[.157,.09],[.15,.16],[.075,.21],[.008,.23]];
            const pleats=new T.LatheGeometry(hoodProfile.map(([r,y])=>new T.Vector2(r,y)),32,.78,Math.PI*2-1.56);
            const folds=pleats.attributes.position;
            for(let i=0;i<folds.count;i++){
                const valley=Math.floor(i/hoodProfile.length)%2 && folds.getY(i)<0 ? .88 : 1;
                folds.setXYZ(i,folds.getX(i)*valley,folds.getY(i),folds.getZ(i)*valley);
            }
            pleats.computeVertexNormals();
            const veil=part('folded-bridal-veil',printed(pleats,.04,.43,.27,.962),print,this.head);
            veil.scale.z=.94;veil.position.z=-.008;
            // A corner of the red covering catches under the coronet, leaving one cheek exposed.
            const kerchief=curvedPanel(.35,.19,.068),edge=kerchief.attributes.position;
            for(let i=0;i<edge.count;i++){
                const x=edge.getX(i)/.175,v=(edge.getY(i)+.095)/.19;
                const hem=.046+x*.065-.075*x*x;
                edge.setY(i,hem*(1-v)+(.168-.027*x*x)*v);
            }
            kerchief.computeVertexNormals();
            const frontFold=part('turned-bridal-veil',printed(kerchief,.11,.65,.40,.955),print,this.head);
            frontFold.position.z=.102;
            const crown=part('phoenix-paper-crown',printed(curvedPanel(.48,.18,.083),0,0,1,.392),print,this.head);
            crown.position.set(0,.192,.126);
            for(const side of [-1,1])for(let i=0;i<3;i++){
                const length=.17+i*.047;
                const tassel=part('bridal-crown-pendant',new T.CylinderGeometry(.003,.003,length,5),gold,this.head);
                tassel.position.set(side*(.151+.024*i),.141-length/2,.113-i*.021);
                const tip=part('folded-tassel',new T.ConeGeometry(.012,.067,5),red,tassel);
                tip.position.y=-length/2-.026;
            }
            this.feet=[-1,1].map(side=>{
                const leg=new T.Group();leg.position.set(side*.12,.38,0);this.root.add(leg);
                const shin=part('paper-trouser-leg',new T.CylinderGeometry(.060,.075,.31,6),black,leg);shin.position.y=-.15;
                const shoe=part('folded-paper-shoe',new T.BoxGeometry(.13,.075,.23),black,leg);shoe.position.set(0,-.33,.046);
                return leg;
            });
            this.arms=[-1,1].map(side=>{
                const upper=part('folded-shoulder',printed(new T.CylinderGeometry(.115,.089,1,8),.19,.49,.44,.84),print);
                const lower=part('paper-sleeve',printed(new T.CylinderGeometry(.142,.096,1,8),.03,.57,.31,.987),print);
                const hand=new T.Group();this.root.add(hand);
                const palm=part('paper-mitten',new T.BoxGeometry(.10,.044,.11),paper,hand);
                palm.rotation.z=side*.09;
                for(let i=0;i<4;i++){
                    const digit=part('folded-paper-finger',new T.CylinderGeometry(.011,.016,.071,4),i===3?bamboo:paper,hand);
                    digit.position.set(side*(i-1.5)*.024,-.023,.053);digit.rotation.x=-.63;
                }
                return {side,upper,lower,hand};
            });
            this.up=new T.Vector3(0,1,0);
        }
        pose(t,climb){
            const root=this.root, reach=smooth(t,.4,3.9), crest=smooth(t,3.6,6.6),land=smooth(t,6.5,8.0);
            if(climb){
                root.position.set(-3,-1.35+1.18*reach+.94*crest-.77*land,-21.84+.19*reach+.37*crest+.63*land);
                root.rotation.y=.09+.37*smooth(t,4.9,6.3);
            }
            this.coat.rotation.x=climb?.16*crest-.13*land:.14;
            this.feet.forEach((leg,i)=>{leg.rotation.x=climb?.64*(crest-land):.42*Math.sin(t*6+i*Math.PI);});
            this.head.rotation.z=climb?-.12+.24*smooth(t,4.8,5.3):.115;
            this.head.rotation.x=climb?.48-.56*smooth(t,2.4,5.4):.09;
            for(const {side,upper,lower,hand} of this.arms){
                const shoulder=new T.Vector3(side*.22,1.20,.075);
                const grip=smooth(t,side<0?.25:1.05,side<0?2.7:3.3);
                const release=smooth(t,5.4+(side+1)*.32,7.85);
                const palm=climb ? new T.Vector3(side*.26,
                    T.MathUtils.lerp(.62+grip*.305-root.position.y,.70,release),
                    T.MathUtils.lerp(-21.36-root.position.z,.28,release))
                    : new T.Vector3(side*.29,.72+.10*Math.cos(t*6+side),.27+.13*Math.sin(t*6+side));
                // The hands come out separately, hold the rim while the body rises, then release.
                if(climb)palm.y-=.78*(1-grip);
                const elbow=shoulder.clone().lerp(palm,.48);elbow.x+=side*.12;elbow.z-=.125;
                for(const [mesh,a,b] of [[upper,shoulder,elbow],[lower,elbow,palm]]){
                    const d=b.clone().sub(a);mesh.position.copy(a).lerp(b,.5);mesh.scale.y=d.length();
                    mesh.quaternion.setFromUnitVectors(this.up,d.normalize());
                }
                hand.position.copy(palm);
            }
        }
        begin(){
            if(this.phase!=='quiet' || this.house.story.state.memory)return;
            const h=this.house;this.returnPose=h.controls.snapshot();this.time=0;this.phase='film';
            if(!h.story.state.wellRopeFreed){
                h.story.state.wellRopeFreed=true;h.story.save(this.returnPose);
            }
            this.root.visible=true;h.controls.clear();this.pose(0,true);this.frameFilm();
            h.onWatchEvent?.('film',0);
        }
        frameFilm(){
            const h=this.house,t=this.time;
            const pull=h.reducedMotion?.matches?1:smooth(t,3.55,7.75);
            h.camera.position.set(-2.42+.91*pull,1.25+.43*pull,-20.63+1.44*pull);
            const rise=T.MathUtils.clamp(this.root.position.y+1.51,.90,1.89);
            h.camera.lookAt(-3,rise-.23*pull,-21.52+.67*pull);
        }
        release(){
            if(this.phase!=='film')return;
            const h=this.house,pose=this.returnPose;
            this.pose(8.2,true);
            this.phase='chase';this.time=0;this.step=0;this.plan=0;this.route=[];
            h.controls.teleport({...pose,yaw:Math.atan2(6.4-pose.x,-21.4-pose.z),pitch:0});
            this.returnPose=null;h.onWatchEvent?.('run',0);
        }
        // Four-neighbour route on the same solid geometry used by player movement.
        pathTo(target){
            const h=this.house,r=this.root.position,unit=.38;
            const cell=(x,z)=>[Math.round(x/unit),Math.round(z/unit)];
            const [sx,sz]=cell(r.x,r.z),[tx,tz]=cell(target.x,target.z);
            const start={x:sx,z:sz,parent:null},queue=[start],seen=new Set([sx+','+sz]);
            let best=start,score=Infinity;
            for(let i=0;i<queue.length;i++){
                const n=queue[i],dist=(tx-n.x)**2+(tz-n.z)**2;
                if(dist<score){best=n;score=dist;}if(dist===0)break;
                for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){
                    const x=n.x+dx,z=n.z+dz,k=x+','+z;
                    if(seen.has(k)||Math.abs(x*unit)>6.4||z*unit> -13.75||z*unit< -27.3)continue;
                    seen.add(k);
                    if(h.controls.canOccupy(x*unit,z*unit) && h.controls.canOccupy((n.x+x)*unit/2,(n.z+z)*unit/2))
                        queue.push({x,z,parent:n});
                }
            }
            const route=[];for(let n=best;n.parent;n=n.parent)route.push({x:n.x*unit,z:n.z*unit});
            return route.reverse();
        }
        update(dt){
            const h=this.house,s=h.story.state,p=h.camera.position;
            if(this.phase==='film'){
                if(h.isReading?.())return;
                const previous=this.time;this.time+=dt;
                if(previous<2.76 && this.time>=2.76)h.onWatchEvent?.('crease',0);
                if(previous<7.65 && this.time>=7.65)h.onWatchEvent?.('land',0);
                this.pose(this.time,true);this.frameFilm();
                if(this.time>=8.6)this.release();
                return;
            }
            if(h.isPaused() || !s.opened || s.memory)return;
            if(inKitchen(p) && !s.crossedYard){
                s.crossedYard=true;h.story.save(h.controls.snapshot());h.courtyard.syncMask();
            }
            if(this.phase!=='chase')return;
            if(inKitchen(p)||p.z> -14.25||p.x< -6.12){
                this.phase='quiet';this.root.visible=false;s.wellEscaped=true;h.story.save(h.controls.snapshot());
                h.onWatchEvent?.('safe',0);return;
            }
            this.time+=dt;this.pose(this.time,false);
            if(this.time<1.9)return;
            this.plan-=dt;
            if(this.plan<=0){
                this.route=this.pathTo(p);this.plan=.57;
            }
            const pos=this.root.position,target=this.route[0]||p;
            const dx=target.x-pos.x,dz=target.z-pos.z,d=Math.hypot(dx,dz),stride=Math.min(d,dt*2.72);
            if(d>.001){
                const x=pos.x+dx/d*stride,z=pos.z+dz/d*stride;
                if(h.controls.canOccupy(x,z)){pos.x=x;pos.z=z;}
                this.root.rotation.y=Math.atan2(dx,dz);
            }
            if(d<=stride+.012)this.route.shift();
            pos.y=.009*Math.sin(this.time*6)**2;
            if((this.step-=dt)<=0){
                this.step=.44;const right=h.camera.matrixWorld.elements,dx=pos.x-p.x,dz=pos.z-p.z;
                h.onWatchEvent?.('step',(dx*right[0]+dz*right[2])/Math.max(1,Math.hypot(dx,dz)));
            }
            if(Math.hypot(pos.x-p.x,pos.z-p.z)<.56){
                this.phase='quiet';this.root.visible=false;h.controls.teleport({x:0,z:-14.75,yaw:Math.PI,pitch:0});
                h.story.save(h.controls.snapshot());h.onWatchEvent?.('caught',0);
            }
        }
    }
    game.ThreeWellChase=ThreeWellChase;
})(window);
