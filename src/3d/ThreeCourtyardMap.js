(function (global) {
    const game = global.Huisha3D;
    const hall = game.MAIN_HALL_MAP;
    game.WORLD_MAP = {
        ...hall,
        audioZones: [
            { xMin: 6, xMax: 11, zMin: -25, zMax: -17, audio: { surface: 'wood', rain: 0.05, cutoff: 1000 } },
            { xMin: -6, xMax: 6, zMin: -27.5, zMax: -14, audio: { surface: 'concrete', rain: 0.12, cutoff: 3600 } },
            { xMin: -2, xMax: 2, zMin: -33, zMax: -27.5, audio: { surface: 'concrete', rain: 0.1, cutoff: 4500 } }
        ],
        extraDoors: [{ id: 'yard', stateField: 'waterSolved', hingeX: -1, hingeZ: -27.5, width: 2,
            thickness: 0.16, frontDepth: 0.25, openAngle: Math.PI / 2 }],
        walkable: [...hall.walkable,
            { xMin: -5.8, xMax: 5.8, zMin: -27.2, zMax: -13.8, requiresState: 'opened' },
            { xMin: 5, xMax: 10.8, zMin: -24.7, zMax: -17.7, requiresState: 'opened' },
            { xMin: -1.25, xMax: 1.25, zMin: -32, zMax: -26.5, requiresState: 'waterSolved' }
        ],
        obstacles: [...hall.obstacles,
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
            { id: 'yard_well', title: '雨庭旧井', location: '雨庭', position: { x: -3, y: 0.92, z: -21.5 }, radius: 2,
                requiresOpen: true, text: '井沿磨出了两道提桶的凹槽，一宽一窄。水面映着厨房的灯。\n\n母亲曾让你把三升、五升提桶里的水倒来倒去。你只记得，那时候做错了，也不必重新打水。' },
            { id: 'kitchen_note', title: '灶旁校秤纸', location: '厨房', position: { x: 10.45, y: 1.55, z: -18.2 }, radius: 1.8,
                requiresOpen: true, text: '父亲留在灶边的字条：\n\n「大桶五升，小桶三升。四升水压秤，旧抽屉才松。水缸可添，水槽可倒，两桶可互倒。」\n\n下面另有母亲添的一句：「不许嫌孩子慢。」' },
            { id: 'water_station', title: '三升五升量水秤', location: '厨房', position: { x: 8.5, y: 1.25, z: -22 }, radius: 2,
                requiresOpen: true, text: '两只提桶刻着三升、五升。秤盘与桌下的抽屉由一根铜杆连着。旁边有添水的水缸和倒水槽。' },
            { id: 'medicine_letter', title: '没有寄出的家书', location: '厨房', position: { x: 8.5, y: 0.63, z: -21.9 }, radius: 1.7,
                requiresOpen: true, requiresWater: true, text: '抽屉里没有符纸，只有一封没寄出的信和一张复诊单。\n\n「不是你走了，我才病的。更不是你回来，我就能好。\n\n你爹做的这张量水桌，我一直没拆。等你回家，我们还可以慢慢试。\n\n要是没等到，就带着这封信出去吧。别把自己也留在屋里。」\n\n复诊单上的日期，比你离家的日子早了两年。' },
            { id: 'yard_gate', title: '通往归路的院门', location: '雨庭', position: { x: 0, y: 1.35, z: -27.2 }, radius: 1.8,
                requiresOpen: true, text: '一根旧铜索从厨房桌下穿过檐廊，接在院门门闩上。门外是一条没有灯的山路。' },
            { id: 'road_exit', title: '山路上的天光', location: '归路', position: { x: 0, y: 1.2, z: -31.1 }, radius: 1.8,
                requiresOpen: true, requiresWater: true, text: '山路上渐渐亮起来。身后的厨房还留着一盏灯。\n\n这次，你可以把它留在身后。' }
        ]
    };
})(window);
