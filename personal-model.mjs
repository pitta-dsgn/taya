export const personalMonths = ['Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь'];
export const personalCategoryOrder = ['Кафе и рестораны','Продукты','Остальное','Транспорт'];
export const personalColors = {'Кафе и рестораны':'#00d941','Продукты':'#ffb03b','Остальное':'#4bc1d8','Транспорт':'#428bf9','Техника':'#ffb03b','Путешествия':'#4bc1d8'};
const totals = [50000,52000,51000,54000,52000,53000];
export const personalOperations = totals.flatMap((total, month) => [
  {id:`other-${month}`,month,day:28,title:'Маркетплейс',category:'Остальное',amount:total-44000,mark:'…'},
  ...(month===5?[{id:'dns',month,day:25,title:'DNS',category:'Техника',amount:200000,mark:'DNS'}]:[]),
  ...(month===1?[{id:'agency',month,day:25,title:'Турагентство',category:'Путешествия',amount:60000,mark:'ТА'}]:[]),
  {id:`restaurant-a-${month}`,month,day:22,title:'Ресторан',category:'Кафе и рестораны',amount:8000,type:'restaurant'},
  {id:`grocery-a-${month}`,month,day:18,title:'Пятёрочка',category:'Продукты',amount:14800,type:'shop'},
  ...(month===5?[{id:'air',month,day:12,title:'Авиабилеты',category:'Путешествия',amount:45000,mark:'АВ'}]:[]),
  {id:`restaurant-b-${month}`,month,day:12,title:'Ресторан',category:'Кафе и рестораны',amount:12000,type:'restaurant'},
  {id:`transport-${month}`,month,day:9,title:'Транспорт',category:'Транспорт',amount:6000,mark:'Т'},
  {id:`grocery-b-${month}`,month,day:5,title:'Пятёрочка',category:'Продукты',amount:3200,type:'shop'}
]);
export const personalCandidates = personalOperations.filter(x=>x.id==='dns'||x.id==='air');
export function initialPersonal(){return {excluded:new Set(['dns','air']),julyExcluded:true,reason:false,threshold:null,month:null,detailCategory:null,detailMode:'bars',detailPeriod:'november'};}
export function isPersonalExcluded(op,state,halfYear=false){return state.excluded.has(op.id)||(halfYear&&state.julyExcluded&&op.id==='agency');}
export function personalReport(state,month=5,halfYear=false,category=null){
  const operations=personalOperations.filter(x=>x.month===month&&(!category||x.category===category));
  const included=operations.filter(x=>!isPersonalExcluded(x,state,halfYear));
  const total=included.reduce((sum,x)=>sum+x.amount,0),raw=operations.reduce((sum,x)=>sum+x.amount,0);
  const names=[...personalCategoryOrder,...['Техника','Путешествия']];
  const categories=names.map(name=>[name,included.filter(x=>x.category===name).reduce((sum,x)=>sum+x.amount,0),personalColors[name]]).filter(x=>x[1]>0);
  return {operations,included,total,raw,categories,excluded:operations.filter(x=>isPersonalExcluded(x,state,halfYear))};
}
export function personalComparison(state){const reports=personalMonths.map((_,i)=>personalReport(state,i,true));const values=reports.map(x=>x.total);const total=values.reduce((a,b)=>a+b,0);return {reports,values,total,average:Math.round(total/6),minimum:Math.min(...values),maximum:Math.max(...values)};}
export function parsePersonalThreshold(value){const match=value.match(/(?:дороже|свыше|больше|от)?\s*(\d[\d\s\u00a0\u202f]*(?:[.,]\d+)?)\s*(тыс(?:яч[иу]?)?|к)?/iu);if(!match)return null;const amount=Number(match[1].replace(/[\s\u00a0\u202f]/g,'').replace(',','.'))*(match[2]?1000:1);return Number.isFinite(amount)&&amount>0?amount:null;}
export function setPersonalThreshold(state,amount){state.threshold=amount;state.excluded=new Set(personalOperations.filter(x=>x.month===5&&x.amount>amount).map(x=>x.id));}
