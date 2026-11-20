import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import * as model from '../model.mjs';
import * as conversation from '../conversation.mjs';
import * as personal from '../personal.mjs';
import * as personalModel from '../personal-model.mjs';
import {Playback} from '../playback.mjs';

test('the application routes the new B request through comparison and closes analytics back into chat',async()=>{
  const nodes=new Map(),listeners={};
  class Element {
    constructor(key){this.key=key;this.value='';this.innerHTML='';this.children=[];this.dataset={};this.style={setProperty(){}};this.classList={add(){},remove(){},toggle(){},contains(){return false;}};this.scrollTop=0;this.scrollHeight=26;this.offsetWidth=402;this.offsetHeight=874;}
    querySelector(selector){if(['.personal-overlay','.personal-carousel'].includes(selector))return null;if(selector==='.chat-scroll'&&!this.innerHTML.includes('chat-scroll'))return null;return node(selector);}
    querySelectorAll(){return [];}
    closest(){return node('screen');}
    addEventListener(name,fn){if(this.key==='#app')listeners[name]=fn;}
    setAttribute(){} scrollTo(){} focus(){} remove(){} append(){}
    animate(){return {pause(){},cancel(){},finished:Promise.resolve()};}
  }
  function node(key){if(!nodes.has(key))nodes.set(key,new Element(key));return nodes.get(key);}
  const context={...model,...conversation,...personal,...personalModel,Playback,document:{querySelector:node,querySelectorAll:()=>[],addEventListener(){},createElement:()=>new Element('created')},window:{innerWidth:1440,innerHeight:1000,scrollTo(){},addEventListener(){}},matchMedia:()=>({matches:true}),requestAnimationFrame:()=>1,cancelAnimationFrame(){},setTimeout:()=>1,clearTimeout(){},console};
  vm.createContext(context);
  const source=(await readFile(new URL('../app.mjs',import.meta.url),'utf8')).replace(/^import .*;\n/gm,'');
  vm.runInContext(source+'\nglobalThis.demo={state:()=>state,send,render,answer};',context);
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
});
