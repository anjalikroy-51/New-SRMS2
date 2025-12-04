document.addEventListener("DOMContentLoaded", () => {
  if (!requireAuth()) return;
  
  loadStudentProfile();
  loadReportsData();

  const semesterSelect = document.getElementById("semesterSelect");
  if (semesterSelect) {
    semesterSelect.addEventListener("change", loadReportsData);
  }

  // Logout button
  const logoutBtn = document.querySelector(".logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = 'Login.html';
    });
  }
});


// 🔹 1️⃣ Load Student Profile Data
async function loadStudentProfile() {
  try {
    const student = await apiCall('/students/profile/me');
    
    // Update profile info
    const nameEl = document.getElementById("studentName");
    const idEl = document.getElementById("studentID");
    const courseEl = document.getElementById("studentCourse");
    
    if (nameEl) nameEl.textContent = student.name || "N/A";
    if (idEl) idEl.textContent = student.studentId || "N/A";
    if (courseEl) courseEl.textContent = student.course || "N/A";
    
    // Update profile image
    if (student.photo) {
      const profileImg = document.getElementById("profileImage");
      if (profileImg) {
        profileImg.src = `http://localhost:3000${student.photo}`;
      }
    }
  } catch (error) {
    console.error('Error loading student profile:', error);
  }
}

// === Profile Image Upload Function ===
const uploadProfileEl = document.getElementById("uploadProfile");
if (uploadProfileEl) {
  uploadProfileEl.addEventListener("change", async function(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = function(e) {
      const imgData = e.target.result;
      const profileImg = document.getElementById("profileImage");
      if (profileImg) {
        profileImg.src = imgData;
      }
    };
    reader.readAsDataURL(file);

    // Upload to backend
    try {
      const formData = new FormData();
      formData.append('photo', file);
      
      const result = await apiUpload('/settings/photo', formData, { method: 'POST' });
      
      if (result.photo) {
        const profileImg = document.getElementById("profileImage");
        if (profileImg) {
          profileImg.src = `http://localhost:3000${result.photo}`;
        }
      }
    } catch (error) {
      console.error('Error uploading profile photo:', error);
      alert('Failed to upload profile photo. Please try again.');
    }
  });
}

// === Load Saved Profile Image ===
function loadSavedProfileImage() {
  // This is now handled by loadStudentProfile
}



// 🔹 2️⃣ Load Report / Grades / Skills / Feedback
async function loadReportsData() {
  const semester = document.getElementById("semesterSelect").value;

  try {
    const data = await apiCall(`/reports/student?semester=${semester || 'all'}`);

    updateGrades(data.academic || []);
    updateSGPA_CGPA(data.sgpa, data.cgpa);
    updateSkills(data.skills || []);
    updateFeedback(data.feedback || {});

    if (data.academic && data.academic.length > 0) {
      loadAcademicChart(data.academic);
    }
    if (data.skills && data.skills.length > 0) {
      loadSkillsRadarChart(data.skills);
    }

    // Update semester dropdown
    updateSemesterDropdown(data.semesters || []);

  } catch (err) {
    console.error("Report loading failed:", err);
    // Show error message
    const tableBody = document.querySelector("#gradesTable tbody");
    if (tableBody) {
      tableBody.innerHTML = `<tr><td colspan="2">Error loading report data</td></tr>`;
    }
  }
}

// Update semester dropdown
function updateSemesterDropdown(semesters) {
  const select = document.getElementById("semesterSelect");
  if (!select) return;
  
  const currentValue = select.value;
  select.innerHTML = '<option value="all">All Semesters</option>';
  
  semesters.forEach(sem => {
    const option = document.createElement("option");
    option.value = sem.name;
    option.textContent = sem.name;
    select.appendChild(option);
  });
  
  if (currentValue) {
    select.value = currentValue;
  }
}


// 🔹 3️⃣ Academic Table Handling
function updateGrades(academic) {
  const tableBody = document.querySelector("#gradesTable tbody");
  tableBody.innerHTML = "";

  academic.forEach(row => {
    tableBody.innerHTML += `
      <tr>
        <td>${row.subject}</td>
        <td>${row.grade}</td>
      </tr>`;
  });
}


// 🔹 4️⃣ Academic SGPA & CGPA Update
function updateSGPA_CGPA(sgpa, cgpa) {
  document.getElementById("sgpa").innerText = sgpa || "--";
  document.getElementById("cgpa").innerText = cgpa || "--";
}


// 🔹 5️⃣ Skill Display + Progress Bars
function updateSkills(skills) {
  const skillsList = document.getElementById("skillsList");
  skillsList.innerHTML = "";

  skills.forEach(skill => {
    skillsList.innerHTML += `
      <li>
        🔹 ${skill.name}
        <div class="progress-container">
          <div class="progress-bar" style="width:${skill.level}%"></div>
        </div>
        <span>${skill.level}%</span>
      </li>`;
  });
}


// 🔹 6️⃣ Admin Feedback Update
function updateFeedback(feedback) {
  document.getElementById("feedback").innerText = feedback.text || "No feedback yet.";
  document.getElementById("timestamp").innerText = feedback.lastUpdated || "--";
}


// 🔹 7️⃣ BAR CHART - Academic Grades
let academicChart;
function loadAcademicChart(academic) {
  const ctx = document.getElementById("academicChart");

  if (academicChart) academicChart.destroy();

  academicChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: academic.map(x => x.subject),
      datasets: [{
        label: "Grade Value",
        data: academic.map(x => x.gradeValue || 0),
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}


// 🔹 8️⃣ RADAR CHART - Skills
let radarChart;
function loadSkillsRadarChart(skills) {
  const ctx = document.getElementById("skillsRadarChart");

  if (radarChart) radarChart.destroy();

  radarChart = new Chart(ctx, {
    type: "radar",
    data: {
      labels: skills.map(x => x.name),
      datasets: [{
        label: "Skill Level",
        data: skills.map(x => x.level),
        borderWidth: 2,
        fill: true
      }]
    },
    options: {
      responsive: true,
      scales: {
        r: {
          suggestedMin: 0,
          suggestedMax: 100
        }
      }
    }
  });
}
