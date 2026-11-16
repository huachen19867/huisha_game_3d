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
for (const name of ['ThreeHouseMap', 'ThreeCourtyardMap', 'ThreeMemoryMap', 'ThreeStory', 'ThreeControls', 'ThreeInteraction', 'ThreeCourtyard', 'ThreeMemoryScenes', 'ThreeHouseScene']) {
    vm.runInContext(await text(`src/3d/${name}.js`), context, { filename: `${name}.js` });
}
const game = window.Huisha3D;
const storage = new Map();
const adapter = { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value) };
const story = new game.ThreeStory(adapter);
const untouched = JSON.stringify(story.state);
assert.match(story.guidance().text, /入口右手边/);
assert.doesNotMatch(story.guidance(1).text, /已经确定|说的是中轮|说明雨字/,
    'interpreted evidence must come from observed records');
assert.equal(JSON.stringify(story.state), untouched, 'asking for help must not observe clues or move a wheel');
assert.match(story.guidance(2).text, /灯 · 人 · 门/, 'only the explicit answer tier reveals the combination');
story.record('letter'); assert.match(story.guidance().text, /红绳/);
story.record('lock'); assert.match(story.guidance().text, /棺沿/);
story.record('coffin'); assert.match(story.guidance().text, /身高刻线/);
assert.match(story.guidance(1).text, /已经确定/);
assert.doesNotMatch(story.guidance(1).text, /说的是中轮/, 'unobserved height marks must not be quoted as known evidence');
story.record('wall_marks'); assert.match(story.guidance().text, /供桌/);
story.record('altar'); assert.match(story.guidance(1).text, /说明雨字/);
story.reset();
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
assert.match(restored.guidance().text, /门闩已经松开/);
assert.deepEqual([...restored.state.wheels], [3, 2, 1]);
assert.equal([...storage.keys()][0], 'huisha.3d.homecoming.v1');
const unavailable = new game.ThreeStory({ getItem() { throw new Error('denied'); } });
assert.equal(unavailable.saveAvailable, false); unavailable.record('letter'); assert.equal(unavailable.state.records.length, 1);
storage.set('huisha.3d.homecoming.v1', '{broken');
assert.equal(new game.ThreeStory(adapter).state.opened, false, 'corrupt save falls back to new chapter');
storage.set('huisha.3d.homecoming.v1', JSON.stringify({ version: 1, portrait: true, records: [] }));
assert.ok(new game.ThreeStory(adapter).state.records.includes('portrait_back'), 'a revealed portrait always has its readable record after restoring');
storage.set('huisha.3d.homecoming.v1', JSON.stringify({ version: 1, portrait: false, records: ['portrait_back'] }));
assert.ok(!new game.ThreeStory(adapter).state.records.includes('portrait_back'), 'a covered portrait must not leak its hidden inscription into the journal');
storage.set('huisha.3d.homecoming.v1', JSON.stringify({ version: 1, opened: true, ending: true, records: ['letter', 'lock'] }));
const legacy = new game.ThreeStory(adapter);
assert.equal(legacy.state.ending, true); assert.equal(legacy.state.waterSolved, false);
assert.deepEqual([...legacy.state.buckets], [0, 0], 'an existing chapter-one save gets safe defaults for the extension');
assert.match(legacy.objective(), /雨庭/, 'old chapter endings now point to the continuation instead of a dead end');
storage.set('huisha.3d.homecoming.v1', JSON.stringify({ version: 1, buckets: [-2, 99], waterSolved: true, departure: 'leave', records: ['medicine_letter'] }));
const malformedWater = new game.ThreeStory(adapter);
assert.deepEqual([...malformedWater.state.buckets], [0, 0]); assert.equal(malformedWater.state.waterSolved, false);
assert.equal(malformedWater.state.departure, null); assert.ok(!malformedWater.state.records.includes('medicine_letter'));
story.reset(); assert.equal(story.state.records.length, 0); assert.equal(story.state.opened, false);
const guess = new game.ThreeStory(adapter); guess.state.wheels = [3, 2, 1];
assert.equal(guess.unlock(), true, 'a correct guess is valid without artificially requiring clue counts');
console.log('Story: optional guidance, observed evidence, incorrect attempt, free guess, unlock, explicit ending and isolated save passed.');

