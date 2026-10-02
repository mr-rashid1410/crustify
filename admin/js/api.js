// ─────────────────────────────────────────────
//  admin/js/api.js
//  Shared helpers for all admin panel pages.
//  WHY: Centralises the API URL and auth token
//       management for the admin panel.
// ─────────────────────────────────────────────

const API_URL = "http://localhost:5000/api";

// Where the bundled product photos live, relative to admin/
const LOCAL_IMAGE_DIR = "../user/images/";

// Where the backend serves images uploaded from the product form
const UPLOAD_BASE = API_URL.replace(/\/api\/?$/, "");

// A product's `image` can be an admin upload ("uploads/abc.png"), a
// hosted URL, or a bundled filename in user/images — resolve all three.
function adminProductImage(image) {
  if (!image) return `${LOCAL_IMAGE_DIR}margherita.png`;
  if (image.startsWith("uploads/")) return `${UPLOAD_BASE}/${image}`;
  if (/^https?:\/\//i.test(image)) return image;
  return `${LOCAL_IMAGE_DIR}${image}`;
}

// ── Upload one product image ──────────────────────────────────────────
// Sends the file as multipart/form-data and returns the value to store
// in Product.image ("uploads/<filename>").
async function uploadProductImage(file) {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`${API_URL}/products/upload`, {
    method:  "POST",
    headers: { Authorization: `Bearer ${getAdminToken()}` }, // no Content-Type: browser sets the boundary
    body:    formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Image upload failed");

  return data.image;
}

function getAdminToken() {
  return localStorage.getItem("adminToken");
}

function getAdminUser() {
  const u = localStorage.getItem("adminUser");
  return u ? JSON.parse(u) : null;
}

function isAdminLoggedIn() {
  const token = getAdminToken();
  const user  = getAdminUser();
  return !!(token && user && user.role === "admin");
}

function adminLogout() {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminUser");
  window.location.href = "login.html";
}

function adminHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization:  `Bearer ${getAdminToken()}`,
  };
}

// Guard: redirect to login if not admin
function requireAdmin() {
  if (!isAdminLoggedIn()) {
    window.location.href = "login.html";
  }
}

// ── Toast notification ────────────────────────────────────────────────
function showToast(message, type = "success") {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.className   = `toast ${type} show`;
  setTimeout(() => { toast.className = `toast ${type}`; }, 3000);
}

// ── Set active sidebar link ───────────────────────────────────────────
function setActiveNav(page) {
  document.querySelectorAll(".sidebar nav a").forEach(a => {
    a.classList.toggle("active", a.getAttribute("href") === page);
  });
}
