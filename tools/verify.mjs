import { parseStoryCopy } from '../src/story-copy.mjs';
import assert from 'node:assert/strict';
import { readFile, access, readdir } from 'node:fs/promises';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import * as THREE from '../vendor/three.module.mjs';
import { GLTFLoader } from '../vendor/GLTFLoader.mjs';
import { mergeGeometries } from '../vendor/BufferGeometryUtils.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const text = relative => readFile(path.join(root, relative), 'utf8');
const listeners = new Map();
const eventTarget = {
    addEventListener(type, callback) { if (!listeners.has(type)) listeners.set(type, new Set()); listeners.get(type).add(callback); },
    removeEventListener(type, callback) { listeners.get(type)?.delete(callback); }
};
const canvasContext = { save() {}, restore() {}, translate() {}, rotate() {}, ellipse() {}, fillRect() {}, strokeRect() {}, fillText() {}, beginPath() {}, moveTo() {}, lineTo() {}, stroke() {} };
const document = { ...eventTarget, createElement() { return { getContext() { return canvasContext; } }; }, hidden: false };
const window = { ...eventTarget, THREE, Huisha3D: {} };
window.HuishaCopy=parseStoryCopy(await text('STORY.md'));
const context = vm.createContext({ window, document, console });
for (const name of ['ThreeHouseMap', 'ThreeCourtyardMap', 'ThreeMemoryMap', 'ThreeWestRoom', 'ThreeStoreys', 'ThreeClerk', 'ThreeExplorationMap', 'ThreeStory', 'ThreePreferences', 'ThreeAudio', 'ThreeControls', 'ThreeInteraction', 'ThreeWindowWall', 'ThreeKitchen', 'ThreeCourtyard', 'ThreePhone', 'ThreeDocument', 'ThreeMemoryScenes', 'ThreePortrait', 'ThreeDoorMechanism', 'ThreeVillageLane', 'ThreeHouseScene']) {
    vm.runInContext(await text(`src/3d/${name}.js`), context, { filename: `${name}.js` });
}
const game = window.Huisha3D;
vm.runInContext(await text('src/3d/ThreeWellChase.js'), context);
game.mergeGeometries = mergeGeometries;
let mapWrites = 0; const mapStorage = new Map(), mapAdapter = { getItem: key => mapStorage.get(key), setItem: (key, value) => { mapStorage.set(key, value); mapWrites++; } };
{
    let serialized=JSON.stringify({version:1,arrival:'home',opened:true,waterSolved:true});
    const oldSlot={getItem:()=>serialized,setItem:(_,value)=>{serialized=value;}};
    const migrated=new game.ThreeStory(oldSlot);
    migrated.save();
    assert.ok(new game.ThreeStory(oldSlot).state.photoFiled,'a migrated accident photo survives the next reload');
}
{
    const original=['wiper_print','paper_mask','mask_strap','mask_transfer'];
    const old=new game.ThreeStory({getItem:()=>JSON.stringify({version:1,chapterEdition:2,arrival:'home',opened:true,crossedYard:true,maskHung:true,records:original})});
    assert.ok(old.state.maskHung);
    assert.deepEqual([...old.state.records],original,'an old comparison survives without inventing a print or a photo');
}
for (const vigil of [0, 1, 2, 3]) {
    const old = new game.ThreeStory({getItem:()=>JSON.stringify({version:1,chapterEdition:2,opened:true,vigil})});
    assert.deepEqual([...old.state.offerings], ['rice','incense','paper'].slice(0,vigil));
    assert.equal(old.state.coffinCordsAside, vigil===3);
    if (vigil === 3) {
        assert.ok(old.state.basketDown);
        assert.equal(old.takeGear('paper'), false);
    }
}
for (const vigil of [0, 1]) {
    const oldKitchen = new game.ThreeStory({getItem: () => JSON.stringify({
        version:1, chapterEdition:2, arrival:'home', opened:true, records:['rice_bowl'], vigil
    }), setItem() {}});
    assert.equal(oldKitchen.state.riceStage,'served');
    assert.equal(oldKitchen.takeGear('rice'),vigil === 0,'already offered rice stays on the altar');
}
const mapStory = new game.ThreeStory(mapAdapter);
assert.equal(mapStory.visitPosition(game.WORLD_MAP.playerStart), true); assert.deepEqual([...mapStory.state.visitedAreas], ['hall']);
for (let frame = 0; frame < 120; frame++) mapStory.visitPosition(game.WORLD_MAP.playerStart);
assert.equal(mapWrites, 1, 'remaining in a room never saves exploration history every frame');
assert.equal(mapStory.visitPosition({ x: 8.5, z: -20.4 }), false, 'locked areas cannot be discovered from a forged position');
mapStory.record('lock'); assert.deepEqual([...mapStory.state.visitedAreas], ['hall', 'corridor']);
const mapSnapshot = JSON.stringify(mapStory.state), mapModel = new game.ThreeExplorationMap({ story: mapStory });
assert.equal(mapModel.status(game.WORLD_MAP.walkable[0], []).kind, 'visited');
assert.equal(mapModel.status(game.WORLD_MAP.walkable[1], [{ id: 'lock' }]).kind, 'pending');
assert.equal(JSON.stringify(mapStory.state), mapSnapshot, 'map status does not observe new records or operate mechanisms');
const legacyMap = new game.ThreeStory({ getItem: () => JSON.stringify({ version: 1, records: ['letter', 'wall_marks'] }), setItem() {} });
assert.deepEqual([...legacyMap.state.visitedAreas], ['hall', 'corridor'], 'legacy saves infer only the locations of already-read records');
const malformedMap = new game.ThreeStory({ getItem: () => JSON.stringify({ version: 1, visitedAreas: ['hall', 'hall', 'road', 'kitchen', 'school', '__proto__', {}] }), setItem() {} });
assert.deepEqual([...malformedMap.state.visitedAreas], ['hall']);
mapStory.state.opened = true; mapStory.state.waterSolved = true;
mapStory.enterMemory('school', { x: 8.5, z: -20.4, yaw: Math.PI, pitch: 0 });
assert.ok(mapStory.state.visitedAreas.includes('school'));
assert.equal(mapStory.visitPosition({ x: 32, z: 3 }), false, 'one memory cannot discover another memory by world coordinates');
assert.equal(new game.ThreeStory(mapAdapter).state.visitedAreas.includes('school'), true);
mapStory.reset(); assert.equal(mapStory.state.visitedAreas.length, 0);
for (const record of game.WORLD_MAP.interactables.filter(item => item.journal !== false)) {
    const area = game.ThreeExplorationMap.areas().find(area => area.id === record.area);
    assert.ok(area, `${record.id} needs a map area`);
    assert.equal(area.space || 'house', record.space || 'house');
    assert.ok(record.position.x >= area.xMin && record.position.x <= area.xMax && record.position.z >= area.zMin && record.position.z <= area.zMax,
        `${record.id} belongs inside the actual walkable area used to draw it`);
}
console.log('Exploration: discovered-only rooms, observed record locations, no idle saves, gated/legacy restore, memory isolation and reset passed.');
const preferenceData = new Map([['huisha.3d.homecoming.v1', 'existing-story']]);
const preferenceAdapter = { getItem: key => preferenceData.get(key), setItem: (key, value) => preferenceData.set(key, value) };
const preferences = new game.ThreePreferences(preferenceAdapter);
preferences.set('brightness', 99); preferences.set('mouseSensitivity', -3); preferences.set('invertY', true);
assert.equal(preferences.set('volume', NaN), false); assert.equal(preferences.set('muted', 'false'), false);
const restoredPreferences = new game.ThreePreferences(preferenceAdapter);
assert.equal(restoredPreferences.values.brightness, 1.8); assert.equal(restoredPreferences.values.mouseSensitivity, 0.25);
assert.equal(restoredPreferences.values.invertY, true); assert.equal(restoredPreferences.values.volume, 1);
preferences.reset(); assert.equal(preferenceData.get('huisha.3d.homecoming.v1'), 'existing-story', 'setting defaults never touch story progress');
const deniedPreferences = new game.ThreePreferences({ getItem() { throw new Error('denied'); }, setItem() { throw new Error('denied'); } });
deniedPreferences.set('volume', 0.3); assert.equal(deniedPreferences.values.volume, 0.3); assert.equal(deniedPreferences.saveAvailable, false);
assert.equal(new game.ThreePreferences({ getItem: () => '{broken' }).values.brightness, 1.28);
const adjustableAudio = new game.ThreeAudio();
let gainValue;
adjustableAudio.context = { currentTime: 3, suspend() {} };
adjustableAudio.gain = { gain: { setTargetAtTime(value) { gainValue = value; } } };
adjustableAudio.setVolume(0.5); assert.equal(gainValue, 0.12, 'volume changes the existing master gain');
adjustableAudio.setMuted(true); adjustableAudio.setMuted(false, false); assert.equal(adjustableAudio.muted, false);
const soundAudio = new game.ThreeAudio(), footsteps = [];
soundAudio.step = surface => footsteps.push(surface);
soundAudio.update({ x: 0, z: 3 }, false); soundAudio.update({ x: 0, z: 2 }, false);
soundAudio.update({ x: 0, z: -20 }, false); soundAudio.update({ x: 0, z: -21 }, false);
soundAudio.update({ x: 8.5, z: -20 }, false); soundAudio.update({ x: 8.5, z: -21 }, false);
assert.deepEqual(footsteps, ['wood', 'concrete', 'wood'], 'footsteps follow the actual hall/yard/kitchen floor materials; teleport jumps add no steps');
soundAudio.update({ x: 8.5, z: -20 }, true); assert.equal(footsteps.length, 3, 'reading and paused movement never emit footsteps');
soundAudio.update({ x: 32, z: 3 }, false, 'hospital'); assert.equal(soundAudio.currentSoundscape.rain, 0);
soundAudio.update({ x: 0, z: -50 }, false, 'crash'); assert.ok(soundAudio.currentSoundscape.rain > 0);
assert.equal(footsteps.length, 3, 'a memory transition resets accumulated walking distance');
const rainChanges = [];
soundAudio.context = { currentTime: 2 };
soundAudio.rainGain = { gain: { setTargetAtTime(value) { rainChanges.push(value); } } };
soundAudio.rainFilter = { frequency: { setTargetAtTime() {} } };
soundAudio.applySoundscape(); soundAudio.applySoundscape();
assert.equal(rainChanges.length, 1, 'unchanged ambience never reschedules gain automation each frame');
const storage = new Map();
const adapter = { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value) };
const story = new game.ThreeStory(adapter);
story.state.arrival = 'home';
const untouched = JSON.stringify(story.state);
assert.match(story.guidance().text, /入口右手边/);
assert.doesNotMatch(story.guidance(1).text, /已经确定|说的是中轮|说明雨字/,
    'interpreted evidence must come from observed records');
