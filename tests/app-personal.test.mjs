import * as shared from '../shared.mjs';
import * as sharedModel from '../shared-model.mjs';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import * as model from '../model.mjs';
import * as conversation from '../conversation.mjs';
import * as personal from '../personal.mjs';
import * as personalModel from '../personal-model.mjs';
import * as motion from '../motion.mjs';
import * as payroll from '../salary.mjs';
import {Playback} from '../playback.mjs';

test('the application completes all three final flows and returns analytics to chat',async()=>{
  const nodes=new Map(),listeners={};
  class Element {
    constructor(key){this.key=key;this.value='';this.innerHTML='';this.children=[];this.dataset={};this.style={setProperty(){}};this.classList={add(){},remove(){},toggle(){},contains(){return false;}};this.scrollTop=0;this.scrollHeight=26;this.offsetWidth=402;this.offsetHeight=874;}
    querySelector(selector){if(['.personal-overlay','.personal-carousel'].includes(selector))return null;if(selector==='.chat-scroll'&&!this.innerHTML.includes('chat-scroll'))return null;return node(selector);}
    querySelectorAll(){return [];}
    closest(){return node('screen');}
    addEventListener(name,fn){if(this.key==='#app')listeners[name]=fn;}
    getBoundingClientRect(){return {left:0,top:0,width:402,height:874};}
    setAttribute(){} scrollTo(){} focus(){} remove(){} append(){}
    animate(){return {pause(){},cancel(){},finished:Promise.resolve()};}
  }
  function node(key){if(!nodes.has(key))nodes.set(key,new Element(key));return nodes.get(key);}
  const context={...shared,...sharedModel,...motion,...payroll,...model,...conversation,...personal,...personalModel,mountMotion(){},syncCompletion(){},pressFeedback(){},Playback,document:{querySelector:node,querySelectorAll:()=>[],addEventListener(){},createElement:()=>new Element('created')},window:{innerWidth:1440,innerHeight:1000,scrollTo(){},addEventListener(){}},matchMedia:()=>({matches:true}),requestAnimationFrame:()=>1,cancelAnimationFrame(){},setTimeout:()=>1,clearTimeout(){},console};
  vm.createContext(context);
  const source=(await readFile(new URL('../app.mjs',import.meta.url),'utf8')).replace(/^import .*;\n/gm,'');
  vm.runInContext(source+'\nglobalThis.demo={state:()=>state,send,render,answer,finish,completedScenarios,playReimbursement};',context);
  const demo=context.demo,state=demo.state();state.page='chat';state.mode='chat';
  node('#message').value='Хочу убрать крупные покупки из статистики расходов';demo.send();
  assert.equal(state.step,'computer-select');assert.match(node('#app').innerHTML,/Почему эти покупки/);
  const click=async(action,dataset={})=>listeners.click({target:{closest:()=>({disabled:false,dataset:{action,...dataset}})}});
  await click('p-reason');assert.match(node('#app').innerHTML,/последние 3 месяца/);
  await click('p-result');assert.equal(state.step,'computer-result');
  await click('p-detail-open');assert.equal(state.overlay,'personal-november');assert.match(node('#app').innerHTML,/Не учитывается в расчёте/);
  await click('close-sheet');assert.equal(state.overlay,null);assert.equal(state.step,'computer-result');
  await click('p-compare');assert.equal(state.step,'computer-compare');assert.match(node('#app').innerHTML,/Турагентство/);
  await click('p-month',{month:'1'});await click('p-compare-open');assert.equal(state.personal.month,1);assert.equal(state.overlay,'personal-compare');
  await click('p-mode',{mode:'donut'});assert.match(node('#app').innerHTML,/personal-carousel/);
  await click('close-sheet');assert.equal(state.personal.month,1);assert.equal(state.step,'computer-compare');
  const before=state.messages.length;await click('p-july');assert.equal(state.messages.length,before);assert.equal(state.personal.julyExcluded,false);
  assert.equal(personalModel.personalComparison(state.personal).total,372000);
  demo.finish();assert.equal(state.mode,'choose');assert.equal(demo.completedScenarios.has('computer'),true);state.mode='chat';
  node('#message').value='Помоги проверить, всё ли мне выплатили за октябрь';demo.send();
  assert.equal(state.step,'salary-intro');assert.match(node('#app').innerHTML,/Заработная плата/);
  await click('s-usual');assert.equal(state.step,'salary-regular');
  await click('s-confirm');assert.equal(state.step,'salary-factors');
  assert.equal(state.payroll.factors.size,0);assert.equal(demo.answer().quick.length,0);
  for(const value of ['Отпуск','Премию','Возмещение расходов'])await click('s-factor',{value});
  await click('s-continue');assert.equal(state.step,'salary-dates');
  const previousAnimationFrame=globalThis.requestAnimationFrame;globalThis.requestAnimationFrame=()=>1;
  await click('s-calendar');globalThis.requestAnimationFrame=previousAnimationFrame;assert.equal(state.overlay,'salary-calendar');assert.match(node('#app').innerHTML,/август/);
  assert.equal(state.payroll.from,null);assert.equal(state.payroll.to,null);
  await click('s-day',{date:'2025-10-19'});assert.equal(state.payroll.to,null);
  await click('s-day',{date:'2025-10-25'});
  await click('s-dates-done');assert.equal(state.step,'salary-holiday');
  await click('s-holiday-yes');assert.equal(state.step,'salary-bonus');
  await click('s-bonus-Премия');assert.equal(state.step,'salary-summary');
  assert.deepEqual(payroll.salarySummary(state.payroll),{regular:61818,holiday:19113,bonus:15000,salary:80931,total:95931});
  assert.equal(node('#reimbursement-guide').hidden,false);
  const normalTimeout=context.setTimeout;context.setTimeout=fn=>{fn();return 1;};
  const previousTurns=state.messages.length;await demo.playReimbursement();context.setTimeout=normalTimeout;
  assert.equal(state.messages.length,previousTurns+2);assert.equal(state.messages.at(-2).body,'6700 за возврат билета в командировку 30.09');assert.equal(node('#reimbursement-guide').hidden,true);
  assert.equal(state.step,'salary-draft');assert.match(node('#app').innerHTML,/6 700 ₽/);
  assert.match(node('#app').innerHTML,/30\sсентября/);
  demo.finish();assert.equal(demo.completedScenarios.has('salary'),true);state.mode='chat';
  await click('s-summary');await click('s-unsure');assert.equal(state.step,'salary-uncertain');
  state.scenario='friends';state.shared=sharedModel.initialShared();state.step='welcome';
  node('#message').value='В ноябре оплатила ресторан за друзей, потом они вернули свою часть. Хочу увидеть только свои расходы';demo.send();
  assert.equal(state.step,'friends-confirm');assert.equal(state.shared.dinnerSelected.size,0);
  await click('f-toggle',{kind:'dinner',id:'anna'});await click('f-toggle',{kind:'dinner',id:'danya'});
  await click('f-dinner-apply');assert.equal(state.step,'friends-result');assert.match(node('#app').innerHTML,/247 000 ₽/);
  await click('f-detail-open',{snapshot:'shared-0'});assert.equal(state.overlay,'shared-november');
  assert.match(node('#app').innerHTML,/−8 000 ₽/);assert.match(node('#app').innerHTML,/−2 000 ₽/);
  await click('close-sheet');assert.equal(state.step,'friends-result');
  await click('f-kart-select');assert.equal(state.step,'friends-kart');assert.equal(state.shared.kartSelected.size,0);
  for(const id of ['maxim','olya','sasha'])await click('f-toggle',{kind:'kart',id});
  await click('f-kart-apply');assert.equal(state.step,'friends-updated');assert.match(node('#app').innerHTML,/238 000 ₽/);
  await click('f-detail-open',{snapshot:'shared-0'});assert.match(node('#app').innerHTML,/personal-sheet-total">247 000 ₽/);
  await click('close-sheet');demo.finish();assert.equal(state.mode,'choose');assert.equal(demo.completedScenarios.size,3);


});
