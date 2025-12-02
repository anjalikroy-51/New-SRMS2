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

// Login form handling
document.getElementById("loginForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (role === "Student") {
    window.location.href = "dashboard.html"; // Redirect to Student Dashboard
  } else if (role === "Admin") {
    window.location.href = "admin_dashboard.html"; // Redirect to Admin Dashboard
  }

// alert(`Logging in as ${role}:\nUsername: ${username}\nPassword: ${password}`);//
});

// Signup form handling
document.getElementById("signupForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const newUser = document.getElementById("newUsername").value;
  const newEmail = document.getElementById("newEmail").value;
  const newPass = document.getElementById("newPassword").value;

if (role === "Student") {
    window.location.href = "dashboard.html"; // Redirect after signup
  } else if (role === "Admin") {
    window.location.href = "admin_dashboard.html"; // Redirect after signup
  }
 // alert(`Account created:\nUsername: ${newUser}\nEmail: ${newEmail}\nPassword: ${newPass}`);//
});
