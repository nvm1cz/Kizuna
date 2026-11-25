/** Server xem thử trên máy: phục vụ nguyên thư mục public/, giống Vercel. */
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public');
const port = Number(process.env.PORT || 3000);
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon'
};

const server = http.createServer(async (req, res) => {
  const reply = (status, body, type = 'text/plain; charset=utf-8') => {
    res.writeHead(status, {'Content-Type': type, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff'});
    res.end(body);
  };
  try {
    const name = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = path.join(root, name === '/' ? 'index.html' : name);
    if (!file.startsWith(root + path.sep)) return reply(403, 'Forbidden');
    reply(200, await fs.readFile(file), TYPES[path.extname(file)] || 'application/octet-stream');
  } catch (e) {
    if (['ENOENT', 'EISDIR', 'ENOTDIR'].includes(e.code)) return reply(404, 'Not found');
    if (e instanceof URIError || e.code === 'ERR_INVALID_URL' || e.code === 'ERR_INVALID_ARG_VALUE') return reply(400, 'Bad request');
    console.error(e);
    reply(500, 'Server error');
  }
});

server.on('error', e => {
  if (e.code !== 'EADDRINUSE') throw e;
  console.error(`Cổng ${port} đang được dùng. Hãy tắt server cũ (Ctrl + C) rồi chạy lại.`);
  process.exit(1);
});
server.listen(port, () => console.log(`Kizuna local → http://localhost:${port}`));
