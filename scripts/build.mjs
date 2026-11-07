import {build} from 'esbuild';
import {mkdir,readFile,writeFile,copyFile,unlink} from 'node:fs/promises';
const assets={};
for(const [path,file] of [['/app.js','public/app.js'],['/style.css','public/style.css'],['/mark.svg','public/mark.svg'],['/htmx.js','node_modules/htmx.org/dist/htmx.min.js']])assets[path]=await readFile(file,'utf8');
await mkdir('dist/server',{recursive:true});
await mkdir('dist/.openai/drizzle',{recursive:true});
await copyFile('.openai/hosting.json','dist/.openai/hosting.json');
await copyFile('migrations/0001_archives.sql','dist/.openai/drizzle/0001_archives.sql');
await writeFile('server/assets.js','export default '+JSON.stringify(assets));
try{await build({entryPoints:['server/worker.js'],outfile:'dist/server/index.js',bundle:true,format:'esm',platform:'browser',minify:true});}
finally{await unlink('server/assets.js');}
