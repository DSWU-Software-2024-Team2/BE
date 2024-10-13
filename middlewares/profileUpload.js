// middlewares/profileUpload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 저장소 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/profiles/'; // 프로필 사진 저장 경로

        // 폴더가 없으면 생성
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname)); // 파일 이름 설정
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

// 단일 파일 업로드를 위한 미들웨어
module.exports = upload.single('profile_picture'); // 'profile_picture' 필드명 사용
