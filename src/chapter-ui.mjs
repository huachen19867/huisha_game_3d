export const equipment = {
    envelope: ['随身来信','牛皮纸信封的角已经折软。出门前，李明把它收进了外套内袋。'],
    key: ['钥匙','值班室寄存的六号铜钥匙，开李家的前门。'],
    lamp: ['守夜灯','提把上缠着红鞋带的煤油灯。'],
    weight: ['铜秤砣','底面打着「灶间」二字，能放回量水秤左侧的凹槽。'],
    matches: ['火柴盒','从修理间取出的铁盒，里面的火柴还很干。'],
    rice: ['一碗白饭','灶上留的饭，碗沿缺了一小块。'],
    paper: ['纸元宝','从阁楼晾篮里取下的一包纸元宝。'],
    cellarKey:['地下室钥匙','木牌上刻着小水桶，开修理间通往地下室的铁门。'],
    coffinKey:['梅花铜钥匙','在地下水槽找回的钥匙，柄上冲着一朵梅花。'],
    familyLetter: ['未寄出的家书','量水桌抽屉里的家书和母亲的复诊单。'],
    roadPhoto:['石桥旧照','李明第一次自己骑过石桥时，母亲在桥头拍下的相片。'],
    uniform: ['旧校服','棺里叠着的蓝校服，衣领内侧缝着李明的名字。']
};

