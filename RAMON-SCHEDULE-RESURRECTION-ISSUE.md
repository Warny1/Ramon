# RAMON 시간표 부활/찌꺼기 문제 점검 문서

작성일: 2026-10-07  
프로젝트: RAMON 운영 앱  
운영 사이트: https://ramon-pi.vercel.app/  
GitHub: https://github.com/Warny1/Ramon  
주요 파일: `app.js`, `sync-engine.js`, `service-worker.js`, `index.html`, `styles.css`

## 목적

레슨이 끝난 회원 또는 종료된 시간표가 앱 시간표에 다시 나타나는 문제가 반복되어, 외부 전문가에게 현재 구조와 의심 지점을 공유하기 위한 문서입니다.

운영 데이터 삭제 없이 원인을 확인하고, 재발 방지를 위한 안전한 동기화/데이터 모델 방향을 검토받는 것이 목적입니다.

## 2026-10-08 원인 확정 및 수정 완료

시간표가 몇 주 뒤 다시 나타나는 문제는 캐시 지연이 아니라, 종료일 병합과 오래된 기기의 쓰기가 결합된 동기화 버그로 확인되었습니다.

재현 흐름:

1. 요일/시간 변경 시 기존 반복 시간표에 `endDate`만 설정됩니다.
2. 이전 기기에는 같은 시간표가 `endDate` 없이 남아 있습니다.
3. 이전 기기가 다른 내용을 저장하면, 빈 종료일이 Supabase의 종료일을 덮어쓸 수 있었습니다.
4. 종료된 시간표가 다시 활성화되어 운영·전체 시간표에 나타납니다.

이번 수정 내용:

- “다음 주부터 변경” 경로도 `closedSchedules`에 종료일을 기록합니다.
- 기존 데이터에서 종료일이 있는 반복 시간표를 찾아 보호 목록으로 자동 보강합니다.
- 같은 시간표가 병합될 때 한쪽에 종료일이 있으면 빈 종료일로 다시 열지 않고 종료 상태를 우선합니다.
- 동기화 직전에도 Supabase의 종료일을 다시 확인합니다. 오래된 기기가 빈 종료일과 다른 수정값을 함께 올려도 종료일은 유지하고, 종료일과 관계없는 수정값만 반영합니다.
- 변경된 보호 목록은 Supabase 설정에도 자동 저장됩니다.

검증:

- 두 기기 충돌 시나리오를 자동 테스트에 추가했습니다.
- 시나리오: A 기기가 반복 시간표를 종료하고, B 기기가 이전의 빈 종료일 상태에서 다른 값을 수정해 저장합니다.
- 결과: 종료일은 유지되고 B 기기의 다른 수정은 유지됩니다.
- `npm test`, `npm run build`, `git diff --check` 통과.

## 현재 앱 구조 요약

RAMON은 정적 HTML/CSS/JavaScript PWA입니다.

데이터는 두 층으로 관리됩니다.

- Supabase row sync: 여러 기기 공유 원본
- localStorage: 각 브라우저/기기별 로컬 백업

Supabase 테이블은 다음처럼 분리되어 있습니다.

- `app_settings`
- `members`
- `schedules`
- `payments`
- `attendances`
- `app_backups`

동기화 핵심 파일은 `sync-engine.js`입니다. 현재 자동 폴링 주기는 10분입니다.

```js
const POLL_INTERVAL = 10 * 60 * 1000;
```

앱은 Supabase에서 row들을 읽은 뒤 `member_id` 기준으로 회원 안에 `schedules`, `payments`, `attendances`를 다시 붙입니다.

## 문제 증상

1. 레슨이 끝난 회원의 시간표가 다시 나타나는 경우가 있습니다.
2. 특정 회원의 종료된 과거 시간표가 회원 상세 시간표 목록에 계속 누적되어 보였습니다.
3. 예전 기기 localStorage에 남아 있던 오래된 schedule이 Supabase와 병합되면서 다시 살아나는 것으로 의심됩니다.
4. 회원/결제/시간표 row가 사라졌는데 출석 row만 남는 사례도 있었습니다.

## 실제 확인된 사례

### 김장민 회원

2026-09-15에 김장민 회원이 앱에서 사라진 문제가 있었습니다.

확인 결과:

- 기존 김장민 회원 ID: `39f1072b-a3e3-44f2-986a-5af22e8044ad`
- 새로 임시 생성된 김장민 ID: `1a37c1c0-2a3e-410a-b6a6-243696561e36`
- 기존 회원 row, 결제 row, 시간표 row가 삭제된 상태
- 기존 출석 row 25건은 남아 있었음

백업에서 복구한 내용:

- 결제 4건
- 총 결제 24회
- 차감 출석 22회
- 잔여 2회
- 시간표 4건

추정 원인:

- 오래된 기기/브라우저가 최신 데이터를 받지 못한 상태에서 저장
- sync가 “내 로컬 상태에 없음”을 “서버에서도 삭제”로 해석
- 출석 삭제는 보호되어 있었기 때문에 출석만 고아 row로 남음

