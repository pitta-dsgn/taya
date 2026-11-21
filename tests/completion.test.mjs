import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createCompletionCue} from '../completion.mjs';
function fixture(){let next=0,bursts=0;const jobs=new Map(),highlights=[];const cue=createCompletionCue({schedule:(fn,delay)=>{jobs.set(++next,{fn,delay});return next;},cancel:id=>jobs.delete(id),highlight:ready=>highlights.push(ready),celebrate:()=>bursts++});const state={page:'chat',mode:'chat',overlay:null,scenario:'salary',step:'salary-draft',messages:[{id:9}]};return {cue,state,jobs,highlights,bursts:()=>bursts,fire:()=>{const [id,job]=jobs.entries().next().value;jobs.delete(id);job.fn();}};}
test('celebrates after final content plus a pause and only once per scenario run',()=>{
 const f=fixture();f.cue(f.state,1800);assert.equal(f.jobs.values().next().value.delay,2220);assert.equal(f.bursts(),0);assert.equal(f.highlights.at(-1),false);
 f.cue(f.state);assert.equal(f.jobs.size,1);f.fire();assert.equal(f.bursts(),1);assert.equal(f.highlights.at(-1),true);
 f.cue(f.state);assert.equal(f.jobs.size,0);assert.equal(f.bursts(),1);
 f.state.step='welcome';f.state.mode='typing';f.cue(f.state);f.state.step='salary-draft';f.state.mode='chat';f.cue(f.state,900);f.fire();assert.equal(f.bursts(),2);
});
test('leaving the scenario cancels a pending celebration; intermediate answers never celebrate',()=>{
 const f=fixture();f.cue(f.state,1800);f.state.mode='choose';f.cue(f.state);assert.equal(f.jobs.size,0);assert.equal(f.highlights.at(-1),false);
 f.state.mode='chat';f.state.step='salary-factors';f.cue(f.state,500);assert.equal(f.jobs.size,0);assert.equal(f.bursts(),0);
});
test('all final scenarios get a cue, and modal renders do not replay it',()=>{
 for(const step of ['salary-draft','computer-compare','friends-updated','friends-later']){const f=fixture();f.state.step=step;f.cue(f.state);f.fire();f.state.overlay='details';f.cue(f.state);f.state.overlay=null;f.cue(f.state);assert.equal(f.bursts(),1);assert.equal(f.highlights.at(-1),true);}
});
