import assert from 'node:assert/strict';
import { readFile, access, readdir } from 'node:fs/promises';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import * as THREE from '../vendor/three.module.mjs';
import { GLTFLoader } from '../vendor/GLTFLoader.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const text = relative => readFile(path.join(root, relative), 'utf8');
const listeners = new Map();
const eventTarget = {
    addEventListener(type, callback) { if (!listeners.has(type)) listeners.set(type, new Set()); listeners.get(type).add(callback); },
    removeEventListener(type, callback) { listeners.get(type)?.delete(callback); }
};
const canvasContext = { fillRect() {}, strokeRect() {}, fillText() {} };
const document = { ...eventTarget, createElement() { return { getContext() { return canvasContext; } }; }, hidden: false };
const window = { ...eventTarget, THREE, Huisha3D: {} };
const context = vm.createContext({ window, document, console });
for (const name of ['ThreeHouseMap', 'ThreeStory', 'ThreeControls', 'ThreeInteraction', 'ThreeHouseScene']) {
    vm.runInContext(await text(`src/3d/${name}.js`), context, { filename: `${name}.js` });
}
const game = window.Huisha3D;
const storage = new Map();
const adapter = { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value) };
const story = new game.ThreeStory(adapter);
assert.equal(story.finish(), false, 'cannot finish through a closed door');
for (const item of game.MAIN_HALL_MAP.interactables) story.record(item.id);
assert.equal(story.state.opened, false, 'reading everything must not solve the lock');
assert.equal(story.unlock(), false, 'wrong combination keeps the gate shut');
story.state.wheels = [3, 2, 1];
assert.equal(story.unlock(), true, 'actual three-symbol combination opens the lock');
assert.equal(story.finish(), true);
story.revealPortrait(); story.save({ x: 0, z: -12.3, yaw: Math.PI, pitch: 0 });
const restored = new game.ThreeStory(adapter);
assert.equal(restored.state.ending, true); assert.equal(restored.state.portrait, true);
assert.equal(restored.state.position.z, -12.3);
assert.deepEqual([...restored.state.wheels], [3, 2, 1]);
assert.equal([...storage.keys()][0], 'huisha.3d.homecoming.v1');
const unavailable = new game.ThreeStory({ getItem() { throw new Error('denied'); } });
assert.equal(unavailable.saveAvailable, false); unavailable.record('letter'); assert.equal(unavailable.state.records.length, 1);
storage.set('huisha.3d.homecoming.v1', '{broken');
assert.equal(new game.ThreeStory(adapter).state.opened, false, 'corrupt save falls back to new chapter');
story.reset(); assert.equal(story.state.records.length, 0); assert.equal(story.state.opened, false);
const guess = new game.ThreeStory(adapter); guess.state.wheels = [3, 2, 1];
assert.equal(guess.unlock(), true, 'a correct guess is valid without artificially requiring clue counts');
console.log('Story: observations, incorrect attempt, free guess, unlock, explicit ending and isolated save passed.');

// Parse the downloaded glTF geometry with the real loader. Images are checked separately;
// omit their material bindings here because Node has no browser image decoder or WebGL.
globalThis.ProgressEvent ??= class { constructor(type, values) { Object.assign(this, { type }, values); } };
const parsedModels = new Map();
for (const id of ['chinese_armchair', 'chinese_console_table', 'chinese_cabinet']) {
    const directory = `assets/models/${id}`;
    const gltf = JSON.parse(await text(`${directory}/model.gltf`));
    for (const buffer of gltf.buffers) {
        const data = await readFile(path.join(root, directory, buffer.uri));
        assert.equal(data.length, buffer.byteLength);
        buffer.uri = `data:application/octet-stream;base64,${data.toString('base64')}`;
    }
    for (const image of gltf.images || []) {
        const bytes = await readFile(path.join(root, directory, image.uri));
        assert.ok(bytes.length > 1000); assert.equal(bytes[0], 0xff, 'local texture must be a real JPEG');
    }
    for (const material of gltf.materials || []) {
        delete material.normalTexture; delete material.occlusionTexture; delete material.emissiveTexture;
        if (material.pbrMetallicRoughness) { delete material.pbrMetallicRoughness.baseColorTexture; delete material.pbrMetallicRoughness.metallicRoughnessTexture; }
    }
    const loaded = await new GLTFLoader().parseAsync(JSON.stringify(gltf), '');
    assert.ok(new THREE.Box3().setFromObject(loaded.scene).getSize(new THREE.Vector3()).length() > 0);
    parsedModels.set(id, loaded);
}
game.GLTFLoader = class { async loadAsync(url) { return parsedModels.get(url.split('/')[2]); } };
const house = new game.ThreeHouseScene({ story });
house.scene = new THREE.Scene();
house.materials = Object.fromEntries(['wall', 'floor', 'wood', 'darkWood', 'brass', 'red', 'cloth', 'paper', 'stone', 'wax', 'ash', 'plaster'].map(key => [key, new THREE.MeshStandardMaterial()]));
house.createArchitecture(); house.createProps(); await house.loadModels();
house.outsideLight = { intensity: 0 }; house.syncState(true); house.scene.updateMatrixWorld(true);
assert.equal(house.scene.getObjectByName('chinese_armchair').isGroup, true);
assert.equal(house.scene.getObjectByName('chinese_console_table').isGroup, true);
assert.equal(house.scene.getObjectByName('chinese_cabinet').isGroup, true);
console.log('Assets: all three real glTF models, binary buffers, texture dependencies and scene placement passed.');

