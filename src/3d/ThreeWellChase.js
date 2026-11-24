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
            const print=paper.clone(),face=paper.clone();
            print.color.setHex(0xc3998c);face.color.setHex(0xeeddd0);
            print.alphaTest=.4;face.alphaTest=.4;face.flatShading=false;
            if(h.renderer?.isWebGLRenderer){
                const loader=new T.TextureLoader();
                for(const [material,file] of [[print,'bride-crown-and-robe'],[face,'red-bridal-veil']]){
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
            const bodice=shell([[.355,.06],[.335,.32],[.25,.75],[.193,.94],[.235,1.10],[.26,1.19],[.225,1.24],[.106,1.315]],32);
            const fabric=bodice.attributes.position;
            for(let i=0;i<fabric.count;i++){
                const x=fabric.getX(i),y=fabric.getY(i),z=fabric.getZ(i);
                const angle=Math.atan2(x,z), fullness=1-smooth(y,.25,1.10);
                const pleat=1-.071*fullness*(1+Math.cos(12*angle));
                fabric.setXYZ(i,x*pleat,y+.009*fullness*Math.sin(5*angle),z*pleat);
                bodice.attributes.uv.setY(i,(y-.06)/1.255);
            }
            bodice.computeVertexNormals();
            this.coat=part('pasted-paper-robe',printed(bodice,.02,.41,.98,.987),print);
            this.coat.scale.z=.69;
            // The two pasted jacket fronts overlap diagonally, from throat to the side fastening.
            const lapel=new T.PlaneGeometry(1,1,4,16), edge=lapel.attributes.position;
            for(let i=0;i<edge.count;i++){
                const u=edge.getX(i)+.5,t=.5-edge.getY(i);
                edge.setXYZ(i,-.079+.24*t+(u-.5)*.046,1.30-.28*t,.069+.105*Math.sin(Math.PI*t*.78)-.025*t);
            }
            lapel.computeVertexNormals();
            part('crossed-jacket-binding',printed(lapel,.084,.32,.16,.66),face);
            this.head=new T.Group();this.root.add(this.head);this.head.position.set(0,1.62,.03);
            this.head.name='bridal-head';
            // Each row follows the silhouette of the pasted hood. The front carries the
            // painted face, while the back samples unprinted red paper from the same sheet.
            const rows=[
                // Distance from crown, half-width in texture space, depth in metres.
                [0,.025,.008],[.012,.14,.058],[.032,.224,.099],[.055,.267,.120],
                [.10,.309,.133],[.20,.357,.142],[.30,.392,.146],[.40,.427,.15],
                [.50,.463,.156],[.60,.491,.153],[.70,.497,.151],[.8,.493,.147],
                [.9,.485,.14],[1,.47,.13]
            ];
            for(const back of [false,true]){
                const columns=32, sheet=new T.PlaneGeometry(1,1,columns,rows.length-1);
                const pos=sheet.attributes.position, uv=sheet.attributes.uv;
                rows.forEach(([v,r,depth],row)=>{
                    for(let col=0;col<=columns;col++){
                        const a=(col/columns-.5)*Math.PI+(back?Math.PI:0);
                        const side=Math.sin(a), front=Math.cos(a), index=row*(columns+1)+col;
                        const u=.5+r*side;
                        const pleat=.014*Math.sin(a*11)*v*Math.min(1,Math.abs(side)*2);
                        const nose=!back?.019*Math.exp(-((u-.50)**2/.003+(v-.46)**2/.006)):0;
                        pos.setXYZ(index,(.49*r+pleat)*side,.245-.72*v,depth*front+pleat*front+nose);
                        uv.setXY(index,back?.29+.34*col/columns:u,1-(back?.055+.19*v:v));
                    }
                });
                // The back has its own torn hem above the two longer front corners.
                if(back)for(let col=0;col<=columns;col++){
                    const i=(rows.length-1)*(columns+1)+col;
                    pos.setY(i,pos.getY(i)+.072*Math.sin(Math.PI*col/columns));
                }
                sheet.computeVertexNormals();
                part(back?'back-of-paper-veil':'effigy-painted-face',sheet,face,this.head);
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
            this.coat.rotation.x=climb?.085*crest-.07*land:.025;
            this.feet.forEach((leg,i)=>{leg.rotation.x=climb?.64*(crest-land):.14*Math.sin(t*6+i*Math.PI);});
            this.head.rotation.z=climb?-.035+.05*smooth(t,4.9,5.7):.018;
            this.head.rotation.x=climb?.43-.49*smooth(t,3.8,5.4):.035;
            for(const {side,upper,lower,hand} of this.arms){
                const shoulder=new T.Vector3(side*.22,1.20,.075);
                const grip=smooth(t,side<0?.25:1.05,side<0?2.7:3.3);
                const release=smooth(t,5.4+(side+1)*.32,7.85);
                const palm=climb ? new T.Vector3(side*.26,
                    T.MathUtils.lerp(.62+grip*.305-root.position.y,.70,release),
                    T.MathUtils.lerp(-21.36-root.position.z,.28,release))
                    : new T.Vector3(side*.23,.69+.016*Math.cos(t*4+side),.12+.029*Math.sin(t*4+side));
                // The hands come out separately, hold the rim while the body rises, then release.
                if(climb)palm.y-=.78*(1-grip);
                const elbow=shoulder.clone().lerp(palm,.48);elbow.x+=side*(climb?.075:.032);elbow.z-=.125;
                for(const [mesh,a,b] of [[upper,shoulder,elbow],[lower,elbow,palm]]){
                    const d=b.clone().sub(a);mesh.position.copy(a).lerp(b,.5);mesh.scale.y=d.length()+.024;
                    mesh.quaternion.setFromUnitVectors(this.up,d.normalize());
                }
                hand.position.copy(palm);
            }
        }
        begin(){
            if(this.phase==='film' || this.phase==='chase' || this.house.story.state.memory)return;
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
            this.trail=[this.root.position.clone()];
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
        // Save the turns actually walked. A repeated corner cuts a loop out of the return trip.
        markCorner(){
            const p=this.root.position;
            const index=this.trail.findIndex(q=>Math.hypot(p.x-q.x,p.z-q.z)<.015);
            if(index<0)this.trail.push(p.clone());
            else this.trail.length=index+1;
        }
        retreat(dt){
            const root=this.root;
            if(this.phase==='lowering'){
                this.time-=dt*1.62;
                this.pose(Math.max(0,this.time),true);
                const turn=T.MathUtils.euclideanModulo(this.lastHeading-root.rotation.y+Math.PI,2*Math.PI)-Math.PI;
                root.rotation.y+=turn*smooth(this.time,6.6,8);
                if(this.time<0)root.position.y+=this.time;
                if(this.time<=-.85){
                    this.phase='quiet';root.visible=false;
                    this.house.onWatchEvent?.('submerged',0);
                }
                return;
            }
            this.time+=dt;
            if(this.time<.8)return;
            const target=this.trail.at(-1),p=root.position;
            const dx=target.x-p.x,dz=target.z-p.z,d=Math.hypot(dx,dz);
            if(d>.001){
                const fraction=Math.min(1,1.75*dt/d);
                p.x+=dx*fraction;p.z+=dz*fraction;
                const yaw=Math.atan2(-dx,-dz);
                const turn=T.MathUtils.euclideanModulo(yaw-root.rotation.y+Math.PI,2*Math.PI)-Math.PI;
                root.rotation.y+=turn*Math.min(1,dt*5);
                this.pose(-this.time,false);
                if(fraction<1)return;
            }
            this.trail.pop();
            if(!this.trail.length){
                this.phase='lowering';this.time=8;this.lastHeading=root.rotation.y;
            }
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
            if(!s.opened || s.memory)return;
            if(this.phase==='retreat' || this.phase==='lowering'){
                if(!h.isPaused() || (h.inspectionKind==='wellSeat' && !h.isReading?.()))this.retreat(dt);
                return;
            }
            if(h.isPaused())return;
            if(inKitchen(p) && !s.crossedYard){
                s.crossedYard=true;h.story.save(h.controls.snapshot());h.courtyard.syncMask();
            }
            if(this.phase!=='chase')return;
            if(inKitchen(p)||p.z> -14.25||p.x< -6.12){
                this.phase='retreat';this.time=0;s.wellEscaped=true;h.story.save(h.controls.snapshot());
                h.onWatchEvent?.('safe',0);return;
            }
            this.time+=dt;this.pose(this.time,false);
            if(this.time<.6)return;
            this.plan-=dt;
            if(this.plan<=0){
                this.markCorner();
                this.route=this.pathTo(p);this.plan=.57;
            }
            const pos=this.root.position,target=this.route[0]||p;
            const speed=1.1+1.62*smooth(this.time,.6,1.9);
            const dx=target.x-pos.x,dz=target.z-pos.z,d=Math.hypot(dx,dz),stride=Math.min(d,dt*speed);
            if(d>.001){
                const x=pos.x+dx/d*stride,z=pos.z+dz/d*stride;
                if(h.controls.canOccupy(x,z)){pos.x=x;pos.z=z;}
                const turn=T.MathUtils.euclideanModulo(Math.atan2(dx,dz)-this.root.rotation.y+Math.PI,2*Math.PI)-Math.PI;
                this.root.rotation.y+=turn*(1-Math.exp(-dt*8));
            }
            if(d<=stride+.012){this.markCorner();this.route.shift();}
            pos.y=.009*Math.sin(this.time*6)**2;
            if((this.step-=dt)<=0){
                this.step=.44;const right=h.camera.matrixWorld.elements,dx=pos.x-p.x,dz=pos.z-p.z;
                h.onWatchEvent?.('step',(dx*right[0]+dz*right[2])/Math.max(1,Math.hypot(dx,dz)));
            }
            if(this.time>=1.9 && Math.hypot(pos.x-p.x,pos.z-p.z)<.56){
                this.phase='quiet';this.root.visible=false;h.controls.teleport({x:0,z:-14.75,yaw:Math.PI,pitch:0});
                h.story.save(h.controls.snapshot());h.onWatchEvent?.('caught',0);
            }
        }
    }
    game.ThreeWellChase=ThreeWellChase;
})(window);
