import {driveBeats, cockpitLayers} from './drive-glass.mjs';
import {drawRoadsideWake} from './drive-scene.mjs';

function subtitles(copy) {
    const cues=[];
    const section=(key,from,to)=>{
        const paragraphs=copy(key).split(/\n\s*\n/).filter(Boolean).flatMap(line=>
            line.length>30 ? line.match(/[^，。！？]+[，。！？]*|[，。！？]+/gu) || [line] : [line]);
        const weights=paragraphs.map(text=>Math.max(2.3,[...text].length*.15+.9));
        const total=weights.reduce((a,b)=>a+b,0);
        let at=from;
        paragraphs.forEach((text,i)=>{cues.push({at,text});at+=(to-from)*weights[i]/total;});
    };
    const b=driveBeats;
    section('drive-intro.playdrive',.55,b.inside);
    section('drive-intro.playdrive.2',b.inside,b.cut-.25);
    cues.push({at:b.cut-.25,text:''});
    section('drive-intro.playdrive.3',b.cut+.35,b.scare-.6);
    cues.push({at:b.scare-.6,text:''},{at:b.impact+.38,text:copy('drive.brake')},{at:b.wake+.74,text:''});
    section('drive-intro.playdrive.4',b.wake+1.15,b.end-.45);
    cues.push({at:b.end-.45,text:''});
    return cues;
}
export function playDrive(house, video, glass, subtitle, finish, sound) {
    const cues=subtitles(window.HuishaCopy), b=driveBeats;
    let request,active=true,started=false,live=false,scene,paint,last=null,t=0,index=-1;
    const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    let lastProgress=null,wakeCamera;
    const startSound=()=>{if(!started){started=true;sound.start();}};
    async function useLiveScene() {
        if(!active||live||wakeCamera)return;
        live=true;video.pause();video.hidden=true;glass.hidden=false;glass.style.backgroundColor='';last=null;
        const {drivingScene}=await import('./drive-scene.mjs');
        if(!active)return;
        scene=drivingScene(house);
        cockpitLayers().then(layer=>{if(active)paint=layer;}).catch(()=>{});
    }
    function playVideo() {
        video.play().catch(()=>{if(!document.hidden)useLiveScene();});
    }
    function visibility() {
        last=null;lastProgress=null;
        if(document.hidden)video.pause();
        else if(!live && !wakeCamera)playVideo();
    }
    function frame(now) {
        if(!active)return;
        const previous=t;
        if(!document.hidden){
            if(live && scene){
                startSound();
                if(last!==null)t+=Math.min(.15,(now-last)/1000);
                last=now;
                scene.draw(t,b,reduced);
                const w=house.renderer.domElement.width,h=house.renderer.domElement.height;
                if(glass.width!==w||glass.height!==h){glass.width=w;glass.height=h;}
                const ctx=glass.getContext('2d');
                ctx.clearRect(0,0,w,h);
                paint?.(ctx,w,h,t,reduced);
            }else if(!live){
                if(wakeCamera){
                    if(last!==null)t+=Math.min(.15,(now-last)/1000);
                    last=now;
                }else{
                    t=video.currentTime;
                    if(t!==previous || lastProgress===null)lastProgress=now;
                    else if(now-lastProgress>6000)useLiveScene();
                    if(t>0)startSound();
                    if(t>=b.wake){
                        wakeCamera=house.camera.clone();
                        t=b.wake;last=now;video.pause();video.hidden=true;glass.hidden=false;
                        glass.getContext('2d').clearRect(0,0,glass.width,glass.height);
                    }
                }
                if(wakeCamera){
                    drawRoadsideWake(house,wakeCamera,t,b,reduced);
                    const opacity=1-Math.min(1,(t-b.wake)/1.3);
                    glass.style.backgroundColor='rgba(5,8,10,'+opacity+')';
                }
            }
            if(t>=b.inside && t<b.scare && Math.floor(t*4.8/(2*Math.PI))>Math.floor(previous*4.8/(2*Math.PI)))sound.wiper();
            if(previous<b.cut && t>=b.cut)sound.cut();
            if(previous<b.scare+.58 && t>=b.scare+.58)sound.brake();
            if(previous<b.impact && t>=b.impact)sound.impact();
            while(index+1<cues.length && t>=cues[index+1].at){
                index++;subtitle.textContent=cues[index].text;
            }
            subtitle.hidden=index<0||!cues[index].text;
            if(t>=b.end){finish();return;}
        }
        request=window.requestAnimationFrame(frame);
    }
    document.addEventListener('visibilitychange',visibility);
    video.addEventListener('playing',startSound);
    video.addEventListener('ended',finish);
    video.addEventListener('error',useLiveScene);
    subtitle.hidden=true;subtitle.textContent='';
    video.hidden=false;glass.hidden=true;video.currentTime=0;
    if(video.error || reduced)useLiveScene();else playVideo();
    request=window.requestAnimationFrame(frame);
    return ()=>{
        active=false;window.cancelAnimationFrame(request);
        video.removeEventListener('playing',startSound);
        video.removeEventListener('ended',finish);video.removeEventListener('error',useLiveScene);
        document.removeEventListener('visibilitychange',visibility);
        video.pause();scene?.dispose();glass.hidden=true;glass.style.backgroundColor='';
    };
}