assert.equal(JSON.stringify(story.state), untouched, 'asking for help must not observe clues or move a wheel');
assert.match(story.guidance(2).text, /灯 · 人 · 门/, 'only the explicit answer tier reveals the combination');
story.record('letter'); assert.match(story.guidance().text, /红绳/);
story.record('lock'); assert.match(story.guidance().text, /全家福/);
story.record('coffin'); assert.doesNotMatch(story.guidance(1).text,/棺沿|修锁/);
assert.match(story.guidance(1).text,/左边是灯/);
story.reset(); story.state.arrival = 'home';
assert.equal(story.finish(), false, 'cannot finish through a closed door');
for (const item of game.MAIN_HALL_MAP.interactables) story.record(item.id);
assert.equal(story.state.opened, false, 'reading everything must not solve the lock');
assert.equal(story.unlock(), false, 'wrong combination keeps the gate shut');
story.state.wheels = [3, 2, 1];
assert.equal(story.unlock(), true, 'actual three-symbol combination opens the lock');
assert.equal(story.finish(), true);
story.revealPortrait(); story.save({ x: 0, z: -12.3, yaw: Math.PI, pitch: 0 });
assert.equal(story.state.records.includes('portrait_back'), false, 'lifting the cloth does not read the hidden inscription');
const restored = new game.ThreeStory(adapter);
assert.equal(restored.state.ending, true); assert.equal(restored.state.portrait, true);
assert.equal(restored.state.portraitBackRead, false); assert.equal(restored.state.records.includes('portrait_back'), false);
assert.equal(story.readPortraitBack(), true); assert.equal(new game.ThreeStory(adapter).state.portraitBackRead, true);
assert.equal(restored.state.position.z, -12.3);
assert.match(restored.guidance().text, /门闩已经松开/);
assert.deepEqual([...restored.state.wheels], [3, 2, 1]);
const pinStorage = new Map(), pinAdapter = { getItem: key => pinStorage.get(key), setItem: (key, value) => pinStorage.set(key, value) };
const pinStory = new game.ThreeStory(pinAdapter);
assert.equal(pinStory.togglePin('coffin'), false, 'unobserved records cannot enter the comparison');
for (const id of ['letter', 'coffin', 'wall_marks']) pinStory.record(id);
pinStory.togglePin('letter'); pinStory.togglePin('coffin');
assert.equal(pinStory.togglePin('wall_marks'), false, 'a third pin never silently replaces either selected record');
assert.deepEqual([...new game.ThreeStory(pinAdapter).state.pinnedRecords], ['letter', 'coffin']);
assert.equal(pinStory.state.opened, false, 'comparing evidence never operates the lock');
pinStorage.set('huisha.3d.homecoming.v1', JSON.stringify({ version: 1, records: ['coffin', 'letter', 'medicine_letter'],
    pinnedRecords: ['unknown', 'medicine_letter', 'coffin', 'coffin', 'letter', 'wall_marks'] }));
assert.deepEqual([...new game.ThreeStory(pinAdapter).state.pinnedRecords], ['coffin', 'letter'], 'restoring pins removes unknown, gated, unread and duplicate entries');
pinStory.reset(); assert.equal(pinStory.state.pinnedRecords.length, 0);
assert.equal([...storage.keys()][0], 'huisha.3d.homecoming.v1');
const unavailable = new game.ThreeStory({ getItem() { throw new Error('denied'); } });
assert.equal(unavailable.saveAvailable, false); unavailable.record('letter'); assert.equal(unavailable.state.records.length, 1);
storage.set('huisha.3d.homecoming.v1', '{broken');
assert.equal(new game.ThreeStory(adapter).state.opened, false, 'corrupt save falls back to new chapter');
storage.set('huisha.3d.homecoming.v1', JSON.stringify({ version: 1, portrait: true, records: [] }));
assert.ok(new game.ThreeStory(adapter).state.records.includes('portrait_back'), 'legacy revealed portraits preserve the previously available record');
storage.set('huisha.3d.homecoming.v1', JSON.stringify({ version: 1, portrait: false, records: ['portrait_back'] }));
assert.ok(!new game.ThreeStory(adapter).state.records.includes('portrait_back'), 'a covered portrait must not leak its hidden inscription into the journal');
storage.set('huisha.3d.homecoming.v1', JSON.stringify({ version: 1, portrait: true, portraitBackRead: false,
    records: ['portrait_back'], pinnedRecords: ['portrait_back'] }));
