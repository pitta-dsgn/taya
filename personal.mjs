import {money,typo,escape} from './model.mjs?v=49';
import {personalMonths,personalCategoryOrder,personalColors,personalOperations,personalCandidates,personalReport,personalComparison,isPersonalExcluded,setPersonalThreshold,parsePersonalThreshold} from './personal-model.mjs?v=49';
const text=s=>escape(typo(String(s)));
const button=(action,label,cls='',attrs='')=>`<button type="button" class="${cls}" data-action="${action}" ${attrs}>${label}</button>`;
const svgIcon=body=>`<svg viewBox="-12 -12 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
export function personalIcon(name){
  if(name==='Кафе и рестораны')return svgIcon('<path d="M-7-8v6m3-6v6m3-6v6q0 3-3 3v7M6-8v16M6-8q-5 4 0 7"/>');
  if(name==='Продукты')return svgIcon('<path d="m-9-2 3 9H6l3-9ZM-6-2l4-6m8 6L2-8M-3 1v3m6-3v3"/>');
  if(name==='Транспорт')return svgIcon('<rect x="-7" y="-9" width="14" height="15" rx="4"/><path d="M-6-2H6M-4 6l-2 3m10-3 2 3"/><circle cx="-3" cy="2" r=".8"/><circle cx="3" cy="2" r=".8"/>');
  if(name==='Техника')return svgIcon('<rect x="-9" y="-7" width="18" height="12" rx="2"/><path d="M0 5v4m-5 0H5"/>');
  if(name==='Путешествия')return svgIcon('<path d="m-9 1 7-2 2-8 2 8 7 2-7 2-2 6-2-6Z"/>');
  return svgIcon('<circle cx="-6" cy="0" r="1"/><circle cx="0" cy="0" r="1"/><circle cx="6" cy="0" r="1"/>');
}
let nextChart=0;
export function personalDonut(items){
  const data=items.filter(x=>x[1]>0).sort((a,b)=>a[1]-b[1]),total=data.reduce((a,x)=>a+x[1],0),id=`pd${++nextChart}`;
  if(!total)return '<div class="personal-empty">В расчёте нет покупок</div>';
  const point=(a,r)=>[177+r*Math.cos(a),110+r*Math.sin(a)];
  let cumulative=0;
  const arcs=[],caps=[],labels=[],defs=[];
  data.forEach(([name,value,color],i)=>{
    const share=value/total,end=-Math.PI/2-cumulative*Math.PI*2,start=end-share*Math.PI*2,p=point(start,68.88),q=point(end,68.88),label=point(data.length===1?Math.PI/2:end-share*Math.PI,104);
    defs.push(`<filter id="${id}glow${i}" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="8"/></filter>`);
    const path=data.length===1?`<circle cx="177" cy="110" r="68.88" fill="none" stroke="${color}" stroke-width="26.24"/>`:`<path d="M${p.join(' ')} A68.88 68.88 0 ${share>.5?1:0} 1 ${q.join(' ')}" fill="none" stroke="${color}" stroke-width="26.24" stroke-linecap="round"/>`;
    arcs.push(`<g opacity=".16" filter="url(#${id}glow${i})">${path}</g>${path}`);
    const glyph=personalIcon(name).replace('<svg ','<svg x="-8" y="-8" width="16" height="16" ');
    if(data.length>1){defs.push(`<clipPath id="${id}clip${i}"><rect x="0" y="-22" width="28" height="44"/></clipPath><filter id="${id}shadow${i}" x="-70%" y="-70%" width="240%" height="240%"><feGaussianBlur stdDeviation="3"/></filter>`);
      caps.push(`<g transform="translate(${q[0]} ${q[1]}) rotate(${end*180/Math.PI+90})" clip-path="url(#${id}clip${i})"><circle cx="3" cy="0" r="13" fill="black" opacity=".5" filter="url(#${id}shadow${i})"/></g><circle cx="${q[0]}" cy="${q[1]}" r="13.12" fill="${color}"/>`);}
    caps.push(`<g color="white" transform="translate(${q.join(' ')})">${glyph}</g>`);
    labels.push(`<text x="${label[0]}" y="${label[1]+4}" text-anchor="middle">${Math.round(share*100)}%</text>`);
    cumulative+=share;
  });
  return `<svg class="personal-donut" viewBox="0 0 354 220" role="img" aria-label="${text(data.map(x=>`${x[0]}: ${money(x[1])}`).join('; '))}"><defs>${defs.join('')}</defs>${arcs.join('')}${caps.join('')}${labels.join('')}</svg>`;
}
export function personalLegend(items,category=null,interactive=false){return `<div class="personal-legend">${items.map(([name,value,color])=>{
  const kind={'Кафе и рестораны':'cafe','Продукты':'products','Остальное':'other','Транспорт':'transport'}[name]||'other';
  const inner=`<span class="personal-category-icon" style="background:${color}">${personalIcon(name)}</span><span class="personal-category-name ${kind==='cafe'?'fade-name':''}">${text(name)}</span><span class="personal-category-value">${money(value)}</span>`;
  const attrs=`style="--category-color:${color}"`;
  return interactive?button('p-category',inner,`personal-chip category-${kind} ${category===name?'is-selected':''}`,`${attrs} data-value="${escape(name)}" aria-pressed="${category===name}"`):`<span class="personal-chip category-${kind}" ${attrs}>${inner}</span>`;
}).join('')}</div>`;}
const genitive=['июня','июля','августа','сентября','октября','ноября'];
function personalOperation(op,card=false,excluded=false){return `<div class="personal-operation ${card?'is-card':''} ${excluded?'is-excluded':''}"><span class="personal-merchant ${op.type||''} ${op.id==='agency'?'agency':op.id==='air'?'air':''}">${op.type?`<img src="./assets/icons/${op.type==='shop'?'grocery':'restaurant'}.svg" alt="">`:text(op.mark||'…')}</span><span class="personal-operation-info"><span>${text(op.title)}</span><small>${text(op.category==='Транспорт'?'Проезд':op.category)}</small></span><span class="personal-operation-money">−${money(op.amount)}<small>Black</small></span></div>`;}
function purchaseCard(op,excluded=false){return `<div class="personal-purchase"><p class="personal-date">${op.day} ${genitive[op.month]}</p>${personalOperation(op,true,excluded)}</div>`;}
function selection(state){const p=state.personal,candidates=p.threshold===null?personalCandidates:personalOperations.filter(x=>x.month===5&&x.amount>p.threshold);return `<div class="personal-selection">${candidates.map(op=>button('p-toggle',`<span class="personal-checkbox ${p.excluded.has(op.id)?'checked':''}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 12 4 4 8-8"/></svg></span><span class="personal-select-card">${purchaseCard(op)}</span>`,'personal-selection-row',`data-id="${op.id}" role="checkbox" aria-checked="${p.excluded.has(op.id)}"`)).join('')}</div>`;}
function note(state){const count=personalReport(state.personal).excluded.length;return count?`Без ${count} ${count===1?'крупной покупки':'крупных покупок'}`:'Все покупки в расчёте';}
const expand=action=>button(action,'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M14 4h6v6m0-6-7 7M10 20H4v-6m0 6 7-7"/></svg>','personal-expand','aria-label="Развернуть статистику"');
function novemberPreview(state){const r=personalReport(state.personal);return `<section class="personal-preview"><header><strong>${money(r.total)}</strong>${expand('p-detail-open')}</header><p class="personal-scope">Расходы за ноябрь</p><p class="personal-note">${text(note(state))}</p>${personalDonut(r.categories)}${personalLegend(r.categories)}</section>`;}
function comparisonBars(state){const p=state.personal,c=personalComparison(p),max=Math.max(60000,Math.ceil(Math.max(...c.values)/10000)*10000);return `<div class="personal-bars" role="group" aria-label="Расходы за шесть месяцев">${c.values.map((v,i)=>button('p-month',`<span class="personal-bar-space"><i style="height:${v/max*140}px"></i></span><span>${personalMonths[i].slice(0,3)}</span>`,`personal-bar ${p.month===i?'selected':p.month!==null?'muted':''}`,`data-month="${i}" aria-pressed="${p.month===i}" aria-label="${personalMonths[i]}: ${money(v)}"`)).join('')}</div>`;}
function comparisonPreview(state){const c=personalComparison(state.personal),month=state.personal.month;return `<section class="personal-preview is-comparison"><header><strong>${money(c.total)}</strong>${expand('p-compare-open')}</header><p class="personal-scope">Расходы за полгода</p><p class="personal-note">Без крупных разовых покупок</p>${comparisonBars(state)}<div class="personal-period-stat"><span>${month===null?'В среднем за месяц':personalMonths[month]}</span><strong>${money(month===null?c.average:c.values[month])}</strong></div><p class="personal-note">Нажмите на столбик, чтобы выбрать месяц</p></section>`;}
export function personalAnswer(state){
  if(!['computer-select','computer-result','computer-compare'].includes(state.step))return null;
  const p=state.personal;
  if(state.step==='computer-select')return {body:`<p>${p.threshold===null?'Нашла 2 разовые крупные покупки за ноябрь. Какие убрать из расчёта?':`Нашла покупки дороже ${money(p.threshold)}. Какие убрать из расчёта?`}</p>${selection(state)}${button('p-reason','Почему эти покупки?','personal-text-link',`aria-expanded="${p.reason}"`)}${p.reason?'<p class="personal-explanation">Эти покупки заметно дороже остальных в своих категориях. За последние 3 месяца похожих платежей не было.</p>':''}<p>Если вы имели в виду все покупки дороже определённой суммы, укажите её.</p>`,quick:[['p-result','Показать статистику']]};
  if(state.step==='computer-result')return {body:`<p>Готово. Вот расходы за ноябрь ${p.excluded.size?'без выбранных покупок':'со всеми покупками'}.</p>${novemberPreview(state)}<p class="personal-compare-offer">Сравнить расходы за последние полгода?</p>`,quick:[['p-compare','Сравнить за полгода']]};
  const c=personalComparison(p),stable=c.maximum-c.minimum<=10000;
  const agency=personalOperations.find(x=>x.id==='agency'),nov=personalOperations.filter(x=>x.month===5&&p.excluded.has(x.id));
  return {body:`${comparisonPreview(state)}<p>${stable?'Без крупных разовых покупок расходы почти не меняются: '+(c.minimum/1000).toLocaleString('ru-RU')+'–'+(c.maximum/1000).toLocaleString('ru-RU')+' тыс. ₽ в месяц.':'Сейчас в сравнении учтены выбранные вами покупки. Средние расходы — '+money(c.average)+' в месяц.'}</p><p>${p.julyExcluded?'В июле нашла ещё одну крупную разовую покупку и исключила её из сравнения.':'Покупка в турагентстве возвращена в расчёт июля.'}</p>${purchaseCard(agency)}${button('p-july',p.julyExcluded?'Вернуть в расчёт':'Исключить из расчёта','personal-text-link')}<p>${nov.length?'В ноябре сохранила выбранные вами исключения.':'В ноябре учитываю все покупки.'}</p>${nov.map(op=>purchaseCard(op)).join('')}<p>В остальные месяцы крупных разовых покупок не нашла.</p>`,quick:[]};
}
function operationsList(state,months,halfYear,category=null){return [...months].reverse().map(month=>{const r=personalReport(state.personal,month,halfYear,category);return `<section class="personal-month-list"><header><h3>${personalMonths[month]}</h3><span>−${money(r.raw)}</span></header>${r.operations.map((op,index)=>`<div class="personal-ledger-row">${index===0||r.operations[index-1].day!==op.day?`<p class="personal-date">${op.day} ${genitive[month]}</p>`:''}${personalOperation(op,false,isPersonalExcluded(op,state.personal,halfYear))}${isPersonalExcluded(op,state.personal,halfYear)?'<p class="personal-excluded-note">Не учитывается в расчёте</p>':''}</div>`).join('')}</section>`;}).join('');}
function switcher(mode){return `<div class="personal-chart-controls"><div class="personal-chart-switch" role="group" aria-label="Вид диаграммы">${button('p-mode','<img src="./assets/icons/donut.svg" alt="">',mode==='donut'?'active':'','data-mode="donut" aria-label="Круговая диаграмма" aria-pressed="'+(mode==='donut')+'"')}${button('p-mode','<img src="./assets/icons/bars.svg" alt="">',mode==='bars'?'active':'','data-mode="bars" aria-label="Столбчатый график" aria-pressed="'+(mode==='bars')+'"')}</div></div>`;}
function carousel(state){const month=state.personal.month??5;return `<div class="personal-carousel" aria-label="Месяцы: листайте диаграммы влево или вправо">${personalMonths.map((name,i)=>button('p-ring-month',personalDonut(personalReport(state.personal,i,true).categories),`personal-ring-pane ${month===i?'current':''}`,`data-month="${i}" aria-label="${name}" aria-pressed="${month===i}"`)).join('')}</div>`;}
export function personalSheet(state){if(!['personal-november','personal-compare'].includes(state.overlay))return null;const p=state.personal,half=state.overlay==='personal-compare',month=half?p.month:5,r=personalReport(p,month??5,half),c=personalComparison(p),category=half?null:p.detailCategory,view=category?personalReport(p,5,false,category):r;
  const title=half&&month===null?'Расходы за июнь–ноябрь':`Расходы за ${['июнь','июль','август','сентябрь','октябрь','ноябрь'][month??5]}`;
  return `<div class="personal-overlay" role="dialog" aria-modal="true" aria-label="Подробная статистика"><section class="personal-sheet ${half?'is-comparison':''}"><header class="personal-sheet-header">${button('close-sheet','Закрыть')}<h2>Статистика</h2></header><div class="personal-sheet-body" tabindex="0"><div class="personal-sheet-total">${money(half&&month===null?c.total:view.total)}</div><p class="personal-scope">${text(category?`${category} · ноябрь`:title)}</p><p class="personal-note">${text(half?'Без крупных разовых покупок':note(state))}</p>${half?(p.detailMode==='bars'?comparisonBars(state):carousel(state))+switcher(p.detailMode)+(p.detailMode==='donut'?personalLegend(r.categories):'')+(month===null?`<div class="personal-period-stat"><span>В среднем за месяц</span><strong>${money(c.average)}</strong></div>`:''):`${personalDonut(view.categories)}${personalLegend(r.categories,category,true)}`}${operationsList(state,half?(month===null?[0,1,2,3,4,5]:[month]):[5],half,category)}</div></section></div>`;
}
export function personalAction(action,el,state,{render,transition}){
  if(!action.startsWith('p-'))return false;const p=state.personal;
  if(action==='p-toggle'){p.excluded.has(el.dataset.id)?p.excluded.delete(el.dataset.id):p.excluded.add(el.dataset.id);}
  else if(action==='p-reason')p.reason=!p.reason;
  else if(action==='p-result'){transition('computer-result','Показать статистику');return true;}
  else if(action==='p-compare'){p.month=null;transition('computer-compare','Сравнить за полгода');return true;}
  else if(action==='p-detail-open'){state.overlay='personal-november';p.detailCategory=null;}
  else if(action==='p-compare-open'){state.overlay='personal-compare';p.detailMode='bars';}
  else if(action==='p-category')p.detailCategory=p.detailCategory===el.dataset.value?null:el.dataset.value;
  else if(action==='p-month'){const month=Number(el.dataset.month);p.month=p.month===month?null:month;}
  else if(action==='p-ring-month')p.month=Number(el.dataset.month);
  else if(action==='p-mode'){p.detailMode=el.dataset.mode;if(p.detailMode==='donut'&&p.month===null)p.month=5;}
  else if(action==='p-july')p.julyExcluded=!p.julyExcluded;
  render();return true;
}
export function personalTextRequest(value,state,{transition}){if(state.scenario!=='computer')return false;const amount=parsePersonalThreshold(value);if(state.step==='computer-select'&&amount!==null){setPersonalThreshold(state.personal,amount);state.personal.reason=false;transition('computer-select',value);return true;}if(state.step==='computer-result'&&/сравн|полгод|шесть|6\s*месяц/iu.test(value)){transition('computer-compare',value);return true;}return false;}
let dialogWasOpen=false;
export function mountPersonal(app,state,render){
  const active=state.scenario==='computer'&&['computer-select','computer-result','computer-compare'].includes(state.step);
  app.classList.toggle('personal-chat',active);app.closest('.screen')?.classList.toggle('personal-screen',active);
  const dialog=app.querySelector('.personal-overlay');
  for(const child of app.children)if(!child.classList.contains('personal-overlay'))child.inert=!!dialog;
  if(dialog&&!dialogWasOpen)dialog.querySelector('button')?.focus({preventScroll:true});dialogWasOpen=!!dialog;
  if(dialog)dialog.addEventListener('keydown',ev=>{if(ev.key!=='Tab')return;const focusable=[...dialog.querySelectorAll('button,[tabindex="0"]')];const first=focusable[0],last=focusable.at(-1);if(ev.shiftKey&&document.activeElement===first){ev.preventDefault();last.focus();}else if(!ev.shiftKey&&document.activeElement===last){ev.preventDefault();first.focus();}});
  const track=app.querySelector('.personal-carousel');if(!track)return;
  const cell=244;track.scrollLeft=(state.personal.month??5)*cell;
  let timer;track.addEventListener('scroll',()=>{clearTimeout(timer);timer=setTimeout(()=>{if(!track.isConnected)return;const month=Math.max(0,Math.min(5,Math.round(track.scrollLeft/cell)));if(month!==state.personal.month){state.personal.month=month;const body=track.closest('.personal-sheet-body'),top=body.scrollTop;render();const next=app.querySelector('.personal-sheet-body');if(next)next.scrollTop=top;}},140);},{passive:true});
}
