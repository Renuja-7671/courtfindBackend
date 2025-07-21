const multer = require("multer");
const path = require("path");

// Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Save in "uploads" folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    },
});



//Arena specific storage
const storage2 = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/arenas"); // Save in "arenas" folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    },
});

//Courts specific storage
const storage3 = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/courts"); // Save in "courts" folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    },
});

//playerprofile image upload
const playerProfileImage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/player"); // Save in "upload/player" folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    },
});



// File Filter (Optional: Allow only image files)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only images are allowed"), false);
    }
};

const upload = multer({ storage, fileFilter });
const uploadArenas = multer({ storage: storage2, fileFilter });
const uploadCourts = multer({ storage: storage3, fileFilter });
const uploadPlayerProfileImage = multer({ storage: playerProfileImage, fileFilter });

module.exports = {
    upload,
    uploadArenas,
    uploadCourts,
    uploadPlayerProfileImage,
};