let paused = false;
const camera = new THREE.PerspectiveCamera(66, 1, 0.06, 60);
const controls = new game.ThreeControls({ camera, domElement: eventTarget, map: game.MAIN_HALL_MAP, story, isPaused: () => paused });
house.camera = camera; house.controls = controls;
house.root = { clientWidth: 1280, clientHeight: 720 };
house.renderer = { domElement: { getBoundingClientRect: () => ({ left: 0, top: 0, width: house.root.clientWidth, height: house.root.clientHeight }) } };
const playerBeforeInspection = controls.snapshot();
house.beginLockInspection();
assert.notEqual(camera.position.z, playerBeforeInspection.z, 'inspection must use a close view of the actual door');
assert.deepEqual({ ...house.playerSnapshot() }, { ...playerBeforeInspection }, 'inspection must save the real player pose, not the close-up camera');
house.beginLockInspection();
assert.deepEqual({ ...house.playerSnapshot() }, { ...playerBeforeInspection }, 'returning from records must not overwrite the return pose');
for (const [width, height] of [[1280, 720], [390, 844], [844, 390]]) {
    house.root.clientWidth = width; house.root.clientHeight = height;
    camera.aspect = width / height; camera.updateProjectionMatrix(); house.frameLock();
    house.scene.updateMatrixWorld(true);
    for (let i = 0; i < 3; i++) {
        const face = house.scene.getObjectByName(`wheel-face-${i}-0`);
        const projected = face.getWorldPosition(new THREE.Vector3()).project(camera);
        assert.ok(Math.abs(projected.x) < 0.95 && Math.abs(projected.y) < 0.85 && projected.z < 1,
            `wheel ${i} must fit in the ${width}x${height} view`);
        assert.equal(house.pickWheel((projected.x + 1) * width / 2, (1 - projected.y) * height / 2), i,
            'clicking an actual projected drum must select that drum');
        if (height <= 520) assert.ok((projected.x + 1) / 2 < 0.59, 'landscape close-up leaves space for the side controls');
    }
}
story.rotate(0); house.syncState(); house.moveWheels(0.016);
assert.ok(house.wheels[0].rotation.x > 0 && house.wheels[0].rotation.x < Math.PI / 2, 'wheel turns through geometry, rather than replacing a texture');
for (let i = 0; i < 100; i++) house.moveWheels(0.05);
assert.ok(Math.abs(house.wheels[0].rotation.x - Math.PI / 2) < 0.001);
const selectedNormal = new THREE.Vector3(0, 0, 1).applyQuaternion(house.scene.getObjectByName('wheel-face-0-1').getWorldQuaternion(new THREE.Quaternion()));
assert.ok(selectedNormal.z > 0.999, 'selected engraved face must point toward the player');
for (let i = 0; i < 3; i++) { story.rotate(0); house.syncState(); }
assert.equal(story.state.wheels[0], 0);
assert.ok(house.wheelTargets[0] >= Math.PI * 2, 'wrapping from the fourth face continues forward');
house.endLockInspection();
assert.deepEqual({ ...controls.snapshot() }, { ...playerBeforeInspection }, 'leaving must restore both position and view direction');
assert.equal(camera.view?.enabled, false, 'leaving restores ordinary projection');
assert.equal(house.pickWheel(100, 100), null, 'world exploration must not turn the lock remotely');
story.reset(); house.syncState(true); camera.aspect = 16 / 9; camera.updateProjectionMatrix();
console.log('Mechanism: actual drum faces, pointer picks, portrait/landscape framing, animation and player-pose restoration passed.');
const prompt = { hidden: true, textContent: '' };
const interaction = new game.ThreeInteraction({ camera, map: game.MAIN_HALL_MAP, scene: house.scene, prompt, story,
    isPaused: () => paused, onInspect(item) { assert.ok(item.id); } });
