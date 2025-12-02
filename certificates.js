const form = document.getElementById("certificateForm");
const container = document.getElementById("achievementContainer");
const filterCategory = document.getElementById("filterCategory");

let certificates = [];

form.addEventListener("submit", function(e) {
  e.preventDefault();

  let file = certFile.files[0];
  let cert = {
    name: certName.value,
    issuer: certIssuer.value,
    date: certDate.value,
    category: certCategory.value,
    status: certStatus.value,
    url: URL.createObjectURL(file),
    type: file.type
  };

  certificates.push(cert);
  renderCards();
  form.reset();
});

function renderCards() {
  container.innerHTML = "";

  certificates
    .filter(c => filterCategory.value === "All" || c.category === filterCategory.value)
    .forEach((cert, index) => {

      let card = document.createElement("div");
      card.className = "achievement-card";

      let badge = `<span class="badge badge-${cert.status.toLowerCase()}">${cert.status}</span>`;
      let preview = cert.type.includes("pdf")
        ? `<div class='pdf-preview'><i class='fas fa-file-pdf'></i></div>`
        : `<img src="${cert.url}">`;

      card.innerHTML = `
        ${badge}
        ${preview}
        <p><strong>${cert.name}</strong></p>
        <p style="font-size: 12px">${cert.issuer}</p>
        <div class="card-actions">
          <span class="action-btn view" onclick="openPreview('${cert.url}', '${cert.type}')">View</span>
          <span class="action-btn delete" onclick="deleteCertificate(${index})">Delete</span>
        </div>
      `;
      container.appendChild(card);
    });
}

filterCategory.addEventListener("change", renderCards);

function deleteCertificate(index) {
  certificates.splice(index, 1);
  renderCards();
}

/* MODAL PREVIEW */
let modal = document.getElementById("modalPreview");
let previewImg = document.getElementById("previewImg");
let previewFrame = document.getElementById("previewFrame");
let closeBtn = document.querySelector(".close");

function openPreview(url, type) {
  modal.style.display = "block";

  if (type.includes("pdf")) {
    previewFrame.src = url;
    previewFrame.style.display = "block";
    previewImg.style.display = "none";
  } else {
    previewImg.src = url;
    previewFrame.style.display = "none";
    previewImg.style.display = "block";
  }
}
closeBtn.onclick = () => modal.style.display = "none";
window.onclick = e => (e.target == modal ? modal.style.display = "none" : null);

const profileUpload = document.getElementById("profileUpload");
const profilePreview = document.getElementById("profilePreview");

profileUpload.addEventListener("change", () => {
  const file = profileUpload.files[0];
  if (file) {
    const imgURL = URL.createObjectURL(file);
    profilePreview.src = imgURL;
    localStorage.setItem("profileImage", imgURL);
  }
});

// Load saved profile image
window.addEventListener("load", () => {
  const savedImage = localStorage.getItem("profileImage");
  if (savedImage) {
    profilePreview.src = savedImage;
  }
});

