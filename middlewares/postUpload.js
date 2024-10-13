// middlewares/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const postId = req.body.postId; // 게시글 ID
        const dir = `uploads/posts/${postId}/`;

        // 폴더가 없으면 생성
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// multer 인스턴스 생성
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 파일 크기 제한 (5MB)
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/; // 허용할 파일 형식
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Error: 파일 형식이 올바르지 않습니다.');
        }
    }
});

// 여러 파일 업로드를 위한 미들웨어
module.exports = upload.array('images', 10); // 'images' 필드명을 기반으로 최대 10개 파일 업로드
