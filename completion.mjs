// Completion follows the final reply, and never replays on a filter or modal render.
const terminalSteps=new Set(['salary-draft','computer-compare','friends-updated','friends-later']);
export function createCompletionCue({schedule=setTimeout,cancel=clearTimeout,highlight,celebrate,cleanup=()=>{}}){
  const seen=new WeakMap();let pending=null;
  const stop=()=>{if(pending)cancel(pending.timer);pending=null;};
  return (state,replyDuration=0)=>{
    const eligible=state.page==='chat'&&state.mode==='chat'&&!state.overlay&&terminalSteps.has(state.step);
    if(state.step==='welcome')seen.delete(state);
    const last=state.messages?.at(-1),key=state.scenario+'/'+state.step+'/'+last?.id;
    if(!eligible){stop();highlight(false);cleanup();return;}
    if(seen.get(state)?.has(key)){stop();highlight(true);return;}
    highlight(false);
    if(pending?.state===state&&pending.key===key)return;
    stop();const job={state,key};pending=job;
    job.timer=schedule(()=>{
      if(pending!==job)return;
      pending=null;
      if(state.mode!=='chat'||state.page!=='chat'||state.overlay||state.step!==key.split('/')[1])return;
      if(!seen.has(state))seen.set(state,new Set());seen.get(state).add(key);
      highlight(true,true);celebrate();
    },Math.max(0,replyDuration)+420);
  };
}
let confettiLayer=null;
function clearConfetti(){confettiLayer?.remove();confettiLayer=null;}
function celebrate(){
  clearConfetti();if(globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches)return;
  const phone=document.querySelector('#phone-wrap');if(!phone)return;
  const rect=phone.getBoundingClientRect(),layer=document.createElement('div');
  layer.className='completion-confetti';layer.setAttribute('aria-hidden','true');document.body.append(layer);confettiLayer=layer;
  const colors=['#72d7ef','#94ddad','#b49cf4','#ffcd77','#f2a6c3'];const animations=[];
  for(let side=0;side<2;side++)for(let i=0;i<18;i++){
    const piece=document.createElement('i'),spread=60+Math.random()*125,rise=90+Math.random()*190,spin=(Math.random()-.5)*650,dir=side?1:-1;
    piece.style.cssText=`left:${side?rect.right-8:rect.left+8}px;top:${rect.top+rect.height*(.45+Math.random()*.22)}px;background:${colors[i%colors.length]};width:${4+Math.random()*3}px;height:${6+Math.random()*5}px;border-radius:${i%4===0?'50%':'2px'}`;
    layer.append(piece);
    const pose=(x,y,r,scale=1)=>`translate3d(${x}px,${y}px,0) rotate(${r}deg) scale(${scale})`;
    animations.push(piece.animate([
      {transform:pose(0,0,0,.25),opacity:0},
      {transform:pose(dir*spread*.35,-rise*.65,spin*.25),opacity:.85,offset:.18},
      {transform:pose(dir*spread*.8,-rise,spin*.55),opacity:.8,offset:.43},
      {transform:pose(dir*spread,rise*.25,spin*.85),opacity:.65,offset:.78},
      {transform:pose(dir*spread*1.1,rise*.8,spin,.8),opacity:0}
    ],{duration:1600+Math.random()*500,delay:Math.random()*100,easing:'linear',fill:'both'}));
  }
  Promise.allSettled(animations.map(a=>a.finished)).then(()=>{layer.remove();if(confettiLayer===layer)confettiLayer=null;});
}
export const syncCompletion=createCompletionCue({
  highlight(ready,animate=false){
    const button=document.querySelector('#finish-task');if(!button)return;
    button.classList.toggle('is-ready',ready);
    if(!ready){button.getAnimations?.().forEach(a=>a.cancel());return;}
    if(animate&&!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches){
      button.animate([
        {transform:'scale(1)',backgroundColor:'transparent',boxShadow:'0 0 0 0 #ffdd2d00'},
        {transform:'scale(.94)',backgroundColor:'#ffe766',boxShadow:'0 0 0 0 #ffdd2d00',offset:.3},
        {transform:'scale(1.045)',backgroundColor:'#ffdd2d',boxShadow:'0 0 0 7px #ffdd2d22',offset:.65},
        {transform:'scale(1)',backgroundColor:'#ffdd2d',boxShadow:'0 3px 12px #ffdd2d35'}
      ],{duration:650,easing:'cubic-bezier(.22,.75,.2,1)'});
    }
  },celebrate,cleanup:clearConfetti
});
