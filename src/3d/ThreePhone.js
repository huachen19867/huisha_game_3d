(function (global) {
    const copyText=global.HuishaCopy;
    const game = global.Huisha3D, THREE = global.THREE;
    class ThreePhone {
        constructor(house) { this.house = house; this.page = 'home'; }
        build(parent) {
            const h = this.house;
            this.root = new THREE.Group(); this.root.name = 'memory-phone'; parent.add(this.root);
            this.home = new THREE.Vector3(-1.65, 0.654, 1.2);
            const shape = new THREE.Shape(), x = 0.09, y = 0.17, r = 0.018;
            shape.moveTo(-x + r, -y); shape.lineTo(x - r, -y); shape.quadraticCurveTo(x, -y, x, -y + r);
            shape.lineTo(x, y - r); shape.quadraticCurveTo(x, y, x - r, y); shape.lineTo(-x + r, y);
            shape.quadraticCurveTo(-x, y, -x, y - r); shape.lineTo(-x, -y + r); shape.quadraticCurveTo(-x, -y, -x + r, -y);
            h.mesh('phone-body', new THREE.ExtrudeGeometry(shape, { depth: 0.018, bevelEnabled: true, bevelSize: 0.003, bevelThickness: 0.003, bevelSegments: 3, steps: 1 }),
                new THREE.MeshStandardMaterial({ color: 0x252b2d, metalness: 0.55, roughness: 0.32 }), [0, 0, 0], 'crash_phone', this.root);
            this.screen = h.mesh('phone-display', new THREE.PlaneGeometry(0.164, 0.293), this.createScreen(), [0, -0.005, 0.022], 'crash_phone', this.root, false);
            h.box('phone-earpiece', [0.045, 0.003, 0.003], [0, 0.158, 0.022], h.materials.brass, 'crash_phone', this.root, false);
            h.box('phone-side-key', [0.004, 0.045, 0.01], [0.094, 0.065, 0.01], h.materials.brass, 'crash_phone', this.root);
            this.end();
        }
        createScreen() {
            this.canvas = document.createElement('canvas'); this.canvas.width = 768; this.canvas.height = 1280;
            this.ctx = this.canvas.getContext('2d');
            this.texture = new THREE.CanvasTexture(this.canvas); this.texture.colorSpace = THREE.SRGBColorSpace;
            this.house.textures.push(this.texture);
            return new THREE.MeshBasicMaterial({ map: this.texture, toneMapped: false });
        }
        selectPage(page) {
            if (page !== 'home' && !Object.hasOwn(game.PHONE_PAGES, page)) return false;
            this.page = page; this.draw(); return true;
        }
        draw() {
            const ctx = this.ctx; ctx.fillStyle = '#142125'; ctx.fillRect(0, 0, 768, 1280);
            ctx.fillStyle = '#91aaa6'; ctx.font = '38px sans-serif'; ctx.textAlign = 'left'; ctx.fillText(copyText('phone.draw'), 52, 72);
            ctx.fillStyle = '#e1e5d9'; ctx.font = '64px "Microsoft YaHei", sans-serif';
            const definition = game.PHONE_PAGES[this.page]; ctx.fillText(definition?.title || copyText('phone.draw.2'), 52, 188, 665);
            ctx.fillStyle = '#3a5357'; ctx.fillRect(52, 225, 664, 3);
            const lines = definition?.lines || [copyText('memorymap.calls.title'), copyText('memorymap.recording.title'), '', copyText('phone.draw.3')];
            lines.forEach((line, i) => {
                ctx.fillStyle = i === 1 ? '#e5d4ab' : '#c6d2cc'; ctx.font = `${i === 1 ? 74 : 48}px "Microsoft YaHei", sans-serif`;
                ctx.fillText(line, 52, 340 + i * 105, 664);
            });
            for (const [i, page] of ['calls', 'recording'].entries()) {
                ctx.fillStyle = this.page === page ? '#4c615a' : '#24383b'; ctx.fillRect(36 + i * 356, 1060, 340, 130);
                ctx.fillStyle = '#e1e5d9'; ctx.font = '44px "Microsoft YaHei", sans-serif'; ctx.textAlign = 'center';
                ctx.fillText(i ? copyText('phone.draw.4') : copyText('memorymap.calls.title'), 206 + i * 356, 1140, 310); ctx.textAlign = 'left';
            }
            ctx.strokeStyle='rgba(213,230,227,.58)';ctx.lineWidth=2;
            for(const line of [[[768,107],[740,131],[715,134],[689,191],[665,215]],[[740,131],[699,116],[682,93]],[[715,134],[722,180],[708,208]]]){
                ctx.beginPath();ctx.moveTo(...line[0]);for(const point of line.slice(1)) ctx.lineTo(...point);ctx.stroke();
            }
            this.texture.needsUpdate = true;
        }
        begin() { this.root.position.set(-1.65, 1.5, 1.5); this.root.rotation.set(0, 0, 0); this.selectPage('home'); this.frame(); }
        frame() {
            const h = this.house, camera = h.camera, width = h.root?.clientWidth || 1280, height = h.root?.clientHeight || 720;
            const side = height <= 520 && width > 680;
            camera.fov = 45; camera.setViewOffset(width, height, side ? width * 0.19 : 0, side ? 0 : height * 0.2, width, height);
            const tangent = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
            const distance = Math.max(0.36 / (2 * tangent * (side ? 0.8 : 0.48)), 0.2 / (2 * tangent * camera.aspect * (side ? 0.55 : 0.88)));
            const target = this.root.getWorldPosition(new THREE.Vector3());
            camera.position.copy(target).add(new THREE.Vector3(0, 0, distance)); camera.lookAt(target);
            camera.updateProjectionMatrix(); camera.updateMatrixWorld(true);
        }
        pick(clientX, clientY) {
            if (this.house.inspectionKind !== 'phone') return null;
            const h = this.house, bounds = h.renderer.domElement.getBoundingClientRect();
            const point = new THREE.Vector2((clientX - bounds.left) / bounds.width * 2 - 1, 1 - (clientY - bounds.top) / bounds.height * 2);
            h.scene.updateMatrixWorld(true); h.camera.updateMatrixWorld(true);
            const ray = new THREE.Raycaster(); ray.setFromCamera(point, h.camera);
            const hit = ray.intersectObject(this.screen)[0]; if (!hit) return null;
            const x = hit.uv.x * 768, y = (1 - hit.uv.y) * 1280;
            if (y < 1060 || y > 1190) return null;
            return x >= 36 && x <= 376 ? 'calls' : x >= 392 && x <= 732 ? 'recording' : null;
        }
        end() { this.root.position.copy(this.home); this.root.rotation.set(-Math.PI / 2, 0, 0); this.selectPage('home'); }
    }
    game.ThreePhone = ThreePhone;
})(window);
