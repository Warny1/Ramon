const STORAGE_KEY = "member-desk-data-v5-corrected-payments";
const LEGACY_STORAGE_KEY = "member-desk-data-v1";
const AUTH_STORAGE_KEY = "member-desk-auth-session";
const SUPABASE_TABLE = "app_state";
const SUPABASE_RECORD_ID = "member-desk";
const PRESET_TIMETABLE_VERSION = "2026-06-photo-timetable-1";
const PRESET_PAYMENTS_VERSION = "2026-06-corrected-payments-1";
const PRESET_ATTENDANCE_VERSION = window.PRESET_ATTENDANCE_VERSION || "";
const presetAttendanceEntries = window.PRESET_ATTENDANCE_ENTRIES || [];

const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
const timetableDays = [1, 2, 3, 4, 5, 6, 0];
const timetableTimes = createTimeSlots("06:00", "23:00", 30);
const defaultLessonTypes = [
  { name: "주1 / 1인 (30분)", amount: 190000, sessions: 4 },
  { name: "주1 / 2인 (30분)", amount: 150000, sessions: 2 },
  { name: "주2 / 1인 (30분)", amount: 320000, sessions: 8 },
  { name: "주2 / 2인 (30분)", amount: 250000, sessions: 4 },
  { name: "주1 / 1인 (20분)", amount: 150000, sessions: 4 },
  { name: "주1 / 2인 (20분)", amount: 260000, sessions: 2 },
  { name: "주2 / 1인 (20분)", amount: 120000, sessions: 8 },
  { name: "주2 / 2인 (20분)", amount: 170000, sessions: 4 },
  { name: "쿠폰 (30분)", amount: 380000, sessions: 8 },
  { name: "1회 체험 (1인)", amount: 45000, sessions: 1 },
  { name: "1회 체험 (2인)", amount: 30000, sessions: 0.5 },
];
const currency = new Intl.NumberFormat("ko-KR");
const today = new Date();
const todayISO = toISODate(today);

const seedData = {
  lessonTypes: defaultLessonTypes,
  members: [],
};

const presetTimetableEntries = [
  { day: 6, time: "08:00", names: ["김민진"] },
  { day: 6, time: "08:30", names: ["이성은", "오유미"] },
  { day: 6, time: "09:00", names: ["이성은", "오유미"] },
  { day: 3, time: "09:00", names: ["최수연"] },
  { day: 0, time: "09:00", names: ["백재승"], status: "보강" },
  { day: 3, time: "09:30", names: ["오세웅"] },
  { day: 5, time: "09:30", names: ["차슬기"] },
  { day: 6, time: "09:30", names: ["이창훈"] },
  { day: 0, time: "09:30", names: ["김민진"] },
  { day: 2, time: "10:00", names: ["허재영"] },
  { day: 3, time: "10:00", names: ["류서형"] },
  { day: 4, time: "10:00", names: ["허재영"] },
  { day: 5, time: "10:00", names: ["백선국"] },
  { day: 6, time: "10:00", names: ["박민기"] },
  { day: 1, time: "10:30", names: ["김동현"] },
  { day: 2, time: "10:30", names: ["박지연"] },
  { day: 3, time: "10:30", names: ["송현태"] },
  { day: 5, time: "10:30", names: ["정민수"] },
  { day: 6, time: "10:30", names: ["조소희"] },
  { day: 0, time: "10:30", names: ["안영재"] },
  { day: 1, time: "11:00", names: ["최원"] },
  { day: 2, time: "11:00", names: ["박지연"] },
  { day: 3, time: "11:00", names: ["김현우"] },
  { day: 5, time: "11:00", names: ["이진현"] },
  { day: 6, time: "11:00", names: ["안광호"] },
  { day: 0, time: "11:00", names: ["안영재"] },
  { day: 1, time: "11:30", names: ["최원"] },
  { day: 2, time: "11:30", names: ["정채린"] },
  { day: 4, time: "11:30", names: ["정채린"] },
  { day: 5, time: "11:30", names: ["이진현"] },
  { day: 6, time: "11:30", names: ["김찬미", "심온"] },
  { day: 0, time: "11:30", names: ["이상민"] },
  { day: 5, time: "12:00", names: ["오혜진"] },
  { day: 6, time: "12:00", names: ["김유상"] },
  { day: 0, time: "12:00", names: ["김유상"] },
  { day: 2, time: "12:30", names: ["김선욱"] },
  { day: 4, time: "13:30", names: ["김동현"] },
  { day: 2, time: "14:00", names: ["정민수"] },
  { day: 6, time: "14:00", names: ["이윤영", "염창훈"] },
  { day: 0, time: "15:00", names: ["양동민", "류다현"] },
  { day: 4, time: "16:00", names: ["손덕칭"] },
  { day: 1, time: "16:30", names: ["진예원"] },
  { day: 3, time: "16:30", names: ["진예원"] },
  { day: 4, time: "16:30", names: ["손덕칭"] },
  { day: 4, time: "17:30", names: ["송현태"] },
  { day: 0, time: "17:30", names: ["손지아", "김보미"] },
  { day: 1, time: "18:30", names: ["박병욱"] },
  { day: 2, time: "18:30", names: ["김나리"] },
  { day: 3, time: "18:30", names: ["이현정"] },
  { day: 5, time: "18:30", names: ["문인기"] },
  { day: 1, time: "19:00", names: ["류서형", "최연수"] },
  { day: 2, time: "19:00", names: ["박홍수"] },
  { day: 3, time: "19:00", names: ["류서형", "최연수"] },
  { day: 5, time: "19:00", names: ["김용욱"] },
  { day: 2, time: "19:30", names: ["김현우"] },
  { day: 4, time: "19:30", names: ["김현우"] },
  { day: 5, time: "19:30", names: ["정지영"] },
  { day: 1, time: "20:00", names: ["김현웅"] },
  { day: 2, time: "20:00", names: ["송현태"] },
  { day: 3, time: "20:00", names: ["김남주"] },
  { day: 4, time: "20:00", names: ["최예지"] },
  { day: 5, time: "20:00", names: ["최수연"] },
  { day: 1, time: "20:30", names: ["김태완"] },
  { day: 3, time: "20:30", names: ["오혜진"] },
  { day: 4, time: "20:30", names: ["이동찬"] },
  { day: 3, time: "21:00", names: ["오세웅"] },
  { day: 4, time: "21:00", names: ["서종민"] },
  { day: 2, time: "21:30", names: ["백재승"] },
  { day: 3, time: "21:30", names: ["박홍수"] },
  { day: 3, time: "22:00", names: ["박홍수"] },
];

