// The windshield photograph supplies only the dashboard, pillar and mirror foreground.
export const driveBeats = {inside:8.55, cut:25.05, scare:32, impact:32.92, wake:34.72, end:40};
export async function cockpitLayers() {
    const images=await Promise.all(['village-windscreen','windscreen-face'].map(async name=>{
        const image=new Image();
        image.src='assets/art/'+name+'.webp';
        await image.decode();
        return image;
    }));
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
            // Fixed pinpricks catch passing lamps, while falling streaks belong to the 3D street.
            for(let i=0;i<125;i++){
                const x=(i*547)%1672,y=(i*193)%630;
                const radius=1.4+(i%6)*.35;
                ctx.fillStyle='rgba(180,199,204,'+(.12+.08*Math.sin(t+i))+')';
                ctx.beginPath();ctx.ellipse(x,y,radius,radius*1.4,.15,0,Math.PI*2);ctx.fill();
            }
            ctx.save();ctx.clip(cabin);ctx.drawImage(images[0],0,0,1672,941);ctx.restore();
            if(t>b.impact-.27){
                const reach=Math.min(1,(t-b.impact+.27)/.21);
                const height=reduced?620:385+760*reach**2;
                const width=height*images[1].width/images[1].height;
                const center=1105-238*reach;
                ctx.drawImage(images[1],center-width*.50,415-height*.40,width,height);
            }
        }
        ctx.setTransform(1,0,0,1,0,0);
        const alpha=t<b.impact?Math.max(0,1-t/.65):t<b.wake?1:Math.max(0,1-(t-b.wake)/1.3);
        if(alpha>0){ctx.fillStyle='rgba(5,8,10,'+alpha+')';ctx.fillRect(0,0,w,h);}
        ctx.restore();
    };
}
