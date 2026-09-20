// CareDirect — role-based login interactions

document.addEventListener('DOMContentLoaded', function () {

  var roleCopy = {
    guardian: 'Family member or care coordinator — sign in with your email and password.',
    resident: 'Care home resident — sign in with your email and password.',
    staff: 'Kitchen and care staff — sign in with your email and password.',
    admin: 'Facility administrator — sign in with your email and password.'
  };

  // Role-based redirect URLs
  var roleRedirects = {
    guardian: '../dashboard.html',
    resident: '../Resident/caredirect-portal',
    staff: '../Kitchen/Kitchen Dashboard/Kitchen Dashboard/index.html',
    admin: '../Admin/CareDirectUIadmin/CareDirect UI/index.html'
  };

  var tabs = document.querySelectorAll('.role-tab');
  var form = document.getElementById('loginForm');
  var description = document.getElementById('roleDescription');
  var selectedRole = 'guardian'; // Default role

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var role = tab.getAttribute('data-role');
      selectedRole = role; // Store selected role

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

  // Toggle password visibility
  document.querySelectorAll('[data-toggle-pw]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var input = document.getElementById(btn.getAttribute('data-toggle-pw'));
      if (!input) return;
      input.type = input.type === 'password' ? 'text' : 'password';
    });
  });

  // Login submit handling with role-based redirection
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      
      var role = form.getAttribute('data-form') || 'guardian';
      var email = document.getElementById('email').value;
      var password = document.getElementById('password').value;

      // Basic validation
      if (!email || !password) {
        alert('Please enter both email and password.');
        return;
      }

      // For demo purposes, we'll show a success message and redirect
      // In production, you would validate credentials with a backend
      var roleDisplay = role.charAt(0).toUpperCase() + role.slice(1);
      alert('Signed in as ' + roleDisplay + '. Redirecting to your dashboard...');

      // Redirect based on role
      var redirectUrl = roleRedirects[role];
      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        // Fallback if role not found
        window.location.href = '../Homepage/index.html';
      }
    });
  }

});