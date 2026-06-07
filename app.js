const STORAGE_KEY = "member-desk-data-v5-corrected-payments";
const LEGACY_STORAGE_KEY = "member-desk-data-v1";
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
let timetableView = "focus";
let activeDetailPanel = "schedule";
let mobileView = "today";
let desktopView = "operations";

const $ = (selector) => document.querySelector(selector);

const elements = {
  sidebarTitle: $("#sidebarTitle"),
  memberSearch: $("#memberSearch"),
  memberList: $("#memberList"),
  mobileNavButtons: document.querySelectorAll("[data-mobile-view]"),
  desktopNavButtons: document.querySelectorAll("[data-desktop-view]"),
  pageTitle: $("#pageTitle"),
  todayLabel: $("#todayLabel"),
  todayClasses: $("#todayClasses"),
  monthlyRevenue: $("#monthlyRevenue"),
  monthlyPaymentList: $("#monthlyPaymentList"),
  allMembersGrid: $("#allMembersGrid"),
  allMembersCount: $("#allMembersCount"),
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
  todayScheduleDate: $("#todayScheduleDate"),
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
  scheduleModalTitle: $("#scheduleModalTitle"),
  scheduleForm: $("#scheduleForm"),
  scheduleDayField: $("#scheduleDayField"),
  makeupDateField: $("#makeupDateField"),
  scheduleMemberSearch: $("#scheduleMemberSearch"),
  scheduleMemberOptions: $("#scheduleMemberOptions"),
};

document.addEventListener("DOMContentLoaded", async () => {
  elements.todayLabel.textContent = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(today);
  elements.todayScheduleDate.textContent = new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(today);

  $("#openMemberModal").addEventListener("click", () => openModal(elements.memberModal));
  $("#openPaymentModal").addEventListener("click", () => {
    elements.paymentForm.date.value = todayISO;
    getPaymentDiscountSelect().value = "-5";
    applyMemberDefaultLessonTypeToPayment();
    openModal(elements.paymentModal);
  });
  $("#openScheduleModal").addEventListener("click", () => {
    prepareScheduleModal("regular");
    elements.scheduleForm.day.value = String(today.getDay());
    elements.scheduleForm.time.value = roundToNextHalfHour();
    applyMemberDefaultLessonTypeToSchedule();
    renderScheduleMemberOptions([selectedMemberId].filter(Boolean));
    openModal(elements.scheduleModal);
  });
  $("#openMakeupSchedule").addEventListener("click", () => {
    openMakeupScheduleModal();
  });
  $("#mobileOpenMakeupSchedule").addEventListener("click", () => {
    openMakeupScheduleModal();
  });
  function openMakeupScheduleModal() {
    prepareScheduleModal("makeup");
    elements.scheduleForm.date.value = todayISO;
    elements.scheduleForm.time.value = roundToNextHalfHour();
    elements.scheduleForm.querySelector('[name="className"]').value = "보강";
    elements.scheduleForm.querySelector('[name="scheduleStatus"]').value = "보강";
    renderScheduleMemberOptions([]);
    openModal(elements.scheduleModal);
  }
  $("#openLessonSettings").addEventListener("click", () => {
    renderLessonSettings();
    openModal(elements.lessonSettingsModal);
  });
  $("#saveNow").addEventListener("click", saveNow);
  $("#openSheetsModal").addEventListener("click", () => openModal(elements.sheetsModal));
  $("#exportSheetCsv").addEventListener("click", exportSheetCsv);
  $("#importSheetCsv").addEventListener("change", importSheetCsv);
  $("#importPastedMembers").addEventListener("click", importPastedMembers);
  $("#importPastedTimetable").addEventListener("click", importPastedTimetable);
  $("#addLessonType").addEventListener("click", () => addLessonSettingsRow());
  $("#markAttendance").addEventListener("click", markAttendance);
  $("#deleteMember").addEventListener("click", deleteSelectedMember);
  $("#mobileDetailBack").addEventListener("click", () => {
    setMobileView("members");
    render();
  });
  $("#exportData").addEventListener("click", exportData);
  $("#importData").addEventListener("change", importData);

  document.querySelectorAll("[data-close]").forEach((button) => {
    button.addEventListener("click", () => closeModal($(`#${button.dataset.close}`)));
  });

  elements.memberSearch.addEventListener("input", render);
  elements.scheduleMemberSearch.addEventListener("input", filterScheduleMemberOptions);
  elements.scheduleMemberOptions.addEventListener("change", (event) => {
    const checkbox = event.target.closest('input[name="memberIds"]');
    if (!checkbox?.checked) return;
    const member = state.members.find((item) => item.id === checkbox.value);
    if (!member?.defaultLessonType) return;
    const select = elements.scheduleForm.querySelector('[name="scheduleLessonType"]');
    if (state.lessonTypes.some((lesson) => lesson.name === member.defaultLessonType)) {
      select.value = member.defaultLessonType;
    }
  });
  elements.desktopNavButtons.forEach((button) => {
    button.addEventListener("click", () => setDesktopView(button.dataset.desktopView));
  });
  elements.mobileNavButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setMobileView(button.dataset.mobileView);
      elements.memberSearch.value = "";
      render();
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

  await initializeData();
  fillLessonTypeOptions();
  fillScheduleLessonTypeOptions();
  setMobileView("today");
  document.body.dataset.desktopView = desktopView;

  render();
});

