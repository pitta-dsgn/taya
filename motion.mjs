// Shared motion for native-style charts and staged assistant replies.
const ease='cubic-bezier(.22,.75,.2,1)';
let chartKeys=new Set(),observer=null,replyAnimations=[],replyTimer=null;
const reduced=()=>globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
function animateRing(svg,delay=0){
  const ns='http://www.w3.org/2000/svg',id='reveal-'+Math.random().toString(36).slice(2);
  const defs=document.createElementNS(ns,'defs'),mask=document.createElementNS(ns,'mask'),circle=document.createElementNS(ns,'circle'),group=document.createElementNS(ns,'g');
  const view=svg.viewBox.baseVal,cx=view.x+view.width/2,cy=view.y+view.height/2,r=76,length=2*Math.PI*r;
  mask.id=id;mask.setAttribute('maskUnits','userSpaceOnUse');mask.setAttribute('x',String(view.x-30));mask.setAttribute('y',String(view.y-30));mask.setAttribute('width',String(view.width+60));mask.setAttribute('height',String(view.height+60));
  for(const [key,value]of Object.entries({cx,cy,r,fill:'none',stroke:'white','stroke-width':156,'stroke-dasharray':`${length} ${length}`,'stroke-dashoffset':length,transform:`rotate(-90 ${cx} ${cy})`}))circle.setAttribute(key,String(value));
  mask.append(circle);defs.append(mask);
  [...svg.children].filter(n=>n.tagName.toLowerCase()!=='defs').forEach(n=>group.append(n));group.setAttribute('mask',`url(#${id})`);svg.append(defs,group);
  const sweep=circle.animate([{strokeDashoffset:String(length)},{strokeDashoffset:'0'}],{duration:900,delay,easing:ease,fill:'both'});
  group.animate([{opacity:.55},{opacity:1}],{duration:450,delay,easing:ease,fill:'backwards'});
  sweep.finished.then(()=>{group.removeAttribute('mask');defs.remove();}).catch(()=>{});
}
function animateBars(container,delay=0){
  container.querySelectorAll('.bar,.personal-bar-space i').forEach((bar,i)=>{bar.style.transformOrigin='center bottom';bar.style.transformBox='fill-box';bar.animate([{transform:'scaleY(.02)',opacity:.15},{transform:'scaleY(1)',opacity:1}],{duration:680,delay:delay+i*55,easing:ease,fill:'backwards'});});
}
export function mountMotion(root,state,freshReply=false,pageChanged=false){
  observer?.disconnect();observer=null;
  if(reduced())return;
  const keyBase=[state.page,state.overlay||'',state.step].join('/'),nextKeys=new Set();
  const charts=[...root.querySelectorAll('svg.personal-donut,svg.donut,.personal-bars,svg.chart-svg')];
  const pending=[];
  charts.forEach((node,i)=>{const key=keyBase+'/'+i+'/'+(node.getAttribute('aria-label')||node.textContent);nextKeys.add(key);if(!chartKeys.has(key))pending.push(node);});
  chartKeys=nextKeys;
  const reveal=node=>{if(!node.isConnected)return;const delay=Number(node.closest('[data-reply-delay]')?.dataset.replyDelay||0);if(node.matches('.personal-bars,svg.chart-svg'))animateBars(node,delay);else animateRing(node,delay);};
  if(globalThis.IntersectionObserver){observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){reveal(entry.target);observer.unobserve(entry.target);}},{root,threshold:.2});pending.forEach(node=>observer.observe(node));}else pending.forEach(reveal);
  if(freshReply){
    clearTimeout(replyTimer);replyAnimations.forEach(a=>a.cancel());replyAnimations=[];
    const turn=root.querySelector('.chat-turn:last-child');if(!turn)return;
    const answer=turn.querySelector('.answer'),parts=[...answer.children];
    const thinking=document.createElement('span');thinking.className='assistant-thinking';thinking.setAttribute('aria-label','Тая думает');thinking.innerHTML='<i></i><i></i><i></i>';turn.prepend(thinking);
    let delay=360;
    for(const part of parts){part.dataset.replyDelay=String(delay);const duration=part.matches('p')?420:540;
      replyAnimations.push(part.animate([{opacity:0,transform:'translateY(9px)'},{opacity:1,transform:'translateY(0)'}],{duration,delay,easing:ease,fill:'backwards'}));
      delay+=part.matches('p')?Math.min(350,120+part.textContent.length*1.3):210;
    }
    const controls=root.querySelector('.quick-replies');if(controls){controls.inert=true;setTimeout(()=>{controls.inert=false;},Math.min(delay,2200));replyAnimations.push(controls.animate([{opacity:0,transform:'translateY(5px)'},{opacity:1,transform:'translateY(0)'}],{duration:320,delay:Math.min(delay,2200),easing:ease,fill:'backwards'}));}
    replyTimer=setTimeout(()=>thinking.remove(),360);
  }
}
export function pressFeedback(el){if(!el||reduced())return;el.animate([{transform:'scale(1)'},{transform:'scale(.965)',offset:.28},{transform:'scale(1)'}],{duration:360,easing:ease});}