const presetPaymentEntries = [
  { date: "2026-05-11", names: ["최원"], lessonType: "주2 / 1인 (30분)", sessions: 8, amount: 320000 },
  { date: "2026-05-12", names: ["허재영"], lessonType: "주2 / 1인 (30분)", sessions: 8, amount: 320000 },
  { date: "2026-04-29", names: ["손덕칭"], lessonType: "주2 / 1인 (30분)", sessions: 8, amount: 320000 },
  { date: "2026-04-29", names: ["김남주", "오혜진"], lessonType: "주2 / 2인 (30분)", sessions: 4, amount: 250000 },
  { date: "2026-04-29", names: ["김남주", "오혜진"], lessonType: "주2 / 2인 (30분)", sessions: 4, amount: 250000 },
  { date: "2026-04-29", names: ["서종민"], lessonType: "주1 / 1인 (30분)", sessions: 4, amount: 190000 },
  { date: "2026-04-29", names: ["오세웅"], lessonType: "주1 / 1인 (30분)", sessions: 4, amount: 190000 },
  { date: "2026-04-29", names: ["이동찬"], lessonType: "주1 / 1인 (30분)", sessions: 4, amount: 190000 },
  { date: "2026-04-29", names: ["류서형", "최연수"], lessonType: "주2 / 2인 (20분)", sessions: 4, amount: 170000 },
  { date: "2026-04-29", names: ["류서형", "최연수"], lessonType: "주2 / 2인 (20분)", sessions: 4, amount: 170000 },
  { date: "2026-05-01", names: ["최수연"], lessonType: "주1 / 1인 (30분)", sessions: 4, amount: 190000 },
  { date: "2026-05-01", names: ["차슬기"], lessonType: "주1 / 1인 (30분)", sessions: 4, amount: 190000 },
  { date: "2026-05-01", names: ["백선국"], lessonType: "주1 / 1인 (30분)", sessions: 4, amount: 190000 },
  { date: "2026-05-01", names: ["이진현"], lessonType: "주2 / 1인 (30분)", sessions: 8, amount: 320000 },
  { date: "2026-05-02", names: ["조소희"], lessonType: "주1 / 1인 (30분)", sessions: 4, amount: 190000 },
  { date: "2026-05-02", names: ["박민기"], lessonType: "주2 / 1인 (30분)", sessions: 8, amount: 320000 },
  { date: "2026-05-03", names: ["이윤영", "염창훈"], lessonType: "주1 / 2인 (30분)", sessions: 2, amount: 150000 },
  { date: "2026-05-03", names: ["이윤영", "염창훈"], lessonType: "주1 / 2인 (30분)", sessions: 2, amount: 150000 },
  { date: "2026-05-04", names: ["박병욱"], lessonType: "주1 / 1인 (30분)", sessions: 4, amount: 190000 },
  { date: "2026-05-04", names: ["김유상"], lessonType: "주2 / 1인 (30분)", sessions: 8, amount: 320000 },
  { date: "2026-05-04", names: ["진예원"], lessonType: "주2 / 1인 (30분)", sessions: 8, amount: 320000 },
  { date: "2026-05-09", names: ["이창훈"], lessonType: "주1 / 1인 (30분)", sessions: 4, amount: 190000 },
  { date: "2026-05-09", names: ["이성은", "오유미"], lessonType: "주2 / 2인 (30분)", sessions: 4, amount: 250000 },
  { date: "2026-05-09", names: ["이성은", "오유미"], lessonType: "주2 / 2인 (30분)", sessions: 4, amount: 250000 },
  { date: "2026-05-09", names: ["정지영"], lessonType: "주1 / 1인 (30분)", sessions: 4, amount: 190000 },
  { date: "2026-05-09", names: ["김용욱"], lessonType: "주1 / 1인 (30분)", sessions: 4, amount: 190000 },
  { date: "2026-05-10", names: ["양동민", "류다현"], lessonType: "주1 / 2인 (30분)", sessions: 2, amount: 150000 },
  { date: "2026-05-10", names: ["양동민", "류다현"], lessonType: "주1 / 2인 (30분)", sessions: 2, amount: 150000 },
  { date: "2026-05-11", names: ["김나리"], lessonType: "주1 / 1인 (30분)", sessions: 4, amount: 190000 },
  { date: "2026-05-01", names: ["안영재"], lessonType: "주2 / 1인 (30분)", sessions: 8, amount: 320000 },
  { date: "2026-05-01", names: ["안영재"], lessonType: "주2 / 1인 (30분)", sessions: 8, amount: 320000 },
  { date: "2026-05-01", names: ["안영재"], lessonType: "주2 / 1인 (30분)", sessions: 8, amount: 320000 },
  { date: "2026-05-04", names: ["박병욱"], lessonType: "주1 / 1인 (30분)", sessions: 4, amount: 190000 },
  { date: "2026-05-04", names: ["박병욱"], lessonType: "주1 / 1인 (30분)", sessions: 4, amount: 190000 },
  { date: "2026-05-10", names: ["정재영", "최다연"], lessonType: "주1 / 2인 (30분)", sessions: 2, amount: 150000 },
  { date: "2026-05-10", names: ["정재영", "최다연"], lessonType: "주1 / 2인 (30분)", sessions: 2, amount: 150000 },
  { date: "2026-05-10", names: ["유기현"], lessonType: "주2 / 1인 (30분)", sessions: 8, amount: 320000 },
  { date: "2026-05-03", names: ["안광호"], lessonType: "주1 / 1인 (30분)", sessions: 4, amount: 190000 },
  { date: "2026-05-02", names: ["이상민"], lessonType: "주1 / 1인 (30분)", sessions: 4, amount: 190000 },
  { date: "2026-04-29", names: ["박홍수"], lessonType: "주2 / 1인 (30분)", sessions: 8, amount: 320000 },
  { date: "2026-05-01", names: ["문인기"], lessonType: "주1 / 1인 (30분)", sessions: 4, amount: 190000 },
  { date: "2026-05-07", names: ["정채린"], lessonType: "주2 / 1인 (30분)", sessions: 8, amount: 320000 },
  { date: "2026-04-29", names: ["김현웅"], lessonType: "주1 / 1인 (30분)", sessions: 4, amount: 190000 },
  { date: "2026-05-08", names: ["김태완"], lessonType: "주1 / 1인 (30분)", sessions: 4, amount: 190000 },
  { date: "2026-05-07", names: ["최예지"], lessonType: "주1 / 1인 (30분)", sessions: 4, amount: 190000 },
  { date: "2026-05-02", names: ["김찬미", "심온"], lessonType: "주1 / 2인 (30분)", sessions: 2, amount: 150000 },
  { date: "2026-05-02", names: ["김찬미", "심온"], lessonType: "주1 / 2인 (30분)", sessions: 2, amount: 150000 },
  { date: "2026-05-10", names: ["손지아", "김보미"], lessonType: "주1 / 2인 (30분)", sessions: 2, amount: 150000 },
  { date: "2026-05-10", names: ["손지아", "김보미"], lessonType: "주1 / 2인 (30분)", sessions: 2, amount: 150000 },
  { date: "2026-05-13", names: ["박홍수"], lessonType: "주2 / 1인 (30분)", sessions: 8, amount: 320000 },
  { date: "2026-05-14", names: ["김민진"], lessonType: "주2 / 1인 (30분)", sessions: 8, amount: 320000 },
  { date: "2026-05-13", names: ["이현정"], lessonType: "주1 / 1인 (30분)", sessions: 4, amount: 190000 },
  { date: "2026-05-13", names: ["김현우"], lessonType: "주2 / 1인 (30분)", sessions: 8, amount: 320000 },
  { date: "2026-05-13", names: ["김선욱"], lessonType: "주2 / 1인 (30분)", sessions: 8, amount: 320000 },
  { date: "2026-05-17", names: ["백재승"], lessonType: "주1 / 1인 (30분)", sessions: 4, amount: 190000 },
  { date: "2026-05-20", names: ["박지연"], lessonType: "주2 / 1인 (30분)", sessions: 8, amount: 320000 },
  { date: "2026-05-19", names: ["최수연"], lessonType: "주1 / 1인 (30분)", sessions: 4, amount: 190000 },
  { date: "2026-05-21", names: ["송현태"], lessonType: "주2 / 1인 (30분)", sessions: 8, amount: 320000 },
  { date: "2026-05-22", names: ["이진현"], lessonType: "주2 / 1인 (30분)", sessions: 8, amount: 320000 },
  { date: "2026-05-22", names: ["이윤영", "염창훈"], lessonType: "주1 / 2인 (30분)", sessions: 2, amount: 150000 },
  { date: "2026-05-22", names: ["이윤영", "염창훈"], lessonType: "주1 / 2인 (30분)", sessions: 2, amount: 150000 },
  { date: "2026-05-24", names: ["진예원"], lessonType: "주2 / 1인 (30분)", sessions: 8, amount: 320000 },
  { date: "2026-05-24", names: ["김유상"], lessonType: "주2 / 1인 (30분)", sessions: 8, amount: 320000 },
  { date: "2026-05-23", names: ["박민기"], lessonType: "주2 / 1인 (30분)", sessions: 8, amount: 320000 },
  { date: "2026-05-23", names: ["조소희"], lessonType: "주1 / 1인 (30분)", sessions: 4, amount: 190000 },
  { date: "2026-05-28", names: ["김동현"], lessonType: "주2 / 1인 (30분)", sessions: 8, amount: 320000 },
  { date: "2026-05-28", names: ["서종민"], lessonType: "주1 / 1인 (30분)", sessions: 4, amount: 190000 },
  { date: "2026-05-28", names: ["이동찬"], lessonType: "주1 / 1인 (30분)", sessions: 4, amount: 190000 },
  { date: "2026-05-28", names: ["손덕칭"], lessonType: "주2 / 1인 (30분)", sessions: 8, amount: 320000 },
  { date: "2026-05-29", names: ["백선국"], lessonType: "주1 / 1인 (30분)", sessions: 4, amount: 190000 },
  { date: "2026-05-29", names: ["차슬기"], lessonType: "주1 / 1인 (30분)", sessions: 4, amount: 190000 },
  { date: "2026-05-26", names: ["정채린"], lessonType: "주2 / 1인 (30분)", sessions: 8, amount: 320000 },
  { date: "2026-05-27", names: ["오세웅"], lessonType: "주1 / 1인 (30분)", sessions: 4, amount: 190000 },
  { date: "2026-05-23", names: ["정민수"], lessonType: "주2 / 1인 (30분)", sessions: 8, amount: 320000 },
];

let state = cloneData(seedData);
let selectedMemberId = null;
let memberView = "today";
let timetableView = "focus";
let activeDetailPanel = "schedule";
let mobileView = "today";
let authSession = null;
let currentProfile = { role: "admin", memberName: "" };

const $ = (selector) => document.querySelector(selector);

