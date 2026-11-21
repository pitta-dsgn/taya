import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initialSalary,salarySheet,salaryAction} from '../salary.mjs';

test('vacation calendar starts empty and requires both endpoints before continuing',()=>{
  const state={payroll:initialSalary(),overlay:'salary-calendar'};
  const turns=[],notices=[],deps={render(){},transition(...args){turns.push(args);},toast(s){notices.push(s);}};
  const click=(action,dataset={})=>salaryAction(action,{dataset},state,deps);
  const before=salarySheet(state);
  assert.equal(state.payroll.from,null);assert.equal(state.payroll.to,null);
  assert.match(before,/Начало отпуска/);assert.match(before,/Конец отпуска/);
  assert.equal((before.match(/Выбрать дату/g)||[]).length,2);
  assert.ok(!before.includes('class="calendar-day in-range'));
  assert.match(before,/data-action="s-dates-done" disabled/);
  click('s-dates-done');assert.equal(turns.length,0);assert.equal(notices.length,1);
  click('s-day',{date:'2025-10-19'});assert.equal(state.payroll.to,null);
  assert.match(salarySheet(state),/data-action="s-dates-done" disabled/);
  click('s-day',{date:'2025-10-25'});
  assert.doesNotMatch(salarySheet(state),/data-action="s-dates-done" disabled/);
  click('s-dates-done');assert.deepEqual(turns,[['salary-holiday','Отпуск 19 октября — 25 октября']]);
});

test('vacation can span months and editing start never leaves an inverted range',()=>{
  const state={payroll:initialSalary(),overlay:'salary-calendar'};
  const deps={render(){},transition(){},toast(){}};
  const click=(action,dataset={})=>salaryAction(action,{dataset},state,deps);
  click('s-day',{date:'2025-08-29'});click('s-day',{date:'2025-09-07'});
  assert.equal(state.payroll.from,'2025-08-29');assert.equal(state.payroll.to,'2025-09-07');
  click('s-date-edit',{field:'from'});click('s-day',{date:'2025-10-10'});
  assert.equal(state.payroll.from,'2025-10-10');assert.equal(state.payroll.to,null);
  click('s-day',{date:'2025-10-05'});
  assert.equal(state.payroll.from,'2025-10-05');assert.equal(state.payroll.to,'2025-10-10');
});
