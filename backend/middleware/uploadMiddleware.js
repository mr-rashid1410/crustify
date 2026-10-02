// ─────────────────────────────────────────────
//  middleware/uploadMiddleware.js
//  WHY: Handles the multipart/form-data image upload
//       from the admin product form.
//
//  Files land in backend/uploads/ and are served publicly
//  at /uploads/<filename> (see server.js). Product.image
//  then stores "uploads/<filename>", which BOTH frontends
//  resolve to the same absolute URL — so an image uploaded
//  in the admin panel shows up identically in the customer
//  menu, no matter which static server each app runs on.
// ─────────────────────────────────────────────
const multer = require("multer");
const path   = require("path");
const fs     = require("fs");

const UPLOAD_DIR = path.join(__dirname, "..", "uploads");

// Create the folder up front so the first upload can't fail on ENOENT
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Only these image types are accepted, mapped to the extension we store
const ALLOWED_TYPES = {
  "image/jpeg": ".jpg",
  "image/png":  ".png",
  "image/webp": ".webp",
  "image/gif":  ".gif",
  "image/avif": ".avif",
};

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),

  filename: (req, file, cb) => {
    // Never reuse the client's filename — a crafted name could contain
    // path separators or overwrite an existing upload. Build our own.
    const ext  = ALLOWED_TYPES[file.mimetype] || ".jpg";
    const base = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${base}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_BYTES, files: 1 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_TYPES[file.mimetype]) return cb(null, true);
    cb(new Error("Only image files are allowed (jpg, png, webp, gif, avif)"));
  },
});

// Wraps multer so an upload problem returns a clean 400 instead of
// throwing — this project has no centralised error middleware.
const uploadSingleImage = (field) => (req, res, next) => {
  upload.single(field)(req, res, (err) => {
    if (!err) return next();

    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? `Image is too large (max ${Math.round(MAX_BYTES / 1024 / 1024)} MB)`
        : err.message;

    res.status(400).json({ message });
  });
};

module.exports = { uploadSingleImage, UPLOAD_DIR };