// Parse the downloaded glTF geometry with the real loader. Images are checked separately;
// omit their material bindings here because Node has no browser image decoder or WebGL.
globalThis.ProgressEvent ??= class { constructor(type, values) { Object.assign(this, { type }, values); } };
const parsedModels = new Map();
for (const id of ['chinese_armchair', 'chinese_console_table', 'chinese_cabinet', 'SchoolDesk_01', 'SchoolChair_01', 'wheelchair_01']) {
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
console.log('Assets: all six real glTF models, binary buffers, texture dependencies and scene placement passed.');

let paused = false;
const camera = new THREE.PerspectiveCamera(66, 1, 0.06, 60);
const controls = new game.ThreeControls({ camera, domElement: eventTarget, map: game.WORLD_MAP, story,
    isPaused: () => paused, getDoorAngle: id => id === 'yard' ? house.courtyard.gate.rotation.y : house.door.rotation.y });
for (const [opened, waterSolved, z, expectedZ] of [[false, false, -20, 3.4], [true, false, -31, 3.4], [true, true, -31, -31]]) {
    const resumeStory = new game.ThreeStory({ getItem: () => JSON.stringify({ version: 1, opened, waterSolved,
        position: { x: 0, z, yaw: Math.PI, pitch: 0 } }), setItem() {} });
    const resumeCamera = new THREE.PerspectiveCamera(66, 1, 0.06, 60);
    const resumeControls = new game.ThreeControls({ camera: resumeCamera, domElement: eventTarget, map: game.WORLD_MAP,
        story: resumeStory, isPaused: () => false });
    assert.equal(resumeCamera.position.z, expectedZ, 'restored positions cannot bypass an unsolved region gate');
    resumeControls.dispose();
}
house.camera = camera; house.controls = controls;
house.isPaused = () => paused;
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
house.endInspection();
assert.deepEqual({ ...controls.snapshot() }, { ...playerBeforeInspection }, 'leaving must restore both position and view direction');
assert.equal(camera.view?.enabled, false, 'leaving restores ordinary projection');
assert.equal(house.pickWheel(100, 100), null, 'world exploration must not turn the lock remotely');
story.reset(); house.syncState(true); camera.aspect = 16 / 9; camera.updateProjectionMatrix();
console.log('Mechanism: actual drum faces, pointer picks, portrait/landscape framing, animation and player-pose restoration passed.');
const prompt = { hidden: true, textContent: '' };
const interaction = new game.ThreeInteraction({ camera, map: game.WORLD_MAP, scene: house.scene, prompt, story,
    isPaused: () => paused, onInspect(item) { assert.ok(item.id); } });
controls.keys.add('KeyD'); controls.update(0.05); assert.ok(camera.position.x > 0, 'D must move to camera right, not left');
controls.clear(); camera.position.set(0, 1.6, 3.4);
controls.tryMove(new THREE.Vector3(0, 0, -6)); assert.ok(camera.position.z > 1.5, 'substeps prevent crossing the coffin');
camera.position.set(0, 1.6, -10); controls.tryMove(new THREE.Vector3(0, 0, -4));
assert.ok(camera.position.z > -11.1, 'closed gate must stop the player');
story.state.opened = true;
assert.equal(controls.canOccupy(0, -11.5), false, 'unlocking must not immediately remove a still-closed leaf collision');
house.moveDoor(0.05);
assert.ok(house.door.rotation.y > 0 && house.door.rotation.y < Math.PI / 2, 'the door swings outward rather than through the player');
const leaf = house.scene.getObjectByName('sealed-door');
for (const angle of [0, Math.PI / 6, Math.PI / 4, Math.PI / 3, Math.PI / 2]) {
    house.door.rotation.y = angle; house.scene.updateMatrixWorld(true);
    for (const offset of [-0.9, 0, 0.9]) {
        const point = leaf.localToWorld(new THREE.Vector3(offset, 0, 0));
        assert.equal(controls.blocksDoor(point.x, point.z), true, 'collision follows actual mesh points during the entire swing');
        const clear = leaf.localToWorld(new THREE.Vector3(offset, 0, 0.9));
        assert.equal(controls.blocksDoor(clear.x, clear.z), false, 'space clear of the leaf must stay passable');
    }
}
assert.equal(controls.canOccupy(0, -11.5), true, 'the fully open doorway must be passable');
house.door.rotation.y = 0; paused = true; house.moveDoor(0.05);
assert.equal(house.door.rotation.y, 0, 'reading pauses the opening motion');
paused = false; house.reducedMotion = { matches: true }; house.moveDoor(0.05);
assert.equal(house.door.rotation.y, game.MAIN_HALL_MAP.door.openAngle, 'reduced motion opens the leaf without animation');
house.reducedMotion = null; story.state.opened = false; house.syncState(true);
paused = true; const before = camera.position.clone(); controls.keys.add('KeyW'); controls.update(0.05);
assert.equal(camera.position.distanceTo(before), 0); assert.equal(controls.keys.size, 0);
interaction.update(); assert.equal(prompt.hidden, true); paused = false;

function flood() {
    const origin = game.MEMORIES[story.state.memory]?.start || game.WORLD_MAP.playerStart;
    const step = 0.15, start = [Math.round(origin.x / step), Math.round(origin.z / step)], queue = [start], visited = new Set([start.join(',')]);
    assert.equal(controls.canOccupy(start[0] * step, start[1] * step), true, 'flood starts from a valid player spawn');
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
function verifyReachable(item, points) {
    let focusPoint;
    for (const point of points) {
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
    return focusPoint;
}
for (const item of game.WORLD_MAP.interactables.filter(item => !item.space && !item.requiresOpen && !item.requiresWater)) verifyReachable(item, reachable);
story.state.wheels = [3, 2, 1]; story.unlock(); house.syncState(true); house.scene.updateMatrixWorld(true);
const yardPoints = flood();
const outside = yardPoints.find(p => p.z < -13.5);
assert.ok(outside, 'door opening must make the ending area physically reachable');
camera.position.set(0, 1.6, -12.9); camera.lookAt(new THREE.Vector3(0, 1.25, -13.9)); camera.updateMatrixWorld(true);
interaction.update(); assert.equal(interaction.current?.id, 'threshold');
interaction.activate(); assert.ok(story.state.records.includes('threshold')); assert.equal(story.state.ending, false, 'reaching or reading the threshold must not auto-finish');
for (const item of game.WORLD_MAP.interactables.filter(item => item.requiresOpen && !item.requiresWater)) verifyReachable(item, yardPoints);
assert.ok(yardPoints.some(point => point.x > 7 && point.z < -20), 'the kitchen must connect physically to the hall and yard');
assert.ok(!yardPoints.some(point => point.z < -28), 'the courtyard gate stays shut until the water mechanism is operated');
assert.equal(story.depart('leave'), false, 'unlocking the first door is not the final ending');
story.enterCourtyard();
const kitchenPose = { x: 8.5, z: -20.4, yaw: Math.PI, pitch: -0.1 };
camera.position.set(kitchenPose.x, 1.6, kitchenPose.z); controls.yaw = kitchenPose.yaw; controls.pitch = kitchenPose.pitch; controls.applyLook();
for (const [width, height] of [[1280, 720], [390, 844], [844, 390], [390, 640], [680, 720], [667, 375]]) {
    house.root.clientWidth = width; house.root.clientHeight = height; camera.aspect = width / height; camera.updateProjectionMatrix();
    house.beginWaterInspection();
    assert.ok(camera.position.z < -17.7 && camera.position.y < 3.05, 'inspection stays inside the kitchen, below its solid roof');
    assert.deepEqual({ ...house.playerSnapshot() }, kitchenPose, 'close-up camera is never used as the saved position');
    const targets = [
        [house.scene.getObjectByName('bucket-0'), 'bucket0'], [house.scene.getObjectByName('bucket-1'), 'bucket1'],
        [house.scene.getObjectByName('kitchen-tank-water'), 'fill'], [house.scene.getObjectByName('water-sink'), 'empty'],
        [house.courtyard.pan, 'weigh']
    ];
    house.scene.updateMatrixWorld(true);
    for (const [object, action] of targets) {
        const point = object.getWorldPosition(new THREE.Vector3()).project(camera);
        assert.ok(Math.abs(point.x) < 0.98 && Math.abs(point.y) < 0.9 && point.z < 1, `${action} fits in ${width}x${height}`);
        if (width >= 900 || (height <= 520 && width > 680)) {
            assert.ok((point.x + 1) * width / 2 < width - 338, 'water objects leave room for the right-side controls');
        } else {
            assert.ok((1 - point.y) * height / 2 < height * 0.57 - 12, 'water objects stay above the maximum-height bottom controls');
        }
        assert.equal(house.courtyard.pick((point.x + 1) * width / 2, (1 - point.y) * height / 2), action, `${action} can be picked through real geometry`);
    }
    house.beginWaterInspection();
    house.endInspection();
    assert.equal(camera.fov, 66, 'leaving restores the exploration field of view');
    assert.deepEqual({ ...controls.snapshot() }, kitchenPose);
}
assert.equal(story.weighWater(), false, 'empty pails cannot release the drawer');
story.fillBucket(1); assert.equal(story.pourBucket(1), 3);
assert.deepEqual([...story.state.buckets], [3, 2], 'pouring conserves water and stops at the smaller capacity');
story.emptyBucket(0); assert.equal(story.pourBucket(1), 2);
story.fillBucket(1);
assert.deepEqual([...new game.ThreeStory(adapter).state.buckets], [2, 5], 'an intermediate water puzzle resumes from saved quantities');
assert.equal(story.pourBucket(1), 1);
assert.deepEqual([...story.state.buckets], [3, 4]);
assert.equal(story.state.waterSolved, false, 'having the correct quantity does not automatically operate the scale');
assert.equal(story.weighWater(), true);
assert.equal(story.fillBucket(1), false, 'the bucket placed on the scale is no longer refilled');
assert.equal(controls.canOccupy(0, -27.5), false, 'the yard gate collision remains until its actual leaf rotates');
house.syncState(true); house.scene.updateMatrixWorld(true);
assert.equal(house.courtyard.waterParts[1].visible, true);
assert.equal(house.courtyard.buckets[1].position.x, 9.4, 'the five-litre bucket physically moves onto the scale');
assert.equal(house.courtyard.letter.visible, true, 'the released drawer reveals an actual letter in the scene');
assert.ok(house.courtyard.drawer.position.z > -22, 'the drawer physically slides out');
const roadPoints = flood();
assert.ok(roadPoints.some(point => point.z < -30.5), 'operating the scale opens a walkable path to the mountain road');
for (const item of game.WORLD_MAP.interactables.filter(item => !item.space && item.requiresWater)) verifyReachable(item, roadPoints);
assert.equal(story.state.departure, null, 'reading clues and reaching the road do not choose an ending');
assert.equal(story.depart('stay'), true); assert.equal(new game.ThreeStory(adapter).state.departure, 'stay');
assert.equal(story.depart('leave'), true); assert.equal(new game.ThreeStory(adapter).state.departure, 'leave');
console.log('Courtyard: connected kitchen, real object picks in six viewports, volume conservation, save recovery, moving props, gated road and explicit endings passed.');
const returnPose = { x: 6.6, z: -23.5, yaw: 0.8, pitch: -0.1 };
controls.teleport(returnPose);
assert.equal(story.enterMemory('school', { x: 0 }), false, 'entering a memory requires a real return pose');
assert.equal(story.enterMemory('__proto__', returnPose), false, 'unknown memory identifiers cannot become active spaces');
assert.equal(story.depart('wake'), false, 'the deeper ending is not unlocked by the water puzzle');
for (const [id, definition] of Object.entries(game.MEMORY_CASES)) {
    assert.equal(story.enterMemory(id, controls.snapshot()), true);
    controls.teleport(story.state.position); house.syncState(true);
    assert.equal(house.homeRoot.visible, false);
    for (const [space, room] of Object.entries(house.memories.rooms)) assert.equal(room.visible, space === id);
    assert.equal(controls.canOccupy(returnPose.x, returnPose.z), false, 'movement is confined to the current memory, not the house');
    const points = flood();
    for (const item of game.WORLD_MAP.interactables.filter(item => item.space === id && !item.requiresTruth)) verifyReachable(item, points);
    story.setMemoryDraft(id, [...definition.records], definition.answer);
    assert.equal(story.deduce(id).success, false, 'unobserved records cannot be submitted as evidence');
    for (const record of definition.records) {
        const item = game.WORLD_MAP.interactables.find(item => item.id === record);
        const point = verifyReachable(item, points);
        camera.position.set(point.x, 1.6, point.z); camera.lookAt(item.position.x, item.position.y, item.position.z); camera.updateMatrixWorld(true);
        interaction.activate(); assert.ok(story.state.records.includes(record));
    }
    assert.equal(story.state.deductions[id], false, 'reading both records does not automatically complete deduction');
    story.setMemoryDraft(id, [...definition.records], (definition.answer + 1) % definition.choices.length);
    const draftBeforeWrong = JSON.stringify(story.state.drafts[id]);
    assert.equal(story.deduce(id).success, false); assert.equal(JSON.stringify(story.state.drafts[id]), draftBeforeWrong, 'wrong submissions keep the draft');
    story.save(controls.snapshot());
    const memoryRestored = new game.ThreeStory(adapter);
    assert.equal(memoryRestored.state.memory, id); assert.equal(JSON.stringify(memoryRestored.state.drafts[id]), draftBeforeWrong);
    const resumeCamera = new THREE.PerspectiveCamera(66, 1, 0.06, 60);
    const resumeControls = new game.ThreeControls({ camera: resumeCamera, domElement: eventTarget, map: game.WORLD_MAP,
        story: memoryRestored, isPaused: () => false });
    assert.equal(resumeCamera.position.x, memoryRestored.state.position.x); assert.equal(resumeCamera.position.z, memoryRestored.state.position.z);
    resumeControls.dispose();
    story.setMemoryDraft(id, [...definition.records], definition.answer);
    assert.equal(story.deduce(id).success, true); assert.equal(story.state.memory, id, 'correct deduction keeps the player in the memory');
    if (id === 'crash') {
        assert.equal(story.truthSolved(), true);
        verifyReachable(game.WORLD_MAP.interactables.find(item => item.id === 'rescue_light'), points);
        assert.equal(story.depart('wake'), true); assert.equal(new game.ThreeStory(adapter).state.departure, 'wake');
        assert.equal(story.depart('remember'), true); assert.equal(new game.ThreeStory(adapter).state.departure, 'remember');
    }
    const pose = story.leaveMemory(); controls.teleport(pose); house.syncState(true);
    assert.deepEqual({ ...controls.snapshot() }, returnPose, 'returning restores the original house position and view');
    assert.equal(house.homeRoot.visible, true); assert.equal(story.state.memory, null);
}
console.log('Memories: real classroom/hospital/road reachability, space isolation, explicit observation and deduction, persistent drafts, return poses and four ending choices passed.');
for (const memory of ['__proto__', ['school'], 'missing']) {
    const invalid = new game.ThreeStory({ getItem: () => JSON.stringify({ version: 1, opened: true, waterSolved: true, memory }), setItem() {} });
    assert.equal(invalid.state.memory, null, 'malformed active-memory values cannot create an unwalkable space');
}
const brokenMemoryPosition = new game.ThreeStory({ getItem: () => JSON.stringify({ version: 1, opened: true, waterSolved: true, memory: 'school',
    position: { x: 0, z: 3.4, yaw: 0, pitch: 0 }, memoryReturn: { x: 0 } }), setItem() {} });
const fallbackCamera = new THREE.PerspectiveCamera(66, 1, 0.06, 60);
const fallbackControls = new game.ThreeControls({ camera: fallbackCamera, domElement: eventTarget, map: game.WORLD_MAP,
    story: brokenMemoryPosition, isPaused: () => false });
assert.equal(fallbackCamera.position.x, game.MEMORIES.school.start.x, 'an invalid memory position falls back inside that memory, not into the hidden house');
const fallbackPose = brokenMemoryPosition.leaveMemory(); fallbackControls.teleport(fallbackPose);
assert.equal(fallbackControls.canOccupy(fallbackCamera.position.x, fallbackCamera.position.z), true, 'missing return poses recover to a safe kitchen location');
fallbackControls.dispose();
const queryScene = new THREE.Scene(), queryCamera = new THREE.PerspectiveCamera(66, 1, 0.06, 10);
queryCamera.position.set(0, 1.6, 3); queryCamera.lookAt(0, 1.6, 0); queryCamera.updateMatrixWorld(true);
const queryItems = [
    { id: 'near', title: '近处纸张', position: { x: 0, y: 1.6, z: 0 }, radius: 4 },
    { id: 'far', title: '旁边纸张', position: { x: 1.6, y: 1.6, z: 0 }, radius: 4 },
    { id: 'school_clue', title: '记忆里的纸张', position: { x: 0, y: 1.6, z: 0 }, radius: 4, space: 'school' }
];
const queryCounts = { self: 0, hidden: 0, otherSpace: 0, decoration: 0 };
function queryMesh(name, position, size, parent = queryScene, data = {}) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), new THREE.MeshBasicMaterial());
    mesh.position.set(...position); Object.assign(mesh.userData, { blocksSight: true }, data); parent.add(mesh);
    const raycast = mesh.raycast;
    mesh.raycast = function (...args) { if (name in queryCounts) queryCounts[name]++; return raycast.apply(this, args); };
    return mesh;
}
queryMesh('self', [0, 1.6, 0.5], [0.3, 0.3, 0.3], queryScene, { item: 'near' });
const obstruction = queryMesh('wall', [0, 1.6, 1.5], [0.5, 0.5, 0.2]); obstruction.visible = false;
const hiddenRoot = new THREE.Group(); hiddenRoot.visible = false; queryScene.add(hiddenRoot);
queryMesh('hidden', [0, 1.6, 2], [8, 8, 0.1], hiddenRoot);
const otherSpace = new THREE.Group(); otherSpace.userData.memorySpace = 'school'; queryScene.add(otherSpace);
queryMesh('otherSpace', [0, 1.6, 2.3], [8, 8, 0.1], otherSpace, { item: 'school_clue' });
queryMesh('decoration', [0, 1.6, 2.7], [8, 8, 0.1], queryScene, { blocksSight: false });
queryScene.updateMatrixWorld(true);
let queryPaused = false, activated = 0;
const queryStory = { state: { records: [], memory: null }, record(id) { this.state.records.push(id); } };
const queryPrompt = { hidden: true, textContent: '' };
const query = new game.ThreeInteraction({ camera: queryCamera, map: { interactables: queryItems }, scene: queryScene,
    prompt: queryPrompt, story: queryStory, isPaused: () => queryPaused, onInspect() { activated++; } });
