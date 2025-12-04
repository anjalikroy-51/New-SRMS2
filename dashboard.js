// Dashboard - Load all data from backend
document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;
  
  await loadDashboardData();
});

// Load complete dashboard data
async function loadDashboardData() {
  try {
    const data = await apiCall('/dashboard');
    
    // Load student profile
    await loadStudentProfile(data.studentProfile);
    
    // Load class schedule
    loadSchedule(data.schedule);
    
    // Load attendance
    loadAttendance(data.attendance);
    
    // Load academic calendar
    loadAcademicCalendar(data.calendarEvents);
    
    // Load upcoming events
    loadEvents(data.upcomingEvents);
    
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    // Fallback: try loading individual components
    await loadStudentProfile();
    await loadSchedule();
    await loadAcademicEvents();
    await loadEvents();
  }
}

// Load student profile
async function loadStudentProfile(profileData = null) {
  try {
    let student;
    
    if (profileData) {
      student = profileData;
    } else {
      // Fallback: fetch from student profile endpoint
      const studentProfile = await apiCall('/students/profile/me');
      student = {
        fullName: studentProfile.name || studentProfile.fullName,
        studentId: studentProfile.studentId,
        course: studentProfile.course
      };
    }
    
    // Update sidebar profile info
    const profileInfo = document.querySelector('.profile-info');
    if (profileInfo) {
      const nameEl = profileInfo.querySelector('p:first-child span');
      const idEl = profileInfo.querySelector('p:nth-child(2)');
      const courseEl = profileInfo.querySelector('p:last-child');
      
      if (nameEl) nameEl.textContent = student.fullName || student.name || "N/A";
      if (idEl) idEl.textContent = student.studentId || "N/A";
      if (courseEl) courseEl.textContent = student.course || "N/A";
    }
    
    // Update profile photo if available
    const studentPhoto = document.getElementById("studentPhoto");
    if (studentPhoto && student.photo) {
      studentPhoto.src = `http://localhost:3000${student.photo}`;
    }
    
  } catch (error) {
    console.error('Error loading student profile:', error);
  }
}

// Upload Photo
document.querySelector(".edit-photo")?.addEventListener("click", () => {
  document.getElementById("uploadPhoto").click();
});

