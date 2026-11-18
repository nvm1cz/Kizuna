import fs from 'node:fs/promises';
import path from 'node:path';
export function localStore(base=path.join(process.cwd(),'.local','community')){
 return {
  async readItems(kind){try{const entries=await fs.readdir(path.join(base,kind));const arr=await Promise.all(entries.filter(x=>x.endsWith('.json')).map(async x=>JSON.parse(await fs.readFile(path.join(base,kind,x),'utf8'))));return arr;}catch(e){if(e.code==='ENOENT')return [];throw e;}},
  async writeItem(kind,id,obj){const dir=path.join(base,kind);await fs.mkdir(dir,{recursive:true});const file=path.join(dir,encodeURIComponent(id)+'.json');try{await fs.writeFile(file,JSON.stringify(obj),{flag:'wx'});}catch(e){if(e.code==='EEXIST')throw Object.assign(new Error('duplicate'),{code:'DUPLICATE'});throw e;}}
 };
}
