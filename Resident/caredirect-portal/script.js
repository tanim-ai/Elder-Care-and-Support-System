const links = document.querySelectorAll('.nav-link');
const pages = document.querySelectorAll('.page');

function showPage(id){
  pages.forEach(p => p.classList.toggle('active', p.id === id));
  links.forEach(l => l.classList.toggle('active', l.dataset.page === id));
}

// Make showPage globally accessible for onclick handlers
window.showPage = showPage;

links.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const id = link.dataset.page;
    history.replaceState(null, '', '#' + id);
    showPage(id);
    window.scrollTo({top:0, behavior:'smooth'});
  });
});

const initial = location.hash ? location.hash.slice(1) : 'dashboard';
if(document.getElementById(initial)){
  showPage(initial);
}

/* ===== Toast helper ===== */
function showToast(message){
  const stack = document.getElementById('toastStack');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = '<span class="toast-check">✔</span><span>' + message + '</span>';
  stack.appendChild(toast);
  setTimeout(() => toast.remove(), 3600);
}

/* ===== Meal selection ===== */
function selectMeal(name, btn){
  showToast(name + ' added to your order');

  document.getElementById('successTitle').textContent = 'Meal Selected';
  document.getElementById('successSub').textContent = name + ' has been added to today\'s order.';
  openModal('successModal');

  if(btn){
    const original = btn.textContent;
    btn.textContent = '✔ Selected';
    btn.disabled = true;
    btn.style.opacity = '0.75';
    setTimeout(() => {
      btn.textContent = original;
      btn.disabled = false;
      btn.style.opacity = '1';
    }, 2500);
  }
}

/* ===== Generic modal open/close ===== */
function openModal(id){
  document.getElementById(id).classList.add('open');
}
function closeModal(id){
  document.getElementById(id).classList.remove('open');
}

/* ===== Emergency alert (matches sidebar.js) ===== */
function openEmergency(){
  alert("🚨 Emergency alert sent! Staff have been notified and are on their way.");
}

/* ===== Custom meal request ===== */
function openCustomMeal(){
  document.getElementById('customMealFormView').style.display = 'block';
  document.getElementById('customMealDoneView').style.display = 'none';
  document.getElementById('customMealText').value = '';
  openModal('customMealModal');
}

function sendCustomMeal(){
  const text = document.getElementById('customMealText').value.trim();
  if(!text){
    document.getElementById('customMealText').style.borderColor = 'var(--red-strong)';
    document.getElementById('customMealText').placeholder = 'Please describe your request before sending…';
    return;
  }
  document.getElementById('customMealFormView').style.display = 'none';
  document.getElementById('customMealDoneView').style.display = 'block';
  showToast('Custom meal request sent to the kitchen');
}

/* Close modals when clicking the dark overlay itself */
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', (e) => {
    if(e.target === overlay){
      closeModal(overlay.id);
    }
  });
});

/* ===== Dashboard: detailed health report ===== */
function openHealthReport(){
  openModal('healthReportModal');
}

/* ===== Health Profile: edit dietary restrictions ===== */
function openEditRestrictions(){
  document.getElementById('editRestrictionsFormView').style.display = 'block';
  document.getElementById('editRestrictionsDoneView').style.display = 'none';
  document.getElementById('editRestrictionsText').value = '';
  document.getElementById('editRestrictionsText').style.borderColor = '';
  openModal('editRestrictionsModal');
}

function addRestriction(){
  const textarea = document.getElementById('editRestrictionsText');
  const text = textarea.value.trim();
  if(!text){
    textarea.style.borderColor = 'var(--red-strong)';
    textarea.placeholder = 'Please describe the restriction before saving…';
    return;
  }

  const list = document.getElementById('dietList');
  const item = document.createElement('div');
  item.className = 'diet-good';
  item.innerHTML = '<h4>📝 New Note</h4><p>' + text.replace(/</g,'&lt;') + '</p>';
  list.appendChild(item);

  document.getElementById('editRestrictionsFormView').style.display = 'none';
  document.getElementById('editRestrictionsDoneView').style.display = 'block';
  showToast('Dietary restriction added');
}

/* ===== Meal Options: apply filters ===== */
/* ===== Meal Options: unified filter + search engine ===== */
let currentSearchQuery = '';

function updateMealVisibility(){
  const checked = Array.from(document.querySelectorAll('.filter-chip input:checked'))
    .map(cb => cb.nextElementSibling.textContent.trim());

  const cards = document.querySelectorAll('#mealGrid .meal-card');
  let visibleCount = 0;

  cards.forEach(card => {
    const tags = (card.dataset.tags || '').split(',').map(t => t.trim());
    const tagMatch = checked.length === 0 || checked.some(f => tags.includes(f));
    const name = card.querySelector('h4').textContent.toLowerCase();
    const searchMatch = !currentSearchQuery || name.includes(currentSearchQuery);
    const show = tagMatch && searchMatch;
    card.classList.toggle('hidden', !show);
    if(show) visibleCount++;
  });

  document.getElementById('mealEmptyState').style.display = visibleCount === 0 ? 'block' : 'none';
  return { visibleCount, checked };
}