async function initializeData() {
  state = await loadData();
  selectedMemberId = getAccessibleMembers()[0]?.id ?? null;
}

async function loadData() {
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
  if (!PRESET_ATTENDANCE_VERSION || data.presetAttendanceVersion === PRESET_ATTENDANCE_VERSION) {
    return deduplicateMemberData(data);
  }

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
  return deduplicateMemberData(data);
}

function getAttendanceRecordKey(item) {
  return [
    String(item.date || "").trim(),
    String(item.className || "출석").trim(),
    normalizeTime(item.time) || String(item.time || "").trim(),
  ].join("|");
}

function deduplicateAttendances(attendances = []) {
  const recordsByKey = new Map();

  attendances.forEach((item) => {
    const key = getAttendanceRecordKey(item);
    const existing = recordsByKey.get(key);

    if (existing) {
      existing.status = normalizeAttendanceStatus(item.status);
      return;
    }

    recordsByKey.set(key, {
      ...item,
      id: item.id || crypto.randomUUID(),
      status: normalizeAttendanceStatus(item.status),
    });
  });

  return [...recordsByKey.values()];
}

function deduplicateAttendanceData(data) {
  if (!Array.isArray(data.members)) return data;

  data.members.forEach((member) => {
    member.attendances = deduplicateAttendances(member.attendances);
  });

  return data;
}

function getMemberRecordKey(member) {
  return `${String(member.name || "").trim().replace(/\s+/g, " ")}|${normalizePhone(member.phone)}`;
}

function deduplicateSchedules(schedules = []) {
  const schedulesByKey = new Map();

  schedules.forEach((item) => {
    const key = [
      Number(item.day),
      normalizeTime(item.time) || String(item.time || "").trim(),
      String(item.className || "수업").trim(),
    ].join("|");
    const existing = schedulesByKey.get(key);

    if (existing) {
      if (!existing.lessonType && item.lessonType) existing.lessonType = item.lessonType;
      if (!existing.status && item.status) existing.status = item.status;
      return;
    }

    schedulesByKey.set(key, {
      ...item,
      id: item.id || crypto.randomUUID(),
    });
  });

  return [...schedulesByKey.values()];
}

function mergeRecordsById(first = [], second = []) {
  const recordsById = new Map();
  [...first, ...second].forEach((item) => {
    const id = item.id || crypto.randomUUID();
    if (!recordsById.has(id)) recordsById.set(id, { ...item, id });
  });
  return [...recordsById.values()];
}

