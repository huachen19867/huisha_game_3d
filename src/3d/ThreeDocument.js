(function (global) {
    const copyText=global.HuishaCopy;
    const game = global.Huisha3D, THREE = global.THREE;
    class ThreeDocument {
        constructor(house) { this.house = house; this.papers = new Map(); this.activeId = null; }
        build(parent) {
            const h = this.house;
            for (const [id, definition] of Object.entries(game.DOCUMENTS)) {
                if (definition.space !== parent.userData.memorySpace || this.papers.has(id)) continue;
                const root = new THREE.Group(); root.name = `document-${id}`;
                root.position.set(...definition.position); root.rotation.set(...(definition.rotation || [-Math.PI / 2, 0, 0])); parent.add(root);
                const sheet = new THREE.PlaneGeometry(0.38, 0.54, 12, definition.style==='torn'?38:16), vertices = sheet.attributes.position;
                for (let i = 0; i < vertices.count; i++) {
                    const x = vertices.getX(i), y = vertices.getY(i);
                    if(definition.style==='torn' && i%13===6){
                        const edge=.004*Math.sin(i*1.73)+.005*Math.cos(i*.63);
                        vertices.setX(i,edge);sheet.attributes.uv.setX(i,.5+edge/.38);
                    }
                    vertices.setZ(i, Math.pow(Math.abs(x) / 0.19, 4) * 0.002 + Math.exp(-Math.pow(y / 0.025, 2)) * 0.002 + Math.sin((x + 0.11) * 17) * 0.0006);
                }
                sheet.computeVertexNormals();
                const front = h.mesh(`${id}-front`, sheet, this.createFaceMaterial(definition, 'front'), [0, 0, 0.0006], id, root);
                const backGeometry = sheet.clone(), uv = backGeometry.attributes.uv;
                for (let i = 0; i < uv.count; i++) uv.setX(i, 1 - uv.getX(i));
                const back = h.mesh(`${id}-back`, backGeometry, this.createFaceMaterial(definition, 'back'), [0, 0, -0.0006], id, root);
                if(definition.style==='torn'){
                    this.loosePiece=new THREE.Group();root.add(this.loosePiece);
                    for(const surface of [front,back]){
                        const geometry=surface.geometry, right=geometry.clone();
                        const leftFaces=[],rightFaces=[],indices=geometry.index.array;
                        for(let i=0;i<indices.length;i+=3){
                            const triangle=[indices[i],indices[i+1],indices[i+2]];
                            (triangle.some(index=>index%13<6)?leftFaces:rightFaces).push(...triangle);
                        }
                        geometry.setIndex(leftFaces);right.setIndex(rightFaces);
                        h.mesh(surface.name+'-right',right,surface.material,surface.position.toArray(),id,this.loosePiece);
                    }
                    this.syncTear();
                }
                this.papers.set(id, { root, front, back, home: root.position.clone(), homeRotation: root.rotation.clone() });
            }
        }
        syncTear(){
            if(!this.loosePiece) return;
            const gap=this.house.story.state.formJoined?0:(this.tearDrag?.gap ?? 1);
            this.loosePiece.position.set(.0014+.056*gap,-.034*gap,0);
            this.loosePiece.rotation.z=-.13*gap;
        }
        grabTear(x,y){
            if(this.activeId!=='school_draft' || this.house.story.state.formJoined || !this.visibleFace) return false;
            const h=this.house, bounds=h.renderer.domElement.getBoundingClientRect(), piece=this.loosePiece;
            const pointer=new THREE.Vector2((x-bounds.left)*2/bounds.width-1,1-(y-bounds.top)*2/bounds.height);
            const ray=new THREE.Raycaster();ray.setFromCamera(pointer,h.camera);
            const hit=ray.intersectObject(piece,true)[0];if(!hit) return false;
            const from=hit.point.clone().project(h.camera);
            const to=piece.parent.localToWorld(piece.worldToLocal(hit.point.clone())).project(h.camera);
            const dx=(to.x-from.x)*bounds.width/2,dy=(from.y-to.y)*bounds.height/2;
            if(Math.hypot(dx,dy)<1) return false;
            this.tearDrag={x,y,dx,dy,gap:1};return true;
        }
        slideTear(x,y){
            const drag=this.tearDrag;if(!drag) return;
            const progress=((x-drag.x)*drag.dx+(y-drag.y)*drag.dy)/(drag.dx**2+drag.dy**2);
            drag.gap=THREE.MathUtils.clamp(1-progress,0,1);this.syncTear();
        }
        releaseTear(){
            const aligned=this.tearDrag?.gap<=.18;
            this.tearDrag=null;this.syncTear();return aligned;
        }
        createFaceMaterial(definition, face) {
            const canvas = document.createElement('canvas'); canvas.width = 768; canvas.height = 1024;
            const ctx = canvas.getContext('2d'), data = definition.faces[face];
            if(definition.style==='torn'){
                this.drawDraft(ctx,face,data.lines);
                const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
                this.house.textures.push(texture);
                return new THREE.MeshBasicMaterial({map:texture,toneMapped:false,side:face==='front'?THREE.FrontSide:THREE.BackSide});
            }
            const medical = definition.style === 'medical';
            ctx.fillStyle = medical ? '#d6dad0' : face === 'front' ? '#cbbb93' : '#c7b68e'; ctx.fillRect(0, 0, 768, 1024);
            ctx.fillStyle = medical ? '#bbc5bd' : '#b3a37e'; ctx.fillRect(0, 503, 768, 5); ctx.fillRect(0, 509, 768, 2);
            ctx.strokeStyle = medical ? '#557f7b' : face === 'front' ? '#8e5241' : '#ad9b76'; ctx.lineWidth = 3; ctx.strokeRect(34, 36, 700, 952);
            ctx.textAlign = 'center';
            data.lines.forEach((line, i) => {
                ctx.fillStyle = medical ? '#314b4a' : face === 'front' && i === 0 ? '#813f32' : '#3e352b';
                ctx.font = `${face === 'front' && i === 0 ? 64 : 46}px ${face === 'back' && !medical ? '"KaiTi", "STKaiti"' : '"SimSun"'}, serif`;
                ctx.fillText(line, 384, 180 + i * 135, 650);
            });
            if (data.signature) { ctx.font = '72px "KaiTi", "STKaiti", serif'; ctx.textAlign = 'right'; ctx.fillText(data.signature, 610, 810); }
            const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; this.house.textures.push(texture);
            if (medical) return new THREE.MeshBasicMaterial({ map: texture, toneMapped: false, side: face === 'front' ? THREE.FrontSide : THREE.BackSide });
            return new THREE.MeshStandardMaterial({ map: texture, roughness: 0.95, side: face === 'front' ? THREE.FrontSide : THREE.BackSide });
        }
        drawDraft(ctx,face,lines){
            ctx.fillStyle='#d7ccac';ctx.fillRect(0,0,768,1024);
            ctx.fillStyle='#d2c5a6';
            for(let i=0;i<890;i++) ctx.fillRect((i*311)%768,(i*173)%1024,2+i%8,2);
            if(face==='back'){
                ctx.fillStyle='#ae956c';ctx.fillRect(181,425,429,69);
                ctx.fillStyle='#b9a27b';ctx.fillRect(185,429,414,60);
                ctx.fillStyle='#9e8864';
                for(let i=0;i<29;i++) ctx.fillRect(182+(i*43)%422,423+(i*17)%67,3,5);
                return;
            }
            ctx.fillStyle='#38463a';ctx.font='34px serif';ctx.fillText(copyText('document.drawdraft'),62,94);
            ctx.fillStyle='#20251e';ctx.font='bold 58px serif';ctx.fillText(lines[0],58,208,647);
            ctx.fillRect(61,247,640,4);ctx.font='46px serif';ctx.fillText(lines[1],68,340);
            ctx.strokeStyle='#526052';ctx.lineWidth=3;ctx.strokeRect(62,401,636,388);
            ctx.fillStyle='#53604f';ctx.fillRect(62,499,636,2);ctx.font='43px serif';ctx.fillText(lines[2],85,472);
            ctx.fillStyle='#2a2922';ctx.font='62px "KaiTi",serif';ctx.fillText(lines[3],98,615,564);ctx.fillText(lines[4],98,728);
            ctx.fillStyle='#304c75';ctx.font='45px "KaiTi",serif';ctx.fillText(copyText('document.drawdraft.2'),142,899,550);
        }
        begin(id) {
            if (!this.papers.has(id)) return false;
            if (this.activeId) this.end();
            this.activeId = id; this.angle = 0; this.tilt = 0;
            const paper = this.papers.get(id); paper.root.position.set(paper.home.x, 1.55, paper.home.z + 0.4); paper.root.rotation.set(0, 0, 0);
            this.frame(); return true;
        }
        frame() {
            const h = this.house, camera = h.camera, paper = this.papers.get(this.activeId); if (!paper) return;
            const height = h.root?.clientHeight || 720, width = h.root?.clientWidth || height * camera.aspect, side = height <= 520 && width > 680;
            camera.fov = 48; camera.setViewOffset(width, height, side ? width * 0.19 : 0, side ? 0 : height * 0.2, width, height);
            const tangent = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
            const torn=this.activeId==='school_draft';
            const distance = Math.max((torn ? .66 : .55) / (2 * tangent * (side ? 0.8 : 0.48)), (torn ? .56 : .39) / (2 * tangent * camera.aspect * (side ? 0.55 : 0.88)));
            const target = paper.root.getWorldPosition(new THREE.Vector3());
            camera.position.copy(target).add(new THREE.Vector3(0, 0, distance)); camera.lookAt(target);
            camera.updateProjectionMatrix(); camera.updateMatrixWorld(true);
        }
        get visibleFace() {
            const paper = this.papers.get(this.activeId); if (!paper) return null;
            const facing = Math.cos(paper.root.rotation.y) * Math.cos(paper.root.rotation.x);
            return facing > 0.9 ? 'front' : facing < -0.9 ? 'back' : null;
        }
        flip() {
            if (!this.activeId) return;
            this.angle = Math.cos(this.angle) < 0 ? Math.round(this.angle / (Math.PI * 2)) * Math.PI * 2
                : Math.round((this.angle - Math.PI) / (Math.PI * 2)) * Math.PI * 2 + Math.PI;
            this.tilt = 0;
        }
        drag(dx, dy) { if (this.activeId) { this.angle += dx * 0.01; this.tilt = Math.max(-0.18, Math.min(0.18, this.tilt + dy * 0.005)); } }
        update(delta) {
            if (this.house.inspectionKind !== 'document' || this.house.isReading?.()) return;
            const paper = this.papers.get(this.activeId); if (!paper) return;
            const blend = this.house.reducedMotion?.matches ? 1 : Math.min(1, delta * 12);
            paper.root.rotation.y += (this.angle - paper.root.rotation.y) * blend;
            paper.root.rotation.x += (this.tilt - paper.root.rotation.x) * blend;
        }
        end() {
            this.releaseTear();
            const paper = this.papers.get(this.activeId);
            if (paper) { paper.root.position.copy(paper.home); paper.root.rotation.copy(paper.homeRotation); }
            this.activeId = null;
        }
    }
    game.ThreeDocument = ThreeDocument;
})(window);