assert.equal(new game.ThreeStory(adapter).state.pinnedRecords.length, 0, 'a new unread portrait cannot leak its back into pinned evidence');
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
for (const id of ['chinese_armchair', 'chinese_console_table', 'chinese_cabinet', 'SchoolDesk_01', 'SchoolChair_01', 'wheelchair_01','wooden_bucket_01','old_bed_frame','bench_vice_01','wooden_lantern_01','fern_02','shrub_02','dead_tree_trunk_02','wicker_basket_01','wooden_crate_01','industrial_caged_sconce','worn_metal_rack','garden_hose_wall_mounted_01','pot_enamel_01']) {
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
house.loadClinicFinishes = () => {}; // Texture decoding is exercised in the browser.
house.scene = new THREE.Scene();
house.materials = Object.fromEntries(['wall', 'floor', 'wood', 'darkWood', 'brass', 'red', 'cloth', 'paper', 'portrait', 'stone', 'wax', 'ash', 'plaster', 'brick', 'paving'].map(key => [key, new THREE.MeshStandardMaterial()]));
house.createArchitecture(); house.createProps(); await house.loadModels();
{
    const progress = new Map();
    const storage = {getItem: key=>progress.get(key),setItem:(key,value)=>progress.set(key,value)};
    const lampStory = new game.ThreeStory(storage);
    assert.ok(lampStory.takeLamp());
    const draftPose = {x:0,z:-5.1,yaw:Math.PI,pitch:0};
    lampStory.state.shielded = true;
    assert.equal(lampStory.crossDraft(draftPose),false);
    lampStory.state.shielded = false;
    assert.ok(lampStory.crossDraft(draftPose));
    assert.equal(new game.ThreeStory(storage).state.lamp,'out');
    assert.equal(lampStory.hangLamp(),false);
    assert.ok(lampStory.takeLamp() && lampStory.hangLamp());
    const camera = new THREE.PerspectiveCamera(), cues=[];
    const rig = Object.create(house);
    Object.assign(rig,{camera,story:lampStory,isPaused:()=>false,onWatchEvent:cue=>cues.push(cue),
        controls:{snapshot:()=>({x:camera.position.x,z:camera.position.z,yaw:Math.PI,pitch:0}),
            teleport:p=>camera.position.set(p.x,1.6,p.z)}});
    rig.controls.clear=()=>{};
    rig.controls.canOccupy=(x,z)=>!rig.map.obstacles.some(o=>o.id==='well' && x>=o.xMin-.15 && x<=o.xMax+.15 && z>=o.zMin-.15 && z<=o.zMax+.15);
    const well=new game.ThreeWellChase(rig);
    camera.position.set(-2.9,1.6,-20.65);well.update(.05);
    assert.equal(well.root.visible,false);
    well.begin();
    for(const t of [2.5,3.6,4.72,5.1]){
        well.pose(t,true);
        for(const arm of well.arms){
            const wrist=arm.hand.getWorldPosition(new THREE.Vector3());
            assert.ok(wrist.distanceTo(new THREE.Vector3(-3+arm.side*.25,.897,-21.41))<.001,'the paper hand stays on the same stone as the body rises');
            assert.ok(Math.abs(arm.upper.scale.y-.389)<1e-6 && Math.abs(arm.lower.scale.y-.374)<1e-6);
        }
    }
    for(let i=0;i<173;i++)well.update(.05);
    assert.equal(well.phase,'chase');
    assert.ok(Math.abs(camera.position.z+20.65)<.01,'film returns to the actual well interaction position');
    for(let i=0;i<180 && well.phase==='chase';i++)well.update(.05);
    assert.ok(cues.includes('caught'));
    camera.position.set(-3,1.6,-20.6);well.begin();well.release();
    camera.position.set(4,1.6,-19.8);
    for(let i=0;i<55;i++)well.update(.05);
    assert.ok(well.root.position.x> -2,'the bride has actually left the well');
    camera.position.set(6.4,1.6,-21.3);well.update(.05);
    assert.ok(cues.includes('safe') && new game.ThreeStory(storage).state.wellEscaped);
    assert.ok(new game.ThreeStory(storage).state.wellRopeFreed);
    assert.equal(well.phase,'retreat');assert.ok(well.root.visible);
    const returnStart=well.root.position.clone();
    rig.isPaused=()=>true;well.update(1.4);assert.deepEqual(well.root.position,returnStart);
    rig.inspectionKind='wellSeat';
    assert.ok(well.callFromDoorway());assert.equal(well.callFromDoorway(),false);
    for(let i=0;i<220 && well.phase==='retreat';i++)well.update(.05);
    assert.equal(well.phase,'lowering');assert.ok(Math.abs(well.root.position.x+3)<.02);
    assert.deepEqual(camera.position.toArray(),[6.4,1.6,-21.3]);
    while(well.time>6.50)well.update(.05);
    const feetAtWell=well.root.position.clone(),lookStart=well.head.rotation.y;
    for(let i=0;i<16;i++)well.update(.05);
    assert.ok(Math.abs(well.head.rotation.y-lookStart)>.35 && cues.includes('glance'));
    assert.deepEqual(well.root.position,feetAtWell);
    for(let i=0;i<130;i++)well.update(.05);
    assert.ok(well.phase==='quiet' && !well.root.visible && cues.includes('submerged'));
    assert.ok(well.hemTorn && well.coat.geometry.drawRange.count<well.coat.geometry.index.count);
    rig.isPaused=()=>false;rig.inspectionKind=null;
    rig.story.state.bucketParked=true;rig.story.state.wellScrapTaken=true;rig.story.save();
    well.begin();well.release();well.update(.05);
    assert.ok(new game.ThreeStory(storage).state.bucketParked,'replaying the chase preserves the settled bucket');
    assert.ok(well.hemTorn && new game.ThreeStory(storage).carried().includes('wellScrap'));
    well.root.removeFromParent();
    console.log('Well cutscene, skip, physical pursuit, return to threshold and saved escape passed.');
}
house.outsideLight = { intensity: 0 }; house.syncState(true); house.scene.updateMatrixWorld(true);
assert.equal(house.scene.getObjectByName('chinese_armchair').isGroup, true);
assert.equal(house.scene.getObjectByName('chinese_console_table').isGroup, true);
assert.equal(house.scene.getObjectByName('chinese_cabinet').isGroup, true);
const phoneBottom = new THREE.Box3().setFromObject(house.scene.getObjectByName('phone-body')).min.y;
const bagTop = new THREE.Box3().setFromObject(house.scene.getObjectByName('open-effects-bag')).max.y;
assert.ok(phoneBottom >= bagTop && phoneBottom - bagTop < 0.006, 'the phone rests on the effects bag');
for (const [id, paper] of house.documents.papers) {
    const definition = game.DOCUMENTS[id]; assert.equal(paper.root.parent.userData.memorySpace, definition.space);
    if (id === 'hospital_plan') {
        const gap = new THREE.Box3().setFromObject(paper.front).min.z - new THREE.Box3().setFromObject(house.scene.getObjectByName('hospital-clipboard')).max.z;
        assert.ok(gap > 0 && gap < 0.02, 'the upright plan sits in front of its clipboard'); continue;
    }
    const p = paper.root.getWorldPosition(new THREE.Vector3());
    const desk = house.memories.rooms[definition.space].children.find(object => {
        if (!['SchoolDesk_01', 'clinic-countertop','handover-clipboard'].includes(object.name)) return false;
        const bounds = new THREE.Box3().setFromObject(object); return p.x >= bounds.min.x && p.x <= bounds.max.x && p.z >= bounds.min.z && p.z <= bounds.max.z;
    });
    const gap = new THREE.Box3().setFromObject(paper.root).min.y - new THREE.Box3().setFromObject(desk).max.y;
    assert.ok(gap >= 0 && gap < 0.01, 'paper rests just above the desk surface');
}
console.log('Assets: all nineteen glTF models, binary buffers, texture dependencies and scene placement passed.');
for (const prefix of ['hall', 'school', 'hospital']) for (const side of [-1, 1]) {
    const name = `${prefix}-window-wall-${side}`, wall = house.scene.getObjectByName(name), opening = wall.userData.windowOpening;
    const pointX = opening.left + (opening.right - opening.left) / (prefix === 'hall' ? 12 : 6);
    const rayAt = (x, y) => {
        const origin = wall.localToWorld(new THREE.Vector3(x, y, 0.6));
        const direction = new THREE.Vector3(0, 0, -1).transformDirection(wall.matrixWorld);
        return new THREE.Raycaster(origin, direction, 0, 1.2).intersectObject(wall, true);
    };
    const through = rayAt(pointX, opening.sill + 0.23);
    assert.deepEqual(through.map(hit => hit.object.name), prefix === 'hall' ? [] : [`${name}-glass`], `${name} has an actual opening, not a continuous wall behind the grille`);
    assert.equal(rayAt(pointX, opening.sill - 0.2)[0]?.object.name, `${name}-wall`);
    assert.equal(rayAt(pointX, opening.head + 0.2)[0]?.object.name, `${name}-wall`);
    assert.equal(rayAt(opening.left - 0.2, opening.sill + 0.23)[0]?.object.name, `${name}-wall`);
    assert.equal(wall.children.filter(object => object.isMesh).length, prefix === 'hall' ? 2 : 3, 'wall pieces and bars are merged per material, not per small detail');
    if (prefix !== 'hall') {
        const pane = house.scene.getObjectByName(`${name}-glass`);
        assert.ok(pane.material.transparent && !pane.material.depthWrite && !pane.castShadow);
    }
}
for (const side of [-1, 1]) {
    const ray = new THREE.Raycaster(new THREE.Vector3(side * 5.25, 1.35, -0.95), new THREE.Vector3(side, 0, 0), 0, 3);
    const court = house.scene.getObjectByName(`side-court-wall-${side}`);
    assert.ok(ray.intersectObject(court).length, 'the old-house window has a real side-court wall beyond it');
}
console.log('Architecture: six real window openings, solid reveals, distinct panes and actual side-court depth passed. No WebGL appearance was checked.');

let paused = false;
const camera = new THREE.PerspectiveCamera(66, 1, 0.06, 60);
const controls = new game.ThreeControls({ camera, domElement: eventTarget, map: game.WORLD_MAP, story,
    isPaused: () => paused, getDoorAngle: id => house.doorAngle(id) });
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
for (const side of [-1, 1]) assert.equal(controls.canOccupy(side * 5, -0.3), false, 'a window opening does not let players walk outside the room bounds');
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
const beforePortrait = controls.snapshot(), beforePortraitFov = camera.fov;
house.beginPortraitInspection(); assert.equal(story.readPortraitBack(), false, 'covered portraits cannot add hidden writing');
house.portrait.flip(); assert.equal(house.portrait.angle, 0);
story.revealPortrait(); house.syncState(); house.portrait.update(0.016);
assert.ok(house.portrait.lift > 0 && house.portrait.lift < 1, 'the real cloth lifts through geometry');
let readingPortrait = true; house.isReading = () => readingPortrait;
const pausedLift = house.portrait.lift; house.portrait.update(1); assert.equal(house.portrait.lift, pausedLift);
readingPortrait = false; house.portrait.update(1); assert.equal(house.portrait.cloth.visible, false);
for (const [width, height] of [[1280, 720], [390, 844], [844, 390], [360, 640], [640, 360], [768, 1024]]) {
    house.root.clientWidth = width; house.root.clientHeight = height; camera.aspect = width / height; house.frameInspection();
    house.scene.updateMatrixWorld(true);
    for (const x of [-0.575, 0.575]) for (const y of [-0.675, 0.675]) {
        const projected = new THREE.Vector3(x, y, 0).applyMatrix4(house.portrait.root.matrixWorld).project(camera);
        assert.ok(Math.abs(projected.x) < 0.96 && Math.abs(projected.y) < 0.96 && projected.z < 1, `${width}x${height}: the full frame fits in view`);
        if (height <= 520 && width > 680) assert.ok((projected.x + 1) / 2 < 0.64, 'short landscape leaves room for side controls');
        else assert.ok((1 - projected.y) / 2 < 0.57, 'portrait view leaves the bottom control area clear');
    }
}
house.portrait.flip(); house.portrait.update(0.016); assert.equal(house.portrait.backVisible, false);
house.portrait.update(1); assert.equal(house.portrait.backVisible, true);
house.scene.updateMatrixWorld(true);
const backPoint = house.portrait.back.getWorldPosition(new THREE.Vector3());
const portraitRay = new THREE.Raycaster(camera.position, backPoint.clone().sub(camera.position).normalize());
assert.equal(portraitRay.intersectObject(house.portrait.root, true)[0].object.name, 'portrait-back-inscription', 'the turned backside is the actual visible surface');
assert.equal(story.state.records.includes('portrait_back'), false, 'turning the object does not automatically read it');
story.readPortraitBack(); house.endInspection();
assert.deepEqual({ ...controls.snapshot() }, { ...beforePortrait }); assert.equal(camera.fov, beforePortraitFov);
assert.ok(house.portrait.root.position.equals(house.portrait.home)); assert.equal(house.portrait.root.rotation.y, 0);
story.reset(); house.syncState(true); assert.equal(house.portrait.cloth.visible, true); assert.equal(house.portrait.back.visible, false);
house.root.clientWidth = 1280; house.root.clientHeight = 720; camera.aspect = 16 / 9; camera.updateProjectionMatrix();
console.log('Portrait: actual two-sided geometry, cloth lift/pause, six-view framing, explicit backside reading, legacy saves and player-pose restoration passed.');
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
house.syncState(); assert.equal(house.outsideLight.intensity, 4, 'unlocking alone does not jump the exterior fill light');
const releaseEvents = []; house.onMechanismEvent = event => releaseEvents.push(event);
const closedCordEnds = house.doorMechanism.cords.map(cord => cord.points[9].clone());
house.moveDoor(0.05);
assert.equal(house.door.rotation.y, 0, 'the bolt must retract before the door starts swinging');
assert.ok(house.doorMechanism.bolt.position.x < 1.85 && house.doorMechanism.bolt.position.x > 0.92);
assert.equal(controls.canOccupy(0, -11.5), false, 'the still-closed door blocks movement throughout bolt release');
house.moveDoor(0.15);
assert.ok(house.doorMechanism.cords.every((cord, index) => cord.mesh.visible && cord.points[9].y < closedCordEnds[index].y), 'cord ends drop through geometry instead of disappearing');
const pausedRelease = house.doorMechanism.progress; paused = true; house.moveDoor(1);
assert.equal(house.doorMechanism.progress, pausedRelease, 'reading/pause freezes the release as well as the leaf'); paused = false;
for (let frame = 0; frame < 11; frame++) house.moveDoor(0.05);
assert.ok(house.door.rotation.y > 0 && house.door.rotation.y < Math.PI / 2, 'the door swings outward rather than through the player');
assert.ok(house.outsideLight.intensity > 4 && house.outsideLight.intensity < 9, 'the outside fill follows the actual opening angle');
assert.deepEqual(releaseEvents, ['door-release']);
assert.ok(house.doorMechanism.cords.every(cord => cord.points[9].y < 0.04 && cord.mesh.visible));
const beforeCords=house.story.state.coffinCordsAside;
house.story.state.coffinCordsAside=true;house.doorMechanism.apply();
assert.ok(house.doorMechanism.cords.every(cord=>cord.points.slice(0,4).every(p=>p.y<.04 && p.z<-.15)));
house.story.state.coffinCordsAside=beforeCords;house.doorMechanism.apply();
const settledCordVersions = house.doorMechanism.cords.map(cord => cord.mesh.instanceMatrix.version);
for (let frame = 0; frame < 10; frame++) { house.syncState(); house.moveDoor(0.05); }
assert.deepEqual(house.doorMechanism.cords.map(cord => cord.mesh.instanceMatrix.version), settledCordVersions, 'settled cords never rewrite GPU matrices each frame');
assert.equal(releaseEvents.length, 1, 'remaining near the open door does not replay its release event');
const sampleMatrix = new THREE.Matrix4(), segmentPoint = new THREE.Vector3();
for (const cord of house.doorMechanism.cords) for (let index = 0; index < cord.mesh.count; index++) {
    cord.mesh.getMatrixAt(index, sampleMatrix); segmentPoint.setFromMatrixPosition(sampleMatrix);
    assert.ok(Number.isFinite(segmentPoint.x) && segmentPoint.y >= 0.023);
    assert.ok(cord.mesh.boundingSphere.containsPoint(segmentPoint), 'the fixed culling bounds contain the entire released cord');
}
const beforeLoadEvents = releaseEvents.length; house.syncState(true); house.moveDoor(0.05);
assert.equal(releaseEvents.length, beforeLoadEvents, 'restoring an unlocked state does not replay release audio');
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
assert.equal(house.doorMechanism.bolt.position.x, 1.85); assert.equal(house.doorMechanism.cords[0].points[9].y, 1.1);
assert.equal(house.outsideLight.intensity, 4, 'restart restores the closed mechanism and lighting');
console.log('Release: bolt-before-leaf timing, persistent falling/slack cords, paused animation, actual-angle lighting, one-shot events, saved/reduced states and stable instanced buffers passed.');
paused = true; const before = camera.position.clone(); controls.keys.add('KeyW'); controls.update(0.05);
assert.equal(camera.position.distanceTo(before), 0); assert.equal(controls.keys.size, 0);
interaction.update(); assert.equal(prompt.hidden, true); paused = false;

function flood(origin = game.MEMORIES[story.state.memory]?.start || game.WORLD_MAP.playerStart) {
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
const roadside = flood(game.WORLD_MAP.roadStart);
assert.ok(roadside.every(p => p.z > 4.4), 'the locked front door blocks entry');
for (const item of game.WORLD_MAP.interactables.filter(item => !item.inventoryOnly && ['lane','porch'].includes(item.area))) verifyReachable(item,roadside);
story.state.arrival = 'home'; house.syncState(true); house.scene.updateMatrixWorld(true);
const reachable = flood();
assert.ok(reachable.some(p => p.z > 30), 'both porch seams are walkable after unlocking');
assert.ok(reachable.length > 2000);
function verifyReachable(item, points) {
    let focusPoint;
    for (const point of points) {
        if (Math.hypot(point.x - item.position.x, point.z - item.position.z) > item.radius) continue;
        const eyeY=1.6+controls.supportHeight(point.x,point.z);
        const elevation = Math.atan2(item.position.y - eyeY, Math.hypot(point.x - item.position.x, point.z - item.position.z));
        if (Math.abs(elevation) > 1.15) continue;
        camera.position.set(point.x, eyeY, point.z); camera.lookAt(new THREE.Vector3(item.position.x, item.position.y, item.position.z)); camera.updateMatrixWorld(true);
        interaction.update();
        if (interaction.current?.id === item.id) { focusPoint = point; break; }
    }
    assert.ok(focusPoint, `${item.id} must be reachable and investigable through real geometry`);
    camera.lookAt(camera.position.clone().add(new THREE.Vector3(0, 0, 3))); camera.updateMatrixWorld(true);
    if (item.position.z < focusPoint.z) { interaction.update(); assert.notEqual(interaction.current?.id, item.id, 'looking away must not inspect behind the player'); }
    return focusPoint;
}
for (const item of game.WORLD_MAP.interactables.filter(item => !item.inventoryOnly && !item.space && !item.requiresOpen && !item.requiresWater)) verifyReachable(item, reachable);
story.state.wheels = [3, 2, 1]; story.unlock(); house.syncState(true); house.scene.updateMatrixWorld(true);
const yardPoints = flood();
const outside = yardPoints.find(p => p.z < -13.5);
assert.ok(outside, 'door opening must make the ending area physically reachable');
camera.position.set(0, 1.6, -12.9); camera.lookAt(new THREE.Vector3(0, 1.25, -13.9)); camera.updateMatrixWorld(true);
interaction.update(); assert.equal(interaction.current?.id, 'threshold');
interaction.activate(); assert.ok(story.state.records.includes('threshold')); assert.equal(story.state.ending, false, 'reaching or reading the threshold must not auto-finish');
assert.equal(house.cardiganBedSite.visible,false);
story.state.chestOpen=true;story.state.cardiganPlace='carried';house.syncState(true);house.scene.updateMatrixWorld(true);
for (const item of game.WORLD_MAP.interactables.filter(item => !item.inventoryOnly && item.requiresOpen && !item.requiresState && !item.requiresWater)) verifyReachable(item, yardPoints);
story.state.chestOpen=false;story.state.cardiganPlace='chest';house.syncState(true);
story.state.crossedYard=true;
for(const hung of [false,true]){
    story.state.maskHung=hung;house.courtyard.syncMask();house.scene.updateMatrixWorld(true);
    verifyReachable(house.courtyard.maskSite,yardPoints);
}
story.state.maskHung=false;story.state.crossedYard=false;house.courtyard.syncMask();
assert.ok(yardPoints.some(point => point.x > 7 && point.z < -20), 'the kitchen must connect physically to the hall and yard');
assert.ok(!yardPoints.some(point => point.z < -28), 'the courtyard gate stays shut until the water mechanism is operated');
assert.equal(story.depart('leave'), false, 'unlocking the first door is not the final ending');
story.enterCourtyard();
assert.ok(!yardPoints.some(p=>p.x<-13 && p.z<-14),'hidden workshop is sealed');
story.state.wardrobeOpen=true; house.syncState(true); house.scene.updateMatrixWorld(true);
const workshopPoints=flood();
for(const item of game.WORLD_MAP.interactables.filter(i=>i.requiresState==='wardrobeOpen')) verifyReachable(item,workshopPoints);
verifyReachable(game.WORLD_MAP.interactables.find(item=>item.id==='attic_winch'),workshopPoints);
assert.ok(!workshopPoints.some(p=>p.x < -14 && p.z > -9.4 && p.z < -5),'locked cellar has no walkable landing');
story.state.cellarOpen=true;story.state.sumpDrained=true;house.syncState(true);house.scene.updateMatrixWorld(true);
const cellarPoints=flood();
for(const item of game.WORLD_MAP.interactables.filter(i=>['sump_grate','sump_pump','cellar_keyring'].includes(i.id))) verifyReachable(item,cellarPoints);
assert.ok(controls.supportHeight(-10.2,-7)>2 && controls.supportHeight(-15.2,-7)<-2);
assert.ok(story.takeGear('weight')); story.state.calibrated=true;
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
        [house.courtyard.pan, 'weigh'], [house.scene.getObjectByName('scale-dial'), 'weigh']
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
const scaleEvents = []; house.onScaleEvent = event => scaleEvents.push(event);
for (const amount of [0, 3, 5]) {
    story.state.buckets = [0, amount]; house.syncState(true); house.beginWaterInspection();
    const beforeTrial = JSON.stringify(story.state);
    assert.equal(house.courtyard.beginWeigh(), true); assert.equal(house.courtyard.beginWeigh(), false);
    house.courtyard.update(0.25);
    assert.ok(house.courtyard.buckets[1].position.x > 8.45 && house.courtyard.buckets[1].position.x < 9.4);
    assert.equal(story.state.waterSolved, false); assert.equal(house.courtyard.releaseProgress, 0);
    readingPortrait = true; const held = house.courtyard.weighing.time; house.courtyard.update(1);
    assert.equal(house.courtyard.weighing.time, held, 'reading freezes the scale trial'); readingPortrait = false;
    house.courtyard.update(0.3);
    assert.equal(house.courtyard.buckets[1].position.x, 9.4, 'failed loads are still physically placed on the pan');
    assert.ok(Math.abs(house.courtyard.needle.rotation.z - (4 - amount) * 0.26) < 1e-9);
    assert.equal(JSON.stringify(story.state), beforeTrial, 'failed trials do not change water, records, progress or saved position');
    assert.equal(scaleEvents.at(-1).phase, 'weighed'); assert.equal(scaleEvents.at(-1).amount, amount);
    house.courtyard.update(1.3);
    assert.equal(house.courtyard.weighing, null); assert.equal(scaleEvents.at(-1).phase, 'ready');
    assert.ok(Math.abs(house.courtyard.buckets[1].position.x - 8.45) < 1e-9);
    house.endInspection();
}
story.state.buckets = [0, 4]; house.syncState(true); house.beginWaterInspection();
house.courtyard.beginWeigh(); house.courtyard.update(0.2); house.endInspection();
assert.equal(story.state.waterSolved, false, 'leaving before the bucket lands cancels the trial');
assert.equal(house.courtyard.weighing, null); assert.equal(house.courtyard.buckets[1].position.x, 8.45);
house.beginWaterInspection(); house.courtyard.beginWeigh(); house.courtyard.update(0.25); house.syncState(true);
assert.equal(house.courtyard.weighing, null, 'restoring/resetting clears transient scale animation');
assert.equal(story.state.waterSolved, false); house.endInspection();
story.state.buckets = [0, 5]; house.beginWaterInspection(); house.reducedMotion = { matches: true };
assert.equal(house.courtyard.beginWeigh(), true); assert.equal(house.courtyard.weighing, null);
assert.equal(story.state.waterSolved, false); assert.equal(scaleEvents.at(-2).amount, 5);
house.reducedMotion = null; house.endInspection(); story.state.buckets = [0, 0]; house.syncState(true);
console.log('Scale: actual light/heavy loads, pan/needle, delayed judgement, reading freeze, cancellation, restore and reduced motion passed.');
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
camera.position.set(8.5, 1.6, -21.7); controls.applyLook();
assert.equal(controls.canOccupy(8.5, -21.7), true, 'the closest legal pre-opening stance is initially clear');
house.beginWaterInspection(); house.courtyard.sync(false);
const beforeDrawerReturn = { ...house.playerSnapshot() };
const letterItem = game.WORLD_MAP.interactables.find(item => item.id === 'medicine_letter');
const letterCamera = new THREE.PerspectiveCamera(66, 1, 0.06, 60); letterCamera.position.set(8.5, 0.9, -20.7); letterCamera.lookAt(8.5, 0.63, -21.9);
const letterInteraction = new game.ThreeInteraction({ camera: letterCamera, scene: new THREE.Scene(), map: { interactables: [letterItem] },
    story, prompt: { hidden: true, textContent: '' }, isPaused: () => false, onInspect() {} });
letterInteraction.activate(); assert.equal(letterInteraction.current, null, 'a solved state cannot expose a still-hidden drawer record');
assert.equal(story.state.records.includes('medicine_letter'), false);
house.courtyard.update(0.05); house.courtyard.moveGate(0.05);
assert.equal(house.courtyard.gate.rotation.y, 0, 'the yard gate waits for its bolt/cable release');
assert.ok(house.courtyard.gateBolt.position.x < 1.6 && house.courtyard.gateBolt.position.x > 0.8);
const pausedDrawerZ = house.courtyard.drawer.position.z, pausedGateRelease = house.courtyard.releaseProgress;
readingPortrait = true; house.courtyard.update(1); assert.equal(house.courtyard.drawer.position.z, pausedDrawerZ);
assert.equal(house.courtyard.releaseProgress, pausedGateRelease, 'a document freezes kitchen props even while at the water inspector');
readingPortrait = false;
for (let frame = 0; frame < 15; frame++) { house.courtyard.update(0.05); house.courtyard.moveGate(0.05); }
assert.ok(house.courtyard.gate.rotation.y > 0); assert.equal(house.courtyard.releaseProgress, 1);
assert.ok(house.playerSnapshot().z > beforeDrawerReturn.z, 'the opening drawer clears the saved return stance instead of trapping the player');
assert.equal(controls.canOccupy(house.playerSnapshot().x, house.playerSnapshot().z), true);
house.scene.updateMatrixWorld(true); letterInteraction.update(); assert.equal(letterInteraction.current?.id, 'medicine_letter');
const movingLetter = house.courtyard.letter.getWorldPosition(new THREE.Vector3());
assert.ok(Math.abs(movingLetter.z - (house.courtyard.drawer.position.z - 0.33)) < 1e-9, 'the letter rides inside the physical drawer');
house.endInspection(); assert.equal(controls.canOccupy(camera.position.x, camera.position.z), true);
letterInteraction.dispose();
assert.ok(house.scene.getObjectByName('water-to-gate-copper-cable'));
house.syncState(true); house.scene.updateMatrixWorld(true);
assert.equal(house.courtyard.waterParts[1].visible, true);
assert.equal(house.courtyard.buckets[1].position.x, 9.4, 'the five-litre bucket physically moves onto the scale');
assert.equal(house.courtyard.letter.visible, true, 'the released drawer reveals an actual letter in the scene');
assert.ok(house.courtyard.drawer.position.z > -22, 'the drawer physically slides out');
const drawerResumeStory = new game.ThreeStory({ getItem: () => JSON.stringify({ version: 1, opened: true, waterSolved: true,
    position: { x: 8.5, z: -21.7, yaw: Math.PI, pitch: -0.2 } }), setItem() {} });
const drawerResumeCamera = new THREE.PerspectiveCamera(66, 1, 0.06, 60);
const drawerResumeControls = new game.ThreeControls({ camera: drawerResumeCamera, domElement: eventTarget,
    map: game.WORLD_MAP, story: drawerResumeStory, isPaused: () => false });
assert.ok(drawerResumeCamera.position.z > -21.3 && drawerResumeCamera.position.z < -21, 'loading while a drawer was opening restores a nearby safe point instead of the hall spawn');
assert.equal(drawerResumeControls.canOccupy(drawerResumeCamera.position.x, drawerResumeCamera.position.z), true);
assert.equal(drawerResumeControls.yaw, Math.PI); assert.equal(drawerResumeControls.pitch, -0.2); drawerResumeControls.dispose();
const roadPoints = flood();
assert.ok(roadPoints.some(point => point.z < -30.5), 'operating the scale opens a walkable path to the mountain road');
for (const item of game.WORLD_MAP.interactables.filter(item => !item.inventoryOnly && !item.space && item.requiresWater)) verifyReachable(item, roadPoints);
assert.equal(story.state.departure, null, 'reading clues and reaching the road do not choose an ending');
assert.equal(story.depart('stay'), true); assert.equal(new game.ThreeStory(adapter).state.departure, 'stay');
assert.equal(story.state.stoveLit,story.state.gear.includes('matches'));
assert.equal(story.depart('leave'), false); assert.equal(story.signalBus('house'), false);
assert.equal(story.signalBus('bridge'),true); assert.equal(new game.ThreeStory(adapter).state.busCalled,true);
assert.equal(story.depart('leave'), true); assert.equal(new game.ThreeStory(adapter).state.departure, 'leave');
console.log('Courtyard: connected kitchen, real object picks in six viewports, volume conservation, save recovery, moving props, gated road and explicit endings passed.');
const returnPose = { x: 6.6, z: -23.5, yaw: 0.8, pitch: -0.1 };
controls.teleport(returnPose);
assert.equal(story.enterMemory('school', { x: 0 }), false, 'entering a memory requires a real return pose');
assert.equal(story.enterMemory('__proto__', returnPose), false, 'unknown memory identifiers cannot become active spaces');
assert.equal(story.depart('wake'), false, 'the deeper ending is not unlocked by the water puzzle');
for (const [id, definition] of Object.entries(game.MEMORY_CASES)) {
    assert.equal(new Set(definition.facts.map(fact => fact.id)).size, definition.facts.length);
    for (const fact of definition.facts) {
        const source = game.WORLD_MAP.interactables.find(item => item.id === fact.record);
        assert.ok(source && source.space === id);
        assert.ok(fact.quote.split('…').every(fragment => source.text.includes(fragment)), 'timeline fragments must come from their actual source record');
    }
    if(id==='crash'){assert.equal(story.enterMemory(id,controls.snapshot()),false); story.state.coffinOpen=true;assert.equal(story.enterMemory(id,controls.snapshot()),false);story.state.photoFiled=true;}
    assert.equal(story.enterMemory(id, controls.snapshot()), true);
    controls.teleport(story.state.position); house.syncState(true);
    assert.equal(house.homeRoot.visible, false);
    for (const [space, room] of Object.entries(house.memories.rooms)) assert.equal(room.visible, space === id);
    assert.equal(controls.canOccupy(returnPose.x, returnPose.z), false, 'movement is confined to the current memory, not the house');
    if(id==='crash'){
        assert.equal(controls.canOccupy(-2.65,-56),false);
        assert.equal(controls.canOccupy(0,-63),false);
        assert.ok(house.villageCar.getObjectByName('driver-window-glass'));
        assert.equal(house.memories.rooms.crash.getObjectByName('driver-window-glass'),undefined);
    }
    const points = flood();
    for (const item of game.WORLD_MAP.interactables.filter(item => item.space === id && !item.requiresTruth)) verifyReachable(item, points);
    story.setMemoryDraft(id, [...definition.records], definition.answer, definition.timelineOrder);
    assert.equal(story.deduce(id).success, false, 'unobserved records cannot be submitted as evidence');
    assert.equal(story.state.drafts[id].timeline.length, 0, 'unread records cannot create timeline fragments');
    for (const record of definition.records) {
        const item = game.WORLD_MAP.interactables.find(item => item.id === record);
        const point = verifyReachable(item, points);
        camera.position.set(point.x, 1.6, point.z); camera.lookAt(item.position.x, item.position.y, item.position.z); camera.updateMatrixWorld(true);
        interaction.activate();
        if (Object.hasOwn(game.DOCUMENTS, record)) {
            assert.equal(story.state.records.includes(record), false, 'picking up a document does not read its back');
            house.beginDocumentInspection(record); const paperPose = { ...house.playerSnapshot() }, paper = house.documents.papers.get(record);
            assert.equal(house.documents.visibleFace, 'front'); story.readDocumentFace(record, 'front');
            assert.equal(new game.ThreeStory(adapter).hasDocumentFace(record, 'back'), false, 'an unread back stays unread after restoring');
            assert.doesNotMatch(story.documentText(record), /我把担心|第一次/);
            for (const face of ['front', 'back']) {
                if (face === 'back') {
                    house.documents.flip(); house.documents.update(0.02); assert.equal(house.documents.visibleFace, null);
                    readingPortrait = true; const rotation = paper.root.rotation.y; house.documents.update(1);
                    assert.equal(paper.root.rotation.y, rotation, 'reading pauses document rotation'); readingPortrait = false;
                    house.documents.update(1); assert.equal(house.documents.visibleFace, 'back');
                    if (record !== 'hospital_record') story.readDocumentFace(record, 'back');
                }
                for (const [width, height] of [[1280, 720], [390, 844], [844, 390], [390, 640], [680, 720], [667, 375]]) {
                    house.root.clientWidth = width; house.root.clientHeight = height; camera.aspect = width / height; house.frameInspection(); house.scene.updateMatrixWorld(true);
                    const target = paper.root.getWorldPosition(new THREE.Vector3());
                    const hits = new THREE.Raycaster(camera.position, target.sub(camera.position).normalize()).intersectObject(paper.root, true);
                    assert.equal(hits[0]?.object, paper[face], 'the actual visible geometry matches the readable face');
                    for (const x of [-0.19, 0.19]) for (const y of [-0.27, 0.27]) {
                        const point = paper.root.localToWorld(new THREE.Vector3(x, y, 0.004)).project(camera);
                        assert.ok(Math.abs(point.x) < 0.98 && Math.abs(point.y) < 0.98 && point.z < 1);
                        if (height <= 520 && width > 680) assert.ok((point.x + 1) * width / 2 < width - 338);
                        else assert.ok((1 - point.y) * height / 2 < height * 0.6);
                    }
                    assert.deepEqual({ ...house.playerSnapshot() }, paperPose);
                }
            }
            house.endInspection(); assert.ok(paper.root.position.equals(paper.home)); assert.ok(paper.root.rotation.equals(paper.homeRotation));
            assert.deepEqual({ ...controls.snapshot() }, paperPose);
        }
        if (record === 'crash_phone') {
            assert.equal(story.state.records.includes(record), false, 'picking up a phone does not observe both pages');
            house.beginPhoneInspection(); const phonePose = { ...house.playerSnapshot() };
            house.phone.selectPage('calls'); assert.equal(story.state.phoneViews.length, 0, 'switching pages does not copy them into the journal');
            assert.equal(story.readPhonePage('calls'), true); assert.doesNotMatch(story.phoneText(), /二〇一六|录音文字/);
            const partialPhone = new game.ThreeStory(adapter);
            assert.deepEqual([...partialPhone.state.phoneViews], ['calls']);
            story.setMemoryDraft('crash', [...definition.records], definition.answer, ['call', 'voice']);
            assert.deepEqual([...story.state.drafts.crash.timeline], ['call']); assert.match(story.deduce('crash').message, /没有记下的页面/);
            for (const [width, height] of [[1280, 720], [390, 844], [844, 390], [390, 640], [680, 720], [667, 375]]) {
                house.root.clientWidth = width; house.root.clientHeight = height; camera.aspect = width / height; house.frameInspection();
                house.scene.updateMatrixWorld(true);
                for (const x of [-0.094, 0.094]) for (const y of [-0.174, 0.174]) {
                    const corner = house.phone.root.localToWorld(new THREE.Vector3(x, y, 0.025)).project(camera);
                    assert.ok(Math.abs(corner.x) < 0.98 && Math.abs(corner.y) < 0.98 && corner.z < 1, 'the full phone stays in the inspection viewport');
                    if (height <= 520 && width > 680) assert.ok((corner.x + 1) * width / 2 < width - 338);
                    else assert.ok((1 - corner.y) * height / 2 < height * 0.6, 'the phone leaves the lower 40% for controls');
                }
                for (const [x, page] of [[206, 'calls'], [562, 'recording']]) {
                    const point = house.phone.screen.localToWorld(new THREE.Vector3((x / 768 - 0.5) * 0.164, (0.5 - 1120 / 1280) * 0.293, 0)).project(camera);
                    assert.ok(Math.abs(point.x) < 0.95 && Math.abs(point.y) < 0.95 && point.z < 1);
                    assert.equal(house.phone.pick((point.x + 1) * width / 2, (1 - point.y) * height / 2), page, 'screen navigation uses actual screen UV hits');
                }
                assert.deepEqual({ ...house.playerSnapshot() }, phonePose, 'phone framing preserves the real player position');
            }
            house.phone.selectPage('recording'); story.readPhonePage('recording'); house.endInspection();
            assert.deepEqual({ ...controls.snapshot() }, phonePose); assert.ok(house.phone.root.position.equals(house.phone.home));
        }
        assert.ok(story.state.records.includes(record));
    }
    assert.equal(story.state.deductions[id], false, 'reading both records does not automatically complete deduction');
    story.setMemoryDraft(id, [...definition.records], definition.answer, []);
    assert.match(story.deduce(id).message, /时间线/, 'the obvious explanation alone cannot solve a memory');
    const undated = definition.facts.find(fact => fact.dated === false);
    if (undated) {
        story.record(undated.record); story.setMemoryDraft(id, [...definition.records], definition.answer, [...definition.timelineOrder, undated.id]);
        assert.match(story.deduce(id).message, /缺少明确日期/);
        story.setMemoryDraft(id, [definition.records[0], undated.record], definition.answer, [definition.timelineOrder[0], undated.id]);
        assert.match(story.deduce(id).message, /缺少明确日期/, 'uncertain fragments get actionable feedback even when an evidence source needs replacing');
    }
    story.setMemoryDraft(id, [...definition.records], (definition.answer + 1) % definition.choices.length, [...definition.timelineOrder].reverse());
    const draftBeforeWrong = JSON.stringify(story.state.drafts[id]);
    assert.equal(story.deduce(id).success, false); assert.equal(JSON.stringify(story.state.drafts[id]), draftBeforeWrong, 'wrong submissions keep the draft');
    assert.match(story.deduce(id).message, /先后/);
    story.save(controls.snapshot());
    const memoryRestored = new game.ThreeStory(adapter);
    assert.equal(memoryRestored.state.memory, id); assert.equal(JSON.stringify(memoryRestored.state.drafts[id]), draftBeforeWrong);
    const resumeCamera = new THREE.PerspectiveCamera(66, 1, 0.06, 60);
    const resumeControls = new game.ThreeControls({ camera: resumeCamera, domElement: eventTarget, map: game.WORLD_MAP,
        story: memoryRestored, isPaused: () => false });
    assert.equal(resumeCamera.position.x, memoryRestored.state.position.x); assert.equal(resumeCamera.position.z, memoryRestored.state.position.z);
    resumeControls.dispose();
    story.setMemoryDraft(id, [...definition.records], (definition.answer + 1) % definition.choices.length, definition.timelineOrder);
    assert.match(story.deduce(id).message, /判断与两份原文还不能/);
    story.setMemoryDraft(id, [...definition.records], definition.answer);
    assert.deepEqual([...story.state.drafts[id].timeline], [...definition.timelineOrder], 'changing an explanation preserves the explicit timeline');
    assert.equal(story.deduce(id).success, true); assert.equal(story.state.memory, id, 'correct deduction keeps the player in the memory');
    if (id === 'hospital') assert.equal(story.hasDocumentFace('hospital_record', 'back'), false, 'the optional medical follow-up back is not a submission gate');
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
const legacyMemory = new game.ThreeStory({ getItem: () => JSON.stringify({ version: 1, opened: true, waterSolved: true,
    records: Object.values(game.MEMORY_CASES).flatMap(definition => definition.records).map(id => id === 'school_postcard' ? 'school_receipt' : id),
    deductions: { school: true, hospital: true, crash: true }, memory: 'crash', departure: 'wake' }), setItem() {} });
assert.equal(legacyMemory.truthSolved(), true); assert.equal(legacyMemory.state.departure, 'wake', 'completed legacy deductions/endings do not require replaying new timeline controls');
assert.deepEqual([...legacyMemory.state.phoneViews], ['calls', 'recording'], 'legacy phone observations retain both previously visible pages');
assert.deepEqual([...legacyMemory.state.documentViews.school_notice], ['front', 'back'], 'legacy school records retain both already-read sides');
legacyMemory.save();
const inherited = new game.ThreeStory({ getItem: () => JSON.stringify({version: 1, ...legacyMemory.state}) });
assert.ok(inherited.truthSolved());
assert.equal(inherited.hasDocumentFace('school_postcard','back'), false);
assert.match(inherited.conclusionFor('school'), /缝纫机/);
const oldHandover=new game.ThreeStory({getItem:()=>JSON.stringify({version:1,reasoningRevision:3,opened:true,waterSolved:true,
    records:['crash_report','crash_phone'],phoneViews:['calls','recording'],documentViews:{},deductions:{crash:true}})});
assert.deepEqual([...oldHandover.state.documentViews.crash_report],['front','back']);
assert.equal(oldHandover.state.deductions.crash,true);
const malformedDocument = new game.ThreeStory({ getItem: () => JSON.stringify({ version: 1, opened: true, waterSolved: true,
    documentViews: { school_notice: ['front', 'front', '__proto__', {}], school_postcard: [] }, records: ['school_notice', 'school_postcard'] }), setItem() {} });
assert.deepEqual([...malformedDocument.state.documentViews.school_notice], ['front']); assert.equal(malformedDocument.state.records.includes('school_postcard'), false);
assert.equal(malformedDocument.readDocumentFace('school_notice', 'back'), false, 'paper reading requires its actual memory space');
const malformedPhone = new game.ThreeStory({ getItem: () => JSON.stringify({ version: 1, opened: true, waterSolved: true,
    phoneViews: ['calls', 'calls', '__proto__', {}], records: ['crash_phone'] }), setItem() {} });
assert.deepEqual([...malformedPhone.state.phoneViews], ['calls']);
assert.equal(malformedPhone.readPhonePage('recording'), false, 'reading is restricted to the actual crash space');
const legacyPartialMemory = new game.ThreeStory({ getItem: () => JSON.stringify({ version: 1, opened: true, waterSolved: true,
    records: ['school_notice', 'school_receipt'], drafts: { school: { evidence: ['school_notice', 'school_receipt'], interpretation: 1 } } }), setItem() {} });
assert.deepEqual([...legacyPartialMemory.state.drafts.school.evidence], ['school_notice', '']);
assert.equal(legacyPartialMemory.state.drafts.school.interpretation, null); assert.equal(legacyPartialMemory.state.drafts.school.questionChanged, true);
assert.equal(legacyPartialMemory.state.drafts.school.timeline.length, 0);
assert.match(legacyPartialMemory.deduce('school').message, /两份不同的已读记录/);
const partialTimeline = new game.ThreeStory({ getItem: () => JSON.stringify({ version: 1, opened: true, waterSolved: true, records: ['school_notice'],
    drafts: { school: { evidence: ['school_notice', 'school_receipt'], interpretation: 1, timeline: ['notice', 'notice', 'receipt', '__proto__'] } } }), setItem() {} });
assert.deepEqual([...partialTimeline.state.drafts.school.timeline], ['notice']);
assert.equal(partialTimeline.state.deductions.school, false);
const oldMedical = new game.ThreeStory({ getItem: () => JSON.stringify({ version: 1, opened: true, waterSolved: true,
    documentViews: { school_notice: ['front'] }, records: ['hospital_record', 'hospital_plan'], deductions: { hospital: true },
    drafts: { hospital: { evidence: ['hospital_record', 'hospital_plan'], interpretation: 1, timeline: ['diagnosis', 'plan'] } } }), setItem() {} });
assert.equal(oldMedical.state.deductions.hospital, true, '0.13 saves already having school face fields keep their whole medical observations');
assert.deepEqual([...oldMedical.state.documentViews.hospital_plan], ['front', 'back']);
assert.deepEqual([...oldMedical.state.drafts.hospital.timeline], ['diagnosis', 'plan']); assert.equal(oldMedical.state.drafts.hospital.interpretation, null);
oldMedical.setMemoryDraft('hospital', ['hospital_record', 'hospital_plan'], 1);
assert.equal(oldMedical.state.drafts.hospital.questionChanged, false, 'selecting a current factual judgement clears the migration notice');
console.log('Chronology: original-source fragments, observed-only events, incomplete/undated/wrong-order rejection, persistent wrong drafts and completed legacy compatibility passed.');
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
const queryMarker = { hidden: true, style: {}, dataset: {} };
const query = new game.ThreeInteraction({ camera: queryCamera, map: { interactables: queryItems }, scene: queryScene,
    prompt: queryPrompt, focusMarker: queryMarker, story: queryStory, isPaused: () => queryPaused, onInspect() { activated++; } });
query.update(); assert.equal(query.current?.id, 'near');
assert.equal(queryMarker.hidden, false); assert.equal(queryMarker.style.left, '50%'); assert.equal(queryMarker.style.top, '50%');
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
assert.equal(queryMarker.hidden, true, 'pause also hides the in-world focus marker');
queryPaused = false; query.update(0); assert.equal(query.current?.id, 'near');
queryStory.state.memory = 'school'; query.update(0); assert.equal(query.current?.id, 'school_clue', 'space changes refresh prompts immediately');
query.dispose();
for (const [width, height] of [[1440, 900], [390, 844], [844, 390], [360, 640], [640, 360], [768, 1024]]) {
    const focusCamera = new THREE.PerspectiveCamera(66, width / height, 0.06, 10);
    focusCamera.position.set(0, 1.6, 0); focusCamera.lookAt(0, 1.6, -2); focusCamera.updateMatrixWorld(true);
    const focusPrompt = { hidden: true, textContent: '' }, marker = { hidden: true, style: {}, dataset: {} };
    const focusStory = { state: { records: [] }, record(id) { this.state.records.push(id); } };
    const focusQuery = new game.ThreeInteraction({ camera: focusCamera, scene: new THREE.Scene(), story: focusStory,
        map: { interactables: [{ id: 'side-clue', title: '侧面字迹', position: { x: 1.2, y: 1.6, z: -2 }, radius: 3 }] },
        prompt: focusPrompt, focusMarker: marker, isPaused: () => false, onInspect() {} });
    focusQuery.update();
    assert.equal(focusQuery.current?.id || null, width > height ? 'side-clue' : null,
        `${width}x${height}: an object outside the visible screen cannot be offered merely because it is within the old facing cone`);
    assert.equal(marker.hidden, width < height);
    focusCamera.lookAt(1.2, 1.6, -2); focusQuery.update(); assert.equal(focusQuery.current.id, 'side-clue');
    assert.ok(Math.abs(parseFloat(marker.style.left) - 50) < 1e-8, 'the marker follows the actual projected object, not a fixed HUD point');
    focusQuery.activate(); assert.equal(marker.dataset.observed, 'false');
    focusQuery.update(); assert.equal(marker.dataset.observed, 'true');
    focusCamera.lookAt(-2, 1.6, 0); focusQuery.update(1 / 120);
    assert.equal(marker.hidden, true, 'turning away hides the marker between scheduled occlusion queries');
    focusQuery.activate(); assert.equal(focusQuery.current, null, 'activation immediately rejects the old offscreen target');
    focusQuery.dispose();
}
console.log('Queries: current-space visibility, self/decorative geometry exclusion, blocked-candidate fallback, 20Hz prompt scans and fresh activation passed. This is a CPU query check, not a WebGL frame-rate measurement.');
controls.dispose(); interaction.dispose();
assert.ok([...listeners.values()].every(set => set.size === 0), 'controls must release all event listeners');
console.log('Space: every clue reachable with actual ray occlusion, correct strafe, collision substeps, reading pause and end route passed.');

const html = await text('index.html');
const copySources=['src/main.mjs','src/chapter-ui.mjs','src/drive-intro.mjs',
    ...(await readdir(path.join(root,'src/3d'))).filter(n=>n.endsWith('.js')).map(n=>'src/3d/'+n)];
for(const file of copySources){
    for(const match of (await text(file)).matchAll(/copyText\('([\w.-]+)'/g))window.HuishaCopy(match[1]);
}
for(const match of html.matchAll(/data-copy="([^"]+)"/g)){
    for(const binding of match[1].split(' '))window.HuishaCopy(binding.split(':')[1]);
}

for (const url of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
    if (!url[1].startsWith('data:')) await access(path.join(root, url[1].split(/[?#]/,1)[0]));
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
const portraitSource = JSON.parse(await text('assets/art/mother-portrait.source.json'));
const portraitBytes = await readFile(path.join(root, 'assets/art', portraitSource.file));
assert.equal(createHash('sha256').update(portraitBytes).digest('hex'), portraitSource.sha256);
assert.equal(portraitBytes.subarray(1, 4).toString(), 'PNG'); assert.ok(portraitBytes.readUInt32BE(16) >= 512 && portraitBytes.readUInt32BE(20) >= 512);
console.log(`Sources: ${sources.files.length} downloaded asset checksums match the recorded Poly Haven originals.`);
const audioSources = JSON.parse((await text('assets/audio/sources.json')).replace(/^\uFEFF/, ''));
for (const asset of audioSources.files) {
    const bytes = await readFile(path.join(root, 'assets/audio', asset.path));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), asset.sha256);
    assert.equal(bytes.subarray(0, 4).toString(), 'OggS'); assert.ok(bytes.includes(Buffer.from('vorbis')));
}
assert.match(await text('assets/audio/kenney-impact/License.txt'), /Creative Commons Zero/);
const requestedAudio = [];
window.fetch = async url => { requestedAudio.push(url); return { ok: true, arrayBuffer: async () => new ArrayBuffer(8) }; };
const loadingAudio = new game.ThreeAudio(); loadingAudio.context = { decodeAudioData: async () => ({}), close() {} };
const loading = loadingAudio.loadSamples(); assert.equal(loadingAudio.loadSamples(), loading, 'sample requests are shared across repeated starts');
await loading;
assert.deepEqual(requestedAudio.sort(), audioSources.files.map(file => `assets/audio/${file.path}`).sort(), 'every requested sound exists in the source manifest');
const lateAudio = new game.ThreeAudio(); lateAudio.context = loadingAudio.context;
const lateLoading = lateAudio.loadSamples(); lateAudio.dispose(); await lateLoading;
assert.equal(lateAudio.samples.size, 0, 'late decoding cannot retain samples after disposal');
window.fetch = async () => { throw new Error('unavailable audio sample'); };
const failedAudio = new game.ThreeAudio(); failedAudio.context = loadingAudio.context;
assert.ok((await failedAudio.loadSamples()).every(result => result.status === 'rejected'));
assert.equal(failedAudio.sample('footstep_wood_000'), false, 'missing/unsupported audio safely leaves the existing synthesis fallback available');
delete window.fetch;
console.log(`Sound/settings: ${audioSources.files.length} original CC0 audio hashes, local request paths, load failure/disposal, floor-aware footsteps, ambience transitions, preferences and master gain passed. No real device or audio decoder was used.`);
