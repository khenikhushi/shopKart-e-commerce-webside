const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const OUTPUT_IMAGE_SIZE = 1200;
const WEBP_QUALITY = 90;

const storage = multer.memoryStorage();

const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/jpg',
]);

const baseUpload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      const error = new Error(
        'Only JPG, PNG, WEBP, and GIF image files are allowed'
      );
      error.statusCode = 400;
      cb(error);
      return;
    }

    cb(null, true);
  },
});

const buildOutputFileName = (fieldName) => {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  return `${fieldName}-${uniqueSuffix}.webp`;
};

const toFlatFileList = (files) => {
  if (!files) {
    return [];
  }

  if (Array.isArray(files)) {
    return files;
  }

  if (files.fieldname) {
    return [files];
  }

  return Object.values(files).flat();
};

const processFile = async (file) => {
  const filename = buildOutputFileName(file.fieldname || 'image');
  const outputPath = path.join(uploadDir, filename);

  await sharp(file.buffer)
    .rotate()
    .resize(OUTPUT_IMAGE_SIZE, OUTPUT_IMAGE_SIZE, {
      fit: 'contain',
      position: 'centre',
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .webp({ quality: WEBP_QUALITY })
    .toFile(outputPath);

  const stats = fs.statSync(outputPath);

  return {
    ...file,
    destination: uploadDir,
    filename,
    mimetype: 'image/webp',
    path: outputPath,
    size: stats.size,
  };
};

const processUploadedImages = async (req, res, next) => {
  const pendingFiles = [
    ...toFlatFileList(req.files),
    ...toFlatFileList(req.file),
  ].filter(Boolean);

  if (pendingFiles.length === 0) {
    req.processedFiles = [];
    next();
    return;
  }

  try {
    const processedFiles = await Promise.all(
      pendingFiles.map((file) => processFile(file))
    );

    processedFiles.forEach((file) => {
      delete file.buffer;
    });

    req.processedFiles = processedFiles;
    req.files = processedFiles;
    [req.file] = processedFiles;

    next();
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    error.message = 'Image processing failed';
    next(error);
  }
};

const upload = {
  single(fieldName) {
    return [
      baseUpload.single(fieldName),
      processUploadedImages,
    ];
  },
  productImages() {
    return [
      baseUpload.fields([
        { name: 'image', maxCount: 1 },
        { name: 'images', maxCount: 6 },
      ]),
      processUploadedImages,
    ];
  },
};

module.exports = upload;
