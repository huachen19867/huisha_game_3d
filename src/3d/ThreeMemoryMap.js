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
    game.MEMORY_CASES = {
        school: { title: '离家意味着什么', records: ['school_notice', 'school_receipt'],
            choices: ['留下才算尽孝，离家就是背叛', '离家读书不等于遗弃，父亲也承认了自己的控制', '父亲签过字，过去的伤害就不存在了'], answer: 1,
            facts: [
                { id: 'notice', record: 'school_notice', title: '收到录取通知', quote: '二〇一四年七月十日。' },
                { id: 'receipt', record: 'school_receipt', title: '父亲签下回执', quote: '二〇一四年七月二十日，家长回执上是父亲的签名。' },
                { id: 'rules', record: 'school_rules', title: '记忆里的家规', quote: '黑板上的日期停在你拿到录取通知的那一年。', dated: false }
            ], timelineOrder: ['notice', 'receipt'],
            conclusion: '录取通知和父亲回执上的签名属于同一年。你有权离开，父亲也曾承认把担心说成了命令。这份迟来的承认不能抹掉伤害，但离家读书不是你的罪。' },
        hospital: { title: '病情始于哪一天', records: ['hospital_record', 'hospital_plan'],
            choices: ['你离家后，母亲才第一次生病', '病情早于离家，母亲知情安排过后续治疗', '只要你没有离开，病就一定能治好'], answer: 1,
            facts: [
                { id: 'diagnosis', record: 'hospital_record', title: '初诊记录', quote: '初诊日期：二〇一二年八月二十三日。' },
                { id: 'plan', record: 'hospital_plan', title: '母亲签字安排复诊', quote: '二〇一四年八月二十日。…患者签字是母亲的名字。' },
                { id: 'clock', record: 'hospital_clock', title: '如果早一点回来', quote: '你曾反复想象：如果再早一点回来，会不会不一样。', dated: false }
            ], timelineOrder: ['diagnosis', 'plan'],
            conclusion: '初诊是二〇一二年，离家是二〇一四年。复诊安排上有母亲自己的签字。疾病并不由你的离家开始，也没有一份记录能证明留下就一定能救回她。' },
        crash: { title: '今夜谁还在等你', records: ['crash_report', 'crash_phone'],
            choices: ['你在事故后仍有生命体征，老宅在重复旧记忆', '母亲打来电话，把你带来陪葬', '已经宣告死亡，只能留在旧宅'], answer: 0,
            facts: [
                { id: 'handover', record: 'crash_report', title: '今夜的救护交接', quote: '二〇二六年七月十四日，二十一时十八分。' },
                { id: 'call', record: 'crash_phone', phonePage: 'calls', title: '给旧宅拨出的电话', quote: '二十一时十二分，你给旧宅拨过电话，没有人接。' },
                { id: 'voice', record: 'crash_phone', phonePage: 'recording', title: '手机保存的母亲语音', quote: '屏幕停在本地录音：「母亲，二〇一六年七月十四日。」' }
            ], timelineOrder: ['voice', 'call', 'handover'],
            conclusion: '手机播放的是十年前保存的语音，救护交接单却写着今夜、你的名字和“仍有呼吸”。这座宅子把旧日的声音接在了一起。救护灯的另一边，还有人正在叫你。' }
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
    regions.push({ id: 'crash', title: game.MEMORIES.crash.title, xMin: -3.5, xMax: 3.5, zMin: -64, zMax: -48, space: 'crash', requiresState: 'waterSolved' });
    obstacles.push({ id: 'phone-stone', space: 'crash', xMin: -1.925, xMax: -1.375, zMin: -55.075, zMax: -54.525 },
        { id: 'emergency-case', space: 'crash', xMin: 1.3, xMax: 2.1, zMin: -60.825, zMax: -60.175 });
    for (const side of [-1, 1]) obstacles.push({ id: `rescue-post-${side}`, space: 'crash',
        xMin: side * 0.9 - 0.08, xMax: side * 0.9 + 0.08, zMin: -63.08, zMax: -62.92 });
    add('school', 'school_notice', '课桌上的录取通知', -2, 0.96, 1,
        '二〇一四年七月十日。\n\n录取通知背面是你写给自己的话：「九月去外地。第一次，我想自己选。」\n\n你把它藏进课桌，仿佛一个属于自己的决定也需要被藏起来。', { deduction: 'school' });
    add('school', 'school_receipt', '家长回执的背面', 2, 0.96, -1.5,
        '二〇一四年七月二十日，家长回执上是父亲的签名。\n\n背面写着：「我把担心说成了命令。那些话伤了你，不能算作是为你好。你去读书，钱的事我再想办法。」\n\n这张纸后来夹在母亲的相册里。', { deduction: 'school' });
    add('school', 'school_rules', '黑板旁的旧家规', 0, 1.7, -4.45,
        '六点前回家，不许顶嘴，志愿由父亲决定。\n\n背过的句子仍在，但黑板上的日期停在你拿到录取通知的那一年。记忆没有替谁把这些命令擦掉。', { deduction: 'school' });
    add('hospital', 'hospital_record', '初诊病历', 2.3, 1.02, -2.85,
        '初诊日期：二〇一二年八月二十三日。\n\n后续栏里是反复检查与长期用药的记录。那时候，你还没有收到录取通知，更没有离家。', { deduction: 'hospital' });
    add('hospital', 'hospital_plan', '母亲签过字的复诊安排', -2.8, 1.32, -0.8,
        '二〇一四年八月二十日。\n\n「九月起孩子在外地读书。本人知情，按月复诊；必要时由邻居代取药。」\n\n患者签字是母亲的名字。旁边另写着：「别把治病也当成你的考试。」', { deduction: 'hospital' });
    add('hospital', 'hospital_clock', '候诊室的钟', 0, 2.1, -4.4,
        '你曾反复想象：如果再早一点回来，会不会不一样。\n\n钟面却没有哪一格写着“保证来得及”。可以拿记录核对发生过的事，不必把猜想当成证据。', { deduction: 'hospital' });
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
