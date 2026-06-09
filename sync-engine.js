(() => {
  const SETTINGS_ID = "member-desk";
  const TABLES = {
    settings: "app_settings",
    members: "members",
    schedules: "schedules",
    payments: "payments",
    attendances: "attendances",
  };
  const POLL_INTERVAL = 5000;

  let baseline = null;
  let pendingSnapshot = null;
  let syncPromise = null;
  let syncTimer = null;
  let pollTimer = null;
  let applyingRemote = false;

  function isConfigured() {
    return Boolean(window.SUPABASE_CONFIG?.url && window.SUPABASE_CONFIG?.anonKey);
  }

  async function load() {
    if (!isConfigured()) return { status: "disabled", data: null };

    try {
      const [settingsRows, memberRows, scheduleRows, paymentRows, attendanceRows] = await Promise.all([
        request(TABLES.settings, `?id=eq.${encodeURIComponent(SETTINGS_ID)}&select=data,updated_at`),
        request(TABLES.members, "?select=id,data,updated_at"),
        request(TABLES.schedules, "?select=id,member_id,data,updated_at"),
        request(TABLES.payments, "?select=id,member_id,data,updated_at"),
        request(TABLES.attendances, "?select=id,member_id,data,updated_at"),
      ]);

      const hasData =
        settingsRows.length ||
        memberRows.length ||
        scheduleRows.length ||
        paymentRows.length ||
        attendanceRows.length;
      if (!hasData) {
        baseline = flatten({ lessonTypes: [], members: [] });
        return { status: "empty", data: null };
      }

      const settings = settingsRows[0]?.data || {};
      const membersById = new Map(
        memberRows.map((row) => [
          row.id,
          {
            ...row.data,
            id: row.id,
            schedules: [],
            payments: [],
            attendances: [],
          },
        ]),
      );

      attachRows(membersById, scheduleRows, "schedules");
      attachRows(membersById, paymentRows, "payments");
      attachRows(membersById, attendanceRows, "attendances");

      const data = {
        ...settings,
        members: [...membersById.values()],
      };
      baseline = flatten(data);
      return { status: "ready", data };
    } catch (error) {
      if (error.status === 404) return { status: "unavailable", data: null, error };
      return { status: "failed", data: null, error };
    }
  }

  function attachRows(membersById, rows, key) {
    rows.forEach((row) => {
      const member = membersById.get(row.member_id);
      if (!member) return;
      member[key].push({ ...row.data, id: row.id });
    });
  }

  function queue(data) {
    if (!isConfigured() || applyingRemote) return;
    pendingSnapshot = clone(data);
    window.clearTimeout(syncTimer);
    syncTimer = window.setTimeout(() => {
      flush().catch(reportSyncError);
    }, 250);
  }

  async function flush(data) {
    if (!isConfigured()) return;
    if (data) pendingSnapshot = clone(data);
    if (syncPromise) {
      await syncPromise;
      if (!pendingSnapshot) return;
    }

    syncPromise = runPendingSync();
    try {
      await syncPromise;
    } finally {
      syncPromise = null;
    }

    if (pendingSnapshot) await flush();
  }

  async function runPendingSync() {
    const nextData = pendingSnapshot;
    pendingSnapshot = null;
    if (!nextData) return;

    const next = flatten(nextData);
    const previous = baseline || emptyFlatState();
    await syncChanges(previous, next);
    baseline = next;
  }

  async function replaceAll(data) {
    if (!isConfigured()) return;
    const remote = await load();
    if (remote.status === "unavailable" || remote.status === "failed") {
      throw remote.error || new Error("Supabase 동기화 테이블을 사용할 수 없습니다.");
    }

    baseline = remote.status === "ready" ? flatten(remote.data) : emptyFlatState();
    pendingSnapshot = clone(data);
    await flush();
  }

  async function syncChanges(previous, next) {
    const memberDeletes = removedIds(previous.members, next.members);
    const scheduleDeletes = removedIds(previous.schedules, next.schedules);
    const paymentDeletes = removedIds(previous.payments, next.payments);
    const attendanceDeletes = removedIds(previous.attendances, next.attendances);

    await Promise.all([
      deleteRows(TABLES.schedules, scheduleDeletes),
      deleteRows(TABLES.payments, paymentDeletes),
      deleteRows(TABLES.attendances, attendanceDeletes),
    ]);
    await deleteRows(TABLES.members, memberDeletes);

    const settingsChanged = serialize(previous.settings) !== serialize(next.settings);
    if (settingsChanged) {
      await upsertRows(TABLES.settings, [
        {
          id: SETTINGS_ID,
          data: next.settings,
          updated_at: new Date().toISOString(),
        },
      ]);
    }

    await upsertRows(TABLES.members, changedRows(previous.members, next.members));
    await Promise.all([
      upsertRows(TABLES.schedules, changedRows(previous.schedules, next.schedules)),
      upsertRows(TABLES.payments, changedRows(previous.payments, next.payments)),
      upsertRows(TABLES.attendances, changedRows(previous.attendances, next.attendances)),
    ]);
  }

  function changedRows(previous, next) {
    return [...next.entries()]
      .filter(([id, row]) => serialize(previous.get(id)) !== serialize(row))
      .map(([, row]) => ({ ...row, updated_at: new Date().toISOString() }));
  }

  function removedIds(previous, next) {
    return [...previous.keys()].filter((id) => !next.has(id));
  }

  async function upsertRows(table, rows) {
    if (!rows.length) return;
    for (let index = 0; index < rows.length; index += 200) {
      await request(table, "?on_conflict=id", {
        method: "POST",
        body: rows.slice(index, index + 200),
        prefer: "resolution=merge-duplicates",
      });
    }
  }

  async function deleteRows(table, ids) {
    if (!ids.length) return;
    for (let index = 0; index < ids.length; index += 100) {
      const values = ids
        .slice(index, index + 100)
        .map((id) => `"${String(id).replaceAll('"', '\\"')}"`)
        .join(",");
      await request(table, `?id=in.(${encodeURIComponent(values)})`, { method: "DELETE" });
    }
  }

  function flatten(data) {
    const settings = clone(data);
    delete settings.members;

    const flat = {
      settings,
      members: new Map(),
      schedules: new Map(),
      payments: new Map(),
      attendances: new Map(),
    };

    (data.members || []).forEach((member) => {
      const memberData = clone(member);
      delete memberData.id;
      delete memberData.schedules;
      delete memberData.payments;
      delete memberData.attendances;
      flat.members.set(member.id, {
        id: member.id,
        data: memberData,
      });

      addMemberRows(flat.schedules, member, "schedules");
      addMemberRows(flat.payments, member, "payments");
      addMemberRows(flat.attendances, member, "attendances", true);
    });

    return flat;
  }

  function addMemberRows(target, member, key, attendance = false) {
    (member[key] || []).forEach((item) => {
      const data = clone(item);
      delete data.id;
      const row = {
        id: item.id,
        member_id: member.id,
        data,
      };
      if (attendance) row.record_key = getAttendanceRecordKey(item);
      target.set(item.id, row);
    });
  }

  function getAttendanceRecordKey(item) {
    return [
      String(item.date || "").trim(),
      String(item.className || "출석").trim(),
      normalizeTime(item.time),
    ].join("|");
  }

  function normalizeTime(value) {
    const match = String(value || "").trim().match(/^(\d{1,2}):(\d{2})/);
    if (!match) return String(value || "").trim();
    return `${match[1].padStart(2, "0")}:${match[2]}`;
  }

  function emptyFlatState() {
    return {
      settings: {},
      members: new Map(),
      schedules: new Map(),
      payments: new Map(),
      attendances: new Map(),
    };
  }

  function start(onRemoteData) {
    stop();
    if (!isConfigured()) return;

    const refresh = async () => {
      if (syncPromise || pendingSnapshot || document.hidden) return;
      const remote = await load();
      if (remote.status !== "ready" || !remote.data) return;

      applyingRemote = true;
      try {
        onRemoteData(clone(remote.data));
      } finally {
        applyingRemote = false;
      }
    };

    pollTimer = window.setInterval(() => {
      refresh().catch(() => {});
    }, POLL_INTERVAL);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
  }

  function stop() {
    window.clearInterval(pollTimer);
    pollTimer = null;
  }

  async function request(table, query = "", options = {}) {
    const response = await fetch(`${getBaseUrl()}/rest/v1/${table}${query}`, {
      method: options.method || "GET",
      headers: {
        apikey: window.SUPABASE_CONFIG.anonKey,
        Authorization: `Bearer ${window.SUPABASE_CONFIG.anonKey}`,
        "Content-Type": "application/json",
        ...(options.prefer ? { Prefer: options.prefer } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      cache: "no-store",
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      const error = new Error(`Supabase ${table} 요청 실패 (${response.status})${body ? `\n${body.slice(0, 300)}` : ""}`);
      error.status = response.status;
      throw error;
    }

    if (response.status === 204) return [];
    const text = await response.text();
    return text ? JSON.parse(text) : [];
  }

  function getBaseUrl() {
    return String(window.SUPABASE_CONFIG.url || "")
      .trim()
      .replace(/\/rest\/v1\/?.*$/, "")
      .replace(/\/$/, "");
  }

  function reportSyncError(error) {
    console.error(error);
    window.dispatchEvent(new CustomEvent("ramon-sync-error", { detail: error }));
  }

  function serialize(value) {
    return JSON.stringify(value ?? null);
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  window.RamonSync = {
    isConfigured,
    load,
    queue,
    flush,
    replaceAll,
    start,
    stop,
  };
})();
