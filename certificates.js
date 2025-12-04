// Certificates & Achievements Page
document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;
  
  await loadStudentInfo();
  await loadCertificates();
  await loadAchievements();
  setupEventListeners();
});

// Load student info for sidebar
async function loadStudentInfo() {
  try {
    const profile = await apiCall('/students/profile/me');
    
    const profilePreview = document.getElementById('profilePreview');
    const profileName = document.querySelector('.profile-section p strong');
    const profileId = document.querySelector('.profile-section p:last-child');
    
    if (profilePreview && profile.photo) {
      profilePreview.src = `http://localhost:3000${profile.photo}`;
    }
    if (profileName) profileName.textContent = profile.fullName || profile.name || 'N/A';
    if (profileId) profileId.textContent = `ID: ${profile.studentId || 'N/A'}`;
  } catch (error) {
    console.error('Error loading student info:', error);
  }
}

// Load certificates from backend
async function loadCertificates() {
  try {
    const certificates = await apiCall('/certificates/me');
    renderCertificates(certificates);
  } catch (error) {
    console.error('Error loading certificates:', error);
    renderCertificates([]);
  }
}

// Load achievements from backend
async function loadAchievements() {
  try {
    const achievements = await apiCall('/achievements/me');
    renderAchievements(achievements);
  } catch (error) {
    console.error('Error loading achievements:', error);
    renderAchievements([]);
  }
}

// Render certificates
function renderCertificates(certificates) {
  const container = document.getElementById("achievementContainer");
  if (!container) return;
  
  // Filter by category if needed
  const filterCategory = document.getElementById("filterCategory");
  const selectedCategory = filterCategory ? filterCategory.value : 'All';
  
  const filtered = certificates.filter(cert => 
    selectedCategory === 'All' || cert.category === selectedCategory
  );
  
  if (filtered.length === 0) {
    container.innerHTML = '<p style="text-align: center; padding: 20px;">No certificates found</p>';
    return;
  }
  
  container.innerHTML = '';
  
  filtered.forEach((cert, index) => {
    const card = document.createElement("div");
    card.className = "achievement-card";
    
    const badge = `<span class="badge badge-${cert.status.toLowerCase()}">${cert.status}</span>`;
    const fileUrl = cert.fileUrl ? `http://localhost:3000${cert.fileUrl}` : '';
    const isPdf = fileUrl && fileUrl.toLowerCase().endsWith('.pdf');
    
    const preview = isPdf
      ? `<div class='pdf-preview'><i class='fas fa-file-pdf'></i></div>`
      : fileUrl ? `<img src="${fileUrl}" alt="${cert.certificateName}">` : '<div class="no-image">No Image</div>';
    
    card.innerHTML = `
      ${badge}
      ${preview}
      <p><strong>${cert.certificateName || cert.title}</strong></p>
      <p style="font-size: 12px">${cert.issuer || 'N/A'}</p>
      <p style="font-size: 11px; color: #666;">${new Date(cert.issueDate).toLocaleDateString()}</p>
      <div class="card-actions">
        ${fileUrl ? `<span class="action-btn view" onclick="openPreview('${fileUrl}', '${isPdf ? 'pdf' : 'image'}')">View</span>` : ''}
        <span class="action-btn delete" onclick="deleteCertificate('${cert._id}')">Delete</span>
      </div>
    `;
    
    container.appendChild(card);
  });
}

// Render achievements
function renderAchievements(achievements) {
  const container = document.getElementById("achievementContainer");
  if (!container) return;
  
  achievements.forEach((achievement) => {
    const card = document.createElement("div");
    card.className = "achievement-card";
    
    const badge = `<span class="badge badge-${achievement.status.toLowerCase()}">${achievement.status}</span>`;
    const fileUrl = achievement.fileUrl ? `http://localhost:3000${achievement.fileUrl}` : '';
    const isPdf = fileUrl && fileUrl.toLowerCase().endsWith('.pdf');
    
    const preview = isPdf
      ? `<div class='pdf-preview'><i class='fas fa-file-pdf'></i></div>`
      : fileUrl ? `<img src="${fileUrl}" alt="${achievement.title}">` : '<div class="no-image">No Image</div>';
    
    card.innerHTML = `
      ${badge}
      ${preview}
      <p><strong>${achievement.title}</strong></p>
      <p style="font-size: 12px">${achievement.position || ''} - ${achievement.category || ''}</p>
      <p style="font-size: 11px; color: #666;">${new Date(achievement.achievementDate).toLocaleDateString()}</p>
      <div class="card-actions">
        ${fileUrl ? `<span class="action-btn view" onclick="openPreview('${fileUrl}', '${isPdf ? 'pdf' : 'image'}')">View</span>` : ''}
        <span class="action-btn delete" onclick="deleteAchievement('${achievement._id}')">Delete</span>
      </div>
    `;
    
    container.appendChild(card);
  });
}

