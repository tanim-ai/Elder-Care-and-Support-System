
document.addEventListener('DOMContentLoaded', function () {

  var tabs = document.querySelectorAll('.role-tab');
  var form = document.querySelector('form[data-form]');
  var description = document.querySelector('.role-description');

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var role = tab.getAttribute('data-role');

      tabs.forEach(function (t) {
        t.classList.remove('active');
        t.setAttribute('aria-checked', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-checked', 'true');

      if (form) {
        form.setAttribute('data-form', role);
      }

      if (description) {
        description.textContent = tab.getAttribute('data-description') || '';
      }
    });
  });

  document.querySelectorAll('[data-toggle-pw]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var input = document.getElementById(btn.getAttribute('data-toggle-pw'));
      if (!input) return;
      input.type = input.type === 'password' ? 'text' : 'password';
    });
  });

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var password = document.getElementById('password');
      var confirmPassword = document.getElementById('confirmPassword');
      if (password && confirmPassword && password.value !== confirmPassword.value) {
        alert('Passwords do not match. Please try again.');
        return;
      }

      var role = form.getAttribute('data-form') || 'guardian';
      var action = form.getAttribute('data-action') || 'Signed in';
      alert(action + ' as ' + role.charAt(0).toUpperCase() + role.slice(1) + '. Connect this form to your authentication backend to go live.');
    });
  }

});