(function (global) {
    const game = global.Huisha3D, THREE = global.THREE;
    class ThreeDocument {
        constructor(house) { this.house = house; this.papers = new Map(); this.activeId = null; }
        build(parent) {
            const h = this.house;
            for (const [id, definition] of Object.entries(game.DOCUMENTS)) {
                if (definition.space !== parent.userData.memorySpace || this.papers.has(id)) continue;
                const root = new THREE.Group(); root.name = `document-${id}`;
                root.position.set(...definition.position); root.rotation.set(...(definition.rotation || [-Math.PI / 2, 0, 0])); parent.add(root);
                const sheet = new THREE.PlaneGeometry(0.38, 0.54, 12, 16), vertices = sheet.attributes.position;
                for (let i = 0; i < vertices.count; i++) {
                    const x = vertices.getX(i), y = vertices.getY(i);
                    vertices.setZ(i, Math.pow(Math.abs(x) / 0.19, 4) * 0.002 + Math.exp(-Math.pow(y / 0.025, 2)) * 0.002 + Math.sin((x + 0.11) * 17) * 0.0006);
                }
                sheet.computeVertexNormals();
                const front = h.mesh(`${id}-front`, sheet, this.createFaceMaterial(definition, 'front'), [0, 0, 0.0006], id, root);
                const backGeometry = sheet.clone(), uv = backGeometry.attributes.uv;
                for (let i = 0; i < uv.count; i++) uv.setX(i, 1 - uv.getX(i));
                const back = h.mesh(`${id}-back`, backGeometry, this.createFaceMaterial(definition, 'back'), [0, 0, -0.0006], id, root);
                this.papers.set(id, { root, front, back, home: root.position.clone(), homeRotation: root.rotation.clone() });
            }
        }
        createFaceMaterial(definition, face) {
            const canvas = document.createElement('canvas'); canvas.width = 768; canvas.height = 1024;
            const ctx = canvas.getContext('2d'), data = definition.faces[face];
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
            return new THREE.MeshStandardMaterial({ map: texture, roughness: 0.95, side: face === 'front' ? THREE.FrontSide : THREE.BackSide });
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
            const distance = Math.max(0.55 / (2 * tangent * (side ? 0.8 : 0.48)), 0.39 / (2 * tangent * camera.aspect * (side ? 0.55 : 0.88)));
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
            const paper = this.papers.get(this.activeId);
            if (paper) { paper.root.position.copy(paper.home); paper.root.rotation.copy(paper.homeRotation); }
            this.activeId = null;
        }
    }
    game.ThreeDocument = ThreeDocument;
})(window);
