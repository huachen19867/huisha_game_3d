(function (global) {
    const game = global.Huisha3D, THREE = global.THREE;
    class ThreeWindowWall {
        static build(h, { name, side, x, length, top, bottom = -0.1, center = -0.3, sill = 1.12,
            width = 2.1, height = 1.43, thickness = 0.2, style = 'lattice', parent = h.scene }) {
            const m = h.materials, root = new THREE.Group(); root.name = name;
            root.position.x = side * x; root.rotation.y = -side * Math.PI / 2; parent.add(root);
            const mid = side * center, left = mid - width / 2, right = mid + width / 2, head = sill + height;
            root.userData.windowOpening = { left, right, sill, head, thickness, style };
            const walls = [], frames = [];
            const section = (suffix, size, position) => {
                const mesh = h.box(`${name}-${suffix}`, size, position, m.plaster, undefined, root);
                // All wall pieces sample one continuous wall-sized UV field, including the reveals.
                const { position: vertices, normal, uv } = mesh.geometry.attributes;
                for (let i = 0; i < vertices.count; i++) {
                    const px = vertices.getX(i) + position[0], py = vertices.getY(i) + position[1], pz = vertices.getZ(i);
                    uv.setXY(i, (Math.abs(normal.getX(i)) > 0.5 ? pz : px + length / 2) / length,
                        Math.abs(normal.getY(i)) > 0.5 ? pz / length : (py - bottom) / (top - bottom));
                }
                walls.push(mesh); return mesh;
            };
            const leftWidth = left + length / 2, rightWidth = length / 2 - right;
            section('pier-left', [leftWidth, top - bottom, thickness], [-length / 2 + leftWidth / 2, (top + bottom) / 2, 0]);
            section('pier-right', [rightWidth, top - bottom, thickness], [length / 2 - rightWidth / 2, (top + bottom) / 2, 0]);
            section('below-window', [width, sill - bottom, thickness], [mid, (sill + bottom) / 2, 0]);
            section('above-window', [width, top - head, thickness], [mid, (top + head) / 2, 0]);
            if (!h.windowMaterials) h.windowMaterials = {
                frame: new THREE.MeshStandardMaterial({ color: 0x56615d, roughness: 0.64, metalness: 0.25 }),
                school: new THREE.MeshStandardMaterial({ color: 0xa5b6b0, roughness: 0.45, transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide }),
                hospital: new THREE.MeshStandardMaterial({ color: 0x9cbbb8, roughness: 0.8, transparent: true, opacity: 0.58, depthWrite: false, side: THREE.DoubleSide })
            };
            const frame = style === 'lattice' ? m.wood : h.windowMaterials.frame;
            const bar = (suffix, size, position) => {
                const mesh = h.box(`${name}-${suffix}`, size, position, frame, undefined, root); frames.push(mesh); return mesh;
            };
            for (const edge of [left, right]) bar(`jamb-${edge === left ? 'left' : 'right'}`, [0.09, height, thickness + 0.1], [edge + (edge === left ? 0.045 : -0.045), sill + height / 2, 0]);
            for (const edge of [sill, head]) bar(`rail-${edge === sill ? 'bottom' : 'top'}`, [width, 0.09, thickness + 0.1], [mid, edge + (edge === sill ? 0.045 : -0.045), 0]);
            bar('sill', [width + 0.2, 0.08, thickness + 0.34], [mid, sill - 0.04, 0.08]);
            const verticals = style === 'lattice' ? 5 : 2;
            for (let i = 1; i <= verticals; i++) bar(`mullion-${i}`, [style === 'lattice' ? 0.035 : 0.045, height - 0.18, 0.07],
                [left + width * i / (verticals + 1), sill + height / 2, 0.025]);
            for (let i = 1; i <= (style === 'lattice' ? 2 : 1); i++) bar(`cross-${i}`, [width - 0.18, 0.035, 0.07],
                [mid, sill + height * i / (style === 'lattice' ? 3 : 2), 0.025]);
            const combine = (suffix, pieces) => {
                for (const piece of pieces) { piece.updateMatrix(); piece.geometry.applyMatrix4(piece.matrix); }
                const geometry = game.mergeGeometries(pieces.map(piece => piece.geometry));
                geometry.computeBoundingBox(); geometry.computeBoundingSphere();
                h.mesh(`${name}-${suffix}`, geometry, pieces[0].material, [0, 0, 0], undefined, root);
                root.remove(...pieces); pieces.forEach(piece => piece.geometry.dispose());
            };
            combine('wall', walls); combine('frame', frames);
            if (style !== 'lattice') {
                const glass = h.mesh(`${name}-glass`, new THREE.PlaneGeometry(width - 0.18, height - 0.18),
                    h.windowMaterials[style], [mid, sill + height / 2, -0.025], undefined, root);
                glass.castShadow = false;
            }
            return root;
        }
    }
    game.ThreeWindowWall = ThreeWindowWall;
})(window);
