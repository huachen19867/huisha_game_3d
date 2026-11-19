// The three close-ups share the same prop, stone lip and windlass as the live shot.
export function wellCloseups(canvas) {
    const frames=new window.Image();
    const ctx=canvas.getContext('2d');
    const cuts=[
        {start:.80,end:2.76,y:0,height:510,focus:.46},
        {start:2.76,end:4.94,y:513,height:417,focus:.51},
        {start:4.94,end:6.89,y:935,height:598,focus:.51}
    ];
    const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    return {
        preload(){if(!frames.getAttribute('src'))frames.src='assets/art/well-paper-shots.webp';},
        draw(t){
            const shot=cuts.find(s=>t>=s.start && t<s.end);
            canvas.hidden=!ctx || !shot || !frames.naturalWidth;
            if(canvas.hidden)return;
            const w=Math.max(1,canvas.clientWidth),h=Math.max(1,canvas.clientHeight);
            if(canvas.width!==w || canvas.height!==h){canvas.width=w;canvas.height=h;}
            const wide=w/h>1.1, progress=(t-shot.start)/(shot.end-shot.start);
            const scale=(wide?Math.max(w/1024,h/shot.height):Math.min(w/860,h/shot.height))*(reduced?1:1+.032*progress);
            const width=1024*scale,height=shot.height*scale;
            ctx.fillStyle='#060808';ctx.fillRect(0,0,w,h);
            ctx.drawImage(frames,0,shot.y,1024,shot.height,(w-width)*shot.focus,(h-height)*.5,width,height);
            canvas.style.opacity=String(Math.min(1,(t-cuts[0].start)/.18,(cuts[2].end-t)/.30));
        }
    };
}