const elements = {
  sidebarTitle: $("#sidebarTitle"),
  memberSearch: $("#memberSearch"),
  memberList: $("#memberList"),
  memberViewButtons: document.querySelectorAll("[data-member-view]"),
  mobileNavButtons: document.querySelectorAll("[data-mobile-view]"),
  todayLabel: $("#todayLabel"),
  todayClasses: $("#todayClasses"),
  lowBalance: $("#lowBalance"),
  monthlyRevenue: $("#monthlyRevenue"),
  monthlyPaymentList: $("#monthlyPaymentList"),
  roleBadge: $("#roleBadge"),
  authModal: $("#authModal"),
  authForm: $("#authForm"),
  authError: $("#authError"),
  emptyState: $("#emptyState"),
  detailView: $("#detailView"),
  memberStatus: $("#memberStatus"),
  memberName: $("#memberName"),
  memberMeta: $("#memberMeta"),
  memberBalance: $("#memberBalance"),
  scheduleList: $("#scheduleList"),
  attendanceList: $("#attendanceList"),
  paymentList: $("#paymentList"),
  detailTabs: document.querySelectorAll(".detail-tab"),
  detailPanels: document.querySelectorAll(".detail-panel"),
  timetableGrid: $("#timetableGrid"),
  timetableRangeLabel: $("#timetableRangeLabel"),
  viewOptions: document.querySelectorAll(".view-option"),
  todaySchedule: $("#todaySchedule"),
  todayCount: $("#todayCount"),
  memberModal: $("#memberModal"),
  memberForm: $("#memberForm"),
  paymentModal: $("#paymentModal"),
  paymentForm: $("#paymentForm"),
  sheetsModal: $("#sheetsModal"),
  pasteMembersText: $("#pasteMembersText"),
  pasteTimetableText: $("#pasteTimetableText"),
  lessonSettingsModal: $("#lessonSettingsModal"),
  lessonSettingsForm: $("#lessonSettingsForm"),
  lessonSettingsList: $("#lessonSettingsList"),
  scheduleModal: $("#scheduleModal"),
  scheduleForm: $("#scheduleForm"),
  scheduleMemberOptions: $("#scheduleMemberOptions"),
};

document.addEventListener("DOMContentLoaded", async () => {
  elements.todayLabel.textContent = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(today);

  $("#openMemberModal").addEventListener("click", () => openModal(elements.memberModal));
  $("#openPaymentModal").addEventListener("click", () => {
    elements.paymentForm.date.value = todayISO;
    getPaymentDiscountSelect().value = "0";
    applyMemberDefaultLessonTypeToPayment();
    openModal(elements.paymentModal);
  });
  $("#openScheduleModal").addEventListener("click", () => {
    elements.scheduleForm.day.value = String(today.getDay());
    elements.scheduleForm.time.value = roundToNextHalfHour();
    applyMemberDefaultLessonTypeToSchedule();
    renderScheduleMemberOptions([selectedMemberId].filter(Boolean));
    openModal(elements.scheduleModal);
  });
  $("#openLessonSettings").addEventListener("click", () => {
    renderLessonSettings();
    openModal(elements.lessonSettingsModal);
  });
  $("#saveNow").addEventListener("click", saveNow);
  $("#signOut").addEventListener("click", signOut);
  $("#openSheetsModal").addEventListener("click", () => openModal(elements.sheetsModal));
  $("#exportSheetCsv").addEventListener("click", exportSheetCsv);
  $("#importSheetCsv").addEventListener("change", importSheetCsv);
  $("#importPastedMembers").addEventListener("click", importPastedMembers);
  $("#importPastedTimetable").addEventListener("click", importPastedTimetable);
  $("#addLessonType").addEventListener("click", () => addLessonSettingsRow());
  $("#markAttendance").addEventListener("click", markAttendance);
  $("#deleteMember").addEventListener("click", deleteSelectedMember);
  $("#exportData").addEventListener("click", exportData);
  $("#importData").addEventListener("change", importData);

  document.querySelectorAll("[data-close]").forEach((button) => {
    button.addEventListener("click", () => closeModal($(`#${button.dataset.close}`)));
  });

  elements.memberSearch.addEventListener("input", render);
  elements.memberViewButtons.forEach((button) => {
    button.addEventListener("click", () => {
      memberView = button.dataset.memberView;
      elements.memberViewButtons.forEach((item) => item.classList.toggle("active", item === button));
      elements.memberSearch.value = "";
      renderMemberList();
    });
  });
  elements.viewOptions.forEach((button) => {
    button.addEventListener("click", () => {
      timetableView = button.dataset.view;
      elements.viewOptions.forEach((item) => item.classList.toggle("active", item === button));
      renderTimetable();
    });
  });
  elements.mobileNavButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setMobileView(button.dataset.mobileView);
    });
  });
  elements.detailTabs.forEach((button) => {
    button.addEventListener("click", () => {
      activeDetailPanel = button.dataset.panel;
      renderDetailTabs();
    });
  });

  elements.memberForm.addEventListener("submit", addMember);
  elements.paymentForm.addEventListener("submit", addPayment);
  getPaymentLessonTypeSelect().addEventListener("change", applyLessonTypeToPayment);
  getPaymentDiscountSelect().addEventListener("change", applyPaymentDiscountToAmount);
  elements.lessonSettingsForm.addEventListener("submit", saveLessonSettings);
  elements.scheduleForm.addEventListener("submit", addSchedule);
  elements.authForm.addEventListener("submit", signIn);

  await initializeAuth();
  await initializeData();
  fillLessonTypeOptions();
  fillScheduleLessonTypeOptions();
  setMobileView("today");

  render();
});

async function initializeData() {
  state = await loadData();
  selectedMemberId = getAccessibleMembers()[0]?.id ?? null;
}

async function initializeAuth() {
  if (!hasSupabaseConfig()) {
    currentProfile = { role: "admin", memberName: "" };
    applyRoleUI();
    return;
  }

  authSession = loadStoredSession();
  if (!authSession?.access_token) {
    applySignedOutUI();
    return;
  }

  currentProfile = await loadProfile(authSession.user);
  applyRoleUI();
}

async function loadData() {
  if (hasSupabaseConfig() && !authSession?.access_token) {
    return cloneData(seedData);
  }

  if (hasSupabaseConfig()) {
    const remoteData = await loadSupabaseData();
    if (remoteData) return remoteData;

    const localData = loadLocalData();
    await saveSupabaseData(localData);
    return localData;
  }

  return loadLocalData();
}

function loadLocalData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    const legacy = loadLegacySettings();
    return applyPresetTimetable({
      lessonTypes: legacy.lessonTypes,
      members: [],
    });
  }

  try {
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed.members)) return cloneData(seedData);

    return applyPresetTimetable({
      ...parsed,
      lessonTypes: Array.isArray(parsed.lessonTypes) ? parsed.lessonTypes : cloneData(defaultLessonTypes),
    });
  } catch {
    return applyPresetTimetable(cloneData(seedData));
  }
}

function applyPresetTimetable(data) {
  if (data.presetTimetableVersion === PRESET_TIMETABLE_VERSION) return applyPresetPayments(data);

  presetTimetableEntries.forEach((entry) => {
    entry.names.forEach((name) => {
      const member = findOrCreateMemberInData(data, name);
      if (!member.defaultLessonType) {
        member.defaultLessonType = inferPresetLessonType(entry.names.length, data.lessonTypes);
      }

      const exists = member.schedules.some(
        (item) => Number(item.day) === entry.day && item.time === entry.time && (item.className || "수업") === "수업",
      );
      if (exists) return;

      member.schedules.push({
        id: crypto.randomUUID(),
        day: entry.day,
        time: entry.time,
        className: "수업",
        lessonType: member.defaultLessonType,
        status: entry.status || "",
      });
    });
  });

  data.presetTimetableVersion = PRESET_TIMETABLE_VERSION;
  return applyPresetPayments(data);
}

function applyPresetPayments(data) {
  if (data.presetPaymentsVersion === PRESET_PAYMENTS_VERSION) return applyPresetAttendance(data);

  presetPaymentEntries.forEach((entry) => {
    entry.names.forEach((name) => {
      const member = findOrCreateMemberInData(data, name);
      if (!member.defaultLessonType) member.defaultLessonType = entry.lessonType;

      member.payments.push({
        id: crypto.randomUUID(),
        date: entry.date,
        lessonType: entry.lessonType,
        sessions: entry.sessions,
        amount: entry.amount,
        memo: "",
      });
    });
  });

  data.presetPaymentsVersion = PRESET_PAYMENTS_VERSION;
  return applyPresetAttendance(data);
}

function applyPresetAttendance(data) {
  if (!PRESET_ATTENDANCE_VERSION || data.presetAttendanceVersion === PRESET_ATTENDANCE_VERSION) return data;

  presetAttendanceEntries.forEach((entry) => {
    entry.names.forEach((name) => {
      const member = findOrCreateMemberInData(data, name);
      const day = dayNames.indexOf(entry.dayName);
      const schedule = member.schedules.find((item) => Number(item.day) === day);
      const className = schedule?.className || "출석";
      const time = schedule?.time || "";
      const status = normalizeAttendanceStatus(entry.status);
      const exists = member.attendances.some(
        (item) => item.date === entry.date && item.className === className && (item.time || "") === time && (item.status || "") === status,
      );
      if (exists) return;

      member.attendances.push({
        id: crypto.randomUUID(),
        date: entry.date,
        className,
        time,
        status,
      });
    });
  });

  data.presetAttendanceVersion = PRESET_ATTENDANCE_VERSION;
  return data;
}

function findOrCreateMemberInData(data, name) {
  const existing = data.members.find((member) => member.name === name);
  if (existing) return existing;

  const member = {
    id: crypto.randomUUID(),
    name,
    phone: "",
    memo: "",
    defaultLessonType: "",
    createdAt: todayISO,
    schedules: [],
    payments: [],
    attendances: [],
  };
  data.members.push(member);
  return member;
}

function inferPresetLessonType(memberCount, lessonTypes) {
  const fallback = memberCount > 1 ? "주1 / 2인 (30분)" : "주1 / 1인 (30분)";
  return lessonTypes.some((lesson) => lesson.name === fallback) ? fallback : lessonTypes[0]?.name || "일반";
}

