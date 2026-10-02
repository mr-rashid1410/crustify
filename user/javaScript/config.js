// ─────────────────────────────────────────────
//  javaScript/config.js
//  WHY: Single place to configure the API URL.
//       Change this one file if the backend URL changes.
//  Include this script FIRST in every HTML page.
// ─────────────────────────────────────────────

const API_URL = "http://localhost:5000/api";

// Where the bundled fallback photos live, relative to html/
const LOCAL_IMAGE_DIR = "../images/";

// Where the backend serves images uploaded from the admin panel
const UPLOAD_BASE = API_URL.replace(/\/api\/?$/, "");

// ── Product images ────────────────────────────────────────────────────
// A product's `image` can be any of three things, so resolve each one
// to a URL the browser can actually load:
//   1. "uploads/abc.png"  → an image uploaded via the admin panel,
//                           served by the backend at /uploads/abc.png
//   2. "https://…"        → a hosted image, used as-is
//   3. "margherita.png"   → a bundled file in user/images/
function productImage(image) {
  if (!image) return productImageFallback();

  // 1. Uploaded through the admin panel
  if (image.startsWith("uploads/")) {
    return `${UPLOAD_BASE}/${image}`;
  }

  // 2. Hosted image
  if (/^https?:\/\//i.test(image)) return image;

  // 3. Bundled file in user/images/
  return `${LOCAL_IMAGE_DIR}${image}`;
}

// Used as the <img onerror> fallback when a photo fails to load
function productImageFallback() {
  return `${LOCAL_IMAGE_DIR}margherita.png`;
}

// ── Auth helpers ──────────────────────────────────────────────────────

function getToken() {
  return localStorage.getItem("token");
}

function getUser() {
  const u = localStorage.getItem("user");
  return u ? JSON.parse(u) : null;
}

function isLoggedIn() {
  return !!getToken();
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("lastOrderId");
  window.location.href = "login.html";
}

// ── Auth header for fetch requests ───────────────────────────────────

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

// ── Navbar: show Login or Profile link based on auth state ───────────
// Called after the navbar is injected into the page
function updateNavbar() {
  const authLink = document.getElementById("authLink");
  if (!authLink) return;

  const user = getUser();
  if (user) {
    // Show only the user icon — no name, no logout in header
    authLink.innerHTML = `<a href="profile.html" title="${user.name}" style="font-size:22px;text-decoration:none;">👤</a>`;
  } else {
    authLink.innerHTML = `<a href="login.html">Login</a>`;
  }
}
