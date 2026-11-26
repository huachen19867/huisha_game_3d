(function (global) {
    const copyText=global.HuishaCopy;
    const game = global.Huisha3D;
    const hall = game.MAIN_HALL_MAP;
    function letterFace(inkKey, observationKey) {
        const writing=copyText(inkKey), observation=copyText(observationKey);
        return {writing, observation, text:writing+'\n\n'+observation};
    }
    game.WORLD_MAP = {
        ...hall,
        audioZones: [
            { xMin: -4, xMax: 4, zMin: 4.5, zMax: 35, audio: { surface: 'concrete', rain: 0.14, cutoff: 3600 } },
            { xMin: 6, xMax: 11, zMin: -25, zMax: -17, audio: { surface: 'wood', rain: 0.05, cutoff: 1000 } },
            { xMin: -6, xMax: 6, zMin: -27.5, zMax: -14, audio: { surface: 'concrete', rain: 0.12, cutoff: 3600 } },
            { xMin: -2, xMax: 2, zMin: -46, zMax: -27.5, audio: { surface: 'concrete', rain: 0.1, cutoff: 4500 } }
        ],
        extraDoors: [...hall.extraDoors, { id: 'yard', handleX:1,handleZ:.30,stateField: 'waterSolved', hingeX: -1, hingeZ: -27.5, width: 2,
            thickness: 0.16, frontDepth: 0.25, openAngle: Math.PI / 2 }],
        walkable: [...hall.walkable,
            { id: 'yard', title: copyText('courtyardmap.yard.title'), xMin: -5.8, xMax: 5.8, zMin: -27.2, zMax: -13.8, requiresState: 'opened' },
            { id: 'kitchen', title: copyText('courtyardmap.kitchen.title'), xMin: 5, xMax: 10.8, zMin: -24.7, zMax: -17.7, requiresState: 'opened' },
            { id: 'road', title: copyText('courtyardmap.road.title'), mapLabel: copyText('courtyardmap.road.maplabel'), xMin: -1.25, xMax: 1.25, zMin: -46, zMax: -26.5, requiresState: 'waterSolved' }
        ],
        obstacles: [...hall.obstacles,
            {id:'kitchen-stool',xMin:6.22,xMax:6.57,zMin:-20.49,zMax:-20.11,height:.32},
            { id: 'yard-front-left', xMin: -6.1, xMax: -1.375, zMin: -14.2, zMax: -14 },
            { id: 'yard-front-right', xMin: 1.375, xMax: 6.1, zMin: -14.2, zMax: -14 },
            { id: 'yard-wall-north', xMin: 5.9, xMax: 6.1, zMin: -27.4, zMax: -23.5 },
            { id: 'yard-wall-south', xMin: 5.9, xMax: 6.1, zMin: -19.5, zMax: -14 },
            { id: 'well', xMin: -3.8, xMax: -2.2, zMin: -22.8, zMax: -21.2 },
            { id: 'water-table', xMin: 7.1, xMax: 9.9, zMin: -23.3, zMax: -22 },
            { id: 'water-tank', xMin: 9.95, xMax: 10.65, zMin: -23.5, zMax: -22.5 },
            { id: 'water-sink', xMin: 6.47, xMax: 7.13, zMin: -22.77, zMax: -22.03 },
            { id: 'open-drawer', xMin: 7.95, xMax: 9.05, zMin: -22.25, zMax: -21.5, requiresState: 'waterSolved', pushForward: true },
            { id: 'kitchen-cabinet', xMin: 7, xMax: 8.5, zMin: -24.65, zMax: -23.9 },
            { id: 'kitchen-stove', xMin: 9.3, xMax: 10.65, zMin: -19.3, zMax: -18 },
            ...[-1, 1].flatMap(side => Array.from({ length: 4 }, (_, i) => ({ id: `yard-post-${side}-${i}`,
                xMin: side * 4.75 - 0.09, xMax: side * 4.75 + 0.09, zMin: -16 - i * 3.1 - 0.09, zMax: -16 - i * 3.1 + 0.09 })))
        ],
        interactables: [...hall.interactables,
            {id:'well_seat',title:copyText('well.seat.title'),location:copyText('courtyardmap.kitchen.title'),requiresOpen:true,journal:false,
                position:{x:6.40,y:.32,z:-20.30},radius:2.15,text:copyText('well.seat.inspect')},
            {id:'well_doorway_call',title:copyText('well.call.title'),location:copyText('courtyardmap.kitchen.title'),inventoryOnly:true,
                position:{x:6.40,y:.32,z:-20.30},text:copyText('well.call.seen')},
            {id:'well_seat_memory',title:copyText('well.seat.memoryTitle'),location:copyText('courtyardmap.kitchen.title'),inventoryOnly:true,
                position:{x:6.40,y:.32,z:-20.30},text:copyText('well.seat.memory')},
            {id:'paper_mask',title:copyText('courtyardmap.paper_mask.title'),area:'yard',location:copyText('courtyardmap.yard.title'),requiresOpen:true,requiresState:'crossedYard',position:{x:5.78,y:.21,z:-19.15},radius:2.1,
                text:copyText('courtyardmap.paper_mask.text') },
            {id:'mask_strap',title:copyText('courtyardmap.mask_strap.title'),area:'yard',location:copyText('courtyardmap.yard.title'),requiresState:'crossedYard',inventoryOnly:true,position:{x:5.78,y:.21,z:-19.15},
                text:copyText('courtyardmap.mask_strap.text') },
            {id:'mask_photo',title:copyText('mask.photoTitle'),area:'yard',location:copyText('courtyardmap.yard.title'),inventoryOnly:true,
                position:{x:5.78,y:.21,z:-19.15},text:copyText('mask.photoText')},
            {id:'mask_transfer',title:copyText('courtyardmap.mask_transfer.title'),area:'yard',location:copyText('courtyardmap.mask_transfer.location'),inventoryOnly:true,position:{x:5.78,y:.21,z:-19.15},
                text:copyText('courtyardmap.mask_transfer.text') },
            { id: 'yard_well', title: copyText('courtyardmap.yard_well.title'), location: copyText('courtyardmap.yard.title'), position: { x: -3, y: 0.92, z: -21.5 }, radius: 2,
                requiresOpen: true, text: copyText('courtyardmap.yard_well.text') },
            { id:'well_scrap',title:copyText('well.scrap.title'),location:copyText('courtyardmap.yard.title'),inventoryOnly:true,
                position:{x:-3.14,y:.881,z:-21.36},text:copyText('well.scrap.text') },
            { id:'scrap_binding',title:copyText('well.scrap.backTitle'),location:copyText('well.scrap.name'),inventoryOnly:true,journal:false,
                text:copyText('well.scrap.binding') },
            { id:'scrap_and_mask',title:copyText('well.scrap.pairTitle'),location:copyText('courtyardmap.paper_mask.title'),area:'yard',inventoryOnly:true,
                position:{x:5.78,y:.21,z:-19.15},text:copyText('well.scrap.pairText') },
            { id:'well_grip', title:copyText('well.grip.title'), area:'yard', location:copyText('courtyardmap.yard.title'),
                position:{x:-2.09,y:1.47,z:-22.12}, radius:1.75, requiresOpen:true, journal:false, text:copyText('well.grip.memory') },
            { id: 'kitchen_note', title: copyText('courtyardmap.kitchen_note.title'), location: copyText('courtyardmap.kitchen.title'), position: { x: 9.45, y: .899, z: -22.204 }, radius: 1.8,
                requiresOpen: true, text: copyText('courtyardmap.kitchen_note.text') },
            { id: 'water_station', title: copyText('courtyardmap.water_station.title'), location: copyText('courtyardmap.kitchen.title'), position: { x: 8.5, y: 1.25, z: -22 }, radius: 2,
                requiresOpen: true, text: copyText('courtyardmap.water_station.text') },
            { id: 'medicine_letter', title: copyText('courtyardmap.medicine_letter.title'), location: copyText('courtyardmap.kitchen.title'), position: { x: 8.5, y: 0.63, z: -21.9 }, radius: 1.7,
                journal:false, requiresOpen:true, requiresWater:true, ...letterFace('family.motherInk','courtyardmap.medicine_letter.text') },
            { id:'family_reply',title:copyText('family.replyTitle'),location:copyText('courtyardmap.kitchen.title'),area:'kitchen',inventoryOnly:true,
                position:{x:8.5,y:.63,z:-21.9},requiresOpen:true,requiresWater:true,...letterFace('family.replyInk','family.replyText') },
            { id:'family_reply_sent',title:copyText('family.sentTitle'),location:copyText('family.sentLocation'),inventoryOnly:true,journal:false,
                text:copyText('family.sentText') },
            { id:'family_stub',title:copyText('family.stubTitle'),location:copyText('courtyardmap.kitchen.title'),area:'kitchen',inventoryOnly:true,
                position:{x:8.5,y:.63,z:-21.9},requiresOpen:true,requiresWater:true,text:copyText('family.stub') },
            { id: 'yard_gate', title: copyText('courtyardmap.yard_gate.title'), location: copyText('courtyardmap.yard.title'), position: { x: 0, y: 1.35, z: -27.2 }, radius: 1.8,
                requiresOpen: true, text: copyText('courtyardmap.yard_gate.text') },
            { id: 'bus_notice', title: copyText('courtyardmap.bus_notice.title'), location: copyText('courtyardmap.bus_notice.location'), position: {x: .99,y: 1.55,z:-31.2}, radius: 2.2,
                requiresOpen:true, requiresWater:true, text:copyText('courtyardmap.bus_notice.text') },
            { id: 'stop_signal', title: copyText('courtyardmap.stop_signal.title'), location: copyText('courtyardmap.bus_notice.location'), position: {x:-.9,y:1.35,z:-40.5}, radius:2,
                requiresOpen:true, requiresWater:true, text:copyText('courtyardmap.stop_signal.text') },
            { id:'bridge_driver_time',title:copyText('bridge.timeTitle'),location:copyText('courtyardmap.bus_notice.location'),inventoryOnly:true,
                position:{x:0,y:1.2,z:-44.7},text:copyText('bridge.timeText') },
            { id:'bridge_driver',title:copyText('bus.bridgeTitle'),location:copyText('courtyardmap.bus_notice.location'),inventoryOnly:true,
                position:{x:0,y:1.2,z:-44.7},text:copyText('bus.bridgeAnswer') },
            { id: 'road_exit', title: copyText('courtyardmap.road_exit.title'), location: copyText('courtyardmap.bus_notice.location'), position: { x: 0, y: 1.2, z: -44.7 }, radius: 1.8,
                requiresOpen: true, requiresWater: true, text: copyText('courtyardmap.road_exit.text') }
        ]
    };
    for (const item of game.WORLD_MAP.interactables) {
        if (item.location) item.area = { '雨庭': 'yard', '厨房': 'kitchen', '归路': 'road' }[item.location] || item.area;
    }
})(window);