function loadLegacySettings() {
  try {
    const parsed = JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY));
    return {
      lessonTypes: Array.isArray(parsed?.lessonTypes) ? parsed.lessonTypes : cloneData(defaultLessonTypes),
    };
  } catch {
    return {
      lessonTypes: cloneData(defaultLessonTypes),
    };
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  if (hasSupabaseConfig() && canEditSharedData()) {
    saveSupabaseData(state).catch(() => {
      alert("Supabase 저장에 실패했습니다. 현재 브라우저 백업은 유지됩니다.");
    });
  }
}

function hasSupabaseConfig() {
  return Boolean(window.SUPABASE_CONFIG?.url && window.SUPABASE_CONFIG?.anonKey);
}

async function loadSupabaseData() {
  try {
    const response = await fetch(`${getSupabaseRestUrl()}?id=eq.${encodeURIComponent(SUPABASE_RECORD_ID)}&select=data`, {
      headers: getSupabaseHeaders(),
    });
    if (!response.ok) throw new Error("Supabase load failed");

    const rows = await response.json();
    const remote = rows[0]?.data;
    if (!remote || !Array.isArray(remote.members)) return null;

    return applyPresetTimetable({
      ...remote,
      lessonTypes: Array.isArray(remote.lessonTypes) ? remote.lessonTypes : cloneData(defaultLessonTypes),
    });
  } catch {
    alert("Supabase 데이터를 불러오지 못해 이 브라우저의 백업 데이터를 사용합니다.");
    return null;
  }
}

async function saveSupabaseData(data) {
  if (!hasSupabaseConfig()) return;

  const response = await fetch(getSupabaseRestUrl(), {
    method: "POST",
    headers: {
      ...getSupabaseHeaders(),
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify({
      id: SUPABASE_RECORD_ID,
      data,
      updated_at: new Date().toISOString(),
    }),
  });

  if (!response.ok) throw new Error("Supabase save failed");
}

function getSupabaseRestUrl() {
  return `${window.SUPABASE_CONFIG.url.replace(/\/$/, "")}/rest/v1/${SUPABASE_TABLE}`;
}

function getSupabaseHeaders() {
  return {
    apikey: window.SUPABASE_CONFIG.anonKey,
    Authorization: `Bearer ${authSession?.access_token || window.SUPABASE_CONFIG.anonKey}`,
    "Content-Type": "application/json",
  };
}

function getSupabaseAuthHeaders() {
  return {
    apikey: window.SUPABASE_CONFIG.anonKey,
    "Content-Type": "application/json",
  };
}

function loadStoredSession() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY));
  } catch {
    return null;
  }
}

