import {animateRing,RING_REVEAL_DURATION} from './ring-motion.mjs?v=56';
// Shared motion for native-style charts and staged assistant replies.
const ease='cubic-bezier(.22,.75,.2,1)';
let chartKeys=new Set(),observer=null,replyAnimations=[],replyTimer=null,lastOverlay=null;
const reduced=()=>globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function animateBars(container,delay=0){
  container.querySelectorAll('.bar,.personal-bar-space i').forEach((bar,i)=>{bar.style.transformOrigin='center bottom';bar.style.transformBox='fill-box';bar.animate([{transform:'scaleY(.02)',opacity:.15},{transform:'scaleY(1)',opacity:1}],{duration:680,delay:delay+i*55,easing:ease,fill:'backwards'});});
}
export function mountMotion(root,state,freshReply=false,pageChanged=false){
  observer?.disconnect();observer=null;
  const opening=state.overlay&&state.overlay!==lastOverlay;lastOverlay=state.overlay;root.querySelector('.date-overlay')?.classList.toggle('is-opening',!!opening);
  if(reduced())return;
  const keyBase=[state.page,state.overlay||'',state.step].join('/'),nextKeys=new Set();
  const charts=[...root.querySelectorAll('svg[data-chart-motion="ring"],.personal-bars,svg.chart-svg')].filter(node=>{const pane=node.closest('.personal-ring-pane');return !pane||pane.classList.contains('current');});
  const pending=[];
  charts.forEach((node,i)=>{const key=keyBase+'/'+i+'/'+(node.getAttribute('aria-label')||node.textContent);if(chartKeys.has(key))nextKeys.add(key);else pending.push({node,key});});
  chartKeys=nextKeys;
  const reveal=({node,key})=>{if(!node.isConnected)return;chartKeys.add(key);const delay=Number(node.closest('[data-reply-delay]')?.dataset.replyDelay||0);if(node.matches('.personal-bars,svg.chart-svg'))animateBars(node,delay);else animateRing(node,delay);};
  if(globalThis.IntersectionObserver){observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){const chart=pending.find(item=>item.node===entry.target);if(chart)reveal(chart);observer.unobserve(entry.target);}},{root,threshold:.2});pending.forEach(({node})=>observer.observe(node));}else pending.forEach(reveal);
  let replyEnd=0;
  if(freshReply){
    clearTimeout(replyTimer);replyAnimations.forEach(a=>a.cancel());replyAnimations=[];
    const turn=root.querySelector('.chat-turn:last-child');if(!turn)return;
    const answer=turn.querySelector('.answer'),parts=[...answer.children];
    const thinking=document.createElement('span');thinking.className='assistant-thinking';thinking.setAttribute('aria-label','Тая думает');thinking.innerHTML='<i></i><i></i><i></i>';turn.prepend(thinking);
    let delay=360;
    for(const part of parts){part.dataset.replyDelay=String(delay);const duration=part.matches('p')?420:540;
      replyEnd=Math.max(replyEnd,delay+duration);if(part.querySelector('svg[data-chart-motion="ring"],.personal-bars,svg.chart-svg'))replyEnd=Math.max(replyEnd,delay+Math.max(1100,RING_REVEAL_DURATION));
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
