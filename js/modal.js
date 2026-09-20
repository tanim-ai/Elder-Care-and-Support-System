function openModal() {
  document.getElementById('careModal').classList.add('active');
}
function closeModal() {
  document.getElementById('careModal').classList.remove('active');
}
function handleOverlayClick(e) {
  if (e.target === document.getElementById('careModal')) closeModal();
}
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});