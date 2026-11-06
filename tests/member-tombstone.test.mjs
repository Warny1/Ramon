import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const appSource = await readFile(new URL("../app.js", import.meta.url), "utf8");
const functionStart = appSource.indexOf("function getMemberIdentityKey");
const functionEnd = appSource.indexOf("function deduplicateSchedules", functionStart);
assert.ok(functionStart >= 0 && functionEnd > functionStart, "회원 삭제 보호 함수를 찾을 수 있어야 합니다.");

const context = {
  normalizeMemberName(value) {
    return String(value || "").trim().replace(/\s+/g, " ");
  },
  normalizePhone(value) {
    return String(value || "").replace(/\D/g, "");
  },
};
vm.createContext(context);
vm.runInContext(`${appSource.slice(functionStart, functionEnd)}\nthis.normalizeTombstones = normalizeDeletedMemberTombstones; this.isBeforeDeletion = isMemberRecordBeforeDeletion;`, context);

const [tombstone] = context.normalizeTombstones([
  { memberKey: "정보윤|01071432042", deletedAt: "2026-11-03" },
]);

assert.equal(
  context.isBeforeDeletion({ createdAt: "2026-10-30" }, tombstone),
  true,
  "삭제 전 생성된 오래된 회원 기록은 차단해야 합니다.",
);
assert.equal(
  context.isBeforeDeletion({ createdAt: "2026-11-06" }, tombstone),
  false,
  "삭제 후 새로 등록한 회원은 유지해야 합니다.",
);
assert.equal(
  context.isBeforeDeletion({ createdAt: "2026-11-03", identityConfirmedAt: "2026-11-03" }, tombstone),
  false,
  "현재 앱에서 확인한 같은 날 재등록은 유지해야 합니다.",
);

console.log("삭제 회원/새 회원 구분 테스트 통과");
