import * as THREE from '../vendor/three.module.mjs';
import { GLTFLoader } from '../vendor/GLTFLoader.mjs';
import { mergeGeometries } from '../vendor/BufferGeometryUtils.mjs';
window.THREE = THREE;
window.Huisha3D = { GLTFLoader, mergeGeometries };
for (const name of ['ThreeHouseMap', 'ThreeCourtyardMap', 'ThreeMemoryMap', 'ThreeExplorationMap', 'ThreeStory', 'ThreePreferences', 'ThreeSettings', 'ThreeControls', 'ThreeInteraction', 'ThreeWindowWall', 'ThreeCourtyard', 'ThreePhone', 'ThreeDocument', 'ThreeMemoryScenes', 'ThreeMemoryTimeline', 'ThreeMemoryJournal', 'ThreeEvidenceJournal', 'ThreePortrait', 'ThreeDoorMechanism', 'ThreeHouseScene', 'ThreeAudio']) {
    await import(`./3d/${name}.js`);
}
const $ = id => document.getElementById(id);
const game = window.Huisha3D;
const story = new game.ThreeStory();
const preferences = new game.ThreePreferences();
const settings = new game.ThreeSettings({ preferences, onChange: applyPreferences });
const reader = $('reader');
const audio = new game.ThreeAudio();
const assetErrors = new Set();
const evidenceJournal = new game.ThreeEvidenceJournal({ story, knownRecords });
const explorationMap = new game.ThreeExplorationMap({ story, knownRecords, open, onRead: id => {
    const record = knownRecords().find(record => record.id === id);
    if (record) readRecord(record, [['回到地图', () => showMap(false)]]);
} });
const memoryJournal = new game.ThreeMemoryJournal({ story, open, close, knownRecords,
    journal: () => journal(!!scene?.inspectionReturn), onReturn: returnMemory,
    onSolved: () => { audio.chime(); scene.syncState(); updateStatus(); } });