function deduplicateMemberData(data) {
  if (!Array.isArray(data.members)) return data;

  const membersByKey = new Map();
  data.members.forEach((member) => {
    const key = getMemberRecordKey(member);
    const existing = membersByKey.get(key);

    if (!existing) {
      membersByKey.set(key, {
        ...member,
        id: member.id || crypto.randomUUID(),
        schedules: deduplicateSchedules(member.schedules),
        payments: mergeRecordsById(member.payments),
        attendances: deduplicateAttendances(member.attendances),
      });
      return;
    }

    if (!existing.phone && member.phone) existing.phone = member.phone;
    if (!existing.memo && member.memo) existing.memo = member.memo;
    if (!existing.defaultLessonType && member.defaultLessonType) existing.defaultLessonType = member.defaultLessonType;
    if (!existing.createdAt && member.createdAt) existing.createdAt = member.createdAt;
    existing.schedules = deduplicateSchedules([...(existing.schedules || []), ...(member.schedules || [])]);
    existing.payments = mergeRecordsById(existing.payments, member.payments);
    existing.attendances = deduplicateAttendances([...(existing.attendances || []), ...(member.attendances || [])]);
  });

  data.members = [...membersByKey.values()];
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
    Authorization: `Bearer ${window.SUPABASE_CONFIG.anonKey}`,
    "Content-Type": "application/json",
  };
}

function getCurrentRole() {
  return "admin";
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
  return false;
}

