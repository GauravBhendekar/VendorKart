// login.js

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const alertBox = document.getElementById('alertBox');

  // Function to display messages in the alert box
  function showAlert(message, type) {
    alertBox.textContent = message;
    alertBox.classList.remove('hidden', 'text-green-600', 'text-red-600');
    if (type === 'success') {
      alertBox.classList.add('text-green-600', 'bg-green-100');
    } else if (type === 'error') {
      alertBox.classList.add('text-red-600', 'bg-red-100');
    }
  }

  // Event listener for login form submission
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault(); // Prevent default form submission

      // Clear previous alerts
      alertBox.classList.add('hidden');
      alertBox.textContent = '';
      alertBox.classList.remove('bg-green-100', 'bg-red-100'); // Clear background colors

      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value.trim();

      // Client-side validation
      if (!email || !password) {
        showAlert('❌ Please enter both email and password.', 'error');
        return;
      }

      try {
        const response = await fetch('http://localhost:3000/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
          // Login successful
          showAlert(`✅ ${data.message} Welcome, ${data.user.vendor_name}!`, 'success');
          
          // Store user email in localStorage
          localStorage.setItem('vendorEmail', data.user.email);
          // Optional: You could also store vendor_name if home.html needs it directly without another fetch
          // localStorage.setItem('vendorName', data.user.vendor_name);

          // Redirect to home page after a short delay
          setTimeout(() => {
            window.location.href = `home.html`; // Redirect to home.html, which will read email from localStorage
          }, 1500);
        } else {
          // Login failed
          showAlert(`❌ ${data.error || 'Login failed. Please try again.'}`, 'error');
        }
      } catch (error) {
        // Network or unexpected error
        console.error('Login error:', error);
        showAlert('❌ Network error. Could not connect to the server. Please ensure the server is running.', 'error');
      }
    });
  }
});
