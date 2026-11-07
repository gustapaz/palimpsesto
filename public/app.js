document.body.addEventListener('htmx:beforeSwap',event=>{
 if([409,422,429].includes(event.detail.xhr.status)&&event.detail.target?.id==='archive'){
  event.detail.shouldSwap=true;
  event.detail.isError=false;
 }
});
