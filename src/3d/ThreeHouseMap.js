(function (global) {
    const game = global.Huisha3D || (global.Huisha3D = {});
    game.PORTRAIT_BACK_RECORD = { id: 'portrait_back', title: '相框背字', location: '正厅',
        text: '照片里是母亲，背面写着：\n\n「留一盏灯，是怕你看不见路，不是要你留下。」\n\n那块黑布是你离家时盖上去的。' };
    game.MAIN_HALL_MAP = {
        id: 'homecoming',
        playerStart: { x: 0, y: 1.6, z: 3.4, yaw: Math.PI },
        playerRadius: 0.25,
        door: { hingeX: -1.17, hingeZ: -11.5, width: 2.34, thickness: 0.18, frontDepth: 0.6, openAngle: Math.PI / 2 },
        walkable: [
            { xMin: -4.8, xMax: 4.8, zMin: -4.1, zMax: 4.2 },
            { xMin: -1.25, xMax: 1.25, zMin: -11.5, zMax: -3.3 },
            { xMin: -1.25, xMax: 1.25, zMin: -14.5, zMax: -10.9, requiresState: 'opened' }
        ],
        obstacles: [
            { id: 'altar', xMin: -4, xMax: -1.5, zMin: -3.7, zMax: -2.6 },
            { id: 'cabinet', xMin: 2.65, xMax: 4.15, zMin: -3.85, zMax: -2.95 },
            { id: 'coffin', xMin: -1.4, xMax: 1.4, zMin: -0.15, zMax: 1.35 },
            { id: 'chair_left', xMin: -3.9, xMax: -3.1, zMin: 0.4, zMax: 1.2 },
            { id: 'chair_right', xMin: 3.1, xMax: 3.9, zMin: 0.4, zMax: 1.2 },
            { id: 'pillar_left', xMin: -4.35, xMax: -3.85, zMin: -1.75, zMax: -1.25 },
            { id: 'pillar_right', xMin: 3.85, xMax: 4.35, zMin: -1.75, zMax: -1.25 }
        ],
        interactables: [
            { id: 'letter', title: '门边来信', position: { x: 2.65, y: 1.1, z: 3.95 }, radius: 1.85,
                text: '七月十四，回来一趟。\n\n不要再替我守灯。门闩在你那边。\n\n落款是母亲的名字。她已经去世十年了。' },
            { id: 'altar', title: '供桌旧纸', position: { x: -2.75, y: 1.18, z: -2.7 }, radius: 1.8,
                text: '一张被油浸透的旧纸压在香炉旁：\n\n「灯照亡人，人面归门。雨留在外，不入三位。」\n\n字迹与来信相同。它说的是走廊那扇门上的三个字轮。' },
            { id: 'coffin', title: '棺上刻痕', position: { x: 0, y: 0.86, z: 0.65 }, radius: 2.25,
                text: '三道红绳从棺盖延向走廊。棺沿刻着：\n\n「左位留灯，右位留门。」\n\n绳结都在外面。里面的人从来没有锁门。' },
            { id: 'portrait', title: '蒙布相框', position: { x: -2.75, y: 1.9, z: -3.87 }, radius: 2.1,
                text: '黑布只在上沿搭着，布角被攥得发白。可以揭开它，也可以先看看别处。' },
            { id: 'wall_marks', title: '墙上身高线', position: { x: 1.1, y: 1.45, z: -7.1 }, radius: 1.65,
                text: '木墙上刻着逐年抬高的身高线，最后一条停在十年前。\n\n旁边的小字是：「站在灯和门之间的，是回家的人。」\n\n小时候，你总以为门后有人不让你走。' },
            { id: 'lock', title: '归门字轮', position: { x: 0, y: 1.42, z: -11.19 }, radius: 1.8,
                text: '门上嵌着三枚铜轮，每枚都有「雨、门、人、灯」四个字。红绳接在铜轮背面，门闩落在你这一侧。' },
            { id: 'threshold', title: '雨停后的门槛', position: { x: 0, y: 1.25, z: -13.9 }, radius: 1.8,
                text: '雨已经停了。石路通向一座小院。\n\n右手边的厨房里，还亮着一盏灯。母亲留下的门没有锁，院门却仍由一根铜索扣着。', requiresOpen: true }
        ]
    };
})(window);
