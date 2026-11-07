export const seed = [
 {id:1,label:'Apontamento inicial',body:'A biblioteca flutuante retorna ao cais em agosto.\nO acervo ficará disponível às sextas-feiras.\nA equipe organiza uma roda de leitura.'},
 {id:2,label:'Revisão de serviço',body:'A biblioteca flutuante retorna ao cais em 22 de agosto.\nO acervo ficará disponível às sextas e aos sábados.\nA equipe organiza uma roda de leitura.\nO embarque será gratuito.'},
 {id:3,label:'Edição de abertura',body:'A biblioteca flutuante retorna ao cais em 22 de agosto.\nO acervo ficará disponível às sextas e aos sábados.\nA primeira roda de leitura começa às 15h.\nO embarque será gratuito.'},
];
export function diff(before,after){
 const a=before.split('\n'),b=after.split('\n');
 const table=Array.from({length:a.length+1},()=>new Uint8Array(b.length+1));
 for(let i=a.length-1;i>=0;i--)for(let j=b.length-1;j>=0;j--)table[i][j]=a[i]===b[j]?1+table[i+1][j+1]:Math.max(table[i+1][j],table[i][j+1]);
 const rows=[];
 for(let i=0,j=0;i<a.length||j<b.length;){
  if(i<a.length&&j<b.length&&a[i]===b[j]){rows.push({kind:'same',text:a[i]});i++;j++;}
  else if(i<a.length&&(j===b.length||table[i+1][j]>=table[i][j+1]))rows.push({kind:'removed',text:a[i++]});
  else rows.push({kind:'added',text:b[j++]});
 }
 return rows;
}
export function clean(value){
 if(typeof value!=='string')return null;
 const text=value.replace(/\r\n?/g,'\n').trim();
 return text && text.length<=1800 && text.split('\n').length<=36 ? text:null;
}
