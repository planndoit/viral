# 출처와 확인 기록

확인일: 2026-10-29 · 방식: 플랫폼 HTTPS 프록시를 통한 공개 Git 읽기와 `raw.githubusercontent.com`의 문서·소스 조회

## 직접 읽은 1차 자료

아래 링크는 조사 시 확인한 커밋에 고정했다. 8개 파일을 해당 커밋의 raw URL로 다시 요청해 모두 HTTP 200을 확인했다. 조회 크기와 SHA-256은 [기계 판독 기록](research-sources.json)에 남겼다. 원문 전체를 저장소에 복제하지 않았다.

### S1. 2048 — Gabriele Cirulli

- [README](https://github.com/gabrielecirulli/2048/blob/478b6ec346e3787f589e4af751378d06ded4cbbc/README.md)
- [게임 HTML](https://github.com/gabrielecirulli/2048/blob/478b6ec346e3787f589e4af751378d06ded4cbbc/index.html)
- 확인: 원작 저장소임을 설명하는 문구, 1024·Threes와의 관계, 최고 기록과 모바일 조작 관련 기여, 점수·최고 기록·재시작 UI와 규칙.
- 한계: 이 자료에서 방문자 수·공유율은 확인되지 않는다. HTML에서 결과 공유 버튼은 확인되지 않았다.

### S2. hello wordl — Lynn

- [README](https://github.com/lynn/hello-wordl/blob/835db051e78d0dba4e38bc4b19ae5560b8efbbc3/README.md)
- [App.tsx](https://github.com/lynn/hello-wordl/blob/835db051e78d0dba4e38bc4b19ae5560b8efbbc3/src/App.tsx)
- [Game.tsx](https://github.com/lynn/hello-wordl/blob/835db051e78d0dba4e38bc4b19ae5560b8efbbc3/src/Game.tsx)
- 확인: 기본 5글자·6회 추측과 색 단서, 단어 목록 선별, 오늘의 시드, 도전 문자열, 게임 링크 및 이모지 결과 공유, Web Share와 클립보드 경로.
- 한계: Wordle 원작의 구현 자료가 아니다. 이 프로젝트의 코드를 근거로 NYT 서비스의 현재 기능이나 이용 규모를 주장하지 않는다.

### S3. Monkeytype — monkeytypegame

- [README](https://github.com/monkeytypegame/monkeytype/blob/5478cd701df9e6a7d4611004ec84bef8999b3aaa/README.md)
- 확인: 실시간 오류·WPM·정확도, 다양한 테스트 길이와 언어, 도전 기능, 기록용 계정, 성과·챌린지에 따른 Discord 역할.
- 한계: 공유 UI 구현이나 공유율은 조사하지 않았다. 기록이 공유 동기가 된다는 설명은 제품 해석이다.

### S4. Sandspiel — Max Bittker

- [README](https://github.com/MaxBittker/sandspiel/blob/9936e06b07a583aedfba9589c0cead2917f405fb/README.md)
- 확인: falling-sand 시뮬레이션, Rust/Wasm·WebGL 기반, 창작물 공유와 포크라는 제작자의 명시적인 목표.
- 한계: 현재 서비스의 실제 공유 플로우와 운영 상태는 플레이 검증하지 않았다. 공유 기능의 성장 효과도 확인하지 않았다.

### S5. Scribble.rs — scribble-rs

- [README](https://github.com/scribble-rs/scribble.rs/blob/1bda7ed8b880bb598dede5096c0e2f3f58abe0b8/README.md)
- 확인: 가입 없는 그림 맞히기, skribbl.io 대안이라는 설명, 로비 설정, WebSocket 요구, 커뮤니티 인스턴스 목록.
- 한계: README에 Discord가 매우 활발하지 않다고 명시되어 있다. 이 사례는 초대 설계와 운영 난도를 참고하는 사례이며 ‘바이럴에 성공한 서비스’로 분류하지 않는다.

## 접근을 시도했으나 읽지 못한 자료

아래 요청은 현재 환경 프록시에서 `Tunnel connection failed: 403 Forbidden`으로 끝났다. 자료 본문을 읽었다고 주장하지 않는다. 서비스의 현재 운영 상태를 뜻하는 결과도 아니다.

| URL | 조사하려던 내용 |
| --- | --- |
| https://www.nytimes.com/games/wordle/index.html | Wordle 원작의 현재 흐름 |
| https://www.nytimes.com/2022/01/31/business/media/new-york-times-wordle.html | 원작의 성장·인수 관련 1차 발표 내용 |
| https://neal.fun/ | 개별 웹 장난감의 흐름 |
| https://newsroom.spotify.com/2023-11-29/wrapped-user-experience-2023/ | Wrapped의 공식 경험 설명 |
| https://pudding.cool/2020/12/judge-my-spotify/ | 취향을 유머로 평가하는 결과물 구조 |
| https://en.wikipedia.org/wiki/Wordle | Wordle 관련 보조 자료 |
| https://www.idrlabs.com/test.php | 짧은 테스트·결과 경험 비교 후보 |

필요한 후속 조사만 선택해 `www.nytimes.com`, `neal.fun`, `newsroom.spotify.com` 등의 정확한 도메인을 환경 설정에 추가할 수 있다. 이번 작업에서는 기존 네트워크 정책을 바꾸지 않았다.

## 사용하지 않은 조회 결과

일부 추정 저장소 경로는 HTTP 404였다. 존재·이전 여부를 확정하지 않았으며, 그 경로를 제품 기능이나 성과의 근거로 사용하지 않았다. 제작자 GitHub 프로필은 탐색에만 사용했다. ‘읽을 수 있었음’과 ‘주장을 뒷받침함’을 구분했다.

## 사실과 제안의 경계

리서치 문서의 기능 설명은 위 출처를 따른다. 예상 사용 시간, 공유 동기, 후보 점수, MVP 문구·질문·목표치는 이 저장소의 제안이다. 실제 사용자 실험과 수치 검증은 아직 수행하지 않았다. 현재 트렌드 순위나 신규 서비스의 성장 보장을 제공하는 문서는 아니다.
