const multer = require("multer");

const storage = multer.memoryStorage();

// File type validation (only images)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, JPG, and PNG files are allowed"), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 7 * 1024 * 1024 },
  fileFilter,
  filename: (req, file, cb) => {
    const filename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "-");
    cb(null, filename);
  },
});

module.exports = upload;
