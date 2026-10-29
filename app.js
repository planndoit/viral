import { QUESTIONS, decodeRoute, validAnswers, makeLink, compare, savedAnswers, saveAnswers } from './lib.js';

const app = document.querySelector('#app');
const storage = {
  getItem: key => localStorage.getItem(key),
  setItem: (key, value) => localStorage.setItem(key, value),
};
let route;
let state;

function el(tag, attributes = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attributes)) {
    if (value === undefined || value === null || value === false) continue;
    if (key.startsWith('on')) node.addEventListener(key.slice(2).toLowerCase(), value);
    else if (key === 'class') node.className = value;
    else if (value === true) node.setAttribute(key, '');
    else node.setAttribute(key, String(value));
  }
  for (const child of children.flat(Infinity)) {
    if (child !== null && child !== undefined && child !== false) node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}
const button = (label, onClick, className = 'primary full', extra = {}) => el('button', { type: 'button', class: className, onClick, ...extra }, label);
const note = text => el('p', { class: 'fine-print' }, text);

function illustration(sticker = '다른 듯 닮은 우리') {
  return el('div', { class: 'illustration', 'aria-hidden': 'true' },
    el('span', { class: 'orbit one' }, '✳'),
    ...['a', 'b'].map(c => el('div', { class: `face ${c}` }, el('span', { class: 'eyes' }, el('i'), el('i')), el('span', { class: 'smile' }))),
    el('span', { class: 'orbit two' }, '✧'), el('span', { class: 'sticker' }, sticker));
}

function mount(...nodes) {
  app.replaceChildren(...nodes);
  window.scrollTo({ top: 0, behavior: 'instant' });
  app.focus({ preventScroll: true });
}

function loadRoute() {
  route = decodeRoute(location.hash);
  state = { screen: route.type === 'home' ? 'home' : route.type === 'invite' ? 'invite' : route.type === 'result' ? 'compare' : 'invalid', answers: Array(6).fill(null), step: 0 };
  render();
}

function startQuiz() {
  state.screen = 'quiz';
  render();
}

function showHome() {
  history.replaceState(null, '', location.pathname + location.search);
  loadRoute();
}

function renderHome(invited) {
  const saved = savedAnswers(storage);
  mount(el('section', { class: 'hero' },
    el('p', { class: 'eyebrow' }, invited ? 'A LITTLE INVITATION' : 'A LITTLE TEST, A LITTLE CLOSER'),
    el('h1', {}, invited ? ['친구가 보낸', el('br'), el('em', {}, '작은 초대장.')] : ['우리, 얼마나', el('br'), el('em', {}, '통할까?')]),
    el('p', { class: 'intro' }, invited ? ['같은 질문 6개에 답하면', el('br'), '친구와 통하는 취향을 발견할 수 있어요.'] : ['카페 메뉴부터 주말 계획까지.', el('br'), '6개의 작은 선택으로 발견하는 우리 사이.']),
    illustration(invited ? '친구의 답은 다 고른 뒤에 보여요' : '너는 어때? 나랑 비교해보자'),
    el('div', { class: 'pills' }, ['약 1분', '딱 6문항', '가입 없이'].map(t => el('span', { class: 'pill' }, t))),
    button(invited ? '친구와 취향 비교하기  ↗' : '내 취향 알아보기  ↗', startQuiz),
    !invited && saved ? button('최근 내 결과 다시 보기', () => { state.own = saved; state.screen = 'solo'; render(); }, 'text-button') : null,
    note('정답은 없어요. 지금 더 끌리는 쪽을 골라주세요.'),
    el('div', { class: 'steps-note' }, el('b', {}, '01 고르기'), el('span', { 'aria-hidden': 'true' }, '→'), el('b', {}, '02 친구에게 보내기'), el('span', { 'aria-hidden': 'true' }, '→'), el('b', {}, '03 우리 비교하기'))));
}

