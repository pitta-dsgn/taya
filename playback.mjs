export class Playback {
 constructor({duration,steps,onStep=()=>{},onFrame=()=>{},onEnd=()=>{},clock={request:fn=>requestAnimationFrame(fn),cancel:id=>cancelAnimationFrame(id)}}){Object.assign(this,{duration,steps,onStep,onFrame,onEnd,clock});this.elapsed=0;this.index=0;this.running=false;this.last=null;this.handle=null;}
 play(){if(this.running||this.elapsed>=this.duration)return;this.running=true;this.last=null;this.handle=this.clock.request(t=>this.tick(t));}
 tick(time){if(!this.running)return;if(this.last!==null)this.elapsed=Math.min(this.duration,this.elapsed+Math.max(0,time-this.last));this.last=time;while(this.index<this.steps.length&&this.elapsed>=this.steps[this.index].at)this.onStep(this.steps[this.index++]);this.onFrame(this.elapsed/this.duration,this.elapsed);if(this.elapsed>=this.duration){this.running=false;this.onEnd();}else this.handle=this.clock.request(t=>this.tick(t));}
 pause(){this.running=false;this.last=null;if(this.handle!==null)this.clock.cancel(this.handle);}
 destroy(){this.pause();this.onStep=()=>{};this.onFrame=()=>{};this.onEnd=()=>{};}
}
