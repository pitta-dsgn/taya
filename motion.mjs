import {ringTimeline,RING_REVEAL_DURATION} from './ring-motion.mjs?v=55';
// Shared motion for native-style charts and staged assistant replies.
const ease='cubic-bezier(.22,.75,.2,1)';
let chartKeys=new Set(),observer=null,replyAnimations=[],replyTimer=null,lastOverlay=null;
const reduced=()=>globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
function animateRing(svg,delay=0){
  const sectors=[...svg.querySelectorAll('[data-ring-sector]')];if(!sectors.length)return;
  const ns='http://www.w3.org/2000/svg',track=document.createElementNS(ns,'circle');
  for(const [key,value]of Object.entries({cx:177,cy:110,r:68.88,fill:'none',stroke:'#252527','stroke-width':26.24}))track.setAttribute(key,String(value));
  svg.insertBefore(track,sectors[0]);
  track.animate([{opacity:0},{opacity:.55,offset:.12},{opacity:.55,offset:.7},{opacity:0}],{duration:RING_REVEAL_DURATION,delay,fill:'both'}).finished.then(()=>track.remove()).catch(()=>track.remove());
  for(const timing of ringTimeline(sectors.map(n=>Number(n.dataset.ringShare)))){
    const sector=sectors[timing.index],at=delay+timing.delay;
    sector.animate([{opacity:0},{opacity:1}],{duration:timing.share<.15?160:90,delay:at,easing:'ease-out',fill:'both'});
    sector.querySelectorAll('path,circle').forEach(path=>{
      const length=path.getTotalLength();path.style.strokeDasharray=`${length} ${length}`;
      if(path.tagName.toLowerCase()==='circle')path.setAttribute('transform','rotate(-90 177 110)');
      const growth=path.animate([{strokeDashoffset:String(length)},{strokeDashoffset:'0'}],{duration:timing.duration,delay:at,easing:timing.share<.15?'cubic-bezier(.2,.35,.3,1)':'cubic-bezier(.28,.1,.2,1)',fill:'both'});
      growth.finished.then(()=>{growth.cancel();path.style.removeProperty('stroke-dasharray');if(path.tagName.toLowerCase()==='circle')path.removeAttribute('transform');}).catch(()=>{});
    });
    const cap=svg.querySelector(`[data-ring-cap="${timing.index}"]`),label=svg.querySelector(`[data-ring-label="${timing.index}"]`);
    cap?.animate([{opacity:0},{opacity:1}],{duration:200,delay:at+Math.max(0,timing.duration-200),easing:'ease-out',fill:'both'});
    label?.animate([{opacity:0},{opacity:1}],{duration:180,delay:at+Math.max(0,timing.duration-180),easing:'ease-out',fill:'both'});
  }
}
function animateBars(container,delay=0){
  container.querySelectorAll('.bar,.personal-bar-space i').forEach((bar,i)=>{bar.style.transformOrigin='center bottom';bar.style.transformBox='fill-box';bar.animate([{transform:'scaleY(.02)',opacity:.15},{transform:'scaleY(1)',opacity:1}],{duration:680,delay:delay+i*55,easing:ease,fill:'backwards'});});
}
export function mountMotion(root,state,freshReply=false,pageChanged=false){
  observer?.disconnect();observer=null;
  const opening=state.overlay&&state.overlay!==lastOverlay;lastOverlay=state.overlay;root.querySelector('.date-overlay')?.classList.toggle('is-opening',!!opening);
  if(reduced())return;
  const keyBase=[state.page,state.overlay||'',state.step].join('/'),nextKeys=new Set();
  const charts=[...root.querySelectorAll('svg.personal-donut,svg.donut,.personal-bars,svg.chart-svg')];
  const pending=[];
  charts.forEach((node,i)=>{const key=keyBase+'/'+i+'/'+(node.getAttribute('aria-label')||node.textContent);nextKeys.add(key);if(!chartKeys.has(key))pending.push(node);});
  chartKeys=nextKeys;
  const reveal=node=>{if(!node.isConnected)return;const delay=Number(node.closest('[data-reply-delay]')?.dataset.replyDelay||0);if(node.matches('.personal-bars,svg.chart-svg'))animateBars(node,delay);else animateRing(node,delay);};
  if(globalThis.IntersectionObserver){observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){reveal(entry.target);observer.unobserve(entry.target);}},{root,threshold:.2});pending.forEach(node=>observer.observe(node));}else pending.forEach(reveal);
  let replyEnd=0;
  if(freshReply){
    clearTimeout(replyTimer);replyAnimations.forEach(a=>a.cancel());replyAnimations=[];
    const turn=root.querySelector('.chat-turn:last-child');if(!turn)return;
    const answer=turn.querySelector('.answer'),parts=[...answer.children];
    const thinking=document.createElement('span');thinking.className='assistant-thinking';thinking.setAttribute('aria-label','Тая думает');thinking.innerHTML='<i></i><i></i><i></i>';turn.prepend(thinking);
    let delay=360;
    for(const part of parts){part.dataset.replyDelay=String(delay);const duration=part.matches('p')?420:540;
      replyEnd=Math.max(replyEnd,delay+duration);if(part.querySelector('svg.personal-donut,svg.donut,.personal-bars,svg.chart-svg'))replyEnd=Math.max(replyEnd,delay+Math.max(1100,RING_REVEAL_DURATION));
      replyAnimations.push(part.animate([{opacity:0,transform:'translateY(9px)'},{opacity:1,transform:'translateY(0)'}],{duration,delay,easing:ease,fill:'backwards'}));
      delay+=part.matches('p')?Math.min(350,120+part.textContent.length*1.3):210;
    }
    const controls=root.querySelector('.quick-replies');if(controls){controls.inert=true;setTimeout(()=>{controls.inert=false;},Math.min(delay,2200));replyAnimations.push(controls.animate([{opacity:0,transform:'translateY(5px)'},{opacity:1,transform:'translateY(0)'}],{duration:320,delay:Math.min(delay,2200),easing:ease,fill:'backwards'}));}
    replyEnd=Math.max(replyEnd,Math.min(delay,2200)+320);
    replyTimer=setTimeout(()=>thinking.remove(),360);
  }
  return replyEnd;
}
export function pressFeedback(el){if(!el||reduced()||el.classList?.contains('calendar-day'))return;el.animate([{transform:'scale(1)'},{transform:'scale(.965)',offset:.28},{transform:'scale(1)'}],{duration:360,easing:ease});}
