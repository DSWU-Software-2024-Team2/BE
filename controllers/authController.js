// description : 로그인 및 회원가입 관련 컨트롤러
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();
const SECRET_KEY = process.env.SECRET_KEY || 'your_secret_key';

/* 
[01] - 로그인 관련 기능
- 로그인 성공 시 users에서 is_logged_in이 true가 되어야 함
- 반환 되는 정보는 "닉네임" & "아이디" & "email"
*/
async function login(req, res) {
    const { email, password } = req.body; 

    // 01. 사용자 찾기
    const user = await prisma.users.findUnique({
        where: { email }, 
    });

    // 02. 사용자 존재 여부 확인
    if (!user) {
        return res.status(401).json({ message: '없는 사용자입니다.' });
    }

    // 03. 비밀번호 확인
    //const isValidPassword = await bcrypt.compare(password, user.password);
    //if (!isValidPassword) {
    //    return res.status(401).json({ message: '잘못된 이메일 또는 비밀번호입니다.' });
    //}
    
    // 03. 비밀번호 확인 (일반 비교)
    if (password !== user.password) {
        return res.status(401).json({ message: '잘못된 이메일 또는 비밀번호입니다.' });
    }

    // 04. 사용자 로그인 상태 업데이트
    await prisma.users.update({
        where: { email },
        data: { is_logged_in: true }, // 로그인 상태를 true로 설정
    });

    // 05. JWT 생성
    const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });

    // 06. 성공시 반환되는 정보
    return res.json({
        message: '로그인 성공',
        token,
        user: {
            id: user.id,
            nickname: user.nickname, 
            email : user.email,
        },
    });
}

module.exports = { login };