controls.keys.add('KeyD'); controls.update(0.05); assert.ok(camera.position.x > 0, 'D must move to camera right, not left');
controls.clear(); camera.position.set(0, 1.6, 3.4);
controls.tryMove(new THREE.Vector3(0, 0, -6)); assert.ok(camera.position.z > 1.5, 'substeps prevent crossing the coffin');
camera.position.set(0, 1.6, -10); controls.tryMove(new THREE.Vector3(0, 0, -4));
assert.ok(camera.position.z > -11.1, 'closed gate must stop the player');
paused = true; const before = camera.position.clone(); controls.keys.add('KeyW'); controls.update(0.05);
assert.equal(camera.position.distanceTo(before), 0); assert.equal(controls.keys.size, 0);
interaction.update(); assert.equal(prompt.hidden, true); paused = false;

function flood() {
    const step = 0.15, start = [0, 23], queue = [start], visited = new Set([start.join(',')]);
    for (let i = 0; i < queue.length; i++) {
        const [x, z] = queue[i];
        for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const next = [x + dx, z + dz], key = next.join(',');
            if (!visited.has(key) && controls.canOccupy(next[0] * step, next[1] * step)) {
                visited.add(key); queue.push(next);
            }
        }
    }
    return queue.map(([x, z]) => ({ x: x * step, z: z * step }));
}
const reachable = flood();
assert.ok(reachable.length > 2000);
for (const item of game.MAIN_HALL_MAP.interactables.filter(item => !item.requiresOpen)) {
    let focusPoint;
    for (const point of reachable) {
        if (Math.hypot(point.x - item.position.x, point.z - item.position.z) > item.radius) continue;
        const elevation = Math.atan2(item.position.y - 1.6, Math.hypot(point.x - item.position.x, point.z - item.position.z));
        if (Math.abs(elevation) > 1.15) continue;
        camera.position.set(point.x, 1.6, point.z); camera.lookAt(new THREE.Vector3(item.position.x, item.position.y, item.position.z)); camera.updateMatrixWorld(true);
        interaction.update();
        if (interaction.current?.id === item.id) { focusPoint = point; break; }
    }
    assert.ok(focusPoint, `${item.id} must be reachable and investigable through real geometry`);
    camera.lookAt(camera.position.clone().add(new THREE.Vector3(0, 0, 3))); camera.updateMatrixWorld(true);
    if (item.position.z < focusPoint.z) { interaction.update(); assert.notEqual(interaction.current?.id, item.id, 'looking away must not inspect behind the player'); }
}
story.state.wheels = [3, 2, 1]; story.unlock(); house.syncState(true); house.scene.updateMatrixWorld(true);
const outside = flood().find(p => p.z < -13.5);
assert.ok(outside, 'door opening must make the ending area physically reachable');
camera.position.set(0, 1.6, -12.9); camera.lookAt(new THREE.Vector3(0, 1.25, -13.9)); camera.updateMatrixWorld(true);
interaction.update(); assert.equal(interaction.current?.id, 'threshold');
interaction.activate(); assert.ok(story.state.records.includes('threshold')); assert.equal(story.state.ending, false, 'reaching or reading the threshold must not auto-finish');
controls.dispose(); interaction.dispose();
assert.ok([...listeners.values()].every(set => set.size === 0), 'controls must release all event listeners');
console.log('Space: every clue reachable with actual ray occlusion, correct strafe, collision substeps, reading pause and end route passed.');

const html = await text('index.html');
for (const url of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
    if (!url[1].startsWith('data:')) await access(path.join(root, url[1]));
}
for (const filename of await readdir(path.join(root, 'vendor'))) {
    if (!filename.endsWith('.mjs')) continue;
    const source = await text(`vendor/${filename}`);
    for (const specifier of source.matchAll(/from\s+['"]([^'"]+)['"]/g)) {
        if (specifier[1].startsWith('.')) await access(path.join(root, 'vendor', specifier[1]));
    }
}
for (const name of ['wood-color', 'wood-normal', 'wood-roughness', 'plaster-color', 'plaster-normal', 'plaster-roughness']) {
    const bytes = await readFile(path.join(root, `assets/materials/${name}.jpg`)); assert.equal(bytes[0], 0xff); assert.ok(bytes.length > 1000);
}
assert.doesNotMatch(html, /phaser|prototype3d\.html/);
assert.doesNotMatch(await text('src/main.mjs'), /https:\/\//);
console.log('Entry: local module graph, PBR textures and independent 3D entry passed. Browser/WebGL appearance has not been tested.');
const sources = JSON.parse((await text('assets/sources.json')).replace(/^\uFEFF/, ''));
for (const asset of sources.files) {
    const bytes = await readFile(path.join(root, 'assets', asset.path));
    assert.equal(createHash('md5').update(bytes).digest('hex'), asset.md5, `${asset.path} must match its recorded original source`);
}
for (const art of ['木墙', '木梁']) await access(path.join(root, `assets/art/${art}.png`));
console.log(`Sources: ${sources.files.length} downloaded asset checksums match the recorded Poly Haven originals.`);