let mode = 'title', scene, lastFocus, saveTimer, lockFocus, portraitUiState, documentUiState;
const isPaused = () => mode !== 'game' || reader.open || document.hidden || !!scene?.inspectionReturn;
function updateLoadStatus() {
    $('load-status').textContent = assetErrors.size
        ? `部分材质未载入：${[...assetErrors].join('、')}。画面可能不完整，请检查本地文件。`
        : story.saveAvailable ? '进度会自动保存 · 可随时暂停' : '此浏览器暂不支持保存，可在当前页面游玩';
}
function updateStatus() {
    $('objective').textContent = story.objective();
    $('begin').textContent = story.state.memory ? `继续${game.MEMORIES[story.state.memory].title}`
        : story.state.records.length || story.state.position ? (story.state.courtyard ? '继续余温' : '继续归门') : '走进旧宅';
    $('restart').hidden = !story.state.records.length && !story.state.position;
    $('chapter-number').textContent = story.state.memory ? '忆' : story.state.courtyard ? '贰' : '壹';
    $('chapter-name').textContent = story.state.memory ? game.MEMORIES[story.state.memory].title : story.state.courtyard ? '余 温' : '归 门';
}
function save() {
    if (mode === 'game' && scene?.controls) story.save(scene.playerSnapshot());
    updateStatus();
}
function applyPreferences() {
    if (scene?.renderer) scene.renderer.toneMappingExposure = preferences.values.brightness;
    audio.setVolume(preferences.values.volume);
    audio.setMuted(preferences.values.muted, mode === 'game' && !document.hidden);
    if (!preferences.values.pointerLock && document.pointerLockElement) document.exitPointerLock();
}
function titleSettings() {
    open('游玩设置', '先把视角和声音调到舒服的程度。设置即时生效。', [['返回标题', close]], '回煞 · 游玩设置');
    settings.append($('reader-body'));
}
function open(title, text, actions = [], eyebrow = '旧宅 · 观察记录') {
    if (!reader.open) {
        lastFocus = document.activeElement;
        if (mode === 'game' && scene?.controls) story.save(scene.playerSnapshot());
    }
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
        ? game.PORTRAIT_BACK_RECORD
        : game.WORLD_MAP.interactables.find(item => item.id === id)).filter(Boolean).map(presentRecord);
}
function presentRecord(item) {
    if (Object.hasOwn(game.DOCUMENTS, item.id)) return { ...item, text: story.documentText(item.id) };
    if (item.id === 'crash_phone') return { ...item, text: story.phoneText() };
    return item.id === 'yard_gate' && story.state.waterSolved ? { ...item,
        text: '铜索的绳头垂在门框旁，门闩已经退开。\n\n从厨房压平旧秤后，抽屉与院门接连松了。门外是一条逐渐亮起来的山路。' } : item;
}
function journal(backToLock = false) {
    open('随身手记', '', [
        [backToLock ? inspectionLabel() : '继续观察', backToLock ? resumeInspection : close],
        ['需要一点提示', () => guidance(0, backToLock)]
    ], '只收录你亲眼见到的内容');
    memoryJournal.appendLinks($('reader-body'));
    evidenceJournal.append($('reader-body'));
}
function readRecord(item, actions) {
    const choices = [...actions];
    if (!choices.some(([label]) => label === '打开手记')) choices.push(['打开手记', () => journal(!!scene?.inspectionReturn)]);
    open(item.title, item.text, choices);
    evidenceJournal.appendPinAction($('reader-actions'), item.id);
}
function showMap(resetScope = true) {
    if (mode !== 'game') return;
    const pose = { ...scene.playerSnapshot() }; story.visitPosition(pose);
    explorationMap.show({ pose, resetScope, exitLabel: scene.inspectionReturn ? inspectionLabel() : '继续探索',
        onExit: scene.inspectionReturn ? resumeInspection : close });
}
function album() {
    const item = game.WORLD_MAP.interactables.find(item => item.id === 'memory_album');
    open(item.title, item.text, [...Object.entries(game.MEMORIES).map(([id, definition]) => [
        `翻入记忆 · ${definition.title}`, () => enterMemory(id)
    ]), ['合上相册，继续观察', close]], '回煞 · 厨房相册');
}
function enterMemory(id) {
    leaveInspection(false);
    if (!story.enterMemory(id, scene.playerSnapshot())) return;
    scene.controls.teleport(story.state.position); scene.syncState(true); audio.resetPosition();
    if (reader.open) reader.close(); save(); $('journal').focus();
}
function returnMemory() {
    leaveInspection(false);
    const pose = story.leaveMemory(); if (!pose) return;
    scene.controls.teleport(pose); scene.syncState(true); audio.resetPosition();
    if (reader.open) reader.close(); save(); $('journal').focus();
}
function guidance(stage = 0, backToLock = !!scene?.inspectionReturn) {
    const hint = story.guidance(stage);
    const actions = [['回查手记', () => journal(backToLock)], [backToLock ? inspectionLabel() : '继续观察', backToLock ? resumeInspection : close]];
    if (hint.next) actions.push([hint.next, () => guidance(stage + 1, backToLock)]);
    open('一点头绪', hint.text, actions, stage >= 2 ? '解谜答案 · 按需查看' : '探索提示 · 按需查看');
}
function inspectionLabel() { return { water: '回到量水桌', portrait: '回到相框', phone: '回到手机', document: '回到纸张' }[scene.inspectionKind] || '回到字轮'; }
function resumeInspection() { ({ water, portrait, phone, lock, document: () => documentInspect(scene.documents.activeId) }[scene.inspectionKind] || lock)(); }
function updateObjectReading(kind, record, space) {
    const host = $(`${kind}-reading`), hadFocus = host.contains(document.activeElement);
    host.replaceChildren(); host.hidden = !record;
    if (record) {
        const detail = document.createElement('details'), summary = document.createElement('summary'), text = document.createElement('p');
        summary.textContent = record.title; text.textContent = record.text; detail.append(summary, text); host.append(detail);
        const actions = document.createElement('div'); actions.className = 'inspection-reading-actions';
        const expand = document.createElement('button'); expand.type = 'button'; expand.dataset.readExpanded = kind; expand.textContent = '放大阅读';
        expand.addEventListener('click', () => readRecord(record,
            [[inspectionLabel(), resumeInspection], ['整理这段记忆', () => memoryJournal.show(space)], ['回到厨房', returnMemory]]));
        const reason = document.createElement('button'); reason.type = 'button'; reason.textContent = '整理这段记忆'; reason.dataset.readDeduce = space;
        reason.addEventListener('click', () => memoryJournal.show(space));
        actions.append(expand, reason); evidenceJournal.appendPinAction(actions, record.id); host.append(actions);
    }
    if (hadFocus) (kind === 'document' ? $('document-flip') : document.querySelector(`[data-phone-page="${scene.phone.page}"]`))?.focus({ preventScroll: true });
}
function updateDocument() {
    const id = scene.documents.activeId; if (!id) return;
    const face = scene.documents.visibleFace, targetBack = Math.cos(scene.documents.angle) < 0;
    const state = `${id}:${face}:${targetBack}:${(story.state.documentViews[id] || []).join(',')}`;
    if (state === documentUiState) return; documentUiState = state;
    $('document-title').textContent = game.DOCUMENTS[id].title;
    $('document-read').disabled = !face;
    $('document-flip').textContent = targetBack ? '转回正面' : '翻到背面';
    $('document-status').textContent = face ? `${game.DOCUMENTS[id].faces[face].title} · ${story.hasDocumentFace(id, face) ? '已记入手记' : '尚未记下'}。可以主动阅读，或翻到另一面。`
        : '等纸张转到眼前，再阅读这一面。可以拖动纸张调整角度。';
    const definition = game.DOCUMENTS[id], page = face && definition.faces[face];
    updateObjectReading('document', page && story.hasDocumentFace(id, face)
        ? { id, title: `${definition.title} · ${page.title}`, text: page.text } : null, definition.space);
}
function documentInspect(id) {
    if (!Object.hasOwn(game.DOCUMENTS, id) || story.state.memory !== game.DOCUMENTS[id].space) return;
    if (!scene.inspectionReturn) lockFocus = document.activeElement;
    if (reader.open) reader.close(); if (document.pointerLockElement) document.exitPointerLock();
    touches.clear(); updateTouch(); scene.beginDocumentInspection(id);
    $('document-inspector').hidden = false; $('hud').classList.add('inspecting'); documentUiState = null; updateDocument();
    ($('document-read').disabled ? $('document-flip') : $('document-read')).focus();
}
function updatePhone() {
    const page = scene.phone.page;
    document.querySelectorAll('[data-phone-page]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.phonePage === page)));
    $('phone-read').disabled = !Object.hasOwn(game.PHONE_PAGES, page);
    $('phone-status').textContent = page === 'home' ? '分别查看通话与本地录音资料，再把当前页记入手记。'
        : `${game.PHONE_PAGES[page].title}${story.state.phoneViews.includes(page) ? ' · 已记入手记' : ' · 尚未记下'}。切换页面不会自动记入或提交推理。`;
    updateObjectReading('phone', story.state.phoneViews.includes(page)
        ? { id: 'crash_phone', title: `手机 · ${game.PHONE_PAGES[page].title}`, text: game.PHONE_PAGES[page].text } : null, 'crash');
}
function phone() {
    if (story.state.memory !== 'crash') return;
    if (!scene.inspectionReturn) lockFocus = document.activeElement;
    if (reader.open) reader.close(); if (document.pointerLockElement) document.exitPointerLock();
    touches.clear(); updateTouch(); scene.beginPhoneInspection();
    $('phone-inspector').hidden = false; $('hud').classList.add('inspecting'); updatePhone();
    document.querySelector('[data-phone-page]').focus();
}
function phonePage(page) {
    if (reader.open || scene.inspectionKind !== 'phone' || !scene.phone.selectPage(page)) return;
    updatePhone();
}
function updatePortrait(message) {
    const uncovered = story.state.portrait, back = scene.portrait.backVisible, targetBack = Math.cos(scene.portrait.angle) < 0;
    const state = `${uncovered}:${back}:${targetBack}:${story.state.portraitBackRead}`;
    if (message) $('portrait-status').textContent = message;
    if (portraitUiState === state) return;
    portraitUiState = state;
    $('portrait-reveal').hidden = uncovered; $('portrait-flip').disabled = !uncovered; $('portrait-read').disabled = !back;
    $('portrait-flip').textContent = targetBack ? '转回正面' : '翻到背面';
    if (!message) $('portrait-status').textContent = !uncovered ? '黑布搭在上沿。可以先揭开，再拿近看看。'
        : back ? '背面的字迹转到了眼前。可以主动阅读并记入手记。' : '正面是母亲的旧照片。按住画面拖动，或翻到背面查看。';
}
function portrait() {
    if (!scene.inspectionReturn) lockFocus = document.activeElement;
    if (reader.open) reader.close(); if (document.pointerLockElement) document.exitPointerLock();
    touches.clear(); updateTouch(); scene.beginPortraitInspection();
    $('portrait-inspector').hidden = false; $('hud').classList.add('inspecting'); portraitUiState = null; updatePortrait();
    (story.state.portrait ? $('portrait-flip') : $('portrait-reveal')).focus();
}
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
    scene.endInspection(); $('lock-inspector').hidden = true; $('water-inspector').hidden = true; $('portrait-inspector').hidden = true; $('phone-inspector').hidden = true; $('document-inspector').hidden = true; $('hud').classList.remove('inspecting');
    for (const kind of ['phone', 'document']) { $(`${kind}-reading`).replaceChildren(); $(`${kind}-reading`).hidden = true; }
    touches.clear(); updateTouch();
    if (restoreFocus && lockFocus?.isConnected) lockFocus.focus?.({ preventScroll: true });
    save();
}
function rotateLock(index) {
    if (scene.inspectionKind !== 'lock' || reader.open) return;
    story.rotate(index); audio.latch(); scene.syncState(); updateLock();
}
function lock() {
    if (story.state.opened) { open('门闩已松开', '三根红绳垂下来。门外透进雨后的天光。', [['回到门前', close]]); return; }
    if (!scene.inspectionReturn) lockFocus = document.activeElement;
    if (reader.open) reader.close();
    if (document.pointerLockElement) document.exitPointerLock();
    touches.clear(); updateTouch(); scene.beginLockInspection();
    $('lock-inspector').hidden = false; $('hud').classList.add('inspecting');
    updateLock('每次转动一格。可以回查已读字迹，再压下门闩。');
    evidenceJournal.sync();
    document.querySelector('[data-wheel]').focus();
}
function updateWater(message) {
    const [small, large] = story.state.buckets;
    $('water-levels').textContent = `三升桶 ${small} / 3 升　·　五升桶 ${large} / 5 升`;
    if (message) $('water-status').textContent = message;
    document.querySelectorAll('[data-bucket]').forEach(button => {
        button.setAttribute('aria-pressed', String(Number(button.dataset.bucket) === scene.courtyard.selected));
        button.disabled = story.state.waterSolved || !!scene.courtyard.weighing;
    });
    for (const id of ['water-fill', 'water-empty', 'water-pour', 'water-weigh']) $(id).disabled = story.state.waterSolved || !!scene.courtyard.weighing;
    scene.syncState(); updateStatus();
}
function water() {
    if (!scene.inspectionReturn) lockFocus = document.activeElement;
    if (reader.open) reader.close();
    if (document.pointerLockElement) document.exitPointerLock();
    touches.clear(); updateTouch(); scene.beginWaterInspection();
    $('water-inspector').hidden = false; $('hud').classList.add('inspecting');
    updateWater(story.state.waterSolved ? '秤盘已经压平，桌下的抽屉打开了。退回桌前，可以低头查看家书。'
        : '点桶选中，再点水缸添满、水槽倒空。两桶互倒也可用下方按钮；把五升桶放上秤盘后，指针会显示偏轻、四升或偏重。');
    evidenceJournal.sync();
    (story.state.waterSolved ? $('water-leave') : document.querySelector('[data-bucket]')).focus();
}
function waterAction(action) {
    if (reader.open || scene.inspectionKind !== 'water' || story.state.waterSolved || scene.courtyard.weighing) return;
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
        if (scene.courtyard.beginWeigh() && scene.courtyard.weighing) updateWater('正在把五升桶放上秤盘。指针中央的红刻线是四升。');
        return;
    } else return;
    if (changed) audio.water(action);
    updateWater(message);
}
function ending(choice) {
    if (!story.depart(choice)) return;
    audio.chime();
    const text = choice === 'wake'
        ? '你循着另一边的灯走过去，第一次回应了自己的名字。\n\n母亲的语音停在「慢一点」。雨没有再落进旧宅，救护车上的人握住了你的手。\n\n你还有机会把这一夜说给活着的人听。\n\n结局 · 破茧'
        : choice === 'remember'
        ? '你转身回到那盏旧灯下。母亲没有责怪，也没有挽留。\n\n你知道门开着，却仍选择让今夜再过一遍。\n\n七月十四，回来一趟。\n\n结局 · 回煞'
        : choice === 'stay'
        ? '你把信放回口袋，给自己盛了一碗热饭。\n\n今晚留下，是因为你想歇一歇。明天，门还会开着。\n\n结局 · 余温'
        : story.state.records.includes('medicine_letter')
            ? '你带着那封迟了十年的信走上山路。\n\n她的病不是你的错。厨房里的灯，也从来不是要你留下。\n\n结局 · 归路'
            : '你走上山路，没有再替任何人把门关上。\n\n厨房的抽屉里还留着一封信。你可以继续回看，也可以把这一夜留在身后。\n\n结局 · 归路';
    open({ stay: '余温', leave: '归路', wake: '破茧', remember: '回煞' }[choice], text, [['留在现场回看', close], ['返回标题', title]], '回煞 · 你的选择');
}
function inspect(item) {
    item = presentRecord(item);
    ['lock', 'water_station'].includes(item.id) ? audio.knock() : audio.paper();
    if (item.id === 'lock') { lock(); return; }
    if (item.id === 'water_station') { water(); return; }
    if (item.id === 'memory_album') { album(); return; }
    if (item.id === 'crash_phone') { phone(); return; }
    if (Object.hasOwn(game.DOCUMENTS, item.id)) { documentInspect(item.id); return; }
    if (item.returnMemory) { open(item.title, item.text, [['继续观察', close], ['回到厨房', returnMemory]]); return; }
    if (item.finalChoice) {
        open(item.title, item.text, [['先不决定，继续观察', close], ['回应救护灯，醒来', () => ending('wake')],
            ['留在母亲的记忆里', () => ending('remember')]]); return;
    }
    if (item.deduction) {
        readRecord(item, [['继续观察', close], ['整理这段记忆', () => memoryJournal.show(item.deduction)], ['回到厨房', returnMemory]]); return;
    }
    if (item.id === 'medicine_letter') {
        readRecord(item, [['带着信继续走', close], ['今晚留下，给自己煮碗饭', () => ending('stay')]]); return;
    }
    if (item.id === 'road_exit') {
        open(item.title, item.text, [['再看看旧宅', close], ['走向天光', () => ending('leave')]]); return;
    }
    if (item.id === 'portrait') { portrait(); return; }
    if (item.id === 'threshold') {
        open(item.title, item.text, [['再看看旧宅', close], ['走过门槛', () => {
            if (!story.finish()) return;
            close();
        }]]);
        return;
    }
    readRecord(item, [['继续观察', close], ['打开手记', () => journal()]]);
}
function title() {
    leaveInspection(false);
    save(); if (reader.open) reader.close();
    scene.controls.clear(); if (document.pointerLockElement) document.exitPointerLock();
    mode = 'title'; $('hud').hidden = true; $('title-screen').hidden = false;
    audio.pause(); updateStatus(); $('begin').focus();
}
function pause() {
    open('暂歇', '合上这页，就能继续观察。当前进度只保存在这台设备的浏览器中。', [
        ['继续探索', close], ['回查手记', () => journal(!!scene.inspectionReturn)], ['查看地图', () => showMap()],
        ...(story.state.memory ? [['回到厨房', returnMemory]] : []), ['返回标题', title]
    ], '回煞 · 暂停');
    settings.append($('reader-body'));
    if (!story.saveAvailable) { const p = document.createElement('p'); p.textContent = '浏览器未允许保存。当前页面内可以继续，关闭页面后进度可能丢失。'; $('reader-body').append(p); }
}
$('reader-close').addEventListener('click', close);
reader.addEventListener('cancel', event => { event.preventDefault(); close(); });
$('begin').addEventListener('click', () => {
    mode = 'game'; $('title-screen').hidden = true; $('hud').hidden = false;
    story.visitPosition(scene.playerSnapshot());
    document.activeElement?.blur?.(); scene.controls.clear(); audio.start();
});
$('restart').addEventListener('click', () => {
    open('重新回家', '重新开始会清除观察、字轮、量水、记忆推理和结局进度。', [['保留进度', close], ['确认重新开始', () => {
        story.reset(); scene.controls.teleport(scene.map.playerStart); audio.resetPosition();
        scene.syncState(true); evidenceJournal.sync(); close(); updateStatus();
    }]], '开始新的归门');
});
$('journal').addEventListener('click', () => journal(!!scene.inspectionReturn));
$('map').addEventListener('click', () => showMap());
$('pause').addEventListener('click', pause);
$('title-settings').addEventListener('click', titleSettings);
$('prompt').addEventListener('click', () => scene.interaction.activate());
document.querySelectorAll('[data-wheel]').forEach(button => button.addEventListener('click', () => rotateLock(Number(button.dataset.wheel))));
$('lock-leave').addEventListener('click', () => leaveInspection());
$('lock-records').addEventListener('click', () => journal(true));
$('lock-hint').addEventListener('click', () => guidance(0, true));
$('lock-attempt').addEventListener('click', () => {
    if (reader.open || scene.inspectionKind !== 'lock') return;
    scene.syncState(true);
    if (!story.unlock()) { audio.knock(); updateLock('门闩又落了回去。可以继续调整字轮，或回查字迹。'); return; }
    scene.syncState(); audio.latch(); leaveInspection();
    $('toast').textContent = '门闩松开了。你可以继续观察，也可以穿过门去。'; $('toast').hidden = false;
    setTimeout(() => { $('toast').hidden = true; }, 5000);
});
document.querySelectorAll('[data-bucket]').forEach(button => button.addEventListener('click', () => waterAction(`bucket${button.dataset.bucket}`)));
for (const action of ['fill', 'empty', 'pour', 'weigh']) $(`water-${action}`).addEventListener('click', () => waterAction(action));
$('water-leave').addEventListener('click', () => leaveInspection());
$('water-records').addEventListener('click', () => journal(true));
$('water-hint').addEventListener('click', () => guidance(0, true));
$('portrait-leave').addEventListener('click', () => leaveInspection());
$('portrait-records').addEventListener('click', () => journal(true));
$('portrait-reveal').addEventListener('click', () => {
    if (scene.inspectionKind !== 'portrait' || reader.open || !story.revealPortrait()) return;
    audio.paper(); scene.syncState(); updatePortrait('黑布被提起来了。照片背后的话还要翻过去才看得见。');
});
$('portrait-flip').addEventListener('click', () => {
    if (scene.inspectionKind !== 'portrait' || reader.open) return;
    scene.portrait.flip(); audio.paper(); updatePortrait();
});
$('portrait-read').addEventListener('click', () => {
    if (scene.inspectionKind !== 'portrait' || reader.open || !scene.portrait.backVisible || !story.readPortraitBack()) return;
    audio.paper(); readRecord(game.PORTRAIT_BACK_RECORD, [['回到相框', portrait]]);
});
document.querySelectorAll('[data-phone-page]').forEach(button => button.addEventListener('click', () => phonePage(button.dataset.phonePage)));
$('phone-leave').addEventListener('click', () => leaveInspection());
$('phone-records').addEventListener('click', () => journal(true));
$('phone-read').addEventListener('click', () => {
    if (reader.open || scene.inspectionKind !== 'phone' || !story.readPhonePage(scene.phone.page)) return;
    audio.paper(); save(); updatePhone(); $('phone-reading').querySelector('details').open = true;
});
$('document-leave').addEventListener('click', () => leaveInspection());
$('document-records').addEventListener('click', () => journal(true));
$('document-flip').addEventListener('click', () => {
    if (reader.open || scene.inspectionKind !== 'document') return;
    scene.documents.flip(); audio.paper(); updateDocument();
});
$('document-read').addEventListener('click', () => {
    if (reader.open || scene.inspectionKind !== 'document') return;
    const id = scene.documents.activeId, face = scene.documents.visibleFace;
    if (!face || !story.readDocumentFace(id, face)) return;
    audio.paper(); save(); updateDocument(); $('document-reading').querySelector('details').open = true;
});
evidenceJournal.mountInspector($('lock-inspector'));
evidenceJournal.mountInspector($('water-inspector'));
window.addEventListener('keydown', event => {
    if (event.defaultPrevented || event.isComposing || event.repeat || reader.open || mode !== 'game') return;
    if (scene.inspectionKind === 'phone' && /^(Digit|Numpad)[12]$/.test(event.code)) {
        event.preventDefault(); phonePage(Number(event.code.slice(-1)) === 1 ? 'calls' : 'recording');
    } else if (scene.inspectionKind === 'water' && /^(Digit|Numpad)[12]$/.test(event.code)) {
        event.preventDefault(); waterAction(`bucket${Number(event.code.slice(-1)) - 1}`);
    } else if (scene.inspectionKind === 'water' && ['KeyF', 'KeyX', 'KeyP'].includes(event.code)) {
        event.preventDefault(); waterAction({ KeyF: 'fill', KeyX: 'empty', KeyP: 'pour' }[event.code]);
    } else if (scene.inspectionKind === 'lock' && /^(Digit|Numpad)[123]$/.test(event.code)) {
        event.preventDefault(); rotateLock(Number(event.code.slice(-1)) - 1);
    }
    if (event.code === 'KeyJ') { event.preventDefault(); journal(!!scene.inspectionReturn); }
    if (event.code === 'KeyM') { event.preventDefault(); showMap(); }
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
    scene = new game.ThreeHouseScene({ root: $('world'), prompt: $('prompt'), focusMarker: $('focus-marker'), story, isPaused, onInspect: inspect,
        getPreferences: () => preferences.values,
        isReading: () => reader.open || document.hidden || mode !== 'game',
        onMechanismEvent: event => { if (event === 'door-release') audio.knock(); },
        onScaleEvent: event => {
            if (event.phase === 'ready') {
                updateWater();
                const active = document.activeElement;
                if (scene.inspectionKind === 'water' && !reader.open && [document.body, scene.renderer.domElement, $('water-weigh')].includes(active)) {
                    (story.state.waterSolved ? $('water-leave') : $('water-weigh')).focus({ preventScroll: true });
                }
                return;
            }
            event.success ? audio.release() : audio.knock();
            updateWater(event.success ? '指针对准四升红线，秤盘压平。抽屉和院门的铜索松开了，退回桌前可以低头看信。'
                : `指针偏${event.amount < 4 ? '轻' : '重'}，还没有对准四升红线。五升桶会放回桌上，水量保留；可以继续调整。`);
        },
        onAssetError: name => { assetErrors.add(name); updateLoadStatus(); },
        onFrame: (position, paused) => {
            audio.update(position, paused, story.state.memory || 'house');
            if (!paused) story.visitPosition(position);
            if (scene.inspectionKind === 'portrait' && !reader.open) updatePortrait();
            if (scene.inspectionKind === 'document' && !reader.open) updateDocument();
            if (!paused && !story.state.memory && story.state.opened && position.z < -15.2 && story.enterCourtyard()) updateStatus();
        } });
    await scene.start();
    applyPreferences();
    let wheelPress;
    scene.renderer.domElement.addEventListener('pointerdown', event => {
        if (wheelPress && wheelPress.id !== event.pointerId) return;
        if (event.pointerType === 'mouse' && event.button !== 0) return;
        wheelPress = scene.inspectionReturn && !reader.open ? { x: event.clientX, y: event.clientY, id: event.pointerId } : null;
        if (wheelPress && ['portrait', 'document'].includes(scene.inspectionKind)) {
            try { scene.renderer.domElement.setPointerCapture?.(event.pointerId); } catch (_) { /* release is also handled on the canvas */ }
        }
    });
    scene.renderer.domElement.addEventListener('pointermove', event => {
        if (!['portrait', 'document'].includes(scene.inspectionKind) || reader.open || wheelPress?.id !== event.pointerId) return;
        if (event.pointerType === 'mouse' && event.buttons === 0) { wheelPress = null; return; }
        (scene.inspectionKind === 'portrait' ? scene.portrait : scene.documents).drag(event.clientX - wheelPress.x, event.clientY - wheelPress.y);
        wheelPress.x = event.clientX; wheelPress.y = event.clientY; scene.inspectionKind === 'portrait' ? updatePortrait() : updateDocument();
    });
    scene.renderer.domElement.addEventListener('pointerup', event => {
        const press = wheelPress; wheelPress = null;
        if (!press || press.id !== event.pointerId || Math.hypot(event.clientX - press.x, event.clientY - press.y) > 8) return;
        if (['portrait', 'document'].includes(scene.inspectionKind)) return;
        if (scene.inspectionKind === 'phone') {
            const page = scene.phone.pick(event.clientX, event.clientY); if (page) phonePage(page);
        } else if (scene.inspectionKind === 'water') {
            const action = scene.courtyard.pick(event.clientX, event.clientY); if (action) waterAction(action);
        } else {
            const index = scene.pickWheel(event.clientX, event.clientY);
            if (Number.isInteger(index)) rotateLock(index);
        }
    });
    scene.renderer.domElement.addEventListener('pointercancel', () => { wheelPress = null; });
    scene.renderer.domElement.addEventListener('lostpointercapture', () => { wheelPress = null; });
    updateStatus(); $('begin').disabled = false; $('title-settings').disabled = false;
    updateLoadStatus();
    saveTimer = setInterval(() => { if (mode === 'game' && !reader.open) save(); }, 5000);
} catch (error) {
    scene?.dispose();
    $('load-status').textContent = `旧宅未能载入。请通过 StartGame.bat 启动，并检查浏览器是否支持 WebGL。${error.message ? `（${error.message}）` : ''}`;
    $('load-status').classList.add('fatal'); $('begin').textContent = '载入失败';
}
