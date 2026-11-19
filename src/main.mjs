import { equipment, household } from './chapter-ui.mjs';
import { playDrive } from './drive-intro.mjs';
import * as THREE from '../vendor/three.module.mjs';
import { GLTFLoader } from '../vendor/GLTFLoader.mjs';
import { mergeGeometries } from '../vendor/BufferGeometryUtils.mjs';
window.THREE = THREE;
window.Huisha3D = { GLTFLoader, mergeGeometries };
const sceneModules = ['ThreeHouseMap', 'ThreeCourtyardMap', 'ThreeMemoryMap', 'ThreeWestRoom', 'ThreeStoreys', 'ThreeClerk', 'ThreeExplorationMap', 'ThreeStory', 'ThreePreferences', 'ThreeSettings', 'ThreeControls', 'ThreeInteraction', 'ThreeWindowWall', 'ThreeCourtyard', 'ThreePhone', 'ThreeDocument', 'ThreeMemoryScenes', 'ThreeMemoryTimeline', 'ThreeMemoryJournal', 'ThreeEvidenceJournal', 'ThreePortrait', 'ThreeDoorMechanism', 'ThreeVillageLane', 'ThreeHouseScene', 'ThreeAudio', 'ThreeYardWatch'];
// Fetch in parallel. Registration still follows map, story, controls and scene order.
for (const name of sceneModules) {
    const link = document.createElement('link');
    link.rel = 'modulepreload'; link.href = `src/3d/${name}.js`;
    document.head.append(link);
}
for (const name of sceneModules) await import(`./3d/${name}.js`);
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
const inputGuide = 'WASD 或方向键移动，鼠标转头。连按两次 W 并按住第二下疾跑，也可以按住 Shift。空格跳跃。\n\n靠近物品，按 E 或用鼠标左键查看。再按 E 或点击空白处返回。B 打开背包，H 查看提示，J 打开手记，M 查看地图，Esc 暂停。\n\n触屏：左下方向键移动，连点两次「前」并按住可跑，点「跳」跨障碍；拖动画面转头，点物品调查。';
let stopDrive, replayOnly = false, restoreMouse = false;
let mode = 'title', scene, lastFocus, saveTimer, portraitUiState, documentUiState;
const isPaused = () => mode !== 'game' || reader.open || document.hidden || !!scene?.inspectionReturn;
function updateLoadStatus() {
    $('load-status').textContent = assetErrors.size
        ? `部分场景资源未载入：${[...assetErrors].join('、')}。画面可能不完整，请检查本地文件。`
        : story.saveAvailable ? '进度会自动保存 · 可随时暂停' : '此浏览器暂不支持保存，可在当前页面游玩';
}
function updateStatus() {
    $('objective').textContent = story.headline(scene?.controls ? scene.playerSnapshot() : undefined);
    $('shield-flame').hidden = story.state.lamp !== 'lit' || !!scene?.inspectionReturn;
    $('shield-flame').setAttribute('aria-pressed', String(story.state.shielded));
    $('shield-flame').textContent = story.state.shielded ? '松开手掌 [F]' : '拢住灯火 [F]';
    $('begin').textContent = story.state.memory ? `继续${game.MEMORIES[story.state.memory].title}`
        : story.state.records.length || story.state.position ? (story.state.courtyard ? '继续余温' : '继续归门') : '开始游戏';
    $('restart').hidden = !story.state.records.length && !story.state.position;
    $('replay-drive').hidden = story.state.arrival === 'intro';
    if (story.state.arrival !== 'home' && !story.state.memory) {
        $('chapter-number').textContent = '序'; $('chapter-name').textContent = '村 口';
        if (story.state.arrival !== 'intro') $('begin').textContent = '继续村口进度';
        return;
    }
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
function releaseMouse() {
    if (document.pointerLockElement) {
        restoreMouse = true;
        document.exitPointerLock();
    }
}
function resumeWorld() {
    const canvas = scene?.renderer?.domElement;
    if (mode !== 'game' || reader.open || scene?.inspectionReturn || !canvas) return;
    canvas.focus({preventScroll:true});
    if (restoreMouse && preferences.values.pointerLock) {
        try { canvas.requestPointerLock?.()?.catch?.(() => {}); } catch (_) { /* dragging stays available */ }
    }
    restoreMouse = false;
}
function open(title, text, actions = [], eyebrow = '旧宅 · 观察记录') {
    if (!reader.open) {
        lastFocus = document.activeElement;
        if (mode === 'game' && scene?.controls) story.save(scene.playerSnapshot());
    }
    scene?.controls?.clear();
    touches.clear(); updateTouch();
    releaseMouse();
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
    if (noticeHost.parentNode!==reader) reader.append(noticeHost);
    $('reader-title').focus();
    reader.scrollTop = 0;
    updateStatus();
}
function close() {
    reader.close(); document.body.append(noticeHost); scene?.controls?.clear();
    if (mode === 'game' && !scene.inspectionReturn) resumeWorld();
    else if (lastFocus?.isConnected) lastFocus.focus?.({ preventScroll: true });
    save();
}
const noticeHost = $('acquisitions');
function progressSignature() {
    const entries = new Map(story.carried().map(id => ['item.'+id,'“'+equipment[id][0]+'”已加入道具']));
    for(const id of story.state.records) {
        const title = id==='portrait_back' ? game.PORTRAIT_BACK_RECORD.title : game.WORLD_MAP.interactables.find(item=>item.id===id)?.title;
        if(!title) continue;
        const pages = story.state.documentViews[id] || (id==='crash_phone' ? story.state.phoneViews : []);
        entries.set('record.'+id+'.'+pages.length,'手记已更新：“'+title+'”');
    }
    return entries;
}
let seenProgress=progressSignature();
story.onProgress=()=>{
    const current=progressSignature();
    if(mode==='game') for(const [key,message] of current) {
        if(seenProgress.has(key)) continue;
        const notice=document.createElement('div');notice.textContent=message;noticeHost.append(notice);
        audio.tone(key.startsWith('item.')?660:480,.13,.065);
        window.setTimeout(()=>notice.remove(),4200);
    }
    seenProgress=current;
};
function pocketLetter() {
    const item=game.WORLD_MAP.interactables.find(entry=>entry.id==='car_envelope');
    story.record(item.id);story.advanceArrival('letter','ledger');
    readRecord(item,[['回到背包',backpack],['收好来信',close]]);
}
function showBridgePhoto(){
    const record=game.WORLD_MAP.interactables.find(item=>item.id==='bend_photo');
    if(!story.state.records.includes(record.id)) {story.record(record.id);audio.paper();}
    readRecord(record,[['收好照片',close]]);
}
function inspectUniform(){
    const collar=game.WORLD_MAP.interactables.find(item=>item.id==='uniform_collar');
    if(!story.state.records.includes(collar.id)){story.record(collar.id);scene.syncState();audio.paper();}
    const found=story.state.records.includes('bend_photo');
    const text=found?collar.text.replace('右边内袋比左边沉。','右边内袋里只剩一点纸屑。'):collar.text;
    const inspectCuff=()=>{
        const cuff=game.WORLD_MAP.interactables.find(item=>item.id==='uniform_cuff');
        story.record(cuff.id);
        readRecord(cuff,[['翻回衣领',inspectUniform],['收好校服',close]]);
    };
    readRecord({...collar,text},[...(!found?[['摸一摸右边内袋',showBridgePhoto]]:[]),['展开左袖',inspectCuff],['收好校服',close]]);
}
function lookAtHeightStrip() {
    const back = game.WORLD_MAP.interactables.find(item => item.id === 'height_stitch');
    open('量身高的布带', '我把布卷摊在手上。几道黑线都朝着我，最上面那道的旁边，还露了一小截红线头。', [
        ['翻看布背', () => {
            story.record(back.id);
            readRecord(back, [['翻回正面', lookAtHeightStrip], ['卷起来', close]]);
        }], ['回到背包', backpack], ['卷起来', close]
    ]);
}
function backpack() {
    const choices=story.carried().map(id=>[equipment[id][0],id==='envelope'?pocketLetter:id==='uniform'?inspectUniform:id==='roadPhoto'?showBridgePhoto:
        id==='heightStrip'?lookAtHeightStrip:()=>open(equipment[id][0],equipment[id][1],[['回到背包',backpack],['返回探索',close]],'随身背包')]);
    open('背包',choices.length?'':'包里暂时没有东西。',[...choices,['收起背包',close]],'随身物品');
}
function knownRecords() {
    return story.state.records.map(id => id === 'portrait_back'
        ? game.PORTRAIT_BACK_RECORD
        : game.WORLD_MAP.interactables.find(item => item.id === id)).filter(Boolean).map(presentRecord);
}
function presentRecord(item) {
    if (item.id === 'duty_book' && story.carried().includes('key'))
        return {...item,text:item.text.replace('李家这一行还空着。','东街六号那一行，是我刚签的名字。')};
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
function recordPhoto(slug,caption) {
    const image=document.createElement('img');
    image.className='record-photo';image.alt=caption;
    image.width=900;image.height=600;image.fetchPriority='high';
    image.src='assets/art/'+slug+'.jpg';
    return image;
}
function readRecord(item, actions) {
    const choices = [...actions];
    if (!choices.some(([label]) => label === '打开手记')) choices.push(['打开手记', () => journal(!!scene?.inspectionReturn)]);
    open(item.title, item.text, choices);
    const photographs={letter:'family-new-year',wedding_photo:'silver-wedding',bend_photo:'bridge-bicycle',height_stitch:'height-stitch'};
    if(photographs[item.id]){
        $('reader-body').prepend(recordPhoto(photographs[item.id],item.title));
    }
    if(item.id==='paper_mask' || item.id==='mask_strap'){
        const image=document.createElement('img');
        image.className='mask-study';image.width=702;image.height=768;image.alt=item.title;
        image.src='assets/art/paper-mask-'+(item.id==='paper_mask'?'front':'back')+'.webp';
        $('reader-body').prepend(image);
    }
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
    const {photoFiled,records}=story.state;
    const text=photoFiled?'最后一页夹好那张学车照了。桥柱缺的那一角，跟今晚在车灯里看见的一样。':'录取通知和复诊单各占一页。最后一页只剩四个相角，右下角翘起，露出一小块颜色浅些的纸。';
    const actions=Object.entries(game.MEMORIES).map(([id,definition])=>{
        if(id==='crash' && !photoFiled && records.includes('bend_photo')) return ['把石桥旧照放进相角',()=>{
            story.state.photoFiled=true;story.save();audio.paper();album();
        }];
        return [id==='crash'&&!photoFiled?'翻看空着的最后一页':`翻入记忆 · ${definition.title}`,()=>enterMemory(id)];
    });
    open(item.title,text,[...actions,['合上相册，继续观察',close]],'回煞 · 厨房相册');
    if(photoFiled){
        $('reader-body').prepend(recordPhoto('bridge-bicycle','父亲在石桥边松开自行车后座'));
    }
}
function enterMemory(id) {
    if(id==='crash' && !story.state.photoFiled){
        const note=story.state.records.includes('uniform_collar')?'我刚收起的校服里，有一边口袋沉甸甸的。':'我记得这张。妈给我洗校服那天，我怕她把照片一起洗了，一路跑回家去掏口袋。';
        open('缺了一张照片',note,[['回到相册',album],['返回',close]]);return;
    }
    leaveInspection(false);
    if (!story.enterMemory(id, scene.playerSnapshot())) return;
    scene.controls.teleport(story.state.position); scene.syncState(true); audio.resetPosition();
    if (reader.open) reader.close(); save(); resumeWorld();
}
function returnMemory() {
    leaveInspection(false);
    const pose = story.leaveMemory(); if (!pose) return;
    scene.controls.teleport(pose); scene.syncState(true); audio.resetPosition();
    if (reader.open) reader.close(); save(); resumeWorld();
}
function guidance(stage = 0, backToLock = !!scene?.inspectionReturn) {
    const hint = story.guidance(stage,scene.playerSnapshot());
    const actions = [['回查手记', () => journal(backToLock)], [backToLock ? inspectionLabel() : '继续观察', backToLock ? resumeInspection : close]];
    if (hint.next) actions.push([hint.next, () => guidance(stage + 1, backToLock)]);
    open('查看提示', hint.text, actions, stage >= 2 ? '解谜答案 · 按需查看' : '探索提示 · 按需查看');
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
    const loose=id==='school_draft' && !story.state.formJoined;
    const state = `${id}:${face}:${targetBack}:${loose}:${(story.state.documentViews[id] || []).join(',')}`;
    if (state === documentUiState) return; documentUiState = state;
    $('document-title').textContent = game.DOCUMENTS[id].title;
    $('document-join').hidden = !loose;
    $('document-read').hidden = loose;
    $('document-read').disabled = !face || loose;
    $('document-flip').textContent = targetBack ? '转回正面' : '翻到背面';
    $('document-status').textContent = loose ? '拖动错开的半张纸，对齐撕口后松手，也可以用下方按钮合上。' : face ? `${game.DOCUMENTS[id].faces[face].title} · ${story.hasDocumentFace(id, face) ? '已记入手记' : '尚未记下'}。可以主动阅读，或翻到另一面。`
        : '等纸张转到眼前，再阅读这一面。可以拖动纸张调整角度。';
    const definition = game.DOCUMENTS[id], page = face && definition.faces[face];
    updateObjectReading('document', page && story.hasDocumentFace(id, face)
        ? { id, title: `${definition.title} · ${page.title}`, text: page.text } : null, definition.space);
}
function documentInspect(id) {
    if (!Object.hasOwn(game.DOCUMENTS, id) || story.state.memory !== game.DOCUMENTS[id].space) return;
    if (reader.open) reader.close(); releaseMouse();
    touches.clear(); updateTouch(); scene.beginDocumentInspection(id);
    $('document-inspector').hidden = false; $('hud').classList.add('inspecting'); documentUiState = null; updateDocument();
    (!$('document-join').hidden ? $('document-join') : $('document-read').disabled ? $('document-flip') : $('document-read')).focus();
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
    if (reader.open) reader.close(); releaseMouse();
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
    if (reader.open) reader.close(); releaseMouse();
    touches.clear(); updateTouch(); scene.beginPortraitInspection();
    $('portrait-inspector').hidden = false; $('hud').classList.add('inspecting'); portraitUiState = null; updatePortrait();
    (story.state.portrait ? $('portrait-flip') : $('portrait-reveal')).focus();
}
function updateLock(message) {
    $('lock-hang').hidden = story.state.lamp !== 'lit';
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
    if (restoreFocus) resumeWorld();
    save();
}
function rotateLock(index) {
    if (scene.inspectionKind !== 'lock' || reader.open) return;
    story.rotate(index); audio.latch(); scene.syncState(); updateLock();
}
function lock() {
    if (story.state.opened) { open('门闩已松开', '三根红绳垂下来。门外透进雨后的天光。', [['回到门前', close]]); return; }
    if (reader.open) reader.close();
    releaseMouse();
    touches.clear(); updateTouch(); scene.beginLockInspection();
    $('lock-inspector').hidden = false; $('hud').classList.add('inspecting');
    updateStatus();
    updateLock(story.state.lamp === 'lit' ? '贴近一照，闩底露出个铜丝圈。我小时候踮着脚，刚好够得着它。' : '每次转动一格。可以回查已读字迹，再压下门闩。');
    evidenceJournal.sync();
    document.querySelector('[data-wheel]').focus();
}
function updateWater(message) {
    const [small, large] = story.state.buckets;
    $('level-small').textContent=small+' / 3 升'; $('level-large').textContent=large+' / 5 升';
    $('water-pour').textContent=scene.courtyard.selected?'倒入三升桶':'倒入五升桶';
    if (message) $('water-status').textContent = message;
    document.querySelectorAll('[data-bucket]').forEach(button => {
        button.setAttribute('aria-pressed', String(Number(button.dataset.bucket) === scene.courtyard.selected));
        button.disabled = story.state.waterSolved || !!scene.courtyard.weighing;
    });
    for (const id of ['water-fill', 'water-empty', 'water-pour', 'water-weigh']) $(id).disabled = story.state.waterSolved || !!scene.courtyard.weighing;
    scene.syncState(); updateStatus();
}
function water() {
    if (reader.open) reader.close();
    releaseMouse();
    touches.clear(); updateTouch(); scene.beginWaterInspection();
    $('water-inspector').hidden = false; $('hud').classList.add('inspecting');
    updateWater(story.state.waterSolved ? '秤盘已经压平，桌下的抽屉打开了。退回桌前，可以低头查看家书。'
        : '选一只桶再操作。上秤用五升桶。');
    evidenceJournal.sync();
    (story.state.waterSolved ? $('water-leave') : document.querySelector('[data-bucket]')).focus();
}
function waterAction(action) {
    if (reader.open || scene.inspectionKind !== 'water' || story.state.waterSolved || scene.courtyard.weighing) return;
    if (/^bucket[01]$/.test(action)) {
        scene.courtyard.selected = Number(action.slice(-1));
        updateWater(`已选${scene.courtyard.selected ? '五' : '三'}升桶。`); return;
    }
    const index = scene.courtyard.selected;
    let changed = false, message;
    if (action === 'fill') { changed = story.fillBucket(index); message = changed ? '已从水缸添满选中的桶。' : '这个桶已经满了。'; }
    else if (action === 'empty') { changed = story.emptyBucket(index); message = changed ? '水倒进了槽里，桶空了。' : '这个桶已经是空的。'; }
    else if (action === 'pour') { const amount = story.pourBucket(index); changed = amount > 0; message = amount ? `向另一桶倒入 ${amount} 升水。` : '倒不进去：选中的桶是空的，或另一桶已经满了。'; }
    else if (action === 'weigh') {
        if (scene.courtyard.beginWeigh() && scene.courtyard.weighing) updateWater('称量中……');
        return;
    } else return;
    if (changed) audio.water(action);
    updateWater(message);
}
function busEnding() {
    const {records,heightStripTaken} = story.state;
    const paragraphs = [records.includes('medicine_letter')
        ? '天刚蒙亮，村口卖早点的正在卸炉子。我借了个塑料袋，把信和复诊单套好。\n\n老板问要几个包子。我说两个，想了想，改成了一个。'
        : '车开过第一个弯，我才想起厨房的抽屉还开着。我问司机明天还有没有这趟车。\n\n他说有，把第一班车的时间写在了我的票背面。'];
    if (heightStripTaken) paragraphs.push(records.includes('height_stitch')
        ? '车一颠，布卷从外套口袋里滑出来。旁座替我接住，问：「裁衣服的尺？」我把黑线和红线指给她看：「这个是我。矮一点的那个，是我妈。」'
        : '布卷从外套口袋里滑出来一截。我往里塞了塞，把口袋上的扣子扣好。');
    if (records.includes('forwarding_slip')) paragraphs.push('到了县城，钥匙在口袋里硌了一下。我照底单上的号码给老周发消息：「您哪天值班？我把钥匙给您送回来。」\n\n「周三。别赶早，我上夜班。」我把号码存下来，名字填了个「周叔」。');
    return [...paragraphs,'结局 · 归路'].join('\n\n');
}
function ending(choice, memoryPlace) {
    if (!story.depart(choice,memoryPlace)) return;
    audio.chime();
    const text = choice === 'wake'
        ? '我捏了一下，又捏了一下。有人把晃在我眼皮上的灯挪开。「好，李明。我不照你了。车上还有人吗？」\n\n我张了两次嘴。「就我一个。」他朝车门外把这四个字重复了一遍。我这才听清，一直响的是雨点落在他雨衣上的声音。\n\n结局 · 破茧'
        : choice === 'remember'
        ? '我把碗端稳。妈用筷子把最后几根面拨进我碗里，留了一根，自己尝尝软硬。「这回没煮过吧？」\n\n我摇头，嘴里还含着面。门外喊「李明」的那个人又等了一会儿。妈把醋往我手边推了推。\n\n结局 · 回煞'
        : choice === 'stay'
        ? '米瓮底还有一小碗米。我淘了两遍，照她教的，把食指伸进锅里量水。\n\n等饭熟的时候，我把第二双筷子收回了抽屉。\n\n结局 · 余温'
        : busEnding();
    let endingText=text;
    if(choice==='stay' && story.state.records.includes('clerk_holdall') && story.state.records.includes('clerk_cuff')) {
        endingText='我淘了一碗米，坐在灶边等锅开。校服的左袖还摊在我腿上。水池边有块用薄了的肥皂，我接了半盆水，把那三颗扣子解开，只把袖口浸进去。\n\n搓到最后一颗扣子，米汤扑了出来。我一只手提着湿袖口，一只手赶紧去揭锅盖。\n\n结局 · 余温';
    }
    if(choice==='remember' && story.state.rememberPlace==='bridge') {
        endingText='我踩下踏板。爸松了手，在后头跟了两步就跑不动了。我回过头来，妈才把相机举稳。\n\n「这回拍到没有？」她拿指甲拨了一下过片轮，笑我：「哪有人骑车还顾着看镜头的。」桥那头喊我名字的人又等了一会儿。我扶正车把，骑回去替她拿相机套。\n\n结局 · 回煞';
    }
    open({ stay: '余温', leave: '归路', wake: '破茧', remember: '回煞' }[choice], endingText, [['留在现场回看', close], ['返回标题', title]], '回煞 · 你的选择');
}
function inspectVillage(item) {
    const phase = story.state.arrival;
    if (item.id === 'clerk') {
        const after=phase==='letter'?'老周把眼镜往上一推。「你说你是李家的？信给我瞧瞧，村里的门牌去年都换过了。」':
            phase==='ledger'?'周师傅翻开登记簿。「十四号我记得。新号在这页上，你自己对一下，省得拿错人家的钥匙。」':
            phase==='keys'?'老周拧开圆珠笔的笔帽递过来。「你看好了？告诉我新门牌，我给你拿。」':
            phase==='gate'?'老周把登记簿收回窗里。「木工下周二才来。你慢慢收拾，走的时候把门带上。」':
            '「你爸修秤那间屋还在，」周师傅把搪瓷缸挪到炉边，「后来他在门口挡了个大衣柜。你小时候老往里钻。」';
        const askAboutPost=['这封信是谁寄的？',()=>{
            const slip=game.WORLD_MAP.interactables.find(entry=>entry.id==='forwarding_slip');
            open('柜子后面的信','老周把我的外封翻过来，看了一眼条码。\n\n「是我寄的。上礼拜这窗户漏雨，我们往外抬钥匙柜，你妈那个小信封从背后掉下来了。我没敢拆。」\n\n「您怎么知道我住哪儿？」\n\n「你寄回来的修屋回执上有。你等会儿，我给你找那张底单。」',[
                ['核对寄件底单',()=>{story.record(slip.id);readRecord(slip,[['还给周师傅',()=>inspectVillage(item)],['告辞',close]]);}],
                ['不用找了',close]]);
        }];
        const discuss=(id)=>{
            const account=game.WORLD_MAP.interactables.find(entry=>entry.id===id);
            story.record(id);
            readRecord(account,[['再问一句',()=>inspectVillage(item)],['告辞',close]]);
        };
        const questions=[];
        if (phase==='keys') questions.push(['向周师傅领钥匙',()=>inspectVillage(game.WORLD_MAP.interactables.find(entry=>entry.id==='key_board'))]);
        if(story.state.coffinOpen || story.state.records.includes('coffin')) questions.push(['正厅那口棺是谁的？',()=>discuss('clerk_holdall')]);
        if(story.state.records.includes('uniform_cuff')) questions.push(['给周师傅看左袖',()=>discuss('clerk_cuff')]);
        open('值夜的周师傅',after,phase==='letter'?[['拿出内袋里的信',pocketLetter],['告辞',close]]:[...questions,['翻看登记簿',()=>{
            const book=game.WORLD_MAP.interactables.find(i=>i.id==='duty_book');story.record(book.id);inspectVillage(book);
        }],askAboutPost,['告辞',close]]);return true;
    }
    if (item.id === 'car_envelope') {pocketLetter();return true;}
    else if (item.id === 'duty_book') {
        story.advanceArrival('ledger','keys');
        const actions = [['返回',close]];
        if (story.state.arrival === 'keys') actions.unshift(['向周师傅领钥匙',()=>inspectVillage(game.WORLD_MAP.interactables.find(entry=>entry.id==='key_board'))]);
        readRecord(presentRecord(item),actions); return true;
    }
    else if (item.id === 'key_board' && story.carried().includes('key')) {
        open(item.title,'中间的挂钩空了，九号和十六号还挂着。六号钥匙在我身上。',[['返回',close]]); return true;
    }
    else if (item.id === 'key_board' && phase === 'keys') {
        const choose = number => {
            if (number === 6) {
                story.record('key_board'); story.advanceArrival('keys','gate'); scene.syncState(); audio.latch();
                open('拿到六号钥匙', '我在六号那一行签了名。老周转身摘了钥匙，递过来时还捏着铜牌，让我先拿稳。\n\n「锁有点涩。插到底，往回退一点就转得动。」', [['收好钥匙', close]]);
            } else {
                open('钥匙牌对不上', '老周的手停在挂钩上。「这户不姓李。你再看一眼十四号那行？」', [['重看登记簿',()=>inspectVillage(game.WORLD_MAP.interactables.find(entry=>entry.id==='duty_book'))],['再选一把', () => inspectVillage(item)], ['告辞', close]]);
            }
        };
        open(item.title, item.text + '\n\n老周把笔递给我：「你家现在是东街几号？」', [9,6,16].map(n => [`东街 ${n} 号`, () => choose(n)]));
        return true;
    } else if (item.id === 'front_gate' && phase === 'gate') {
        open(item.title, item.text + '\n\n门板靠下新画了道粉笔印。我春天签过字，下周二木工就来拆走廊。我想进去看看，妈钉的布带还在不在。', [['用六号钥匙开门', () => {
            story.advanceArrival('gate','home'); audio.latch(); close();
        }], ['返回路上', close]]);
        return true;
    } else if (!['key_board','front_gate'].includes(item.id)) return false;
    const note = item.id==='front_gate' ? (phase==='home'?'前门已经打开。':'门还锁着。') : '';
    readRecord({...item, text: item.text + '\n\n' + note}, [['返回', close]]);
    return true;
}
function inspect(item) {
    item = presentRecord(item);
    ['lock', 'water_station'].includes(item.id) ? audio.knock() : audio.paper();
    if (['car_envelope','clerk','duty_book','key_board','front_gate'].includes(item.id) && inspectVillage(item)) return;
    if (household({story,scene,open,close,audio,inspectUniform},item)) return;
    if (item.id === 'wall_marks') {
        const taken = story.state.heightStripTaken;
        const move = () => {
            story.state.heightStripTaken = !taken;
            audio.paper(); scene.syncState(); close();
        };
        if (taken) open('挂布带的两颗钉子', '布带取下来了。两颗钉子中间的木头颜色浅些。', [
            ['把布带挂回去', move], ['继续带在身上', close]
        ]);
        else readRecord(item, [['从钉子上摘下，卷好带走', move], ['留在墙上', close]]);
        return;
    }
    if(item.id==='paper_mask' || item.id==='wiper_print'){
        const records=story.state.records;
        const show=(id,actions)=>{
            story.record(id);audio.paper();
            readRecord(game.WORLD_MAP.interactables.find(entry=>entry.id===id),actions);
        };
        const leave=['返回',close], actions=[];
        if(item.id==='paper_mask'){
            const flip=()=>{
                const hang=()=>{
                    story.state.maskHung=true;scene.courtyard.syncMask();close();
                };
                show('mask_strap',[['翻回正面',()=>inspect(item)],...(!story.state.maskHung?[['挂到门边的木钉上',hang]]:[]),leave]);
            };
            actions.push(['翻看背面',flip]);
        }
        if(records.includes('wiper_print') && records.includes('paper_mask')){
            actions.push(['比一比两处红印',()=>show('mask_transfer',[['再看一眼',()=>inspect(item)],leave])]);
        }
        readRecord(item,[...actions,leave]);return;
    }
    if (item.id === 'lock') { lock(); return; }
    if (item.id === 'water_station') {
        if(!story.state.calibrated){
            const has=story.carried().includes('weight');
            open('量水秤',has?'铜砣底下的圆榫和左盘的凹槽一样大。':'左盘空着，指针顶死在一边。秤脚的铜牌上刻着「李记修秤 · 西厢」。',
                has?[['装上铜砣',()=>{story.state.calibrated=true;story.save();audio.latch();water();}],['返回',close]]:[['返回',close]]);
        }else water();
        return;
    }
    if (item.id === 'memory_album') { album(); return; }
    if (item.id === 'hospital_fare') {
        if (!story.state.fareTinOpen) {
            story.state.fareTinOpen = true;
            audio.latch();
            save();
            return;
        }
        story.record(item.id);
    }
    if (item.id === 'crash_phone') { phone(); return; }
    if (Object.hasOwn(game.DOCUMENTS, item.id)) { documentInspect(item.id); return; }
    if (item.returnMemory) { open(item.title, item.text, [['继续观察', close], ['回到厨房', returnMemory]]); return; }
    if (item.finalChoice) {
        const bridge=story.state.records.includes('bridge_post');
        const leave=['先不决定，继续观察',close];
        const roadside=()=>{
            const touch=story.state.records.includes('crash_belt')?'是刚才替我剪开安全带的声音。':'有人把两根手指放进我的手心。';
            open('车门外的人',touch+'「李明，我在你右手边。听得见的话，捏我两下。」他停下来等着，我能摸到手套上的皱褶。',[
                ['捏他的手两下，醒来',()=>ending('wake')],['再听母亲那边',()=>home(bridge)],leave]);
        };
        const home=onBridge=>open(onBridge?'石桥上的母亲':'灶间的母亲',onBridge
            ? '桥头的雨停了。妈眯着一只眼举起相机：「刚才那张怕是虚了，你再骑一趟。」爸弯着腰，手还扶在后座上。'
            : '筷子磕在锅沿上。妈一手捞着面，一手朝我摊开：「碗呢？快端过来，面该坨了。」那只缺了口的碗就在我手边。',
            [[onBridge?'踩下踏板，留在桥上':'端起碗，留在灶间',()=>ending('remember',onBridge?'bridge':'kitchen')],
                ...(bridge?[[onBridge?'回想灶间':'回想石桥',()=>home(!onBridge)]]:[]),['再听车门外的人',roadside],leave]);
        open(item.title,item.text,[['听车门外的人说完',roadside],['听母亲说完',()=>home(bridge)],leave]);return;
    }
    if (item.deduction) {
        readRecord(item, [['继续观察', close], ['整理这段记忆', () => memoryJournal.show(item.deduction)], ['回到厨房', returnMemory]]); return;
    }
    if (item.id === 'medicine_letter') {
        readRecord(item, [['带着信继续走', close], ['今晚留下，给自己煮碗饭', () => ending('stay')]]); return;
    }
    if (item.id === 'stop_signal') {
        if (story.state.busCalled) {open(item.title, '牌子已经转好。接驳车停在前面的站牌旁。', [['返回',close]]); return;}
        const turn = direction => {
            if (story.signalBus(direction)) {
                scene.syncState(); audio.latch(); open('车来了', '司机闪了两下灯，在前面的站牌旁停下。', [['去站牌',close]]);
            } else open('弯道那边没有回应', '牌子朝着老宅。回去看路口的接驳通知，确认来车方向。', [['再转一次',()=>inspect(item)],['返回',close]]);
        };
        open(item.title,item.text,[['转向老宅',()=>turn('house')],['转向石桥',()=>turn('bridge')],['返回',close]]); return;
    }
    if (item.id === 'road_exit') {
        open(item.title, story.state.busCalled ? '车停稳了。司机拉开门，问你是不是去县城。' : '站牌旁还没有车。路口有张接驳通知，候车棚里有一根信号杆。',
            story.state.busCalled ? [['再看看旧宅', close], ['坐车下山', () => ending('leave')]] : [['去候车棚',close]]); return;
    }
    if (item.id === 'portrait') { portrait(); return; }
    if (item.id === 'altar' && !story.state.opened && story.state.lamp !== 'lit') {
        const take = story.state.lamp === 'out' ? '用供烛重新点灯' : '端起守夜灯';
        readRecord(item, [[take, () => { if (story.takeLamp()) audio.latch(); close(); }], ['留在供桌上', close]]);
        return;
    }
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
    scene.controls.clear(); releaseMouse();
    restoreMouse = false;
    mode = 'title'; $('hud').hidden = true; $('title-screen').hidden = false;
    audio.pause(); updateStatus(); $('begin').focus();
}
function pause() {
    open('暂停', story.headline() + '\n\n' + inputGuide, [
        ['继续探索', close], ['回查手记', () => journal(!!scene.inspectionReturn)], ['查看地图', () => showMap()],
        ...(story.state.memory ? [['回到厨房', returnMemory]] : []), ['返回标题', title]
    ], '回煞 · 暂停');
    settings.append($('reader-body'));
    if (!story.saveAvailable) { const p = document.createElement('p'); p.textContent = '浏览器未允许保存。当前页面内可以继续，关闭页面后进度可能丢失。'; $('reader-body').append(p); }
}
$('reader-close').addEventListener('click', close);
reader.addEventListener('close',()=>{ if(!reader.open) document.body.append(noticeHost); });
let blankPress=false;
function blankReader(e) {
    return [reader,$('reader-body'),$('reader-actions')].includes(e.target);
}
reader.addEventListener('pointerdown',e=>{blankPress=e.button===0 && blankReader(e);});
reader.addEventListener('click',e=>{if(blankPress && blankReader(e)) close();blankPress=false;});
reader.addEventListener('cancel', event => { event.preventDefault(); close(); });
function enterWorld() {
    mode = 'game'; $('hud').hidden = false;
    scene.controls.clear(); story.visitPosition(scene.playerSnapshot()); updateStatus();
    resumeWorld();
}
function leaveDrive() {
    if (mode !== 'drive') return;
    stopDrive?.(); audio.stopEngine(); scene.showingFilm = false; $('drive').hidden = true;
    if (replayOnly) {
        replayOnly = false; mode = 'title'; $('title-screen').hidden = false; audio.pause(); $('replay-drive').focus(); return;
    }
    scene.controls.teleport(scene.map.roadStart);
    // Commit the checkpoint and the roadside pose together, including when the player skips.
    story.state.position = scene.playerSnapshot();
    enterWorld(); story.advanceArrival('intro','letter');
    restoreMouse = !!window.matchMedia?.('(pointer:fine)').matches;
    open('下车', inputGuide, [['开始探索', close]], '回煞 · 村口');
}
$('skip-drive').addEventListener('click', leaveDrive);
function startDrive() {
    $('title-screen').hidden = true; audio.start();
    mode = 'drive'; scene.showingFilm = true; audio.startEngine(); audio.update(scene.map.roadStart,true); $('drive').hidden = false; $('skip-drive').focus();
    stopDrive = playDrive($('windscreen'), $('drive-caption'), leaveDrive, ()=>audio.knock());
}
$('replay-drive').addEventListener('click', () => {replayOnly = true; startDrive();});
$('begin').addEventListener('click', () => {
    if (story.state.arrival === 'intro') { startDrive(); return; }
    $('title-screen').hidden = true; audio.start();
    restoreMouse = !!window.matchMedia?.('(pointer:fine)').matches;
    enterWorld();
});
$('restart').addEventListener('click', () => {
    open('重新回家', '重新开始会清除观察、字轮、量水、记忆推理和结局进度。', [['保留进度', close], ['确认重新开始', () => {
        story.reset(); scene.controls.teleport(scene.map.playerStart); audio.resetPosition();
        scene.syncState(true); evidenceJournal.sync(); close(); updateStatus();
    }]], '开始新的归门');
});
$('backpack').addEventListener('click',backpack);
$('hints').addEventListener('click',()=>guidance());
$('journal').addEventListener('click', () => journal(!!scene.inspectionReturn));
$('map').addEventListener('click', () => showMap());
$('pause').addEventListener('click', pause);
$('title-settings').addEventListener('click', titleSettings);
$('shield-flame').addEventListener('click', () => {
    if (isPaused() || story.state.lamp !== 'lit') return;
    story.state.shielded = !story.state.shielded; save();
});
$('lock-hang').addEventListener('click', () => {
    if (reader.open || scene.inspectionKind !== 'lock' || !story.hangLamp()) return;
    audio.latch(); leaveInspection(); save();
});
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
function joinDraft(){
    if(reader.open || scene.inspectionKind!=='document' || scene.documents.activeId!=='school_draft' || story.state.formJoined) return;
    story.state.formJoined=true;scene.documents.syncTear();audio.paper();save();updateDocument();
    ($('document-read').disabled ? $('document-flip') : $('document-read')).focus();
}
$('document-join').addEventListener('click',joinDraft);
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
    if (event.defaultPrevented || event.isComposing || event.repeat) return;
    if (mode === 'drive' && event.code === 'Escape') { event.preventDefault(); leaveDrive(); return; }
    if (mode !== 'game') return;
    if (event.code === 'KeyE' && (reader.open || scene.inspectionReturn) && !/INPUT|TEXTAREA|SELECT/.test(event.target?.tagName)) {
        event.preventDefault(); reader.open ? close() : leaveInspection(); return;
    }
    if ((event.code==='KeyB' || event.code==='KeyH') && !/INPUT|SELECT|TEXTAREA/.test(event.target?.tagName)) {
        event.preventDefault();
        if(event.code==='KeyB') reader.open && $('reader-title').textContent==='背包' ? close() : backpack();
        else guidance(); return;
    }
    if (reader.open) return;
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
    if (event.code === 'KeyF' && !scene.inspectionReturn && story.state.lamp === 'lit') { event.preventDefault(); $('shield-flame').click(); }
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
        if (button.dataset.move === '0,1') scene.controls.tapForward(event.timeStamp);
        touches.set(event.pointerId, button.dataset.move.split(',').map(Number)); updateTouch();
    });
    const release = event => { if (button.dataset.move === '0,1') scene.controls.sprinting = false; touches.delete(event.pointerId); updateTouch(); };
    button.addEventListener('pointerup', release); button.addEventListener('pointercancel', release); button.addEventListener('lostpointercapture', release);
});
$('touch-jump').addEventListener('click', () => scene.controls.jump());
window.addEventListener('blur', () => { touches.clear(); updateTouch(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) { touches.clear(); updateTouch(); save(); audio.pause(); } else if (mode === 'game' || mode === 'drive') audio.start(); });
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
        onWatchEvent: (kind, pan) => {
            const panel = $('yard-watch');
            const words = {yard:'院门边，有人正提着灯往这边照。右手厨房里亮着灶火。',still:'灯扫到脚边了。站住，等光过去。',warning:'纸鞋在擦地。别动，或者躲到廊檐下。',caught:'那双鞋在你脚边停下。再睁眼，你又站在刚跨过的门槛上。',safe:'我跨进灶间，背后的灯灭了。有件东西擦着门边的墙滑到了地上。'};
            if (!kind && ['caught','safe'].includes(panel.dataset.cue)) return;
            panel.hidden = !kind; panel.textContent = words[kind] || ''; panel.dataset.cue = kind;
            if (kind === 'still' || kind === 'warning' || kind === 'caught') audio.watchStep(pan,kind!=='still');
            if (kind === 'caught' || kind === 'safe') {
                audio.resetPosition(); updateStatus();
                const message = panel.textContent;
                setTimeout(() => { if (panel.textContent === message) panel.hidden = true; }, 4200);
            }
        },
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
            updateWater(event.success ? '对准四升。桌下的抽屉开了。'
                : `指针偏${event.amount < 4 ? '轻' : '重'}，当前 ${event.amount} 升。`);
        },
        onAssetError: name => { assetErrors.add(name); updateLoadStatus(); },
        onFrame: (position, paused) => {
            audio.update(position, paused, story.state.memory || 'house');
            if (!paused) {
                story.visitPosition(position);
                const headline=story.headline(position);
                if($('objective').textContent!==headline) $('objective').textContent=headline;
            }
            if (!paused && story.state.lamp === 'lit' && story.inDraft(position) && !story.state.shielded) {
                story.crossDraft(scene.playerSnapshot()); updateStatus();
            }
            if (scene.inspectionKind === 'portrait' && !reader.open) updatePortrait();
            if (scene.inspectionKind === 'document' && !reader.open) updateDocument();
            if (!paused && !story.state.memory && story.state.opened && position.z < -15.2 && story.enterCourtyard()) updateStatus();
        } });
    await scene.start();
    scene.controls.onTap = point => scene.interaction.activate(point, scene.renderer.domElement);
    applyPreferences();
    let wheelPress;
    scene.renderer.domElement.addEventListener('pointerdown', event => {
        if (wheelPress && wheelPress.id !== event.pointerId) return;
        if (event.pointerType === 'mouse' && event.button !== 0) return;
        wheelPress = scene.inspectionReturn && !reader.open ? { x: event.clientX, y: event.clientY, originX:event.clientX, originY:event.clientY, dragged:false, id: event.pointerId } : null;
        if (wheelPress && ['portrait', 'document'].includes(scene.inspectionKind)) {
            wheelPress.tear=scene.inspectionKind==='document' && scene.documents.grabTear(event.clientX,event.clientY);
            try { scene.renderer.domElement.setPointerCapture?.(event.pointerId); } catch (_) { /* release is also handled on the canvas */ }
        }
    });
    scene.renderer.domElement.addEventListener('pointermove', event => {
        if (!['portrait', 'document'].includes(scene.inspectionKind) || reader.open || wheelPress?.id !== event.pointerId) return;
        if (event.pointerType === 'mouse' && event.buttons === 0) { if(wheelPress.tear) scene.documents.releaseTear();wheelPress = null; return; }
        wheelPress.dragged ||= Math.hypot(event.clientX-wheelPress.originX,event.clientY-wheelPress.originY)>6;
        if(wheelPress.tear){scene.documents.slideTear(event.clientX,event.clientY);return;}
        (scene.inspectionKind === 'portrait' ? scene.portrait : scene.documents).drag(event.clientX - wheelPress.x, event.clientY - wheelPress.y);
        wheelPress.x = event.clientX; wheelPress.y = event.clientY; scene.inspectionKind === 'portrait' ? updatePortrait() : updateDocument();
    });
    scene.renderer.domElement.addEventListener('pointerup', event => {
        const press = wheelPress;if(press?.id!==event.pointerId) return;wheelPress = null;
        if(press.tear){
            scene.documents.slideTear(event.clientX,event.clientY);
            if(scene.documents.releaseTear() && !reader.open) joinDraft();
            return;
        }
        if (!press || press.dragged || press.id !== event.pointerId || Math.hypot(event.clientX - press.originX, event.clientY - press.originY) > 8) return;
        const kind=scene.inspectionKind;
        if (['portrait','document','phone'].includes(kind)) {
            const object=kind==='portrait' ? scene.portrait.root : kind==='phone' ? scene.phone.root : scene.documents.papers.get(scene.documents.activeId)?.root;
            const rect=scene.renderer.domElement.getBoundingClientRect();
            if(rect.width && rect.height && object){
                const ray=new THREE.Raycaster();
                ray.setFromCamera(new THREE.Vector2(2*(event.clientX-rect.left)/rect.width-1,1-2*(event.clientY-rect.top)/rect.height),scene.camera);
                if(!ray.intersectObject(object,true).length) {leaveInspection();return;}
            }
            if(kind!=='phone') return;
        }
        if (scene.inspectionKind === 'phone') {
            const page = scene.phone.pick(event.clientX, event.clientY); if (page) phonePage(page);
        } else if (scene.inspectionKind === 'water') {
            const action = scene.courtyard.pick(event.clientX, event.clientY); if (action) waterAction(action); else leaveInspection();
        } else {
            const index = scene.pickWheel(event.clientX, event.clientY);
            if (Number.isInteger(index)) rotateLock(index); else leaveInspection();
        }
    });
    const cancelPress=event=>{
        if(wheelPress?.id!==event.pointerId) return;
        if(wheelPress.tear) scene.documents.releaseTear();
        wheelPress=null;
    };
    scene.renderer.domElement.addEventListener('pointercancel',cancelPress);
    scene.renderer.domElement.addEventListener('lostpointercapture',cancelPress);
    updateStatus(); $('begin').disabled = false; $('title-settings').disabled = false;
    updateLoadStatus();
    saveTimer = setInterval(() => { if (mode === 'game' && !reader.open) save(); }, 5000);
} catch (error) {
    scene?.dispose();
    $('load-status').textContent = `旧宅未能载入。请通过 StartGame.bat 启动，并检查浏览器是否支持 WebGL。${error.message ? `（${error.message}）` : ''}`;
    $('load-status').classList.add('fatal'); $('begin').textContent = '载入失败';
}
