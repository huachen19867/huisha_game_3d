(function (global) {
    const game = global.Huisha3D, T = global.THREE;
    const origin = { x: -.9, z: -26.55 }, reach = 12.3, halfAngle = .25;
    const kitchen = p => p.x > 6.12 && p.z > -23.48 && p.z < -19.5;

    // The lamp sweeps a sector. The roofed walkways and the well interrupt its view.
    function illuminated(p, angle) {
        if (Math.abs(p.x) > 4.38 || p.z > -15.25) return false;
        const dx = p.x-origin.x, dz = p.z-origin.z, d2 = dx*dx+dz*dz;
        if (dz <= 0 || d2 > reach*reach || Math.abs(Math.atan2(dx,dz)-angle) > halfAngle) return false;
        const t = ((-3-origin.x)*dx+(-22-origin.z)*dz)/d2;
        return !(t > 0 && t < 1 && Math.hypot(origin.x+t*dx+3,origin.z+t*dz+22) < .79);
    }
    function robe(radius, height, profile) {
        const geometry = new T.LatheGeometry(profile.map(([r,y]) => new T.Vector2(r*radius,y*height)),36);
        const pos = geometry.attributes.position;
        for (let i=0;i<pos.count;i++) {
            const x=pos.getX(i),z=pos.getZ(i),y=pos.getY(i);
            const a=Math.atan2(x,z),fold=1+(.05+.06*(1-y/height))*Math.cos(a*10+1.2*y);
            pos.setXYZ(i,x*fold,y+.015*Math.cos(a*9)*(1-y/height),z*fold*.74);
        }
        geometry.computeVertexNormals();return geometry;
    }
    class ThreeYardWatch {
        constructor(house) {
            this.house=house; this.root=new T.Group(); this.root.name='yard-paper-watch';
            this.root.position.set(origin.x,0,origin.z); (house.homeRoot || house.scene).add(this.root);
            this.time=0; this.alarm=0; this.previous=null;
            const m=house.materials;
            const fabric=new T.MeshStandardMaterial({color:0x716955,roughness:.98,side:T.DoubleSide});
            const skin=new T.MeshStandardMaterial({color:0xaf986b,roughness:.92});
            const lampPaper=new T.MeshStandardMaterial({color:0xedca8a,emissive:0xee9c49,emissiveIntensity:.9,roughness:.82});
            const put=(name,geo,mat,xyz,parent=this.body)=>house.mesh(name,geo,mat,xyz,undefined,parent,false);
            this.body=new T.Group(); this.root.add(this.body);
            const bell=[[.86,0],[1,.04],[.83,.34],[.65,.63],[.76,.89],[.59,.96],[.28,1]];
            put('paper-mourning-coat',robe(.40,1.32,bell),fabric,[0,.10,0]);
            for(const side of [-1,1]) {
                const sleeve=put('paper-folded-sleeve',robe(.155,.60,[[1,0],[.91,.12],[.72,.70],[.57,1]]),fabric,[side*.33,.78,.05]);
                sleeve.rotation.z=side*.24;
                const shoe=put('cloth-shoe',new T.SphereGeometry(.12,12,9),m.cloth,[side*.16,.08,.07]);
                shoe.scale.set(.65,.56,1.6);
            }
            const head=put('pasteboard-mask',new T.SphereGeometry(.17,16,12),skin,[0,1.57,.07]);
            head.scale.set(.83,1.27,.76);
            const hood=put('folded-funeral-hood',robe(.24,.46,[[.96,0],[1,.16],[.75,.63],[.16,1]]),fabric,[0,1.41,-.045]);
            hood.rotation.x=-.18;
            for(const side of [-1,1]) {
                const eye=put('ink-eye',new T.SphereGeometry(.024,10,6),m.cloth,[side*.056,1.61,.187]);
                eye.scale.set(1.18,.32,.34);eye.rotation.z=side*.22;
                const blush=put('vermilion-cheek',new T.SphereGeometry(.031,12,8),m.red,[side*.083,1.55,.164]);
                blush.scale.set(1,.67,.22);
                const lapel=put('folded-paper-lapel',new T.BoxGeometry(.084,.42,.016),skin,[side*.075,1.17,.192]);
                lapel.rotation.z=side*-.35;
                const tail=put('mourning-tie',new T.BoxGeometry(.038,.29,.014),skin,[side*.064,.77,.175]);
                tail.rotation.z=side*.12;
            }
            const belt=put('tied-waist',new T.CylinderGeometry(.267,.271,.085,24),m.cloth,[0,.91,0]);
            belt.scale.z=.79;
            put('lantern-wire',new T.TorusGeometry(.117,.008,6,28,Math.PI),m.brass,[.33,.92,.19]);
            put('lantern-paper',robe(.15,.31,[[.68,0],[.96,.14],[1,.5],[.94,.86],[.64,1]]),lampPaper,[.33,.61,.19]);
            for(const y of [.61,.92]) put('lantern-cap',new T.CylinderGeometry(.116,.12,.035,16),m.darkWood,[.33,y,.19]);
            for(const y of [.67,.72,.77,.82,.87]){
                const rib=put('bamboo-lantern-rib',new T.TorusGeometry(.14,.006,5,24),m.wood,[.33,y,.19]);
                rib.scale.y=.75;rib.rotation.x=Math.PI/2;
            }
            this.light=new T.SpotLight(0xffc281,30,reach+1,halfAngle,.55,1.3);
            this.light.position.set(0,1.1,0);this.root.add(this.light,this.light.target);
            // A translucent footprint keeps the approaching light readable on dark paving.
            const points=[];
            for(let i=0;i<28;i++){
                const a=-halfAngle+2*halfAngle*i/28,b=a+2*halfAngle/28;
                points.push(0,0,0,reach*Math.sin(b),0,reach*Math.cos(b),reach*Math.sin(a),0,reach*Math.cos(a));
            }
            const geo=new T.BufferGeometry();
            geo.setAttribute('position',new T.Float32BufferAttribute(points,3));
            const poolMaterial=new T.ShaderMaterial({transparent:true,blending:T.AdditiveBlending,side:T.DoubleSide,depthWrite:false,
                vertexShader:`varying vec2 worldXZ; varying vec2 localXZ;
                    void main(){localXZ=position.xz;vec4 p=modelMatrix*vec4(position,1.0);worldXZ=p.xz;gl_Position=projectionMatrix*viewMatrix*p;}`,
                fragmentShader:`varying vec2 worldXZ;varying vec2 localXZ;
                    void main(){
                        vec2 delta=worldXZ-vec2(-.9,-26.55),well=vec2(-2.1,4.55);
                        float t=clamp(dot(well,delta)/max(.001,dot(delta,delta)),0.,1.);
                        float shade=smoothstep(.72,.87,length(delta*t-well))*(1.-smoothstep(4.24,4.39,abs(worldXZ.x)));
                        float edge=1.-smoothstep(.17,.25,abs(atan(localXZ.x,max(.001,localXZ.y))));
                        float fade=1.-smoothstep(8.,12.3,length(localXZ));
                        gl_FragColor=vec4(.55,.30,.10,shade*edge*fade*.38);
                    }`});
            this.pool=put('lantern-light-on-paving',geo,poolMaterial,[0,.038,0],this.root);
            this.root.visible=false;this.lastCue='';
        }
        cue(kind) {
            if (kind===this.lastCue) return;
            this.lastCue=kind;
            const camera=this.house.camera;
            const dx=origin.x-camera.position.x, dz=origin.z-camera.position.z;
            const right=camera.matrixWorld.elements;
            const pan=(dx*right[0]+dz*right[2])/Math.max(.01,Math.hypot(dx,dz));
            this.house.onWatchEvent?.(kind,pan);
        }
        update(dt) {
            const h=this.house,s=h.story.state,p=h.camera.position;
            if (h.isPaused()) return;
            if (!s.opened || s.memory || s.crossedYard || s.waterSolved || p.z > -15.25) {
                this.root.visible=false;this.alarm=0;this.previous=null;this.cue('');return;
            }
            if (kitchen(p)) {
                s.crossedYard=true;h.story.save(h.controls.snapshot());
                this.root.visible=false;this.previous=null;this.alarm=0;this.cue('safe');return;
            }
            if (!this.previous) {this.time=-1.2;this.alarm=0;this.previous={x:p.x,z:p.z};}
            this.root.visible=true;this.time+=dt;
            const angle=.14+.82*Math.sin(this.time*.78);
            this.pool.rotation.y=this.body.rotation.y=angle;
            this.light.target.position.set(Math.sin(angle)*9,.10,Math.cos(angle)*9);
            const distance=Math.hypot(p.x-this.previous.x,p.z-this.previous.z);
            this.previous.x=p.x;this.previous.z=p.z;
            const seen=illuminated(p,angle),moving=distance>.04*dt && distance<1;
            this.alarm=Math.max(0,this.alarm+(seen&&moving&&this.time>0 ? dt : -dt*1.7));
            if (this.alarm>=.92) {
                h.controls.teleport({x:0,z:-14.75,yaw:Math.PI,pitch:0});h.story.save(h.controls.snapshot());
                this.alarm=0;this.previous=null;this.root.visible=false;this.cue('caught');return;
            }
            this.cue(this.alarm>.3?'warning':seen?'still':'yard');
        }
    }
    game.ThreeYardWatch=ThreeYardWatch;
})(window);
