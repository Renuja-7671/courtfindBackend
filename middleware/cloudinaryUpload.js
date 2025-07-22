const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "Player-profile", // optional folder in Cloudinary
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

const storage2 = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "Owner-profile", // optional folder in Cloudinary
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

const storage3 = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "court-images", // Optional: folder in Cloudinary
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

// Multer configuration
const uploadCourts = multer({ storage3 });

const upload = multer({ storage });
const upload2 = multer({ storage2 });

module.exports = { upload, upload2, uploadCourts };
