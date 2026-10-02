# AGENTS.md

Crustify — an online food ordering mini-project (pizza, burgers, sandwiches, shawarma, sides, desserts, beverages). MERN-adjacent, **no build tooling anywhere**.

## Repo layout

```
admin/   static admin panel  (vanilla HTML/CSS/JS, no npm)
user/    customer frontend   (vanilla HTML/CSS/JS, no npm)
backend/ Express + Mongoose API (npm)
docgen/  Node script that builds the .docx project report (npm)
```

The four folders are **independent projects**. There is no root `package.json`, no monorepo tooling, and no `.git` repo.

## Architecture

```
admin/  ─┐
         ├─► fetch("http://localhost:5000/api") ─► backend/ (Express + Mongoose → MongoDB Atlas)
user/   ─┘
docgen/ ─► reads user/images ─► writes Pizza_Mania_Miniproject_Documentation.docx
```

## Categories

Products are grouped by a **Category** collection, not a hardcoded enum.
`Product.category` is a required category-name **string**.

The shipped set is seeded by `backend/seed.js` and mirrored in
`STARTER_CATEGORIES` in `backend/controllers/categoryController.js` (which only
bootstraps an empty collection). Keep the two in sync:

```
pizza (default), burger, sandwich, shawarma, sides, desserts, beverages
```

Rules enforced in `categoryController.js`:

1. Names are unique, case-insensitively.
2. Exactly one category has `isDefault: true`.
3. The default can be renamed and can be re-pointed elsewhere, but never deleted.
4. Deleting any other category moves its products to the default, so no product
   is left pointing at a category that no longer exists.

Customer filtering goes through the backend, not the client:
`GET /api/products?category=<name>` — trimmed, case-insensitive, exact match;
omitting the param returns everything. `GET /api/categories` is **public** (it
drives the menu filter chips); every other category route is `adminOnly`.

## Commands

