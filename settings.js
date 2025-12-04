// Settings Page - Handle user settings, password, contact info, preferences

document.addEventListener("DOMContentLoaded", async () => {
  if (!requireAuth()) return;
  
  await loadSettings();
  setupEventListeners();
});

// Load current settings from backend
async function loadSettings() {
  try {
    const data = await apiCall('/settings');
    
    // Load user info
    const user = data.user || {};
    const student = data.student || {};
    
    // Update profile section
    const studentNameEl = document.querySelector('.student-name');
    const studentMetaEls = document.querySelectorAll('.student-meta span');
    
    if (studentNameEl) studentNameEl.textContent = student.name || 'N/A';
    if (studentMetaEls.length > 0) {
      if (studentMetaEls[0]) studentMetaEls[0].textContent = student.studentId || 'N/A';
      if (studentMetaEls[1]) studentMetaEls[1].textContent = student.course || 'N/A';
    }
    
    // Update profile photo
    if (student.photo) {
      const profilePreview = document.getElementById('profilePhotoPreview');
      if (profilePreview) {
        profilePreview.src = `http://localhost:3000${student.photo}`;
      }
    }
    
    // Update contact form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
      const primaryEmail = contactForm.querySelector('[name="primaryEmail"]');
      const alternateEmail = contactForm.querySelector('[name="alternateEmail"]');
      const mobileNumber = contactForm.querySelector('[name="mobileNumber"]');
      const guardianNumber = contactForm.querySelector('[name="guardianNumber"]');
      
      const contactInfo = user.contactInfo || {};
      if (primaryEmail) primaryEmail.value = contactInfo.primaryEmail || user.email || '';
      if (alternateEmail) alternateEmail.value = contactInfo.alternateEmail || '';
      if (mobileNumber) mobileNumber.value = contactInfo.mobileNumber || '';
      if (guardianNumber) guardianNumber.value = contactInfo.guardianNumber || '';
    }
    
    // Update preferences
    const preferences = user.preferences || {};
    const examAlerts = document.getElementById('examAlerts');
    const assignmentReminders = document.getElementById('assignmentReminders');
    const eventUpdates = document.getElementById('eventUpdates');
    const showCgpa = document.getElementById('showCgpa');
    const languageSelect = document.getElementById('languageSelect');
    
    if (examAlerts) examAlerts.checked = preferences.examAlerts !== false;
    if (assignmentReminders) assignmentReminders.checked = preferences.assignmentReminders !== false;
    if (eventUpdates) eventUpdates.checked = preferences.eventUpdates === true;
    if (showCgpa) showCgpa.checked = preferences.showCgpa !== false;
    if (languageSelect) languageSelect.value = preferences.language || 'en';
    
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

// Setup event listeners
function setupEventListeners() {
  // Profile photo upload
  const profileInput = document.getElementById('profilePhotoInput');
  const profilePreview = document.getElementById('profilePhotoPreview');
  
  if (profileInput) {
    profileInput.addEventListener('change', async function (e) {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      // Show preview immediately
      const reader = new FileReader();
      reader.onload = function (e) {
        if (profilePreview) {
          profilePreview.src = e.target.result;
        }
      };
      reader.readAsDataURL(file);

      // Upload to backend
      try {
        const formData = new FormData();
        formData.append('photo', file);
        
        const result = await apiUpload('/settings/photo', formData, { method: 'POST' });
        
        if (result.photo && profilePreview) {
          profilePreview.src = `http://localhost:3000${result.photo}`;
        }
        
        alert('Profile photo updated successfully!');
      } catch (error) {
        console.error('Error uploading photo:', error);
        alert('Failed to upload profile photo. Please try again.');
      }
    });
  }

  // Password form
  const passwordForm = document.getElementById('passwordForm');
  if (passwordForm) {
    passwordForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      
      const formData = new FormData(passwordForm);
      const currentPassword = formData.get('currentPassword');
      const newPassword = formData.get('newPassword');
      const confirmPassword = formData.get('confirmPassword');
      
      if (newPassword !== confirmPassword) {
        alert('New passwords do not match!');
        return;
      }
      
      try {
        await apiCall('/settings/password', {
          method: 'PUT',
          body: JSON.stringify({
            currentPassword,
            newPassword,
            confirmPassword
          })
        });
        
        alert('Password updated successfully!');
        passwordForm.reset();
      } catch (error) {
        console.error('Error updating password:', error);
        alert(error.message || 'Failed to update password. Please check your current password.');
      }
    });
  }

  // Contact form
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      
      const formData = new FormData(contactForm);
      
      try {
        await apiCall('/settings/contact', {
          method: 'PUT',
          body: JSON.stringify({
            primaryEmail: formData.get('primaryEmail'),
            alternateEmail: formData.get('alternateEmail'),
            mobileNumber: formData.get('mobileNumber'),
            guardianNumber: formData.get('guardianNumber')
          })
        });
        
        alert('Contact information updated successfully!');
      } catch (error) {
        console.error('Error updating contact info:', error);
        alert('Failed to update contact information. Please try again.');
      }
    });
  }

  // Preferences save button
  const preferencesCard = document.querySelector('.preferences-card');
  if (preferencesCard) {
    const saveBtn = preferencesCard.querySelector('.primary-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', async function (e) {
        e.preventDefault();
        
        const examAlerts = document.getElementById('examAlerts');
        const assignmentReminders = document.getElementById('assignmentReminders');
        const eventUpdates = document.getElementById('eventUpdates');
        const showCgpa = document.getElementById('showCgpa');
        const languageSelect = document.getElementById('languageSelect');
        
        try {
          await apiCall('/settings/preferences', {
            method: 'PUT',
            body: JSON.stringify({
              examAlerts: examAlerts ? examAlerts.checked : true,
              assignmentReminders: assignmentReminders ? assignmentReminders.checked : true,
              eventUpdates: eventUpdates ? eventUpdates.checked : false,
              showCgpa: showCgpa ? showCgpa.checked : true,
              language: languageSelect ? languageSelect.value : 'en'
            })
          });
          
          alert('Preferences saved successfully!');
        } catch (error) {
          console.error('Error updating preferences:', error);
          alert('Failed to save preferences. Please try again.');
        }
      });
    }
  }

  // Logout button
  const logoutBtn = document.querySelector('.logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = 'Login.html';
    });
  }
}

