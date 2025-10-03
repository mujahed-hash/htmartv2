const multer = require('multer');
const path = require('path');

const serviceStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Ensure the directory exists
        const uploadPath = 'uploads/services';
        require('fs').mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const serviceFileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPG, JPEG, and PNG are allowed.'));
    }
};

const uploadService = multer({
    storage: serviceStorage,
    fileFilter: serviceFileFilter,
    limits: {
        fileSize: 1024 * 1024 * 80 // 80 MB
    }
});

module.exports = uploadService;









