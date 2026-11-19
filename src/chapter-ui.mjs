const copyText=window.HuishaCopy;
export const equipment = {
    envelope: [copyText('housemap.car_envelope.title'),copyText('chapter-ui.equipment.envelope')],
    lunchbox: [copyText('chapter-ui.equipment.lunchbox'),copyText('chapter-ui.equipment.lunchbox.2')],
    key: [copyText('chapter-ui.equipment.key'),copyText('chapter-ui.equipment.key.2')],
    heightStrip: [copyText('housemap.height_stitch.location'),copyText('chapter-ui.equipment.heightstrip')],
    lamp: [copyText('housemap.altar.title'),copyText('chapter-ui.equipment.lamp')],
    weight: [copyText('chapter-ui.equipment.weight'),copyText('chapter-ui.equipment.weight.2')],
    matches: [copyText('chapter-ui.equipment.matches'),copyText('chapter-ui.equipment.matches.2')],
    rice: [copyText('chapter-ui.equipment.rice'),copyText('chapter-ui.equipment.rice.2')],
    paper: [copyText('chapter-ui.equipment.paper'),copyText('chapter-ui.equipment.paper.2')],
    cellarKey:[copyText('chapter-ui.equipment.cellarkey'),copyText('chapter-ui.equipment.cellarkey.2')],
    coffinKey:[copyText('chapter-ui.equipment.coffinkey'),copyText('chapter-ui.equipment.coffinkey.2')],
    familyLetter: [copyText('chapter-ui.equipment.familyletter'),copyText('chapter-ui.equipment.familyletter.2')],
    roadPhoto:[copyText('chapter-ui.equipment.roadphoto'),copyText('chapter-ui.equipment.roadphoto.2')],
    uniform: [copyText('housemap.uniform_cuff.location'),copyText('chapter-ui.equipment.uniform')]
};

