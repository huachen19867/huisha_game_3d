import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { JSDOM, VirtualConsole } from 'jsdom';
import * as THREE from '../vendor/three.module.mjs';
import { GLTFLoader } from '../vendor/GLTFLoader.mjs';

// Exercise production main/journal/control code against a DOM. Only the rendering
// boundary is replaced; this intentionally creates no browser or WebGL context.
const root = fileURLToPath(new URL('../', import.meta.url));
const html = await readFile(path.join(root, 'index.html'), 'utf8');
const saveKey = 'huisha.3d.homecoming.v1';
async function boot(saved, preferences) {
    const errors = [], virtualConsole = new VirtualConsole();
    virtualConsole.on('jsdomError', error => errors.push(error));
    const dom = new JSDOM(html, { url: 'http://127.0.0.1:8133/', runScripts: 'outside-only', pretendToBeVisual: true, virtualConsole });
    const { window } = dom, document = window.document, context = dom.getInternalVMContext();
    // jsdom does not implement native dialog modality, default Escape behavior or layout.
    window.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
    window.HTMLDialogElement.prototype.close = function () { this.open = false; this.dispatchEvent(new window.Event('close')); };
    if (saved) window.localStorage.setItem(saveKey, saved);
    if (preferences) window.localStorage.setItem('huisha.3d.preferences.v1', preferences);
    let scene;
    const modules = new Map();
    const synthetic = (identifier, exports) => new vm.SyntheticModule(Object.keys(exports), function () {
        for (const [name, value] of Object.entries(exports)) this.setExport(name, value);
    }, { context, identifier });
    async function load(identifier) {
        if (modules.has(identifier)) return modules.get(identifier);
        const task = (async () => {
            let module;
            if (identifier === path.join(root, 'vendor/three.module.mjs')) module = synthetic(identifier, THREE);
            else if (identifier === path.join(root, 'vendor/GLTFLoader.mjs')) module = synthetic(identifier, { GLTFLoader });
            else module = new vm.SourceTextModule(await readFile(identifier, 'utf8'), { context, identifier,
                importModuleDynamically: (specifier, parent) => load(path.resolve(path.dirname(parent.identifier), specifier)) });
            await module.link((specifier, parent) => load(path.resolve(path.dirname(parent.identifier), specifier)));
            await module.evaluate();
            if (identifier.endsWith(`${path.sep}ThreePhone.js`)) {
                window.Huisha3D.ThreePhone.prototype.createScreen = function () {
                    this.ctx = { fillRect() {}, fillText() {} }; this.texture = new THREE.Texture(); this.house.textures.push(this.texture);
                    return new THREE.MeshBasicMaterial({ map: this.texture }); // Text pixels remain outside this DOM check.
                };
            }
            if (identifier.endsWith(`${path.sep}ThreeDocument.js`)) {
                window.Huisha3D.ThreeDocument.prototype.createFaceMaterial = function (_, face) {
                    return new THREE.MeshStandardMaterial({ side: face === 'front' ? THREE.FrontSide : THREE.BackSide }); // No font pixels in this DOM boundary.
                };
            }
            if (identifier.endsWith(`${path.sep}ThreeHouseScene.js`)) {
                const game = window.Huisha3D;
                game.ThreeHouseScene = class extends game.ThreeHouseScene {
                    async start() {
                        scene = this; this.scene = new THREE.Scene(); this.camera = new THREE.PerspectiveCamera(66, 16 / 9, 0.06, 60);
                        const canvas = document.createElement('canvas'); this.root.append(canvas);
                        this.renderer = { domElement: canvas, toneMappingExposure: 1.28, dispose() {} };
                        this.materials = Object.fromEntries(['wood', 'darkWood', 'brass', 'portrait', 'paper', 'cloth', 'red', 'stone', 'plaster', 'paving', 'floor'].map(name => [name, new THREE.MeshStandardMaterial()]));
                        this.portrait = new game.ThreePortrait(this); this.portrait.build();
                        this.door = new THREE.Group(); this.door.position.set(this.map.door.hingeX, 0, this.map.door.hingeZ); this.scene.add(this.door);
                        this.outsideLight = { intensity: 4 }; this.doorMechanism = new game.ThreeDoorMechanism(this); this.doorMechanism.build();
                        this.courtyard = new game.ThreeCourtyard(this); this.courtyard.build(); this.wheels = [];
                        const crash = new THREE.Group(); crash.position.set(...[game.MEMORIES.crash.center[0], 0, game.MEMORIES.crash.center[1]]);
                        crash.userData.memorySpace = 'crash'; this.scene.add(crash); this.phone = new game.ThreePhone(this); this.phone.build(crash);
                        const school = new THREE.Group(); school.position.x = game.MEMORIES.school.center[0]; school.userData.memorySpace = 'school'; this.scene.add(school);
                        this.documents = new game.ThreeDocument(this); this.documents.build(school);
                        const hospital = new THREE.Group(); hospital.position.x = game.MEMORIES.hospital.center[0]; hospital.userData.memorySpace = 'hospital'; this.scene.add(hospital);
                        this.documents.build(hospital);
                        this.controls = new game.ThreeControls({ camera: this.camera, domElement: canvas, map: this.map,
                            story: this.story, isPaused: this.isPaused, getPreferences: this.getPreferences });
                        this.interaction = new game.ThreeInteraction({ camera: this.camera, map: this.map, scene: this.scene,
                            prompt: this.prompt, focusMarker: this.focusMarker, story: this.story, isPaused: this.isPaused, onInspect: this.onInspect });
                        this.onAssetError('wood-color'); // Verify that an early error survives the ready message.
                    }
                    labelMaterial() { return new THREE.MeshBasicMaterial(); } // No real canvas text or photo decoding in jsdom.
                    syncState(immediate) {
                        this.portrait?.sync(immediate);
                        if (immediate) this.door.rotation.y = this.story.state.opened ? this.map.door.openAngle : 0;
                        this.doorMechanism?.sync(immediate);
                        this.courtyard?.sync(immediate);
                    } // Models, lights and rendering remain outside this DOM check.
                };
            }
            return module;
        })();
        modules.set(identifier, task); return task;
    }
    await load(path.join(root, 'src/main.mjs'));
    const $ = id => document.getElementById(id);
    const key = (code, target = window, extra = {}) => {
        const event = new window.KeyboardEvent('keydown', { code, bubbles: true, cancelable: true, ...extra }); target.dispatchEvent(event); return event;
    };
    const click = label => {
        const button = [...$('reader').querySelectorAll('button')].find(button => button.textContent.trim() === label);
        assert.ok(button, `missing reader action: ${label}`); button.click();
    };
    const choose = (select, value) => { select.value = String(value); select.dispatchEvent(new window.Event('change', { bubbles: true })); };
    const inspect = id => {
        if ($('reader').open) $('reader-close').click();
        if (scene.inspectionReturn) $({ water: 'water-leave', portrait: 'portrait-leave', phone: 'phone-leave', document: 'document-leave' }[scene.inspectionKind] || 'lock-leave').click();
        const item = scene.map.interactables.find(item => item.id === id); assert.ok(item);
        for (let x = item.position.x - item.radius; x <= item.position.x + item.radius; x += 0.2) {
            for (let z = item.position.z - item.radius; z <= item.position.z + item.radius; z += 0.2) {
                if (!scene.controls.canOccupy(x, z)) continue;
                const dx = item.position.x - x, dz = item.position.z - z;
                scene.camera.position.set(x, 1.6, z); scene.controls.yaw = Math.atan2(dx, dz);
                scene.controls.pitch = Math.atan2(item.position.y - 1.6, Math.hypot(dx, dz)); scene.controls.applyLook();
                scene.interaction.update();
                if (scene.interaction.current?.id !== id) continue;
                scene.onFrame(scene.camera.position, false); key('KeyE'); return;
            }
        }
        assert.fail(`could not deliver investigation event for ${id}`);
    };
    const destroy = () => { window.dispatchEvent(new window.PageTransitionEvent('pagehide', { persisted: false })); window.close(); };
    const expandReading = kind => {
        assert.equal($('reader').open, false, 'recording a face/page stays in the object view');
        const button = $(`${kind}-reading`).querySelector('[data-read-expanded]'); assert.ok(button); button.click();
    };
    return { window, document, scene, $, key, click, choose, inspect, expandReading, errors, destroy };
}

