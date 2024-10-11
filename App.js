// description : 서버 시작 파일
const express = require('express');
const cors = require('cors'); // CORS 모듈 추가
const morgan = require('morgan');
const authRoutes = require('./routers/authRouter');

const infoRoutes = require('./routers/infoRouter');
const communityRoutes = require('./routers/communityRouter');
const tipRoutes = require('./routers/tipRouter');

const postRoutes = require('./routers/postRouter');
const reactionRoutes = require('./routers/reactionRouter');
const searchRoutes = require('./routers/searchRouter');

const cartRoutes = require('./routers/cartRouter');
const payRoutes = require('./routers/payRouter');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); 
app.use(express.json()); 
app.use(morgan('combined')); 

app.use('/api/auth', authRoutes);

app.use('/api/info', infoRoutes);
app.use('/api/tips', tipRoutes);
app.use('/api/communities', communityRoutes);

app.use('/api/search', searchRoutes);
app.use('/api/post', postRoutes);
app.use('/api/react', reactionRoutes);

app.use('/api/cart', cartRoutes);
app.use('/api/payment', payRoutes);


// 연결 테스트
app.get('/api/test', (req, res) => {
    res.json({ message: 'Hello from the server!' });
});

// 전역 에러 핸들러
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('서버 오류');
});

app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT}에서 실행 중입니다.`);
});