function renderQuiz() {
  const i = state.step;
  const q = QUESTIONS[i];
  const next = button(i === 5 ? '결과 보러 가기  ↗' : '다음 질문  →', () => {
    if (![0, 1].includes(state.answers[i])) return;
    if (i < 5) { state.step++; render(); return; }
    state.own = state.answers.join('');
    state.stored = saveAnswers(storage, state.own);
    if (route.type === 'invite') {
      history.replaceState(null, '', makeLink(location.href, route.host, state.own));
      route = { type: 'result', host: route.host, guest: state.own };
      state.screen = 'compare';
    } else state.screen = 'solo';
    render();
  }, 'primary full', { disabled: state.answers[i] === null });
  const options = q.options.map((text, choice) => button([
    el('span', { class: 'option-letter', 'aria-hidden': 'true' }, choice === 0 ? 'A' : 'B'), el('span', {}, text),
  ], event => {
    state.answers[i] = choice;
    for (const [j, option] of options.entries()) option.setAttribute('aria-pressed', String(j === choice));
    next.disabled = false;
  }, 'option', { 'aria-pressed': String(state.answers[i] === choice) }));
  mount(el('section', {},
    el('div', { class: 'quiz-top' }, button('← 이전', () => { if (i === 0) state.screen = route.type === 'invite' ? 'invite' : 'home'; else state.step--; render(); }, 'back'), el('p', { class: 'counter' }, el('strong', {}, String(i + 1).padStart(2, '0')), ' / 06')),
    el('div', { class: 'progress', role: 'progressbar', 'aria-label': '질문 진행', 'aria-valuemin': 1, 'aria-valuemax': 6, 'aria-valuenow': i + 1 }, el('div', { class: 'progress-fill', style: `width:${(i + 1) / 6 * 100}%` })),
    el('div', { class: 'question-meta' }, el('span', { class: 'question-icon', 'aria-hidden': 'true' }, q.icon), el('p', { class: 'question-tag' }, q.tag)),
    el('h1', { class: 'question-title', id: 'question' }, q.title),
    el('div', { class: 'options', role: 'group', 'aria-labelledby': 'question' }, options), next,
    el('p', { class: 'quiz-hint' }, '둘 다 좋다면, 지금 조금 더 끌리는 쪽으로.')));
}

function linkActions({ url, text, primaryText, secondary }) {
  const status = el('p', { class: 'status', role: 'status' });
  const fallback = el('div', { class: 'link-fallback', hidden: true },
    el('label', { for: 'share-link' }, '복사가 안 된다면 아래 링크를 길게 눌러 복사해주세요.'),
    el('input', { id: 'share-link', readonly: true, value: url, 'aria-label': '공유 링크', onFocus: event => event.target.select() }));
  async function copy() {
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      status.textContent = '링크를 복사했어요. 친구에게 붙여넣어 보내주세요!';
    } catch {
      fallback.hidden = false;
      status.textContent = '이 브라우저에서는 자동 복사를 사용할 수 없어요.';
      fallback.querySelector('input').focus();
    }
  }
  async function share(event) {
    const target = event.currentTarget;
    if (target.disabled) return;
    target.disabled = true;
    status.textContent = '';
    try {
      if (typeof navigator.share === 'function') {
        try {
          await navigator.share({ title: '취향 싱크 · 우리, 얼마나 통할까?', text, url });
          status.textContent = '공유 창을 닫았어요. 전달 여부는 메신저에서 확인해주세요.';
        } catch (error) {
          if (error?.name === 'AbortError') status.textContent = '공유를 취소했어요. 원할 때 다시 보내면 돼요.';
          else { status.textContent = '공유 창을 열지 못했어요. 링크 복사를 눌러주세요.'; fallback.hidden = false; }
        }
      } else await copy();
    } finally { target.disabled = false; }
  }
  return el('div', {}, el('div', { class: 'action-stack' }, button(primaryText, share), button('링크 복사하기', copy, 'secondary full'), secondary), status, fallback);
}

function renderSolo() {
  if (!validAnswers(state.own)) return showHome();
  const answers = state.own;
  mount(el('section', {},
    el('div', { class: 'result-header' }, el('p', { class: 'eyebrow' }, 'MY LITTLE PREFERENCES'), el('h1', {}, '내 취향, 이렇게 골랐어요.'), el('p', {}, '이제 친구의 선택이 궁금하지 않나요?')),
    el('div', { class: 'result-card' }, el('p', { class: 'card-label' }, '나의 작은 취향 모음'),
      el('ul', { class: 'answer-list' }, QUESTIONS.map((q, i) => el('li', {}, el('div', { class: 'answer-line' }, el('span', { class: 'list-icon', 'aria-hidden': 'true' }, q.icon), el('div', {}, el('span', { class: 'label' }, q.tag), q.short[Number(answers[i])])))))),
    el('div', { class: 'callout' }, el('h3', {}, '혼자 고르면 취향, 같이 고르면 대화.'), el('p', {}, '친구가 이 링크에서 6개를 고르면, 둘의 같은 선택과 다른 선택을 비교할 수 있어요.')),
    linkActions({ url: makeLink(location.href, answers), text: '우리, 얼마나 통할까? 6개만 골라봐. 약 1분이면 우리 취향을 비교할 수 있어!', primaryText: '친구에게 비교 초대 보내기  ↗' }),
    el('p', { class: 'share-note' }, '내 답변이 담긴 링크예요. 비교하고 싶은 친구에게 보내주세요.'),
    button('처음부터 다시 고르기', showHome, 'text-button full'),
    state.stored === false ? note('브라우저 저장을 사용할 수 없어 최근 결과는 보관되지 않아요. 공유 링크는 사용할 수 있어요.') : null));
}

