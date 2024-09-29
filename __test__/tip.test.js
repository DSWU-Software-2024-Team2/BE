// description : 꿀팁 게시판 관련 테스트
const request = require('supertest');
const express = require('express');
const { getAllTips, getTipsByCategory } = require('../controllers/tipController');

// Express 앱 설정
const app = express();
app.get('/tips', getAllTips); // 전체 꿀팁 게시글 조회
app.get('/tips/:category', getTipsByCategory); // 카테고리별 꿀팁 게시글 조회

// Mock Prisma 클라이언트
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    post: {
      findMany: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => mockPrisma),
  };
});

describe('Tip Controller', () => {
  describe('GET /tips', () => {
    it('should return a list of tips with pagination', async () => {
      const mockTips = [
        {
          post_id: 1,
          title: 'Tip 1',
          content: 'This is the first tip...',
          post_mileage: 10,
          _count: { postLikesDislikes: 5 },
          subCategory: { subcategory_name: 'Jobs' },
          user: { name: 'John Doe' },
        },
        {
          post_id: 2,
          title: 'Tip 2',
          content: 'This is the second tip...',
          post_mileage: 15,
          _count: { postLikesDislikes: 10 },
          subCategory: { subcategory_name: 'Certifications' },
          user: { name: 'Jane Smith' },
        },
      ];

      const prisma = require('@prisma/client').PrismaClient();
      prisma.post.findMany.mockResolvedValue(mockTips);

      const response = await request(app).get('/tips?page=1&limit=2');
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].title).toBe('Tip 1');
      expect(response.body[0].likes_count).toBe(5);
    });

    it('should handle errors and return a 500 status code', async () => {
      const prisma = require('@prisma/client').PrismaClient();
      prisma.post.findMany.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/tips?page=1&limit=2');
      expect(response.statusCode).toBe(500);
      expect(response.body.error).toBe('게시글 목록 조회 중 오류가 발생했습니다.');
    });
  });

  describe('GET /tips/:category', () => {
    it('should return a list of tips for the given category', async () => {
      const mockTips = [
        {
          post_id: 1,
          title: 'Tip for Category 1',
          content: 'This is a tip for category 1...',
          post_mileage: 20,
          _count: { postLikesDislikes: 7 },
          subCategory: { subcategory_name: 'Clubs' },
          user: { name: 'Sam Lee' },
        },
      ];

      const prisma = require('@prisma/client').PrismaClient();
      prisma.post.findMany.mockResolvedValue(mockTips);

      const response = await request(app).get('/tips/1?page=1&limit=1');
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].title).toBe('Tip for Category 1');
      expect(response.body[0].likes_count).toBe(7);
    });

    it('should handle errors and return a 500 status code', async () => {
      const prisma = require('@prisma/client').PrismaClient();
      prisma.post.findMany.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/tips/1?page=1&limit=1');
      expect(response.statusCode).toBe(500);
      expect(response.body.error).toBe('카테고리별 게시글 조회 중 오류가 발생했습니다.');
    });
  });
});