export function household(context,item) {
    const {story,scene,open,close,audio,inspectUniform}=context;
    const s=story.state, back=['返回',close];
    const redraw=()=>{story.save();scene.syncState(true);};
    function obtain(id) {
        if(story.takeGear(id)) audio.paper();
        scene.syncState();close();
    }
    if(item.id==='wardrobe') {
        if(s.wardrobeOpen) open('柜后的门洞','柜子已经挪到轨道尽头，里面是父亲的修理间。',[back]);
        else open(item.title,item.text,[['往床头推',()=>open('柜子抵住了墙','这头的轨道到头了。另一边有一段发亮的滑轨。',[['换一边试试',()=>household(context,item)],back])],
            ['沿滑轨推向床尾',()=>{s.wardrobeOpen=true;
                const pose=scene.controls.snapshot();
                if(!scene.controls.canOccupy(pose.x,pose.z)) scene.controls.teleport({...pose,x:-11.27});
                redraw();audio.latch();close();}],back]);
    } else if(item.id==='wedding_chest') {
        if(s.chestOpen) open('打开的樟木箱',s.gear.includes('cellarKey')?'箱底只剩一小截麻绳。':'衣服底下压着把钥匙，木牌上刻着储水间的小水桶。',s.gear.includes('cellarKey')?[back]:[['拿走地下室钥匙',()=>obtain('cellarKey')],back]);
        else {
            function unlock(){
                if(input.value!=='1986'){ feedback.textContent='锁扣没松。锁旁的双喜已经磨白了。'; input.select(); return; }
                s.chestOpen=true;redraw();audio.latch();household(context,item);
            }
            open(item.title,item.text,[['拨开锁扣',unlock],back]);
            const input=document.createElement('input'), feedback=document.createElement('p');
            input.type='text';input.inputMode='numeric';input.maxLength=4;input.placeholder='四位年份';input.setAttribute('aria-label','结婚年份');
            feedback.setAttribute('role','status');document.getElementById('reader-body').append(input,feedback);
            input.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();unlock();}};input.focus();
        }
    } else if(item.id==='attic_winch'){
        if(!s.basketDown) open(item.title,item.text,[['松开绳结，放下晾篮',()=>{
            s.basketDown=true;redraw();audio.latch();household(context,item);
        }],back]);
        else open('放下的晾篮',s.gear.includes('paper')?'篮底剩下一段扎纸用的棉线。':'掀开盖布，里面躺着一包干燥的纸元宝。',s.gear.includes('paper')?[back]:[['拿走纸元宝',()=>obtain('paper')],back]);
    } else if(item.id==='cellar_door'){
        const key=s.gear.includes('cellarKey');
        open(item.title,s.cellarOpen?'铁门敞着。楼梯一直向下，墙上有积水退过的印子。':key?'木牌上的水桶对上了。钥匙转得动。':'铁门锁着。家里的备用钥匙一直由母亲收在卧房。',
            key&&!s.cellarOpen?[['打开地下室',()=>{s.cellarOpen=true;redraw();audio.latch();close();}],back]:[back]);
    } else if(item.id==='sump_grate'){
        open(item.title,s.filterClear?'滤网露了出来，水现在能流到泵里。':item.text,s.filterClear?[back]:[['提起棉纱，清掉树叶',()=>{
            s.filterClear=true;redraw();audio.paper();close();
        }],back]);
    } else if(item.id==='sump_pump'){
        open(item.title,s.sumpDrained?'管口滴着水，瓷槽已经见底。':item.text,s.sumpDrained?[back]:[['压动手柄',()=>{
            if(!s.filterClear){audio.knock();open('泵打不上水','手柄压下去没什么阻力。顺着管子看过去，水槽那头的滤网全堵死了。',[back]);return;}
            s.sumpDrained=true;redraw();audio.water('empty');open('水槽见底了','最后一股水从墙外流走。槽底磕了一声，有件铜东西露了出来。',[back]);
        }],back]);
    } else if(item.id==='cellar_keyring'){
        open(item.title,s.gear.includes('coffinKey')?'白瓷上只剩一小块锈印。':item.text,s.gear.includes('coffinKey')?[back]:[['拿走梅花铜钥匙',()=>obtain('coffinKey')],back]);
    } else if(['brass_weight','matchbox','rice_bowl'].includes(item.id)) {
        const id={brass_weight:'weight',matchbox:'matches',rice_bowl:'rice'}[item.id];
        open(item.title,s.gear.includes(id)?'原来放东西的地方已经空了。':item.text,
            s.gear.includes(id)?[back]:[[`拿走${equipment[id][0]}`,()=>obtain(id)],back]);
    } else if(item.id==='altar' && s.opened) {
        const offerings=['rice','matches','paper'], names=['摆饭','点香','烧纸'], next=offerings[s.vigil];
        const description=['每年十四，爸摆饭，妈点香，我蹲在盆边烧纸。妈走那年我没赶上。桌上还留着她惯用的那双筷子。我把它们并了并，给饭碗腾出地方。',
            '碗沿的豁口朝外。我照着妈以前的习惯把碗转了半圈。炉里还有三根没点的香。','香头红了。地上的搪瓷盆里只剩往年的灰。','最后一片纸灰落进盆里。身后响了一声。回头看，棺沿那根绷着的红绳已经垂到了地上。'][s.vigil];
        const returnToAltar=()=>household(context,item);
        const missing={rice:'灶上还有蒸笼。',matches:'父亲修东西时，总在工作台上放一盒火柴。',paper:'母亲怕纸返潮，一直把它搁在阁楼梁下。楼梯在父母卧房里。'};
        const actions=next ? offerings.slice(s.vigil).map((id,index)=>[names[s.vigil+index],()=>{
            if(id!==next) open('手停了下来',next==='rice'?'桌上空着，香炉前还有个碗印。':'搪瓷盆旁的香还没点，先把手上的纸收好。',[['再看供桌',returnToAltar],back]);
            else if(story.offer(id)){audio.latch();scene.syncState();returnToAltar();}
            else open('手里少了东西',missing[id],[back]);
        }]) : [];
        open('正厅守夜',description,[...actions,back]);
    } else if(item.id==='coffin' && s.opened) {
        const lookInside=()=>open('棺盖底下',s.records.includes('uniform_collar')?'棺底的黄布兜敞着口。伸手进去，底下只剩一层粗布。':'棺底搁着一个黄布兜，提手倒向两边。里面露出一件蓝外套，两道白条一直通到袖口。衣领折在下面。',[
            [s.records.includes('uniform_collar')?'再看旧校服':'拿起校服，翻开衣领',inspectUniform],back]);
        if(s.coffinOpen) lookInside();
        else if(s.vigil===3 && !s.oldCoffinLatch && !s.gear.includes('coffinKey')) open('棺锁还扣着','红绳松了，盖上还有把梅花锁。父亲配的这把钥匙原来挂在地下室水槽上方。',[back]);
        else if(s.vigil===3) open('松动的棺盖',(s.gear.includes('coffinKey')?'我用铜钥匙摘下梅花锁。':'')+'盖子抬开一条缝，里头有股樟脑味。',[['推开棺盖',()=>{
            s.coffinOpen=true;redraw();audio.knock();lookInside();
        }],back]);
        else open(item.title,'红绳还绷着。正厅的香炉前留着一个空碗印。',[back]);
    } else return false;
    return true;
}
