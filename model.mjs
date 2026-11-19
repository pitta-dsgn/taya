export const refunds=[{id:'anna',name:'Аня',amount:3000,time:'15:24'},{id:'danya',name:'Даня',amount:3000,time:'16:08'},{id:'maria',name:'Маша',amount:1500,time:'22:17'}];
export const salary=[['s1','14 сентября',32000,0],['s2','28 сентября',42500,0],['s3','14 октября',32000,1],['s4','18 октября',15500,1],['s5','28 октября',57300,1],['s6','14 ноября',28000,2],['s7','28 ноября',53200,2]].map(([id,date,amount,month])=>({id,date,amount,month}));
export const categories=[['Техника',200000,'#ffb03b'],['Продукты',18000,'#4bc3d9'],['Кафе и рестораны',20000,'#428bf9'],['Транспорт',6000,'#9786df'],['Другое',9000,'#81868f']];
export const money=n=>new Intl.NumberFormat('ru-RU').format(n)+'\u00a0₽';
export const typo=s=>s.replace(/\bа /g,'а\u00a0').replace(/(^|\s)([вксуояи]|на|за|по|из|не|со|об|от|до|для|без|как|что|чтобы) /giu,'$1$2\u00a0');
export const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function refundReport(ids){const selected=refunds.filter(x=>ids.has(x.id));const returned=selected.reduce((a,x)=>a+x.amount,0);return {selected,returned,own:8000-returned,total:253000-returned,categories:categories.map(([name,n,c])=>[name,name==='Кафе и рестораны'?n-returned:n,c])};}
export function expenseReport(exclude=true){return {total:exclude?53000:253000,difference:exclude?3000:203000,categories:categories.filter(x=>!exclude||x[0]!=='Техника')};}
export function salaryReport(ids,expected=100700){const selected=salary.filter(x=>ids.has(x.id));const months=[0,0,0];selected.forEach(x=>months[x.month]+=x.amount);return {selected,months,total:months.reduce((a,b)=>a+b,0),difference:expected-months[2],expected};}
export function detectScenario(s){if(/зарплат|выплат|начислен|работодат/i.test(s))return 'salary';if(/компьютер|крупн|покупк|dns/i.test(s))return 'computer';if(/друз|ужин|скид|вернул|общий|счёт|счет/i.test(s))return 'friends';return null;}