function renderCompare() {
  const { host, guest } = route;
  const result = compare(host, guest);
  const own = state.own || savedAnswers(storage);
  const primaryText = `우리 같은 선택 ${result.count}/6! ${result.title}. 어떤 선택이 통했는지 같이 확인해봐.`;
  const otherAction = button('내 링크로 다른 친구와도 비교하기', () => {
    if (own) { state.own = own; state.screen = 'solo'; render(); }
    else showHome();
  }, 'secondary full');
  mount(el('section', {},
    el('div', { class: 'result-header' }, el('p', { class: 'eyebrow' }, 'OUR LITTLE CONNECTION'), el('h1', {}, '우리가 통하는 순간.')),
    el('div', { class: 'result-card' }, el('p', { class: 'card-label' }, '여섯 개의 선택 중'), el('p', { class: 'score', 'aria-label': `같은 선택 ${result.count}개, 전체 6개` }, result.count, el('span', {}, '/ 6')),
      el('div', { class: 'match-dots', 'aria-hidden': 'true' }, result.matches.map(m => el('span', { class: m ? 'match' : '' }))),
      el('h2', { class: 'result-title' }, result.title), el('p', { class: 'result-description' }, result.description)),
    linkActions({ url: makeLink(location.href, host, guest), text: primaryText, primaryText: '친구에게 우리 결과 보내기  ↗', secondary: otherAction }),
    el('p', { class: 'share-note' }, '처음 초대한 친구에게 이 결과를 보내주세요. 자동으로 전송되지는 않아요.'),
    el('section', { class: 'compare-detail' }, el('h2', {}, '하나씩 보면, 이런 우리'),
      QUESTIONS.map((q, i) => el('article', { class: 'compare-row' },
        el('div', { class: 'compare-row-head' }, el('h3', {}, `${q.icon} ${q.tag}`), el('span', { class: `badge${result.matches[i] ? '' : ' different'}` }, result.matches[i] ? '같은 선택' : '다른 매력')),
        el('div', { class: 'comparison' }, el('div', {}, el('small', {}, '먼저 답한 친구'), q.short[Number(host[i])]), el('div', {}, el('small', {}, '나중에 답한 친구'), q.short[Number(guest[i])]))))),
    note('이 결과는 6개 질문의 선택만 비교한 가벼운 놀이예요. 관계나 성격을 진단하지 않아요.'),
    button('나도 처음부터 해보기', showHome, 'text-button full')));
}

function render() {
  document.title = state.screen === 'compare' ? '우리가 통하는 순간 · 취향 싱크' : '취향 싱크 · 우리, 얼마나 통할까?';
  if (state.screen === 'home' || state.screen === 'invite') return renderHome(state.screen === 'invite');
  if (state.screen === 'quiz') return renderQuiz();
  if (state.screen === 'solo') return renderSolo();
  if (state.screen === 'compare') return renderCompare();
  mount(el('section', { class: 'hero' }, el('div', { class: 'error-symbol', 'aria-hidden': 'true' }, '↝'), el('h1', {}, '초대장이 조금', el('br'), '헝클어졌어요.'), el('p', { class: 'intro' }, '링크가 잘렸거나 다른 버전의 초대장이에요.', el('br'), '친구에게 새 링크를 받거나 직접 시작해보세요.'), button('내 취향부터 알아보기', showHome)));
}

const dialog = document.querySelector('#privacy-dialog');
document.querySelector('#privacy-button').addEventListener('click', () => dialog.showModal());
document.querySelector('#close-privacy').addEventListener('click', () => dialog.close());
document.querySelector('#clear-saved').addEventListener('click', () => {
  try {
    localStorage.removeItem('taste-sync');
    document.querySelector('#privacy-status').textContent = '이 브라우저에 저장된 답변을 지웠어요. 이미 보낸 링크는 그대로 남아 있어요.';
    if (state.screen === 'home') render();
  } catch { document.querySelector('#privacy-status').textContent = '브라우저 저장소에 접근할 수 없어요.'; }
});
window.addEventListener('hashchange', loadRoute);
loadRoute();