export function household(context,item) {
    const {story,scene,open,close,audio,inspectUniform}=context;
    const s=story.state, back=[copyText('chapter-ui.household'),close];
    const redraw=()=>{story.save();scene.syncState(true);};
    function obtain(id) {
        if(story.takeGear(id)) audio.paper();
        scene.syncState();close();
    }
    if(item.id==='wardrobe') {
        if(s.wardrobeOpen) open(copyText('chapter-ui.household.2'),copyText('chapter-ui.household.3'),[back]);
        else open(item.title,item.text,[[copyText('chapter-ui.household.4'),()=>open(copyText('chapter-ui.household.5'),copyText('chapter-ui.household.6'),[[copyText('chapter-ui.household.7'),()=>household(context,item)],back])],
            [copyText('chapter-ui.household.8'),()=>{s.wardrobeOpen=true;
                const pose=scene.controls.snapshot();
                if(!scene.controls.canOccupy(pose.x,pose.z)) scene.controls.teleport({...pose,x:-11.27});
                redraw();audio.latch();close();}],back]);
    } else if(item.id==='wedding_chest') {
        if(s.chestOpen) open(copyText('chapter-ui.household.9'),s.gear.includes('cellarKey')?copyText('chapter-ui.household.10'):copyText('chapter-ui.household.11'),s.gear.includes('cellarKey')?[back]:[[copyText('chapter-ui.household.12'),()=>obtain('cellarKey')],back]);
        else {
            function unlock(){
                if(input.value!=='1986'){ feedback.textContent=copyText('chapter-ui.unlock'); input.select(); return; }
                s.chestOpen=true;redraw();audio.latch();household(context,item);
            }
            open(item.title,item.text,[[copyText('chapter-ui.household.13'),unlock],back]);
            const input=document.createElement('input'), feedback=document.createElement('p');
            input.type='text';input.inputMode='numeric';input.maxLength=4;input.placeholder=copyText('chapter-ui.household.14');input.setAttribute('aria-label',copyText('chapter-ui.household.15'));
            feedback.setAttribute('role','status');document.getElementById('reader-body').append(input,feedback);
            input.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();unlock();}};input.focus();
        }
    } else if(item.id==='attic_winch'){
        if(!s.basketDown) open(item.title,item.text,[[copyText('chapter-ui.household.16'),()=>{
            s.basketDown=true;redraw();audio.latch();household(context,item);
        }],back]);
        else open(copyText('chapter-ui.household.17'),s.gear.includes('paper')?copyText('chapter-ui.household.18'):copyText('chapter-ui.household.19'),s.gear.includes('paper')?[back]:[[copyText('chapter-ui.household.20'),()=>obtain('paper')],back]);
    } else if(item.id==='cellar_door'){
        const key=s.gear.includes('cellarKey');
        open(item.title,s.cellarOpen?copyText('chapter-ui.household.21'):key?copyText('chapter-ui.household.22'):copyText('chapter-ui.household.23'),
            key&&!s.cellarOpen?[[copyText('chapter-ui.household.24'),()=>{s.cellarOpen=true;redraw();audio.latch();close();}],back]:[back]);
    } else if(item.id==='sump_grate'){
        open(item.title,s.filterClear?copyText('chapter-ui.household.25'):item.text,s.filterClear?[back]:[[copyText('chapter-ui.household.26'),()=>{
            s.filterClear=true;redraw();audio.paper();close();
        }],back]);
    } else if(item.id==='sump_pump'){
        open(item.title,s.sumpDrained?copyText('chapter-ui.household.27'):item.text,s.sumpDrained?[back]:[[copyText('chapter-ui.household.28'),()=>{
            if(!s.filterClear){audio.knock();open(copyText('chapter-ui.household.29'),copyText('chapter-ui.household.30'),[back]);return;}
            s.sumpDrained=true;redraw();audio.water('empty');open(copyText('chapter-ui.household.31'),copyText('chapter-ui.household.32'),[back]);
        }],back]);
    } else if(item.id==='cellar_keyring'){
        open(item.title,s.gear.includes('coffinKey')?copyText('chapter-ui.household.33'):item.text,s.gear.includes('coffinKey')?[back]:[[copyText('chapter-ui.household.34'),()=>obtain('coffinKey')],back]);
    } else if(item.id==='leak_basin') {
        open(item.title,s.leakMuffled?copyText('chapter-ui.household.35'):item.text,[
            [s.leakMuffled?copyText('chapter-ui.household.36'):copyText('chapter-ui.household.37'),()=>{
                s.leakMuffled=!s.leakMuffled; redraw(); close();
            }],back]);
    } else if(item.id==='rice_bowl') {
        if (s.riceStage==='covered') {
            s.riceStage='empty'; story.save(); scene.syncState(); audio.latch();
        } else if (s.gear.includes('rice') || s.vigil>0) {
            open(copyText('interaction.showprompt.4'),s.vigil>0?copyText('chapter-ui.household.38'):copyText('chapter-ui.household.39'),[back]);
        } else if (s.riceStage==='empty') {
            story.record(item.id);
            const serve = withPork => {
                s.riceStage='served';s.porkOnRice=withPork;
                story.save();scene.syncState();audio.knock();close();
            };
            open(copyText('chapter-ui.household.40'),item.text+copyText('chapter-ui.household.41'),
                [[copyText('chapter-ui.household.42'),()=>serve(false)],[copyText('chapter-ui.household.43'),()=>serve(true)],[copyText('chapter-ui.household.44'),close]]);
        } else {
            story.record(item.id);
            open(copyText('chapter-ui.household.45'),(s.porkOnRice?copyText('chapter-ui.household.46'):copyText('chapter-ui.household.47'))+copyText('chapter-ui.household.48'),[[copyText('chapter-ui.household.49'),()=>obtain('rice')],[copyText('chapter-ui.household.50'),close]]);
        }
    } else if(['brass_weight','matchbox'].includes(item.id)) {
        const id={brass_weight:'weight',matchbox:'matches'}[item.id];
        open(item.title,s.gear.includes(id)?copyText('chapter-ui.household.51'):item.text,
            s.gear.includes(id)?[back]:[[copyText('chapter-ui.household.52', equipment[id][0]),()=>obtain(id)],back]);
    } else if(item.id==='altar' && s.opened) {
        const offerings=['rice','matches','paper'], names=[copyText('chapter-ui.household.53'),copyText('chapter-ui.household.54'),copyText('chapter-ui.household.55')], next=offerings[s.vigil];
        const description=[copyText('chapter-ui.household.56'),
            (s.porkOnRice?copyText('chapter-ui.household.57'):copyText('chapter-ui.household.58'))+copyText('chapter-ui.household.59'),copyText('chapter-ui.household.60'),copyText('chapter-ui.household.61')][s.vigil];
        const returnToAltar=()=>household(context,item);
        const missing={rice:copyText('chapter-ui.household.rice'),matches:copyText('chapter-ui.household.matches'),paper:copyText('chapter-ui.household.paper')};
        const actions=next ? offerings.slice(s.vigil).map((id,index)=>[names[s.vigil+index],()=>{
            if(id!==next) open(copyText('chapter-ui.household.62'),next==='rice'?copyText('chapter-ui.household.63'):copyText('chapter-ui.household.64'),[[copyText('chapter-ui.household.65'),returnToAltar],back]);
            else if(story.offer(id)){audio.latch();scene.syncState();returnToAltar();}
            else open(copyText('chapter-ui.household.66'),missing[id],[back]);
        }]) : [];
        open(copyText('chapter-ui.household.67'),description,[...actions,back]);
    } else if(item.id==='coffin' && s.opened) {
        const lookInside=()=>open(copyText('chapter-ui.household.68'),s.records.includes('uniform_collar')?copyText('chapter-ui.household.69'):copyText('chapter-ui.household.70'),[
            [s.records.includes('uniform_collar')?copyText('chapter-ui.household.71'):copyText('chapter-ui.household.72'),inspectUniform],back]);
        if(s.coffinOpen) lookInside();
        else if(s.vigil===3 && !s.oldCoffinLatch && !s.gear.includes('coffinKey')) open(copyText('chapter-ui.household.73'),copyText('chapter-ui.household.74'),[back]);
        else if(s.vigil===3) open(copyText('chapter-ui.household.75'),(s.gear.includes('coffinKey')?copyText('chapter-ui.household.76'):'')+copyText('chapter-ui.household.77'),[[copyText('chapter-ui.household.78'),()=>{
            s.coffinOpen=true;redraw();audio.knock();lookInside();
        }],back]);
        else open(item.title,copyText('chapter-ui.household.79'),[back]);
    } else return false;
    return true;
}
