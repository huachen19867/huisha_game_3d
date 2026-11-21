(function (global) {
    const copyText=global.HuishaCopy;
    const game = global.Huisha3D || (global.Huisha3D = {});
    game.PORTRAIT_BACK_RECORD = { id: 'portrait_back', title: copyText('housemap.portrait_back.title'), location: copyText('evidencejournal.location.2'), area: 'hall',
        text: copyText('housemap.portrait_back.text') };
    game.MAIN_HALL_MAP = {
        id: 'homecoming',
        playerStart: { x: 0, y: 1.6, z: 3.4, yaw: Math.PI },
        roadStart: { x: 0.15, z: 31.1, yaw: 3.13, pitch: -0.035 },
        playerRadius: 0.25,
        door: { handleX:1.17,handleZ:.30,hingeX: -1.17, hingeZ: -11.5, width: 2.34, thickness: 0.18, frontDepth: 0.6, openAngle: Math.PI / 2 },
        extraDoors: [{ id:'front', handleX:1.45,handleZ:.17,stateField:'arrival', openValue:'home', hingeX:-1, hingeZ:4.42, width:2, thickness:.2, frontDepth:.15, openAngle:Math.PI/2 }],
        walkable: [
            { id: 'hall', title: copyText('evidencejournal.location.2'), xMin: -4.8, xMax: 4.8, zMin: -4.1, zMax: 4.2 },
            { id: 'corridor', title: copyText('evidencejournal.location'), xMin: -1.25, xMax: 1.25, zMin: -11.5, zMax: -3.3 },
            { id: 'path', title: copyText('housemap.path.title'), mapLabel: copyText('housemap.path.maplabel'), xMin: -1.25, xMax: 1.25, zMin: -14.5, zMax: -10.9, requiresState: 'opened' },
            { id: 'stone_court', title:copyText('housemap.stone_court.title'), xMin:-3.56,xMax:3.56,zMin:-14.08,zMax:-11.67,requiresState:'opened' },
            { id: 'porch', title: copyText('housemap.porch.title'), xMin: -1, xMax: 1, zMin: 4.2, zMax: 5.1 },
            { id: 'lane', title: copyText('housemap.lane.title'), xMin: -3.6, xMax: 3.6, zMin: 5.1, zMax: 34 }
        ],
        obstacles: [
            ...[-1,1].flatMap(side=>[
                {id:'path-stone-post'+side,xMin:side*1.2-.18,xMax:side*1.2+.18,zMin:-14.38,zMax:-14.02},
                {id:'path-curb'+side,xMin:side*1.2-.12,xMax:side*1.2+.12,zMin:-14,zMax:-11.7,height:.13}
            ]),
            { id: 'parked-car', xMin: -3.15, xMax: -1.15, zMin: 27.5, zMax: 31.9 },
            { id: 'repair-sign', xMin: -3.56, xMax: -3.42, zMin: 11.085, zMax: 11.915 },
            { id: 'duty-counter', xMin: 2.6, xMax: 3.6, zMin: 19.8, zMax: 22.2 },
            { id: 'fallen-timber', xMin: -3.6, xMax: 0.9, zMin: 15.89, zMax: 16.37, height: 0.36 },
            { id: 'altar', xMin: -4, xMax: -1.5, zMin: -3.7, zMax: -2.6 },
            { id: 'cabinet', xMin: 2.65, xMax: 4.15, zMin: -3.85, zMax: -2.95 },
            { id: 'coffin', xMin: -1.4, xMax: 1.4, zMin: -0.15, zMax: 1.35 },
            { id: 'chair_left', xMin: -3.9, xMax: -3.1, zMin: 0.4, zMax: 1.2 },
            { id: 'chair_right', xMin: 3.1, xMax: 3.9, zMin: 0.4, zMax: 1.2 },
            { id: 'pillar_left', xMin: -4.35, xMax: -3.85, zMin: -1.75, zMax: -1.25 },
            { id: 'pillar_right', xMin: 3.85, xMax: 4.35, zMin: -1.75, zMax: -1.25 }
        ],
        interactables: [
            { id:'wiper_print',title:copyText('housemap.wiper_print.title'),area:'lane',location:copyText('housemap.wiper_print.location'),position:{x:-1.71,y:1.095,z:28.90},radius:2.1,
                text:copyText('housemap.wiper_print.text') },
            {id:'glass_impression',title:copyText('mask.sampleTitle'),inventoryOnly:true,area:'lane',location:copyText('housemap.wiper_print.location'),
                position:{x:-1.71,y:1.095,z:28.90},text:copyText('mask.sampleText')},
            { id: 'car_envelope', title: copyText('housemap.car_envelope.title'), inventoryOnly: true, location: copyText('housemap.wiper_print.location'), area: 'lane', position: {x: -1.11, y: 1.08, z: 29.8}, radius: 2.4,
                text: copyText('housemap.car_envelope.text') },
            { id:'forwarding_slip', title:copyText('housemap.forwarding_slip.title'), inventoryOnly:true, location:copyText('housemap.wiper_print.location'), area:'lane', position:{x:2.98,y:1.08,z:21.15},
                text:copyText('housemap.forwarding_slip.text') },
            { id:'bridge_call', title:copyText('clerk.bridgeCallTitle'), inventoryOnly:true, area:'lane', location:copyText('housemap.clerk_holdall.location'),
                position:{x:3.20,y:1.64,z:20.38}, text:copyText('clerk.bridgeCall') },
            { id:'repair_order',title:copyText('workorder.title'),area:'lane',location:copyText('housemap.clerk_holdall.location'),
                position:{x:2.87,y:1.07,z:20.22},radius:1.90,text:copyText('workorder.face') },
            { id: 'clerk', title: copyText('housemap.clerk.title'), location: copyText('housemap.wiper_print.location'), area: 'lane', position: {x:3.20,y:1.64,z:20.38}, radius:2.65,
                text: copyText('housemap.clerk.text') },
            { id: 'duty_book', title: copyText('housemap.duty_book.title'), area: 'lane', position: {x: 2.62, y: 1.1, z: 21.1}, radius: 2.2,
                text: copyText('housemap.duty_book.text',copyText('main.presentrecord.text')) },
            { id: 'key_board', title: copyText('housemap.key_board.title'), area: 'lane', position: {x: 3.38, y: 1.58, z: 21.82}, radius: 2.5,
                text: copyText('housemap.key_board.text') },
            { id: 'front_gate', title: copyText('housemap.front_gate.title'), area: 'porch', position: {x: 0.45, y: 1.27, z: 4.61}, radius: 2,
                text: copyText('housemap.front_gate.text') },
            { id: 'letter', title: copyText('housemap.letter.title'), position: { x: 2.65, y: 1.1, z: 3.95 }, radius: 1.85,
                text: copyText('housemap.letter.text') },
            { id: 'altar', title: copyText('housemap.altar.title'), position: { x: -2.75, y: 1.18, z: -2.7 }, radius: 1.8,
                text: copyText('housemap.altar.text') },
            { id:'uniform_collar', title:copyText('housemap.uniform_collar.title'), area:'hall', location:copyText('evidencejournal.location.2'), inventoryOnly:true, position:{x:0,y:.82,z:.65},
                text:copyText('housemap.uniform_collar.text',copyText('main.inspectuniform')) },
            { id:'uniform_cuff', title:copyText('housemap.uniform_cuff.title'), area:'hall', location:copyText('housemap.uniform_cuff.location'), inventoryOnly:true, position:{x:0,y:.82,z:.65},
                text:copyText('housemap.uniform_cuff.text') },
            { id:'clerk_holdall', title:copyText('housemap.clerk_holdall.title'), area:'lane', location:copyText('housemap.clerk_holdall.location'), inventoryOnly:true, position:{x:3.2,y:1.64,z:20.38},
                text:copyText('housemap.clerk_holdall.text') },
            { id:'clerk_cuff', title:copyText('housemap.clerk_cuff.title'), area:'lane', location:copyText('housemap.clerk_holdall.location'), inventoryOnly:true, position:{x:3.2,y:1.64,z:20.38},
                text:copyText('housemap.clerk_cuff.text') },
            { id:'bend_photo', title:copyText('housemap.bend_photo.title'), area:'hall', location:copyText('evidencejournal.location.2'), inventoryOnly:true, position:{x:0,y:.82,z:.65},
                text:copyText('housemap.bend_photo.text') },
            { id: 'coffin', title: copyText('housemap.coffin.title'), position: { x: 0, y: 0.86, z: 0.65 }, radius: 2.25,
                text: copyText('housemap.coffin.text') },
            { id: 'portrait', title: copyText('housemap.portrait.title'), position: { x: -2.75, y: 1.9, z: -3.87 }, radius: 2.1,
                text: copyText('housemap.portrait.text') },
            { id: 'wall_marks', title: copyText('housemap.wall_marks.title'), position: { x: 1.1, y: 1.45, z: -7.1 }, radius: 1.65,
                text: copyText('housemap.wall_marks.text') },
            { id: 'height_stitch', title: copyText('housemap.height_stitch.title'), area: 'corridor', location: copyText('housemap.height_stitch.location'), inventoryOnly: true, position: {x:1.1,y:1.45,z:-7.1},
                text: copyText('housemap.height_stitch.text') },
            { id: 'lock', title: copyText('housemap.lock.title'), position: { x: 0, y: 1.42, z: -11.19 }, radius: 1.8,
                text: copyText('housemap.lock.text') },
            { id: 'threshold', title: copyText('housemap.threshold.title'), position: { x: 0, y: 1.25, z: -13.9 }, radius: 1.8,
                text: copyText('housemap.threshold.text'), requiresOpen: true }
        ]
    };
    for (const [area, ids] of Object.entries({ hall: ['letter', 'altar', 'coffin', 'portrait'], corridor: ['wall_marks', 'lock'], path: ['threshold'] })) {
        for (const id of ids) game.MAIN_HALL_MAP.interactables.find(item => item.id === id).area = area;
    }
})(window);