function applyFilters(){
  const { visibleCount, checked } = updateMealVisibility();

  showToast('Filters applied' + (checked.length ? ': ' + checked.join(', ') : ''));

  document.getElementById('successTitle').textContent = 'Filters Applied';
  document.getElementById('successSub').textContent = checked.length
    ? 'Showing ' + visibleCount + ' meal' + (visibleCount === 1 ? '' : 's') + ' matching: ' + checked.join(', ') + '.'
    : 'Showing all ' + visibleCount + ' available meals.';
  openModal('successModal');
}

/* ===== Meal Options: A-Z food search autocomplete ===== */
const FOOD_ICONS = {
  'Apple Slices':'🍎','Asparagus Soup':'🍲','Avocado Toast':'🥑',
  'Banana Bread':'🍌','Beet Salad':'🥗','Broccoli Bake':'🥦','Butternut Squash Soup':'🍲',
  'Carrot Ginger Soup':'🍲','Cheese Omelette':'🍳','Chicken & Mash':'🍗','Cranberry Oatmeal':'🥣','Cucumber Salad':'🥗',
  'Dumplings':'🥟','Date & Walnut Loaf':'🍞',
  'Egg Salad':'🥚','Eggplant Bake':'🍆',
  'Fish Chowder':'🐟','Fruit Parfait':'🍨',
  'Grilled Chicken with Zucchini':'🍗','Green Bean Casserole':'🥗',
  'Herb-Roasted Vegetable & Grain Medley':'🥘','Honey Yogurt':'🍯',
  'Iced Berry Compote':'🍓','Italian Minestrone':'🍲',
  'Juice — Fresh Orange':'🧃','Juice — Apple':'🧃','Juice — Carrot':'🧃',
  'Kale Salad':'🥗','Kidney Bean Stew':'🍛',
  'Lentil Soup':'🍲','Lemon Herb Chicken':'🍋',
  'Mashed Sweet Potato':'🍠','Mango Smoothie':'🥭',
  'Noodle Soup':'🍜','Nutty Granola':'🥣',
  'Oatmeal with Fresh Berries':'🥣','Onion Soup':'🍲',
  'Pea Soup':'🍲','Poached Salmon with Steamed Greens':'🐟',
  'Quinoa & Roasted Beet Medley':'🥗','Quiche':'🥧',
  'Rice Pudding':'🍚','Roasted Turkey Breast':'🍗',
  'Sliced Turkey Breast with Green Beans':'🍗','Spinach Salad':'🥗','Squash Soup':'🍲',
  'Tender Herb Chicken & Mash':'🍗','Tofu Stir-Fry':'🥡',
  'Udon Noodle Soup':'🍜',
  'Vegetable & Tofu Stir-Fry':'🥡','Vanilla Pudding':'🍮',
  'Warm Oatmeal with Fresh Berries':'🥣','Watermelon Salad':'🍉','Wild Rice Pilaf':'🍚',
  'Yogurt Parfait':'🍨',
  'Zucchini Soup':'🍲'
};
const FOOD_LIST = Object.keys(FOOD_ICONS);

function getFoodIcon(name){
  return FOOD_ICONS[name] || '🍽';
}

