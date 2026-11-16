import * as THREE from '../vendor/three.module.mjs';
import { GLTFLoader } from '../vendor/GLTFLoader.mjs';
window.THREE = THREE;
window.Huisha3D = { GLTFLoader };
for (const name of ['ThreeHouseMap', 'ThreeCourtyardMap', 'ThreeStory', 'ThreeControls', 'ThreeInteraction', 'ThreeCourtyard', 'ThreeHouseScene', 'ThreeAudio']) {
    await import(`./3d/${name}.js`);
}
const $ = id => document.getElementById(id);
const game = window.Huisha3D;
const story = new game.ThreeStory();
const reader = $('reader');
const audio = new game.ThreeAudio();
let mode = 'title', scene, lastFocus, saveTimer, lockFocus;
const isPaused = () => mode !== 'game' || reader.open || document.hidden || !!scene?.inspectionReturn;
function updateStatus() {
    $('objective').textContent = story.objective();
    $('begin').textContent = story.state.records.length || story.state.position ? (story.state.courtyard ? '继续余温' : '继续归门') : '走进旧宅';
    $('restart').hidden = !story.state.records.length && !story.state.position;
    $('chapter-number').textContent = story.state.courtyard ? '贰' : '壹';
    $('chapter-name').textContent = story.state.courtyard ? '余 温' : '归 门';
}
function save() {
    if (scene?.controls) story.save(scene.playerSnapshot());
    updateStatus();
}
function open(title, text, actions = [], eyebrow = '旧宅 · 观察记录') {
    if (!reader.open) lastFocus = document.activeElement;
    scene?.controls?.clear();
    touches.clear(); updateTouch();
    if (document.pointerLockElement) document.exitPointerLock();
    $('reader-title').textContent = title;
    $('reader-eyebrow').textContent = eyebrow;
    const body = $('reader-body'); body.replaceChildren();
    if (text) { const p = document.createElement('p'); p.textContent = text; body.append(p); }
    $('reader-actions').replaceChildren();
    for (const [label, callback] of actions) {
        const button = document.createElement('button'); button.textContent = label;
        button.addEventListener('click', callback); $('reader-actions').append(button);
    }
    if (!reader.open) reader.showModal();
    $('reader-title').focus();
    reader.scrollTop = 0;
    updateStatus();
}
function close() {
    reader.close(); scene?.controls?.clear();
    lastFocus?.isConnected && lastFocus.focus?.({ preventScroll: true });
    save();
}
function knownRecords() {
    return story.state.records.map(id => id === 'portrait_back'
        ? { id, title: '相框背字', text: '照片里是母亲，背面写着：\n\n「留一盏灯，是怕你看不见路，不是要你留下。」\n\n那块黑布是你离家时盖上去的。' }
        : game.WORLD_MAP.interactables.find(item => item.id === id)).filter(Boolean);
}
function appendRecords() {
    const records = knownRecords();
    if (!records.length) { const p = document.createElement('p'); p.textContent = '尚未记下观察。看向旧宅中的器物，靠近后调查。'; $('reader-body').append(p); }
    for (const record of records) {
        const detail = document.createElement('details'); detail.className = 'record';
        const summary = document.createElement('summary'); summary.textContent = record.title;
        const location = document.createElement('small'); location.textContent = record.location || (['lock', 'wall_marks', 'threshold'].includes(record.id) ? '走廊' : '正厅');
        summary.append(location);
        const content = document.createElement('p'); content.textContent = record.text;
        detail.append(summary, content); $('reader-body').append(detail);
    }
}
function journal(backToLock = false) {
    open('随身手记', '', [
        [backToLock ? inspectionLabel() : '继续观察', backToLock ? resumeInspection : close],
        ['需要一点提示', () => guidance(0, backToLock)]
    ], '只收录你亲眼见到的内容');
    appendRecords();
}
function guidance(stage = 0, backToLock = !!scene?.inspectionReturn) {
    const hint = story.guidance(stage);
    const actions = [['回查手记', () => journal(backToLock)], [backToLock ? inspectionLabel() : '继续观察', backToLock ? resumeInspection : close]];
    if (hint.next) actions.push([hint.next, () => guidance(stage + 1, backToLock)]);
    open('一点头绪', hint.text, actions, stage >= 2 ? '解谜答案 · 按需查看' : '探索提示 · 按需查看');
}
function inspectionLabel() { return scene.inspectionKind === 'water' ? '回到量水桌' : '回到字轮'; }
function resumeInspection() { scene.inspectionKind === 'water' ? water() : lock(); }
function updateLock(message) {
    if (message) $('lock-status').textContent = message;
    document.querySelectorAll('[data-wheel]').forEach((button, index) => {
        const symbol = game.ThreeStory.symbols[story.state.wheels[index]];
        button.querySelector('small').textContent = `当前：${symbol}`;
        button.setAttribute('aria-label', `${['左', '中', '右'][index]}轮，当前${symbol}，按动转过一格`);
    });
}
function leaveInspection(restoreFocus = true) {
    if (!scene?.inspectionReturn) return;
    scene.endInspection(); $('lock-inspector').hidden = true; $('water-inspector').hidden = true; $('hud').classList.remove('inspecting');
    touches.clear(); updateTouch();
    if (restoreFocus && lockFocus?.isConnected) lockFocus.focus?.({ preventScroll: true });
    save();
}
function rotateLock(index) {
    if (scene.inspectionKind !== 'lock' || reader.open) return;
    story.rotate(index); audio.knock(); scene.syncState(); updateLock();
}
function lock() {
    if (story.state.opened) { open('门闩已松开', '三根红绳垂下来。门外透进雨后的天光。', [['回到门前', close]]); return; }
    if (!scene.inspectionReturn) lockFocus = document.activeElement;
    if (reader.open) reader.close();
    if (document.pointerLockElement) document.exitPointerLock();
    touches.clear(); updateTouch(); scene.beginLockInspection();
    $('lock-inspector').hidden = false; $('hud').classList.add('inspecting');
    updateLock('每次转动一格。可以回查已读字迹，再压下门闩。');
    document.querySelector('[data-wheel]').focus();
}
function updateWater(message) {
    const [small, large] = story.state.buckets;
    $('water-levels').textContent = `三升桶 ${small} / 3 升　·　五升桶 ${large} / 5 升`;
    if (message) $('water-status').textContent = message;
    document.querySelectorAll('[data-bucket]').forEach(button => {
        button.setAttribute('aria-pressed', String(Number(button.dataset.bucket) === scene.courtyard.selected));
        button.disabled = story.state.waterSolved;
    });
    for (const id of ['water-fill', 'water-empty', 'water-pour', 'water-weigh']) $(id).disabled = story.state.waterSolved;
    scene.syncState(); updateStatus();
}
function water() {
    if (!scene.inspectionReturn) lockFocus = document.activeElement;
    if (reader.open) reader.close();
    if (document.pointerLockElement) document.exitPointerLock();
    touches.clear(); updateTouch(); scene.beginWaterInspection();
    $('water-inspector').hidden = false; $('hud').classList.add('inspecting');
    updateWater(story.state.waterSolved ? '秤盘已经压平，桌下的抽屉打开了。退回桌前，可以低头查看家书。'
        : '点桶选中，再点水缸添满、水槽倒空。两桶互倒也可用下方按钮；四升的五升桶才能压平秤盘。');
    (story.state.waterSolved ? $('water-leave') : document.querySelector('[data-bucket]')).focus();
}
function waterAction(action) {
    if (reader.open || scene.inspectionKind !== 'water' || story.state.waterSolved) return;
    if (/^bucket[01]$/.test(action)) {
        scene.courtyard.selected = Number(action.slice(-1));
        updateWater(`已选${scene.courtyard.selected ? '五' : '三'}升桶。可以添满、倒空，或倒入另一桶。`); return;
    }
    const index = scene.courtyard.selected;
    let changed = false, message;
    if (action === 'fill') { changed = story.fillBucket(index); message = changed ? '已从水缸添满选中的桶。' : '这个桶已经满了。'; }
    else if (action === 'empty') { changed = story.emptyBucket(index); message = changed ? '水倒进了槽里，桶空了。' : '这个桶已经是空的。'; }
    else if (action === 'pour') { const amount = story.pourBucket(index); changed = amount > 0; message = amount ? `向另一桶倒入 ${amount} 升水。` : '倒不进去：选中的桶是空的，或另一桶已经满了。'; }
    else if (action === 'weigh') {
        changed = story.weighWater();
        message = changed ? '四升水压平了秤盘。旧抽屉弹开，院门的铜索也松了。退回桌前，可以低头看信。'
            : '秤盘又弹了回来。需要五升桶里恰好四升水，桶里的水还保留着。';
    } else return;
    if (changed) action === 'weigh' ? audio.chime() : audio.knock();
    updateWater(message);
}
function ending(choice) {
    if (!story.depart(choice)) return;
    audio.chime();
    const text = choice === 'stay'
        ? '你把信放回口袋，给自己盛了一碗热饭。\n\n今晚留下，是因为你想歇一歇。明天，门还会开着。\n\n结局 · 余温'
        : story.state.records.includes('medicine_letter')
            ? '你带着那封迟了十年的信走上山路。\n\n她的病不是你的错。厨房里的灯，也从来不是要你留下。\n\n结局 · 归路'
            : '你走上山路，没有再替任何人把门关上。\n\n厨房的抽屉里还留着一封信。你可以继续回看，也可以把这一夜留在身后。\n\n结局 · 归路';
    open(choice === 'stay' ? '余温' : '归路', text, [['留在现场回看', close], ['返回标题', title]], '回煞 · 你的选择');
}
function inspect(item) {
    audio.knock();
    if (item.id === 'lock') { lock(); return; }
    if (item.id === 'water_station') { water(); return; }
    if (item.id === 'medicine_letter') {
        open(item.title, item.text, [['带着信继续走', close], ['今晚留下，给自己煮碗饭', () => ending('stay')]]); return;
    }
    if (item.id === 'road_exit') {
        open(item.title, item.text, [['再看看旧宅', close], ['走向天光', () => ending('leave')]]); return;
    }
    if (item.id === 'portrait') {
        if (story.state.portrait) {
            const record = knownRecords().find(record => record.id === 'portrait_back');
            open(record.title, record.text, [['继续观察', close]]);
        } else open(item.title, item.text, [['先不揭开', close], ['揭开黑布，查看背字', () => {
            story.revealPortrait(); scene.syncState(); inspect(item);
        }]]);
        return;
    }
    if (item.id === 'threshold') {
        open(item.title, item.text, [['再看看旧宅', close], ['走过门槛', () => {
            if (!story.finish()) return;
            close();
        }]]);
        return;
    }
    open(item.title, item.text, [['继续观察', close], ['打开手记', () => journal()]]);
}
function title() {
    leaveInspection(false);
    save(); if (reader.open) reader.close();
    scene.controls.clear(); if (document.pointerLockElement) document.exitPointerLock();
    mode = 'title'; $('hud').hidden = true; $('title-screen').hidden = false;
    audio.pause(); updateStatus(); $('begin').focus();
}
function pause() {
    save();
    open('暂歇', '合上这页，就能继续观察。当前进度只保存在这台设备的浏览器中。', [
        ['继续探索', close], ['回查手记', () => journal(!!scene.inspectionReturn)], ['返回标题', title]
    ], '回煞 · 暂停');
    const setting = document.createElement('label'); setting.className = 'settings'; setting.textContent = '画面亮度';
    const slider = document.createElement('input'); slider.type = 'range'; slider.min = '0.8'; slider.max = '1.8'; slider.step = '0.05'; slider.value = scene.renderer.toneMappingExposure;
    slider.setAttribute('aria-label', '画面亮度'); slider.addEventListener('input', () => { scene.renderer.toneMappingExposure = Number(slider.value); }); setting.append(slider);
    const sound = document.createElement('button'); sound.textContent = audio.muted ? '开启声音' : '关闭声音';
    sound.addEventListener('click', () => { audio.toggle(); sound.textContent = audio.muted ? '开启声音' : '关闭声音'; });
    $('reader-body').append(setting, sound);
    if (!story.saveAvailable) { const p = document.createElement('p'); p.textContent = '浏览器未允许保存。当前页面内可以继续，关闭页面后进度可能丢失。'; $('reader-body').append(p); }
}
$('reader-close').addEventListener('click', close);
reader.addEventListener('cancel', event => { event.preventDefault(); close(); });
$('begin').addEventListener('click', () => {
    mode = 'game'; $('title-screen').hidden = true; $('hud').hidden = false;
    document.activeElement?.blur?.(); scene.controls.clear(); audio.start();
});
$('restart').addEventListener('click', () => {
    open('重新回家', '重新开始会清除观察、字轮、量水和结局进度。', [['保留进度', close], ['确认重新开始', () => {
        story.reset(); scene.controls.camera.position.set(0, 1.6, 3.4); scene.controls.yaw = Math.PI; scene.controls.pitch = 0;
        scene.controls.clear(); scene.controls.applyLook(); scene.syncState(true); close(); updateStatus();
    }]], '开始新的归门');
});
$('journal').addEventListener('click', () => journal(!!scene.inspectionReturn));
$('pause').addEventListener('click', pause);
$('prompt').addEventListener('click', () => scene.interaction.activate());
document.querySelectorAll('[data-wheel]').forEach(button => button.addEventListener('click', () => rotateLock(Number(button.dataset.wheel))));
$('lock-leave').addEventListener('click', () => leaveInspection());
$('lock-records').addEventListener('click', () => journal(true));
$('lock-hint').addEventListener('click', () => guidance(0, true));
$('lock-attempt').addEventListener('click', () => {
    if (reader.open || scene.inspectionKind !== 'lock') return;
    scene.syncState(true);
    if (!story.unlock()) { audio.knock(); updateLock('门闩又落了回去。可以继续调整字轮，或回查字迹。'); return; }
    scene.syncState(); audio.chime(); leaveInspection();
    $('toast').textContent = '门闩松开了。你可以继续观察，也可以穿过门去。'; $('toast').hidden = false;
    setTimeout(() => { $('toast').hidden = true; }, 5000);
});
document.querySelectorAll('[data-bucket]').forEach(button => button.addEventListener('click', () => waterAction(`bucket${button.dataset.bucket}`)));
for (const action of ['fill', 'empty', 'pour', 'weigh']) $(`water-${action}`).addEventListener('click', () => waterAction(action));
$('water-leave').addEventListener('click', () => leaveInspection());
$('water-records').addEventListener('click', () => journal(true));
$('water-hint').addEventListener('click', () => guidance(0, true));
window.addEventListener('keydown', event => {
    if (event.defaultPrevented || event.isComposing || event.repeat || reader.open || mode !== 'game') return;
    if (scene.inspectionKind === 'water' && /^(Digit|Numpad)[12]$/.test(event.code)) {
        event.preventDefault(); waterAction(`bucket${Number(event.code.slice(-1)) - 1}`);
    } else if (scene.inspectionKind === 'water' && ['KeyF', 'KeyX', 'KeyP'].includes(event.code)) {
        event.preventDefault(); waterAction({ KeyF: 'fill', KeyX: 'empty', KeyP: 'pour' }[event.code]);
    } else if (scene.inspectionKind === 'lock' && /^(Digit|Numpad)[123]$/.test(event.code)) {
        event.preventDefault(); rotateLock(Number(event.code.slice(-1)) - 1);
    }
    if (event.code === 'KeyJ') { event.preventDefault(); journal(!!scene.inspectionReturn); }
    if (event.code === 'Escape') { event.preventDefault(); scene.inspectionReturn ? leaveInspection() : pause(); }
});
const touches = new Map();
function updateTouch() {
    let x = 0, y = 0; touches.forEach(move => { x += move[0]; y += move[1]; });
    if (scene?.controls) scene.controls.touchMove = { x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, y)) };
}
document.querySelectorAll('[data-move]').forEach(button => {
    button.addEventListener('pointerdown', event => {
        if (isPaused()) return;
        event.preventDefault(); button.setPointerCapture(event.pointerId);
        touches.set(event.pointerId, button.dataset.move.split(',').map(Number)); updateTouch();
    });
    const release = event => { touches.delete(event.pointerId); updateTouch(); };
    button.addEventListener('pointerup', release); button.addEventListener('pointercancel', release); button.addEventListener('lostpointercapture', release);
});
window.addEventListener('blur', () => { touches.clear(); updateTouch(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) { touches.clear(); updateTouch(); save(); audio.pause(); } else if (mode === 'game') audio.start(); });
window.addEventListener('pagehide', event => {
    save();
    if (event.persisted) { audio.pause(); return; }
    clearInterval(saveTimer); audio.dispose(); scene?.dispose();
});
window.addEventListener('pageshow', event => { if (event.persisted && mode === 'game') audio.start(); });
try {
    scene = new game.ThreeHouseScene({ root: $('world'), prompt: $('prompt'), story, isPaused, onInspect: inspect,
        onAssetError: name => { $('load-status').textContent = `部分材质未载入：${name}。请检查本地文件。`; },
        onFrame: (position, paused) => {
            audio.update(position, paused);
            if (!paused && story.state.opened && position.z < -15.2 && story.enterCourtyard()) updateStatus();
        } });
    await scene.start();
    let wheelPress;
    scene.renderer.domElement.addEventListener('pointerdown', event => {
        wheelPress = scene.inspectionReturn && !reader.open ? { x: event.clientX, y: event.clientY, id: event.pointerId } : null;
    });
    scene.renderer.domElement.addEventListener('pointerup', event => {
        const press = wheelPress; wheelPress = null;
        if (!press || press.id !== event.pointerId || Math.hypot(event.clientX - press.x, event.clientY - press.y) > 8) return;
        if (scene.inspectionKind === 'water') {
            const action = scene.courtyard.pick(event.clientX, event.clientY); if (action) waterAction(action);
        } else {
            const index = scene.pickWheel(event.clientX, event.clientY);
            if (Number.isInteger(index)) rotateLock(index);
        }
    });
    scene.renderer.domElement.addEventListener('pointercancel', () => { wheelPress = null; });
    updateStatus(); $('begin').disabled = false;
    $('load-status').textContent = story.saveAvailable ? '进度会自动保存 · 可随时暂停' : '此浏览器暂不支持保存，可在当前页面游玩';
    saveTimer = setInterval(() => { if (mode === 'game' && !reader.open) save(); }, 5000);
} catch (error) {
    scene?.dispose();
    $('load-status').textContent = `旧宅未能载入。请通过 StartGame.bat 启动，并检查浏览器是否支持 WebGL。${error.message ? `（${error.message}）` : ''}`;
    $('load-status').classList.add('fatal'); $('begin').textContent = '载入失败';
}
