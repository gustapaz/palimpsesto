import {Hono} from 'hono';
import {getCookie,setCookie} from 'hono/cookie';
import {bodyLimit} from 'hono/body-limit';
import {seed,clean} from './editor.js';
import {page,workspace} from './view.js';
import assets from './assets.js';

const app=new Hono();
const ttl=604800000;
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const types={'/style.css':'text/css','/app.js':'text/javascript','/htmx.js':'text/javascript','/mark.svg':'image/svg+xml'};
app.use('*',async(c,next)=>{
 await next();
 c.header('X-Content-Type-Options','nosniff');
 c.header('Referrer-Policy','no-referrer');
 c.header('Content-Security-Policy',"default-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'");
 c.header('Cache-Control','no-store');
 c.header('Vary','HX-Request');
});
for(const path of Object.keys(types))app.get(path,c=>c.body(assets[path],200,{'Content-Type':types[path]+'; charset=utf-8'}));

function session(c,create=false){
 const existing=getCookie(c,'palimpsesto');
 if(uuid.test(existing??''))return existing;
 if(!create)return null;
 const id=crypto.randomUUID();
 writeCookie(c,id);
 return id;
}
function writeCookie(c,id){
 setCookie(c,'palimpsesto',id,{httpOnly:true,sameSite:'Strict',secure:new URL(c.req.url).protocol==='https:',path:'/',maxAge:ttl/1000});
}
async function read(db,id,now){
 const row=await db.prepare('SELECT document FROM archives WHERE id=? AND expires>?').bind(id,now).first();
 return row?JSON.parse(row.document):seed;
}
function show(c,revisions,details,status=200){
 const content=workspace(revisions,details);
 return c.html(c.req.header('HX-Request')==='true'?content:page(content),status);
}
app.get('/favicon.ico',c=>c.redirect('/mark.svg'));
app.get('/',open);
app.get('/archive',open);
async function open(c){
 const id=session(c,true);
 return show(c,await read(c.env.DB,id,Date.now()),{left:Number(c.req.query('left')),right:Number(c.req.query('right'))});
}
app.post('/archive',bodyLimit({maxSize:12000,onError:c=>c.text('Formulário muito grande.',413)}),async c=>{
 const id=session(c);
 if(!id || c.req.header('Origin')!==new URL(c.req.url).origin || !c.req.header('Content-Type')?.startsWith('application/x-www-form-urlencoded'))return c.text('Origem ou sessão inválida.',403);
 const db=c.env.DB,now=Date.now(),form=await c.req.parseBody();
 const revisions=await read(db,id,now),current=revisions.at(-1);
 const draft=clean(form.body);
 const problem=(notice,status,latest=revisions)=>show(c,latest,{notice,error:true,draft:draft??undefined},status);
 if(String(current.id)!==form.base)return problem('Outra aba publicou primeiro. Revise o texto preservado e publique novamente.',409);
 if(revisions.length>=15)return problem('A bancada atingiu o limite de revisões.',429);
 const source=revisions.find(item=>String(item.id)===form.source && item.id!==current.id);
 const body=form.action==='restore'?source?.body:form.action==='edit'?draft:null;
 if(!body)return problem('Escolha uma edição anterior ou preencha até 36 linhas e 1.800 caracteres.',422);
 if(form.action==='edit' && body===current.body)return problem('Altere o texto antes de publicar.',422);
 const idNext=current.id+1;
 const label=source&&form.action==='restore'?'Restauração de R'+source.id:'Revisão da bancada';
 const next=[...revisions,{id:idNext,label,body}];
 await db.prepare('DELETE FROM archives WHERE id IN (SELECT id FROM archives WHERE expires<=? ORDER BY expires LIMIT 24)').bind(now).run();
 const persisted=await db.prepare(`INSERT INTO archives(id,version,document,expires)
   SELECT ?,?,?,? WHERE EXISTS(SELECT 1 FROM archives WHERE id=?) OR (?=3 AND (SELECT count(*) FROM archives)<2000)
   ON CONFLICT(id) DO UPDATE SET version=excluded.version,document=excluded.document,expires=excluded.expires
   WHERE (CASE WHEN archives.expires>? THEN archives.version ELSE 3 END)=?
   RETURNING version`).bind(id,idNext,JSON.stringify(next),now+ttl,id,current.id,now,current.id).first();
 if(!persisted){
  const latest=await read(db,id,now);
  return latest.at(-1).id!==current.id
   ?problem('Outra aba publicou primeiro. Revise o texto preservado e publique novamente.',409,latest)
   :problem('A bancada está indisponível para gravação. Tente novamente.',429);
 }
 writeCookie(c,id);
 return show(c,next,{left:current.id,right:idNext,notice:'Revisão R'+idNext+' publicada.'});
});
app.onError((_error,c)=>c.text('O arquivo está temporariamente indisponível.',503));
export default app;
