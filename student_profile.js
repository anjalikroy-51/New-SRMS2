// handle sidebar photo upload
const photoIconBtn = document.querySelector(".photo-icon");
const sidebarUpload = document.getElementById("sidebarUpload");
const sidebarPhoto = document.getElementById("sidebarPhoto");

photoIconBtn.addEventListener("click", () => sidebarUpload.click());

sidebarUpload.addEventListener("change", function () {
  const file = this.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    sidebarPhoto.src = reader.result;
  };
  reader.readAsDataURL(file);
});

// keep sidebar basic info in sync with form inputs
const fullNameInput = document.getElementById("fullName");
const studentIdInput = document.getElementById("studentId");
const courseInput = document.getElementById("course");

const sidebarName = document.getElementById("sidebarName");
const sidebarId = document.getElementById("sidebarId");
const sidebarCourse = document.getElementById("sidebarCourse");

fullNameInput.addEventListener("input", () => {
  sidebarName.textContent = fullNameInput.value || "Anaya Singh";
});
studentIdInput.addEventListener("input", () => {
  sidebarId.textContent = studentIdInput.value || "STU2025";
});
courseInput.addEventListener("input", () => {
  sidebarCourse.textContent = courseInput.value || "B.Tech – AI & Data Science";
});

// prevent actual submit for now (you can replace with backend later)
document.querySelector(".profile-form").addEventListener("submit", (e) => {
  e.preventDefault();
  alert("Profile data captured. You can now connect this form to your C++ + Oracle backend.");
});