document.getElementById("uploadPhoto")?.addEventListener("change", async function () {
  const file = this.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = () => {
    document.getElementById("studentPhoto").src = reader.result;
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

// Load and display class schedule
function loadSchedule(scheduleData) {
  const scheduleTable = document.querySelector("#schedule tbody");
  if (!scheduleTable) return;
  
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const timeSlots = ['9-10 AM', '10-11 AM', '11-1 PM', '2-4 PM'];
  
  scheduleTable.innerHTML = '';
  
  days.forEach(day => {
    const row = document.createElement('tr');
    const dayCell = document.createElement('td');
    dayCell.textContent = day;
    row.appendChild(dayCell);
    
    timeSlots.forEach(slot => {
      const cell = document.createElement('td');
      cell.textContent = scheduleData?.[day]?.[slot] || '-';
      row.appendChild(cell);
    });
    
    scheduleTable.appendChild(row);
  });
  
  // Update download button
  document.querySelector(".download-btn")?.addEventListener("click", () => {
    let csv = "Day,9–10 AM,10–11 AM,11–1 PM,2–4 PM\n";
    
    days.forEach(day => {
      const row = [day];
      timeSlots.forEach(slot => {
        row.push(scheduleData?.[day]?.[slot] || '-');
      });
      csv += row.join(',') + '\n';
    });
    
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Weekly_Class_Schedule.csv";
    link.click();
  });
}

// Load attendance
function loadAttendance(attendanceData) {
  const attendanceSection = document.querySelector("#attendance");
  if (!attendanceSection) return;
  
  const attendancePercent = attendanceData?.semesterAttendance || 0;
  const lowSubjects = attendanceData?.lowAttendanceSubjects || [];
  
  // Update attendance percentage
  const attendanceText = attendanceSection.querySelector('p');
  if (attendanceText) {
    attendanceText.innerHTML = `Semester Attendance: <strong>${attendancePercent}%</strong>`;
  }
  
  // Update alert
  const alertEl = attendanceSection.querySelector('.alert-text');
  if (alertEl) {
    if (attendancePercent < 75) {
      alertEl.textContent = `⚠ Attendance Below 75%`;
      alertEl.style.display = 'block';
    } else if (lowSubjects.length > 0) {
      alertEl.textContent = `⚠ Low attendance in ${lowSubjects.join(', ')}`;
      alertEl.style.display = 'block';
    } else {
      alertEl.style.display = 'none';
    }
  }
}

// Academic Calendar
let academicEvents = {};
let currentDate = new Date();

function loadAcademicCalendar(calendarEvents = []) {
  // Convert events to calendar format
  academicEvents = {};
  calendarEvents.forEach(event => {
    const dateKey = new Date(event.date).toISOString().split('T')[0];
    academicEvents[dateKey] = event.eventType.toLowerCase();
  });
  
  renderCalendar();
}

async function loadAcademicEvents() {
  try {
    // Fallback: load from academic calendar endpoint
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const events = await apiCall(`/academic-calendar?start_date=${startOfMonth.toISOString()}&end_date=${endOfMonth.toISOString()}`);
    
    academicEvents = {};
    events.forEach(event => {
      const dateKey = new Date(event.date).toISOString().split('T')[0];
      academicEvents[dateKey] = event.eventType.toLowerCase();
    });
    
    renderCalendar();
  } catch (error) {
    console.error('Error loading academic events:', error);
    renderCalendar();
  }
}

function renderCalendar() {
  const monthYear = document.getElementById("calendarMonth");
  const calendarBody = document.getElementById("calendarBody");
  if (!monthYear || !calendarBody) return;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  monthYear.textContent = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric"
  });

  calendarBody.innerHTML = "";

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  let date = 1;

  for (let i = 0; i < 6; i++) {
    const row = document.createElement("tr");

    for (let j = 0; j < 7; j++) {
      const cell = document.createElement("td");

      if (i === 0 && j < firstDay) {
        cell.textContent = "";
      } else if (date > daysInMonth) {
        break;
      } else {
        cell.textContent = date;
        const eventKey = `${year}-${String(month+1).padStart(2,'0')}-${String(date).padStart(2,'0')}`;
        if (academicEvents[eventKey]) {
          cell.classList.add(academicEvents[eventKey]);
          cell.title = academicEvents[eventKey].toUpperCase();
        }
        date++;
      }
      row.appendChild(cell);
    }

    calendarBody.appendChild(row);
  }
}

// Navigation Buttons
document.getElementById("prevMonth")?.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
  // Reload events for new month
  loadAcademicEvents();
});

document.getElementById("nextMonth")?.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
  // Reload events for new month
  loadAcademicEvents();
});

// Load upcoming events
function loadEvents(eventsData = []) {
  const eventContainer = document.getElementById("eventList");
  if (!eventContainer) return;
  
  eventContainer.innerHTML = "";

  if (eventsData.length === 0) {
    eventContainer.innerHTML = '<p style="text-align: center; color: #666;">No upcoming events</p>';
    return;
  }

  eventsData.forEach(ev => {
    const item = document.createElement("div");
    item.className = "event-item " + ev.category.toLowerCase().replace(' ', '-');

    item.innerHTML = `
      <div class="event-date">${new Date(ev.date).toLocaleDateString()}</div>
      <div class="event-title">${ev.title}</div>
      <div class="event-type">${ev.category.toUpperCase()}</div>
    `;

    item.onclick = () => {
      alert(`${ev.title}\n📅 ${new Date(ev.date).toLocaleDateString()}\nCategory: ${ev.category}\n\n${ev.description || 'No description available'}`);
    };

    eventContainer.appendChild(item);
  });
}

async function loadEventsFallback() {
  try {
    const events = await apiCall('/events/upcoming');
    loadEvents(events);
  } catch (error) {
    console.error('Error loading events:', error);
  }
}

// Logout button
document.querySelector(".logout")?.addEventListener("click", () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'Login.html';
});
