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
async function boot(saved) {
    const errors = [], virtualConsole = new VirtualConsole();
    virtualConsole.on('jsdomError', error => errors.push(error));
    const dom = new JSDOM(html, { url: 'http://127.0.0.1:8133/', runScripts: 'outside-only', pretendToBeVisual: true, virtualConsole });
    const { window } = dom, document = window.document, context = dom.getInternalVMContext();
    // jsdom does not implement native dialog modality, default Escape behavior or layout.
    window.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
    window.HTMLDialogElement.prototype.close = function () { this.open = false; this.dispatchEvent(new window.Event('close')); };
    if (saved) window.localStorage.setItem(saveKey, saved);
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
            if (identifier.endsWith(`${path.sep}ThreeHouseScene.js`)) {
                const game = window.Huisha3D;
                game.ThreeHouseScene = class extends game.ThreeHouseScene {
                    async start() {
                        scene = this; this.scene = new THREE.Scene(); this.camera = new THREE.PerspectiveCamera(66, 16 / 9, 0.06, 60);
                        const canvas = document.createElement('canvas'); this.root.append(canvas);
                        this.renderer = { domElement: canvas, toneMappingExposure: 1.28, dispose() {} };
                        this.courtyard = { selected: 0, frame() {}, pick() { return null; } }; this.wheels = [];
                        this.controls = new game.ThreeControls({ camera: this.camera, domElement: canvas, map: this.map,
                            story: this.story, isPaused: this.isPaused });
                        this.interaction = new game.ThreeInteraction({ camera: this.camera, map: this.map, scene: this.scene,
                            prompt: this.prompt, focusMarker: this.focusMarker, story: this.story, isPaused: this.isPaused, onInspect: this.onInspect });
                        this.onAssetError('wood-color'); // Verify that an early error survives the ready message.
                    }
                    syncState() {} // Geometry, materials, animations and projection have their own verifier.
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
        if (scene.inspectionReturn) $(scene.inspectionKind === 'water' ? 'water-leave' : 'lock-leave').click();
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
    return { window, document, scene, $, key, click, choose, inspect, errors, destroy };
}

let ui;
try {
    ui = await boot();
    assert.equal(ui.$('begin').disabled, false);
    assert.match(ui.$('load-status').textContent, /wood-color/, 'early material errors remain visible after readiness');
    ui.$('begin').click();
    ui.inspect('letter'); assert.equal(ui.$('reader').open, true);
    ui.scene.interaction.update(); assert.equal(ui.$('focus-marker').hidden, true, 'reading hides the focus marker');
    ui.click('放入摘记');
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
    assert.match(ui.document.querySelector('#lock-inspector .inspection-notes-body').textContent, /左位留灯/);
    assert.match(ui.document.querySelector('#lock-inspector .inspection-notes-body').textContent, /灯和门之间/);
    ui.$('lock-attempt').click(); assert.equal(ui.scene.story.state.opened, false);
    ui.key('KeyJ'); assert.equal(ui.$('reader-title').textContent, '随身手记');
    ui.click('回到字轮'); assert.equal(ui.$('reader').open, false); assert.equal(ui.scene.inspectionKind, 'lock');
    for (const [index, turns] of [[0, 3], [1, 2], [2, 1]]) for (let i = 0; i < turns; i++) ui.document.querySelector(`[data-wheel="${index}"]`).click();
    ui.$('lock-attempt').click(); assert.equal(ui.scene.story.state.opened, true); assert.equal(ui.$('lock-inspector').hidden, true);
    ui.inspect('water_station'); ui.$('water-weigh').click(); assert.equal(ui.scene.story.state.waterSolved, false);
    ui.document.querySelector('[data-bucket="1"]').click(); ui.$('water-fill').click(); ui.key('KeyP');
    ui.document.querySelector('[data-bucket="0"]').click(); ui.$('water-empty').click();
    ui.document.querySelector('[data-bucket="1"]').click(); ui.$('water-pour').click(); ui.$('water-fill').click(); ui.$('water-pour').click();
    assert.deepEqual([...ui.scene.story.state.buckets], [3, 4]);
    ui.$('water-weigh').click(); assert.equal(ui.scene.story.state.waterSolved, true); assert.equal(ui.$('water-fill').disabled, true);
    ui.$('water-leave').click();
    ui.inspect('memory_album'); ui.click('翻入记忆 · 录取那年');
    const returnPose = { ...ui.scene.story.state.memoryReturn };
    ui.inspect('school_notice'); ui.click('整理这段记忆');
    assert.equal(ui.document.querySelector('.memory-draft option[value="school_receipt"]'), null, 'unread evidence is not offered in the DOM');
    ui.click('提交推理'); assert.match(ui.document.querySelector('.memory-feedback').textContent, /两份不同/);
    ui.click('把两份摘记放入草稿');
    assert.deepEqual([...ui.scene.story.state.drafts.school.evidence], ['coffin', 'wall_marks']);
    assert.equal(ui.scene.story.state.drafts.school.interpretation, null, 'copying pins never chooses an explanation');
    assert.equal(ui.scene.story.state.deductions.school, false);
    ui.click('回查手记');
    assert.equal(ui.document.querySelector('.evidence-filter select').value, 'school', 'the journal opens on the current memory');
    assert.equal(ui.document.querySelector('.evidence-records [data-record="coffin"]'), null);
    ui.document.querySelector('.evidence-journal [aria-label="移除摘记：棺上刻痕"]').click();
    ui.document.querySelector('.evidence-journal [aria-label="移除摘记：墙上身高线"]').click();
    ui.document.querySelector('[data-record="school_notice"] [data-pin-record]').click();
    const scope = ui.document.querySelector('.evidence-filter select'); ui.choose(scope, 'all');
    assert.ok(ui.document.querySelector('.evidence-records [data-record="coffin"]'), 'other observed records remain available through the explicit filter');
    ui.inspect('school_receipt'); ui.click('放入摘记'); ui.click('整理这段记忆'); ui.click('把两份摘记放入草稿');
    let fields = [...ui.document.querySelectorAll('.memory-draft select')];
    assert.deepEqual(fields.map(field => field.value), ['school_notice', 'school_receipt', '']);
    ui.choose(fields[0], 'school_notice'); ui.choose(fields[1], 'school_receipt'); ui.choose(fields[2], 0);
    assert.match(ui.document.querySelector('.memory-quote').textContent, /二〇一四/);
    fields[0].focus(); const typing = ui.key('KeyW', fields[0]);
    assert.equal(typing.defaultPrevented, false); assert.equal(ui.scene.controls.keys.size, 0, 'game movement does not capture keys from the open form');
    ui.click('提交推理'); assert.match(ui.document.querySelector('.memory-feedback').textContent, /不能相互支持/);
    assert.equal(ui.scene.story.state.deductions.school, false);
    ui.$('reader-close').click();
    const saved = ui.window.localStorage.getItem(saveKey);
    assert.deepEqual(JSON.parse(saved).drafts.school.evidence, ['school_notice', 'school_receipt']);
    assert.equal(ui.errors.length, 0, ui.errors.map(error => error.message).join('\n'));
    ui.destroy(); ui = await boot(saved); ui.$('begin').click(); ui.key('KeyJ');
    assert.deepEqual([...ui.scene.story.state.pinnedRecords], ['school_notice', 'school_receipt'], 'pinned originals survive production startup');
    assert.equal(ui.document.querySelectorAll('.evidence-journal [data-pinned-record]').length, 2);
    ui.click('整理 · 录取那年'); fields = [...ui.document.querySelectorAll('.memory-draft select')];
    assert.deepEqual(fields.map(field => field.value), ['school_notice', 'school_receipt', '0'], 'production startup restores the actual DOM draft');
    ui.choose(fields[2], 1); ui.click('提交推理');
    assert.equal(ui.scene.story.state.deductions.school, true); assert.equal(ui.scene.story.state.memory, 'school');
    ui.click('回到厨房'); assert.deepEqual({ ...ui.scene.controls.snapshot() }, returnPose);
    for (const id of ['hospital', 'crash']) {
        ui.inspect('memory_album'); ui.click(`翻入记忆 · ${ui.window.Huisha3D.MEMORIES[id].title}`);
        const definition = ui.window.Huisha3D.MEMORY_CASES[id];
        for (const record of definition.records) ui.inspect(record);
        ui.click('整理这段记忆'); fields = [...ui.document.querySelectorAll('.memory-draft select')];
        ui.choose(fields[0], definition.records[0]); ui.choose(fields[1], definition.records[1]); ui.choose(fields[2], definition.answer); ui.click('提交推理');
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
    assert.equal(ui.document.querySelectorAll('.inspection-notes [data-pinned-record]').length, 0, 'restarting clears stale originals from both inspectors');
    assert.equal(ui.errors.length, 0, ui.errors.map(error => error.message).join('\n'));
    console.log('UI: production boot, early errors, lock/water buttons, grouped journal, explicit comparison/pin removal, inspector notes, current-memory filter, explicit draft copy, pin/draft reload, memory return, four endings and restart passed.');
    console.log('Scope: jsdom DOM events with a rendering stub and dialog shim; no browser, native dialog/select behavior, layout, WebGL, pointer lock, audio or real-device acceptance.');
} finally { ui?.destroy(); }
