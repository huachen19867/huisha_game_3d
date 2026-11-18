(function (global) {
    const game = global.Huisha3D || (global.Huisha3D = {});
    game.PORTRAIT_BACK_RECORD = { id: 'portrait_back', title: '相框背字', location: '正厅', area: 'hall',
        text: '照片里是母亲，背面写着：\n\n「留一盏灯，是怕你看不见路，不是要你留下。」\n\n那块黑布是你离家时盖上去的。' };
    game.MAIN_HALL_MAP = {
        id: 'homecoming',
        playerStart: { x: 0, y: 1.6, z: 3.4, yaw: Math.PI },
        roadStart: { x: 0.15, z: 31.1, yaw: 3.13, pitch: -0.035 },
        playerRadius: 0.25,
        door: { hingeX: -1.17, hingeZ: -11.5, width: 2.34, thickness: 0.18, frontDepth: 0.6, openAngle: Math.PI / 2 },
        walkable: [
            { id: 'hall', title: '正厅', xMin: -4.8, xMax: 4.8, zMin: -4.1, zMax: 4.2 },
            { id: 'corridor', title: '走廊', xMin: -1.25, xMax: 1.25, zMin: -11.5, zMax: -3.3 },
            { id: 'path', title: '门外石路', mapLabel: '石路', xMin: -1.25, xMax: 1.25, zMin: -14.5, zMax: -10.9, requiresState: 'opened' },
            { id: 'stone_court', title:'门后石坪', xMin:-3.56,xMax:3.56,zMin:-14.08,zMax:-11.67,requiresState:'opened' },
            { id: 'porch', title: '老宅门廊', xMin: -1, xMax: 1, zMin: 4.2, zMax: 5.1 },
            { id: 'lane', title: '村口旧路', xMin: -3.6, xMax: 3.6, zMin: 5.1, zMax: 34 }
        ],
        obstacles: [
            ...[-1,1].flatMap(side=>[
                {id:'path-stone-post'+side,xMin:side*1.2-.18,xMax:side*1.2+.18,zMin:-14.38,zMax:-14.02},
                {id:'path-curb'+side,xMin:side*1.2-.12,xMax:side*1.2+.12,zMin:-14,zMax:-11.7,height:.13}
            ]),
            { id: 'front-door', xMin: -1, xMax: 1, zMin: 4.32, zMax: 4.52, closedUntilHome: true },
            { id: 'parked-car', xMin: -3.15, xMax: -1.15, zMin: 27.5, zMax: 31.9 },
            { id: 'key-cabinet', xMin: -3.63, xMax: -3.355, zMin: 10.84, zMax: 12.16 },
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
            { id: 'car_envelope', title: '随身来信', inventoryOnly: true, location: '村口', area: 'lane', position: {x: -1.11, y: 1.08, z: 29.8}, radius: 2.4,
                text: '外封打印着我现在的地址，单号末四位 0317。县城投递章是七月十三。里面还有一只小信封，妈用圆珠笔写了「李明收」。背面是家里的旧门牌：槐树巷十四号。\n\n「明，十四回来吃饭。你要是到得早，就上老周那儿拿钥匙。走廊漏风，端灯记得拢着手。妈」\n\n落款没写年。' },
            { id:'forwarding_slip', title:'值班室的寄件底单', inventoryOnly:true, location:'村口', area:'lane', position:{x:2.98,y:1.08,z:21.15},
                text:'寄件人：周福生，下面留着他的手机号。收件人：李明。七月十二日收寄。单号末四位 0317。\n\n底单和外封的号码一样。周师傅说，换掉进水的老钥匙柜时，在背板和墙之间找到了那个写着「李明收」的小信封。他照我春天寄回来的修屋回执填了新地址。内封到我手里才拆。' },
            { id: 'clerk', title: '值夜的周师傅', location: '村口', area: 'lane', position: {x:3.20,y:1.64,z:20.38}, radius:2.65,
                text: '周师傅摘下眼镜，在袖口擦了擦。「李明？上回见你，你还没这窗台高。」' },
            { id: 'duty_book', title: '值班室换牌登记簿', area: 'lane', position: {x: 2.62, y: 1.1, z: 21.1}, radius: 2.2,
                text: '换牌登记　　旧门牌 → 新门牌\n槐树巷四号　　东街九号\n槐树巷十四号　东街六号\n槐树巷四十号　东街十六号\n\n钥匙移到了老宅对面的木柜，钥匙牌已换成新号。' },
            { id: 'key_board', title: '路边的钥匙柜', area: 'lane', position: {x: -3.28, y: 1.4, z: 11.5}, radius: 2.2,
                text: '三把门钥匙挂在柜里，铜牌上刻着东街的新门牌号。' },
            { id: 'front_gate', title: '李家老宅前门', area: 'porch', position: {x: 0.45, y: 1.27, z: 4.61}, radius: 2,
                text: '门上的搪瓷牌还是旧的：槐树巷十四号。锁眼就在拉手下面。' },
            { id: 'letter', title: '门边的全家福', position: { x: 2.65, y: 1.1, z: 3.95 }, radius: 1.85,
                text: '一张褪色的过年照片。左边的小桌上点着马灯，右边是贴了春联的木门。我坐在正中间，妈扶着我的胳膊，爸笑得露出了牙。' },
            { id: 'altar', title: '守夜灯', position: { x: -2.75, y: 1.18, z: -2.7 }, radius: 1.8,
                text: '煤油灯的提把烫手。我小时候把红鞋带绕在上面，妈一直没拆。\n\n灯芯剪过了，灯肚里还有油。提起来，红鞋带刚好套住手腕。' },
            { id:'uniform_collar', title:'校服领口的姓名布', area:'hall', location:'正厅', inventoryOnly:true, position:{x:0,y:.82,z:.65},
                text:'领口的白布条上是「李明　初二」。那个「明」挤作一团，日和月之间有个针眼。我第一次住宿那晚，妈催我穿鞋，我还在往这块布上描自己的名字。右边内袋比左边沉。' },
            { id:'uniform_cuff', title:'左袖的三对揿扣', area:'hall', location:'旧校服', inventoryOnly:true, position:{x:0,y:.82,z:.65},
                text:'我把左袖摊在膝盖上。拇指顺着袖缝一掀，三对揿扣接连弹开，袖口一直敞到手肘。剪开的毛边拿蓝线细细包过。我穿它上学的时候，两只袖子是一样的。' },
            { id:'clerk_holdall', title:'老周送回来的布兜', area:'lane', location:'村口值班室', inventoryOnly:true, position:{x:3.2,y:1.64,z:20.38},
                text:'「正厅那口棺木，是给我妈的？」\n\n老周摇头。「你爸给自己打的。你妈的骨灰，是我陪他去县里接的。」\n\n「我从医院送他回来，他抱着个黄布兜。里头是你妈住院穿的衣裳，换下来的还没洗。我说嫂子那些东西我帮你收拾吧。他掀开棺盖，把兜放了进去，说，明儿我自己洗。」' },
            { id:'clerk_cuff', title:'母亲的输液袖', area:'lane', location:'村口值班室', inventoryOnly:true, position:{x:3.2,y:1.64,z:20.38},
                text:'我把袖子搭到窗台上。老周看了一眼就伸出左手，在自己手背上点了点。「她在县医院挂水，胳膊冷，穿外套又得叫护士过来。就喊我去买了几个揿扣。」\n\n他把最靠手肘的那颗按上，按了两下才扣住。「还是这个最紧。那阵子我在床边，老帮她扣这个。」' },
            { id:'bend_photo', title:'石桥上学车的旧照', area:'hall', location:'正厅', inventoryOnly:true, position:{x:0,y:.82,z:.65},
                text:'爸的手已经松开了。我那时候还在喊：「你扶好了啊！」妈在桥头按了快门。照片左边拍进半根缺角的石柱，背面印着「县照相馆」。右下角有一道旧折痕。' },
            { id: 'coffin', title: '棺上的红绳', position: { x: 0, y: 0.86, z: 0.65 }, radius: 2.25,
                text: '三根红绳贴着棺沿，一直连到走廊的门闩。' },
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
    for (const [area, ids] of Object.entries({ hall: ['letter', 'altar', 'coffin', 'portrait'], corridor: ['wall_marks', 'lock'], path: ['threshold'] })) {
        for (const id of ids) game.MAIN_HALL_MAP.interactables.find(item => item.id === id).area = area;
    }
})(window);
