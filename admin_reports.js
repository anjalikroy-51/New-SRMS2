// Admin Reports Page - Load student reports
let students = [];
let currentReportData = null;

// DOM Elements
const studentSelect = document.getElementById("studentSelect");
const studentNameAdmin = document.getElementById("studentNameAdmin");
const studentIDAdmin = document.getElementById("studentIDAdmin");
const studentCourseAdmin = document.getElementById("studentCourseAdmin");
const cgpaAdmin = document.getElementById("cgpaAdmin");
const backlogsAdmin = document.getElementById("backlogsAdmin");
const statusAdmin = document.getElementById("statusAdmin");
const semesterSelectAdmin = document.getElementById("semesterSelectAdmin");
const gradesTableAdmin = document.querySelector("#gradesTableAdmin tbody");
const skillsListAdminView = document.getElementById("skillsListAdminView");
const certSkillTableAdmin = document.querySelector("#certSkillTableAdmin tbody");
const feedbackAdmin = document.getElementById("feedbackAdmin");
const timestampAdmin = document.getElementById("timestampAdmin");
const sgpaAdmin = document.getElementById("sgpaAdmin");
const cgpaFooterAdmin = document.getElementById("cgpaFooterAdmin");

// Initialize on page load
document.addEventListener("DOMContentLoaded", async () => {
  if (!requireAuth()) return;
  
  await loadAllStudents();
  loadStudentSelector();
  
  if (students.length > 0) {
    await loadStudentReport(students[0].studentId || students[0]._id);
  }

  // Event listeners
  if (studentSelect) {
    studentSelect.addEventListener("change", async () => {
      const selectedId = studentSelect.value;
      const student = students.find(s => 
        (s.studentId || s._id) === selectedId
      );
      if (student) {
        await loadStudentReport(student.studentId || student._id);
      }
    });
  }

  if (semesterSelectAdmin) {
    semesterSelectAdmin.addEventListener("change", () => {
      if (currentReportData) {
        updateAcademicTable(currentReportData);
      }
    });
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

// Load all students for selector
async function loadAllStudents() {
  try {
    students = await apiCall('/students');
  } catch (error) {
    console.error('Error loading students:', error);
    students = [];
  }
}

// Load student selector dropdown
function loadStudentSelector() {
  if (!studentSelect) return;
  
  studentSelect.innerHTML = "";
  students.forEach(std => {
    const opt = document.createElement("option");
    opt.value = std.studentId || std._id;
    opt.textContent = `${std.studentId || std._id} — ${std.name}`;
    studentSelect.appendChild(opt);
  });
}

// Load student report from backend
async function loadStudentReport(studentId) {
  try {
    const data = await apiCall(`/reports/admin/${studentId}?semester=all`);
    currentReportData = data;

    // Update student basic info
    if (studentNameAdmin) studentNameAdmin.textContent = data.student.name || "--";
    if (studentIDAdmin) studentIDAdmin.textContent = data.student.studentId || "--";
    if (studentCourseAdmin) studentCourseAdmin.textContent = data.student.course || "--";
    if (cgpaAdmin) cgpaAdmin.textContent = data.student.cgpa || "--";
    if (backlogsAdmin) backlogsAdmin.textContent = data.student.backlogs || "0";
    if (statusAdmin) statusAdmin.textContent = data.student.status || "--";

    // Update semester dropdown
    if (semesterSelectAdmin) {
      semesterSelectAdmin.innerHTML = '<option value="all">All Semesters</option>';
      (data.semesters || []).forEach(sem => {
        const option = document.createElement("option");
        option.value = sem.name;
        option.textContent = sem.name;
        semesterSelectAdmin.appendChild(option);
      });
    }

    updateAcademicTable(data);
    updateSkills(data.skills || []);
    updateCertificates(data.certificates || []);
    updateFeedback(data.feedback || {});

  } catch (error) {
    console.error('Error loading student report:', error);
    alert('Failed to load student report. Please try again.');
  }
}

// Update academic table
function updateAcademicTable(data) {
  if (!gradesTableAdmin) return;
  
  const selectedSem = semesterSelectAdmin ? semesterSelectAdmin.value : 'all';
  gradesTableAdmin.innerHTML = "";

  let academic = data.academic || [];
  
  // Filter by semester if needed
  if (selectedSem !== "all" && data.semesters) {
    const selectedSemester = data.semesters.find(s => s.name === selectedSem);
    if (selectedSemester && selectedSemester.subjects) {
      academic = [];
      const subjects = selectedSemester.subjects.split(',').filter(s => s.trim());
      subjects.forEach(sub => {
        const parts = sub.split(':');
        if (parts.length === 2) {
          const [subject, grade] = parts.map(s => s.trim());
          academic.push({ subject, grade });
        }
      });
    }
  }

  if (academic.length === 0) {
    gradesTableAdmin.innerHTML = `<tr><td colspan="2">No data available</td></tr>`;
  } else {
    academic.forEach(item => {
      const row = document.createElement("tr");
      row.innerHTML = `<td>${item.subject}</td><td>${item.grade}</td>`;
      gradesTableAdmin.appendChild(row);
    });
  }

  // Update SGPA and CGPA
  const selectedSemester = data.semesters?.find(s => s.name === selectedSem);
  if (sgpaAdmin) {
    sgpaAdmin.textContent = selectedSemester?.sgpa || data.sgpa || "--";
  }
  if (cgpaFooterAdmin) {
    cgpaFooterAdmin.textContent = data.cgpa || "--";
  }
}

// Update skills list
function updateSkills(skills) {
  if (!skillsListAdminView) return;
  
  skillsListAdminView.innerHTML = "";
  skills.forEach(skill => {
    const li = document.createElement("li");
    li.textContent = `${skill.name} (${skill.level}%)`;
    skillsListAdminView.appendChild(li);
  });
}

// Update certificates table
function updateCertificates(certificates) {
  if (!certSkillTableAdmin) return;
  
  certSkillTableAdmin.innerHTML = "";
  
  if (certificates.length === 0) {
    certSkillTableAdmin.innerHTML = `<tr><td colspan="4">No certificates available</td></tr>`;
    return;
  }

  certificates.forEach(cert => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>Certificate</td>
      <td>${cert.title || 'N/A'}</td>
      <td>${cert.status || 'Pending'}</td>
      <td>${cert.adminComments || '--'}</td>
    `;
    certSkillTableAdmin.appendChild(tr);
  });
}

// Update feedback
function updateFeedback(feedback) {
  if (feedbackAdmin) {
    feedbackAdmin.textContent = feedback.text || "No feedback yet.";
  }
  if (timestampAdmin) {
    timestampAdmin.textContent = feedback.lastUpdated || "--";
  }
}
