(function(global){
    const game=global.Huisha3D,T=global.THREE;
    const smooth=(t,a,b)=>T.MathUtils.smoothstep(t,a,b);
    const upperLength=.365,lowerLength=.35;
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
            // Put the lower panel caught on the stone last in the index buffer. Removing
            // only those triangles leaves the printed pattern either side of the tear intact.
            const fixed=[],snag=[];
            const indices=bodice.index.array;
            for(let i=0;i<indices.length;i+=3){
                const [a,b,c]=indices.subarray(i,i+3);
                const x=fabric.getX(a)+fabric.getX(b)+fabric.getX(c);
                const z=fabric.getZ(a)+fabric.getZ(b)+fabric.getZ(c);
                const angle=Math.atan2(x,z),height=(fabric.getY(a)+fabric.getY(b)+fabric.getY(c))/3;
                const edge=Math.abs(angle+2.22);
                (edge<.45 && height<.33-.14*edge/.45?snag:fixed).push(a,b,c);
            }
            this.tornIndexCount=fixed.length;
            bodice.setIndex(fixed.concat(snag));
            bodice.computeVertexNormals();
            this.coat=part('pasted-paper-robe',printed(bodice,.02,.41,.98,.987),print);
            this.setHemTorn(h.story.state.wellEscaped);
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
                const sleeve=shell([[.088,-.50],[.090,-.26],[.11,.25],[.117,.48],[.116,.50],[.105,.50],[.104,.40]],14);
                const lower=part('paper-sleeve',printed(sleeve,.03,.57,.31,.987),print);
                const lining=part('inside-cuff',new T.CircleGeometry(.104,14),black,lower);
                lining.position.y=.39;lining.rotation.x=-Math.PI/2;
                const hand=new T.Group();this.root.add(hand);
                const palm=part('paper-mitten',new T.SphereGeometry(1,12,6),paper,hand);
                palm.scale.set(.047,.015,.060);
                const sliver=part('split-cane-wrist',new T.BoxGeometry(.009,.004,.079),bamboo,hand);
                sliver.position.set(side*.021,.012,-.032);sliver.rotation.y=side*.08;
                const fingers=new T.Group();fingers.position.z=.039;hand.add(fingers);
                for(let i=0;i<4;i++){
                    const length=[.067,.076,.070,.053][i];
                    const finger=shell([[.007,0],[.009,length*.25],[.008,length*.56],[.005,length*.91],[.002,length]],7);
                    const points=finger.attributes.position;
                    for(let j=0;j<points.count;j++){
                        const along=points.getY(j);
                        points.setXYZ(j,points.getX(j),-points.getZ(j)*.65-.021*smooth(along,length*.45,length),along);
                    }
                    finger.computeVertexNormals();
                    const digit=part('folded-paper-finger',finger,paper,fingers);
                    digit.position.set(side*(i-1.5)*.019,-.003,0);digit.rotation.y=side*(i-1.5)*.055;
                }
                const thumb=part('pasted-thumb',new T.CylinderGeometry(.008,.014,.054,5),paper,hand);
                thumb.position.set(-side*.046,-.002,.009);thumb.rotation.set(.94,0,side*.64);
                return {side,upper,lower,hand,fingers,shoulder:new T.Vector3(side*.22,1.20,.075)};
            });
            this.up=new T.Vector3(0,1,0);
            this.wrist=new T.Vector3();this.stone=new T.Vector3();this.axis=new T.Vector3();
            this.bend=new T.Vector3();this.elbow=new T.Vector3();this.segment=new T.Vector3();
        }
        pose(t,climb){
            const root=this.root, reach=smooth(t,.18,1.78),rise=smooth(t,2.65,4.14);
            const crest=smooth(t,4.88,6.62),land=smooth(t,7.15,7.96);
            if(climb){
                root.position.set(-3,-1.48+.59*reach+.70*rise+1.12*crest-.93*land,
                    -21.95+.20*reach+.10*rise+.26*crest+.74*smooth(t,6.32,7.69));
                root.rotation.y=.06+.37*smooth(t,5.46,6.74);
            }
            this.coat.rotation.x=climb?.085*crest-.07*land:.025;
            this.feet.forEach((leg,i)=>{leg.rotation.x=climb?.64*(crest-land):.14*Math.sin(t*6+i*Math.PI);});
            this.head.rotation.z=climb?-.035+.05*smooth(t,4.9,5.7):.018;
            this.head.rotation.x=climb?.53-.55*smooth(t,4.20,4.76):.035;
            this.head.rotation.y=climb?-.38+.66*smooth(t,4.27,4.73)-.28*crest:0;
            for(const {side,upper,lower,hand,fingers,shoulder} of this.arms){
                const grip=smooth(t,side<0?.30:1.38,side<0?1.74:2.47);
                const release=smooth(t,side<0?5.16:5.42,side<0?5.85:6.09);
                const palm=this.wrist.set(side*.265,.60,.17);
                if(climb){
                    const contact=this.stone.set(-3+side*.25,.897,-21.41);
                    root.worldToLocal(contact);
                    palm.lerp(contact,grip*(1-release));
                }
                // Bend the two fixed bamboo spars toward the requested wrist position.
                const axis=this.axis.subVectors(palm,shoulder);
                const span=T.MathUtils.clamp(axis.length(),.10,upperLength+lowerLength-.002);
                axis.normalize();palm.copy(shoulder).addScaledVector(axis,span);
                const along=(upperLength**2-lowerLength**2+span**2)/(2*span);
                const bend=this.bend.set(side*.48,-.19,-1);
                bend.addScaledVector(axis,-bend.dot(axis)).normalize();
                const elbow=this.elbow.copy(shoulder).addScaledVector(axis,along).addScaledVector(bend,Math.sqrt(upperLength**2-along**2));
                for(const [mesh,a,b] of [[upper,shoulder,elbow],[lower,elbow,palm]]){
                    const d=this.segment.subVectors(b,a);mesh.position.copy(a).lerp(b,.5);mesh.scale.y=d.length()+.024;
                    mesh.quaternion.setFromUnitVectors(this.up,d.normalize());
                }
                hand.position.copy(palm);
                const planted=climb?grip*(1-release):0;
                hand.rotation.set(1.31*(1-planted),-root.rotation.y*planted,side*.08*(1-planted),'YXZ');
                fingers.rotation.x=.15+.42*planted;
            }
        }
        setHemTorn(torn){
            this.hemTorn=torn;
            this.coat.geometry.setDrawRange(0,torn?this.tornIndexCount:Infinity);
        }
        begin(){
            if(this.phase==='film' || this.phase==='chase' || this.house.story.state.memory)return;
            const h=this.house;this.returnPose=h.controls.snapshot();this.time=0;this.phase='film';
            this.doorwayCall=null;
            this.setHemTorn(h.story.state.wellEscaped);
            if(!h.story.state.wellRopeFreed){
                h.story.state.wellRopeFreed=true;h.story.save(this.returnPose);
            }
            this.root.visible=true;h.controls.clear();this.pose(0,true);this.frameFilm();
            h.onWatchEvent?.('film',0);
        }
        frameFilm(){
            const h=this.house,t=this.time;
            const pull=h.reducedMotion?.matches?1:smooth(t,4.82,7.65);
            h.camera.position.set(-2.42+.91*pull,1.25+.43*pull,-20.63+1.44*pull);
            const face=smooth(t,2.58,4.08);
            const rise=T.MathUtils.clamp(this.root.position.y+1.57,.90,2.26);
            h.camera.lookAt(-3-.18*(1-face),T.MathUtils.lerp(.91,rise,face)-.14*pull,-21.45+.60*pull);
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
        canCallFromDoorway(){
            if(this.house.inspectionKind!=='wellSeat' || this.doorwayCall)return false;
            return this.phase==='retreat' || (this.phase==='lowering' && this.time>4.85);
        }
        callFromDoorway(){
            if(!this.canCallFromDoorway())return false;
            this.doorwayCall={elapsed:0,finished:false};
            return true;
        }
        retreat(dt){
            const root=this.root;
            const call=this.doorwayCall;
            // She gives no answer until she has reached the well, in view of the kitchen.
            if(call && !call.finished && this.phase==='lowering' && this.time<=6.50){
                if(call.elapsed===0){
                    call.originalYaw=this.head.rotation.y;call.originalTilt=this.head.rotation.x;
                    const towardDoor=Math.atan2(6.40-root.position.x,-20.30-root.position.z)-root.rotation.y;
                    call.turn=T.MathUtils.clamp(T.MathUtils.euclideanModulo(towardDoor+Math.PI,2*Math.PI)-Math.PI,-1.18,1.18);
                }
                const previous=call.elapsed;call.elapsed+=dt;
                const glance=smooth(call.elapsed,.14,.63)*(1-smooth(call.elapsed,1.45,1.95));
                this.head.rotation.y=T.MathUtils.lerp(call.originalYaw,call.turn,glance);
                this.head.rotation.x=call.originalTilt-.095*glance;
                if(previous<.66 && call.elapsed>=.66)this.house.onWatchEvent?.('glance',0);
                if(call.elapsed>=1.95)call.finished=true;
                return;
            }
            if(this.phase==='lowering'){
                this.time-=dt*1.62;
                this.pose(Math.max(0,this.time),true);
                if(!this.hemTorn && this.time<6.4){
                    this.setHemTorn(true);
                    this.house.onWatchEvent?.('crease',0);
                }
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
                for(const beat of [1.74,2.47])if(previous<beat && this.time>=beat)h.onWatchEvent?.('crease',0);
                if(previous<7.96 && this.time>=7.96)h.onWatchEvent?.('land',0);
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
            const bearing=Math.atan2(p.x-pos.x,p.z-pos.z);
            const glance=T.MathUtils.euclideanModulo(bearing-this.root.rotation.y+Math.PI,2*Math.PI)-Math.PI;
            this.head.rotation.y=T.MathUtils.clamp(glance,-.50,.50)*smooth(this.time,.60,1.05);
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
