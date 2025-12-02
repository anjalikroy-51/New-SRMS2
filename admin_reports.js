// Load student selector
function loadStudentSelector() {
  studentSelect.innerHTML = "";
  students.forEach(std => {
    const opt = document.createElement("option");
    opt.value = std.id;
    opt.textContent = `${std.id} — ${std.name}`;
    studentSelect.appendChild(opt);
  });
}

// Load student report
function loadStudentReport(studentId) {
  const std = students.find(s => s.id === studentId);
  if (!std) return;

  studentNameAdmin.textContent = std.name;
  studentIDAdmin.textContent = std.id;
  studentCourseAdmin.textContent = std.course;
  cgpaAdmin.textContent = std.cgpa ?? "--";
  backlogsAdmin.textContent = std.backlogs ?? "0";
  statusAdmin.textContent = std.status;

  semesterSelectAdmin.innerHTML = `<option value="all">All Semesters</option>`;
  (std.semesters || []).forEach(sem =>
    semesterSelectAdmin.innerHTML += `<option value="${sem.name}">${sem.name}</option>`
  );

  updateAcademicTable(std);
  updateSkills(std);
  updateCertificates(std);
  updateFeedback(std);
}

function updateAcademicTable(std) {
  const selectedSem = semesterSelectAdmin.value;
  gradesTableAdmin.innerHTML = "";

  let filtered = std.semesters || [];

  if (selectedSem !== "all") {
    filtered = filtered.filter(s => s.name === selectedSem);
  }

  if (filtered.length === 0) {
    gradesTableAdmin.innerHTML = `<tr><td colspan="2">No data</td></tr>`;
  } else {
    filtered.forEach(sem => {
      sem.subjects.split(",").forEach(sub => {
        const [subject, grade] = sub.split(":");
        const row = document.createElement("tr");
        row.innerHTML = `<td>${subject}</td><td>${grade}</td>`;
        gradesTableAdmin.appendChild(row);
      });
    });
  }

  sgpaAdmin.textContent = filtered[0]?.sgpa ?? "--";
  cgpaFooterAdmin.textContent = std.cgpa ?? "--";
}

function updateSkills(std) {
  const skills = std.skills || [];
  skillsListAdminView.innerHTML = "";
  skills.forEach(s => {
    const li = document.createElement("li");
    li.textContent = `${s.name} (${s.level}%)`;
    skillsListAdminView.appendChild(li);
  });
}

function updateCertificates(std) {
  certSkillTableAdmin.innerHTML = "";
  (std.skills || []).forEach(sk => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>Skill</td>
      <td>${sk.name}</td>
      <td>Approved</td>
      <td>--</td>
    `;
    certSkillTableAdmin.appendChild(tr);
  });
}

function updateFeedback(std) {
  feedbackAdmin.textContent = std.feedback || "--";
  timestampAdmin.textContent = std.feedbackUpdatedAt || "--";
}

// Event Listeners
studentSelect.addEventListener("change", () => loadStudentReport(studentSelect.value));
semesterSelectAdmin.addEventListener("change", () => loadStudentReport(studentSelect.value));

// Initialize
loadStudentSelector();
if (students.length > 0) {
  loadStudentReport(students[0].id);
}
