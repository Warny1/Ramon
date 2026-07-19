const SETTINGS_ID = "member-desk";
const TABLES = {
  backups: "app_backups",
  settings: "app_settings",
  members: "members",
  schedules: "schedules",
  payments: "payments",
  attendances: "attendances",
  legacyState: "app_state",
};

export default async function handler(request, response) {
  if (request.method !== "GET" && request.method !== "POST") {
    response.setHeader("Allow", "GET, POST");
    response.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  try {
    const data = await loadCurrentData();
    const backupDate = getKoreaDate();
    const backup = {
      id: `backup-${backupDate}`,
      backup_date: backupDate,
      source: "vercel-cron",
      data,
      summary: {
        members: data.members.length,
        schedules: data.members.reduce((sum, member) => sum + (member.schedules || []).length, 0),
        payments: data.members.reduce((sum, member) => sum + (member.payments || []).length, 0),
        attendances: data.members.reduce((sum, member) => sum + (member.attendances || []).length, 0),
      },
      created_at: new Date().toISOString(),
    };

    await requestSupabase(TABLES.backups, "?on_conflict=id", {
      method: "POST",
      prefer: "resolution=merge-duplicates",
      body: [backup],
    });

    response.status(200).json({ ok: true, id: backup.id, summary: backup.summary });
  } catch (error) {
    response.status(500).json({ ok: false, error: error.message || "Backup failed" });
  }
}

async function loadCurrentData() {
  const [settingsRows, memberRows, scheduleRows, paymentRows, attendanceRows] = await Promise.all([
    requestSupabase(TABLES.settings, `?id=eq.${encodeURIComponent(SETTINGS_ID)}&select=data,updated_at`),
    requestSupabase(TABLES.members, "?select=id,data,updated_at"),
    requestSupabase(TABLES.schedules, "?select=id,member_id,data,updated_at"),
    requestSupabase(TABLES.payments, "?select=id,member_id,data,updated_at"),
    requestSupabase(TABLES.attendances, "?select=id,member_id,data,updated_at"),
  ]);

  if (settingsRows.length || memberRows.length || scheduleRows.length || paymentRows.length || attendanceRows.length) {
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

    return {
      ...(settingsRows[0]?.data || {}),
      members: [...membersById.values()],
    };
  }

  const legacyRows = await requestSupabase(TABLES.legacyState, `?id=eq.${encodeURIComponent(SETTINGS_ID)}&select=data`);
  const legacyData = legacyRows[0]?.data;
  if (legacyData?.members) return legacyData;

  return { members: [] };
}

function attachRows(membersById, rows, key) {
  rows.forEach((row) => {
    const member = membersById.get(row.member_id);
    if (!member) return;
    member[key].push({ ...row.data, id: row.id });
  });
}

async function requestSupabase(table, query = "", options = {}) {
  const baseUrl = getSupabaseUrl();
  const key = getSupabaseKey();
  const result = await fetch(`${baseUrl}/rest/v1/${table}${query}`, {
    method: options.method || "GET",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(options.prefer ? { Prefer: options.prefer } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!result.ok) {
    const message = await result.text().catch(() => "");
    throw new Error(`Supabase ${table} failed (${result.status}) ${message.slice(0, 300)}`.trim());
  }

  if (result.status === 204) return [];
  const text = await result.text();
  return text ? JSON.parse(text) : [];
}

function getSupabaseUrl() {
  const value = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
  if (!value) throw new Error("SUPABASE_URL is missing");
  return value.replace(/\/$/, "");
}

function getSupabaseKey() {
  const value = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
  if (!value) throw new Error("SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY is missing");
  return value;
}

function getKoreaDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
