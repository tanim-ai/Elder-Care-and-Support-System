document.addEventListener('DOMContentLoaded', function () {

  var roleCopy = {
    guardian: 'Family member or care coordinator — sign in with your email and password.',
    resident: 'Care home resident — sign in with your email and password.',
    staff: 'Kitchen and care staff — sign in with your email and password.',
    admin: 'Facility administrator — sign in with your email and password.'
  };

  var roleRedirects = {
    guardian: '../dashboard.html',
    resident: '../Resident/caredirect-portal',
    staff: '../Kitchen/Kitchen Dashboard/Kitchen Dashboard/index.html',
    admin: '../Admin/CareDirectUIadmin/CareDirect UI/index.html'
  };

  var tabs = document.querySelectorAll('.role-tab');
  var form = document.getElementById('loginForm');
  var description = document.getElementById('roleDescription');
  var selectedRole = 'guardian';

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var role = tab.getAttribute('data-role');
      selectedRole = role;

      tabs.forEach(function (t) {
        t.classList.remove('active');
        t.setAttribute('aria-checked', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-checked', 'true');

      if (form) {
        form.setAttribute('data-form', role);
      }

      if (description && roleCopy[role]) {
        description.textContent = roleCopy[role];
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

});