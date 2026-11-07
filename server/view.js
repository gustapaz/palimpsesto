import {html} from 'hono/html';
import {diff} from './editor.js';

export function workspace(revisions,{left,right,notice='',error=false,draft}={}){
 const current=revisions.at(-1);
 const a=revisions.find(item=>item.id===left)??revisions[0];
 const b=revisions.find(item=>item.id===right)??current;
 const [before,after]=a.id<=b.id?[a,b]:[b,a];
 const options=selected=>revisions.map(item=>html`<option value="${item.id}" ${item.id===selected?'selected':''}>R${item.id} · ${item.label}</option>`);
 return html`<section id="archive" aria-label="Bancada editorial">
 <aside class="rail"><p class="eyebrow">ARQUIVO / 01</p><h2>Histórico</h2><ol>${[...revisions].reverse().map(item=>html`
 <li><span class="number">R${item.id}</span><div><strong>${item.label}</strong>${item.id===current.id?html`<small>Edição atual</small>`:''}</div></li>`)}</ol>
 <p class="caption">As alterações desta bancada ficam isoladas no seu navegador por sete dias.</p></aside>
 <article class="proof" id="proof"><p class="eyebrow">PROVA TIPOGRÁFICA / R${before.id} → R${after.id}</p><h2>O que mudou</h2>
 <form action="/archive" method="get" hx-get="/archive" hx-select="#proof" hx-target="#proof" hx-swap="outerHTML" class="compare">
 <label for="left">Revisão anterior<select id="left" name="left">${options(before.id)}</select></label>
 <label for="right">Revisão posterior<select id="right" name="right">${options(after.id)}</select></label><button type="submit">Comparar</button></form>
 <ol class="diff" aria-label="Diferenças entre revisões">${diff(before.body,after.body).map(row=>html`<li class="${row.kind}"><span aria-hidden="true">${row.kind==='added'?'+':row.kind==='removed'?'−':'·'}</span><span class="sr-only">${row.kind==='added'?'Adicionado: ':row.kind==='removed'?'Removido: ':'Mantido: '}</span><span>${row.text||' '}</span></li>`)}</ol>
 <details><summary>Ler edição atual completa</summary><p class="current">${current.body}</p></details></article>
 <section class="desk" aria-labelledby="desk-title"><p class="eyebrow">MESA DE EDIÇÃO</p><h2 id="desk-title">Nova revisão</h2>
 <p id="result" role="${error?'alert':'status'}">${notice}</p>
 <form action="/archive" method="post" hx-post="/archive" hx-target="#archive" hx-swap="outerHTML">
 <input type="hidden" name="base" value="${current.id}"><input type="hidden" name="action" value="edit">
 <label for="draft">Texto do boletim</label><textarea id="draft" name="body" required maxlength="1800" rows="8">${draft??current.body}</textarea>
 <button class="primary" type="submit">Publicar revisão</button></form>
 <form action="/archive" method="post" hx-post="/archive" hx-target="#archive" hx-swap="outerHTML" class="restore">
 <input type="hidden" name="base" value="${current.id}"><input type="hidden" name="action" value="restore">
 <label for="source">Restaurar uma edição<select id="source" name="source">${revisions.slice(0,-1).map(item=>html`<option value="${item.id}">R${item.id} · ${item.label}</option>`)}</select></label>
 <button type="submit">Restaurar como nova</button></form></section>
 </section>`;
}
export function page(content){
 return html`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="Palimpsesto, arquivo editorial de revisões de um boletim fictício."><meta name="htmx-config" content='{"allowEval":false,"allowScriptTags":false,"includeIndicatorStyles":false,"historyEnabled":false}'><title>Palimpsesto — Arquivo editorial</title><link rel="stylesheet" href="/style.css"><link rel="icon" href="/mark.svg" type="image/svg+xml"><script defer src="/htmx.js"></script><script defer src="/app.js"></script></head><body>
 <a href="#archive" class="skip">Ir para a bancada</a><header><a class="brand" href="/"><img src="/mark.svg" width="34" height="34" alt=""> PALIMPSESTO</a><span>ARQUIVO EDITORIAL / DEMO</span></header>
 <main><div class="mast"><p class="eyebrow">BOLETIM DO CAIS · FOLHA 01</p><h1>Antes da <em>tinta.</em></h1><p>Uma biblioteca volta ao cais. Veja o que mudou até o boletim ficar pronto.</p></div>${content}</main>
 <footer>PALIMPSESTO <span>Boletim fictício. Use apenas texto de demonstração.</span></footer></body></html>`;
}
