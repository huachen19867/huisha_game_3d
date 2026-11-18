(function (global) {
    const game = global.Huisha3D, world = game.WORLD_MAP;
    game.MEMORIES = {
        school: { title: '录取那年', center: [-32, 0], start: { x: -32, z: 3, yaw: Math.PI, pitch: 0 }, color: 0x292319,
            audio: { surface: 'wood', rain: 0, cutoff: 650 } },
        hospital: { title: '病历之前', center: [32, 0], start: { x: 32, z: 3, yaw: Math.PI, pitch: 0 }, color: 0x18252b,
            audio: { surface: 'concrete', rain: 0, cutoff: 650 } },
        crash: { title: '雨夜归途', center: [0, -56], start: { x: 0, z: -50, yaw: Math.PI, pitch: 0 }, color: 0x101923,
            audio: { surface: 'concrete', rain: 0.13, cutoff: 4500 } }
    };
    game.PHONE_PAGES = {
        calls: { title: '通话记录', lines: ['今夜', '21:12', '呼出 → 旧宅', '未接通'],
            text: '二十一时十二分，你给旧宅拨过电话，没有人接。' },
        recording: { title: '本地录音资料', lines: ['本地录音', '母亲', '2016.07.14', '录音文字', '别赶夜路，慢一点。', '灯会给你留着。'],
            text: '屏幕停在本地录音：「母亲，二〇一六年七月十四日。」\n\n录音文字：「别赶夜路，慢一点。灯会给你留着。」' }
    };
    game.DOCUMENTS = {
        school_notice: { title: '录取通知', space: 'school', position: [-2, 0.954, 1], faces: {
            front: { title: '正面 · 录取日期', lines: ['录取通知', '二〇一四年', '七月十日'], text: '二〇一四年七月十日。' },
            back: { title: '背面 · 写给自己的话', lines: ['九月一日到校。', '六点四十，第一班车。', '一张票。'],
                text: '背面是我查的车次：「九月一日到校。六点四十，第一班车。一张票。」我用拇指擦了擦，铅笔字还会蹭掉。' }
        } },
        school_receipt: { title: '家长回执', space: 'school', position: [2, 0.954, -1.5], faces: {
            front: { title: '正面 · 日期与签名', lines: ['家长回执', '二〇一四年', '七月二十日', '家长签字'], signature: '父',
                text: '二〇一四年七月二十日，家长回执上是父亲的签名。' },
            back: { title: '背面 · 父亲的留言', lines: ['明，车钱在缝纫机', '第二个抽屉。', '那天我把你的志愿草表撕了，', '这事是我做错。', '要我送，出门前敲一下门。爸'],
                text: '回执沿虚线撕开了，家里留下的这一联背面有爸的字：「明，车钱在缝纫机第二个抽屉。那天我把你的志愿草表撕了，这事是我做错。要我送，出门前敲一下门。爸」' }
        } },
        hospital_record: { title: '初诊病历', space: 'hospital', position: [2.3, 1.004, -2.95], introducedRevision: 2, style: 'medical', faces: {
            front: { title: '正面 · 初诊日期', lines: ['初诊病历', '二〇一二年', '八月二十三日'], text: '初诊日期：二〇一二年八月二十三日。' },
            back: { title: '背面 · 后续记录', lines: ['后续记录', '反复检查', '长期用药'],
                text: '后续栏里是反复检查与长期用药的记录。那时候，你还没有收到录取通知，更没有离家。' }
        } },
        hospital_plan: { title: '复诊安排', space: 'hospital', position: [-2.8, 1.32, -0.808], rotation: [0, 0, 0], introducedRevision: 2, style: 'medical', faces: {
            front: { title: '正面 · 日期与本人签字', lines: ['复诊安排', '二〇一四年', '八月二十日', '患者本人签字'], signature: '母',
                text: '二〇一四年八月二十日。\n\n患者签字是母亲的名字。' },
            back: { title: '背面 · 复诊与代取药安排', lines: ['九月起本人按月复诊。', '代取药联系人：', '周福生（邻居）。', '联系电话见挂号页。'],
                text: '「九月起本人按月复诊。代取药联系人：周福生（邻居）。联系电话见挂号页。」\n\n周字写小了些，刚好挤进联系人那一格。' }
        } }
    };
    game.MEMORY_CASES = {
        school: { title: '离家前留下了什么记录', records: ['school_notice', 'school_receipt'], requiredFaces: { school_notice: ['front', 'back'], school_receipt: ['front', 'back'] },
            choices: ['回执没有家长签名，背面只重复了“不许离家”', '通知先到，父亲十天后签回执，留了去学校的车钱', '父亲先签回执，十天后你才收到录取通知'], answer: 1,
            facts: [
                { id: 'notice', record: 'school_notice', documentFace: 'front', title: '收到录取通知', quote: '二〇一四年七月十日。' },
                { id: 'receipt', record: 'school_receipt', documentFace: 'front', title: '父亲签下回执', quote: '二〇一四年七月二十日，家长回执上是父亲的签名。' },
                { id: 'rules', record: 'school_rules', title: '记忆里的家规', quote: '黑板上的日期停在你拿到录取通知的那一年。', dated: false }
            ], timelineOrder: ['notice', 'receipt'],
            conclusion: '七月十日，我已经查好了去学校的头班车。十天后爸才签字。他把车钱放进了抽屉。那张被他撕掉的草表，我记得也没错。' },
        hospital: { title: '初诊与复诊记录能确认什么', records: ['hospital_record', 'hospital_plan'], requiredFaces: { hospital_record: ['front'], hospital_plan: ['front', 'back'] },
            choices: ['初诊在二〇一四年，复诊安排由你代签', '二〇一二年初诊；二〇一四年母亲签复诊，邻居可代取药', '初诊在二〇一二年，但复诊安排没有患者签字'], answer: 1,
            facts: [
                { id: 'diagnosis', record: 'hospital_record', documentFace: 'front', title: '初诊记录', quote: '初诊日期：二〇一二年八月二十三日。' },
                { id: 'plan', record: 'hospital_plan', documentFace: 'front', title: '母亲签字安排复诊', quote: '二〇一四年八月二十日。…患者签字是母亲的名字。' },
                { id: 'clock', record: 'hospital_clock', title: '如果早一点回来', quote: '你曾反复想象：如果再早一点回来，会不会不一样。', dated: false }
            ], timelineOrder: ['diagnosis', 'plan'],
            conclusion: '初诊写着二〇一二年，复诊安排写着二〇一四年。我离家上学前，妈已经在看病。九月的复诊她自己签了字，代取药那一栏填的是邻居老周。' },
        crash: { title: '手机与交接单记录了什么', records: ['crash_report', 'crash_phone'],
            choices: ['手机保存的是二〇一六年录音，今夜呼出未接，交接单记录仍有呼吸', '母亲今夜二十一时十二分打来电话，接着发生了事故', '交接单宣告死亡，手机录音是在本次事故后收到的'], answer: 0,
            facts: [
                { id: 'handover', record: 'crash_report', title: '今夜的救护交接', quote: '二〇二六年七月十四日，二十一时十八分。' },
                { id: 'call', record: 'crash_phone', phonePage: 'calls', title: '给旧宅拨出的电话', quote: '二十一时十二分，你给旧宅拨过电话，没有人接。' },
                { id: 'voice', record: 'crash_phone', phonePage: 'recording', title: '手机保存的母亲语音', quote: '屏幕停在本地录音：「母亲，二〇一六年七月十四日。」' }
            ], timelineOrder: ['voice', 'call', 'handover'],
            conclusion: '手机文件是十年前保存的录音。今夜二十一时十二分，是你给旧宅拨出了电话，没有接通；六分钟后的交接单仍记着呼吸与呼名反应。旧录音不是今夜打来的电话。救护灯的另一边，还有人在叫你的名字。' }
    };
    const regions = [], obstacles = [], items = [];
    const add = (space, id, title, x, y, z, text, extra = {}) => {
        const [cx, cz] = game.MEMORIES[space].center;
        items.push({ id, title, location: game.MEMORIES[space].title, space, area: space, position: { x: cx + x, y, z: cz + z }, radius: 1.9,
            requiresWater: true, text, ...extra });
    };
    for (const space of ['school', 'hospital']) {
        const [cx, cz] = game.MEMORIES[space].center;
        regions.push({ id: space, title: game.MEMORIES[space].title, xMin: cx - 4.9, xMax: cx + 4.9, zMin: cz - 4.6, zMax: cz + 4.6, space, requiresState: 'waterSolved' });
        add(space, `${space}_return`, '回到厨房的门', 0, 1.4, 4.1, '门后仍是那间亮着灯的厨房。可以先回去，也可以继续观察。', { journal: false, returnMemory: true });
        obstacles.push({ id: `${space}-return-door`, space, xMin: cx - 0.95, xMax: cx + 0.95, zMin: 4.44, zMax: 4.56 });
    }
    for (const x of [-2, 2]) for (const z of [-1.5, 1]) obstacles.push({ id: `school-desk-${x}-${z}`, space: 'school',
        xMin: -32 + x - 0.65, xMax: -32 + x + 0.65, zMin: z - 0.5, zMax: z + 0.5 });
    for (const x of [-2, 2]) for (const z of [-1.5, 1]) obstacles.push({ id: `school-chair-${x}-${z}`, space: 'school',
        xMin: -32 + x - 0.25, xMax: -32 + x + 0.25, zMin: z + 0.6, zMax: z + 1.1 });
    obstacles.push({ id: 'hospital-wheelchair', space: 'hospital', xMin: 28.4, xMax: 29.5, zMin: -1.7, zMax: -0.6 },
        { id: 'hospital-desk', space: 'hospital', xMin: 33.5, xMax: 36.1, zMin: -3.8, zMax: -2.8 });
    regions.push({ id: 'crash', title: game.MEMORIES.crash.title, xMin: -3.74, xMax: 3.74, zMin: -64, zMax: -48, space: 'crash', requiresState: 'waterSolved' });
    obstacles.push({ id: 'phone-stone', space: 'crash', xMin: -1.925, xMax: -1.375, zMin: -55.075, zMax: -54.525 },
        { id: 'emergency-case', space: 'crash', xMin: 1.3, xMax: 2.1, zMin: -60.825, zMax: -60.175 });
    for (const side of [-1, 1]) obstacles.push({ id: `rescue-post-${side}`, space: 'crash',
        xMin: side * 0.9 - 0.08, xMax: side * 0.9 + 0.08, zMin: -63.08, zMax: -62.92 });
    add('school', 'school_notice', '课桌上的录取通知', -2, 0.96, 1,
        '二〇一四年七月十日。\n\n背面是我查的车次：「九月一日到校。六点四十，第一班车。一张票。」我用拇指擦了擦，铅笔字还会蹭掉。', { deduction: 'school', journal: false });
    add('school', 'school_receipt', '课桌上的家长回执', 2, 0.96, -1.5,
        '二〇一四年七月二十日，家长回执上是父亲的签名。\n\n回执沿虚线撕开了，家里留下的这一联背面有爸的字：「明，车钱在缝纫机第二个抽屉。那天我把你的志愿草表撕了，这事是我做错。要我送，出门前敲一下门。爸」', { deduction: 'school', journal: false });
    add('school', 'school_rules', '黑板旁的旧家规', 0, 1.7, -4.45,
        '六点前回家，不许顶嘴，志愿由父亲决定。\n\n黑板上的日期停在你拿到录取通知的那一年。右下角那一小块擦得发白，我写过要报的学校，刚写了个校名，爸就伸手拿了板擦。', { deduction: 'school' });
    add('hospital', 'hospital_record', '初诊病历', 2.3, 1.02, -2.85,
        '初诊日期：二〇一二年八月二十三日。\n\n后续栏里是反复检查与长期用药的记录。那时候，你还没有收到录取通知，更没有离家。', { deduction: 'hospital', journal: false });
    add('hospital', 'hospital_plan', '母亲签过字的复诊安排', -2.8, 1.32, -0.8,
        '二〇一四年八月二十日。\n\n「九月起本人按月复诊。代取药联系人：周福生（邻居）。联系电话见挂号页。」\n\n患者签字是母亲的名字。周字写小了些，刚好挤进联系人那一格。', { deduction: 'hospital', journal: false });
    add('hospital', 'hospital_clock', '候诊室的钟', 0, 2.1, -4.4,
        '你曾反复想象：如果再早一点回来，会不会不一样。\n\n分针卡在四点二十。我挪了把椅子，站上去看。钟壳背后连电池都没有。', { deduction: 'hospital' });
    obstacles.push({id:'old-bridge-post',space:'crash',xMin:-3.68,xMax:-3.18,zMin:-52.25,zMax:-51.75});
    add('crash','bridge_post','缺角的石桥栏柱',-3.17,.89,4,'车灯照过来，桥柱顶上缺了一角。跟厨房相册里那张一个样。那天我骑到桥那头才回头。爸站在这根柱子旁边，正两手撑着膝盖喘气。');
    add('crash', 'crash_report', '救护交接单', 1.7, 1.05, -4.5,
        '二〇二六年七月十四日，二十一时十八分。\n\n地点：回宅山路弯道，雨后落石。\n伤者姓名与你相同。\n「呼吸存在，呼名反应微弱，继续转运。」\n\n纸角的雨水还没有干。这是今夜的记录。', { deduction: 'crash' });
    add('crash', 'crash_phone', '雨夜的旧手机', -1.65, 0.7, 1.2,
        '二十一时十二分，你给旧宅拨过电话，没有人接。\n\n屏幕停在本地录音：「母亲，二〇一六年七月十四日。」\n\n「别赶夜路，慢一点。灯会给你留着。」\n\n那不是今夜打来的电话，是你一直没舍得删的语音。', { deduction: 'crash', journal: false });
    add('crash', 'crash_return', '回到厨房的旧影', 0, 1.3, 6.8,
        '身后的雨幕里，厨房那盏灯仍在。可以先回去核对其他记录。', { journal: false, returnMemory: true });
    add('crash', 'rescue_light', '另一边的救护灯', 0, 1.2, -7,
        '有人在雨里叫你的名字。母亲的语音已经播完，灯却还在另一边亮着。\n\n这一次，你要朝哪边走？', { journal: false, requiresTruth: true, finalChoice: true });
    world.walkable.push(...regions); world.obstacles.push(...obstacles);
    world.interactables.push({ id: 'memory_album', title: '柜边旧相册', location: '厨房', area: 'kitchen', position: { x: 7.75, y: 1.25, z: -23.86 },
        radius: 1.9, requiresOpen: true, requiresWater: true,
        text: '相册有三处折角：录取那年、病历之前、雨夜归途。\n\n你可以主动翻入一段记忆，也可以先把相册合上。' }, ...items);
})(window);
