export function addMessage(messages,kind,body,step=''){return [...messages,{id:messages.length+1,kind,body,step}];}
export function updateLastAnswer(messages,body){const copy=messages.map(x=>({...x}));for(let i=copy.length-1;i>=0;i--){if(copy[i].kind==='assistant'){copy[i].body=body;break;}}return copy;}
export function cleanRequest(s){return s.trim().replace(/[.!?…]+$/u,'');}
export const INTRO_DURATION=13000;
export const INTRO_STEPS=[{at:0,name:'Главная',page:'home'},{at:1900,name:'Прокрутка главной',action:'scroll'},{at:3800,name:'Открываем операции',action:'tap-home'},{at:4500,name:'Операции',page:'overview'},{at:6800,name:'Выбираем траты',action:'tap-expenses'},{at:7500,name:'Аналитика расходов',page:'bank'},{at:11200,name:'Тая предлагает помощь',action:'offer'}];