function getAccessibleMembers() {
  return state.members;
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
  renderAllMembersOverview();
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

function setDesktopView(view) {
  desktopView = ["operations", "schedule", "members", "payments"].includes(view) ? view : "operations";
  document.body.dataset.desktopView = desktopView;
  timetableView = desktopView === "schedule" ? "week" : "focus";
  elements.pageTitle.textContent = {
    operations: "RAMON",
    schedule: "전체 시간표",
    members: "회원 관리",
    payments: "결제 관리",
  }[desktopView];

  elements.desktopNavButtons.forEach((button) => button.classList.toggle("active", button.dataset.desktopView === desktopView));
  render();
}

function renderMobileNav() {
  elements.mobileNavButtons.forEach((button) => {
    const allowed = getAllowedMobileViews().includes(button.dataset.mobileView);
    button.hidden = !allowed;
    const activeView = mobileView === "detail" ? "members" : mobileView;
    button.classList.toggle("active", button.dataset.mobileView === activeView);
  });
}

function getAllowedMobileViews() {
  if (getCurrentRole() === "admin") return ["today", "timetable", "members", "payments", "detail"];
  if (getCurrentRole() === "coach") return ["today", "timetable", "members", "detail"];
  return ["today", "timetable", "detail"];
}

function isMobileLayout() {
  return window.matchMedia("(max-width: 980px)").matches;
}

function renderStats() {
  const todayItems = getTodayItems();

  elements.todayClasses.textContent = String(todayItems.length);
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
  const showAllMembers = isMobileLayout() && mobileView === "members";
  const searchAllMembers = !isMobileLayout() && Boolean(query);
  elements.sidebarTitle.textContent = showAllMembers ? "회원관리" : "오늘 수업";
  elements.memberSearch.placeholder = showAllMembers || !isMobileLayout() ? "전체 회원 검색" : "오늘 수업 검색";
  elements.memberList.innerHTML = "";

  if (!showAllMembers && !searchAllMembers) {
    renderTodaySidebarList(query);
    return;
  }

  const entries = getAccessibleMembers()
    .map((member) => ({
      member,
      time: "",
      className: member.phone || "연락처 없음",
      lessonType: member.defaultLessonType || "레슨 미지정",
    }))
    .sort((a, b) => a.member.name.localeCompare(b.member.name, "ko-KR"));

  const filtered = entries.filter((entry) =>
    `${entry.member.name} ${entry.member.phone} ${entry.time} ${entry.className} ${entry.lessonType}`.toLowerCase().includes(query),
  );

  if (!filtered.length) {
    elements.memberList.append(createEmptyLine("등록된 회원이 없습니다."));
    return;
  }

  filtered.forEach(({ member, time, className, lessonType }) => {
    const balance = getBalance(member);
    const balanceTone = getBalanceTone([balance]);
    const button = document.createElement("button");
    button.className = `member-card ${member.id === selectedMemberId ? "active" : ""}`;
    button.type = "button";
    button.innerHTML = `
      <span>
        <strong>${escapeHTML(member.name)}</strong>
        <span>${escapeHTML(compactLessonType(lessonType))}</span>
      </span>
      <span class="mini-balance ${balanceTone}">잔여 ${balance}회</span>
    `;
    button.addEventListener("click", () => {
      selectedMemberId = member.id;
      if (isMobileLayout()) setMobileView("detail");
      render();
    });
    elements.memberList.append(button);
  });
}

function renderTodaySidebarList(query) {
  const entries = getTodaySidebarEntries();
  const filtered = entries.filter((entry) =>
    `${entry.members.map((member) => member.name).join(" ")} ${entry.timeLabel} ${entry.className} ${entry.lessonType}`.toLowerCase().includes(query),
  );

  if (!filtered.length) {
    elements.memberList.append(createEmptyLine("오늘 예정된 수업이 없습니다."));
    return;
  }

  filtered.forEach((entry) => {
    const primaryMember = entry.members[0];
    const attendanceStatus = getCombinedAttendanceStatus(entry.groups);
    const names = entry.members.map((member) => member.name).join(", ");
    const balanceValues = entry.members.map(getBalance);
    const balances = balanceValues.every((balance) => balance === balanceValues[0])
      ? `${balanceValues[0]}회`
      : `${balanceValues.join("/")}회`;
    const balanceTone = getBalanceTone(balanceValues);
    const card = document.createElement("div");
    card.className = "member-card today-attendance-card";
    card.innerHTML = `
      <button class="today-attendance-main" type="button">
        <span class="today-lesson-time">
          <span>${escapeHTML(entry.timeLabel)}</span>
          ${entry.status === "보강" ? '<small class="today-lesson-status">보강</small>' : ""}
        </span>
        <strong class="today-lesson-names">${escapeHTML(names)}</strong>
        <span class="today-lesson-type">${escapeHTML(compactLessonType(entry.lessonType, entry.groups.length))}</span>
        <span class="today-lesson-balance ${balanceTone}">${escapeHTML(balances)}</span>
      </button>
    `;

    const attendanceActions = document.createElement("div");
    attendanceActions.className = "sidebar-attendance-actions";
    [
      { status: "출석", label: "출석", className: "present" },
      { status: "결석", label: "결석", className: "absent" },
    ].forEach((action) => {
      const button = document.createElement("button");
      button.className = `mini-action sidebar-attendance ${action.className} ${attendanceStatus === action.status ? "selected" : ""}`;
      button.type = "button";
      button.textContent = action.label;
      button.setAttribute("aria-label", action.label);
      button.disabled = !canEditSharedData();
      button.addEventListener("click", () => markCombinedAttendance(entry.groups, action.status));
      attendanceActions.append(button);
    });

    card.querySelector(".today-attendance-main").addEventListener("click", () => {
      selectedMemberId = primaryMember?.id ?? selectedMemberId;
      if (isMobileLayout()) setMobileView("detail");
      render();
    });
    card.append(attendanceActions);
    elements.memberList.append(card);
  });
}

function renderAllMembersOverview() {
  const members = [...getAccessibleMembers()].sort((a, b) => a.name.localeCompare(b.name, "ko-KR"));
  elements.allMembersCount.textContent = String(members.length);
  elements.allMembersGrid.innerHTML = "";

  if (!members.length) {
    elements.allMembersGrid.append(createEmptyLine("등록된 회원이 없습니다."));
    return;
  }

  members.forEach((member) => {
    const balance = getBalance(member);
    const balanceTone = getBalanceTone([balance]);
    const card = document.createElement("button");
    card.className = "directory-member";
    card.type = "button";
    card.innerHTML = `
      <span>
        <strong>${escapeHTML(member.name)}</strong>
        <small>${escapeHTML(member.phone || "연락처 없음")}</small>
        <small>${escapeHTML(member.defaultLessonType || "레슨 미지정")}</small>
      </span>
      <span class="mini-balance ${balanceTone}">잔여 ${balance}회</span>
    `;
    card.addEventListener("click", () => {
      selectedMemberId = member.id;
      setDesktopView("operations");
    });
    elements.allMembersGrid.append(card);
  });
}

function renderDetail(member) {
  const balance = getBalance(member);
  const paidSessions = member.payments.reduce((sum, item) => sum + Number(item.sessions || 0), 0);
  if (!canManagePayments() && activeDetailPanel === "payment") activeDetailPanel = "schedule";

  elements.memberStatus.textContent = balance <= 2 ? "잔여 횟수 확인 필요" : "정상 이용";
  elements.memberName.textContent = member.name;
  elements.memberMeta.innerHTML = `
    <span class="member-meta-row"><small>연락처</small><strong>${escapeHTML(member.phone || "연락처 없음")}</strong></span>
    <span class="member-meta-row"><small>레슨</small><strong>${escapeHTML(member.defaultLessonType || "레슨 미지정")}</strong></span>
    <span class="member-meta-row"><small>이용 기록</small><strong>${canManagePayments() ? `결제 ${paidSessions}회 · ` : ""}출석 ${member.attendances.length}회</strong></span>
  `;
  elements.memberBalance.textContent = String(balance);
  elements.memberBalance.parentElement.classList.remove("balance-good", "balance-mid", "balance-low");
  elements.memberBalance.parentElement.classList.add(getBalanceTone([balance]));

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
  elements.timetableRangeLabel.textContent = isMobileLayout() || desktopView === "operations" ? "오늘 하루" : "월-일 전체";

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
      cell.dataset.time = time;
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
        cell.dataset.hasLesson = "true";
        cell.append(createLessonBlock(group));
      });

      table.append(cell);
    });
  });

  elements.timetableGrid.append(table);
  scrollTimetableToFirstLesson();
}

