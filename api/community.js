import { list, put } from '@vercel/blob';
import { createCommunityService } from '../lib/community.js';
const ROOT='kizuna-mvp/v1/';
const KINDS=new Set(['questions','replies','votes','feedback','reports','lecturerReviews']);
const store={
 async readItems(kind){
  if(!KINDS.has(kind))return [];
  let cursor;const blobs=[];
  do {const page=await list({prefix:ROOT+kind+'/',limit:1000,...(cursor?{cursor}:{})});blobs.push(...page.blobs);cursor=page.hasMore?page.cursor:undefined;} while(cursor&&blobs.length<5000);
  const items=await Promise.all(blobs.map(async b=>{try{const resp=await fetch(b.url,{cache:'no-store'});return resp.ok?await resp.json():null;}catch{return null;}}));
  return items.filter(Boolean);
 },
 async writeItem(kind,id,obj){
  if(!KINDS.has(kind))throw new Error('Invalid store type');
  const pathname=ROOT+kind+'/'+encodeURIComponent(id)+'.json';
  try{await put(pathname,JSON.stringify(obj),{access:'public',addRandomSuffix:false,contentType:'application/json'});}
  catch(e){if(/already exists|already been uploaded|same pathname|conflict/i.test(String(e)))throw Object.assign(new Error('duplicate'),{code:'DUPLICATE'});throw e;}
 }
};
const community=createCommunityService(store);
const headers={'Cache-Control':'no-store, max-age=0','X-Content-Type-Options':'nosniff'};
export default async function handler(req,res){
 res.setHeader('Cache-Control',headers['Cache-Control']);res.setHeader('X-Content-Type-Options',headers['X-Content-Type-Options']);
 try{
  if(req.method==='GET')return res.status(200).json(await community.snapshot(req.headers['x-kizuna-device']));
  if(req.method==='POST'){
   if(Number(req.headers['content-length']||0)>12000)return res.status(413).json({error:'Nội dung quá dài.'});
   return res.status(200).json(await community.mutate(req.body||{}));
  }
  res.setHeader('Allow','GET, POST');return res.status(405).json({error:'Method not allowed'});
 }catch(e){console.error('community api',e?.message);return res.status(e.status||500).json({error:e.status?e.message:'Không thể lưu dữ liệu cộng đồng. Vui lòng thử lại.'});}
}
