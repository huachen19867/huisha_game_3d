// Run the game's local server first. PLAYWRIGHT_MODULE, CHROME_PATH and FFMPEG_PATH may point to local tools.
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdir, rename, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const url=process.env.GAME_URL || 'http://127.0.0.1:8133/';
const dir=new URL('../assets/cinematics/',import.meta.url);
await mkdir(dir,{recursive:true});
const temp=fileURLToPath(new URL('drive-'+process.pid+'.mp4',dir));
const width=1280,height=720,fps=24;
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,args:['--enable-unsafe-swiftshader','--no-proxy-server']});
let ffmpeg;
try {
    const page=await browser.newPage({viewport:{width,height}});
    // Capture the normal scene instance in this authoring browser only.
    await page.route('**/src/main.mjs',async route=>{
        const result=await route.fetch();
        await route.fulfill({response:result,body:(await result.text()).replace('await scene.start();','await scene.start(); window.filmHouse=scene; scene.showingFilm=true;')});
    });
    await page.goto(url,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>!!window.filmHouse);
    const frames=await page.evaluate(async({width,height,fps})=>{
        const house=window.filmHouse;
        await house.modelLoading;
        const {drivingScene}=await import('./src/drive-scene.mjs');
        const {cockpitLayers,driveBeats}=await import('./src/drive-glass.mjs');
        const paint=await cockpitLayers(), movie=drivingScene(house);
        const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
        const ctx=canvas.getContext('2d',{alpha:false});
        window.filmFrame=n=>{
            const t=n/fps;
            movie.draw(t,driveBeats,false);
            ctx.drawImage(house.renderer.domElement,0,0,width,height);
            paint(ctx,width,height,t);
            return canvas.toDataURL('image/jpeg',.92).split(',')[1];
        };
        return Math.round(driveBeats.end*fps);
    },{width,height,fps});
    ffmpeg=spawn(process.env.FFMPEG_PATH || 'ffmpeg',['-nostdin','-v','error','-y','-f','image2pipe','-framerate',String(fps),'-vcodec','mjpeg','-i','-','-an','-c:v','libopenh264','-b:v','2800k','-g','24','-pix_fmt','yuv420p','-movflags','+faststart',temp],{stdio:['pipe','inherit','inherit'],windowsHide:true});
    const done=once(ffmpeg,'close');
    ffmpeg.stdin.on('error',()=>{});
    for(let start=0;start<frames;start+=6){
        if(ffmpeg.exitCode!==null)throw Error('Encoder exited early: '+ffmpeg.exitCode);
        const batch=await page.evaluate(([start,end])=>Array.from({length:end-start},(_,i)=>window.filmFrame(start+i)),[start,Math.min(frames,start+6)]);
        for(const jpeg of batch){if(!ffmpeg.stdin.write(Buffer.from(jpeg,'base64')))await once(ffmpeg.stdin,'drain');}
        if(start%120===0)console.log(start+'/'+frames);
    }
    ffmpeg.stdin.end();
    const [code]=await done;if(code!==0)throw Error('Encoder failed: '+code);
    await rename(temp,fileURLToPath(new URL('rain-drive.mp4',dir)));
} finally {
    if(ffmpeg && ffmpeg.exitCode===null)ffmpeg.kill();
    await browser.close();await rm(temp,{force:true});
}
