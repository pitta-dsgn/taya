import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initialShared,sharedReport,saveSharedSnapshot,sharedSnapshot,visualSharedShares} from '../shared-model.mjs';
import {sharedAnswer,sharedAction,sharedSheet,sharedDonut} from '../shared.mjs';

test('monthly own expenses reconcile confirmed refunds without changing the ledger',()=>{
 const s=initialShared();assert.equal(s.dinnerSelected.size,0);assert.equal(s.kartSelected.size,0);
 assert.equal(sharedReport(s).total,253000);
 s.appliedDinner=new Set(['anna','danya']);const first=saveSharedSnapshot(s),r=sharedReport(s);
 assert.equal(r.total,247000);assert.equal(r.dinnerOwn,2000);assert.equal(r.returned,6000);
 assert.equal(r.ledger.filter(x=>x.episode==='картинг').length,0);assert.equal(r.ledger.find(x=>x.id==='kart').amount,-12000);
 assert.equal(r.raw,253000);assert.equal(r.categories.reduce((a,x)=>a+x[1],0),r.total);
 s.appliedKart=new Set(['maxim','olya','sasha']);saveSharedSnapshot(s);const updated=sharedReport(s);
 assert.equal(updated.ledger.filter(x=>x.episode==='картинг').length,3);assert.equal(sharedReport(sharedSnapshot(s,first.id)).ledger.filter(x=>x.episode==='картинг').length,0);
 assert.equal(updated.total,238000);assert.equal(updated.kartOwn,3000);assert.equal(updated.returned,15000);
 assert.equal(sharedReport(sharedSnapshot(s,first.id)).total,247000);
 assert.equal(updated.ledger.find(x=>x.id==='restaurant').amount,-8000);
 assert.equal(updated.ledger.filter(x=>x.confirmed).length,5);
 const cafe=sharedReport(s,'Кафе и рестораны');assert.equal(cafe.total,2000);assert.equal(cafe.raw,8000);
 assert.ok(cafe.ledger.every(x=>x.id==='restaurant'||['anna','danya'].includes(x.id)));
});

test('no preselection, direct chart result, two karting actions, and skip preserves the first report',()=>{
 const state={scenario:'friends',step:'friends-confirm',shared:initialShared()};const turns=[],toast=[];
 const deps={render(){},transition(step,user){state.step=step;turns.push([step,user]);},toast(s){toast.push(s);}};
 const click=(a,dataset={})=>sharedAction(a,{dataset},state,deps);
 assert.deepEqual(sharedAnswer(state).quick,[]);
 click('f-toggle',{kind:'dinner',id:'anna'});assert.equal(sharedAnswer(state).quick[0][0],'f-dinner-apply');
 click('f-toggle',{kind:'dinner',id:'anna'});assert.deepEqual(sharedAnswer(state).quick,[]);
 state.step='friends-kart';assert.deepEqual(sharedAnswer(state).quick,[]);
 click('f-toggle',{kind:'kart',id:'maxim'});assert.equal(sharedAnswer(state).quick[0][0],'f-kart-apply');
 click('f-toggle',{kind:'kart',id:'maxim'});assert.deepEqual(sharedAnswer(state).quick,[]);state.step='friends-confirm';
 click('f-dinner-apply');assert.equal(turns.length,0);assert.equal(toast.length,1);
 click('f-toggle',{kind:'dinner',id:'anna'});click('f-toggle',{kind:'dinner',id:'danya'});click('f-dinner-apply');
 assert.equal(state.step,'friends-result');const answer=sharedAnswer(state);
 assert.match(answer.body,/247 000 ₽/);assert.match(answer.body,/shared-donut/);
 assert.deepEqual(answer.quick.map(x=>x[0]),['f-kart-select','f-kart-later']);
 assert.ok(!answer.quick.some(x=>x[1]==='Показать статистику'));
 click('f-kart-later');assert.equal(sharedReport(state.shared).total,247000);assert.equal(state.step,'friends-later');
});

test('detail snapshot and category filter preserve original paid and adjusted restaurant expense',()=>{
 const state={scenario:'friends',step:'friends-result',shared:initialShared(),overlay:null};
 state.shared.appliedDinner=new Set(['anna','danya']);const first=saveSharedSnapshot(state.shared);
 state.shared.appliedKart=new Set(['maxim','olya','sasha']);saveSharedSnapshot(state.shared);
 sharedAction('f-detail-open',{dataset:{snapshot:first.id}},state,{render(){}});
 assert.equal(state.overlay,'shared-november');assert.equal(state.shared.detailCategory,null);
 assert.match(sharedSheet(state),/247 000 ₽/);assert.doesNotMatch(sharedSheet(state),/Максим|Оля|Саша/);assert.match(sharedSheet(state),/Картинг/);
 assert.match(sharedSheet(state),/−8 000 ₽/);assert.match(sharedSheet(state),/−2 000 ₽/);
 sharedAction('f-category',{dataset:{value:'Кафе и рестораны'}},state,{render(){}});
 assert.match(sharedSheet(state),/personal-sheet-total">2 000 ₽/);
 assert.equal(sharedReport(state.shared).total,238000);
});

test('small category caps are separated while labels retain actual percentages',()=>{
 const values=[2000,3000,6000,9000,18000,200000],shares=visualSharedShares(values);
 assert.ok(shares.every(x=>x>=.065));assert.ok(Math.abs(shares.reduce((a,x)=>a+x,0)-1)<1e-9);
 assert.ok(2*68.88*Math.sin(Math.PI*Math.min(...shares))>26.24);
 const svg=sharedDonut(sharedReport({...initialShared(),appliedDinner:new Set(['anna','danya']),appliedKart:new Set(['maxim','olya','sasha'])}).categories);
 assert.match(svg,/84%/);assert.ok(!svg.includes('NaN'));assert.ok(svg.includes('#fa6b78'));assert.ok(svg.includes('#ffb03b'));
 const one=sharedDonut([['Техника',200000,'#fa6b78']]);assert.match(one,/100%/);assert.ok(!one.includes('clipPath'));
});
