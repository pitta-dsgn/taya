import {test} from 'node:test';
import assert from 'node:assert/strict';
import {scenarioHint} from '../scenario-hints.mjs';
const state=(scenario,step,overlay=null)=>({page:'chat',mode:'chat',scenario,step,overlay});
test('participant context covers every choice and input in the three scenarios',()=>{
 for(const [scenario,steps] of Object.entries({friends:['friends-confirm','friends-result','friends-kart','friends-updated','friends-later'],computer:['computer-select','computer-result','computer-compare'],salary:['salary-intro','salary-usual-input','salary-regular','salary-edit','salary-uncertain','salary-factors','salary-dates','salary-holiday','salary-holiday-select','salary-bonus','salary-summary','salary-free','salary-draft']}))for(const step of steps)assert.ok(scenarioHint(state(scenario,step)),step);
 assert.match(scenarioHint(state('friends','friends-confirm')),/Аней и Даней/);
 assert.match(scenarioHint(state('salary','salary-dates','salary-calendar')),/19 по 25 октября/);
 for(const overlay of ['personal-november','personal-compare','shared-november'])assert.ok(scenarioHint(state('computer','computer-result',overlay)));
});
test('context stays out of task selection, animation and bank screens',()=>{
 for(const overrides of [{page:'home'},{page:'bank'},{mode:'typing'},{mode:'choose'},{step:'welcome'}])assert.equal(scenarioHint({...state('salary','salary-summary'),...overrides}),'');
});
