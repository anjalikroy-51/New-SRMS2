document.addEventListener("DOMContentLoaded", () => {
  loadSavedProfileImage(); // <-- Added here
  loadStudentProfile();
  loadReportsData();

  document.getElementById("semesterSelect").addEventListener("change", loadReportsData);
});


// 🔹 1️⃣ Load Student Profile Data
// === Profile Image Upload Function ===
document.getElementById("uploadProfile").addEventListener("change", function(event) {
  const file = event.target.files[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const imgData = e.target.result;
      localStorage.setItem("studentProfileImage", imgData);
      document.getElementById("profileImage").src = imgData;
    };
    reader.readAsDataURL(file);
  }
});

// === Load Saved Profile Image ===
function loadSavedProfileImage() {
  const savedImg = localStorage.getItem("studentProfileImage");
  if (savedImg) {
    document.getElementById("profileImage").src = savedImg;
  }
}



// 🔹 2️⃣ Load Report / Grades / Skills / Feedback
async function loadReportsData() {
  const semester = document.getElementById("semesterSelect").value;

  try {
    const response = await fetch(
      `http://localhost:5000/api/student/report?semester=${semester}`
    );
    const data = await response.json();

    updateGrades(data.academic);
    updateSGPA_CGPA(data.sgpa, data.cgpa);
    updateSkills(data.skills);
    updateFeedback(data.feedback);

    loadAcademicChart(data.academic);
    loadSkillsRadarChart(data.skills);

  } catch (err) {
    console.error("Report loading failed:", err);
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
