const path = require('path');
const multer = require('multer');

const upload = multer({
    dest: "upload/",
    limits: { fileSize: 50 * 1024 * 1024 },//50mb max limit
    storage: multer.diskStorage({
        destination: "upload/",
        filename: (_req, file, cd) => {
            cd(null, file.originalname);
        },
    }),
    fileFilter: (_req, file, cd) => {
        let ext = path.extname(file.originalname);
        if (
            ext !== ".jpg" &&
            ext !== ".jpeg" &&
            ext !== ".webp" &&
            ext !== ".png" &&
            ext !== ".mp4"
        ) {
            cd(new Error(`unsupported file typ3! ${ext}`), false);
        }
        cd(null, true);
    },
});

module.exports = upload;