const multer = require('multer');

const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (!allowedImageTypes.includes(file.mimetype)) {
      return cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
    }

    cb(null, true);
  },
});

const singleImageUpload = (fieldName) => (req, res, next) => {
  imageUpload.single(fieldName)(req, res, (error) => {
    if (!error) return next();

    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'Image must be 5MB or smaller' });
    }

    if (
      error.message === 'Field name missing'
      || (error instanceof multer.MulterError && error.code === 'LIMIT_UNEXPECTED_FILE')
    ) {
      return res.status(400).json({
        message: `Upload must use multipart/form-data with a file field named "${fieldName}"`,
      });
    }

    res.status(400).json({ message: error.message || 'Invalid image upload' });
  });
};

module.exports = { singleImageUpload };
