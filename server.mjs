import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createCommunityService} from './lib/community.js';
import {localStore} from './lib/local-store.js';
const root=path.dirname(fileURLToPath(import.meta.url));const community=createCommunityService(localStore());
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon','.json':'application/json'};
const port=Number(process.env.PORT||3000);
const send=(res,status,payload)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(payload));};
http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost');
  if(url.pathname==='/api/community'){
   if(req.method==='GET')return send(res,200,await community.snapshot(req.headers['x-kizuna-device']));
   if(req.method==='POST'){
    let raw='';for await (const chunk of req){raw+=chunk;if(raw.length>12000)return send(res,413,{error:'Nội dung quá dài.'});}
    return send(res,200,await community.mutate(JSON.parse(raw)));
   }
   return send(res,405,{error:'Method not allowed'});
  }
  const requested=url.pathname==='/'?'index.html':decodeURIComponent(url.pathname.slice(1));
  const location=path.resolve(root,requested);
  if(!location.startsWith(root+path.sep))return send(res,403,{error:'Forbidden'});
  if(!['index.html','app.js','data.js','assistant.js','learning-guides.js','course-evidence.js','icons.js','styles.css','favicon.svg'].includes(requested))return send(res,404,{error:'Not found'});
  const content=await fs.readFile(location);res.writeHead(200,{'Content-Type':MIME[path.extname(location)]||'application/octet-stream'});res.end(content);
 }catch(e){if(e.code==='ENOENT')return send(res,404,{error:'Not found'});console.error(e);send(res,e.status||500,{error:e.status?e.message:'Có lỗi xảy ra.'});}
}).listen(port,()=>console.log(`Kizuna local → http://localhost:${port}`));
