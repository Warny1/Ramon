import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const source = await readFile(new URL("../sync-engine.js", import.meta.url), "utf8");
const tables = Object.fromEntries(
  ["app_settings", "members", "schedules", "payments", "attendances"].map((name) => [name, new Map()]),
);

function resetTables() {
  Object.values(tables).forEach((table) => table.clear());
}

function createEngine() {
  const context = vm.createContext({
    console,
    CustomEvent: class CustomEvent {
      constructor(type, options = {}) {
        this.type = type;
        this.detail = options.detail;
      }
    },
    document: {
      hidden: false,
      addEventListener() {},
    },
    fetch: fakeFetch,
    setInterval,
    clearInterval,
    setTimeout,
    clearTimeout,
  });
  context.window = {
    SUPABASE_CONFIG: {
      url: "https://example.supabase.co",
      anonKey: "test-key",
    },
    addEventListener() {},
    clearInterval,
    clearTimeout,
    dispatchEvent() {},
    setInterval,
    setTimeout,
  };
  vm.runInContext(source, context);
  return context.window.RamonSync;
}

async function fakeFetch(input, options = {}) {
  const url = new URL(input);
  const tableName = url.pathname.split("/").at(-1);
  const table = tables[tableName];
  const method = options.method || "GET";

  if (!table) return response(404, { message: "missing table" });

  if (method === "GET") {
    let rows = [...table.values()];
    const idFilter = url.searchParams.get("id");
    if (idFilter?.startsWith("eq.")) {
      const id = idFilter.slice(3);
      rows = rows.filter((row) => row.id === id);
    }
    return response(200, rows);
  }

  if (method === "POST") {
    JSON.parse(options.body).forEach((row) => table.set(row.id, structuredClone(row)));
    return response(201, null);
  }

  if (method === "DELETE") {
    const idFilter = decodeURIComponent(url.searchParams.get("id") || "");
    const ids = [...idFilter.matchAll(/"([^"]+)"/g)].map((match) => match[1]);
    ids.forEach((id) => table.delete(id));
    return response(204, null);
  }

  return response(405, null);
}

function response(status, body) {
  const text = body === null ? "" : JSON.stringify(body);
  return {
    ok: status >= 200 && status < 300,
    status,
    async text() {
      return text;
    },
  };
}

const initial = {
  lessonTypes: [{ name: "주1 / 1인 (30분)", amount: 190000, sessions: 4 }],
  members: [
    {
      id: "member-1",
      name: "테스트 회원",
      phone: "",
      memo: "",
      defaultLessonType: "주1 / 1인 (30분)",
      createdAt: "2026-06-09",
      schedules: [],
      payments: [],
      attendances: [],
    },
  ],
};

const firstDevice = createEngine();
await firstDevice.replaceAll(initial);

const secondDevice = createEngine();
const firstLoad = await firstDevice.load();
const secondLoad = await secondDevice.load();

const firstState = structuredClone(firstLoad.data);
firstState.members[0].attendances.push({
  id: "attendance-1",
  date: "2026-06-09",
  className: "수업",
  time: "10:00",
  status: "출석",
});
await firstDevice.flush(firstState);

const secondState = structuredClone(secondLoad.data);
secondState.members[0].payments.push({
  id: "payment-1",
  date: "2026-06-09",
  lessonType: "주1 / 1인 (30분)",
  sessions: 4,
  amount: 190000,
  memo: "",
});
await secondDevice.flush(secondState);

assert.equal(tables.attendances.size, 1, "첫 번째 기기의 출석 기록이 유지되어야 합니다.");
assert.equal(tables.payments.size, 1, "두 번째 기기의 결제 기록이 저장되어야 합니다.");

const finalLoad = await firstDevice.load();
assert.equal(finalLoad.data.members[0].attendances.length, 1);
assert.equal(finalLoad.data.members[0].payments.length, 1);

await firstDevice.deleteAttendances(["attendance-1"]);
assert.equal(tables.attendances.size, 0, "직접 삭제한 출석 기록은 원격에서도 삭제되어야 합니다.");

resetTables();

const protectedInitial = {
  lessonTypes: [{ name: "주1 / 1인 (30분)", amount: 190000, sessions: 4 }],
  members: [
    {
      id: "member-2",
      name: "삭제 보호 회원",
      phone: "",
      memo: "",
      defaultLessonType: "주1 / 1인 (30분)",
      createdAt: "2026-09-01",
      schedules: [
        {
          id: "schedule-2",
          day: 2,
          time: "10:00",
          className: "수업",
          lessonType: "주1 / 1인 (30분)",
        },
      ],
      payments: [
        {
          id: "payment-2",
          date: "2026-09-01",
          lessonType: "주1 / 1인 (30분)",
          sessions: 4,
          amount: 190000,
          memo: "",
        },
      ],
      attendances: [
        {
          id: "attendance-2",
          date: "2026-09-01",
          className: "수업",
          time: "10:00",
          status: "출석",
        },
      ],
    },
  ],
};