function renderSearchSuggestions(query){
  const box = document.getElementById('searchSuggestions');
  const q = query.trim().toLowerCase();

  if(!q){
    box.classList.remove('open');
    box.innerHTML = '';
    return;
  }

  const matches = FOOD_LIST.filter(f => f.toLowerCase().startsWith(q)).slice(0, 8);

  if(matches.length === 0){
    box.classList.remove('open');
    box.innerHTML = '';
    return;
  }

  box.innerHTML = matches.map(name => {
    const highlighted = '<span class="match">' + name.slice(0, q.length) + '</span>' + name.slice(q.length);
    const icon = getFoodIcon(name);
    return '<div class="search-suggestion-item" onclick="selectSearchSuggestion(\'' + name.replace(/'/g, "\\'") + '\')">'
      + '<span class="sugg-icon">' + icon + '</span><span>' + highlighted + '</span></div>';
  }).join('');
  box.classList.add('open');
}

/* ===== Meal Options: pick-then-confirm selection list ===== */
let selectedMeals = [];

function selectSearchSuggestion(name){
  addSelectedMeal(name);

  const input = document.getElementById('mealSearchInput');
  input.value = '';
  currentSearchQuery = '';
  document.getElementById('searchSuggestions').classList.remove('open');
  document.getElementById('searchSuggestions').innerHTML = '';
  updateMealVisibility();
}

function addSelectedMeal(name){
  if(selectedMeals.includes(name)) return;
  selectedMeals.push(name);
  renderSelectedMealsList();
}

function removeSelectedMeal(name){
  selectedMeals = selectedMeals.filter(m => m !== name);
  renderSelectedMealsList();
}

function renderSelectedMealsList(){
  const bar = document.getElementById('selectedMealsBar');
  const list = document.getElementById('selectedMealsList');

  if(selectedMeals.length === 0){
    bar.style.display = 'none';
    list.innerHTML = '';
    return;
  }

  list.innerHTML = selectedMeals.map(name => {
    const icon = getFoodIcon(name);
    return '<span class="selected-meal-chip"><span class="chip-icon">' + icon + '</span>'
      + '<span>' + name + '</span>'
      + '<button type="button" class="chip-remove" aria-label="Remove ' + name + '" onclick="removeSelectedMeal(\'' + name.replace(/'/g, "\\'") + '\')">✕</button></span>';
  }).join('');
  bar.style.display = 'flex';
}

function confirmMealSelection(){
  if(selectedMeals.length === 0) return;

  const names = selectedMeals.slice();
  showToast(names.length + ' meal' + (names.length === 1 ? '' : 's') + ' confirmed');

  document.getElementById('successTitle').textContent = 'Meals Confirmed';
  document.getElementById('successSub').textContent = 'Your selection has been sent to the kitchen: ' + names.join(', ') + '.';
  openModal('successModal');

  selectedMeals = [];
  renderSelectedMealsList();
}

document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('mealSearchInput');
  if(input){
    input.addEventListener('input', function(){
      currentSearchQuery = this.value.trim().toLowerCase();
      renderSearchSuggestions(this.value);
      updateMealVisibility();
    });
    input.addEventListener('keydown', function(e){
      if(e.key === 'Enter'){
        document.getElementById('searchSuggestions').classList.remove('open');
        updateMealVisibility();
      }
    });
  }
  document.addEventListener('click', (e) => {
    if(!e.target.closest('.search-box')){
      document.getElementById('searchSuggestions').classList.remove('open');
    }
  });
});

/* ===== Health Profile: Mark as Given ===== */
function markDoseGiven(btn){
  btn.textContent = '✔ Given';
  btn.classList.add('confirmed');
  btn.disabled = true;
  showToast('Lisinopril marked as given');
}

/* ===== Daily Schedule: Done / Not Done ===== */
function setDayStatus(eventId, status){
  const li = document.getElementById(eventId);
  li.dataset.status = status;

  const doneBtn = li.querySelector('.done-btn');
  const notDoneBtn = li.querySelector('.notdone-btn');
  const title = li.querySelector('h4').textContent;

  if(status === 'done'){
    doneBtn.textContent = '✔ Done';
    notDoneBtn.disabled = false;
    doneBtn.disabled = true;
    showToast(title + ' marked as done');
  } else {
    notDoneBtn.textContent = '✕ Not Done';
    doneBtn.disabled = false;
    notDoneBtn.disabled = true;
    showToast(title + ' marked as not done');
  }
}

/* ===== Medication Schedule: Taken / Missed (locked, one-time only — used by all 4 doses) ===== */
function setRxStatusLocked(itemId, status){
  const el = document.getElementById(itemId);
  if(el.dataset.status !== 'pending') return; // already locked, ignore further clicks

  el.dataset.status = status;
  const takenBtn = el.querySelector('.taken');
  const missedBtn = el.querySelector('.missed');
  const name = el.querySelector('h4').textContent;

  takenBtn.disabled = true;
  missedBtn.disabled = true;

  if(status === 'taken'){
    takenBtn.textContent = '✔ Taken';
    showToast(name + ' marked as taken');
  } else {
    missedBtn.textContent = '✕ Missed';
    showToast(name + ' marked as missed');
  }
}

/* ===== Billing: Donation ===== */
const paymentMethodLabels = {
  'bkash': 'bKash',
  'nagad': 'Nagad',
  'visa': 'Visa',
  'mastercard': 'Mastercard',
  'bank': 'Bank Transfer',
  'new-card': 'a new card'
};

const donationForm = document.getElementById('donationForm');
if(donationForm){
  donationForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const amount = donationForm.amount.value;
    const method = paymentMethodLabels[donationForm.paymentMethod.value] || donationForm.paymentMethod.value;

    closeModal('donationOverlay');
    donationForm.reset();

    showToast('Donation of $' + amount + ' recorded');

    document.getElementById('successTitle').textContent = 'Thank You!';
    document.getElementById('successSub').textContent = 'Your donation of $' + amount + ' via ' + method + ' has been recorded.';
    openModal('successModal');
  });
}

/* ===== Billing: Pay Now ===== */
function payInvoice(btn){
  const original = btn.textContent;
  btn.textContent = '✔ Payment Sent';
  btn.disabled = true;
  showToast('Payment of $4,280 submitted');
  setTimeout(() => {
    btn.textContent = original;
    btn.disabled = false;
  }, 3000);
}