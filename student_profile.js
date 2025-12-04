// Student Profile Page - Load and save profile data
document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;
  
  await loadStudentProfile();
  setupEventListeners();
});

// Load student profile from backend
async function loadStudentProfile() {
  try {
    const profile = await apiCall('/students/profile/me');
    
    // Update sidebar
    const sidebarName = document.getElementById("sidebarName");
    const sidebarId = document.getElementById("sidebarId");
    const sidebarCourse = document.getElementById("sidebarCourse");
    const sidebarPhoto = document.getElementById("sidebarPhoto");
    
    if (sidebarName) sidebarName.textContent = profile.fullName || profile.name || "N/A";
    if (sidebarId) sidebarId.textContent = profile.studentId || "N/A";
    if (sidebarCourse) sidebarCourse.textContent = profile.course || "N/A";
    if (sidebarPhoto && profile.photo) {
      sidebarPhoto.src = `http://localhost:3000${profile.photo}`;
    }
    
    // Get full profile details
    const fullProfile = await apiCall('/students/profile/full');
    
    // Populate form fields
    populateForm(fullProfile);
    
  } catch (error) {
    console.error('Error loading student profile:', error);
    // Try to get basic profile
    try {
      const basicProfile = await apiCall('/students/profile/me');
      populateForm(basicProfile);
    } catch (e) {
      console.error('Error loading basic profile:', e);
    }
  }
}

// Populate form with profile data
function populateForm(profile) {
  if (!profile) return;
  
  // Personal Information
  setValue('fullName', profile.fullName || profile.name);
  setValue('studentId', profile.studentId);
  setValue('dob', profile.dob ? new Date(profile.dob).toISOString().split('T')[0] : '');
  setValue('gender', profile.gender || '');
  setValue('nationality', profile.nationality || '');
  setValue('bloodGroup', profile.bloodGroup || '');
  setValue('category', profile.category || '');
  
  // Contact Details
  setValue('email', profile.email || '');
  setValue('phone', profile.phone || '');
  setValue('guardianName', profile.guardianName || '');
  setValue('guardianPhone', profile.guardianPhone || '');
  setValue('address', profile.address || '');
  setValue('city', profile.city || '');
  setValue('state', profile.state || '');
  setValue('pincode', profile.pincode || '');
  
  // Academic Information
  setValue('course', profile.course || '');
  setValue('department', profile.department || '');
  setValue('batch', profile.batch || '');
  setValue('semester', profile.semester || '');
  setValue('section', profile.section || '');
  setValue('rollNo', profile.rollNo || '');
  setValue('cgpa', profile.cgpa || '');
  setValue('sgpa', profile.sgpa || '');
  setValue('backlogs', profile.backlogs || '');
  setValue('mentor', profile.mentor || '');
  
  // Skills & Documents
  setValue('skills', profile.skills || '');
  setValue('languages', profile.languages || '');
  setValue('projects', profile.projects || '');
  
  // Emergency Information
  setValue('emergencyContact', profile.emergencyContact || '');
  setValue('emergencyRelation', profile.emergencyRelation || '');
  setValue('medicalNotes', profile.medicalNotes || '');
}

// Helper function to set form values
function setValue(id, value) {
  const element = document.getElementById(id);
  if (element && value) {
    element.value = value;
  }
}

