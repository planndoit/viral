export const VERSION = 'v1';
export const QUESTIONS = Object.freeze([
  { title: '약속 없는 토요일,\n지금 내 마음은?', tag: '주말의 온도', icon: '☀', options: ['일단 나가서 생각할래', '집에서 푹 충전할래'], short: ['밖에서 에너지 충전', '집에서 에너지 충전'] },
  { title: '여행지에 도착!\n첫 발걸음은?', tag: '여행의 방식', icon: '↗', options: ['미리 짠 계획표대로 착착', '눈에 띄는 곳부터 슬쩍'], short: ['계획 따라 여행', '발길 따라 여행'] },
  { title: '친구에게 웃긴 일 발생.\n이건 알려야 해!', tag: '수다의 취향', icon: '☺', options: ['전화 걸어서 실시간 중계', '짤과 메시지로 생생하게'], short: ['전화로 수다', '메시지로 수다'] },
  { title: '카페 메뉴판 앞에서\n오늘의 선택은?', tag: '작은 모험', icon: '☕', options: ['실패 없는 늘 먹던 최애', '처음 보는 신메뉴 도전'], short: ['익숙한 최애 메뉴', '새로운 메뉴 도전'] },
  { title: '갑자기 생긴 두 시간,\n어떻게 채울까?', tag: '나만의 여유', icon: '✳', options: ['친구 불러서 수다 한 판', '혼자 취미에 푹 몰입'], short: ['친구와 함께하는 여유', '혼자 몰입하는 여유'] },
  { title: '같이 볼 영화,\n어떤 걸 고를까?', tag: '엔딩 후의 마음', icon: '▶', options: ['생각 없이 편하게 웃을 영화', '끝나고 한참 얘기할 영화'], short: ['편하게 웃는 영화', '여운을 나누는 영화'] },
]);

export function validAnswers(value) {
  return typeof value === 'string' && /^[01]{6}$/.test(value);
}

export function decodeRoute(hash) {
  if (!hash || hash === '#') return { type: 'home' };
  if (typeof hash !== 'string' || hash.length > 40) return { type: 'invalid' };
  const parts = hash.replace(/^#/, '').split('.');
  if (parts[0] !== VERSION) return { type: 'invalid' };
  if (parts.length === 3 && parts[1] === 'i' && validAnswers(parts[2])) {
    return { type: 'invite', host: parts[2] };
  }
  if (parts.length === 4 && parts[1] === 'r' && validAnswers(parts[2]) && validAnswers(parts[3])) {
    return { type: 'result', host: parts[2], guest: parts[3] };
  }
  return { type: 'invalid' };
}

export function makeLink(base, host, guest) {
  if (!validAnswers(host) || (guest !== undefined && !validAnswers(guest))) throw new Error('Invalid answers');
  const url = new URL(base);
  if (!['https:', 'http:'].includes(url.protocol)) throw new Error('Invalid protocol');
  url.search = '';
  url.hash = guest === undefined ? `${VERSION}.i.${host}` : `${VERSION}.r.${host}.${guest}`;
  return url.href;
}

export function compare(host, guest) {
  if (!validAnswers(host) || !validAnswers(guest)) throw new Error('Invalid answers');
  const matches = QUESTIONS.map((_, i) => host[i] === guest[i]);
  const count = matches.filter(Boolean).length;
  const title = count === 6 ? '복사 붙여넣기 같은 우리' : count >= 4 ? '꽤 잘 통하는 우리' : count >= 2 ? '닮은 듯 다른 우리' : '달라서 더 재밌는 우리';
  const description = count === 6 ? '여섯 번의 선택이 모두 같았어요. 다음 약속, 고르기 쉽겠는데요?' : count >= 4 ? '사소한 선택에서도 꽤 자주 만나는 사이. 다른 취향도 하나씩 나눠봐요.' : count >= 2 ? '통하는 포인트도, 새로운 발견도 있어요. 서로의 취향을 바꿔 즐겨볼까요?' : '서로의 세상을 넓혀줄 조합. 다음엔 친구의 선택을 한 번 따라가봐요.';
  return { count, matches, title, description };
}

export function savedAnswers(storage) {
  try {
    const saved = JSON.parse(storage.getItem('taste-sync') || 'null');
    return saved?.version === VERSION && validAnswers(saved.answers) ? saved.answers : null;
  } catch { return null; }
}

export function saveAnswers(storage, answers) {
  if (!validAnswers(answers)) return false;
  try { storage.setItem('taste-sync', JSON.stringify({ version: VERSION, answers })); return true; }
  catch { return false; }
}
