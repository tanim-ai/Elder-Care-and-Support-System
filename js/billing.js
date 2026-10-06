const $ = (id) => document.getElementById(id);

const donationBtn = $("donationBtn");
const donationOverlay = $("donationOverlay");
const donationClose = $("donationClose");
const donationCancel = $("donationCancel");
const donationForm = $("donationForm");
const payNowBtn = $("payNowBtn");

let currentInvoice = null;

/* ---------- helpers ---------- */

const formatMoney = (value) =>
  Number(value).toLocaleString("en-US", { style: "currency", currency: "USD" });

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

async function postForm(url, fields) {
  const body = new FormData();
  Object.entries(fields).forEach(([k, v]) => body.append(k, v));
  const response = await fetch(url, { method: "POST", body, credentials: "same-origin" });
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("Unexpected server response.");
  }
  return data;
}

/* ---------- render ---------- */

function renderInvoice(invoice) {
  const badge = $("invoiceBadge");
  const paymentSection = $("paymentSection");
  badge.className = "badge";

  if (!invoice) {
    badge.textContent = "No invoice";
    badge.classList.add("badge-paid");
    $("totalAmount").textContent = formatMoney(0);
    $("invoiceId").textContent = "No invoices yet";
    $("billingPeriod").textContent = "";
    $("lineItems").innerHTML = "";
    paymentSection.hidden = true;
    payNowBtn.disabled = true;
    return;
  }

  const days = invoice.days_until_due;
  if (invoice.status === "paid") {
    badge.textContent = "Paid";
    badge.classList.add("badge-paid");
  } else if (invoice.status === "overdue") {
    badge.textContent = `Overdue by ${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"}`;
    badge.classList.add("badge-overdue");
  } else if (days === 0) {
    badge.textContent = "Due today";
    badge.classList.add("badge-due");
  } else {
    badge.textContent = `Due in ${days} day${days === 1 ? "" : "s"}`;
    badge.classList.add("badge-due");
  }

  const paid = invoice.status === "paid";
  $("totalLabel").textContent = paid ? "Total Paid" : "Total Amount Due";
  $("totalAmount").textContent = formatMoney(paid ? invoice.amount_due : invoice.balance);
  $("invoiceId").textContent = `Invoice #${invoice.invoice_number}`;
  $("billingPeriod").textContent = `Billing Period: ${invoice.period_label}`;

  $("lineItems").innerHTML = invoice.line_items
    .map(
      (item) => `
      <li>
        <span class="item-icon">🏠</span>
        <span class="item-label">${escapeHtml(item.label)}</span>
        <span class="item-price">${formatMoney(item.amount)}</span>
      </li>`
    )
    .join("");

  paymentSection.hidden = paid;
  payNowBtn.disabled = paid;
  payNowBtn.textContent = paid ? "Paid" : "Pay Now";
}

function renderHistory(history) {
  const list = $("historyList");
  if (!history.length) {
    list.innerHTML = '<li class="history-empty">No payments yet.</li>';
    return;
  }
  list.innerHTML = history
    .map(
      (p) => `
      <li>
        <span class="check">✔</span>
        <div class="history-details">
          <div class="history-month">${escapeHtml(p.label)}</div>
          <div class="history-date">Paid on ${escapeHtml(p.paid_on)} <span class="history-method">· ${escapeHtml(p.method)}</span></div>
        </div>
        <div class="history-amount">${formatMoney(p.amount)}</div>
      </li>`
    )
    .join("");
}

function showLoadError(message) {
  const box = $("invoiceError");
  box.textContent = message;
  box.hidden = false;
  $("invoiceBadge").textContent = "Unavailable";
  $("historyList").innerHTML = '<li class="history-empty">Unable to load payment history.</li>';
  payNowBtn.disabled = true;
}

async function loadBilling() {
  try {
    const response = await fetch("PHP/get_billing.php", { credentials: "same-origin" });
    const data = await response.json();
    if (!data.success) {
      showLoadError(data.message || "Could not load billing information.");
      return;
    }
    $("invoiceError").hidden = true;
    $("subtitle").textContent = `Review and manage care invoices for ${data.resident.name}.`;
    currentInvoice = data.invoice;
    renderInvoice(data.invoice);
    renderHistory(data.history);
  } catch (err) {
    showLoadError("Could not load billing information. Please check your connection.");
  }
}

/* ---------- donation modal (unchanged from original) ---------- */

function openModal() {
  donationOverlay.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  donationOverlay.classList.remove("open");
  document.body.style.overflow = "";
}

donationBtn.addEventListener("click", openModal);
donationClose.addEventListener("click", closeModal);
donationCancel.addEventListener("click", closeModal);

donationOverlay.addEventListener("click", (e) => {
  if (e.target === donationOverlay) closeModal();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && donationOverlay.classList.contains("open")) {
    closeModal();
  }
});

donationForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const submitBtn = donationForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;

  const formData = new FormData();
  formData.append("amount", donationForm.amount.value);
  formData.append("paymentMethod", donationForm.paymentMethod.value);
  formData.append("message", donationForm.message.value);

  try {
    const response = await fetch("PHP/guardian_donation.php", {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    if (data.success) {
      alert(
        `Thank you! Your donation of $${data.amount} via ${data.payment_method} has been recorded.\n` +
        `Receipt number: ${data.receipt_number}`
      );
      donationForm.reset();
      closeModal();
    } else {
      alert(data.message || "Donation failed. Please try again.");
    }
  } catch (err) {
    alert("Something went wrong. Please check your connection and try again.");
  } finally {
    submitBtn.disabled = false;
  }
});

/* ---------- pay now ---------- */

payNowBtn.addEventListener("click", async () => {
  if (!currentInvoice || currentInvoice.status === "paid") return;

  const selected = document.querySelector('input[name="paymentMethod"]:checked');
  if (!selected) {
    alert("Please select a payment method.");
    return;
  }

  payNowBtn.disabled = true;
  payNowBtn.textContent = "Processing…";

  try {
    const data = await postForm("PHP/pay_bill.php", {
      bill_id: currentInvoice.bill_id,
      paymentMethod: selected.value
    });

    if (data.success) {
      alert(
        `Payment of ${formatMoney(data.amount)} processed using ${data.payment_method}.\n` +
        `Reference: ${data.reference}`
      );
      await loadBilling(); // refresh invoice + history from the database
    } else {
      alert(data.message || "Payment failed. Please try again.");
      await loadBilling();
    }
  } catch (err) {
    alert("Something went wrong. Please check your connection and try again.");
    payNowBtn.disabled = false;
    payNowBtn.textContent = "Pay Now";
  }
});

loadBilling();