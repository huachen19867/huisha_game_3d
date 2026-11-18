const captions = [
    '妈去世十年了。昨天收到一封信，是她的字。叫我十四回来吃饭。',
    '前面就是槐树巷。小时候，每次开到这儿，我妈都要伸手把收音机拧小。',
    '车轮蹭到护栏了。先靠边。信还夹在车窗上，拿上再进村。'
];

// The 2D IntroScene used an 800 × 600 windscreen, a cubic road scroll and twin wipers.
export function playDrive(canvas, subtitle, finish) {
    const ctx = canvas.getContext('2d');
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    let request, previous, elapsed=0, lastCaption=-1;
    const polygon = (fill,points) => {
        ctx.fillStyle=fill; ctx.beginPath(); ctx.moveTo(...points[0]);
        for (const point of points.slice(1)) ctx.lineTo(...point);
        ctx.closePath(); ctx.fill();
    };
    const stroke = (color,width,x1,y1,x2,y2) => {
        ctx.strokeStyle=color; ctx.lineWidth=width; ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
    };
    function draw(t) {
        const w=Math.min(1440,Math.max(640,canvas.clientWidth)), h=Math.round(w*canvas.clientHeight/Math.max(1,canvas.clientWidth));
        if (canvas.width!==w || canvas.height!==h) {canvas.width=w; canvas.height=h;}
        ctx.setTransform(w/800,0,0,h/600,0,0);
        const sky=ctx.createLinearGradient(0,0,0,400);
        sky.addColorStop(0,'#0c1822'); sky.addColorStop(.66,'#4c5d64'); sky.addColorStop(1,'#1a2426');
        ctx.fillStyle=sky; ctx.fillRect(0,0,800,600);
        const brake=Math.max(0,Math.min(1,(t-11)/4));
        const roll=(Math.min(t,11)+4*(brake-brake*brake/2))*(reduced ? .18 : .57);
        const horizon=272, vx=399+Math.sin(t*.4)*7-brake*70;
        for (let layer=0; layer<3;layer++) {
            const ridge=[[0,400]];
            for (let x=-16;x<=824;x+=16) ridge.push([x,horizon-30+layer*16+Math.sin(x*.009+layer*2)*24+Math.sin(x*.033+layer)*9]);
            ridge.push([824,400]); polygon(['#34454d','#293940','#1a292c'][layer],ridge);
        }
        polygon('#15201f',[[0,290],[800,290],[800,600],[0,600]]);
        polygon('#354046',[[vx-6,horizon],[vx+6,horizon],[850,540],[-70,540]]);
        const beam=ctx.createRadialGradient(vx,304,5,vx,351,242);
        beam.addColorStop(0,'rgba(245,238,186,.39)'); beam.addColorStop(1,'rgba(232,230,182,0)');
        polygon(beam,[[vx-78,horizon+10],[vx+78,horizon+10],[830,485],[-20,485]]);
        for(let i=0;i<10;i++) {
            const p=((roll+i)/10)%1, depth=p*p*p, y=horizon+273*depth;
            ctx.fillStyle='#d9d9ba'; ctx.fillRect(vx-depth*46,y,1+depth*11,1+depth*25);
            for(const side of [-1,1]) {
                const x=vx+side*(9+depth*530);
                stroke('#38413e',1+depth*5,x,y,x,y-depth*156);
                ctx.fillStyle='#d6c9a1'; ctx.fillRect(x-1,y-depth*68,1+depth*5,1+depth*8);
            }
        }
        // Reflectors and the lit duty window come into view as the car pulls over.
        const sx=vx+94+brake*75, sy=horizon-19-brake*12;
        polygon('#18201f',[[sx-27,sy],[sx,sy-16],[sx+29,sy],[sx+25,sy+24],[sx-25,sy+24]]);
        ctx.fillStyle='#dbb87b'; ctx.fillRect(sx-17,sy+3,11,8); ctx.fillRect(sx-3,sy+3,8,8);
        for(let i=0;i<(reduced?28:94);i++){
            const x=(i*151.73-t*72)%850, y=((Math.sin(i*61.73)*4973)%494+988+t*(305+i%7*11))%494;
            stroke('rgba(189,212,221,.27)',1,(x+850)%850,y,(x+850)%850-4,y+12);
        }
        const angle=(-50-48*Math.cos(t*4.9))*Math.PI/180;
        for(const x of [185,497]) {
            const dx=Math.cos(angle),dy=Math.sin(angle);
            stroke('#252d2c',5,x,464,x+dx*245,464+dy*245);
            stroke('#101718',7,x+dx*135,464+dy*135,x+dx*330,464+dy*330);
        }
        polygon('#101719',[[0,0],[800,0],[800,23],[480,34],[57,27],[0,34]]);
        polygon('#0b1114',[[0,15],[45,27],[17,423],[0,475]]);
        polygon('#0b1114',[[757,25],[800,15],[800,460],[784,428]]);
        polygon('#131c1e',[[0,440],[112,416],[235,413],[341,430],[598,426],[779,417],[800,432],[800,600],[0,600]]);
        stroke('#4e5755',2,347,445,799,428);
        ctx.fillStyle='#0d1417';ctx.fillRect(353,32,104,28);
        ctx.fillStyle='#334047';ctx.fillRect(358,35,93,19);
        ctx.fillStyle='#b35e4c';ctx.fillRect(378,48,4,2);
        for (const x of [151,222]) {
            ctx.beginPath();ctx.arc(x,462,25,.78*Math.PI,2.22*Math.PI);
            ctx.lineWidth=2;ctx.strokeStyle='#75948b';ctx.stroke();
            const a=-1.25+brake*2.9;
            stroke('#d7a470',2,x,462,x-Math.sin(a)*18,462-Math.cos(a)*18);
        }
        ctx.beginPath();ctx.ellipse(182,536,104,79,0,0,Math.PI*2);
        ctx.strokeStyle='#080e10';ctx.lineWidth=19;ctx.stroke();
        stroke('#13191a',14,89,510,180,545);stroke('#13191a',14,180,545,277,513);
        ctx.fillStyle='#90aa94';ctx.font='12px monospace';ctx.fillText('FM   87.5',397,469);
    }
    function frame(now) {
        if (previous!==undefined && !document.hidden) elapsed+=Math.min(.12,(now-previous)/1000);
        previous=now;
        const index=elapsed<5.4?0:elapsed<11?1:2;
        if(index!==lastCaption){subtitle.textContent=captions[index];lastCaption=index;}
        if(elapsed>=17){finish();return;}
        if(ctx) draw(elapsed);
        request=window.requestAnimationFrame(frame);
    }
    request=window.requestAnimationFrame(frame);
    return ()=>window.cancelAnimationFrame(request);
}
