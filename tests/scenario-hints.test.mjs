import {test} from 'node:test';
import assert from 'node:assert/strict';
import {scenarioHint,revealKartHint} from '../scenario-hints.mjs';
const state=(scenario,step,overlay=null)=>({page:'chat',mode:'chat',scenario,step,overlay,shared:{kartHintRevealed:true}});
test('participant context covers every choice and input in the three scenarios',()=>{
 for(const [scenario,steps] of Object.entries({friends:['friends-confirm','friends-result','friends-kart'],computer:['computer-select','computer-result'],salary:['salary-intro','salary-usual-input','salary-regular','salary-edit','salary-uncertain','salary-factors','salary-dates','salary-holiday','salary-holiday-select','salary-bonus','salary-summary','salary-free']}))for(const step of steps)assert.ok(scenarioHint(state(scenario,step)),step);
 assert.match(scenarioHint(state('friends','friends-confirm')),/Аней и Даней/);
 assert.match(scenarioHint(state('salary','salary-dates','salary-calendar')),/19 по 25 октября/);
 for(const overlay of ['personal-november','personal-compare','shared-november'])assert.equal(scenarioHint(state('computer','computer-result',overlay)),'');
});
test('context stays out of task selection, animation and bank screens',()=>{
 for(const overrides of [{page:'home'},{page:'bank'},{mode:'typing'},{mode:'choose'},{step:'welcome'}])assert.equal(scenarioHint({...state('salary','salary-summary'),...overrides}),'');
});

test('karting context waits for the end of the reply and stays unchanged when choosing transfers',()=>{
 const s=state('friends','friends-result');s.shared.kartHintRevealed=false;
 assert.equal(scenarioHint(s),'');assert.equal(revealKartHint(s,{scrollHeight:1200,scrollTop:100,clientHeight:500}),false);assert.equal(scenarioHint(s),'');
 assert.equal(revealKartHint(s,{scrollHeight:1200,scrollTop:700,clientHeight:500}),true);
 const context=scenarioHint(s);assert.match(context,/Максимом/);s.step='friends-kart';assert.equal(scenarioHint(s),context);
});

test('final answers have no sidebar comment and payment amounts stay together',()=>{
 for(const [scenario,step] of [['friends','friends-updated'],['friends','friends-later'],['computer','computer-compare'],['salary','salary-draft']])assert.equal(scenarioHint(state(scenario,step)),'');
 assert.match(scenarioHint(state('salary','salary-regular')),/40 000 ₽/);assert.match(scenarioHint(state('salary','salary-regular')),/21 818 ₽/);
 assert.doesNotMatch(scenarioHint(state('computer','computer-select')),/порог/);assert.doesNotMatch(scenarioHint(state('computer','computer-result')),/Для этого/);
});
