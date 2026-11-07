import test from 'node:test';
import assert from 'node:assert/strict';
import {openDatabase} from '../scripts/local.mjs';
import worker from '../dist/server/index.js';

const origin='https://example.invalid';
const call=(db,path,cookie,form)=>worker.fetch(new Request(origin+path,{
 method:form?'POST':'GET',headers:{...(cookie?{Cookie:cookie}:{}),...(form?{Origin:origin,'Content-Type':'application/x-www-form-urlencoded'}:{})},body:form?new URLSearchParams(form):undefined,
}),{DB:db});
test('edições concorrentes preservam o rascunho e conteúdo é escapado',async()=>{
 const db=openDatabase();
 try{
  const cookie=(await call(db,'/')).headers.get('set-cookie').split(';')[0];
  const responses=await Promise.all(['<script>alert(1)</script>','Segunda proposta'].map(body=>call(db,'/archive',cookie,{base:3,action:'edit',body})));
  assert.deepEqual(responses.map(r=>r.status).sort(),[200,409]);
  const html=await responses[0].text();
  assert.match(html,/&lt;script&gt;/);
  assert.doesNotMatch(html,/<script>alert/);
  assert.match(await (await call(db,'/',cookie)).text(),/R4/);
  assert.doesNotMatch(await (await call(db,'/')).text(),/R4/);
 }finally{db.close();}
});
test('restauração cria nova revisão e mantém a edição anterior',async()=>{
 const db=openDatabase();
 try{
  const cookie=(await call(db,'/')).headers.get('set-cookie').split(';')[0];
  const res=await call(db,'/archive',cookie,{base:3,action:'restore',source:1});
  assert.equal(res.status,200);
  assert.match(await res.text(),/Restauração de R1/);
  assert.match(await (await call(db,'/archive?left=1&right=4',cookie)).text(),/PROVA TIPOGRÁFICA \/ R1 → R4/);
  assert.equal((await call(db,'/archive',cookie,{base:4,action:'edit',body:'x'.repeat(1801)})).status,422);
 }finally{db.close();}
});
