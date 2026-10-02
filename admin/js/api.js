// ─────────────────────────────────────────────
//  admin/js/api.js
//  Shared helpers for all admin panel pages.
//  WHY: Centralises the API URL and auth token
//       management for the admin panel.
// ─────────────────────────────────────────────

// const API_URL = "http://localhost:5000/api";
const API_URL = "https://crustify.onrender.com/api"

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

// ── Password visibility toggle ───────────────────────────────────────
// Wires up every [data-pw-toggle] button to the input beside it.
// Icons are inline SVG; the open/closed swap is CSS via .shown.
function setupPasswordToggles() {
  document.querySelectorAll("[data-pw-toggle]").forEach((btn) => {
    if (btn.dataset.pwBound) return;   // don't bind twice
    btn.dataset.pwBound = "1";

    const input = btn.parentElement.querySelector("input");
    if (!input) return;

    btn.addEventListener("click", () => {
      const isHidden = input.type === "password";

      input.type = isHidden ? "text" : "password";
      btn.classList.toggle("shown", isHidden);
      btn.setAttribute("aria-pressed", String(isHidden));
      btn.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
    });
  });
}

// ── Sidebar drawer (mobile/tablet) ────────────────────────────────
// The sidebar is a fixed 230px column on desktop. Below 992px admin.css
// turns it into an off-canvas drawer, so it needs a trigger + backdrop.
// Every admin page includes the markup; this wires it up once.
function setupSidebarToggle() {
  const sidebar = document.querySelector(".sidebar");
  const btn     = document.querySelector(".sidebar-toggle");
  const backdrop = document.querySelector(".sidebar-backdrop");
  if (!sidebar || !btn || !backdrop) return;
  if (btn.dataset.navBound) return;
  btn.dataset.navBound = "1";

  const setOpen = (open) => {
    sidebar.classList.toggle("open", open);
    btn.setAttribute("aria-expanded", String(open));
    backdrop.hidden = !open;
    document.body.style.overflow = open ? "hidden" : "";
  };

  btn.addEventListener("click", () => setOpen(!sidebar.classList.contains("open")));
  backdrop.addEventListener("click", () => setOpen(false));

  // Navigating to another admin page should start with it closed
  sidebar.addEventListener("click", (e) => {
    if (e.target.closest("nav a")) setOpen(false);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sidebar.classList.contains("open")) {
      setOpen(false);
      btn.focus();
    }
  });

  // Rotating back to desktop must not leave the scroll lock stuck on
  window.addEventListener("resize", () => {
    if (window.innerWidth > 992) setOpen(false);
  });
}

// api.js may load in <head>, so wait for the fields to exist
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupPasswordToggles);
  document.addEventListener("DOMContentLoaded", setupSidebarToggle);
} else {
  setupPasswordToggles();
  setupSidebarToggle();
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