### 최원 회원

최원 회원에서 과거 시간표 찌꺼기가 확인되었습니다.

확인된 시간표 예:

- 월 21:00 보강 1회성: `2026-08-10`
- 월 21:00 정규, 종료일 없음: 현재 활성
- 월 21:00 정규, `2026-05-11 ~ 2026-07-19`: 과거 종료
- 월 21:30 정규, 종료일 없음: 현재 활성
- 월 22:00 정규, `2026-05-11 ~ 2026-08-02`: 과거 종료

이 중 종료일이 지난 시간표는 운영/전체 시간표 날짜 계산에서는 보이지 않아야 하지만, 회원 상세 목록에서는 과거 시간표까지 한꺼번에 보이며 데이터 찌꺼기처럼 보였습니다.

## 최근 적용한 보호 조치

### 1. 오래된 기기 상태가 회원/결제/시간표를 무분별하게 삭제하지 못하게 변경

커밋:

- `faf6582 Protect synced records from stale device deletes`

변경 요지:

- 자동 동기화에서 단순히 local state에 없다는 이유만으로 회원/결제/시간표를 삭제하지 않음
- 회원 삭제 버튼을 누른 경우에만 `deletedMemberIds` 기록
- 결제 삭제 버튼을 누른 경우에만 `deletedPaymentIds` 기록
- 시간표 삭제 버튼을 누른 경우에만 `deletedScheduleIds` 또는 `closedSchedules` 기록
- 명시 삭제 기록이 있는 경우에만 Supabase delete 전파

관련 위치:

- `sync-engine.js`
  - `syncChanges(previous, next)`
  - `settingIdSet(value)`
- `app.js`
  - `deletedMemberIds`
  - `deletedPaymentIds`
  - `deletedScheduleIds`
  - `closedSchedules`
  - `scheduleExclusions`
  - `rememberDeletedMemberIds`
  - `rememberDeletedPaymentIds`
  - `rememberDeletedScheduleIds`

### 2. 출석 삭제 보호 유지

출석은 잔여횟수 원장에 가까워서, 오래된 기기 상태 때문에 자동 삭제되지 않도록 보호했습니다.

개별 출석 삭제는 앱의 삭제 버튼 경로인 `deleteAttendances(ids)`로만 원격 삭제합니다.

### 3. 과거 종료 시간표는 회원 상세 현재 시간표 목록에서 숨김

커밋:

- `b48fc4e Hide past schedules from current member view`

변경 요지:

- 종료일이 지난 시간표는 회원 상세의 현재 시간표 목록에서 숨김
- 실제 데이터는 삭제하지 않음
- 출석/결제 기록은 그대로 유지
- “지난 시간표 n개는 기록 보존용으로 숨김” 안내만 표시
- 레슨-시간표 오류 판단도 현재/미래 시간표 기준으로만 계산

관련 위치:

- `app.js`
  - `renderSchedule(member)`
  - `isScheduleCurrentOrFuture(schedule, referenceDate, member)`
  - `getSchedulePeriodLabel(schedule)`
  - `hasLessonScheduleMismatch(member)`

### 4. 시간표 삭제 방식 변경

커밋:

- `c7a0d24 Add schedule removal modes`
- `4b6db15 Replace schedule removal prompt with buttons`
- `69de35f Match schedule removal dialog to app styles on desktop and mobile`

삭제 버튼 선택지:

- 이번 주만 빼기
  - `scheduleExclusions`에 특정 날짜만 제외 기록
  - schedule 자체는 유지
- 앞으로 빼기
  - 선택 날짜 전날로 `endDate` 설정
  - `closedSchedules`에 schedule ID와 종료일 기록
  - 다른 기기 localStorage에 남은 오래된 schedule이 올라와도 종료일을 다시 적용

회원/결제/출석 기록은 건드리지 않습니다.

## 현재 남아있는 우려

### 1. schedule row 자체는 계속 누적됨

현재 정책은 삭제보다 보존 우선입니다. 그래서 과거 schedule row는 남습니다.

장점:

- 출석 기록 해석 근거를 보존
- 실수로 과거 운영 이력을 잃을 가능성 감소

단점:

- 과거 row가 많아질수록 병합/표시 로직이 복잡해짐
- 오래된 localStorage가 잘못 병합되면 종료된 schedule이 다시 보일 가능성 존재

### 2. `closedSchedules`가 schedule ID 기반

부활 방지는 `scheduleId` 기준입니다.

오래된 기기에서 같은 의미의 schedule이 다른 ID로 올라오면 `closedSchedules`가 막지 못할 수 있습니다.

검토할 만한 대안:

- schedule ID 외에 semantic key도 함께 저장
  - memberId
  - day
  - time
  - className
  - lessonType
  - scheduleBoard
  - effective endDate
- 종료된 schedule과 의미가 같은 새 schedule이 올라오면 자동으로 endDate 적용

### 3. 회원 병합 기준

현재 회원 dedupe는 이름/연락처 기반 성격이 있습니다.

