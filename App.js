// description : 서버 시작 파일
const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routers/authRouter');
const tipRoutes = require('./routers/tipRouter');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use('/api/auth', authRoutes);
app.use('/api/tips', tipRoutes);

app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT}에서 실행 중입니다.`);
});
