const kartContext='На картинге вы были с Максимом, Олей и Сашей. Все трое вернули вам свою часть — по 3 000 ₽.';
// Participant context belongs to the demo, outside the simulated bank chat.
export function scenarioHint(state){
  if(state.page!=='chat'||state.mode!=='chat')return '';
  if(state.scenario==='friends'&&state.step==='friends-result'&&!state.shared?.kartHintRevealed)return '';
  if(state.overlay==='salary-calendar')return 'Ваш отпуск — с 19 по 25 октября. Эти даты нужно отметить в календаре.';
  if(['personal-november','personal-compare','shared-november'].includes(state.overlay))return '';
  const hints={
    friends:{
      'friends-confirm':'Вы были в ресторане с Аней и Даней. Каждый вернул вам по 3 000 ₽. Перевод Марии — по другому поводу.',
      'friends-result':kartContext,
      'friends-kart':kartContext,
    },
    computer:{
      'computer-select':'DNS и авиабилеты — разовые крупные покупки. Вы хотите посмотреть обычные траты без них.',
      'computer-result':'Теперь вам интересно, менялись ли обычные траты за последние полгода.',
    },
    salary:{
      'salary-intro':'Обычно вы получаете 80 000 ₽ в месяц на руки.',
      'salary-usual-input':'Ваша обычная зарплата на руки — 80 000 ₽. Эту сумму можно написать в чат.',
      'salary-regular':'За отработанные дни октября вам пришли 40 000 ₽ 23 октября и 21 818 ₽ 10 ноября. Тая верно выбрала эти выплаты.',
      'salary-edit':'Выплаты за отработанные дни октября — 23 октября и 10 ноября. Поступление 10 октября относится к сентябрю.',
      'salary-uncertain':'В этом сценарии выплаты за отработанные дни октября пришли 23 октября и 10 ноября. Их можно отметить вручную.',
      'salary-factors':'В октябре у вас были отпуск и премия. Ещё вы ожидали возмещение билета в командировку. Больничного не было.',
      'salary-dates':'Ваш отпуск — с 19 по 25 октября. Даты выбираются в календаре.',
      'salary-holiday':'19 113 ₽, поступившие 15 октября, — отпускные за неделю с 19 по 25 октября.',
      'salary-holiday-select':'Отпускные пришли 15 октября — 19 113 ₽.',
      'salary-bonus':'15 000 ₽, поступившие 27 октября, — премия. Возмещение билета в неё не вошло.',
      'salary-summary':'Вы оплатили билет в командировку 30 сентября за 6 700 ₽ и ожидали возмещение. Кнопка ниже введёт это сообщение за вас.',
      'salary-free':'Ожидаемое возмещение — 6 700 ₽ за билет в командировку от 30 сентября. Это можно написать в чат после возврата к сводке.',
    }
  };
  return hints[state.scenario]?.[state.step]||'';
}

export function revealKartHint(state,feed){
  if(state.scenario!=='friends'||state.step!=='friends-result'||state.mode!=='chat'||state.page!=='chat'||state.overlay||state.shared.kartHintRevealed)return false;
  if(!Number.isFinite(feed.clientHeight)||feed.clientHeight<=0||feed.scrollHeight-feed.scrollTop-feed.clientHeight>24)return false;
  state.shared.kartHintRevealed=true;return true;
}
let hintTimer=null;
export function mountScenarioHints(root,state,replyDuration,update){
  clearTimeout(hintTimer);
  if(state.scenario!=='friends'||state.step!=='friends-result'||state.shared.kartHintRevealed)return;
  const feed=root.querySelector('.chat-scroll');if(!feed)return;
  let settled=replyDuration===0;
  const check=()=>{if(settled&&revealKartHint(state,feed))update();};
  feed.addEventListener('scroll',check,{passive:true});
  hintTimer=setTimeout(()=>{settled=true;check();},replyDuration+32);
}
