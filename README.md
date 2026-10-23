# NULL SPACE 로고 투표 (Vercel 배포용)

정적 페이지(`public/index.html`) + Vercel 서버리스 API(`api/`) + Upstash Redis 저장소로 동작해요.
외부 패키지 설치는 필요 없어요.

## 배포 순서

1. **프로젝트 올리기** (둘 중 하나)
   - GitHub에 이 폴더를 저장소로 올린 뒤, Vercel 대시보드 → **Add New → Project** → 저장소 Import → Deploy
   - 또는 이 폴더에서 터미널로 `npx vercel` → 안내에 따라 진행 → `npx vercel --prod`
2. **저장소 연결**: Vercel 프로젝트 → **Storage** 탭 → **Upstash for Redis** (무료 플랜) 생성 → 이 프로젝트에 Connect
   - `KV_REST_API_URL`, `KV_REST_API_TOKEN` 환경변수가 자동으로 들어가요.
3. **관리자 키 설정**: 프로젝트 → **Settings → Environment Variables** → `ADMIN_KEY` 에 아무도 모를 긴 문자열 입력
4. **재배포**: Deployments → 최신 배포 → **Redeploy** (환경변수 반영)

## 사용

- 투표 링크: `https://<프로젝트>.vercel.app`
- 관리자 보기: `https://<프로젝트>.vercel.app/?admin=<ADMIN_KEY>` → 결과 화면 아래에 참여자별 이름·직종·1~3위 선택이 표로 보여요.
  이 주소는 공유하지 마세요.

## 동작 방식

- 투표자는 로그인 없이 이름 + 직종으로 참여해요. 브라우저마다 익명 ID를 저장해 같은 브라우저의 재투표를 막고,
  같은 이름으로 두 번 투표하는 것도 서버에서 막아요. (같은 이름의 동명이인은 이름 뒤에 구분 표시를 붙이면 돼요.)
- 결과 API는 순위 선택·직종과 의견 내용만 돌려주고 이름은 절대 내보내지 않아요. 의견은 결과 화면에 익명1, 익명2… 순서로 모두에게 보여요.
- 득표율 = 1위 3점 · 2위 2점 · 3위 1점 가중 점수 비율. 결과 화면은 15초마다 갱신돼요.
- 연결 확인: `https://<프로젝트>.vercel.app/api/health` 를 열어 `"redis":"PONG"` 이 보이면 저장소가 정상 연결된 거예요.
- 데이터 초기화: Upstash 콘솔에서 `votes`, `people`, `names`, `feedback` 키를 지우면 돼요.