query.update(); assert.equal(query.current?.id, 'near');
assert.deepEqual(queryCounts, { self: 0, hidden: 0, otherSpace: 0, decoration: 0 }, 'self, hidden branches, other spaces and decorations never enter narrow-phase raycasting');
obstruction.visible = true; query.update(); assert.equal(query.current?.id, 'far', 'a blocked best candidate must fall back to the next visible candidate');
obstruction.visible = false; hiddenRoot.visible = true; query.update(); assert.equal(query.current, null, 'a newly visible blocking ancestor takes effect without rebuilding the cache');
hiddenRoot.visible = false;
let occlusionQueries = 0;
const originalIntersect = query.ray.intersectObjects.bind(query.ray);
query.ray.intersectObjects = (...args) => { occlusionQueries++; return originalIntersect(...args); };
query.untilQuery = 0;
for (let frame = 0; frame < 120; frame++) query.update(1 / 120);
assert.equal(occlusionQueries, 20, '120 ordinary frames perform only 20 prompt occlusion queries');
queryCamera.lookAt(0, 1.6, 6); queryCamera.updateMatrixWorld(true); query.activate();
assert.equal(activated, 0, 'activation rechecks the current direction instead of using a stale prompt');
queryCamera.lookAt(0, 1.6, 0); queryCamera.updateMatrixWorld(true); query.activate(); assert.equal(activated, 1);
queryPaused = true; query.update(0); assert.equal(queryPrompt.hidden, true, 'pause hides prompts immediately despite the query interval');
queryPaused = false; query.update(0); assert.equal(query.current?.id, 'near');
queryStory.state.memory = 'school'; query.update(0); assert.equal(query.current?.id, 'school_clue', 'space changes refresh prompts immediately');
query.dispose();
console.log('Queries: current-space visibility, self/decorative geometry exclusion, blocked-candidate fallback, 20Hz prompt scans and fresh activation passed. This is a CPU query check, not a WebGL frame-rate measurement.');
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