async function signIn(event) {
  event.preventDefault();
  elements.authError.textContent = "";

  const form = new FormData(elements.authForm);
  const response = await fetch(`${window.SUPABASE_CONFIG.url.replace(/\/$/, "")}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: getSupabaseAuthHeaders(),
    body: JSON.stringify({
      email: String(form.get("email")).trim(),
      password: String(form.get("password")),
    }),
  });

  if (!response.ok) {
    elements.authError.textContent = "이메일 또는 비밀번호를 확인해주세요.";
    return;
  }

  authSession = await response.json();
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authSession));
  currentProfile = await loadProfile(authSession.user);
  closeModal(elements.authModal);
  applyRoleUI();
  await initializeData();
  fillLessonTypeOptions();
  fillScheduleLessonTypeOptions();
  render();
}

async function signOut() {
  authSession = null;
  currentProfile = { role: "member", memberName: "" };
  localStorage.removeItem(AUTH_STORAGE_KEY);
  state = cloneData(seedData);
  selectedMemberId = null;
  applySignedOutUI();
  render();
}

async function loadProfile(user) {
  if (!user?.id) return { role: "member", memberName: "" };

  const response = await fetch(
    `${window.SUPABASE_CONFIG.url.replace(/\/$/, "")}/rest/v1/profiles?user_id=eq.${encodeURIComponent(user.id)}&select=role,member_name`,
    { headers: getSupabaseHeaders() },
  );

  if (!response.ok) return { role: "member", memberName: "" };

  const rows = await response.json();
  return {
    role: normalizeRole(rows[0]?.role),
    memberName: rows[0]?.member_name || "",
  };
}

function normalizeRole(role) {
  return ["admin", "coach", "member"].includes(role) ? role : "member";
}

function applySignedOutUI() {
  document.body.dataset.auth = "signed-out";
  document.body.dataset.role = "guest";
  elements.roleBadge.textContent = "로그인 필요";
  openModal(elements.authModal);
}

function applyRoleUI() {
  const role = getCurrentRole();
  document.body.dataset.auth = "signed-in";
  document.body.dataset.role = role;
  elements.roleBadge.textContent = getRoleLabel(role);
  if (!getAllowedMobileViews().includes(mobileView)) {
    mobileView = getAllowedMobileViews()[0];
    document.body.dataset.mobileView = mobileView;
  }
  renderMobileNav();
}

function getCurrentRole() {
  return hasSupabaseConfig() ? normalizeRole(currentProfile.role) : "admin";
}

function getRoleLabel(role = getCurrentRole()) {
  return { admin: "관리자", coach: "코치", member: "회원" }[role] || "회원";
}

function canManagePayments() {
  return getCurrentRole() === "admin";
}

function canManageSettings() {
  return getCurrentRole() === "admin";
}

function canEditSharedData() {
  return ["admin", "coach"].includes(getCurrentRole());
}

function isMemberRole() {
  return getCurrentRole() === "member";
}

function getAccessibleMembers() {
  if (!isMemberRole()) return state.members;
  return state.members.filter((member) => member.name === currentProfile.memberName);
}

function render() {
  const selected = getSelectedMember();
  if (selected && !getAccessibleMembers().some((member) => member.id === selected.id)) {
    selectedMemberId = getAccessibleMembers()[0]?.id ?? null;
  }
  renderMobileNav();
  renderStats();
  renderPaymentOverview();
  renderMemberList();
  renderTimetable();
  renderTodaySchedule();

  if (!selected) {
    elements.emptyState.classList.remove("hidden");
    elements.detailView.classList.add("hidden");
    return;
  }

  elements.emptyState.classList.add("hidden");
  elements.detailView.classList.remove("hidden");
  renderDetail(selected);
}

function setMobileView(view) {
  const allowedViews = getAllowedMobileViews();
  mobileView = allowedViews.includes(view) ? view : allowedViews[0];
  document.body.dataset.mobileView = mobileView;
  renderMobileNav();
}

function renderMobileNav() {
  elements.mobileNavButtons.forEach((button) => {
    const allowed = getAllowedMobileViews().includes(button.dataset.mobileView);
    button.hidden = !allowed;
    button.classList.toggle("active", button.dataset.mobileView === mobileView);
  });
}

function getAllowedMobileViews() {
  if (getCurrentRole() === "admin") return ["today", "timetable", "members", "payments", "detail"];
  if (getCurrentRole() === "coach") return ["today", "timetable", "members", "detail"];
  return ["today", "timetable", "detail"];
}

function isMobileLayout() {
  return window.matchMedia("(max-width: 760px)").matches;
}

function renderStats() {
  const todayItems = getTodayItems();
  const lowCount = getAccessibleMembers().filter((member) => getBalance(member) <= 2).length;

  elements.todayClasses.textContent = String(todayItems.length);
  elements.lowBalance.textContent = String(lowCount);
}

function renderPaymentOverview() {
  if (!canManagePayments()) return;

  const payments = getMonthlyPayments();
  const revenue = payments.reduce((sum, item) => sum + Number(item.payment.amount || 0), 0);
  elements.monthlyRevenue.textContent = `${currency.format(revenue)}원`;
  elements.monthlyPaymentList.innerHTML = "";

  if (!payments.length) {
    elements.monthlyPaymentList.append(createEmptyLine("이번 달 결제 기록이 없습니다."));
    return;
  }

  payments.forEach(({ member, payment }) => {
    const row = createRow(
      `${formatDate(payment.date)} · ${member.name} · ${currency.format(Number(payment.amount || 0))}원`,
      `${payment.lessonType || "결제"} · ${payment.sessions}회${payment.memo ? ` · ${payment.memo}` : ""}`,
      () => removePayment(member.id, payment.id),
    );
    row.classList.add("payment-row");
    row.querySelector("span").addEventListener("click", () => {
      selectedMemberId = member.id;
      activeDetailPanel = "payment";
      if (isMobileLayout()) setMobileView("detail");
      render();
    });
    elements.monthlyPaymentList.append(row);
  });
}

function getMonthlyPayments() {
  if (!canManagePayments()) return [];

  const monthKey = todayISO.slice(0, 7);
  return getAccessibleMembers()
    .flatMap((member) => member.payments.map((payment) => ({ member, payment })))
    .filter(({ payment }) => payment.date?.startsWith(monthKey))
    .sort((a, b) => b.payment.date.localeCompare(a.payment.date) || a.member.name.localeCompare(b.member.name, "ko-KR"));
}

function renderMemberList() {
  const query = elements.memberSearch.value.trim().toLowerCase();
  const entries =
    memberView === "today"
      ? getTodayEntries()
      : getAccessibleMembers()
          .map((member) => ({
            member,
            time: "",
            className: member.phone || "연락처 없음",
            lessonType: member.defaultLessonType || "레슨 미지정",
          }))
          .sort((a, b) => a.member.name.localeCompare(b.member.name, "ko-KR"));

  elements.sidebarTitle.textContent = memberView === "today" ? "오늘 회원" : "전체 회원";
  elements.memberSearch.placeholder = memberView === "today" ? "오늘 회원 검색" : "전체 회원 검색";

  const filtered = entries.filter((entry) =>
    `${entry.member.name} ${entry.member.phone} ${entry.time} ${entry.className} ${entry.lessonType}`.toLowerCase().includes(query),
  );

  elements.memberList.innerHTML = "";

  if (!filtered.length) {
    elements.memberList.append(createEmptyLine(memberView === "today" ? "오늘 예정된 회원이 없습니다." : "등록된 회원이 없습니다."));
    return;
  }

  filtered.forEach(({ member, time, className, lessonType }) => {
    const balance = getBalance(member);
    const button = document.createElement("button");
    button.className = `member-card ${member.id === selectedMemberId ? "active" : ""}`;
    button.type = "button";
    button.innerHTML = `
      <span>
        <strong>${escapeHTML(member.name)}</strong>
        <span>${escapeHTML([time, className, lessonType].filter(Boolean).join(" · "))}</span>
      </span>
      <span class="mini-balance ${balance <= 2 ? "low" : ""}">${balance}</span>
    `;
    button.addEventListener("click", () => {
      selectedMemberId = member.id;
      if (isMobileLayout()) setMobileView("detail");
      render();
    });
    elements.memberList.append(button);
  });
}

function renderDetail(member) {
  const balance = getBalance(member);
  const paidSessions = member.payments.reduce((sum, item) => sum + Number(item.sessions || 0), 0);
  if (!canManagePayments() && activeDetailPanel === "payment") activeDetailPanel = "schedule";

  elements.memberStatus.textContent = balance <= 2 ? "잔여 횟수 확인 필요" : "정상 이용";
  elements.memberName.textContent = member.name;
  elements.memberMeta.textContent = canManagePayments()
    ? `${member.phone || "연락처 없음"} · ${member.defaultLessonType || "레슨 미지정"} · 결제 ${paidSessions}회 / 출석 ${member.attendances.length}회`
    : `${member.phone || "연락처 없음"} · ${member.defaultLessonType || "레슨 미지정"} · 출석 ${member.attendances.length}회`;
  elements.memberBalance.textContent = String(balance);

  renderSchedule(member);
  renderAttendance(member);
  renderPayments(member);
  renderDetailTabs();
}

function renderSchedule(member) {
  elements.scheduleList.innerHTML = "";
  const sorted = [...member.schedules].sort((a, b) => Number(a.day) - Number(b.day) || a.time.localeCompare(b.time));

  if (!sorted.length) {
    elements.scheduleList.append(createEmptyLine("등록된 시간표가 없습니다."));
    return;
  }

  sorted.forEach((item) => {
    elements.scheduleList.append(
      createRow(
        `${dayNames[item.day]}요일 ${item.time}`,
        [item.className || "수업", getScheduleLessonType(item), getScheduleStatus(item)].filter(Boolean).join(" · "),
        () => removeSchedule(member.id, item.id),
      ),
    );
  });
}

function renderAttendance(member) {
  elements.attendanceList.innerHTML = "";
  const sorted = [...member.attendances].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);

  if (!sorted.length) {
    elements.attendanceList.append(createEmptyLine("아직 출석 기록이 없습니다."));
    return;
  }

  sorted.forEach((item) => {
    const subtitle = [item.className || "출석", item.time || "", item.status || ""].filter(Boolean).join(" · ");
    elements.attendanceList.append(createRow(formatDate(item.date), subtitle, () => removeAttendance(member.id, item.id)));
  });
}

function renderPayments(member) {
  elements.paymentList.innerHTML = "";
  if (!canManagePayments()) {
    elements.paymentList.append(createEmptyLine("결제 기록은 관리자만 볼 수 있습니다."));
    return;
  }

  const sorted = [...member.payments].sort((a, b) => b.date.localeCompare(a.date));

  if (!sorted.length) {
    elements.paymentList.append(createEmptyLine("결제 기록이 없습니다."));
    return;
  }

  sorted.forEach((item) => {
    const row = createRow(
      `${formatDate(item.date)} · ${currency.format(Number(item.amount || 0))}원`,
      `${item.lessonType || "결제"} · ${item.sessions}회${item.memo ? ` · ${item.memo}` : ""}`,
      () => removePayment(member.id, item.id),
    );
    row.classList.add("payment-row");
    elements.paymentList.append(row);
  });
}

function renderTimetable() {
  const groups = getScheduleGroups();
  const visibleDays = getVisibleTimetableDays();
  const isWeekTable = timetableView === "week" && !isMobileLayout();
  elements.timetableGrid.innerHTML = "";
  elements.timetableGrid.classList.toggle("week-view", isWeekTable);
  elements.timetableRangeLabel.textContent = isMobileLayout() ? "오늘 하루" : isWeekTable ? "월-일 전체" : getFocusRangeLabel(visibleDays);

  const table = document.createElement("div");
  table.className = `schedule-table ${isWeekTable ? "week-table" : "focus-table"}`;
  table.style.setProperty("--day-count", String(visibleDays.length));

  table.append(createTableHeader("시간"));
  visibleDays.forEach((day) => {
    table.append(createTableHeader(dayNames[day], day === today.getDay()));
  });

  timetableTimes.forEach((time) => {
    table.append(createTimeCell(time));

    visibleDays.forEach((day) => {
      const cell = document.createElement("div");
      cell.className = `schedule-cell ${getTimePeriod(time)}`;
      const matches = groups.filter((item) => item.time === time && Number(item.day) === day);

      if (!matches.length) {
        cell.classList.add("empty");
        const emptyButton = document.createElement("button");
        emptyButton.className = "empty-slot";
        emptyButton.type = "button";
        emptyButton.title = `${dayNames[day]}요일 ${time} 등록`;
        emptyButton.addEventListener("click", () => openScheduleAt(day, time));
        cell.append(emptyButton);
      }

      matches.forEach((group) => {
        cell.append(createLessonBlock(group));
      });

      table.append(cell);
    });
  });

  elements.timetableGrid.append(table);
}

function getVisibleTimetableDays() {
  if (isMobileLayout()) return [today.getDay()];
  if (timetableView === "week") return timetableDays;

  const todayDay = today.getDay();
  return [-1, 0, 1].map((offset) => (todayDay + offset + 7) % 7);
}

function getFocusRangeLabel(days) {
  return `${dayNames[days[0]]}-${dayNames[days[2]]} 집중 보기`;
}

function openScheduleAt(day, time) {
  const member = getSelectedMember();
  if (!member) {
    openModal(elements.memberModal);
    return;
  }

  elements.scheduleForm.day.value = String(day);
  elements.scheduleForm.time.value = time;
  const classNameInput = elements.scheduleForm.querySelector('[name="className"]');
  if (classNameInput && !classNameInput.value) {
    classNameInput.value = "수업";
  }
  const lessonTypeSelect = elements.scheduleForm.querySelector('[name="scheduleLessonType"]');
  if (lessonTypeSelect && !lessonTypeSelect.value) {
    lessonTypeSelect.value = state.lessonTypes[0]?.name || "";
  }
  elements.scheduleForm.querySelector('[name="scheduleStatus"]').value = "";
  renderScheduleMemberOptions([member.id]);
  openModal(elements.scheduleModal);
}

function fillLessonTypeOptions() {
  const select = getPaymentLessonTypeSelect();
  const selectedValue = select.value;
  select.innerHTML = '<option value="">선택</option>';

  state.lessonTypes.forEach((lesson) => {
    const option = document.createElement("option");
    option.value = lesson.name;
    option.textContent = `${lesson.name} · ${currency.format(lesson.amount)}원 · ${lesson.sessions}회`;
    select.append(option);
  });

  if (state.lessonTypes.some((lesson) => lesson.name === selectedValue)) {
    select.value = selectedValue;
  }
}

function fillScheduleLessonTypeOptions() {
  const select = elements.scheduleForm.querySelector('[name="scheduleLessonType"]');
  const selectedValue = select.value;
  select.innerHTML = "";

  state.lessonTypes.forEach((lesson) => {
    const option = document.createElement("option");
    option.value = lesson.name;
    option.textContent = lesson.name;
    select.append(option);
  });

  if (state.lessonTypes.some((lesson) => lesson.name === selectedValue)) {
    select.value = selectedValue;
  }
}

function applyMemberDefaultLessonTypeToPayment() {
  const member = getSelectedMember();
  if (!member?.defaultLessonType) return;

  const select = getPaymentLessonTypeSelect();
  if (!state.lessonTypes.some((lesson) => lesson.name === member.defaultLessonType)) return;

  select.value = member.defaultLessonType;
  applyLessonTypeToPayment();
}

function applyMemberDefaultLessonTypeToSchedule() {
  const member = getSelectedMember();
  const select = elements.scheduleForm.querySelector('[name="scheduleLessonType"]');
  if (!member?.defaultLessonType || !select) return;

  if (state.lessonTypes.some((lesson) => lesson.name === member.defaultLessonType)) {
    select.value = member.defaultLessonType;
  }
}

function applyLessonTypeToPayment() {
  const selected = state.lessonTypes.find((lesson) => lesson.name === getPaymentLessonTypeSelect().value);
  if (!selected) return;

  elements.paymentForm.querySelector('[name="sessions"]').value = String(selected.sessions);
  applyPaymentDiscountToAmount();
}

function getPaymentLessonTypeSelect() {
  return elements.paymentForm.querySelector('[name="lessonType"]');
}

function getPaymentDiscountSelect() {
  return elements.paymentForm.querySelector('[name="discountOption"]');
}

function applyPaymentDiscountToAmount() {
  const selected = state.lessonTypes.find((lesson) => lesson.name === getPaymentLessonTypeSelect().value);
  if (!selected) return;

  const discountRate = Number(getPaymentDiscountSelect().value || 0);
  const amount = Number(selected.amount || 0) * (1 - discountRate / 100);
  elements.paymentForm.querySelector('[name="amount"]').value = String(Math.round(amount));
}

function renderLessonSettings() {
  elements.lessonSettingsList.innerHTML = "";
  state.lessonTypes.forEach((lesson) => addLessonSettingsRow(lesson));
}

function addLessonSettingsRow(lesson = { name: "", amount: 0, sessions: 1 }) {
  const row = document.createElement("div");
  row.className = "lesson-settings-row";
  row.innerHTML = `
    <input name="lessonName" value="${escapeHTML(lesson.name)}" placeholder="예: 주1 / 1인 (30분)" required />
    <input name="lessonAmount" type="number" min="0" step="1000" value="${Number(lesson.amount || 0)}" required />
    <input name="lessonSessions" type="number" min="0.5" step="0.5" value="${Number(lesson.sessions || 1)}" required />
  `;

  const removeButton = document.createElement("button");
  removeButton.className = "item-action";
  removeButton.type = "button";
  removeButton.title = "삭제";
  removeButton.textContent = "×";
  removeButton.addEventListener("click", () => row.remove());
  row.append(removeButton);

  elements.lessonSettingsList.append(row);
}

function saveLessonSettings(event) {
  event.preventDefault();
  if (!canManageSettings()) return;

  const rows = [...elements.lessonSettingsList.querySelectorAll(".lesson-settings-row")];
  const nextLessonTypes = rows
    .map((row) => ({
      name: row.querySelector('[name="lessonName"]').value.trim(),
      amount: Number(row.querySelector('[name="lessonAmount"]').value),
      sessions: Number(row.querySelector('[name="lessonSessions"]').value),
    }))
    .filter((lesson) => lesson.name);

  state.lessonTypes = nextLessonTypes.length ? nextLessonTypes : cloneData(defaultLessonTypes);
  fillLessonTypeOptions();
  fillScheduleLessonTypeOptions();
  closeModal(elements.lessonSettingsModal);
  commit();
}

function renderTodaySchedule() {
  const items = getTodayItems().sort((a, b) => a.time.localeCompare(b.time));
  elements.todaySchedule.innerHTML = "";
  elements.todayCount.textContent = String(items.length);

  if (!items.length) {
    elements.todaySchedule.append(createEmptyLine("오늘 예정된 수업이 없습니다."));
    return;
  }

  items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "today-card";
    const status = getScheduleStatus(item);
    const attendance = getGroupAttendanceState(item);
    card.innerHTML = `
      <span>
        <strong>${escapeHTML(item.time)} · ${escapeHTML(item.className || "수업")}${status ? ` · ${escapeHTML(status)}` : ""}</strong>
        <span>${escapeHTML(item.members.map((member) => member.name).join(", "))}</span>
        <small>${escapeHTML(item.members.map((member) => `${member.name} ${getBalance(member)}회`).join(" / "))}</small>
      </span>
    `;
    const button = document.createElement("button");
    button.className = `mini-action attendance-big ${attendance.done ? "done" : ""}`;
    button.type = "button";
    button.textContent = attendance.done ? "완료" : attendance.partial ? "남은 출석" : "출석";
    button.disabled = attendance.done;
    button.addEventListener("click", () => markGroupAttendance(item));
    card.append(button);
    elements.todaySchedule.append(card);
  });
}

function addMember(event) {
  event.preventDefault();
  if (!canManageSettings()) return;

  const form = new FormData(elements.memberForm);
  const member = {
    id: crypto.randomUUID(),
    name: String(form.get("name")).trim(),
    phone: String(form.get("phone")).trim(),
    memo: String(form.get("memo")).trim(),
    defaultLessonType: "",
    createdAt: todayISO,
    schedules: [],
    payments: [],
    attendances: [],
  };

  state.members.unshift(member);
  selectedMemberId = member.id;
  if (isMobileLayout()) setMobileView("detail");
  elements.memberForm.reset();
  closeModal(elements.memberModal);
  commit();
}

function addPayment(event) {
  event.preventDefault();
  if (!canManagePayments()) return;

  const member = getSelectedMember();
  if (!member) return;

  const form = new FormData(elements.paymentForm);
  const discountOption = getPaymentDiscountSelect().selectedOptions[0];
  const discountRate = Number(form.get("discountOption") || 0);
  const paymentMethod = discountOption?.dataset.method || "";
  const memo = String(form.get("memo")).trim();
  const discountMemo = discountRate ? `${paymentMethod} ${discountRate}% 할인` : "";

  member.payments.push({
    id: crypto.randomUUID(),
    date: String(form.get("date")),
    lessonType: String(form.get("lessonType")),
    sessions: Number(form.get("sessions")),
    amount: Number(form.get("amount")),
    memo: [discountMemo, memo].filter(Boolean).join(" · "),
    paymentMethod,
    discountRate,
  });

  elements.paymentForm.reset();
  closeModal(elements.paymentModal);
  commit();
}

function addSchedule(event) {
  event.preventDefault();
  if (!canManageSettings()) return;

  const form = new FormData(elements.scheduleForm);
  const memberIds = form.getAll("memberIds");

  if (!memberIds.length) {
    alert("참여 회원을 선택해주세요.");
    return;
  }

  memberIds.forEach((memberId) => {
    const member = state.members.find((item) => item.id === memberId);
    if (!member) return;

    member.schedules.push({
      id: crypto.randomUUID(),
      day: Number(form.get("day")),
      time: String(form.get("time")),
      className: String(form.get("className")).trim() || "수업",
      lessonType: String(form.get("scheduleLessonType")),
      status: String(form.get("scheduleStatus")),
    });
  });

  elements.scheduleForm.reset();
  closeModal(elements.scheduleModal);
  commit();
}

function markAttendance() {
  if (!canEditSharedData()) return;

  const member = getSelectedMember();
  if (!member) return;

  const currentClass = member.schedules.find((item) => Number(item.day) === today.getDay());
  recordAttendance(member, currentClass?.className || "출석", currentClass?.time || "", "");
  commit();
}

function markGroupAttendance(group) {
  if (!canEditSharedData()) return;

  group.members.forEach((member) => {
    recordAttendance(member, group.className || "출석", group.time, "");
  });
  selectedMemberId = group.members[0]?.id ?? selectedMemberId;
  commit();
}

function recordAttendance(member, className, time, status = "") {
  const alreadyRecorded = member.attendances.some(
    (item) =>
      item.date === todayISO &&
      (item.className || "출석") === className &&
      (item.time || "") === (time || "") &&
      (item.status || "") === normalizeAttendanceStatus(status),
  );

  if (alreadyRecorded) return;

  member.attendances.push({
    id: crypto.randomUUID(),
    date: todayISO,
    className,
    time,
    status: normalizeAttendanceStatus(status),
  });
}

function getGroupAttendanceState(group) {
  const recorded = group.members.filter((member) => hasAttendanceForGroup(member, group)).length;
  return {
    recorded,
    total: group.members.length,
    done: recorded === group.members.length,
    partial: recorded > 0 && recorded < group.members.length,
  };
}

function hasAttendanceForGroup(member, group) {
  return member.attendances.some(
    (item) =>
      item.date === todayISO &&
      (item.className || "출석") === (group.className || "출석") &&
      (item.time || "") === (group.time || "") &&
      normalizeAttendanceStatus(item.status) === "",
  );
}

function deleteSelectedMember() {
  if (!canManageSettings()) return;

  const member = getSelectedMember();
  if (!member) return;

  const ok = confirm(`${member.name} 회원을 삭제할까요?`);
  if (!ok) return;

  state.members = state.members.filter((item) => item.id !== member.id);
  selectedMemberId = state.members[0]?.id ?? null;
  if (isMobileLayout()) setMobileView("members");
  commit();
}

function removeSchedule(memberId, scheduleId) {
  if (!canManageSettings()) return;

  const member = state.members.find((item) => item.id === memberId);
  member.schedules = member.schedules.filter((item) => item.id !== scheduleId);
  commit();
}

function removeAttendance(memberId, attendanceId) {
  if (!canEditSharedData()) return;

  const member = state.members.find((item) => item.id === memberId);
  member.attendances = member.attendances.filter((item) => item.id !== attendanceId);
  commit();
}

function removePayment(memberId, paymentId) {
  if (!canManagePayments()) return;

  const member = state.members.find((item) => item.id === memberId);
  member.payments = member.payments.filter((item) => item.id !== paymentId);
  commit();
}

function exportData() {
  if (!canManageSettings()) return;

  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `member-desk-${todayISO}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

async function saveNow() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  if (hasSupabaseConfig()) {
    try {
      await saveSupabaseData(state);
    } catch {
      alert("Supabase 저장에 실패했습니다. 네트워크와 Supabase 설정을 확인해주세요.");
      return;
    }
  }

  const button = $("#saveNow");
  const originalText = button.textContent;
  button.textContent = "저장됨";
  window.setTimeout(() => {
    button.textContent = originalText;
  }, 1200);
}

function exportSheetCsv() {
  if (!canManageSettings()) return;

  const headers = ["type", "memberName", "phone", "memo", "day", "time", "className", "lessonType", "date", "sessions", "amount", "note"];
  const rows = [headers];

  state.members.forEach((member) => {
    rows.push(["member", member.name, member.phone, member.memo, "", "", "", member.defaultLessonType || "", member.createdAt, "", "", ""]);
    member.schedules.forEach((item) => {
      rows.push(["schedule", member.name, member.phone, "", item.day, item.time, item.className || "수업", getScheduleLessonType(item), "", "", "", getScheduleStatus(item)]);
    });
    member.payments.forEach((item) => {
      rows.push(["payment", member.name, member.phone, "", "", "", "", item.lessonType || "", item.date, item.sessions, item.amount, item.memo || ""]);
    });
    member.attendances.forEach((item) => {
      rows.push(["attendance", member.name, member.phone, "", "", item.time || "", item.className || "출석", "", item.date, "", "", item.status || ""]);
    });
  });

  downloadText(`member-desk-sheet-${todayISO}.csv`, rows.map((row) => row.map(csvEscape).join(",")).join("\n"), "text/csv;charset=utf-8");
}

function importSheetCsv(event) {
  if (!canManageSettings()) return;

  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      const rows = parseCsv(String(reader.result));
      const [headers, ...records] = rows;
      const index = Object.fromEntries(headers.map((name, position) => [name, position]));
      const membersByKey = new Map();
      const nextMembers = [];

      records.forEach((row) => {
        const name = row[index.memberName]?.trim();
        const phone = row[index.phone]?.trim();
        if (!name) return;

        const key = `${name}|${phone}`;
        if (!membersByKey.has(key)) {
          const member = {
            id: crypto.randomUUID(),
            name,
            phone,
            memo: row[index.memo] || "",
            defaultLessonType: row[index.lessonType] || "",
            createdAt: row[index.date] || todayISO,
            schedules: [],
            payments: [],
            attendances: [],
          };
          membersByKey.set(key, member);
          nextMembers.push(member);
        }

        const member = membersByKey.get(key);
        const type = row[index.type];

        if (type === "schedule") {
          member.schedules.push({
            id: crypto.randomUUID(),
            day: Number(row[index.day] || 1),
            time: row[index.time] || "09:00",
            className: row[index.className] || "수업",
            lessonType: row[index.lessonType] || "일반",
            status: row[index.note] || "",
          });
        }

        if (type === "payment") {
          member.payments.push({
            id: crypto.randomUUID(),
            date: row[index.date] || todayISO,
            lessonType: row[index.lessonType] || "",
            sessions: Number(row[index.sessions] || 0),
            amount: Number(row[index.amount] || 0),
            memo: row[index.note] || "",
          });
        }

        if (type === "attendance") {
          member.attendances.push({
            id: crypto.randomUUID(),
            date: row[index.date] || todayISO,
            className: row[index.className] || "출석",
            time: row[index.time] || "",
            status: normalizeAttendanceStatus(row[index.note] || ""),
          });
        }
      });

      state.members = nextMembers;
      selectedMemberId = state.members[0]?.id ?? null;
      closeModal(elements.sheetsModal);
      commit();
    } catch {
      alert("가져올 수 없는 CSV 파일입니다.");
    } finally {
      event.target.value = "";
    }
  });
  reader.readAsText(file);
}