const freshDevice = createEngine();
await freshDevice.replaceAll(protectedInitial);

const staleDevice = createEngine();
const staleLoad = await staleDevice.load();
const staleState = structuredClone(staleLoad.data);
staleState.members = [];
await staleDevice.flush(staleState);

assert.equal(tables.members.size, 1, "오래된 기기의 회원 누락은 원격 회원을 삭제하면 안 됩니다.");
assert.equal(tables.payments.size, 1, "오래된 기기의 결제 누락은 원격 결제를 삭제하면 안 됩니다.");
assert.equal(tables.schedules.size, 1, "오래된 기기의 시간표 누락은 원격 시간표를 삭제하면 안 됩니다.");
assert.equal(tables.attendances.size, 1, "오래된 기기의 출석 누락은 원격 출석을 삭제하면 안 됩니다.");

const deleteDevice = createEngine();
const deleteLoad = await deleteDevice.load();
const deleteState = structuredClone(deleteLoad.data);
deleteState.deletedMemberIds = ["member-2"];
deleteState.members = [];
await deleteDevice.flush(deleteState);

assert.equal(tables.members.size, 0, "명시 삭제한 회원은 원격에서도 삭제되어야 합니다.");
assert.equal(tables.payments.size, 0, "명시 삭제한 회원의 결제는 원격에서도 삭제되어야 합니다.");
assert.equal(tables.schedules.size, 0, "명시 삭제한 회원의 시간표는 원격에서도 삭제되어야 합니다.");
assert.equal(tables.attendances.size, 0, "명시 삭제한 회원의 출석은 원격에서도 삭제되어야 합니다.");

resetTables();

const scheduleInitial = {
  lessonTypes: [],
  members: [
    {
      id: "member-3",
      name: "종료 일정 보호 회원",
      phone: "",
      memo: "",
      defaultLessonType: "",
      createdAt: "2026-10-01",
      schedules: [
        {
          id: "schedule-3",
          day: 3,
          time: "10:00",
          className: "수업",
          startDate: "2026-10-01",
          endDate: "",
        },
      ],
      payments: [],
      attendances: [],
    },
  ],
};

const scheduleFreshDevice = createEngine();
await scheduleFreshDevice.replaceAll(scheduleInitial);

const scheduleStaleDevice = createEngine();
const scheduleStaleState = structuredClone((await scheduleStaleDevice.load()).data);
const scheduleFreshState = structuredClone((await scheduleFreshDevice.load()).data);
scheduleFreshState.members[0].schedules[0].endDate = "2026-10-07";
await scheduleFreshDevice.flush(scheduleFreshState);

scheduleStaleState.members[0].schedules[0].status = "보강";
await scheduleStaleDevice.flush(scheduleStaleState);

const protectedSchedule = tables.schedules.get("schedule-3");
assert.equal(protectedSchedule.data.endDate, "2026-10-07", "오래된 기기가 빈 종료일을 저장해 종료된 시간표를 다시 열면 안 됩니다.");
assert.equal(protectedSchedule.data.status, "보강", "종료일과 무관한 오래된 기기의 수정은 유지되어야 합니다.");

resetTables();

const replaceInitial = {
  lessonTypes: [],
  members: [
    {
      id: "member-4",
      name: "시간표 교체 회원",
      phone: "",
      memo: "",
      defaultLessonType: "",
      createdAt: "2026-10-01",
      schedules: [
        { id: "schedule-once-old", day: 4, date: "2026-10-08", time: "10:00", className: "보강" },
        { id: "schedule-weekly-old", day: 4, date: "", startDate: "", time: "11:00", className: "수업" },
      ],
      payments: [],
      attendances: [],
    },
  ],
};

const replaceDevice = createEngine();
await replaceDevice.replaceAll(replaceInitial);
const replaceState = structuredClone((await replaceDevice.load()).data);
replaceState.deletedScheduleIds = ["schedule-once-old", "schedule-weekly-old"];
replaceState.members[0].schedules = [
  { id: "schedule-once-new", day: 4, date: "2026-10-08", time: "10:30", className: "보강" },
  { id: "schedule-weekly-new", day: 5, date: "", startDate: "", time: "11:00", className: "수업" },
];
await replaceDevice.flush(replaceState);

assert.equal(tables.schedules.has("schedule-once-old"), false, "일회성 시간표 수정 시 기존 원격 row를 삭제해야 합니다.");
assert.equal(tables.schedules.has("schedule-weekly-old"), false, "시작일 없는 반복 시간표 수정 시 기존 원격 row를 삭제해야 합니다.");
assert.equal(tables.schedules.has("schedule-once-new"), true, "수정된 일회성 시간표를 저장해야 합니다.");
assert.equal(tables.schedules.has("schedule-weekly-new"), true, "수정된 반복 시간표를 저장해야 합니다.");

console.log("동시 기기 출석/결제 저장 충돌 테스트 통과");
