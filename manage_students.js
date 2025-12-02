// Simple in-memory store (later replace with API calls)
let students = [
  {
    id: "STU2025",
    name: "Anaya Singh",
    course: "B.Tech AI & DS",
    cgpa: 8.7,
    backlogs: 0,
    status: "Active",
    lastUpdated: "2025-11-20 10:15",
    semesters: [
      { name: "Semester 1", sgpa: 8.4, subjects: "Maths:A, Programming:A-, Physics:B+" },
      { name: "Semester 2", sgpa: 9.0, subjects: "Data Structures:A, DBMS:A-, OS:B+" }
    ],
    skills: [
      { name: "Python", level: 85 },
      { name: "Data Structures", level: 78 },
      { name: "Machine Learning", level: 70 }
    ],
    feedback: "Excellent academic consistency. Can participate in more hackathons.",
    feedbackUpdatedAt: "2025-11-22T15:30"
  }
];

let verifications = [
  {
    id: 1,
    studentId: "STU2025",
    studentName: "Anaya Singh",
    type: "Certificate",
    title: "Smart India Hackathon 2025",
    submittedOn: "2025-11-10",
    status: "Pending"
  }
];

let editingIndex = null; // index of student being edited

// DOM references
const studentTableBody = document.getElementById("studentTableBody");
const verificationTableBody = document.getElementById("verificationTableBody");
const totalStudentsEl = document.getElementById("totalStudents");
const avgCgpaEl = document.getElementById("avgCgpa");
const pendingVerificationsEl = document.getElementById("pendingVerifications");

const searchInput = document.getElementById("searchInput");
const courseFilter = document.getElementById("courseFilter");
const statusFilter = document.getElementById("statusFilter");

// Modal elements
const studentModal = document.getElementById("studentModal");
const modalTitle = document.getElementById("modalTitle");
const closeModalBtn = document.getElementById("closeModal");

const studentIdInput = document.getElementById("studentIdInput");
const studentNameInput = document.getElementById("studentNameInput");
const courseSelect = document.getElementById("courseSelect");
const statusSelect = document.getElementById("statusSelect");
const cgpaInput = document.getElementById("cgpaInput");
const backlogsInput = document.getElementById("backlogsInput");

const semesterNameInput = document.getElementById("semesterNameInput");
const sgpaInput = document.getElementById("sgpaInput");
const subjectsInput = document.getElementById("subjectsInput");
const semesterList = document.getElementById("semesterList");

const skillNameInput = document.getElementById("skillNameInput");
const skillLevelInput = document.getElementById("skillLevelInput");
const skillsListAdmin = document.getElementById("skillsListAdmin");

const feedbackInput = document.getElementById("feedbackInput");
const feedbackDateInput = document.getElementById("feedbackDateInput");

const btnAddSemester = document.getElementById("btnAddSemester");
const btnAddSkill = document.getElementById("btnAddSkill");
const btnSaveStudent = document.getElementById("btnSaveStudent");
const btnDeleteStudent = document.getElementById("btnDeleteStudent");
const btnPreviewReport = document.getElementById("btnPreviewReport");

const btnAddStudent = document.getElementById("btnAddStudent");
const btnClearAll = document.getElementById("btnClearAll");

const btnGenerateReport = document.getElementById("btnGenerateReport");
const btnBackup = document.getElementById("btnBackup");
const btnRestore = document.getElementById("btnRestore");
const reportOutput = document.getElementById("reportOutput");

const toast = document.getElementById("toast");

// Helpers
function showToast(message) {
  toast.textContent = message;
  toast.classList.remove("hidden");
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
    toast.classList.add("hidden");
  }, 2000);
}

function formatDateTime(dtString) {
  if (!dtString) return "--";
  try {
    const d = new Date(dtString);
    return d.toLocaleString();
  } catch {
    return dtString;
  }
}

// Rendering
function renderStudents() {
  const search = (searchInput.value || "").toLowerCase();
  const course = courseFilter.value;
  const status = statusFilter.value;

  studentTableBody.innerHTML = "";

  let filtered = students.filter(s => {
    const matchesSearch =
      s.name.toLowerCase().includes(search) ||
      s.id.toLowerCase().includes(search);

    const matchesCourse = !course || s.course === course;
    const matchesStatus = !status || s.status === status;

    return matchesSearch && matchesCourse && matchesStatus;
  });

  filtered.forEach((s, index) => {
    const tr = document.createElement("tr");

    const cgpaText = s.cgpa != null ? s.cgpa.toFixed(2) : "--";
    const statusClass =
      s.status === "Active"
        ? "active"
        : s.status === "On Hold"
        ? "hold"
        : "grad";

    tr.innerHTML = `
      <td>${s.id}</td>
      <td>${s.name}</td>
      <td>${s.course}</td>
      <td>${cgpaText}</td>
      <td>${s.backlogs ?? 0}</td>
      <td><span class="status-pill ${statusClass}">${s.status}</span></td>
      <td>${s.lastUpdated || "--"}</td>
      <td>
        <button class="btn secondary small" data-action="edit" data-index="${index}">✏️ Edit</button>
      </td>
    `;

    studentTableBody.appendChild(tr);
  });

  // Summary
  totalStudentsEl.textContent = students.length;

  if (students.length > 0) {
    const sumCgpa = students.reduce((sum, s) => sum + (s.cgpa || 0), 0);
    avgCgpaEl.textContent = (sumCgpa / students.length).toFixed(2);
  } else {
    avgCgpaEl.textContent = "--";
  }
}

