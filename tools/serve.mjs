import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const port = Number(process.env.PORT || 8133);
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json', '.gltf': 'model/gltf+json', '.bin': 'application/octet-stream',
    '.jpg': 'image/jpeg', '.png': 'image/png', '.txt': 'text/plain; charset=utf-8', '.md': 'text/plain; charset=utf-8' };
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
        response.writeHead(200, { 'Content-Type': mime[path.extname(target)] || 'application/octet-stream',
            'Content-Length': info.size, 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
        response.end(request.method === 'HEAD' ? undefined : await readFile(target));
    } catch (_) { response.writeHead(404); response.end('File not found'); }
});
server.on('error', error => { console.error(`Cannot start local game server: ${error.message}`); process.exitCode = 1; });
server.listen(port, '127.0.0.1', () => console.log(`回煞 3D · http://127.0.0.1:${port}\nKeep this terminal open. Ctrl+C to stop.`));