let ui;
try {
    ui = await boot();
    const editFact = (id, action = 'add') => {
        const button = ui.document.querySelector(`.memory-timeline-board button[data-fact="${id}"][data-action="${action}"]`);
        assert.ok(button && !button.disabled, `missing available timeline action: ${id}/${action}`); button.click();
    };
    assert.equal(ui.$('begin').disabled, false);
    assert.match(ui.$('load-status').textContent, /wood-color/, 'early material errors remain visible after readiness');
    ui.$('title-settings').click();
    const adjust = (name, value) => {
        const input = ui.document.querySelector(`[data-setting="${name}"]`); input.value = value;
        input.dispatchEvent(new ui.window.Event('input', { bubbles: true }));
    };
    adjust('brightness', 1.57); adjust('mouseSensitivity', 2); adjust('touchSensitivity', 0.5); adjust('volume', 0.4);
    ui.document.querySelector('[data-setting="invertY"]').click();
    ui.document.querySelector('[data-setting="pointerLock"]').click(); ui.click('关闭声音');
    assert.equal(ui.scene.renderer.toneMappingExposure, 1.57, 'settings apply to the production scene boundary immediately');
    const savedPreferences = ui.window.localStorage.getItem('huisha.3d.preferences.v1');
    assert.equal(ui.window.localStorage.getItem(saveKey), null, 'opening title settings does not create story progress');
    ui.click('返回标题'); assert.equal(ui.scene.story.state.position, null); assert.equal(ui.$('restart').hidden, true);
    ui.destroy(); ui = await boot(null, savedPreferences);
    assert.equal(ui.scene.renderer.toneMappingExposure, 1.57, 'production boot reapplies saved brightness');
    ui.$('begin').click();
    ui.key('KeyM'); assert.equal(ui.$('reader-title').textContent, '探索地图');
    assert.deepEqual([...ui.document.querySelectorAll('[data-map-area]')].map(element => element.dataset.mapArea), ['hall']);
    assert.equal(ui.document.querySelector('[data-map-point="letter"]'), null, 'the map never reveals an unread record');
    assert.equal(ui.document.querySelector('[data-map-space="school"]'), null, 'the map does not reveal unvisited memories');
    assert.equal(ui.document.querySelector('[data-map-player="current"]').getAttribute('transform'), 'translate(0 3.4) rotate(0)');
    ui.click('继续探索');
    const pointer = (type, target, { id = 1, kind = 'mouse', x = 100, y = 100, button = 0, buttons = 1 } = {}) => {
        const event = new ui.window.MouseEvent(type, { bubbles: true, clientX: x, clientY: y, button, buttons });
        Object.defineProperties(event, { pointerId: { value: id }, pointerType: { value: kind } }); target.dispatchEvent(event);
    };
    const canvas = ui.scene.renderer.domElement, controls = ui.scene.controls;
    let lockRequests = 0;
    canvas.requestPointerLock = () => { lockRequests++; throw new Error('simulated unavailable pointer lock'); };
    const yaw = controls.yaw;
    pointer('pointerdown', canvas); pointer('pointermove', ui.window, { x: 200, y: 120 }); pointer('pointerup', ui.window);
    assert.ok(Math.abs(controls.yaw - (yaw - 0.48)) < 1e-9); assert.ok(Math.abs(controls.pitch - 0.096) < 1e-9);
    assert.equal(lockRequests, 0, 'drag mode never asks for pointer lock');
    const touchYaw = controls.yaw;
    pointer('pointerdown', canvas, { id: 2, kind: 'touch' });
    pointer('pointerdown', canvas, { id: 3, kind: 'touch' });
    pointer('pointermove', ui.window, { id: 3, kind: 'touch', x: 300 });
    assert.equal(controls.yaw, touchYaw, 'a second finger does not steal the current look gesture');
    pointer('pointermove', ui.window, { id: 2, kind: 'touch', x: 200 }); pointer('pointerup', ui.window, { id: 2, kind: 'touch' });
    assert.ok(Math.abs(controls.yaw - (touchYaw - 0.12)) < 1e-9, 'touch uses its own sensitivity');
    pointer('pointerdown', canvas); const releasedYaw = controls.yaw;
    pointer('pointermove', ui.window, { x: 400, buttons: 0 }); assert.equal(controls.yaw, releasedYaw, 'a lost mouse-up cannot keep dragging');
    ui.$('pause').click(); ui.document.querySelector('[data-setting="pointerLock"]').click(); ui.click('继续探索');
    pointer('pointerdown', canvas, { button: 2 }); assert.equal(lockRequests, 0, 'right-click does not capture the mouse');
    pointer('pointerdown', canvas); assert.equal(lockRequests, 1);
    pointer('pointermove', ui.window, { x: 150 }); pointer('pointerup', ui.window);
    assert.ok(controls.yaw < releasedYaw, 'the drag fallback still works when pointer lock is unavailable');
    ui.$('pause').click(); ui.document.querySelector('[data-setting="pointerLock"]').click(); ui.click('继续探索');
    ui.inspect('portrait');
    const portraitPose = { ...ui.scene.playerSnapshot() };
    assert.equal(ui.$('portrait-inspector').hidden, false); assert.equal(ui.$('portrait-read').disabled, true);
    assert.equal(ui.$('portrait-flip').disabled, true);
    ui.$('portrait-reveal').click(); assert.equal(ui.scene.story.state.portrait, true);
    assert.equal(ui.scene.story.state.records.includes('portrait_back'), false);
    const liftedSave = new ui.window.Huisha3D.ThreeStory(ui.window.localStorage);
    assert.equal(liftedSave.state.portrait, true); assert.equal(liftedSave.state.portraitBackRead, false, 'uncovered-but-unread progress survives saving');
    ui.scene.portrait.update(1); ui.$('portrait-leave').click();
    assert.deepEqual({ ...ui.scene.controls.snapshot() }, portraitPose);
    ui.inspect('portrait');
    const heldPose = { ...ui.scene.playerSnapshot() };
    pointer('pointerdown', ui.scene.renderer.domElement);
    pointer('pointermove', ui.scene.renderer.domElement, { x: 120 }); pointer('pointerup', ui.scene.renderer.domElement, { x: 120 });
    assert.ok(ui.scene.portrait.angle > 0, 'canvas dragging rotates the real object rather than the player');
    ui.$('portrait-flip').click(); ui.scene.portrait.update(0.016);
    ui.scene.onFrame(ui.scene.camera.position, true); assert.equal(ui.$('portrait-read').disabled, true);
    ui.scene.portrait.update(1); ui.scene.onFrame(ui.scene.camera.position, true);
    assert.equal(ui.$('portrait-read').disabled, false); assert.equal(ui.scene.story.state.portraitBackRead, false);
    ui.$('portrait-read').click(); assert.equal(ui.$('reader-title').textContent, '相框背字');
    assert.equal(ui.scene.story.state.portraitBackRead, true);
    ui.click('打开手记'); ui.click('回到相框'); assert.equal(ui.scene.portrait.backVisible, true, 'returning from the journal keeps the object orientation');
    ui.$('portrait-leave').click(); assert.deepEqual({ ...ui.scene.controls.snapshot() }, heldPose);
    assert.ok(ui.scene.portrait.root.position.equals(ui.scene.portrait.home));
    ui.inspect('letter'); assert.equal(ui.$('reader').open, true);
    ui.scene.interaction.update(); assert.equal(ui.$('focus-marker').hidden, true, 'reading hides the focus marker');
    ui.click('放入摘记');
    ui.$('reader-close').click(); const beforeMapRecords = [...ui.scene.story.state.records]; ui.$('map').click();
    assert.ok(ui.document.querySelector('[data-map-point="letter"]'));
    assert.equal(ui.document.querySelector('[data-map-point="coffin"]'), null);
    ui.document.querySelector('[data-map-record="letter"]').click(); assert.equal(ui.$('reader-title').textContent, '门边来信');
    ui.click('回到地图'); assert.deepEqual([...ui.scene.story.state.records], beforeMapRecords);
    ui.click('继续探索');
    ui.inspect('coffin'); ui.click('放入摘记');
    ui.inspect('wall_marks');
    assert.equal(ui.document.querySelector('#reader-actions [data-pin-record]').disabled, true, 'a full comparison requires an explicit removal');
    ui.click('打开手记');
    assert.equal(ui.document.querySelector('.evidence-filter option[value="school"]'), null, 'the journal does not reveal unobserved memory locations');
    ui.document.querySelector('.evidence-journal [aria-label="移除摘记：门边来信"]').click();
    assert.ok(ui.document.querySelector('.evidence-journal').contains(ui.document.activeElement), 'removing a comparison card restores focus inside the journal');
    ui.document.querySelector('[data-record="wall_marks"] [data-pin-record]').click();
    assert.deepEqual([...ui.scene.story.state.pinnedRecords], ['coffin', 'wall_marks']);
    ui.$('reader-close').click();
    ui.inspect('lock');
    const lockMapPose = { ...ui.scene.playerSnapshot() }; ui.key('KeyM');
    assert.ok(ui.document.querySelector('[data-map-player="current"]').getAttribute('transform').startsWith(`translate(${lockMapPose.x} ${lockMapPose.z})`));
    assert.match(ui.document.querySelector('[data-map-area-notes="corridor"]').textContent, /尚未解开/);
    const wholeMapBounds = ui.document.querySelector('.map-floor').getAttribute('viewBox');
    ui.choose(ui.document.querySelector('[data-map-focus]'), 'corridor');
    assert.notEqual(ui.document.querySelector('.map-floor').getAttribute('viewBox'), wholeMapBounds, 'a known room can be enlarged without moving the player');
    assert.deepEqual({ ...ui.scene.playerSnapshot() }, lockMapPose);
    ui.choose(ui.document.querySelector('[data-map-focus]'), 'all'); assert.equal(ui.document.querySelector('.map-floor').getAttribute('viewBox'), wholeMapBounds);
    ui.click('回到字轮'); assert.deepEqual({ ...ui.scene.playerSnapshot() }, lockMapPose);
    assert.match(ui.document.querySelector('#lock-inspector .inspection-notes-body').textContent, /左位留灯/);
    assert.match(ui.document.querySelector('#lock-inspector .inspection-notes-body').textContent, /灯和门之间/);
    ui.$('lock-attempt').click(); assert.equal(ui.scene.story.state.opened, false);
    assert.equal(ui.scene.doorMechanism.progress, 0, 'an incorrect UI attempt never starts a release');
    ui.key('KeyJ'); assert.equal(ui.$('reader-title').textContent, '随身手记');
    ui.click('回到字轮'); assert.equal(ui.$('reader').open, false); assert.equal(ui.scene.inspectionKind, 'lock');
    for (const [index, turns] of [[0, 3], [1, 2], [2, 1]]) for (let i = 0; i < turns; i++) ui.document.querySelector(`[data-wheel="${index}"]`).click();
    ui.$('lock-attempt').click(); assert.equal(ui.scene.story.state.opened, true); assert.equal(ui.$('lock-inspector').hidden, true);
    assert.equal(ui.scene.doorMechanism.progress, 0, 'successful UI activation arms the animation without snapping to the open pose');
    ui.scene.moveDoor(0.05); assert.equal(ui.scene.door.rotation.y, 0);
    ui.$('pause').click(); const pausedReleaseProgress = ui.scene.doorMechanism.progress;
    ui.scene.moveDoor(1); assert.equal(ui.scene.doorMechanism.progress, pausedReleaseProgress);
    ui.click('继续探索'); ui.scene.moveDoor(1); assert.ok(ui.scene.door.rotation.y > 0);
    ui.$('map').click(); assert.match(ui.document.querySelector('[data-map-area-notes="corridor"]').textContent, /已解开/);
    assert.equal(ui.document.querySelector('[data-map-area="path"]'), null, 'unlocking alone does not draw a room that has not been entered'); ui.click('继续探索');
    ui.inspect('water_station'); ui.$('water-weigh').click(); assert.equal(ui.scene.story.state.waterSolved, false);
    assert.equal(ui.$('water-fill').disabled, true); ui.key('KeyF'); assert.deepEqual([...ui.scene.story.state.buckets], [0, 0]);
    ui.scene.courtyard.update(0.55); assert.match(ui.$('water-status').textContent, /偏轻/);
    const trialTime = ui.scene.courtyard.weighing.time;
    ui.$('water-records').click(); ui.scene.courtyard.update(1);
    assert.equal(ui.scene.courtyard.weighing.time, trialTime, 'journal pauses the actual scale trial');
    ui.click('回到量水桌'); ui.scene.courtyard.update(1.3); assert.equal(ui.$('water-fill').disabled, false);
    assert.equal(ui.$('reader').open, false);
    ui.document.querySelector('[data-bucket="1"]').click(); ui.$('water-fill').click(); ui.$('water-weigh').click();
    ui.scene.courtyard.update(0.55); assert.match(ui.$('water-status').textContent, /偏重/);
    ui.$('water-leave').click(); assert.equal(ui.scene.courtyard.weighing, null);
    assert.deepEqual([...ui.scene.story.state.buckets], [0, 5]); ui.inspect('water_station');
    assert.equal(ui.$('water-fill').disabled, false);
    ui.document.querySelector('[data-bucket="1"]').click(); ui.$('water-fill').click(); ui.key('KeyP');
    ui.document.querySelector('[data-bucket="0"]').click(); ui.$('water-empty').click();
    ui.document.querySelector('[data-bucket="1"]').click(); ui.$('water-pour').click(); ui.$('water-fill').click(); ui.$('water-pour').click();
    assert.deepEqual([...ui.scene.story.state.buckets], [3, 4]);
    ui.$('water-weigh').click(); assert.equal(ui.scene.story.state.waterSolved, false);
    ui.scene.courtyard.update(0.25); assert.equal(ui.scene.story.state.waterSolved, false);
    ui.scene.courtyard.update(0.3); assert.equal(ui.scene.story.state.waterSolved, true); assert.equal(ui.$('water-fill').disabled, true);
    assert.equal(ui.scene.courtyard.needle.rotation.z, 0); assert.equal(ui.scene.courtyard.buckets[1].position.x, 9.4);
    assert.ok(Math.abs(ui.scene.courtyard.pan.position.y - 0.1) < 1e-9);
    assert.match(ui.$('water-status').textContent, /对准四升/); ui.scene.courtyard.update(1);
    ui.$('water-leave').click();
    ui.inspect('memory_album'); ui.click('翻入记忆 · 录取那年');
    const returnPose = { ...ui.scene.story.state.memoryReturn };
    const beforeMemoryMap = { ...ui.scene.controls.snapshot() }; ui.key('KeyM');
    assert.ok(ui.document.querySelector('[data-map-area="school"]')); assert.equal(ui.document.querySelector('[data-map-space="hospital"]'), null);
    ui.document.querySelector('[data-map-space="house"]').click();
    assert.equal(ui.document.querySelector('[data-map-player="current"]'), null); assert.ok(ui.document.querySelector('[data-map-player="return"]'));
    assert.equal(ui.scene.story.state.memory, 'school'); assert.deepEqual({ ...ui.scene.controls.snapshot() }, beforeMemoryMap);
    ui.document.querySelector('[data-map-space="school"]').click(); ui.click('继续探索');
    ui.inspect('school_notice'); assert.equal(ui.scene.story.state.records.includes('school_notice'), false);
    ui.$('document-read').click(); assert.equal(ui.$('reader').open, false);
    assert.equal(ui.$('document-reading').querySelector('details').open, true);
    assert.doesNotMatch(ui.$('document-reading').textContent, /第一次/);
    assert.deepEqual(JSON.parse(ui.window.localStorage.getItem(saveKey)).position, { ...ui.scene.playerSnapshot() }, 'inline reading saves the real evidence position immediately');
    ui.expandReading('document'); assert.doesNotMatch(ui.$('reader-body').textContent, /第一次/);
    ui.click('打开手记'); assert.doesNotMatch(ui.$('reader-body').textContent, /第一次/);
    ui.click('回到纸张'); ui.$('document-flip').click(); ui.scene.documents.update(0.02); ui.scene.onFrame(ui.scene.camera.position, true);
    assert.equal(ui.$('document-read').disabled, true); ui.$('document-read').click(); assert.equal(ui.scene.story.hasDocumentFace('school_notice', 'back'), false);
    assert.equal(ui.$('document-reading').hidden, true); assert.equal(ui.$('document-reading').textContent, '', 'edge-on or unread faces leave no stale transcript');
    ui.$('document-records').click(); const paperAngle = ui.scene.documents.papers.get('school_notice').root.rotation.y;
    ui.scene.documents.update(1); assert.equal(ui.scene.documents.papers.get('school_notice').root.rotation.y, paperAngle);
    ui.click('回到纸张'); assert.equal(ui.document.activeElement, ui.$('document-flip'), 'returning mid-turn focuses an enabled document control');
    ui.scene.documents.update(1); ui.scene.onFrame(ui.scene.camera.position, true);
    assert.equal(ui.$('document-read').disabled, false); ui.$('document-read').click();
    assert.equal(ui.$('reader').open, false); ui.$('document-reading').querySelector('[data-read-deduce]').click();
    assert.equal(ui.document.querySelector('.memory-draft option[value="school_receipt"]'), null, 'unread evidence is not offered in the DOM');
    assert.equal(ui.document.querySelector('.memory-timeline-board [data-fact="receipt"]'), null, 'unread facts never appear as cards');
    ui.click('提交推理'); assert.match(ui.document.querySelector('.memory-feedback').textContent, /两份不同/);
    ui.click('把两份摘记放入草稿');
    assert.deepEqual([...ui.scene.story.state.drafts.school.evidence], ['coffin', 'wall_marks']);
    assert.equal(ui.scene.story.state.drafts.school.interpretation, null, 'copying pins never chooses an explanation');
    assert.equal(ui.scene.story.state.drafts.school.timeline.length, 0, 'copying pins never arranges events');
    assert.equal(ui.scene.story.state.deductions.school, false);
    ui.click('回查手记');
    assert.equal(ui.document.querySelector('.evidence-filter select').value, 'school', 'the journal opens on the current memory');
    assert.equal(ui.document.querySelector('.evidence-records [data-record="coffin"]'), null);
    ui.document.querySelector('.evidence-journal [aria-label="移除摘记：棺上刻痕"]').click();
    ui.document.querySelector('.evidence-journal [aria-label="移除摘记：墙上身高线"]').click();
    ui.document.querySelector('[data-record="school_notice"] [data-pin-record]').click();
    const scope = ui.document.querySelector('.evidence-filter select'); ui.choose(scope, 'all');
    assert.ok(ui.document.querySelector('.evidence-records [data-record="coffin"]'), 'other observed records remain available through the explicit filter');
    ui.inspect('school_receipt'); ui.$('document-read').click(); ui.expandReading('document'); ui.click('整理这段记忆');
    const frontFields = [...ui.document.querySelectorAll('.memory-draft select')];
    ui.choose(frontFields[0], 'school_notice'); ui.choose(frontFields[1], 'school_receipt'); ui.click('提交推理');
    assert.match(ui.document.querySelector('.memory-feedback').textContent, /没有读过的一面/);
    ui.click('回查手记'); ui.click('回到纸张'); ui.$('document-flip').click(); ui.scene.documents.update(1); ui.scene.onFrame(ui.scene.camera.position, true);
    ui.$('document-read').click();
    const inlinePin = ui.$('document-reading').querySelector('[data-pin-record]'); inlinePin.focus(); inlinePin.click();
    assert.deepEqual([...ui.scene.story.state.pinnedRecords], ['school_notice', 'school_receipt']);
    assert.equal(ui.document.activeElement, inlinePin); assert.equal(ui.$('reader').open, false, 'pinning in place does not open a modal or remove focus');
    ui.$('document-reading').querySelector('[data-read-deduce]').click(); ui.click('把两份摘记放入草稿');
    let fields = [...ui.document.querySelectorAll('.memory-draft select')];
    assert.deepEqual(fields.map(field => field.value), ['school_notice', 'school_receipt', '']);
    ui.choose(fields[0], 'school_notice'); ui.choose(fields[1], 'school_receipt'); ui.choose(fields[2], 0);
    ui.click('提交推理'); assert.match(ui.document.querySelector('.memory-feedback').textContent, /时间线/);
    editFact('receipt'); editFact('notice');
    ui.click('提交推理'); assert.match(ui.document.querySelector('.memory-feedback').textContent, /先后/);
    assert.deepEqual([...ui.scene.story.state.drafts.school.timeline], ['receipt', 'notice']);
    editFact('notice', 'up');
    assert.ok(ui.document.querySelector('.memory-timeline-board').contains(ui.document.activeElement), 'reordering keeps keyboard focus inside the timeline');
    assert.equal(ui.scene.story.state.deductions.school, false, 'a correct timeline still waits for explicit submission');
    ui.choose(fields[1], 'school_notice'); assert.ok(ui.document.querySelector('.memory-fact-warning'));
    assert.deepEqual([...ui.scene.story.state.drafts.school.timeline], ['notice', 'receipt'], 'changing source selection preserves the arranged facts');
    ui.choose(fields[1], 'school_receipt'); assert.equal(ui.document.querySelector('.memory-fact-warning'), null);
    assert.match(ui.document.querySelector('.memory-quote').textContent, /二〇一四/);
    fields[0].focus(); const typing = ui.key('KeyW', fields[0]);
    assert.equal(typing.defaultPrevented, false); assert.equal(ui.scene.controls.keys.size, 0, 'game movement does not capture keys from the open form');
    ui.click('提交推理'); assert.match(ui.document.querySelector('.memory-feedback').textContent, /不能相互支持/);
    assert.equal(ui.scene.story.state.deductions.school, false);
    editFact('receipt', 'up');
    const recordReadingPose = { ...ui.scene.playerSnapshot() };
    assert.deepEqual(JSON.parse(ui.window.localStorage.getItem(saveKey)).position, recordReadingPose, 'entering a reader saves the evidence location before the page is closed');
    ui.$('reader-close').click();
    const saved = ui.window.localStorage.getItem(saveKey);
    assert.deepEqual(JSON.parse(saved).drafts.school.evidence, ['school_notice', 'school_receipt']);
    assert.deepEqual(JSON.parse(saved).drafts.school.timeline, ['receipt', 'notice']);
    assert.deepEqual(JSON.parse(saved).position, recordReadingPose, 'reading saves the actual evidence location');
    assert.equal(ui.errors.length, 0, ui.errors.map(error => error.message).join('\n'));
    ui.destroy(); ui = await boot(saved, savedPreferences); ui.$('begin').click(); ui.key('KeyJ');
    assert.deepEqual([...ui.scene.story.state.pinnedRecords], ['school_notice', 'school_receipt'], 'pinned originals survive production startup');
    assert.equal(ui.document.querySelectorAll('.evidence-journal [data-pinned-record]').length, 2);
    ui.click('整理 · 录取那年'); fields = [...ui.document.querySelectorAll('.memory-draft select')];
    assert.deepEqual(fields.map(field => field.value), ['school_notice', 'school_receipt', '0'], 'production startup restores the actual DOM draft');
    assert.deepEqual([...ui.document.querySelectorAll('[data-timeline-event]')].map(item => item.dataset.timelineEvent), ['receipt', 'notice'], 'production startup preserves an incorrect order without silently sorting it');
    editFact('notice', 'up');
    ui.choose(fields[2], 1); ui.click('提交推理');
    assert.equal(ui.scene.story.state.deductions.school, true); assert.equal(ui.scene.story.state.memory, 'school');
    ui.click('回到厨房'); assert.deepEqual({ ...ui.scene.controls.snapshot() }, returnPose);
    for (const id of ['hospital', 'crash']) {
        ui.inspect('memory_album'); ui.click(`翻入记忆 · ${ui.window.Huisha3D.MEMORIES[id].title}`);
        const definition = ui.window.Huisha3D.MEMORY_CASES[id];
        for (const record of definition.records) {
            ui.inspect(record);
            if (Object.hasOwn(ui.window.Huisha3D.DOCUMENTS, record)) {
                assert.equal(ui.scene.story.state.records.includes(record), false);
                ui.$('document-read').click(); ui.expandReading('document');
                if (record === 'hospital_plan') {
                    assert.doesNotMatch(ui.$('reader-body').textContent, /邻居/);
                    ui.click('整理这段记忆'); const medicalFields = [...ui.document.querySelectorAll('.memory-draft select')];
                    ui.choose(medicalFields[0], 'hospital_record'); ui.choose(medicalFields[1], 'hospital_plan'); ui.click('提交推理');
                    assert.match(ui.document.querySelector('.memory-feedback').textContent, /没有读过的一面/);
                    ui.click('回查手记'); ui.click('回到纸张'); ui.$('document-flip').click(); ui.scene.documents.update(1); ui.scene.onFrame(ui.scene.camera.position, true);
                    ui.$('document-read').click(); ui.expandReading('document'); assert.match(ui.$('reader-body').textContent, /邻居代取药/);
                }
                continue;
            }
            if (record !== 'crash_phone') continue;
            const phonePose = { ...ui.scene.playerSnapshot() };
            assert.equal(ui.$('phone-inspector').hidden, false); assert.equal(ui.$('phone-read').disabled, true);
            assert.equal(ui.scene.story.state.records.includes('crash_phone'), false);
            ui.document.querySelector('[data-phone-page="calls"]').click(); assert.equal(ui.scene.story.state.phoneViews.length, 0);
            ui.$('phone-read').click(); assert.equal(ui.$('reader').open, false);
            assert.match(ui.$('phone-reading').textContent, /二十一时十二分/); assert.doesNotMatch(ui.$('phone-reading').textContent, /二〇一六/);
            ui.key('Digit2'); assert.equal(ui.$('phone-reading').hidden, true); assert.equal(ui.$('phone-reading').textContent, '');
            assert.deepEqual([...ui.scene.story.state.phoneViews], ['calls'], 'switching directly to the recording page does not observe it');
            ui.key('Digit1'); ui.expandReading('phone'); assert.equal(ui.$('reader-title').textContent, '手机 · 通话记录');
            ui.click('整理这段记忆'); const partialFields = [...ui.document.querySelectorAll('.memory-draft select')];
            ui.choose(partialFields[0], 'crash_report'); ui.choose(partialFields[1], 'crash_phone');
            assert.ok(ui.document.querySelector('[data-fact="call"]')); assert.equal(ui.document.querySelector('[data-fact="voice"]'), null);
            ui.click('提交推理'); assert.match(ui.document.querySelector('.memory-feedback').textContent, /没有记下的页面/);
            ui.click('回查手记'); assert.doesNotMatch(ui.$('reader-body').textContent, /二〇一六/);
            ui.click('回到手机'); assert.equal(ui.scene.phone.page, 'calls', 'journal return keeps the selected phone page');
            ui.key('Digit2'); assert.equal(ui.scene.phone.page, 'recording');
            assert.deepEqual([...ui.scene.story.state.phoneViews], ['calls']); ui.$('phone-read').click(); ui.expandReading('phone');
            assert.deepEqual([...ui.scene.story.state.phoneViews], ['calls', 'recording']);
            assert.deepEqual({ ...ui.scene.playerSnapshot() }, phonePose);
        }
        ui.click('整理这段记忆'); fields = [...ui.document.querySelectorAll('.memory-draft select')];
        ui.choose(fields[0], definition.records[0]); ui.choose(fields[1], definition.records[1]); ui.choose(fields[2], definition.answer);
        if (id === 'hospital') { editFact('plan'); editFact('diagnosis'); editFact('diagnosis', 'up'); }
        else {
            editFact('handover'); editFact('call'); editFact('voice');
            ui.click('提交推理'); assert.match(ui.document.querySelector('.memory-feedback').textContent, /先后/);
            editFact('voice', 'up'); editFact('voice', 'up'); editFact('call', 'up');
            editFact('call', 'remove'); editFact('call'); editFact('call', 'up');
        }
        assert.equal(ui.scene.story.state.deductions[id], false); ui.click('提交推理');
        assert.equal(ui.scene.story.state.memory, id, 'correct submission does not auto-return');
        if (id === 'hospital') ui.click('回到厨房');
    }
    ui.inspect('rescue_light'); ui.click('回应救护灯，醒来'); assert.equal(ui.$('reader-title').textContent, '破茧');
    ui.inspect('rescue_light'); ui.click('留在母亲的记忆里'); assert.equal(ui.$('reader-title').textContent, '回煞');
    ui.click('留在现场回看'); ui.$('pause').click(); ui.click('回到厨房');
    ui.inspect('road_exit'); ui.click('走向天光'); assert.equal(ui.scene.story.state.departure, 'leave');
    ui.inspect('medicine_letter'); ui.click('今晚留下，给自己煮碗饭'); assert.equal(ui.scene.story.state.departure, 'stay');
    ui.click('返回标题'); ui.$('restart').click(); ui.click('保留进度'); assert.equal(ui.scene.story.state.waterSolved, true);
    ui.$('restart').click(); ui.click('确认重新开始');
    assert.equal(ui.scene.story.state.memory, null); assert.equal(ui.scene.story.state.opened, false); assert.equal(ui.scene.story.state.departure, null);
    assert.equal(ui.scene.story.state.records.length, 0); assert.deepEqual([...ui.scene.story.state.buckets], [0, 0]);
    assert.equal(ui.scene.story.state.pinnedRecords.length, 0);
    assert.equal(ui.scene.story.state.visitedAreas.length, 0);
    assert.equal(ui.scene.story.state.portraitBackRead, false); assert.equal(ui.scene.portrait.cloth.visible, true);
    for (const kind of ['phone', 'document']) assert.equal(ui.$(`${kind}-reading`).textContent, '', 'leaving and restarting clear stale object transcripts');
    assert.equal(ui.document.querySelectorAll('.inspection-notes [data-pinned-record]').length, 0, 'restarting clears stale originals from both inspectors');
    assert.equal(ui.window.localStorage.getItem('huisha.3d.preferences.v1'), savedPreferences, 'restarting the story keeps device preferences');
    ui.$('title-settings').click(); assert.equal(ui.document.querySelector('[data-setting="volume"]').value, '0.4');
    ui.click('恢复默认设置'); assert.equal(ui.scene.renderer.toneMappingExposure, 1.28);
    assert.equal(ui.scene.controls.getPreferences().invertY, false); assert.equal(ui.scene.story.state.records.length, 0);
    ui.click('返回标题');
    assert.equal(ui.errors.length, 0, ui.errors.map(error => error.message).join('\n'));
    const oldDraft = JSON.parse(saved); delete oldDraft.reasoningRevision;
    ui.destroy(); ui = await boot(JSON.stringify(oldDraft), savedPreferences); ui.$('begin').click(); ui.key('KeyJ'); ui.click('整理 · 录取那年');
    fields = [...ui.document.querySelectorAll('.memory-draft select')];
    assert.deepEqual(fields.map(field => field.value), ['school_notice', 'school_receipt', '']);
    assert.ok(ui.document.querySelector('.memory-question-update'), 'old question choices are cleared with an explanation while evidence is kept');
    assert.deepEqual([...ui.scene.story.state.drafts.school.timeline], ['receipt', 'notice']);
    ui.choose(fields[2], 1); assert.equal(ui.document.querySelector('.memory-question-update'), null);
    assert.equal(ui.scene.story.state.deductions.school, false, 'migrating or reselecting a judgement does not submit it');
    assert.equal(ui.errors.length, 0, ui.errors.map(error => error.message).join('\n'));
    console.log('UI: discovered-only SVG map, room focus/readback, real inspection pose, isolated memory layers, boot/settings, physical portrait, grouped evidence/drafts, memory return, four endings and restart passed.');
    console.log('Scope: jsdom DOM events with a rendering stub and dialog shim; no browser, native dialog/select behavior, layout, WebGL, pointer lock, audio or real-device acceptance.');
} finally { ui?.destroy(); }
