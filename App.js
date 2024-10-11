// description : 서버 시작 파일
const express = require('express');
const cors = require('cors'); // CORS 모듈 추가
const authRoutes = require('./routers/authRouter');
const tipRoutes = require('./routers/tipRouter');
const searchRoutes = require('./routers/searchRouter');
const postRoutes = require('./routers/postRouter');
const reactionRoutes = require('./routers/reactionRouter');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors()); 
app.use(express.json()); 

app.use('/api/auth', authRoutes);
app.use('/api/tips', tipRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/post', postRoutes);
app.use('/api/react', reactionRoutes);

// 전역 에러 핸들러
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('서버 오류');
});

app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT}에서 실행 중입니다.`);
});
