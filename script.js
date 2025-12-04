// Role toggle
const studentBtn = document.getElementById("studentBtn");
const adminBtn = document.getElementById("adminBtn");
let role = "Student"; // Default

studentBtn.addEventListener("click", () => {
  role = "Student";
  studentBtn.classList.add("active");
  adminBtn.classList.remove("active");
});

adminBtn.addEventListener("click", () => {
  role = "Admin";
  adminBtn.classList.add("active");
  studentBtn.classList.remove("active");
});

// Form switching (Login <-> Signup)
const loginBox = document.getElementById("loginBox");
const signupBox = document.getElementById("signupBox");
const signupLink = document.getElementById("signupLink");
const loginLink = document.getElementById("loginLink");

signupLink.addEventListener("click", (e) => {
  e.preventDefault();
  loginBox.classList.remove("active");
  signupBox.classList.add("active");
});

loginLink.addEventListener("click", (e) => {
  e.preventDefault();
  signupBox.classList.remove("active");
  loginBox.classList.add("active");
});

// Login form handling with AJAX
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const userRole = role === "Student" ? "student" : "admin";

  try {
    const data = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password, role: userRole })
    });

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    if (role === "Student") {
      window.location.href = "dashboard.html";
    } else if (role === "Admin") {
      window.location.href = "admin_dashboard.html";
    }
  } catch (error) {
    alert(error.message || 'Login failed. Please check your credentials.');
  }
});

// Signup form handling with AJAX
document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const newUser = document.getElementById("newUsername").value;
  const newEmail = document.getElementById("newEmail").value;
  const newPass = document.getElementById("newPassword").value;
  const userRole = role === "Student" ? "student" : "admin";

  try {
    const data = await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username: newUser, email: newEmail, password: newPass, role: userRole })
    });

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    alert('Account created successfully!');
    
    if (role === "Student") {
      window.location.href = "dashboard.html";
    } else if (role === "Admin") {
      window.location.href = "admin_dashboard.html";
    }
  } catch (error) {
    alert(error.message || 'Registration failed. Please try again.');
  }
});