// Setup event listeners
function setupEventListeners() {
  // Sidebar photo upload
  const photoIconBtn = document.querySelector(".photo-icon");
  const sidebarUpload = document.getElementById("sidebarUpload");
  const sidebarPhoto = document.getElementById("sidebarPhoto");
  
  if (photoIconBtn && sidebarUpload) {
    photoIconBtn.addEventListener("click", () => sidebarUpload.click());
  }
  
  if (sidebarUpload) {
    sidebarUpload.addEventListener("change", async function () {
      const file = this.files[0];
      if (!file) return;
      
      // Show preview
      const reader = new FileReader();
      reader.onload = () => {
        if (sidebarPhoto) sidebarPhoto.src = reader.result;
      };
      reader.readAsDataURL(file);
      
      // Upload to backend
      try {
        const formData = new FormData();
        formData.append('photo', file);
        
        await apiUpload('/settings/photo', formData, { method: 'POST' });
        alert('Profile photo updated successfully!');
      } catch (error) {
        console.error('Error uploading photo:', error);
        alert('Failed to upload photo. Please try again.');
      }
    });
  }
  
  // Keep sidebar in sync with form
  const fullNameInput = document.getElementById("fullName");
  const studentIdInput = document.getElementById("studentId");
  const courseInput = document.getElementById("course");
  
  const sidebarName = document.getElementById("sidebarName");
  const sidebarId = document.getElementById("sidebarId");
  const sidebarCourse = document.getElementById("sidebarCourse");
  
  if (fullNameInput && sidebarName) {
    fullNameInput.addEventListener("input", () => {
      sidebarName.textContent = fullNameInput.value || "N/A";
    });
  }
  
  if (studentIdInput && sidebarId) {
    studentIdInput.addEventListener("input", () => {
      sidebarId.textContent = studentIdInput.value || "N/A";
    });
  }
  
  if (courseInput && sidebarCourse) {
    courseInput.addEventListener("input", () => {
      sidebarCourse.textContent = courseInput.value || "N/A";
    });
  }
  
  // Form submission
  const profileForm = document.querySelector(".profile-form");
  if (profileForm) {
    profileForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      await saveProfile();
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

// Save profile to backend
async function saveProfile() {
  try {
    const formData = {
      fullName: document.getElementById('fullName')?.value || '',
      studentId: document.getElementById('studentId')?.value || '',
      dob: document.getElementById('dob')?.value || null,
      gender: document.getElementById('gender')?.value || '',
      nationality: document.getElementById('nationality')?.value || '',
      bloodGroup: document.getElementById('bloodGroup')?.value || '',
      category: document.getElementById('category')?.value || '',
      email: document.getElementById('email')?.value || '',
      phone: document.getElementById('phone')?.value || '',
      guardianName: document.getElementById('guardianName')?.value || '',
      guardianPhone: document.getElementById('guardianPhone')?.value || '',
      address: document.getElementById('address')?.value || '',
      city: document.getElementById('city')?.value || '',
      state: document.getElementById('state')?.value || '',
      pincode: document.getElementById('pincode')?.value || '',
      course: document.getElementById('course')?.value || '',
      department: document.getElementById('department')?.value || '',
      batch: document.getElementById('batch')?.value || '',
      semester: parseInt(document.getElementById('semester')?.value) || null,
      section: document.getElementById('section')?.value || '',
      rollNo: document.getElementById('rollNo')?.value || '',
      cgpa: parseFloat(document.getElementById('cgpa')?.value) || null,
      sgpa: parseFloat(document.getElementById('sgpa')?.value) || null,
      backlogs: document.getElementById('backlogs')?.value || '0',
      mentor: document.getElementById('mentor')?.value || '',
      skills: document.getElementById('skills')?.value || '',
      languages: document.getElementById('languages')?.value || '',
      projects: document.getElementById('projects')?.value || '',
      emergencyContact: document.getElementById('emergencyContact')?.value || '',
      emergencyRelation: document.getElementById('emergencyRelation')?.value || '',
      medicalNotes: document.getElementById('medicalNotes')?.value || ''
    };
    
    // Handle file uploads if needed
    const idCardFile = document.getElementById('idCardUpload')?.files[0];
    const bonafideFile = document.getElementById('bonafideUpload')?.files[0];
    const feeReceiptFile = document.getElementById('feeReceiptUpload')?.files[0];
    
    // Save profile data
    await apiCall('/students/profile/update', {
      method: 'PUT',
      body: JSON.stringify(formData)
    });
    
    // Upload files if provided
    if (idCardFile || bonafideFile || feeReceiptFile) {
      const fileFormData = new FormData();
      if (idCardFile) fileFormData.append('idCard', idCardFile);
      if (bonafideFile) fileFormData.append('bonafide', bonafideFile);
      if (feeReceiptFile) fileFormData.append('feeReceipt', feeReceiptFile);
      
      await apiUpload('/students/profile/documents', fileFormData, { method: 'POST' });
    }
    
    alert('Profile saved successfully!');
  } catch (error) {
    console.error('Error saving profile:', error);
    alert('Failed to save profile. Please try again.');
  }
}
