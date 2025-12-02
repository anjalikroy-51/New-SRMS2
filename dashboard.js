// Upload Photo
document.querySelector(".edit-photo").addEventListener("click", () => {
  document.getElementById("uploadPhoto").click();
});

document.getElementById("uploadPhoto").addEventListener("change", function () {
  const reader = new FileReader();
  reader.onload = () => {
    document.getElementById("studentPhoto").src = reader.result;
  };
  reader.readAsDataURL(this.files[0]);
});

// Download Class Schedule as CSV
document.querySelector(".download-btn").addEventListener("click", () => {
  let csv = 
"Day,9–10 AM,10–11 AM,11–1 PM,2–4 PM\n" +
"Mon,AI,AI,Python,-\n" +
"Tue,-,DBMS,DBMS,-\n" +
"Wed,Java,Java,AI,-\n" +
"Thu,-,Python,Python,DBMS\n" +
"Fri,Project,-,Project,-";

  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "Weekly_Class_Schedule.csv";
  link.click();
});


// Example dynamic attendance alert
function checkAttendance() {
  let att = 82; // Example value
  if(att < 75){
    document.querySelector(".alert-text").innerText = "⚠ Attendance Below 75%";
  }
}
checkAttendance();

// === Academic Calendar Script ===

// Important dates
const academicEvents = {
  "2025-12-10": "exam",
  "2025-12-15": "holiday",
  "2025-12-22": "deadline"
};

let currentDate = new Date();

function renderCalendar() {
  const monthYear = document.getElementById("calendarMonth");
  const calendarBody = document.getElementById("calendarBody");

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
document.getElementById("prevMonth").onclick = () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
};

document.getElementById("nextMonth").onclick = () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
};

renderCalendar();

// === Upcoming Events Script ===
const upcomingEvents = [
  { date: "2025-12-12", type: "workshop", title: "Workshop on IoT" },
  { date: "2025-12-08", type: "hackathon", title: "Annual Hackathon" },
  { date: "2025-12-20", type: "seminar", title: "AI Seminar" },
  { date: "2025-12-26", type: "fest", title: "Tech Fest" },
  { date: "2026-01-05", type: "workshop", title: "Cloud Computing Workshop" },
  { date: "2026-01-10", type: "seminar", title: "Career Development Seminar" }
];

function renderEvents() {
  const eventContainer = document.getElementById("eventList");
  eventContainer.innerHTML = "";

  upcomingEvents.forEach(ev => {
    const item = document.createElement("div");
    item.className = "event-item " + ev.type;

    item.innerHTML = `
      <div class="event-date">${new Date(ev.date).toLocaleDateString()}</div>
      <div class="event-title">${ev.title}</div>
      <div class="event-type">${ev.type.toUpperCase()}</div>
    `;

    item.onclick = () => {
      alert(`${ev.title}\n📅 ${ev.date}\nCategory: ${ev.type}`);
    };

    eventContainer.appendChild(item);
  });
}

renderEvents();

