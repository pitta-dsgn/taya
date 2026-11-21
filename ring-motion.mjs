// Sectors are stored from small to large counterclockwise in the static chart.
// Reveal them in reverse order to build the ring clockwise from twelve o'clock.
export const RING_REVEAL_DURATION=1050;
export function ringTimeline(shares){
  const sectors=shares.map((share,index)=>({index,share})).reverse();
  const raw=sectors.map(s=>180+720*Math.sqrt(Math.max(0,s.share)));
  const stride=sectors.map(s=>s.share<.15?.48:.82);
  const span=raw.reduce((sum,d,i)=>sum+d*(i===raw.length-1?1:stride[i]),0),scale=RING_REVEAL_DURATION/(span||1);
  let start=0;
  return sectors.map((s,i)=>{const duration=raw[i]*scale,delay=start;start+=duration*stride[i];return {...s,delay,duration};});
}

export function animateRing(svg,delay=0){
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
