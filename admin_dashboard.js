// Load dashboard data using AJAX
async function loadDashboardData() {
  try {
    if (!requireAuth()) return;

    // Total students
    const totalData = await apiCall('/students/count');
    const totalEl = document.getElementById("totalStudents");
    if (totalEl) {
      totalEl.innerText = totalData.total ?? 0;
    }

    // Pending students
    const pendingData = await apiCall('/students/pending');
    const pendingEl = document.getElementById("pendingCount");
    if (pendingEl) {
      pendingEl.innerText = pendingData.length ?? 0;
    }
  } catch (err) {
    console.error("Error loading dashboard data:", err);
  }
}

// Pending Approvals Modal
const pendingCard = document.getElementById("pendingCard");
const modal = document.getElementById("pendingModal");
const closeBtn = document.querySelector(".closeModal");
const pendingList = document.getElementById("pendingList");
const pendingTotal = document.getElementById("pendingTotal");

// When admin clicks the Pending Approvals card
pendingCard?.addEventListener("click", async () => {
  if (modal) modal.style.display = "flex";
  await loadPendingList();
});

// Close button
closeBtn?.addEventListener("click", () => {
  if (modal) modal.style.display = "none";
});

// Click outside the window closes it
window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});

// Get list of pending students from backend using AJAX
async function loadPendingList() {
  try {
    const data = await apiCall('/students/pending');

    // Update total in window title
    if (pendingTotal) {
      pendingTotal.innerText = data.length ?? 0;
    }

    // Clear existing list
    if (pendingList) {
      pendingList.innerHTML = "";

      if (!data.length) {
        const li = document.createElement("li");
        li.textContent = "No pending approvals.";
        pendingList.appendChild(li);
        return;
      }

      // Create numbered items: 1. Name (Roll)
      data.forEach((student, index) => {
        const li = document.createElement("li");
        li.textContent = `${index + 1}. ${student.name} (${student.roll || student.studentId})`;
        pendingList.appendChild(li);
      });
    }
  } catch (err) {
    console.error("Error loading pending list:", err);
  }
}

// Profile Picture Upload Preview
const profileInput = document.getElementById("profileUpload");
const adminPic = document.getElementById("adminPic");

profileInput?.addEventListener("change", () => {
  const file = profileInput.files[0];
  if (file) {
    const url = URL.createObjectURL(file);
    if (adminPic) adminPic.src = url;
  }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  if (!requireAuth()) return;
  loadDashboardData();
});
