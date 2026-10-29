# Vercel 배포 안내

사용자 요청에 따라 웹 앱 배포 대상을 Vercel로 변경했다. GitHub Actions는 테스트 CI만 실행한다. 클라우드 개발 환경의 Publish와 공개 웹 배포는 별개다.

## 프로젝트 설정

저장소 `planndoit/viral`을 Vercel에 가져오면 루트의 `vercel.json`을 사용한다.

- Framework preset: Other
- Install command: `npm ci`
- Build command: `npm test && npm run build`
- Output directory: `dist`
- Root directory: 저장소 루트
- 런타임 API 키·DB·로그인: 불필요

공유 이미지 메타데이터는 빌드 시 Vercel이 제공하는 현재 배포 호스트를 사용한다. production 빌드에서는 `VERCEL_PROJECT_PRODUCTION_URL`이 있으면 우선 사용한다. 초대와 결과 링크는 실행 중인 페이지 주소를 사용하므로 Pages의 `/viral/`뿐 아니라 Vercel의 루트 경로에서도 동작한다.

## CLI 배포

Vercel CLI 65.7.0을 확인했다. 이 클라우드에서는 기본 홈 디렉터리를 쓸 수 없어 전용 글로벌 설정 경로를 사용한다.

```sh
cd /workspace/viral
npm exec --yes --cache /workspace/.npm-cache --package vercel@65.7.0 -- vercel deploy --prod --yes --global-config /workspace/.vercel-cli --token "$VERCEL_TOKEN"
```

이미 연결된 프로젝트가 있으면 그대로 사용한다. 새 프로젝트나 팀 선택이 필요한 경우 사용자 소유의 대상인지 확인하고 선택한다. `.vercel/`의 연결 정보·배포 상태·인증 관련 파일은 Git에서 제외한다. 토큰 값이나 임시 배포의 claim 링크를 로그·Git·문서에 넣지 않는다.

CLI의 로그인 없는 `--temporary` 옵션도 확인하고 시도했으나 이 실행에서는 ‘Temporary deployments aren't available for this attempt’로 거절됐으며, 이어진 인증 요청은 네트워크 접근에 실패했다. 이것만으로 임시 배포가 모든 환경에서 불가능하다고 결론 내리지 않는다.

## 현재 필요한 접근

현재 머신에는 Vercel 로그인 정보나 `VERCEL_TOKEN` 바인딩이 없다. 환경 설정에 Vercel 토큰을 **보안 값으로** 입력한다. 채팅이나 저장소 파일에 토큰을 넣지 않는다. 프록시 방식 비밀값의 대상은 `api.vercel.com`이다.

`api.vercel.com`과 `vercel.com`의 HTTP 요청은 현재 프록시에서 403으로 차단되었다. 기존 네트워크 규칙을 보존하고 이 도메인 및 생성될 테스트 주소의 `*.vercel.app` 허용을 환경 초안에 추가했다. 초안 저장과 현재 네트워크 반영은 다르므로 설정 적용 후 배포를 재시도해야 한다.

## 배포 완료 확인

실제 배포가 READY 상태에 도달하면 반환된 URL을 사용한다. 예상 프로젝트 이름으로 URL을 만들어 배포 완료라고 안내하지 않는다. 공개 접근 및 인증 보호 여부를 확인하고 다음 흐름을 테스트한다.

1. 모바일 크기에서 첫 화면과 6문항을 완료한다.
2. 초대 링크를 새 브라우저 세션에서 열어 다른 답변을 고른다.
3. 일치 수와 항목별 결과가 맞는지 확인한다.
4. 결과 링크를 원래 세션으로 회신하고 새로고침해도 결과가 유지되는지 확인한다.
5. 실제 메신저의 공유 미리보기도 확인한다.

로컬 테스트나 Git 푸시만으로 공개 배포 성공을 주장하지 않는다. 이전 GitHub Pages 시도는 사이트 미활성화 404로 실패했으며 현재 배포 수단은 Vercel이다.
