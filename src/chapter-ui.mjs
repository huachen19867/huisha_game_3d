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
    uniform: ['旧校服','棺里叠着的蓝校服，衣领内侧缝着李明的名字。']
};

export function household({story,scene,open,close,audio},item) {
    const s=story.state, back=['返回',close];
    const redraw=()=>{story.save();scene.syncState(true);};
    function obtain(id) {
        if(story.takeGear(id)) audio.paper();
        scene.syncState();close();
    }
    if(item.id==='wardrobe') {
        if(s.wardrobeOpen) open('柜后的门洞','柜子已经挪到轨道尽头，里面是父亲的修理间。',[back]);
        else open(item.title,item.text,[['往床头推',()=>open('柜子抵住了墙','这头的轨道到头了。另一边有一段发亮的滑轨。',[['换一边试试',()=>household({story,scene,open,close,audio},item)],back])],
            ['沿滑轨推向床尾',()=>{s.wardrobeOpen=true;
                const pose=scene.controls.snapshot();
                if(!scene.controls.canOccupy(pose.x,pose.z)) scene.controls.teleport({...pose,x:-11.27});
                redraw();audio.latch();close();}],back]);
    } else if(item.id==='wedding_chest') {
        if(s.chestOpen) open('打开的樟木箱',s.gear.includes('cellarKey')?'箱底只剩一小截麻绳。':'衣服底下压着把钥匙，木牌上刻着储水间的小水桶。',s.gear.includes('cellarKey')?[back]:[['拿走地下室钥匙',()=>obtain('cellarKey')],back]);
        else {
            function unlock(){
                if(input.value!=='1986'){ feedback.textContent='锁扣没松。锁旁的双喜已经磨白了。'; input.select(); return; }
                s.chestOpen=true;redraw();audio.latch();household({story,scene,open,close,audio},item);
            }
            open(item.title,item.text,[['拨开锁扣',unlock],back]);
            const input=document.createElement('input'), feedback=document.createElement('p');
            input.type='text';input.inputMode='numeric';input.maxLength=4;input.placeholder='四位年份';input.setAttribute('aria-label','结婚年份');
            feedback.setAttribute('role','status');document.getElementById('reader-body').append(input,feedback);
            input.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();unlock();}};input.focus();
        }
    } else if(item.id==='attic_winch'){
        if(!s.basketDown) open(item.title,item.text,[['松开绳结，放下晾篮',()=>{
            s.basketDown=true;redraw();audio.latch();household({story,scene,open,close,audio},item);
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
        const description=['香炉前空着一个浅碗印。小时候，爸摆饭，妈点香，轮到我把纸元宝放进盆里。',
            '饭已经摆上。三根香插在炉里，还没点着。','香头红了。地上的搪瓷盆里只剩往年的灰。','纸烧尽了。身后传来木头碰地的声音，棺盖挪开了一条缝。'][s.vigil];
        const returnToAltar=()=>household({story,scene,open,close,audio},item);
        const missing={rice:'灶上还有蒸笼。',matches:'父亲修东西时，总在工作台上放一盒火柴。',paper:'母亲怕纸返潮，一直把它搁在阁楼梁下。楼梯在父母卧房里。'};
        const actions=next ? offerings.slice(s.vigil).map((id,index)=>[names[s.vigil+index],()=>{
            if(id!==next) open('手停了下来',next==='rice'?'桌上空着，香炉前还有个碗印。':'搪瓷盆旁的香还没点，先把手上的纸收好。',[['再看供桌',returnToAltar],back]);
            else if(story.offer(id)){audio.latch();scene.syncState();returnToAltar();}
            else open('手里少了东西',missing[id],[back]);
        }]) : [];
        open('正厅守夜',description,[...actions,back]);
    } else if(item.id==='coffin' && s.opened) {
        if(s.coffinOpen) open('旧校服','里头没有人。那件蓝校服的领口缝着「李明」，内袋压着一张山路上的照片。',[back]);
        else if(s.vigil===3 && !s.oldCoffinLatch && !s.gear.includes('coffinKey')) open('棺锁还扣着','红绳松了，盖上还有把梅花锁。父亲配的这把钥匙原来挂在地下室水槽上方。',[back]);
        else if(s.vigil===3) open('松动的棺盖','红线已经垂到了地上。手伸进盖沿，能摸到一角布料。',[['推开棺盖',()=>{
            s.coffinOpen=true;redraw();audio.knock();open('是我的校服','蓝校服领口缝着我的名字。妈用的是红线。内袋里那张照片拍的是山路弯道，边缘和厨房相册最后一页的缺口正好对上。',[back]);
        }],back]);
        else open(item.title,'红绳还绷着。正厅的香炉前留着一个空碗印。',[back]);
    } else return false;
    return true;
}