function scrollTimetableToFirstLesson() {
  if (!isMobileLayout() || mobileView !== "timetable") return;
  const firstLesson = elements.timetableGrid.querySelector('[data-has-lesson="true"]');
  if (!firstLesson) return;

  requestAnimationFrame(() => {
    elements.timetableGrid.scrollTop = Math.max(0, firstLesson.offsetTop - 150);
  });
}

function getVisibleTimetableDays() {
  if (isMobileLayout()) return [today.getDay()];
  if (desktopView === "schedule" || timetableView === "week") return timetableDays;
  return [today.getDay()];
}

function openScheduleAt(day, time) {
  const member = getSelectedMember();
  if (!member) {
    openModal(elements.memberModal);
    return;
  }

  prepareScheduleModal("regular");
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

  const adjustmentRate = Number(getPaymentDiscountSelect().value || 0);
  const amount = Number(selected.amount || 0) * (1 + adjustmentRate / 100);
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
  const items = getTodaySidebarEntries();
  elements.todaySchedule.innerHTML = "";
  elements.todayCount.textContent = String(items.length);

  if (!items.length) {
    elements.todaySchedule.append(createEmptyLine("오늘 예정된 수업이 없습니다."));
    return;
  }

  items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "today-card";
    const attendanceStatus = getCombinedAttendanceStatus(item.groups);
    const status = item.status || "";
    const balanceValues = item.members.map(getBalance);
    const balances = balanceValues.every((balance) => balance === balanceValues[0])
      ? `${balanceValues[0]}회 남음`
      : `${balanceValues.join("/")}회 남음`;
    const balanceTone = getBalanceTone(balanceValues);
    const [startTime, endTime] = item.timeLabel.split("-");
    card.innerHTML = `
      <button class="today-card-main" type="button">
        <span class="today-card-time">
          <span>${escapeHTML(startTime)}</span>
        </span>
        <span class="today-card-copy">
          <strong>${escapeHTML(item.members.map((member) => member.name).join(", "))}</strong>
        </span>
      </button>
      ${endTime || status === "보강" ? `
        <span class="today-card-time-meta">
          ${endTime ? `<small class="today-card-end-time">${escapeHTML(endTime)}</small>` : ""}
          ${status === "보강" ? '<small class="today-card-status">보강</small>' : ""}
        </span>
      ` : ""}
      <span class="today-card-details">
        <small class="today-card-lesson">${escapeHTML(compactLessonType(item.lessonType, item.groups.length))}</small>
        <small class="today-card-balance ${balanceTone}">${escapeHTML(balances)}</small>
      </span>
    `;
    const actions = document.createElement("div");
    actions.className = "today-card-actions";
    [
      { status: "출석", label: "출석", className: "present" },
      { status: "결석", label: "결석", className: "absent" },
    ].forEach((action) => {
      const button = document.createElement("button");
      button.className = `mini-action attendance-big ${action.className} ${attendanceStatus === action.status ? "selected" : ""}`;
      button.type = "button";
      button.textContent = action.label;
      button.setAttribute("aria-label", action.label);
      button.disabled = !canEditSharedData();
      button.addEventListener("click", () => markCombinedAttendance(item.groups, action.status));
      actions.append(button);
    });
    card.querySelector(".today-card-main").addEventListener("click", () => {
      selectedMemberId = item.members[0]?.id ?? selectedMemberId;
      setMobileView("detail");
      render();
    });
    card.append(actions);
    elements.todaySchedule.append(card);
  });
}

