(function (global) {
    const copyText=global.HuishaCopy;
    const game = global.Huisha3D, world = game.WORLD_MAP;
    game.MEMORIES = {
        school: { title: copyText('memorymap.school.title'), center: [-32, 0], start: { x: -32, z: 3, yaw: Math.PI, pitch: 0 }, color: 0x292319,
            audio: { surface: 'wood', rain: 0, cutoff: 650 } },
        hospital: { title: copyText('memorymap.hospital.title'), center: [32, 0], start: { x: 32, z: 3, yaw: Math.PI, pitch: 0 }, color: 0x18252b,
            audio: { surface: 'concrete', rain: 0, cutoff: 650 } },
        crash: { title: copyText('memorymap.crash.title'), center: [0, -56], start: { x: 0, z: -50, yaw: Math.PI, pitch: 0 }, color: 0x101923,
            audio: { surface: 'concrete', rain: 0.13, cutoff: 4500 } }
    };
    game.PHONE_PAGES = {
        calls: { title: copyText('memorymap.calls.title'), lines: [copyText('memorymap.calls.lines'), copyText('memorymap.calls.lines.2'), copyText('memorymap.calls.lines.3'), copyText('memorymap.calls.lines.4')],
            text: copyText('memorymap.calls.text') },
        recording: { title: copyText('memorymap.recording.title'), lines: [copyText('memorymap.recording.lines'), copyText('memorymap.recording.lines.2'), copyText('memorymap.recording.lines.3'), copyText('memorymap.recording.lines.4'), copyText('memorymap.recording.lines.5'), copyText('memorymap.recording.lines.6'), copyText('memorymap.recording.lines.7')],
            text: copyText('memorymap.recording.text') }
    };
    game.DOCUMENTS = {
        school_notice: { title: copyText('memorymap.school_notice.title'), space: 'school', position: [-2, 0.954, 1], faces: {
            front: { title: copyText('memorymap.school_notice.title.2'), lines: [copyText('memorymap.school_notice.title'), copyText('memorymap.school_notice.lines'), copyText('memorymap.school_notice.lines.2')], text: copyText('memorymap.school_notice.text') },
            back: { title: copyText('memorymap.school_notice.title.3'), lines: [copyText('memorymap.school_notice.lines.3'), copyText('memorymap.school_notice.lines.4'), copyText('memorymap.school_notice.lines.5')],
                text: copyText('memorymap.school_notice.text.2') }
        } },
        school_draft: { title:copyText('memorymap.school_draft.title'),space:'school',position:[-2,.954,-1.5],style:'torn',faces:{
            front:{title:copyText('memorymap.school_draft.title.2'),lines:[copyText('memorymap.school_draft.lines'),copyText('memorymap.school_draft.lines.2'),copyText('memorymap.school_draft.lines.3'),copyText('memorymap.school_draft.lines.4'),copyText('memorymap.school_draft.lines.5')],
                text:copyText('memorymap.school_draft.text')},
            back:{title:copyText('memorymap.school_draft.title.3'),lines:[],
                text:copyText('memorymap.school_draft.text.2')}
        }},
        school_receipt: { title: copyText('memorymap.school_receipt.title'), space: 'school', position: [2, 0.954, -1.5], faces: {
            front: { title: copyText('memorymap.school_receipt.title.2'), lines: [copyText('memorymap.school_receipt.title'), copyText('memorymap.school_receipt.lines'), copyText('memorymap.school_receipt.lines.2'), copyText('memorymap.school_receipt.lines.3')], signature: copyText('memorymap.school_receipt.signature'),
                text: copyText('memorymap.school_receipt.text') },
            back: { title: copyText('memorymap.school_receipt.title.3'), lines: [copyText('memorymap.school_receipt.lines.4'), copyText('memorymap.school_receipt.lines.5'), copyText('memorymap.school_receipt.lines.6'), copyText('memorymap.school_receipt.lines.7'), copyText('memorymap.school_receipt.lines.8')],
                text: copyText('memorymap.school_receipt.text.2') }
        } },
        hospital_record: { title: copyText('memorymap.hospital_record.title'), space: 'hospital', position: [2.3, 1.004, -3.27], introducedRevision: 2, style: 'medical', faces: {
            front: { title: copyText('memorymap.hospital_record.title.2'), lines: [copyText('memorymap.hospital_record.title'), copyText('memorymap.hospital_record.lines'), copyText('memorymap.hospital_record.lines.2')], text: copyText('memorymap.hospital_record.text') },
            back: { title: copyText('memorymap.hospital_record.title.3'), lines: [copyText('memorymap.hospital_record.lines.3'), copyText('memorymap.hospital_record.lines.4'), copyText('memorymap.hospital_record.lines.5')],
                text: copyText('memorymap.hospital_record.text.2') }
        } },
        hospital_plan: { title: copyText('memorymap.hospital_plan.title'), space: 'hospital', position: [-2.8, 1.32, -0.808], rotation: [0, 0, 0], introducedRevision: 2, style: 'medical', faces: {
            front: { title: copyText('memorymap.hospital_plan.title.2'), lines: [copyText('memorymap.hospital_plan.title'), copyText('memorymap.school_receipt.lines'), copyText('memorymap.hospital_plan.lines'), copyText('memorymap.hospital_plan.lines.2')], signature: copyText('memorymap.hospital_plan.signature'),
                text: copyText('memorymap.hospital_plan.text') },
            back: { title: copyText('memorymap.hospital_plan.title.3'), lines: [copyText('memorymap.hospital_plan.lines.3'), copyText('memorymap.hospital_plan.lines.4'), copyText('memorymap.hospital_plan.lines.5'), copyText('memorymap.hospital_plan.lines.6')],
                text: copyText('memorymap.hospital_plan.text.2') }
        } }
    };
    game.MEMORY_CASES = {
        school: { title: copyText('memorymap.school.title.2'), records: ['school_notice', 'school_receipt'], requiredFaces: { school_notice: ['front', 'back'], school_receipt: ['front', 'back'] },
            choices: [copyText('memorymap.school.choices'), copyText('memorymap.school.choices.2'), copyText('memorymap.school.choices.3')], answer: 1,
            facts: [
                { id: 'notice', record: 'school_notice', documentFace: 'front', title: copyText('memorymap.notice.title'), quote: copyText('memorymap.notice.quote') },
                { id: 'receipt', record: 'school_receipt', documentFace: 'front', title: copyText('memorymap.receipt.title'), quote: copyText('memorymap.school_receipt.text') },
                { id: 'rules', record: 'school_rules', title: copyText('memorymap.rules.title'), quote: copyText('memorymap.rules.quote'), dated: false }
            ], timelineOrder: ['notice', 'receipt'],
            conclusion: copyText('memorymap.school.conclusion') },
        hospital: { title: copyText('memorymap.hospital.title.2'), records: ['hospital_record', 'hospital_plan'], requiredFaces: { hospital_record: ['front'], hospital_plan: ['front', 'back'] },
            choices: [copyText('memorymap.hospital.choices'), copyText('memorymap.hospital.choices.2'), copyText('memorymap.hospital.choices.3')], answer: 1,
            facts: [
                { id: 'diagnosis', record: 'hospital_record', documentFace: 'front', title: copyText('memorymap.diagnosis.title'), quote: copyText('memorymap.hospital_record.text') },
                { id: 'plan', record: 'hospital_plan', documentFace: 'front', title: copyText('memorymap.plan.title'), quote: copyText('memorymap.plan.quote') },
                { id: 'clock', record: 'hospital_clock', title: copyText('memorymap.clock.title'), quote: copyText('memorymap.clock.quote'), dated: false }
            ], timelineOrder: ['diagnosis', 'plan'],
            conclusion: copyText('memorymap.hospital.conclusion') },
        crash: { title: copyText('memorymap.crash.title.2'), records: ['crash_report', 'crash_phone'],
            choices: [copyText('memorymap.crash.choices'), copyText('memorymap.crash.choices.2'), copyText('memorymap.crash.choices.3')], answer: 0,
            facts: [
                { id: 'handover', record: 'crash_report', title: copyText('memorymap.handover.title'), quote: copyText('memorymap.handover.quote') },
                { id: 'call', record: 'crash_phone', phonePage: 'calls', title: copyText('memorymap.call.title'), quote: copyText('memorymap.calls.text') },
                { id: 'voice', record: 'crash_phone', phonePage: 'recording', title: copyText('memorymap.voice.title'), quote: copyText('memorymap.voice.quote') }
            ], timelineOrder: ['voice', 'call', 'handover'],
            conclusion: copyText('memorymap.crash.conclusion') }
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
        add(space, `${space}_return`, copyText('memorymap.text'), 0, 1.4, 4.1, copyText('memorymap.text.2'), { journal: false, returnMemory: true });
        obstacles.push({ id: `${space}-return-door`, space, xMin: cx - 0.95, xMax: cx + 0.95, zMin: 4.44, zMax: 4.56 });
    }
    for (const x of [-2, 2]) for (const z of [-1.5, 1]) obstacles.push({ id: `school-desk-${x}-${z}`, space: 'school',
        xMin: -32 + x - 0.65, xMax: -32 + x + 0.65, zMin: z - 0.5, zMax: z + 0.5 });
    for (const x of [-2, 2]) for (const z of [-1.5, 1]) obstacles.push({ id: `school-chair-${x}-${z}`, space: 'school',
        xMin: -32 + x - 0.25, xMax: -32 + x + 0.25, zMin: z + 0.6, zMax: z + 1.1 });
    obstacles.push({ id: 'hospital-bench', space: 'hospital', xMin: 29.72, xMax: 31.68, zMin: -4.57, zMax: -3.91 },
        { id: 'hospital-wheelchair', space: 'hospital', xMin: 28.4, xMax: 29.5, zMin: -1.7, zMax: -0.6 },
        { id: 'hospital-desk', space: 'hospital', xMin: 33.425, xMax: 35.975, zMin: -4.74, zMax: -2.94 });
    regions.push({ id: 'crash', title: game.MEMORIES.crash.title, xMin: -3.74, xMax: 3.74, zMin: -64, zMax: -48, space: 'crash', requiresState: 'waterSolved' });
    obstacles.push({ id: 'emergency-case', space: 'crash', xMin: 1.02, xMax: 2.38, zMin: -60.825, zMax: -60.175 });
    for (const side of [-1, 1]) obstacles.push({ id: `rescue-post-${side}`, space: 'crash',
        xMin: side * 0.9 - 0.08, xMax: side * 0.9 + 0.08, zMin: -63.08, zMax: -62.92 });
    add('school', 'school_notice', copyText('memorymap.school'), -2, 0.96, 1,
        Object.values(game.DOCUMENTS.school_notice.faces).map(face=>face.text).join('\n\n'), { deduction: 'school', journal: false });
    add('school','school_draft',copyText('memorymap.school.2'),-2,.96,-1.5,
        Object.values(game.DOCUMENTS.school_draft.faces).map(face=>face.text).join('\n\n'),{deduction:'school',journal:false});
    add('school', 'school_receipt', copyText('memorymap.school.3'), 2, 0.96, -1.5,
        copyText('memorymap.school.4'), { deduction: 'school', journal: false });
    add('school', 'school_rules', copyText('memorymap.school.5'), 0, 1.7, -4.45,
        copyText('memorymap.school.6'), { deduction: 'school' });
    add('hospital', 'hospital_record', copyText('memorymap.hospital_record.title'), 2.3, 1.02, -3.22,
        copyText('memorymap.hospital'), { deduction: 'hospital', journal: false });
    add('hospital', 'hospital_plan', copyText('memorymap.hospital.2'), -2.8, 1.32, -0.8,
        copyText('memorymap.hospital.3'), { deduction: 'hospital', journal: false });
    add('hospital', 'hospital_clock', copyText('memorymap.hospital.4'), 0, 2.1, -4.4,
        copyText('memorymap.hospital.5'), { deduction: 'hospital' });
    add('hospital', 'hospital_fare', copyText('memorymap.hospital.6'), -1.3, .54, -4.16,
        copyText('memorymap.hospital.7'), { deduction: 'hospital', journal: false });
    obstacles.push({id:'old-bridge-post',space:'crash',xMin:-3.68,xMax:-3.18,zMin:-52.25,zMax:-51.75});
    obstacles.push({id:'accident-wagon',space:'crash',xMin:-4.89,xMax:-.42,zMin:-57.07,zMax:-54.92});
    obstacles.push({id:'rescue-cot',space:'crash',xMin:-.36,xMax:.36,zMin:-63.91,zMax:-62.03});
    add('crash','crash_belt',copyText('memorymap.crash'),-2.53,1.0,.97,copyText('memorymap.crash.2'));
    add('crash','bridge_post',copyText('memorymap.crash.3'),-3.17,.89,4,copyText('memorymap.crash.4'));
    add('crash', 'crash_report', copyText('memorymap.crash.5'), 2.03, 1.05, -4.5,
        copyText('memorymap.crash.6'), { deduction: 'crash' });
    add('crash', 'crash_phone', copyText('memorymap.crash.7'), 1.285, 1.04, -4.5,
        Object.values(game.PHONE_PAGES).map(page=>page.text).join('\n\n'), { deduction: 'crash', journal: false });
    add('crash', 'crash_return', copyText('memorymap.crash.8'), 0, 1.3, 6.8,
        copyText('memorymap.crash.9'), { journal: false, returnMemory: true });
    add('crash', 'rescue_light', copyText('memorymap.crash.10'), 0, 1.2, -7,
        copyText('memorymap.crash.11'), { journal: false, requiresTruth: true, finalChoice: true });
    world.walkable.push(...regions); world.obstacles.push(...obstacles);
    world.interactables.push({ id: 'memory_album', title: copyText('memorymap.memory_album.title'), location: copyText('courtyardmap.kitchen.title'), area: 'kitchen', position: { x: 7.75, y: 1.25, z: -23.86 },
        radius: 1.9, requiresOpen: true, requiresWater: true,
        text: copyText('memorymap.memory_album.text') }, ...items);
})(window);
