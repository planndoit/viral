# 웹 앱 배포 안내

## 배포 대상

‘취향 싱크’는 정적 웹 앱이다. `dist/`의 HTML·JavaScript·CSS·공유 이미지·아이콘만 게시한다. 소스·테스트·문서·의존성을 게시하지 않는다. GitHub Pages의 프로젝트 하위 경로 `/viral/`에서도 상대 경로로 동작한다. 런타임 서버나 별도 비밀값이 필요하지 않다.

## 자동 배포

`.github/workflows/pages.yml`이 `main` 푸시와 수동 실행을 처리한다.

1. lockfile로 개발 의존성을 설치한다.
2. 단위 테스트를 실행하고 정적 파일을 빌드한다.
3. Chromium을 설치하고 모바일·데스크톱 기능 테스트를 실행한다.
4. 통과한 `dist/`를 Pages artifact로 올려 배포한다.

GitHub 저장소 **Settings → Pages → Build and deployment → Source**가 **GitHub Actions**여야 한다. 저장소 설정 권한과 계정 플랜에 따라 Pages 사용 가능 여부가 달라질 수 있으며 저장소 공개 여부를 임의로 바꾸지 않는다.

## API로 설정할 경우

먼저 기존 사이트를 읽는다. 조회 실패가 곧 미설정을 뜻하지 않는다. 404로 미설정이 확인된 경우에만 생성하고, 인증·정책·권한 오류는 원인별로 해결한다.

```sh
gh api repos/planndoit/viral/pages
# 사이트가 없다는 404를 확인했고 설정 권한이 있을 때
gh api --method POST repos/planndoit/viral/pages -f build_type=workflow
# 이미 다른 빌드 방식으로 설정된 사이트라면
gh api --method PUT repos/planndoit/viral/pages -f build_type=workflow
```

이 문서는 명령 실행 성공 기록이 아니다. 실제 설정 결과를 확인해야 한다. Pages 생성 API는 저장소 관리자 권한이 필요할 수 있다. Git 읽기·푸시 성공이 Pages 설정 권한을 보장하지 않는다. 자동 배포 워크플로의 기본 GITHUB_TOKEN으로 Pages 최초 활성화를 우회하지 않는다.

## 배포 검증

```sh
gh run list --repo planndoit/viral --workflow pages.yml --limit 3
gh api repos/planndoit/viral/pages --jq '{html_url,status,build_type}'
```

API가 반환한 URL과 해당 커밋의 워크플로 성공을 확인한 뒤, 공개 페이지에 실제로 접속하여 6문항 완료·초대 링크·친구 비교·결과 회신을 재검증한다. 단순히 파일을 푸시하거나 로컬 테스트를 통과한 것을 공개 배포 성공으로 취급하지 않는다.

기본 주소는 `https://planndoit.github.io/viral/`다. 이는 저장소 이름으로 정해지는 예상 주소이며, **워크플로 성공과 공개 응답을 확인하기 전에는 사용 가능한 테스트 URL로 보장하지 않는다.**

## 네트워크 제약

현재 클라우드에서 GitHub API 요청은 네트워크 프록시 403으로 제한되어 있었다. `api.github.com` 및 `planndoit.github.io`를 환경 설정 허용 도메인 초안에 추가했다. 실제 반영 전에는 Pages 설정·작업 상태·공개 URL 확인이 막힐 수 있다. 설정 적용 이후 이어서 검증할 수 있다.
