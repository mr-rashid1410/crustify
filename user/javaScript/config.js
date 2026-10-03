// ─────────────────────────────────────────────
//  javaScript/config.js
//  WHY: Single place to configure the API URL.
//       Change this one file if the backend URL changes.
//  Include this script FIRST in every HTML page.
// ─────────────────────────────────────────────

// const API_URL = "http://localhost:5000/api";
const API_URL = "https://crustify.onrender.com/api";

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

// ── Password visibility toggle ───────────────────────────────────────
// Wires up every [data-pw-toggle] button to the input beside it, so the
// eye icon can reveal the password. Icons are inline SVG (no icon font),
// and the open/closed swap is handled in CSS via the .shown class.
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

// config.js may load in <head>, so wait for the fields to exist
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupPasswordToggles);
} else {
  setupPasswordToggles();
}

// ── Mobile nav: hamburger + backdrop ─────────────────────────────────
// Bound from updateNavbar(), which every page calls immediately after it
// injects navbar.html. Idempotent, so re-injection can't double-bind.
function setupNavToggle() {
  const header = document.querySelector(".header");
  const btn    = document.getElementById("navToggle");
  const nav    = document.getElementById("mainNav");
  const backdrop = document.getElementById("navBackdrop");
  if (!header || !btn || !nav || !backdrop) return;
  if (btn.dataset.navBound) return;
  btn.dataset.navBound = "1";

  const setOpen = (open) => {
    header.classList.toggle("nav-open", open);
    btn.setAttribute("aria-expanded", String(open));
    btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    backdrop.hidden = !open;
    document.body.style.overflow = open ? "hidden" : "";
  };

  btn.addEventListener("click", () => setOpen(!header.classList.contains("nav-open")));
  backdrop.addEventListener("click", () => setOpen(false));

  // Tapping any link closes the menu
  nav.addEventListener("click", (e) => {
    if (e.target.closest("a")) setOpen(false);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && header.classList.contains("nav-open")) {
      setOpen(false);
      btn.focus();
    }
  });

  // Rotating back to desktop must not leave the scroll lock stuck on
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) setOpen(false);
  });
}

// ── Navbar: show Login or Profile link based on auth state ───────────
// Called after the navbar is injected into the page
function updateNavbar() {
  setupNavToggle();

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
