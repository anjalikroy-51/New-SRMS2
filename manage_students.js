// Admin Manage Students - Fully integrated with backend API

// ======== State ========
let students = [];       // Loaded from /api/students
let verifications = [];  // Loaded from /api/certificates
let editingIndex = null; // index in students[] currently being edited

// ======== DOM references ========
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

// ======== Helpers ========
function showToast(message) {
  if (!toast) return;
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

// Map backend Student document to UI-friendly object
function mapStudentFromApi(s) {
  return {
    _id: s._id,
    id: s.studentId,
    name: s.name,
    course: s.course,
    cgpa: s.cgpa,
    backlogs: s.backlogs,
    status: s.status,
    lastUpdated: s.lastUpdated ? formatDateTime(s.lastUpdated) : "--",
    semesters: s.semesters || [],
    skills: s.skills || [],
    feedback: s.feedback?.text || "",
    feedbackUpdatedAt: s.feedback?.updatedAt || ""
  };
}

// ======== Data loading ========
async function loadStudentsFromBackend() {
  try {
    const params = new URLSearchParams();
    const search = (searchInput.value || "").trim();
    const course = courseFilter.value;
    const status = statusFilter.value;

    if (search) params.append("search", search);
    if (course) params.append("course", course);
    if (status) params.append("status", status);

    const endpoint = params.toString()
      ? `/students?${params.toString()}`
      : "/students";

    const apiStudents = await apiCall(endpoint);
    students = apiStudents.map(mapStudentFromApi);
    renderStudents();
  } catch (error) {
    console.error("Error loading students:", error);
    students = [];
    renderStudents();
  }
}

async function loadVerificationsFromBackend() {
  try {
    const certs = await apiCall("/certificates");
    verifications = (certs || []).map(c => {
      const studentLabel =
        c.student?.name && c.student?.studentId
          ? `${c.student.name} (${c.student.studentId})`
          : c.studentId || "Unknown";

      return {
        _id: c._id,
        studentLabel,
        type: "Certificate",
        title: c.certificateName || c.title || "N/A",
        submittedOn: c.uploadedAt || c.issueDate,
        status: c.status || "Pending"
      };
    });
    renderVerifications();
  } catch (error) {
    console.error("Error loading verifications:", error);
    verifications = [];
    renderVerifications();
  }
}

// ======== Rendering ========
function renderStudents() {
  if (!studentTableBody) return;

  studentTableBody.innerHTML = "";

  students.forEach((s, index) => {
    const tr = document.createElement("tr");

    const cgpaText =
      s.cgpa != null && !Number.isNaN(s.cgpa) ? Number(s.cgpa).toFixed(2) : "--";
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
  if (totalStudentsEl) {
    totalStudentsEl.textContent = students.length;
  }

  if (avgCgpaEl) {
    if (students.length > 0) {
      const sumCgpa = students.reduce(
        (sum, s) => sum + (s.cgpa || 0),
        0
      );
      avgCgpaEl.textContent = (sumCgpa / students.length).toFixed(2);
    } else {
      avgCgpaEl.textContent = "--";
    }
  }
}

function renderVerifications() {
  if (!verificationTableBody) return;

  verificationTableBody.innerHTML = "";
  let pendingCount = 0;

  verifications.forEach((v, index) => {
    if (v.status === "Pending") pendingCount++;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${v.studentLabel || "--"}</td>
      <td>${v.type}</td>
      <td>${v.title}</td>
      <td>${v.submittedOn ? formatDateTime(v.submittedOn) : "--"}</td>
      <td>${v.status}</td>
      <td>
        <button class="btn small secondary" data-verif="approve" data-index="${index}">✅ Approve</button>
        <button class="btn small danger-outline" data-verif="reject" data-index="${index}">❌ Reject</button>
      </td>
    `;
    verificationTableBody.appendChild(tr);
  });

  if (pendingVerificationsEl) {
    pendingVerificationsEl.textContent = pendingCount;
  }
}

// ======== Modal logic ========
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
  document
    .querySelectorAll(".tab-button")
    .forEach(btn => btn.classList.remove("active"));
  document
    .querySelectorAll(".tab-panel")
    .forEach(panel => panel.classList.remove("active"));
  document
    .querySelector(".tab-button[data-tab='tab-personal']")
    .classList.add("active");
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
  (student.semesters || []).forEach(sem => {
    const li = document.createElement("li");
    li.dataset.subjects = sem.subjects || "";
    li.innerHTML = `
      <span>${sem.name} – SGPA: ${sem.sgpa}</span>
      <button>🗑</button>
    `;
    semesterList.appendChild(li);

    li.querySelector("button").addEventListener("click", () => {
      li.remove();
    });
  });

  // Skills
  skillsListAdmin.innerHTML = "";
  (student.skills || []).forEach(sk => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${sk.name}: ${sk.level}%</span>
      <button>🗑</button>
    `;
    skillsListAdmin.appendChild(li);

    li.querySelector("button").addEventListener("click", () => {
      li.remove();
    });
  });

  // Feedback
  feedbackInput.value = student.feedback || "";
  if (student.feedbackUpdatedAt) {
    // ISO string; leave as-is for now
    feedbackDateInput.value = "";
  }
}

// Build payload from modal
function buildStudentPayload() {
  const now = new Date();

  const payload = {
    studentId: studentIdInput.value.trim(),
    name: studentNameInput.value.trim(),
    course: courseSelect.value,
    status: statusSelect.value,
    cgpa: cgpaInput.value ? parseFloat(cgpaInput.value) : null,
    backlogs: backlogsInput.value ? parseInt(backlogsInput.value) : 0,
    semesters: [],
    skills: []
  };

  // Semesters from current list DOM
  semesterList.querySelectorAll("li").forEach(li => {
    const text = li.firstElementChild.textContent; // "Semester 1 – SGPA: 8.4"
    const [namePart, sgpaPart] = text.split("– SGPA:");
    const name = namePart.trim();
    const sgpa = parseFloat((sgpaPart || "").trim());
    const subjects = li.dataset.subjects || "";
    payload.semesters.push({ name, sgpa, subjects });
  });

  // Skills from DOM
  skillsListAdmin.querySelectorAll("li").forEach(li => {
    const text = li.firstElementChild.textContent; // "Python: 85%"
    const [name, levelPart] = text.split(":");
    const level = parseInt((levelPart || "").replace("%", "").trim());
    payload.skills.push({ name: name.trim(), level });
  });

  payload.lastUpdated = now.toISOString();

  return payload;
}

// Save student data from modal (create or update)
async function saveStudent() {
  try {
    const payload = buildStudentPayload();

    if (!payload.studentId || !payload.name) {
      alert("Student ID and Name are required.");
      return;
    }

    let savedStudent;

    if (editingIndex == null) {
      // Create new student
      savedStudent = await apiCall("/students", {
        method: "POST",
        body: JSON.stringify({
          studentId: payload.studentId,
          name: payload.name,
          course: payload.course,
          status: payload.status,
          cgpa: payload.cgpa,
          backlogs: payload.backlogs
        })
      });

      const id = savedStudent.student?._id || savedStudent._id;

      // Add semesters
      for (const sem of payload.semesters) {
        await apiCall(`/students/${id}/semesters`, {
          method: "POST",
          body: JSON.stringify({
            name: sem.name,
            sgpa: sem.sgpa,
            subjects: sem.subjects
          })
        });
      }

      // Add skills
      for (const sk of payload.skills) {
        await apiCall(`/students/${id}/skills`, {
          method: "POST",
          body: JSON.stringify({
            name: sk.name,
            level: sk.level
          })
        });
      }

      // Feedback
      const feedbackText = feedbackInput.value.trim();
      if (feedbackText) {
        await apiCall(`/students/${id}/feedback`, {
          method: "PUT",
          body: JSON.stringify({ feedback_text: feedbackText })
        });
      }
    } else {
      // Update existing student
      const existing = students[editingIndex];
      const id = existing._id;

      // Update main student fields (including semesters & skills)
      await apiCall(`/students/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          studentId: payload.studentId,
          name: payload.name,
          course: payload.course,
          status: payload.status,
          cgpa: payload.cgpa,
          backlogs: payload.backlogs,
          semesters: payload.semesters,
          skills: payload.skills
        })
      });

      // Update feedback
      const feedbackText = feedbackInput.value.trim();
      await apiCall(`/students/${id}/feedback`, {
        method: "PUT",
        body: JSON.stringify({ feedback_text: feedbackText })
      });
    }

    await loadStudentsFromBackend();
    showToast("Student saved successfully");
    closeModal();
  } catch (error) {
    console.error("Error saving student:", error);
    alert("Failed to save student. Please check console for details.");
  }
}

// ======== Event wiring ========
document.addEventListener("DOMContentLoaded", async () => {
  if (!requireAuth()) return;

  // Tab switching
  document.querySelectorAll(".tab-button").forEach(btn => {
    btn.addEventListener("click", () => {
      const tabId = btn.dataset.tab;
      document
        .querySelectorAll(".tab-button")
        .forEach(b => b.classList.remove("active"));
      document
        .querySelectorAll(".tab-panel")
        .forEach(panel => panel.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(tabId).classList.add("active");
    });
  });

  // Add / Update Semester (append to list)
  btnAddSemester.addEventListener("click", () => {
    const name = semesterNameInput.value.trim();
    const sgpa = sgpaInput.value.trim();
    const subjects = subjectsInput.value.trim(); // e.g. "Sub1:A, Sub2:B+"

    if (!name || !sgpa) {
      alert("Semester name and SGPA are required.");
      return;
    }

    const li = document.createElement("li");
    li.dataset.subjects = subjects;
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

  // Verification buttons (approve / reject)
  verificationTableBody.addEventListener("click", async e => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const index = parseInt(btn.dataset.index, 10);
    const action = btn.dataset.verif;
    const v = verifications[index];
    if (!v) return;

    try {
      const newStatus = action === "approve" ? "Approved" : "Rejected";
      await apiCall(`/certificates/${v._id}/verify`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus })
      });
      showToast(`Verification ${newStatus.toLowerCase()}`);
      await loadVerificationsFromBackend();
    } catch (error) {
      console.error("Error updating verification:", error);
      alert("Failed to update verification.");
    }
  });

  // Save Student
  btnSaveStudent.addEventListener("click", saveStudent);

  // Delete Student
  btnDeleteStudent.addEventListener("click", async () => {
    if (editingIndex == null) return;
    if (!confirm("Are you sure you want to delete this student?")) return;

    const student = students[editingIndex];
    try {
      await apiCall(`/students/${student._id}`, { method: "DELETE" });
      await loadStudentsFromBackend();
      closeModal();
      showToast("Student deleted");
    } catch (error) {
      console.error("Error deleting student:", error);
      alert("Failed to delete student.");
    }
  });

  // Preview report mapping
  btnPreviewReport.addEventListener("click", () => {
    alert(
      "This student's data (personal, academic, skills, feedback) is stored in MongoDB and directly used by the Admin Reports and Student Reports pages."
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

  // Clear all (for safety, this only clears UI, not DB)
  btnClearAll.addEventListener("click", () => {
    if (
      !confirm(
        "This will clear the list on screen. It does NOT delete from database. Continue?"
      )
    )
      return;
    students = [];
    renderStudents();
  });

  // Filters → reload from backend with query params
  [searchInput, courseFilter, statusFilter].forEach(el => {
    el.addEventListener("input", () => {
      loadStudentsFromBackend();
    });
  });

  // Tools: simple text feedback (you can later connect to real backup endpoints)
  btnGenerateReport.addEventListener("click", () => {
    if (!reportOutput) return;
    reportOutput.textContent =
      "Summary report: " +
      `${students.length} students, avg CGPA ${avgCgpaEl.textContent}, pending verifications ${pendingVerificationsEl.textContent}.`;
  });

  btnBackup.addEventListener("click", () => {
    if (!reportOutput) return;
    reportOutput.textContent =
      "Backup (demo): connect this button to a backend export endpoint if needed.";
  });

  btnRestore.addEventListener("click", () => {
    if (!reportOutput) return;
    reportOutput.textContent =
      "Restore (demo): connect this button to a backend restore endpoint if needed.";
  });

  // Initial load
  await loadStudentsFromBackend();
  await loadVerificationsFromBackend();
});
