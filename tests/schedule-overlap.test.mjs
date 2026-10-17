import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const appSource = await readFile(new URL("../app.js", import.meta.url), "utf8");
const functionStart = appSource.indexOf("function findOverlappingSchedule");
const functionEnd = appSource.indexOf("function isSameScheduleSlot", functionStart);
assert.ok(functionStart >= 0 && functionEnd > functionStart, "시간표 충돌 함수들을 찾을 수 있어야 합니다.");

const context = {
  normalizeTime(value) {
    const match = String(value || "").trim().match(/^(\d{1,2})(?::(\d{1,2}))?/);
    return match ? `${match[1].padStart(2, "0")}:${String(match[2] || "0").padStart(2, "0")}` : "";
  },
  doSchedulePeriodsOverlap(member, first, second) {
    const firstStart = first.startDate || member.firstPaymentDate || "0000-00-00";
    const firstEnd = first.endDate || "9999-99-99";
    const secondStart = second.startDate || member.firstPaymentDate || "0000-00-00";
    const secondEnd = second.endDate || "9999-99-99";
    return firstStart <= secondEnd && secondStart <= firstEnd;
  },
  isScheduleActiveOnDate(schedule, date, member) {
    const start = schedule.startDate || member.firstPaymentDate || "";
    const end = schedule.endDate || "";
    return (!start || start <= date) && (!end || end >= date);
  },
  isScheduleExcluded(member, schedule, date) {
    return (member.exclusions || []).some((item) => item.scheduleId === schedule.id && item.date === date);
  },
};
vm.createContext(context);
vm.runInContext(`${appSource.slice(functionStart, functionEnd)}\nthis.findOverlap = findOverlappingSchedule;`, context);

const weekly = (overrides = {}) => ({
  id: overrides.id || "weekly",
  day: 1,
  time: "18:30",
  lessonType: "주1 / 1인 (30분)",
  scheduleBoard: "admin",
  startDate: "2026-05-04",
  endDate: "",
  date: "",
  ...overrides,
});
const once = (date, overrides = {}) => ({
  id: overrides.id || `once-${date}`,
  day: new Date(`${date}T12:00:00`).getDay(),
  time: "18:30",
  lessonType: "주1 / 1인 (30분)",
  scheduleBoard: "admin",
  startDate: "",
  endDate: "",
  date,
  ...overrides,
});
const findOverlap = context.findOverlap;

const endedMember = {
  firstPaymentDate: "2026-05-04",
  schedules: [
    weekly({ id: "past-weekly", startDate: "", endDate: "2026-09-13" }),
    once("2026-10-05"),
    once("2026-10-12"),
    once("2026-10-19"),
  ],
};
assert.equal(
  findOverlap(endedMember, weekly({ id: "new", startDate: "2026-10-26" })),
  undefined,
  "종료된 주간 일정과 이전 단발 일정은 10월 26일 시작 수업을 막으면 안 됩니다.",
);

const activeMember = {
  firstPaymentDate: "2026-05-04",
  schedules: [weekly({ id: "active", lessonType: "주2 / 2인 (30분)", scheduleBoard: "coach1" })],
};
assert.equal(
  findOverlap(activeMember, weekly({ id: "new", startDate: "2026-10-26" }))?.id,
  "active",
  "레슨 타입이나 담당 시간표가 달라도 같은 회원의 같은 시간은 충돌해야 합니다.",
);

assert.equal(
  findOverlap(activeMember, once("2026-10-26"))?.id,
  "active",
  "활성 주간 수업과 같은 날짜·시간의 단발 수업은 충돌해야 합니다.",
);

const excludedMember = { ...activeMember, exclusions: [{ scheduleId: "active", date: "2026-10-26" }] };
assert.equal(
  findOverlap(excludedMember, once("2026-10-26")),
  undefined,
  "해당 날짜에서 제외한 주간 수업은 같은 날짜의 대체 단발 수업을 막으면 안 됩니다.",
);

const oneOffMember = { firstPaymentDate: "2026-05-04", schedules: [once("2026-10-26", { id: "existing-once" })] };
assert.equal(
  findOverlap(oneOffMember, weekly({ id: "new", startDate: "2026-10-26" }))?.id,
  "existing-once",
  "시작일에 이미 있는 단발 수업은 새 주간 수업과 충돌해야 합니다.",
);
assert.equal(
  findOverlap(oneOffMember, weekly({ id: "new-later", startDate: "2026-11-02" })),
  undefined,
  "주간 수업 시작일 전의 단발 수업은 충돌하지 않아야 합니다.",
);

console.log("시간표 적용일/중복 판정 테스트 통과");
