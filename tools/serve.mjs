import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const port = Number(process.env.PORT || 8133);
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json', '.gltf': 'model/gltf+json', '.bin': 'application/octet-stream',
    '.jpg': 'image/jpeg', '.png': 'image/png', '.webp':'image/webp', '.mp4':'video/mp4', '.ogg': 'audio/ogg', '.txt': 'text/plain; charset=utf-8', '.md': 'text/plain; charset=utf-8' };
const server = http.createServer(async (request, response) => {
    try {
        if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405); response.end(); return; }
        const pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
        const parts = pathname.replaceAll('\\', '/').split('/').filter(Boolean);
        if (parts.some(part => part.startsWith('.')) || parts.includes('..')) { response.writeHead(403); response.end(); return; }
        const target = path.resolve(root, ...parts, ...(parts.length ? [] : ['index.html']));
        const relative = path.relative(root, target);
        if (relative.startsWith('..') || path.isAbsolute(relative)) { response.writeHead(403); response.end(); return; }
        const info = await stat(target);
        if (!info.isFile()) { response.writeHead(404); response.end(); return; }
        if (path.extname(target) === '.mp4') {
            const headers = { 'Content-Type':'video/mp4', 'Accept-Ranges':'bytes', 'Cache-Control':'no-cache' };
            let start=0,end=info.size-1;
            if (request.headers.range) {
                const match=/^bytes=(\d*)-(\d*)$/.exec(request.headers.range);
                if(match) {
                    if(match[1]){start=Number(match[1]);if(match[2])end=Math.min(end,Number(match[2]));}
                    else start=match[2]?Math.max(0,info.size-Number(match[2])):info.size;
                }
                if(!match || !Number.isSafeInteger(start) || start>end) {
                    response.writeHead(416,{'Content-Range':'bytes */'+info.size});response.end();return;
                }
                headers['Content-Range']='bytes '+start+'-'+end+'/'+info.size;
            }
            response.writeHead(request.headers.range ? 206 : 200, {...headers,'Content-Length':end-start+1});
            if(request.method==='HEAD')response.end();
            else {
                const stream=createReadStream(target,{start,end});
                response.on('close',()=>stream.destroy());
                stream.on('error',error=>response.destroy(error));stream.pipe(response);
            }
            return;
        }
        response.writeHead(200, { 'Content-Type': mime[path.extname(target)] || 'application/octet-stream',
            'Content-Length': info.size, 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
        response.end(request.method === 'HEAD' ? undefined : await readFile(target));
    } catch (_) { response.writeHead(404); response.end('File not found'); }
});
server.on('error', error => { console.error(`Cannot start local game server: ${error.message}`); process.exitCode = 1; });
server.listen(port, '127.0.0.1', () => console.log(`回煞 3D · http://127.0.0.1:${port}\nKeep this terminal open. Ctrl+C to stop.`));
