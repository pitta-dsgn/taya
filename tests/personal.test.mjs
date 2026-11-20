import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initialPersonal,personalReport,personalComparison,personalOperations,parsePersonalThreshold,setPersonalThreshold} from '../personal-model.mjs';
import {personalAnswer,personalSheet,personalAction,personalDonut} from '../personal.mjs';

test('November reconciles the two exclusions and every category',()=>{
  const state=initialPersonal(),r=personalReport(state);
  assert.equal(r.raw,298000);assert.equal(r.total,53000);
  assert.deepEqual(r.excluded.map(x=>x.id),['dns','air']);
  assert.equal(r.categories.reduce((s,x)=>s+x[1],0),r.total);
  state.excluded.delete('air');assert.equal(personalReport(state).total,98000);
  state.excluded.clear();assert.equal(personalReport(state).total,298000);
  for(const op of personalOperations.filter(x=>x.month===5))state.excluded.add(op.id);
  assert.equal(personalReport(state).total,0);
});
test('six-month comparison excludes July agency and restoring it changes the arithmetic',()=>{
  const state=initialPersonal(),r=personalComparison(state);
  assert.deepEqual(r.values,[50000,52000,51000,54000,52000,53000]);
  assert.equal(r.total,312000);assert.equal(r.average,52000);
  assert.equal(r.reports[1].raw,112000);assert.equal(r.reports[1].excluded[0].id,'agency');
  state.julyExcluded=false;
  assert.equal(personalComparison(state).total,372000);
  assert.equal(personalComparison(state).values[1],112000);
});
test('category filter leaves the underlying ledger and totals intact',()=>{
  const s=initialPersonal(),r=personalReport(s,5,false,'Кафе и рестораны');
  assert.equal(r.total,20000);assert.equal(r.operations.length,2);
  assert.equal(personalReport(s).raw,298000);
});
test('natural-language threshold selects operations by actual amount',()=>{
  assert.equal(parsePersonalThreshold('Убери покупки дороже 50 тысяч'),50000);
  assert.equal(parsePersonalThreshold('100 000 ₽'),100000);
  assert.equal(parsePersonalThreshold('Хочу убрать крупные покупки'),null);
  const s=initialPersonal();setPersonalThreshold(s,10000);
  assert.deepEqual([...s.excluded],['dns','grocery-a-5','air','restaurant-b-5']);
  assert.equal(personalReport(s).total,26200);
});
test('main flow, modal close target and toggles do not create extra chat turns',()=>{
  const state={scenario:'computer',step:'computer-select',personal:initialPersonal(),overlay:null};
  const turns=[];let renders=0;const deps={render:()=>renders++,transition:(step,user)=>{state.step=step;turns.push([step,user]);}};
  assert.match(personalAnswer(state).body,/Почему эти покупки/);
  assert.ok(!personalAnswer(state).body.includes('Похожих платежей'));
  personalAction('p-reason',{dataset:{}},state,deps);
  assert.match(personalAnswer(state).body,/последние 3 месяца/);
  personalAction('p-result',{dataset:{}},state,deps);
  assert.deepEqual(turns[0],['computer-result','Показать статистику']);
  personalAction('p-detail-open',{dataset:{}},state,deps);
  assert.match(personalSheet(state),/Не учитывается в расчёте/);
  assert.match(personalSheet(state),/Закрыть/);
  assert.ok(!personalSheet(state).includes('Все категории'));
  personalAction('p-category',{dataset:{value:'Кафе и рестораны'}},state,deps);
  assert.match(personalSheet(state),/20/);
  personalAction('p-compare',{dataset:{}},state,deps);
  assert.equal(state.step,'computer-compare');
  assert.match(personalAnswer(state).body,/Турагентство/);
  assert.ok(!personalAnswer(state).body.includes('компьютер'));
  personalAction('p-month',{dataset:{month:'1'}},state,deps);
  personalAction('p-compare-open',{dataset:{}},state,deps);
  assert.match(personalSheet(state),/Турагентство/);
  personalAction('p-mode',{dataset:{mode:'donut'}},state,deps);
  assert.match(personalSheet(state),/personal-carousel/);
  assert.equal(turns.length,2);assert.ok(renders>0);
});
test('one-category donut is an unbroken circle without a contact shadow',()=>{
  const svg=personalDonut([['Кафе и рестораны',20000,'#00d941']]);
  assert.match(svg,/100%/);assert.ok(!svg.includes('clipPath'));
  assert.ok(!svg.includes('NaN'));
});