**backend/**
```bash
npm install
npm run dev     # nodemon server.js
npm start       # node server.js  → http://localhost:5000
npm run seed    # wipes Product collection, inserts 17 products + 7 categories + admin user
node test_mongodb.js   # standalone connectivity smoke test
```

**user/** and **admin/** — no build step. Serve statically, e.g. VS Code Live Server.
`user/` is configured for port **5501**; `admin/` needs its own static server.

**docgen/**
```bash
node generate.js   # regenerate the .docx report (no npm script exists for this)
node extract.js    # one-off: dump fixmate .docx to html/txt
```

There are **no** lint, format, typecheck, or test commands in this repo. `docgen/package.json` has a placeholder `npm test` that always fails.

## Hard rules

1. **`API_URL` is duplicated and hardcoded** at `admin/js/api.js:8` and `user/javaScript/config.js:8`. If you change one, change both.
2. **`config.js` must load first** on every user page (see its header comment). It defines `API_URL`, `getToken()`, `getUser()`, `isLoggedIn()`, `logout()`, `authHeaders()`, `updateNavbar()`, plus the image helpers `productImage()` / `productImageFallback()`.
3. **`navbar.html` is injected at runtime** — every user page `fetch()`es it into `<div id="navbar">`. Don't move it out of `user/html/`.
4. **Product `image` has three possible forms** and must always be resolved through a helper, never templated by hand:
   - `uploads/<filename>` — uploaded from the admin product form, saved to `backend/uploads/` and served by the API at `/uploads/<filename>`.
   - `https://…` — a hosted image, used as-is.
   - `margherita.png` — a bundled file in `user/images/`.

   Use `productImage(image)` (`user/javaScript/config.js`) or `adminProductImage(image)` (`admin/js/api.js`). Both build the same absolute `http://localhost:5000/uploads/…` URL for uploads, which is why the admin table and the customer menu always show the identical picture regardless of which static server each app runs on.
5. **Auth keys differ by app**: user frontend uses `token`/`user`; admin panel uses `adminToken`/`adminUser`.
6. **Route ordering matters** — e.g. `/admin/all` must be declared before `/:id` in `routes/productRoutes.js`, `routes/cartRoutes.js` (`/clear` before `/:productId`), `routes/orderRoutes.js`, and `routes/categoryRoutes.js` (`/default` before `/:id`). Preserve that when adding routes.
7. **Never rename `user/javaScript/`** or `user/css/contect.css` (typo is load-bearing) without updating every referencing path. Case-sensitive filesystems will break.
8. **Secrets**: `backend/.env` holds a live MongoDB Atlas URI and `JWT_SECRET`. Don't commit it, don't paste it into docs, don't echo it. The admin login is still `admin@pizzamania.com` / `admin@123` — rebranding to Crustify deliberately left the credential untouched so existing accounts keep working.
9. **The health/root check is `GET /`**, not `/api/health` (`backend/server.js`).

## Product image upload

`POST /api/products/upload` (`protect` + `adminOnly`) takes one
`multipart/form-data` field named `image` and returns
`{ image: "uploads/<filename>" }`, which is what gets written to
`Product.image`. `multer` handles it in `middleware/uploadMiddleware.js`.

- Files land in `backend/uploads/`, mounted at `/uploads` in `server.js`.
- Filenames are generated server-side (timestamp + random), never taken from
  the client, so a crafted name cannot escape the folder or overwrite a file.
- Restricted to jpg/png/webp/gif/avif by MIME type, 5 MB max, one file.
- There is no central error middleware, so `uploadSingleImage()` converts
  multer errors into a clean `400 { message }`.

The admin form uploads the file **first**, then sends a normal JSON
`POST`/`PUT` for the product — so `createProduct`/`updateProduct` stay
unchanged JSON handlers. If no file is chosen, the form falls back to the
text field, which still accepts a hosted URL or a `user/images` filename.

Note: replacing an image leaves the previous file orphaned in
`backend/uploads/`. There is no cleanup job; delete by hand if needed.

## Theming

The customer palette lives as CSS custom properties on `:root` in
`user/css/home.css`, which **every** user page loads. The other user stylesheets
reference `var(--bg)`, `var(--surface)`, `var(--accent)`, etc. — never raw hex.
Change a colour there, not per-file. Current theme: warm dark espresso surfaces
with an amber accent.

`admin/css/admin.css` was intentionally **not** re-themed to match; the admin
panel got copy-only rebranding, per the user's decision.

## Conventions

**backend/** — CommonJS, `require`, no build/transpile. Mongoose schemas in `models/`, business logic in `controllers/`, thin `routes/`, JWT guard in `middleware/authMiddleware.js` (`protect`, `adminOnly`). Errors are ad-hoc `try/catch` returning `res.status(500).json({ message: "Server error: " + ... })` — there is no centralized error middleware. No validation library (no Zod/Joi/express-validator). Match this style; don't introduce a validation layer in one endpoint only.

**user/ & admin/** — vanilla ES6+, hand-written `fetch()`, template-literal HTML injected via `innerHTML`. **Zero third-party/CDN dependencies — do not add any.** Icons are Unicode emoji glyphs, not an icon font. Toasts in admin via `showToast()` from `admin/js/api.js`; the user frontend uses raw `alert()`. Every admin page duplicates its sidebar markup with a hardcoded `.active` class — follow that pattern rather than restructuring it.

## Known issues (pre-existing — don't "rediscover" them)

- Stale `fontend` → `user` rename fallout: `user/.vscode/settings.json` (`liveServer.settings.root`). The `admin/products.html` image path and `admin/js/api.js` comment were fixed during the Crustify rebrand.
- `docgen/package.json` declares `main: "index.js"`, which doesn't exist.
- `docgen/fixmate.html` (5.3 MB) and `fixmate.txt` are generated artifacts from an **unrelated project** left in the tree.
- CORS is fully open (`origin: "*"`) in `backend/server.js`.
- `user/images/` is ~26 MB with several 2–3 MB PNGs. Products now mostly point at hosted URLs; these are fallbacks.
- `docgen/generate.js` contains placeholder `"Student Name 1 (Roll No.)"` strings that must be filled before submission.
- `.env` still carries a `pizzamania_`-prefixed `JWT_SECRET` and the seed still creates `admin@pizzamania.com`. Intentional — renaming the secret would invalidate every existing token.

## Editing the project report

`docgen/generate.js` is the source of truth for `Pizza_Mania_Miniproject_Documentation.docx`. Edit the script and re-run `node generate.js` — don't hand-edit the .docx. It reads images from `../user/images`, so new screenshots must land there first.