function renderVerifications() {
  verificationTableBody.innerHTML = "";
  let pendingCount = 0;

  verifications.forEach((v, index) => {
    if (v.status === "Pending") pendingCount++;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${v.studentName} (${v.studentId})</td>
      <td>${v.type}</td>
      <td>${v.title}</td>
      <td>${v.submittedOn}</td>
      <td>${v.status}</td>
      <td>
        <button class="btn small secondary" data-verif="approve" data-index="${index}">✅ Approve</button>
        <button class="btn small danger-outline" data-verif="reject" data-index="${index}">❌ Reject</button>
      </td>
    `;
    verificationTableBody.appendChild(tr);
  });

  pendingVerificationsEl.textContent = pendingCount;
}

// Modal logic
function openModal(mode, index = null) {
  editingIndex = index;
  resetModalFields();

  if (mode === "add") {
    modalTitle.textContent = "Add New Student";
    btnDeleteStudent.style.display = "none";
  } else {
    modalTitle.textContent = "Edit Student";
    btnDeleteStudent.style.display = "inline-flex";
    populateModalWithStudent(students[index]);
  }

  studentModal.classList.remove("hidden");
}

function closeModal() {
  studentModal.classList.add("hidden");
  editingIndex = null;
}

function resetModalFields() {
  studentIdInput.value = "";
  studentNameInput.value = "";
  courseSelect.value = "BCA";
  statusSelect.value = "Active";
  cgpaInput.value = "";
  backlogsInput.value = "";

  semesterNameInput.value = "";
  sgpaInput.value = "";
  subjectsInput.value = "";
  semesterList.innerHTML = "";

  skillNameInput.value = "";
  skillLevelInput.value = "";
  skillsListAdmin.innerHTML = "";

  feedbackInput.value = "";
  feedbackDateInput.value = "";

  // Default tab
  document.querySelectorAll(".tab-button").forEach(btn => btn.classList.remove("active"));
  document.querySelectorAll(".tab-panel").forEach(panel => panel.classList.remove("active"));
  document.querySelector(".tab-button[data-tab='tab-personal']").classList.add("active");
  document.getElementById("tab-personal").classList.add("active");
}

function populateModalWithStudent(student) {
  studentIdInput.value = student.id;
  studentNameInput.value = student.name;
  courseSelect.value = student.course;
  statusSelect.value = student.status;
  cgpaInput.value = student.cgpa ?? "";
  backlogsInput.value = student.backlogs ?? 0;

  // Semesters
  semesterList.innerHTML = "";
  (student.semesters || []).forEach((sem, idx) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${sem.name} – SGPA: ${sem.sgpa}</span>
      <button data-sem-index="${idx}">🗑</button>
    `;
    semesterList.appendChild(li);
  });

  // Skills
  skillsListAdmin.innerHTML = "";
  (student.skills || []).forEach((sk, idx) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${sk.name}: ${sk.level}%</span>
      <button data-skill-index="${idx}">🗑</button>
    `;
    skillsListAdmin.appendChild(li);
  });

  // Feedback
  feedbackInput.value = student.feedback || "";
  if (student.feedbackUpdatedAt) {
    feedbackDateInput.value = student.feedbackUpdatedAt;
  }
}

// Save student data from modal
function saveStudent() {
  const now = new Date();

  const newStudent = {
    id: studentIdInput.value.trim(),
    name: studentNameInput.value.trim(),
    course: courseSelect.value,
    status: statusSelect.value,
    cgpa: cgpaInput.value ? parseFloat(cgpaInput.value) : null,
    backlogs: backlogsInput.value ? parseInt(backlogsInput.value) : 0,
    lastUpdated: now.toLocaleString(),
    semesters: [],
    skills: [],
    feedback: feedbackInput.value.trim(),
    feedbackUpdatedAt: feedbackDateInput.value || now.toISOString()
  };

  // Semesters from current list DOM
  semesterList.querySelectorAll("li").forEach(li => {
    const text = li.firstElementChild.textContent; // "Semester 1 – SGPA: 8.4"
    const [namePart, sgpaPart] = text.split("– SGPA:");
    const name = namePart.trim();
    const sgpa = parseFloat((sgpaPart || "").trim());
    const subjects = ""; // For simplicity we are not storing subjects here; but you can extend using dataset if needed
    newStudent.semesters.push({ name, sgpa, subjects });
  });

  // Skills from DOM
  skillsListAdmin.querySelectorAll("li").forEach(li => {
    const text = li.firstElementChild.textContent; // "Python: 85%"
    const [name, levelPart] = text.split(":");
    const level = parseInt((levelPart || "").replace("%", "").trim());
    newStudent.skills.push({ name: name.trim(), level });
  });

  if (!newStudent.id || !newStudent.name) {
    alert("Student ID and Name are required.");
    return;
  }

  if (editingIndex == null) {
    students.push(newStudent);
  } else {
    students[editingIndex] = newStudent;
  }

  renderStudents();
  showToast("Student saved (will reflect in reports after backend sync)");
  closeModal();
}

// Events

// Tab switching
document.querySelectorAll(".tab-button").forEach(btn => {
  btn.addEventListener("click", () => {
    const tabId = btn.dataset.tab;
    document.querySelectorAll(".tab-button").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach(panel => panel.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(tabId).classList.add("active");
  });
});

// Add / Update Semester (simple append)
btnAddSemester.addEventListener("click", () => {
  const name = semesterNameInput.value.trim();
  const sgpa = sgpaInput.value.trim();

  if (!name || !sgpa) {
    alert("Semester name and SGPA are required.");
    return;
  }

  const li = document.createElement("li");
  li.innerHTML = `
    <span>${name} – SGPA: ${sgpa}</span>
    <button>🗑</button>
  `;
  semesterList.appendChild(li);

  semesterNameInput.value = "";
  sgpaInput.value = "";
  subjectsInput.value = "";

  // Delete listener
  li.querySelector("button").addEventListener("click", () => {
    li.remove();
  });
});

// Add / Update Skill
btnAddSkill.addEventListener("click", () => {
  const name = skillNameInput.value.trim();
  const level = skillLevelInput.value.trim();

  if (!name || !level) {
    alert("Skill name and proficiency are required.");
    return;
  }

  const li = document.createElement("li");
  li.innerHTML = `
    <span>${name}: ${level}%</span>
    <button>🗑</button>
  `;
  skillsListAdmin.appendChild(li);

  skillNameInput.value = "";
  skillLevelInput.value = "";

  li.querySelector("button").addEventListener("click", () => {
    li.remove();
  });
});

// Edit button in table
studentTableBody.addEventListener("click", e => {
  const btn = e.target.closest("button");
  if (!btn) return;
  const index = btn.dataset.index;
  if (btn.dataset.action === "edit") {
    openModal("edit", index);
  }
});

// Verification buttons
verificationTableBody.addEventListener("click", e => {
  const btn = e.target.closest("button");
  if (!btn) return;

  const index = parseInt(btn.dataset.index, 10);
  const action = btn.dataset.verif;

  if (action === "approve") {
    verifications[index].status = "Approved";
    showToast("Verification approved");
  } else if (action === "reject") {
    verifications[index].status = "Rejected";
    showToast("Verification rejected");
  }

  renderVerifications();
});

// Save Student
btnSaveStudent.addEventListener("click", saveStudent);

// Delete Student
btnDeleteStudent.addEventListener("click", () => {
  if (editingIndex == null) return;
  if (!confirm("Are you sure you want to delete this student?")) return;
  students.splice(editingIndex, 1);
  renderStudents();
  closeModal();
  showToast("Student deleted");
});

// Preview report mapping (just a message for now)
btnPreviewReport.addEventListener("click", () => {
  alert(
    "This student's data (personal, academic, skills, feedback) is structured to map directly to the Student Reports page.\n\nLater, the backend will use this same structure for reports.js."
  );
});

// Close modal
closeModalBtn.addEventListener("click", closeModal);
studentModal.addEventListener("click", e => {
  if (e.target === studentModal.querySelector(".modal-backdrop")) {
    closeModal();
  }
});

// Add student button
btnAddStudent.addEventListener("click", () => openModal("add"));

// Clear all
btnClearAll.addEventListener("click", () => {
  if (!confirm("Clear all student records? This cannot be undone (in real system).")) return;
  students = [];
  renderStudents();
});

// Filters
[searchInput, courseFilter, statusFilter].forEach(el => {
  el.addEventListener("input", renderStudents);
});

// Tools: just text feedback for now
btnGenerateReport.addEventListener("click", () => {
  reportOutput.textContent =
    "Summary report (frontend mock): " +
    `${students.length} students, avg CGPA ${avgCgpaEl.textContent}, pending verifications ${pendingVerificationsEl.textContent}.`;
});

btnBackup.addEventListener("click", () => {
  reportOutput.textContent =
    "Backup triggered (frontend mock). Later this will call backend to export data.";
});

btnRestore.addEventListener("click", () => {
  reportOutput.textContent =
    "Restore triggered (frontend mock). Later this will call backend to restore from backup.";
});

// Initial render
renderStudents();
renderVerifications();
