// Load student profile from backend using AJAX
async function loadStudentProfile() {
  try {
    if (!requireAuth()) return;

    const student = await apiCall('/students/profile/me');
    
    // Update sidebar profile info
    const sidebarName = document.querySelector('.profile-info p:first-child span');
    const sidebarId = document.querySelector('.profile-info p:nth-child(2)');
    const sidebarCourse = document.querySelector('.profile-info p:last-child');
    
    if (sidebarName) sidebarName.textContent = student.name || "N/A";
    if (sidebarId) sidebarId.textContent = student.studentId || "N/A";
    if (sidebarCourse) sidebarCourse.textContent = student.course || "N/A";
    
    // Update profile photo if available
    if (student.photo) {
      document.getElementById("studentPhoto").src = student.photo;
    }
    
    // Update attendance percentage
    if (student.attendancePercentage !== undefined) {
      checkAttendance(student.attendancePercentage);
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
    
    const student = await apiCall('/students/profile/me');
    await apiCall(`/students/${student._id}`, {
      method: 'PUT',
      body: JSON.stringify({ photo: reader.result })
    });
  } catch (error) {
    console.error('Error uploading photo:', error);
  }
});

// Load and Download Class Schedule as CSV using AJAX
async function loadSchedule() {
  try {
    const schedule = await apiCall('/schedule');
    
    // Convert schedule to CSV format
    const scheduleMap = {};
    schedule.forEach(item => {
      if (!scheduleMap[item.day]) {
        scheduleMap[item.day] = {};
      }
      scheduleMap[item.day][item.timeSlot] = item.subject;
    });
    
    // Update download button
    document.querySelector(".download-btn")?.addEventListener("click", () => {
      let csv = "Day,9–10 AM,10–11 AM,11–1 PM,2–4 PM\n";
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
      const timeSlots = ['9-10 AM', '10-11 AM', '11-1 PM', '2-4 PM'];
      
      days.forEach(day => {
        const row = [day];
        timeSlots.forEach(slot => {
          row.push(scheduleMap[day]?.[slot] || '-');
        });
        csv += row.join(',') + '\n';
      });
      
      const blob = new Blob([csv], { type: "text/csv" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "Weekly_Class_Schedule.csv";
      link.click();
    });
  } catch (error) {
    console.error('Error loading schedule:', error);
  }
}

// Dynamic attendance alert
function checkAttendance(att) {
  const alertEl = document.querySelector(".alert-text");
  if (alertEl && att < 75) {
    alertEl.innerText = "⚠ Attendance Below 75%";
  }
}

// === Academic Calendar Script with AJAX ===
let academicEvents = {};
let currentDate = new Date();

async function loadAcademicEvents() {
  try {
    const events = await apiCall('/events');
    
    // Convert events to calendar format
    events.forEach(event => {
      const dateKey = new Date(event.eventDate).toISOString().split('T')[0];
      academicEvents[dateKey] = event.eventType;
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
});

document.getElementById("nextMonth")?.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});

// === Load Upcoming Events using AJAX ===
async function loadEvents() {
  try {
    const events = await apiCall('/events/upcoming');
    
    function renderEvents(upcomingEvents) {
      const eventContainer = document.getElementById("eventList");
      if (!eventContainer) return;
      
      eventContainer.innerHTML = "";

      upcomingEvents.forEach(ev => {
        const item = document.createElement("div");
        item.className = "event-item " + ev.eventType;

        item.innerHTML = `
          <div class="event-date">${new Date(ev.eventDate).toLocaleDateString()}</div>
          <div class="event-title">${ev.title}</div>
          <div class="event-type">${ev.eventType.toUpperCase()}</div>
        `;

        item.onclick = () => {
          alert(`${ev.title}\n📅 ${new Date(ev.eventDate).toLocaleDateString()}\nCategory: ${ev.eventType}`);
        };

        eventContainer.appendChild(item);
      });
    }
    
    renderEvents(events);
  } catch (error) {
    console.error('Error loading events:', error);
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;
  
  await loadStudentProfile();
  await loadSchedule();
  await loadAcademicEvents();
  await loadEvents();
});