function importData(event) {
  if (!canManageSettings()) return;

  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      const nextData = JSON.parse(String(reader.result));
      if (!Array.isArray(nextData.members)) throw new Error("Invalid data");
      state = {
        ...nextData,
        lessonTypes: Array.isArray(nextData.lessonTypes) ? nextData.lessonTypes : cloneData(defaultLessonTypes),
      };
      selectedMemberId = state.members[0]?.id ?? null;
      fillLessonTypeOptions();
      fillScheduleLessonTypeOptions();
      commit();
    } catch {
      alert("가져올 수 없는 파일입니다.");
    } finally {
      event.target.value = "";
    }
  });
  reader.readAsText(file);
}

function importPastedMembers() {
  if (!canManageSettings()) return;

  const text = elements.pasteMembersText.value.trim();
  if (!text) {
    alert("붙여넣은 명단이 없습니다.");
    return;
  }

  const rows = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split(/\t|,/).map((cell) => cell.trim()));

  const firstRow = rows[0]?.map(normalizeHeader);
  const hasHeader = firstRow?.some((cell) => ["이름", "성명", "회원명", "name", "membername"].includes(cell));
  const nameIndex = hasHeader ? findHeaderIndex(firstRow, ["이름", "성명", "회원명", "name", "membername"]) : 0;
  const phoneIndex = hasHeader ? findHeaderIndex(firstRow, ["연락처", "전화", "전화번호", "phone"]) : 1;
  const lessonTypeIndex = hasHeader ? findHeaderIndex(firstRow, ["레슨종류", "레슨타입", "수업종류", "lessontype"]) : 1;
  const memoIndex = hasHeader ? findHeaderIndex(firstRow, ["메모", "비고", "memo", "note"]) : 2;
  const dataRows = hasHeader ? rows.slice(1) : rows;
  let added = 0;

  dataRows.forEach((row) => {
    const rawName = row[nameIndex] || "";
    const rawSecond = row[1] || "";
    const phone = phoneIndex >= 0 ? row[phoneIndex] || "" : "";
    const lessonType = lessonTypeIndex >= 0 ? row[lessonTypeIndex] || "" : inferLessonType(rawSecond);
    const memo = memoIndex >= 0 ? row[memoIndex] || "" : "";
    const names = splitMemberNames(rawName);

    names.forEach((name) => {
      const exists = state.members.some((member) => member.name === name && normalizePhone(member.phone) === normalizePhone(phone));
      if (exists) return;

      state.members.push({
        id: crypto.randomUUID(),
        name,
        phone: normalizePhone(phone) ? phone : "",
        memo,
        defaultLessonType: lessonType,
        createdAt: todayISO,
        schedules: [],
        payments: [],
        attendances: [],
      });
      added += 1;
    });
  });

  if (added === 0) {
    alert("새로 추가할 회원이 없습니다.");
    return;
  }

  selectedMemberId = state.members.at(-1)?.id ?? selectedMemberId;
  elements.pasteMembersText.value = "";
  closeModal(elements.sheetsModal);
  commit();
}

