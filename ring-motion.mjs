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