// Setup event listeners
function setupEventListeners() {
  // Certificate form submission
  const form = document.getElementById("certificateForm");
  if (form) {
    form.addEventListener("submit", async function(e) {
      e.preventDefault();
      await uploadCertificate();
    });
  }
  
  // Filter change
  const filterCategory = document.getElementById("filterCategory");
  if (filterCategory) {
    filterCategory.addEventListener("change", async () => {
      await loadCertificates();
      await loadAchievements();
    });
  }
  
  // Profile upload
  const profileUpload = document.getElementById("profileUpload");
  const profilePreview = document.getElementById("profilePreview");
  
  if (profileUpload && profilePreview) {
    profileUpload.addEventListener("change", async () => {
      const file = profileUpload.files[0];
      if (file) {
        const imgURL = URL.createObjectURL(file);
        profilePreview.src = imgURL;
        
        // Upload to backend
        try {
          const formData = new FormData();
          formData.append('photo', file);
          await apiUpload('/settings/photo', formData, { method: 'POST' });
        } catch (error) {
          console.error('Error uploading profile photo:', error);
        }
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
}

// Upload certificate
async function uploadCertificate() {
  try {
    const certName = document.getElementById('certName').value;
    const certIssuer = document.getElementById('certIssuer').value;
    const certDate = document.getElementById('certDate').value;
    const certCategory = document.getElementById('certCategory').value;
    const certFile = document.getElementById('certFile').files[0];
    
    if (!certName || !certIssuer || !certDate || !certCategory || !certFile) {
      alert('Please fill all fields and select a file');
      return;
    }
    
    const formData = new FormData();
    formData.append('certificate', certFile);
    formData.append('title', certName);
    formData.append('certificateName', certName);
    formData.append('issuer', certIssuer);
    formData.append('issueDate', certDate);
    formData.append('category', certCategory);
    
    await apiUpload('/certificates', formData, { method: 'POST' });
    
    alert('Certificate uploaded successfully!');
    document.getElementById('certificateForm').reset();
    
    // Reload certificates
    await loadCertificates();
    
  } catch (error) {
    console.error('Error uploading certificate:', error);
    alert('Failed to upload certificate. Please try again.');
  }
}

// Delete certificate
async function deleteCertificate(certId) {
  if (!confirm('Are you sure you want to delete this certificate?')) return;
  
  try {
    await apiCall(`/certificates/${certId}`, { method: 'DELETE' });
    await loadCertificates();
  } catch (error) {
    console.error('Error deleting certificate:', error);
    alert('Failed to delete certificate.');
  }
}

// Delete achievement
async function deleteAchievement(achievementId) {
  if (!confirm('Are you sure you want to delete this achievement?')) return;
  
  try {
    await apiCall(`/achievements/${achievementId}`, { method: 'DELETE' });
    await loadAchievements();
  } catch (error) {
    console.error('Error deleting achievement:', error);
    alert('Failed to delete achievement.');
  }
}

// Modal preview functions
function openPreview(url, type) {
  const modal = document.getElementById("modalPreview");
  const previewImg = document.getElementById("previewImg");
  const previewFrame = document.getElementById("previewFrame");
  
  if (!modal) return;
  
  modal.style.display = "block";
  
  if (type === "pdf") {
    if (previewFrame) {
      previewFrame.src = url;
      previewFrame.style.display = "block";
    }
    if (previewImg) previewImg.style.display = "none";
  } else {
    if (previewImg) {
      previewImg.src = url;
      previewImg.style.display = "block";
    }
    if (previewFrame) previewFrame.style.display = "none";
  }
}

// Close modal
document.querySelector(".close")?.addEventListener("click", () => {
  const modal = document.getElementById("modalPreview");
  if (modal) modal.style.display = "none";
});

window.onclick = (e) => {
  const modal = document.getElementById("modalPreview");
  if (e.target == modal && modal) {
    modal.style.display = "none";
  }
};