function getBalanceTone(balances) {
  const lowest = Math.min(...balances);
  if (lowest <= 2) return "balance-low";
  if (lowest <= 4) return "balance-mid";
  return "balance-good";
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
  const adjustmentRate = Number(form.get("discountOption") || 0);
  const adjustmentMemo = discountOption?.dataset.label || "";
  const memo = String(form.get("memo")).trim();

  member.payments.push({
    id: crypto.randomUUID(),
    date: String(form.get("date")),
    lessonType: String(form.get("lessonType")),
    sessions: Number(form.get("sessions")),
    amount: Number(form.get("amount")),
    memo: [adjustmentMemo, memo].filter(Boolean).join(" · "),
    paymentMethod: "",
    discountRate: adjustmentRate < 0 ? Math.abs(adjustmentRate) : 0,
    taxRate: adjustmentRate > 0 ? adjustmentRate : 0,
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
  const isMakeup = elements.scheduleForm.dataset.mode === "makeup";
  const scheduleDate = isMakeup ? String(form.get("date")) : "";

  if (!memberIds.length) {
    alert("참여 회원을 선택해주세요.");
    return;
  }

  if (isMakeup && !scheduleDate) {
    alert("보강 날짜를 선택해주세요.");
    return;
  }

  const scheduleDay = isMakeup ? new Date(`${scheduleDate}T12:00:00`).getDay() : Number(form.get("day"));

  memberIds.forEach((memberId) => {
    const member = state.members.find((item) => item.id === memberId);
    if (!member) return;

    member.schedules.push({
      id: crypto.randomUUID(),
      day: scheduleDay,
      time: String(form.get("time")),
      className: String(form.get("className")).trim() || "수업",
      lessonType: String(form.get("scheduleLessonType")),
      status: String(form.get("scheduleStatus")),
      date: scheduleDate,
    });
  });

  elements.scheduleForm.reset();
  prepareScheduleModal("regular");
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
  const normalizedStatus = normalizeAttendanceStatus(status);
  const existing = member.attendances.find(
    (item) =>
      item.date === todayISO &&
      (item.className || "출석") === className &&
      (item.time || "") === (time || ""),
  );

  if (existing) {
    existing.status = normalizedStatus;
    return;
  }

  member.attendances.push({
    id: crypto.randomUUID(),
    date: todayISO,
    className,
    time,
    status: normalizedStatus,
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
      normalizeAttendanceStatus(item.status) === "출석",
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

        const key = getMemberRecordKey({ name, phone });
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
      deduplicateMemberData(state);
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
      deduplicateMemberData(state);
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
      const memberKey = getMemberRecordKey({ name, phone });
      const exists = state.members.some((member) => getMemberRecordKey(member) === memberKey);
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
  const used = deduplicateAttendances(member.attendances).filter(isCountedAttendance).length;
  return paid - used;
}

function isCountedAttendance(item) {
  const status = normalizeAttendanceStatus(item.status);
  return status !== "결석" && status !== "당일취소";
}

function getTodayItems() {
  return getScheduleGroups().filter((item) => Number(item.day) === today.getDay());
}

function getTodaySidebarEntries() {
  return combineConsecutiveGroups(getTodayItems());
}

function combineConsecutiveGroups(groups) {
  const sorted = [...groups].sort((a, b) => a.time.localeCompare(b.time) || getGroupKey(a).localeCompare(getGroupKey(b)));
  const combined = [];

  sorted.forEach((group) => {
    const previous = combined.at(-1);
    if (previous && previous.key === getGroupKey(group) && timeToMinutes(group.time) === timeToMinutes(previous.endTime) + 30) {
      previous.groups.push(group);
      previous.endTime = group.time;
      previous.timeLabel = `${previous.startTime}-${minutesToTime(timeToMinutes(group.time) + 30)}`;
      return;
    }

    combined.push({
      key: getGroupKey(group),
      day: group.day,
      date: group.date || "",
      startTime: group.time,
      endTime: group.time,
      timeLabel: group.time,
      className: group.className,
      lessonType: group.lessonType,
      status: group.status,
      members: group.members,
      groups: [group],
    });
  });

  return combined;
}

function getGroupKey(group) {
  return [
    group.className || "수업",
    group.status || "",
    group.members.map((member) => member.id).sort().join(","),
  ].join("|");
}

function getCombinedAttendanceState(groups) {
  const states = groups.map(getGroupAttendanceState);
  const recorded = states.reduce((sum, item) => sum + item.recorded, 0);
  const total = states.reduce((sum, item) => sum + item.total, 0);
  return {
    recorded,
    total,
    done: total > 0 && recorded === total,
    partial: recorded > 0 && recorded < total,
  };
}

function markCombinedAttendance(groups, status = "출석") {
  if (!canEditSharedData()) return;
  groups.forEach((group) => {
    group.members.forEach((member) => {
      recordAttendance(member, group.className || "출석", group.time, status);
    });
  });
  commit();
}

function getCombinedAttendanceStatus(groups) {
  const statuses = groups.flatMap((group) =>
    group.members.map((member) => {
      const record = member.attendances.find(
        (item) =>
          item.date === todayISO &&
          (item.className || "출석") === (group.className || "출석") &&
          (item.time || "") === (group.time || ""),
      );
      return record ? normalizeAttendanceStatus(record.status) : "";
    }),
  );

  return statuses.length && statuses.every((status) => status && status === statuses[0]) ? statuses[0] : "";
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
  return getAccessibleMembers().flatMap((member) =>
    member.schedules
      .filter((item) => !item.date || item.date === todayISO)
      .map((item) => ({ ...item, member })),
  );
}

function getScheduleGroups() {
  const groups = new Map();

  getScheduleItems().forEach((item) => {
    const key = [item.day, item.time, item.className || "수업", getScheduleLessonType(item), getScheduleStatus(item), item.date || ""].join("|");
    if (!groups.has(key)) {
      groups.set(key, {
        day: item.day,
        time: item.time,
        className: item.className || "수업",
        lessonType: getScheduleLessonType(item),
        status: getScheduleStatus(item),
        date: item.date || "",
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
  block.className = "lesson-block";

  const mainButton = document.createElement("button");
  mainButton.className = "lesson-main";
  mainButton.type = "button";
  mainButton.innerHTML = `
    <span class="lesson-member-names">${escapeHTML(group.members.map((member) => member.name).join(", "))}</span>
    <strong>${getStatusBadge(group.status)}<span class="lesson-badge">${escapeHTML(compactLessonType(group.lessonType, group.groups?.length || 1))}</span><span class="lesson-class-name">${escapeHTML(group.className || "수업")}</span></strong>
    <small>${group.members.length}명 · 잔여 ${escapeHTML(group.members.map((member) => `${member.name} ${getBalance(member)}회`).join(" / "))}</small>
  `;
  mainButton.addEventListener("click", () => {
    selectedMemberId = group.members[0]?.id ?? selectedMemberId;
    render();
  });
  block.append(mainButton);

  if (Number(group.day) === today.getDay()) {
    const attendanceStatus = getCombinedAttendanceStatus(group.groups?.length ? group.groups : [group]);
    const statusLabel = document.createElement("span");
    statusLabel.className = `lesson-attendance-state ${getAttendanceStateClass(attendanceStatus)}`;
    statusLabel.textContent = attendanceStatus || "미처리";
    block.append(statusLabel);
  }

  return block;
}

function getAttendanceStateClass(status) {
  if (status === "출석" || status === "보강완료") return "present";
  if (status === "결석" || status === "당일취소") return "absent";
  return "pending";
}

function compactLessonType(lessonType = "", consecutiveSlots = 1) {
  const frequency = lessonType.match(/주\s*(\d+)/)?.[1];
  const people = lessonType.match(/\/\s*(\d+)인/)?.[1];
  const minutes = lessonType.match(/\((\d+)분\)/)?.[1];
  const duration = consecutiveSlots > 1 ? consecutiveSlots * 30 : Number(minutes || 0);
  const parts = [];

  if (frequency) parts.push(`주${frequency}`);
  if (people) parts.push(`${people}:1`);
  if (duration) parts.push(`${duration}분`);

  return parts.length ? parts.join(" ") : lessonType;
}

function prepareScheduleModal(mode) {
  const isMakeup = mode === "makeup";
  elements.scheduleForm.dataset.mode = mode;
  elements.scheduleMemberSearch.value = "";
  elements.scheduleModalTitle.textContent = isMakeup ? "보강 수업 추가" : "시간표 추가";
  elements.scheduleDayField.hidden = isMakeup;
  elements.makeupDateField.hidden = !isMakeup;
  elements.scheduleForm.date.required = isMakeup;

  if (!isMakeup) {
    elements.scheduleForm.date.value = "";
    elements.scheduleForm.querySelector('[name="scheduleStatus"]').value = "";
  }
}

function renderScheduleMemberOptions(selectedIds = []) {
  const selected = new Set(selectedIds);
  elements.scheduleMemberOptions.innerHTML = "";

  state.members.forEach((member) => {
    const label = document.createElement("label");
    label.className = "member-option";
    label.dataset.search = `${member.name} ${member.phone || ""}`.toLowerCase();
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

function filterScheduleMemberOptions() {
  const query = elements.scheduleMemberSearch.value.trim().toLowerCase();
  elements.scheduleMemberOptions.querySelectorAll(".member-option").forEach((option) => {
    option.hidden = Boolean(query) && !option.dataset.search.includes(query);
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