function importPastedTimetable() {
  if (!canManageSettings()) return;

  const text = elements.pasteTimetableText.value.trim();
  if (!text) {
    alert("붙여넣은 시간표가 없습니다.");
    return;
  }

  const rows = text
    .split(/\r?\n/)
    .map((line) => line.split("\t").map((cell) => cell.trim()));

  const headerIndex = rows.findIndex((row) => row.some((cell) => normalizeHeader(cell) === "시간"));
  if (headerIndex < 0) {
    alert("첫 줄에 시간/요일 헤더가 있는 범위를 복사해주세요.");
    return;
  }

  const headers = rows[headerIndex].map(normalizeHeader);
  const timeIndex = headers.findIndex((cell) => cell === "시간");
  const dayColumns = getTimetableDayColumns(headers);
  let added = 0;

  rows.slice(headerIndex + 1).forEach((row) => {
    const time = normalizeTime(row[timeIndex]);
    if (!time) return;

    dayColumns.forEach(({ day, memberIndex, noteIndex }) => {
      const names = splitMemberNames(row[memberIndex] || "");
      const status = normalizeScheduleStatus(row[noteIndex] || "");
      if (!names.length) return;

      names.forEach((name) => {
        const member = findOrCreateMemberByName(name);
        const lessonType = member.defaultLessonType || inferLessonTypeFromMemberCount(names.length);
        const exists = member.schedules.some((item) => Number(item.day) === day && item.time === time && (item.className || "수업") === "수업");
        if (exists) return;

        member.schedules.push({
          id: crypto.randomUUID(),
          day,
          time,
          className: "수업",
          lessonType,
          status,
        });
        added += 1;
      });
    });
  });

  if (added === 0) {
    alert("새로 추가할 시간표가 없습니다.");
    return;
  }

  selectedMemberId = state.members[0]?.id ?? null;
  elements.pasteTimetableText.value = "";
  closeModal(elements.sheetsModal);
  commit();
}

function getSelectedMember() {
  return getAccessibleMembers().find((member) => member.id === selectedMemberId) ?? null;
}

function getBalance(member) {
  const paid = member.payments.reduce((sum, item) => sum + Number(item.sessions || 0), 0);
  const used = member.attendances.filter(isCountedAttendance).length;
  return paid - used;
}

