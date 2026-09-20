const donationBtn = document.getElementById("donationBtn");
const donationOverlay = document.getElementById("donationOverlay");
const donationClose = document.getElementById("donationClose");
const donationCancel = document.getElementById("donationCancel");
const donationForm = document.getElementById("donationForm");
const payNowBtn = document.getElementById("payNowBtn");

const paymentMethodLabels = {
  "visa": "Visa Debit/Credit Card",
  "mastercard": "Mastercard Debit/Credit Card",
  "bank": "Bank Transfer (ACH)",
  "bkash": "bKash",
  "nagad": "Nagad",
  "new-card": "a new card"
};

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

donationForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const amount = donationForm.amount.value;
  const method = paymentMethodLabels[donationForm.paymentMethod.value] || donationForm.paymentMethod.value;
  alert(`Thank you! Your donation of $${amount} via ${method} has been recorded.`);
  donationForm.reset();
  closeModal();
});

if (payNowBtn) {
  payNowBtn.addEventListener("click", () => {
    const selected = document.querySelector('input[name="paymentMethod"]:checked');
    const methodLabel = selected ? paymentMethodLabels[selected.value] || selected.value : "your selected method";
    alert(`Payment of $3,420.00 processed using ${methodLabel}.`);
  });
}

const addMethodBtn = document.getElementById("addMethodBtn");
if (addMethodBtn) {
  addMethodBtn.addEventListener("click", () => {
    alert("This would open a form to add a new payment method.");
  });
}