// description : testing the login function
const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('../routers/authRouter'); // 경로에 맞게 수정하세요
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const app = express();
const prisma = new PrismaClient();

app.use(bodyParser.json());
app.use('/api/auth', authRoutes);

// 테스트 전에 데이터베이스 초기화
beforeAll(async () => {
    const hashedPassword = await bcrypt.hash('password123', 10);
    await prisma.users.createMany({
        data: [
            {
                email: 'test@example.com',
                password: hashedPassword,
                student_number: 123456,
                name: 'sss',
                major : "chem",
                nickname :" dd",
            },
        ],
    });
});

// 테스트 후 데이터베이스 정리
afterAll(async () => {
    await prisma.users.deleteMany(); // 모든 사용자 삭제
    await prisma.$disconnect();
});

describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({ email: 'test@example.com', password: 'password123' });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
        expect(response.body.user.email).toBe('test@example.com');
    });

    it('should return 401 for invalid email', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({ email: 'invalid@example.com', password: 'password123' });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('잘못된 이메일 또는 비밀번호입니다.');
    });

    it('should return 401 for invalid password', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({ email: 'test@example.com', password: 'wrongpassword' });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('잘못된 이메일 또는 비밀번호입니다.');
    });
});