function isCountedAttendance(item) {
  const status = normalizeAttendanceStatus(item.status);
  return status !== "결석" && status !== "당일취소";
}

function getTodayItems() {
  return getScheduleGroups().filter((item) => Number(item.day) === today.getDay());
}

function getTodayEntries() {
  return getTodayItems()
    .flatMap((group) =>
      group.members.map((member) => ({
        member,
        time: group.time,
        className: group.className || "수업",
        lessonType: group.lessonType,
      })),
    )
    .sort((a, b) => a.time.localeCompare(b.time) || a.member.name.localeCompare(b.member.name, "ko-KR"));
}

function getScheduleItems() {
  return getAccessibleMembers().flatMap((member) => member.schedules.map((item) => ({ ...item, member })));
}

function getScheduleGroups() {
  const groups = new Map();

  getScheduleItems().forEach((item) => {
    const key = [item.day, item.time, item.className || "수업", getScheduleLessonType(item), getScheduleStatus(item)].join("|");
    if (!groups.has(key)) {
      groups.set(key, {
        day: item.day,
        time: item.time,
        className: item.className || "수업",
        lessonType: getScheduleLessonType(item),
        status: getScheduleStatus(item),
        members: [],
      });
    }

    groups.get(key).members.push(item.member);
  });

  return [...groups.values()].map((group) => ({
    ...group,
    members: group.members.sort((a, b) => a.name.localeCompare(b.name, "ko-KR")),
  }));
}

function createLessonBlock(group) {
  const block = document.createElement("div");
  const isActive = group.members.some((member) => member.id === selectedMemberId);
  block.className = `lesson-block ${isActive ? "active" : ""}`;

  const mainButton = document.createElement("button");
  mainButton.className = "lesson-main";
  mainButton.type = "button";
  mainButton.innerHTML = `
    <strong><span class="lesson-badge">${escapeHTML(group.lessonType)}</span>${getStatusBadge(group.status)}${escapeHTML(group.className || "수업")}</strong>
    <span>${escapeHTML(group.members.map((member) => member.name).join(", "))}</span>
    <small>${group.members.length}명 · 잔여 ${escapeHTML(group.members.map((member) => `${member.name} ${getBalance(member)}회`).join(" / "))}</small>
  `;
  mainButton.addEventListener("click", () => {
    selectedMemberId = group.members[0]?.id ?? selectedMemberId;
    render();
  });
  block.append(mainButton);

  if (Number(group.day) === today.getDay()) {
    const attendanceButton = document.createElement("button");
    attendanceButton.className = "lesson-check";
    attendanceButton.type = "button";
    attendanceButton.textContent = "출석";
    attendanceButton.addEventListener("click", () => markGroupAttendance(group));
    block.append(attendanceButton);
  }

  return block;
}

function renderScheduleMemberOptions(selectedIds = []) {
  const selected = new Set(selectedIds);
  elements.scheduleMemberOptions.innerHTML = "";

  state.members.forEach((member) => {
    const label = document.createElement("label");
    label.className = "member-option";
    label.innerHTML = `
      <input name="memberIds" type="checkbox" value="${escapeHTML(member.id)}" ${selected.has(member.id) ? "checked" : ""} />
      <span>
        <strong>${escapeHTML(member.name)}</strong>
        <small>잔여 ${getBalance(member)}회</small>
      </span>
    `;
    elements.scheduleMemberOptions.append(label);
  });
}

function renderDetailTabs() {
  elements.detailTabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.panel === activeDetailPanel);
  });
  elements.detailPanels.forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.panel === activeDetailPanel);
  });
}

function getScheduleLessonType(item) {
  return item.lessonType || "일반";
}

function getScheduleStatus(item) {
  return item.status || "";
}

function getStatusBadge(status) {
  if (!status) return "";
  return `<span class="status-badge ${getStatusClass(status)}">${escapeHTML(status)}</span>`;
}

function getStatusClass(status) {
  const classes = {
    결석: "absent",
    보강: "makeup",
    보강완료: "done",
    당일취소: "cancel",
  };
  return classes[status] || "note";
}

function createRow(title, subtitle, onRemove) {
  const row = document.createElement("div");
  row.className = "row-item";
  row.innerHTML = `
    <span>
      <p>${escapeHTML(title)}</p>
      <span>${escapeHTML(subtitle)}</span>
    </span>
  `;

  const removeButton = document.createElement("button");
  removeButton.className = "item-action";
  removeButton.type = "button";
  removeButton.title = "삭제";
  removeButton.textContent = "×";
  removeButton.addEventListener("click", onRemove);
  row.append(removeButton);

  return row;
}

function createEmptyLine(text) {
  const line = document.createElement("div");
  line.className = "empty-line";
  line.textContent = text;
  return line;
}

function createTableHeader(text, isToday = false) {
  const cell = document.createElement("div");
  cell.className = `schedule-head ${isToday ? "today-head" : ""}`;
  cell.textContent = text;
  return cell;
}

function createTimeCell(time) {
  const cell = document.createElement("div");
  cell.className = `schedule-time ${getTimePeriod(time)}`;
  cell.textContent = time;
  return cell;
}

function createTimeSlots(start, end, intervalMinutes) {
  const slots = [];
  let cursor = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);

  while (cursor <= endMinutes) {
    slots.push(minutesToTime(cursor));
    cursor += intervalMinutes;
  }

  return slots;
}

function timeToMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function getTimePeriod(time) {
  return timeToMinutes(time) < timeToMinutes("12:00") ? "morning" : "afternoon";
}

function roundToNextHalfHour() {
  const minutes = today.getHours() * 60 + today.getMinutes();
  const rounded = Math.ceil(minutes / 30) * 30;
  const clamped = Math.min(Math.max(rounded, timeToMinutes("06:00")), timeToMinutes("23:00"));
  return minutesToTime(clamped);
}

function openModal(modal) {
  if (typeof modal.showModal === "function") {
    modal.showModal();
  } else {
    modal.setAttribute("open", "");
  }
}

function closeModal(modal) {
  if (typeof modal.close === "function") {
    modal.close();
  } else {
    modal.removeAttribute("open");
  }
}

function commit() {
  saveData();
  render();
}

function cloneData(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizePhone(value) {
  return String(value || "").replace(/\D/g, "");
}

function normalizeHeader(value) {
  return String(value || "").replace(/\s/g, "").toLowerCase();
}

function findHeaderIndex(headers, candidates) {
  return headers.findIndex((header) => candidates.map(normalizeHeader).includes(header));
}

function splitMemberNames(value) {
  return String(value || "")
    .split(/\s*\/\s*/)
    .map((name) => name.trim())
    .filter(Boolean);
}

function inferLessonType(value) {
  const text = String(value || "");
  return state.lessonTypes.some((lesson) => lesson.name === text) ? text : "";
}

function getTimetableDayColumns(headers) {
  const dayMap = {
    월: 1,
    화: 2,
    수: 3,
    목: 4,
    금: 5,
    토: 6,
    일: 0,
  };

  return headers
    .map((header, index) => {
      if (!(header in dayMap)) return null;
      return {
        day: dayMap[header],
        memberIndex: index,
        noteIndex: findNextNoteColumn(headers, index),
      };
    })
    .filter(Boolean);
}

function findNextNoteColumn(headers, startIndex) {
  for (let index = startIndex + 1; index <= startIndex + 3 && index < headers.length; index += 1) {
    if (headers[index] === "비고" || headers[index] === "note") return index;
  }
  return -1;
}

function normalizeTime(value) {
  const match = String(value || "").match(/^(\d{1,2})(?::(\d{1,2}))?$/);
  if (!match) return "";
  const hours = Number(match[1]);
  const minutes = Number(match[2] || 0);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return "";
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function normalizeScheduleStatus(value) {
  const text = String(value || "").trim();
  const allowed = ["결석", "보강", "보강완료", "당일취소"];
  return allowed.includes(text) ? text : "";
}

function normalizeAttendanceStatus(value) {
  const text = String(value || "").trim();
  if (!text) return "출석";
  const allowed = ["출석", "결석", "보강", "보강완료", "당일취소"];
  return allowed.includes(text) ? text : text;
}

function findOrCreateMemberByName(name) {
  const existing = state.members.find((member) => member.name === name);
  if (existing) return existing;

  const member = {
    id: crypto.randomUUID(),
    name,
    phone: "",
    memo: "",
    defaultLessonType: "",
    createdAt: todayISO,
    schedules: [],
    payments: [],
    attendances: [],
  };
  state.members.push(member);
  return member;
}

function inferLessonTypeFromMemberCount(count) {
  const fallback = count > 1 ? "주1 / 2인 (30분)" : "주1 / 1인 (30분)";
  return state.lessonTypes.some((lesson) => lesson.name === fallback) ? fallback : state.lessonTypes[0]?.name || "일반";
}

function downloadText(filename, text, type) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && quoted && next === '"') {
      value += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(value);
      value = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(value);
      rows.push(row);
      row = [];
      value = "";
    } else {
      value += char;
    }
  }

  if (value || row.length) {
    row.push(value);
    rows.push(row);
  }

  return rows.filter((item) => item.some((cell) => cell.trim()));
}

function toISODate(date) {
  const timezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 10);
}

function formatDate(value) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return entities[char];
  });
}