동명이인, 전화번호 없음, 과거 임시 회원이 섞이면 의도치 않은 병합 또는 누락이 생길 수 있습니다.

전문가 검토 포인트:

- 회원 identity를 이름/전화번호가 아닌 stable member id 중심으로 더 강하게 유지해야 하는지
- import/paste/legacy localStorage 병합 시 새 ID 생성 조건이 적절한지

### 4. 오래된 localStorage와 서버 baseline 충돌

핵심 위험은 오래된 브라우저가 가진 localStorage 상태가 최신 Supabase 상태와 다를 때입니다.

현재는 명시 삭제 목록 없이는 삭제 전파를 막도록 조치했습니다.

하지만 추가 검토가 필요한 부분:

- localStorage가 오래된 경우, 서버 데이터를 덮지 않고 merge만 하도록 충분히 보장되는지
- settings 병합 시 `deleted*Ids`, `closedSchedules`, `scheduleExclusions`가 누락/덮어쓰기 되지 않는지
- pending sync가 있는 상태에서 원격 load와 local merge 순서가 안전한지

## 주요 코드 위치

### Supabase row sync

파일: `sync-engine.js`

핵심 함수:

- `load()`
- `flush(data)`
- `runPendingSync()`
- `syncChanges(previous, next)`
- `flatten(data)`
- `deleteRows(table, ids)`
- `upsertRows(table, rows)`

### 앱 데이터 병합/정규화

파일: `app.js`

핵심 함수:

- `loadData()`
- `mergeSharedData(localData, remoteData)`
- `normalizeAppSettings()`
- `deduplicateMemberData(data)`
- `mergeRecordsById(first, second)`
- `deduplicateSchedules(schedules)`
- `applyClosedSchedules(schedules, closedScheduleEndDates)`
- `rememberClosedSchedules(entries)`
- `rememberDeletedScheduleIds(ids)`

### 시간표 표시/활성 여부

파일: `app.js`

핵심 함수:

- `getScheduleItems()`
- `isScheduleActiveOnDate(schedule, date, member)`
- `getScheduleStartBasis(schedule, member)`
- `getScheduleGroups()`
- `renderSchedule(member)`
- `isScheduleCurrentOrFuture(schedule, referenceDate, member)`

## 현재 테스트

파일: `tests/sync-engine-conflict.test.mjs`

검증 중인 내용:

- 동시 기기에서 한쪽은 출석, 다른 한쪽은 결제를 저장해도 둘 다 유지
- 직접 삭제한 출석은 원격에서도 삭제
- 오래된 기기가 회원 목록을 비운 상태로 저장해도 원격 회원/결제/시간표/출석이 삭제되지 않음
- 명시 삭제한 회원은 원격에서도 회원/결제/시간표/출석이 삭제됨

최근 확인:

```bash
npm test
git diff --check
```

통과.

단, 로컬 환경에서 `npm run build`는 `dist` 폴더 삭제 권한 문제로 실패한 적이 있습니다. 코드 오류라기보다 실행 환경의 `dist` rmdir/unlink 권한 문제였습니다.

## 전문가에게 확인 받고 싶은 질문

1. 현재처럼 과거 schedule row를 보존하면서 표시/병합에서만 제외하는 방식이 장기적으로 안전한가?
2. `closedSchedules`를 schedule ID만이 아니라 semantic key 기반으로 확장해야 하는가?
3. 오래된 localStorage가 동일한 시간표를 다른 ID로 재생성해 올리는 경우를 어떻게 막는 것이 좋은가?
4. 회원/결제/시간표 삭제를 `deleted*Ids` 명시 목록으로만 허용하는 현재 방식에 빠진 케이스가 있는가?
5. row sync 구조에서 `members`, `schedules`, `payments`, `attendances` 간 관계를 DB foreign key로 강제하지 않는 것이 괜찮은가?
6. `app_settings`에 삭제/종료 tombstone이 계속 쌓이는 구조가 괜찮은가? 정리 정책이 필요하다면 어떤 기준이 안전한가?
7. Supabase egress 비용을 줄이면서 3개 기기 간 반영 지연을 줄이는 현실적인 구조는 무엇인가?

## 운영상 피해야 할 것

- 출석/결제 기록 임의 삭제
- 과거 schedule row 일괄 삭제
- Supabase 전체 데이터를 로컬 오래된 상태로 replace
- 폴링 주기를 짧게 줄이는 방식의 즉시 반영
- demo-data 기반 복구 또는 운영 데이터 덮어쓰기

## 현재 권장 방향

현재는 다음 방향이 가장 안전해 보입니다.

1. 과거 schedule row는 보존
2. 현재/미래 화면 계산에서만 제외
3. schedule 종료/삭제 의도는 tombstone으로 명시 기록
4. 오래된 기기의 삭제 전파는 차단
5. 추후 semantic key 기반 schedule tombstone을 추가 검토
6. 복구/정리 기능은 자동 삭제가 아니라 관리자 검토형 도구로 제공
