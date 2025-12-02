// --------- DATA FETCH FROM BACKEND ---------
// These endpoints should be implemented in your backend (C++ + Oracle)
// Example responses:
//  GET /api/students/count   -> { "total": 120 }
//  GET /api/students/pending -> [ { "name": "Arya", "roll": "STU2025" }, ... ]

async function loadDashboardData() {
  try {
    // Total students
    const totalRes = await fetch("/api/students/count");
    const totalData = await totalRes.json();
    document.getElementById("totalStudents").innerText = totalData.total ?? 0;

    // Pending students
    const pendingRes = await fetch("/api/students/pending");
    const pendingData = await pendingRes.json();
    document.getElementById("pendingCount").innerText = pendingData.length ?? 0;
  } catch (err) {
    console.error("Error loading dashboard data:", err);
  }
}

// --------- PENDING MODAL ---------
// ---- Load numbers on dashboard cards ----
async function loadDashboardData() {
  try {
    // total students
    const totalRes = await fetch("/api/students/count");
    const totalData = await totalRes.json();
    document.getElementById("totalStudents").innerText = totalData.total ?? 0;

    // pending approvals (array of students)
    const pendingRes = await fetch("/api/students/pending");
    const pendingData = await pendingRes.json();
    document.getElementById("pendingCount").innerText = pendingData.length ?? 0;
  } catch (err) {
    console.error("Error loading dashboard data:", err);
  }
}

// ---- Small popup for Pending Approvals ----
const pendingCard = document.getElementById("pendingCard");
const modal = document.getElementById("pendingModal");
const closeBtn = document.querySelector(".closeModal");
const pendingList = document.getElementById("pendingList");
const pendingTotal = document.getElementById("pendingTotal");

// when admin clicks the Pending Approvals card
pendingCard.addEventListener("click", async () => {
  modal.style.display = "flex";       // show small window
  await loadPendingList();           // fill list from backend
});

// close button
closeBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

// click outside the window closes it
window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});

// get list of pending students from backend
async function loadPendingList() {
  try {
    const res = await fetch("/api/students/pending");
    const data = await res.json();

    // update total in window title
    pendingTotal.innerText = data.length ?? 0;

    // clear existing list
    pendingList.innerHTML = "";

    if (!data.length) {
      const li = document.createElement("li");
      li.textContent = "No pending approvals.";
      pendingList.appendChild(li);
      return;
    }

    // create numbered items: 1. Name (Roll)
    data.forEach((student, index) => {
      const li = document.createElement("li");
      li.textContent = `${index + 1}. ${student.name} (${student.roll})`;
      pendingList.appendChild(li);
    });
  } catch (err) {
    console.error("Error loading pending list:", err);
  }
}

// ---- initial load for the dashboard numbers ----
loadDashboardData();


// --------- PROFILE PICTURE UPLOAD PREVIEW ---------
const profileInput = document.getElementById("profileUpload");
const adminPic = document.getElementById("adminPic");

profileInput.addEventListener("change", () => {
  const file = profileInput.files[0];
  if (file) {
    const url = URL.createObjectURL(file);
    adminPic.src = url; // just preview on front-end
  }
});

// --------- INIT ---------
loadDashboardData();
