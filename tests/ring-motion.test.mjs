import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ringTimeline,RING_REVEAL_DURATION} from '../ring-motion.mjs';
import {personalDonut} from '../personal.mjs';
import {sharedDonut} from '../shared.mjs';
test('ring builds clockwise from the largest sector with overlapping staggered segments',()=>{
 const plan=ringTimeline([.02,.04,.07,.08,.79]);assert.deepEqual(plan.map(s=>s.index),[4,3,2,1,0]);assert.equal(plan[0].delay,0);
 for(let i=1;i<plan.length;i++){assert.ok(plan[i].delay>plan[i-1].delay);assert.ok(plan[i].delay<plan[i-1].delay+plan[i-1].duration);}
 assert.ok(Math.abs(plan.at(-1).delay+plan.at(-1).duration-RING_REVEAL_DURATION)<.01);
 assert.ok(plan[0].duration>plan.at(-1).duration);
});
test('both ring renderers expose matching sectors, cap groups and percent labels',()=>{
 for(const render of [personalDonut,sharedDonut])for(const items of [[['Транспорт',20,'#428bf9'],['Техника',80,'#fa6b78']],[['Транспорт',100,'#428bf9']]]){
 const svg=render(items);for(const attribute of ['data-ring-sector','data-ring-cap','data-ring-label'])assert.equal((svg.match(new RegExp(attribute+'=','g'))||[]).length,items.length);
 assert.equal((svg.match(/data-ring-share=/g)||[]).length,items.length);
 }
});
