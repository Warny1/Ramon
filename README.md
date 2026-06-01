# 회원 관리 앱

회원 시간표, 출석, 결제, 남은 횟수를 관리하는 웹앱입니다.

## 다른 PC에서 접속하는 방법

이 프로젝트는 Vercel에 배포하면 웹 주소로 접속할 수 있습니다.

1. Supabase 프로젝트를 만들고 `supabase-schema.sql` 내용을 SQL Editor에서 실행합니다.
2. `.env.example`을 참고해서 `.env.local` 파일을 만듭니다.
3. Vercel 프로젝트의 환경변수에도 아래 값을 추가합니다.
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
4. 이 폴더를 GitHub 저장소에 올립니다.
5. Vercel에서 `New Project`를 누르고 해당 GitHub 저장소를 선택합니다.
6. Vercel 설정은 자동으로 `vercel.json`을 읽습니다.
   - Build Command: `npm run build`
   - Output Directory: `dist`
7. 배포가 끝나면 `https://프로젝트명.vercel.app` 주소가 생깁니다.
8. 다른 PC나 휴대폰에서 그 주소로 접속하면 됩니다.

## Supabase 설정

이 앱은 Supabase가 설정되어 있으면 여러 PC가 같은 데이터를 공유합니다.

로컬 개발용 `.env.local` 예시:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
```

브라우저는 `.env.local`을 직접 읽을 수 없기 때문에, 빌드할 때 `scripts/build.mjs`가 값을 읽어서 `dist/supabase-config.js`를 만듭니다. Vercel 배포에서는 Vercel 환경변수에 같은 이름으로 넣으면 됩니다.

Supabase SQL Editor에서 [supabase-schema.sql](./supabase-schema.sql)을 먼저 실행해야 저장이 됩니다.

## 권한 설정

앱은 Supabase Auth 로그인 후 `profiles` 테이블의 역할을 확인합니다.

역할은 세 가지입니다.

- `admin`: 전체 회원, 시간표, 출석, 결제, 설정, 백업 관리
- `coach`: 오늘 수업, 시간표, 회원 잔여 횟수 확인, 출석 체크
- `member`: 본인 시간표와 출석/잔여 횟수 확인

Supabase에서 사용자를 만든 뒤 SQL Editor에서 `profiles`에 역할을 넣어야 합니다.

예시:

```sql
insert into public.profiles (user_id, email, role, member_name)
values
  ('Supabase Auth user id', 'admin@example.com', 'admin', null),
  ('Supabase Auth user id', 'coach@example.com', 'coach', null),
  ('Supabase Auth user id', 'member@example.com', 'member', '회원이름');
```

회원용 계정은 `member_name`이 앱의 회원 이름과 정확히 같아야 본인 정보가 보입니다.

## 앱처럼 설치하기

Vercel 주소로 접속한 뒤 브라우저 메뉴에서 앱 설치를 누르면 독립 앱처럼 사용할 수 있습니다.

- Chrome: 주소창 오른쪽 설치 아이콘 또는 메뉴의 앱 설치
- Edge: 메뉴의 앱 > 이 사이트를 앱으로 설치
- iPhone/iPad: Safari 공유 버튼 > 홈 화면에 추가

## 커스텀 도메인 연결

Vercel 프로젝트 화면에서 `Settings > Domains`로 들어가 원하는 도메인을 추가하면 됩니다.

예시:

- `member.yourdomain.com`
- `lesson.yourdomain.com`

도메인을 추가하면 Vercel이 안내하는 DNS 값을 도메인 관리 사이트에 입력하면 됩니다.

## 로컬 확인

Node.js와 npm이 설치된 컴퓨터에서는 아래 명령으로 배포 결과물을 확인할 수 있습니다.

```bash
npm install
npm run build
npm run preview
```

미리보기 주소는 기본적으로 `http://localhost:4173`입니다.

## 주의

Supabase URL과 anon key가 비어 있으면 앱은 기존처럼 접속한 브라우저의 로컬 저장소에 저장됩니다. 기존 localStorage 데이터는 `백업` 버튼으로 JSON 파일로 내보낼 수 있고, 오른쪽 위 가져오기 버튼으로 다시 불러올 수 있습니다.

현재 앱은 로그인/역할 기반으로 화면을 나눕니다. 다만 데이터는 아직 `app_state` JSON 한 덩어리에 저장되므로, 결제 데이터의 DB 레벨 완전 분리까지 하려면 다음 단계에서 `members`, `schedules`, `attendances`, `payments` 테이블을 분리하고 `payments`를 관리자 전용 정책으로 잠그는 작업이 필요합니다.
