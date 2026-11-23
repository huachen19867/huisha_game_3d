// The windshield photograph supplies only the dashboard, pillar and mirror foreground.
export const driveBeats = {inside:8.55, cut:25.05, scare:32, impact:32.92, wake:34.72, end:40};
const sweepRate=4.8, turn=Math.PI*2, pivots=[375,1020];
function bladeAngle(phase) {
    return -.10-1.69*(.5-.5*Math.cos(phase));
}
// Both passes of a blade clear the same arc. Time since its last visit also works when seeking.
function wetness(x,y,phase) {
    let wet=1;
    for(const pivot of pivots){
        const dx=x-pivot,dy=y-700,r=Math.hypot(dx,dy),a=Math.atan2(dy,dx);
        if(r<158 || r>635 || a>-.10 || a< -1.79)continue;
        const pass=Math.acos(1-2*(-a-.10)/1.69);
        const elapsed=Math.min((phase-pass+turn)%turn,(phase+pass)%turn)/sweepRate;
        wet=Math.min(wet,Math.min(1,elapsed*1.45));
    }
    return wet;
}
export async function cockpitLayers() {
    const cabinImage=new Image();
    cabinImage.src='assets/art/village-windscreen.webp';
    await cabinImage.decode();
    const cabin=new Path2D();
    cabin.moveTo(0,0);cabin.lineTo(17,0);cabin.quadraticCurveTo(77,460,175,679);
    cabin.quadraticCurveTo(186,698,367,665);
    cabin.bezierCurveTo(519,584,684,610,797,648);
    cabin.lineTo(1060,637);cabin.lineTo(1672,628);
    cabin.lineTo(1672,941);cabin.lineTo(0,941);cabin.closePath();
    cabin.moveTo(1210,30);cabin.quadraticCurveTo(1360,3,1552,24);
    cabin.quadraticCurveTo(1613,43,1571,119);cabin.quadraticCurveTo(1559,147,1420,134);
    cabin.lineTo(1403,147);cabin.lineTo(1360,146);cabin.lineTo(1352,135);
    cabin.quadraticCurveTo(1154,146,1187,83);cabin.closePath();
    return (ctx,w,h,t,reduced=false)=>{
        const b=driveBeats;
        ctx.save();
        if(t>=b.inside && t<b.impact){
            const scale=Math.max(w/1672,h/941);
            const bob=reduced?0:Math.sin(t*7.3)*1.7;
            ctx.setTransform(scale,0,0,scale,(w-1672*scale)*.5,(h-941*scale)*.5+bob);
            const phase=(t*sweepRate)%turn;
            for(let i=0;i<680;i++){
                const speed=6+(i%9)**2, y=(i*193+t*speed)%735-35;
                const x=(i*547+Math.sin(i)*y*.08)%1710;
                const wet=wetness(x,y,phase);
                if(wet<.12)continue;
                const r=(1.15+i%5*.32)*wet;
                ctx.strokeStyle='rgba(185,204,208,'+(wet*.27)+')';
                ctx.lineWidth=r;
                ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+r,y-r*2,x-r*.4,y-r*(1+speed*.06));ctx.stroke();
            }
            for(const pivot of pivots){
                ctx.save();ctx.translate(pivot,700);ctx.rotate(bladeAngle(phase));
                ctx.lineCap='round';ctx.strokeStyle='#242b2d';ctx.lineWidth=6;
                ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(168,-8);ctx.lineTo(370,0);ctx.stroke();
                ctx.strokeStyle='#101617';ctx.lineWidth=11;
                ctx.beginPath();ctx.moveTo(158,0);ctx.quadraticCurveTo(390,-3,635,3);ctx.stroke();
                ctx.restore();
            }
            ctx.save();ctx.clip(cabin);ctx.drawImage(cabinImage,0,0,1672,941);ctx.restore();
        }
        ctx.setTransform(1,0,0,1,0,0);
        const alpha=t<b.impact?Math.max(0,1-t/.65):t<b.wake?1:Math.max(0,1-(t-b.wake)/1.3);
        if(alpha>0){ctx.fillStyle='rgba(5,8,10,'+alpha+')';ctx.fillRect(0,0,w,h);}
        ctx.restore();
    };
}
