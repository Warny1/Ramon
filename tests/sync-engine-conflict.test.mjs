import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const source = await readFile(new URL("../sync-engine.js", import.meta.url), "utf8");
const tables = Object.fromEntries(
  ["app_settings", "members", "schedules", "payments", "attendances"].map((name) => [name, new Map()]),
);

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

console.log("동시 기기 출석/결제 저장 충돌 테스트 통과");
