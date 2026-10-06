/* ============================================================
   RESIDENT PORTAL — BACKEND INTEGRATION
   Load this AFTER script.js in index.html:
   <script src="script.js"></script>
   <script src="resident-api.js"></script>
   ============================================================ */

const API_BASE = "../../PHP/"; // relative to Resident/caredirect-portal/index.html

/* Helper: GET JSON from an endpoint, sending the session cookie */
async function apiGet(endpoint, params = {}) {
  const url = new URL(API_BASE + endpoint, window.location.href);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url, { credentials: "same-origin" });
  return res.json();
}

/* Helper: POST form data to an endpoint, sending the session cookie */
async function apiPost(endpoint, data = {}) {
  const body = new URLSearchParams(data);
  const res = await fetch(API_BASE + endpoint, {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });
  return res.json();
}

/* ============================================================
   DASHBOARD PAGE
   ============================================================ */
let lastDashboardData = null;

async function loadDashboard() {
  const data = await apiGet("get_resident_dashboard.php");
  if (!data.success) {
    console.error("Dashboard load failed:", data.error);
    return;
  }
  lastDashboardData = data;

  const r = data.resident;
  const nameEl = document.getElementById("residentName");
  if (nameEl) nameEl.textContent = r.full_name;

  // Sidebar: name, initials, care level
  setText("sidebarName", r.full_name);
  setText("sidebarCareLevel", "Care Level: " + (r.service_name || r.service_code || "Standard"));
  const initials = (r.full_name || "")
    .split(" ")
    .map(part => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  setText("sidebarAvatar", initials || "?");

  if (data.vitals) {
    setText("dashHeartRate", data.vitals.heart_rate ?? "--");
    setText("dashHeartRateStatus", data.vitals.heart_rate_status ?? "");
    setText("dashBloodSugar", data.vitals.blood_sugar ?? "--");
    setText("dashBloodOxygen", data.vitals.blood_oxygen ?? "--");
    setText("dashBloodOxygenStatus", data.vitals.blood_oxygen != null ? (data.vitals.blood_oxygen >= 95 ? "Normal" : "Low") : "--");
    setText("dashTemp", data.vitals.temperature ?? "--");
    setText("dashTempStatus", data.vitals.temperature != null ? (data.vitals.temperature > 99.5 ? "Elevated" : "Stable") : "--");
  }

  // Medications list (dashboard shows the upcoming/next few)
  const medList = document.getElementById("dashMedicationList");
  if (medList && data.medications) {
    medList.innerHTML = data.medications.length ? data.medications.map(m => `
      <li>
        <div class="node"></div>
        <div class="timeline-item">
          <div class="tag">${m.scheduled_time ?? "Anytime"}</div>
          <h4>${escapeHtml(m.item_name)}</h4>
          <p>${escapeHtml(m.purpose ?? "")}</p>
        </div>
      </li>
    `).join("") : `<li><div class="node"></div><div class="timeline-item"><div class="tag">—</div><h4>No medications scheduled</h4></div></li>`;
  }

  // Meal Plan checkmarks: check off any meal logged today
  const mealTitles = (data.today_meals || []).map(m => m.title.toLowerCase());
  const mealChecked = (keyword) => mealTitles.some(t => t.includes(keyword));
  ["breakfast", "lunch", "snack", "dinner"].forEach(meal => {
    const el = document.getElementById("mealCheck" + meal.charAt(0).toUpperCase() + meal.slice(1));
    if (el) el.style.visibility = mealChecked(meal) ? "visible" : "hidden";
  });

  // Recent activity list
  const activityList = document.getElementById("dashRecentActivity");
  if (activityList && data.recent_activities) {
    activityList.innerHTML = data.recent_activities.length ? data.recent_activities.map(a => `
      <li>
        <div class="node"></div>
        <div class="timeline-item">
          <div class="tag">${new Date(a.activity_at).toLocaleString()}</div>
          <h4>${escapeHtml(a.title)}</h4>
          <p>${escapeHtml(a.description ?? "")}</p>
        </div>
      </li>
    `).join("") : `<li><div class="node"></div><div class="timeline-item"><div class="tag">—</div><h4>No recent activity yet</h4><p>Activity will appear here once recorded.</p></div></li>`;
  }

  loadActivityHistory();
}

/* ============================================================
   HEALTH PROFILE PAGE
   ============================================================ */
async function loadHealthProfile() {
  const data = await apiGet("get_resident_health.php");
  if (!data.success) {
    console.error("Health profile load failed:", data.error);
    return;
  }

  const r = data.resident;
  setText("hpResidentName", r.full_name);
  setText("hpConditions", r.health_conditions ?? "None recorded");

  if (data.vitals) {
    setText("hpHeartRate", data.vitals.heart_rate ?? "--");
    setText("hpBP", `${data.vitals.bp_systolic ?? "--"}/${data.vitals.bp_diastolic ?? "--"}`);
    setText("hpBloodSugar", `${data.vitals.blood_sugar ?? "--"} ${data.vitals.blood_sugar_unit ?? ""}`);
    setText("hpBloodOxygen", data.vitals.blood_oxygen ?? "--");
    setText("hpBloodOxygenTrend", data.vitals.blood_oxygen != null ? (data.vitals.blood_oxygen >= 95 ? "Within range" : "Low") : "");
    setText("hpTemp", data.vitals.temperature ?? "--");
    setText("hpTempTrend", data.vitals.temperature != null ? (data.vitals.temperature > 99.5 ? "Elevated" : "Within range") : "");
  }

  if (data.emergency_contact) {
    setText("hpEmergencyName", data.emergency_contact.contact_name);
    setText("hpEmergencyPhone", data.emergency_contact.contact_phone);
  } else {
    setText("hpEmergencyName", "Not set");
    setText("hpEmergencyPhone", "");
  }

  // Dietary restrictions (newline-separated notes stored in one text field)
  const dietList = document.getElementById("dietList");
  if (dietList) {
    const notes = (r.dietary_restrictions || "").split("\n").map(s => s.trim()).filter(Boolean);
    dietList.innerHTML = notes.length
      ? notes.map(n => `<div class="diet-good"><h4>📝 Note</h4><p>${escapeHtml(n)}</p></div>`).join("")
      : `<div class="diet-good"><h4>📋 No restrictions recorded yet</h4><p>Use "Edit Restrictions" below to add one.</p></div>`;
  }

  // Next Dose: earliest medication for today that hasn't been marked completed
  renderNextDose(data.medications || []);
}

let nextDoseCareItemId = null;

function renderNextDose(medications) {
  const pending = medications.filter(m => m.status === "pending" && m.scheduled_time);
  const next = pending[0]; // already sorted by scheduled_time from the backend

  if (!next) {
    nextDoseCareItemId = null;
    setText("nextDoseTime", "--");
    setText("nextDoseName", "No upcoming doses");
    setText("nextDosePurpose", "");
    setText("nextDoseNote", "");
    const btn = document.getElementById("markGivenBtn");
    if (btn) { btn.disabled = true; btn.textContent = "Nothing due"; }
    return;
  }

  nextDoseCareItemId = next.care_item_id;
  setText("nextDoseTime", next.scheduled_time);
  setText("nextDoseName", next.item_name);
  setText("nextDosePurpose", next.purpose || "");
  setText("nextDoseNote", "");
  const btn = document.getElementById("markGivenBtn");
  if (btn) { btn.disabled = false; btn.textContent = "✔ Mark as Given"; }
}

/* Overrides the fake version in script.js */
async function markDoseGiven(btn) {
  if (!nextDoseCareItemId) {
    showToast("No dose to mark");
    return;
  }
  const result = await apiPost("medication_action.php", {
    care_item_id: nextDoseCareItemId,
    status: "completed",
    scheduled_date: new Date().toISOString().slice(0, 10)
  });
  if (result.success) {
    btn.textContent = "✔ Given";
    btn.disabled = true;
    showToast("Marked as given");
    loadHealthProfile(); // refresh to show the next dose after this one
  } else {
    showToast("Error: " + result.error);
  }
}

/* Overrides the fake version in script.js */
async function addRestriction() {
  const textarea = document.getElementById("editRestrictionsText");
  const text = textarea.value.trim();
  if (!text) {
    textarea.style.borderColor = "var(--red-strong)";
    textarea.placeholder = "Please describe the restriction before saving…";
    return;
  }

  const result = await apiPost("resident_update_restrictions.php", { note: text });

  document.getElementById("editRestrictionsFormView").style.display = "none";
  document.getElementById("editRestrictionsDoneView").style.display = "block";

  if (result.success) {
    showToast("Dietary restriction added");
    loadHealthProfile(); // refresh the list with the new note
  } else {
    showToast("Error: " + result.error);
  }
}

/* ============================================================
   DAILY SCHEDULE PAGE
   ============================================================ */
async function loadSchedule(date) {
  const dateStr = date || new Date().toISOString().slice(0, 10);
  const data = await apiGet("get_resident_schedule.php", { date: dateStr });
  if (!data.success) {
    console.error("Schedule load failed:", data.error);
    return;
  }

  const container = document.getElementById("scheduleTimeline");
  if (!container) return;

  container.innerHTML = data.schedule.map((item, i) => `
    <li class="day-event" id="day-event-${item.care_item_id}" data-status="${item.medication_status}">
      <div class="day-time">${item.care_type === "medication" ? "💊" : "🩺"}</div>
      <div class="day-body">
        <div class="day-event-title">
          <span class="tag future">${item.scheduled_time ?? "Anytime"}</span>
          <h4>${escapeHtml(item.item_name)}</h4>
          <p>${escapeHtml(item.purpose ?? "")}</p>
        </div>
        <div class="day-actions">
          <button class="day-btn done-btn" onclick="markScheduleItem(${item.care_item_id}, 'completed', '${dateStr}')"
            ${item.medication_status === "completed" ? "disabled" : ""}>✔ Done</button>
          <button class="day-btn notdone-btn" onclick="markScheduleItem(${item.care_item_id}, 'missed', '${dateStr}')"
            ${item.medication_status === "missed" ? "disabled" : ""}>✕ Not Done</button>
        </div>
      </div>
    </li>
  `).join("");
}

async function markScheduleItem(careItemId, status, date) {
  const result = await apiPost("medication_action.php", {
    care_item_id: careItemId,
    status,
    scheduled_date: date
  });
  if (result.success) {
    showToast("Status updated");
    loadSchedule(date);
  } else {
    showToast("Error: " + result.error);
  }
}

/* ============================================================
   MEDICATION PAGE
   ============================================================ */
async function loadMedications(date) {
  const dateStr = date || new Date().toISOString().slice(0, 10);
  const data = await apiGet("get_resident_medications.php", { date: dateStr });
  if (!data.success) {
    console.error("Medications load failed:", data.error);
    return;
  }

  const container = document.getElementById("medicationList");
  if (!container) return;

  container.innerHTML = data.medications.map(m => `
    <div class="rx-current" id="rx-item-${m.care_item_id}" data-status="${m.status}">
      <div class="rx-current-left">
        <div class="icon-badge">💊</div>
        <div class="rx-current-name">
          <h4>${escapeHtml(m.item_name)}</h4>
          <p>${m.scheduled_time ?? "Anytime"} · ${escapeHtml(m.frequency ?? "")}</p>
          <em>${escapeHtml(m.purpose ?? "")}</em>
        </div>
      </div>
      <div class="rx-actions">
        <button class="rx-btn taken" onclick="markMedication(${m.care_item_id}, 'completed', '${dateStr}')"
          ${m.status !== "pending" ? "disabled" : ""}>✔ Taken</button>
        <button class="rx-btn missed" onclick="markMedication(${m.care_item_id}, 'missed', '${dateStr}')"
          ${m.status !== "pending" ? "disabled" : ""}>✕ Missed</button>
      </div>
    </div>
  `).join("");
}

async function markMedication(careItemId, status, date) {
  const result = await apiPost("medication_action.php", {
    care_item_id: careItemId,
    status,
    scheduled_date: date
  });
  if (result.success) {
    showToast(status === "completed" ? "Marked as taken" : "Marked as missed");
    loadMedications(date);
  } else {
    showToast("Error: " + result.error);
  }
}

/* ============================================================
   BILLING PAGE  (uses the shared get_billing.php / pay_bill.php,
   the same endpoints the guardian billing page uses)
   ============================================================ */
let currentBillId = null;

/* "2026-10-05" or "2026-10-05 17:58:52" -> local Date (also parses on Safari) */
function parseDbDate(str) {
  if (!str) return null;
  return new Date(String(str).includes(" ") ? str.replace(" ", "T") : str + "T00:00:00");
}

function formatPaidOn(paidAt) {
  const d = parseDbDate(paidAt);
  return d ? "Paid " + d.toLocaleDateString() : "";
}

async function loadBilling() {
  const data = await apiGet("get_billing.php", { all: 1 });
  if (!data.success) {
    console.error("Billing load failed:", data.error);
    return;
  }

  // get_billing.php returns the latest invoice even when it is already paid; only show unpaid ones as "due".
  const inv = data.invoice && data.invoice.status !== "paid" ? data.invoice : null;
  const payBtn = document.getElementById("payNowBtn");

  if (inv) {
    currentBillId = inv.bill_id;
    setText("invoiceStatus", inv.status === "overdue" ? "Overdue" : "Current Invoice");
    setText("invoiceMonth", parseDbDate(inv.billing_month).toLocaleString(undefined, { month: "long", year: "numeric" }) + " Care Plan");
    setText("invoiceNote", "Due date: " + inv.due_date);
    setText("invoiceDueLabel", "Amount due " + inv.due_date);
    setText("invoiceAmount", "$" + Number(inv.balance).toLocaleString());
    setText("invoiceLineAmount", "$" + Number(inv.balance).toLocaleString());
    if (payBtn) { payBtn.disabled = false; payBtn.textContent = "Pay Now"; }
  } else {
    currentBillId = null;
    setText("invoiceStatus", "No Invoice Due");
    setText("invoiceMonth", "You're all caught up");
    setText("invoiceNote", "No outstanding balance right now.");
    setText("invoiceAmount", "$0");
    setText("invoiceLineAmount", "$0");
    if (payBtn) { payBtn.disabled = true; payBtn.textContent = "Nothing Due"; }
  }

  const history = data.history || [];

  const historyList = document.getElementById("paymentHistoryList");
  if (historyList) {
    historyList.innerHTML = history.length ? history.slice(0, 3).map(h => `
      <div class="history-item">
        <div class="history-left"><div class="history-icon">✔</div>
          <div><div class="month">${parseDbDate(h.billing_month).toLocaleString(undefined, { month: "long" })}</div>
          <div class="date">${formatPaidOn(h.paid_at)}</div></div></div>
        <div class="amount">$${Number(h.amount).toLocaleString()}</div>
      </div>
    `).join("") : `<div class="history-item"><div class="history-left"><div class="history-icon">—</div><div><div class="month">No payments yet</div></div></div></div>`;
  }

  // Full Billing History page
  setText("fullHistorySubtitle", "Full record of past invoices and payments for " + (lastDashboardData?.resident?.full_name || data.resident?.name || "you") + ".");
  const fullList = document.getElementById("fullHistoryList");
  if (fullList) {
    fullList.innerHTML = history.length ? history.map(h => `
      <li>
        <span class="check">✔</span>
        <div class="history-details">
          <div class="history-month">${parseDbDate(h.billing_month).toLocaleString(undefined, { month: "long", year: "numeric" })} Invoice</div>
          <div class="history-date">${formatPaidOn(h.paid_at)} · ${escapeHtml(h.method)}</div>
        </div>
        <div class="history-amount">$${Number(h.amount).toLocaleString()}</div>
      </li>
    `).join("") : `<li><div class="history-details"><div class="history-month">No payment history yet</div></div></li>`;
  }
}

/* Overrides the fake payInvoice() from script.js */
async function payInvoice(btn) {
  if (!currentBillId) {
    showToast("Nothing due right now");
    return;
  }
  const selected = document.querySelector('#billing input[name="paymentMethod"]:checked');
  if (!selected) {
    showToast("Please select a payment method");
    return;
  }

  const original = btn.textContent;
  btn.disabled = true;
  btn.textContent = "Processing...";

  const result = await apiPost("pay_bill.php", { bill_id: currentBillId, paymentMethod: selected.value });
  if (result.success) {
    btn.textContent = "✔ Payment Sent";
    showToast("Payment of $" + Number(result.amount_paid).toLocaleString() + " submitted");
    loadBilling();   // refresh invoice + history
    loadDashboard(); // refresh recent activity
  } else {
    btn.textContent = original;
    btn.disabled = false;
    showToast("Payment failed: " + result.error);
  }
}

/* ============================================================
   MEAL PLAN / MEAL OPTIONS
   Logs meal selections as real activity via resident_activity.php
   (overrides the fake versions in script.js)
   ============================================================ */
async function selectMeal(name, btn) {
  showToast(name + " added to your order");

  document.getElementById("successTitle").textContent = "Meal Selected";
  document.getElementById("successSub").textContent = name + " has been added to today's order.";
  openModal("successModal");

  await apiPost("resident_activity.php", {
    activity_type: "meal",
    title: name + " selected",
    description: "Meal chosen via the resident portal."
  });
  loadDashboard(); // refresh recent activity

  if (btn) {
    const original = btn.textContent;
    btn.textContent = "✔ Selected";
    btn.disabled = true;
    btn.style.opacity = "0.75";
    setTimeout(() => {
      btn.textContent = original;
      btn.disabled = false;
      btn.style.opacity = "1";
    }, 2500);
  }
}

async function sendCustomMeal() {
  const textEl = document.getElementById("customMealText");
  const text = textEl.value.trim();
  if (!text) {
    textEl.style.borderColor = "var(--red-strong)";
    textEl.placeholder = "Please describe your request before sending…";
    return;
  }
  document.getElementById("customMealFormView").style.display = "none";
  document.getElementById("customMealDoneView").style.display = "block";

  await apiPost("resident_activity.php", {
    activity_type: "meal",
    title: "Custom meal request",
    description: text
  });
  loadDashboard();
  showToast("Custom meal request sent to the kitchen");
}

async function confirmMealSelection() {
  if (typeof selectedMeals === "undefined" || selectedMeals.length === 0) return;
  const names = selectedMeals.slice();

  showToast(names.length + " meal" + (names.length === 1 ? "" : "s") + " confirmed");
  document.getElementById("successTitle").textContent = "Meals Confirmed";
  document.getElementById("successSub").textContent = "Your selection has been sent to the kitchen: " + names.join(", ") + ".";
  openModal("successModal");

  await apiPost("resident_activity.php", {
    activity_type: "meal",
    title: "Meals confirmed",
    description: names.join(", ")
  });
  loadDashboard();

  selectedMeals.length = 0;
  if (typeof renderSelectedMealsList === "function") renderSelectedMealsList();
}

/* ============================================================
   FULL ACTIVITY HISTORY PAGE
   ============================================================ */
async function loadActivityHistory() {
  const data = await apiGet("get_resident_activity_history.php");
  if (!data.success) {
    console.error("Activity history load failed:", data.error);
    return;
  }

  setText("fullActivitySubtitle", "Full record of activity for " + (lastDashboardData?.resident?.full_name || "you") + ".");

  const list = document.getElementById("fullActivityList");
  if (list) {
    list.innerHTML = data.activities.length ? data.activities.map(a => `
      <li>
        <div class="node"></div>
        <div class="timeline-item">
          <div class="tag">${new Date(a.activity_at).toLocaleString()}</div>
          <h4>${escapeHtml(a.title)}</h4>
          <p>${escapeHtml(a.description ?? "")}</p>
        </div>
      </li>
    `).join("") : `<li><div class="node"></div><div class="timeline-item"><div class="tag">—</div><h4>No activity yet</h4></div></li>`;
  }
}

/* ============================================================
   MEAL PLAN (editable, per-resident, stored in meal_plans table)
   ============================================================ */
let currentMealPlan = [];

function formatTime12h(time24) {
  const [h, m] = time24.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return h12 + ":" + String(m).padStart(2, "0") + " " + period;
}

async function loadMealPlan() {
  const data = await apiGet("get_resident_meal_plan.php");
  if (!data.success) {
    console.error("Meal plan load failed:", data.error);
    return;
  }
  currentMealPlan = data.meal_plan;

  data.meal_plan.forEach(m => {
    const label = m.meal_type.charAt(0).toUpperCase() + m.meal_type.slice(1);
    setText("mealName" + label, m.meal_name);
    setText("mealTime" + label, formatTime12h(m.meal_time.slice(0, 5)));
  });
}

function openEditMealPlan() {
  currentMealPlan.forEach(m => {
    const label = m.meal_type.charAt(0).toUpperCase() + m.meal_type.slice(1);
    const nameEl = document.getElementById("editMealName" + label);
    const timeEl = document.getElementById("editMealTime" + label);
    if (nameEl) nameEl.value = m.meal_name;
    if (timeEl) timeEl.value = m.meal_time.slice(0, 5);
  });
  openModal("editMealPlanModal");
}

async function saveMealPlan() {
  const types = ["breakfast", "lunch", "snack", "dinner"];
  for (const type of types) {
    const label = type.charAt(0).toUpperCase() + type.slice(1);
    const name = document.getElementById("editMealName" + label).value.trim();
    const time = document.getElementById("editMealTime" + label).value;
    if (!name || !time) continue;
    await apiPost("resident_update_meal_plan.php", { meal_type: type, meal_name: name, meal_time: time });
  }
  closeModal("editMealPlanModal");
  showToast("Meal plan updated");
  loadMealPlan();
}

/* ============================================================
   VIEW REPORT MODAL (overrides the static version in script.js)
   ============================================================ */
async function openHealthReport() {
  if (!lastDashboardData) {
    await loadDashboard();
  }
  const data = lastDashboardData;
  if (!data) {
    openModal("healthReportModal");
    return;
  }

  setText("reportDate", "Today · " + new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }));
  setText("reportResidentName", data.resident.full_name);

  if (data.vitals) {
    setText("reportHeartRate", (data.vitals.heart_rate ?? "--") + " bpm");
    setText("reportHeartRateStatus", data.vitals.heart_rate_status ?? "No data");
    setText("reportBP", `${data.vitals.bp_systolic ?? "--"}/${data.vitals.bp_diastolic ?? "--"}`);
    setText("reportBPStatus", data.vitals.bp_status ?? "No data");
    setText("reportBloodSugar", `${data.vitals.blood_sugar ?? "--"} ${data.vitals.blood_sugar_unit ?? ""}`);
    setText("reportBloodSugarStatus", data.vitals.blood_sugar_status ?? "No data");
    setText("reportBloodOxygen", (data.vitals.blood_oxygen ?? "--") + "%");
    setText("reportBloodOxygenStatus", data.vitals.blood_oxygen != null ? (data.vitals.blood_oxygen >= 95 ? "Normal" : "Low") : "No data");
    setText("reportTemp", (data.vitals.temperature ?? "--") + "°F");
    setText("reportTempStatus", data.vitals.temperature != null ? (data.vitals.temperature > 99.5 ? "Elevated" : "Stable") : "No data");
  } else {
    setText("reportHeartRate", "No data");
    setText("reportBP", "No data");
    setText("reportBloodSugar", "No data");
    setText("reportBloodOxygen", "No data");
    setText("reportTemp", "No data");
  }

  // Medication adherence: pull today's real medication statuses
  const medData = await apiGet("get_resident_medications.php");
  if (medData.success && medData.medications.length) {
    const total = medData.medications.length;
    const done = medData.medications.filter(m => m.status === "completed").length;
    setText("reportAdherence", done + " of " + total + " doses");
  } else {
    setText("reportAdherence", "No medications scheduled");
  }

  const noteEl = document.getElementById("reportNote");
  if (noteEl) {
    if (data.vitals && data.vitals.bp_status && data.vitals.bp_status !== "stable") {
      noteEl.textContent = "📋 Note: Blood pressure is reading as " + data.vitals.bp_status + ". Consider a follow-up check.";
    } else {
      noteEl.textContent = "📋 No additional notes at this time.";
    }
  }

  openModal("healthReportModal");
}

/* ============================================================
   EMERGENCY BUTTON (overrides the alert() version in script.js)
   ============================================================ */
async function openEmergency() {
  const result = await apiPost("resident_emergency.php");
  if (result.success) {
    alert("🚨 Emergency alert sent! Staff have been notified and are on their way.");
  } else {
    alert("Could not send emergency alert: " + (result.error || "unknown error"));
  }
}

/* ============================================================
   UTILITIES
   ============================================================ */
function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

/* ============================================================
   INITIAL LOAD — fires once the page and script.js have run
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  loadDashboard();
  loadHealthProfile();
  loadSchedule();
  loadMedications();
  loadBilling();
  loadMealPlan();

  // Log donations as activity (in addition to script.js's existing toast/modal UI)
  const donationForm = document.getElementById("donationForm");
  if (donationForm) {
    donationForm.addEventListener("submit", async (e) => {
      const amount = donationForm.amount.value;
      const method = donationForm.paymentMethod.value;
      await apiPost("resident_activity.php", {
        activity_type: "other",
        title: "Donation made",
        description: "Donated $" + amount + " via " + method
      });
      loadDashboard();
    });
  }
});