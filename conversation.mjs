export function addMessage(messages,kind,body,step=''){return [...messages,{id:messages.length+1,kind,body,step}];}
export function updateLastAnswer(messages,body){const copy=messages.map(x=>({...x}));for(let i=copy.length-1;i>=0;i--){if(copy[i].kind==='assistant'){copy[i].body=body;break;}}return copy;}
export function cleanRequest(s){return s.trim().replace(/[.!?…]+$/u,'');}
export const INTRO_DURATION=7450;
export const INTRO_STEPS=[{at:0,name:'Главная',page:'home'},{at:1100,name:'Открываем операции',action:'tap-home'},{at:1500,name:'Операции',page:'overview'},{at:3400,name:'Выбираем траты',action:'tap-expenses'},{at:3800,name:'Тая предлагает помощь',page:'bank'}];
