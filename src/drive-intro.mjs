// As in the 2D dialogue, advancing the text starts the next beat.
export function playDrive(canvas, subtitle, finish, impact, next, radioCut, brake) {
    const copyText=window.HuishaCopy;
    const ctx=canvas.getContext('2d');
    const still=new window.Image(), face=new window.Image();
    still.src='assets/art/village-windscreen.webp';
    face.src='assets/art/windscreen-face.webp';
    const captions=[
        copyText('drive-intro.playdrive'),
        ...copyText('drive-intro.playdrive.2').split(/\n\s*\n/),
        copyText('drive-intro.playdrive.3'),
        copyText('drive-intro.playdrive.4')
    ];
    const blackCaption=copyText('drive.black');
    const revealPage=captions.length-1;
    const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    let page=0, since=0, time=0, request, last, struck=false, braking=false;
    const caption=()=>{
        delete subtitle.dataset.shock;
        subtitle.textContent=captions[page] || '';
        subtitle.hidden=!subtitle.textContent;
        next.hidden=false;
        next.textContent=page===revealPage?copyText('main.leavedrive'):copyText('drive-intro.playdrive.5');
    };
    const advance=()=>{
        if(next.hidden) return;
        if(page===revealPage){finish();return;}
        page++; since=0;
        if(page===revealPage-1)radioCut?.();
        if(page===revealPage){next.hidden=true;subtitle.hidden=true;}
        else caption();
    };
    next.addEventListener('click',advance); caption(); next.focus();
    function draw(){
        const w=canvas.width,h=canvas.height,scale=Math.max(w/1672,h/941);
        // Keep the driver and the vanishing point in frame on a portrait screen.
        const zoom=reduced?1:1+.025*(1-Math.exp(-time*.035));
        const sx=scale*zoom,ox=(w-1672*sx)*.52,oy=(h-941*sx)*.5;
        ctx.setTransform(sx,0,0,sx,ox,oy);
        if(still.naturalWidth)ctx.drawImage(still,0,0,1672,941);
        else {ctx.fillStyle='#10181b';ctx.fillRect(0,0,1672,941);}
        const hit=page===revealPage;
        ctx.save();
        ctx.beginPath();ctx.moveTo(92,0);ctx.lineTo(1672,0);ctx.lineTo(1672,630);ctx.lineTo(179,674);ctx.closePath();ctx.clip();
        const sweep=(1-Math.cos(time*Math.PI/.6))*.5;
        for(let i=0;i<52;i++){
            const x=(i*157.4+1672-(time*(19+i%6))%1672)%1672,y=(i*97+time*(170+i%9*7))%670;
            ctx.strokeStyle='rgba(173,196,210,.23)'; ctx.lineWidth=1.3;
            ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-3,y+11);ctx.stroke();
        }
        if(hit && since>=.65 && since<1.55 && face.naturalWidth){
            const rush=Math.min(1,Math.max(0,(since-1.05)/.30));
            const height=reduced?300:34+875*rush**3, width=height*face.naturalWidth/face.naturalHeight;
            ctx.drawImage(face,860-width*.5,407-height*.44,width,height);
        }
        if(hit && since>=1.55){
            for(const [x,y,r,alpha] of [[1048,536,6,.50],[1054,537,5,.32]]){
                ctx.fillStyle='rgba(133,49,40,'+alpha+')';ctx.beginPath();ctx.ellipse(x,y,r,r*.80,.21,0,Math.PI*2);ctx.fill();
            }
        }
        if(!reduced)for(const pivot of [400,948]){
            const angle=-.04-1.67*sweep;
            ctx.save();ctx.translate(pivot,661);ctx.rotate(angle);
            ctx.strokeStyle='#111614';ctx.lineCap='round';ctx.lineWidth=6;
            ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(285,0);ctx.stroke();
            ctx.lineWidth=10;ctx.beginPath();ctx.moveTo(187,-3);ctx.lineTo(478,-3);ctx.stroke();ctx.restore();
        }
        ctx.restore();
        if(hit && since>=2.7){
            ctx.fillStyle='rgba(5,8,10,'+Math.min(1,(since-2.7)*1.55)+')';ctx.fillRect(0,0,1672,941);
        }
    }
    function frame(now){
        const dt=last===undefined||document.hidden?0:Math.min(.12,(now-last)/1000);
        last=now; time+=dt;
        // On a slow connection hold the reveal until its image is ready (or failed).
        if(page!==revealPage || (face.complete && still.complete)) since+=dt;
        if(page===revealPage && next.hidden){
            if(since>=.67 && subtitle.hidden && !braking){
                subtitle.textContent=copyText('drive.hit');subtitle.hidden=false;subtitle.dataset.shock='true';
            }
            if(!braking && since>=1.32){
                braking=true;delete subtitle.dataset.shock;subtitle.textContent=copyText('drive.brake');brake?.();
            }
            if(!struck && since>=1.55){struck=true;impact?.();}
            if(since>=2.9 && subtitle.textContent!==blackCaption)subtitle.textContent=blackCaption;
        }
        if(page===revealPage && since>=3.75 && next.hidden)caption();
        if(ctx){
            const w=Math.max(1,Math.round(canvas.clientWidth*Math.min(1.5,window.devicePixelRatio||1)));
            const h=Math.max(1,Math.round(canvas.clientHeight*w/Math.max(1,canvas.clientWidth)));
            if(canvas.width!==w || canvas.height!==h){canvas.width=w;canvas.height=h;}
            draw();
        }
        request=window.requestAnimationFrame(frame);
    }
    request=window.requestAnimationFrame(frame);
    return ()=>{window.cancelAnimationFrame(request);next.removeEventListener('click',advance);};
}
