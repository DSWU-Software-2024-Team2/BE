const request = require('supertest');
const express = require('express');
const { searchPosts, searchAll, getRealTimeKeywords, saveSearchKeyword } = require('../controllers/searchController');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const app = express();
app.use(express.json());
app.get('/search/posts', searchPosts);
app.get('/search/all', searchAll);
app.get('/search/keywords', getRealTimeKeywords);
app.post('/search/save', saveSearchKeyword);

jest.mock('@prisma/client', () => {
    const mPrismaClient = {
        post: {
            findMany: jest.fn(),
        },
        keyword: {
            findMany: jest.fn(),
        },
        searchKeyword: {
            findFirst: jest.fn(),
            update: jest.fn(),
            create: jest.fn(),
        },
        searchHistory: {
            create: jest.fn(),
        },
    };
    return {
        PrismaClient: jest.fn(() => mPrismaClient),
    };
});

describe('Search Controller', () => {
    const mockPrisma = new PrismaClient();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should search posts by category and keyword', async () => {
        mockPrisma.post.findMany.mockResolvedValue([{ 
            post_id: 1, 
            title: 'Test Post', 
            content: 'This is a test post content.', 
            views: 100, 
            likes_count: 10, 
            post_mileage: 5, 
            parentCategory: { parentcategory_name: 'Category1' }, 
            subCategory: { subcategory_name: 'SubCategory1' } 
        }]);

        const response = await request(app)
            .get('/search/posts?mainCategory=1&subCategory=1&keyword=test')
            .expect(200);

        expect(response.body.results).toHaveLength(1);
        expect(response.body.results[0].title).toBe('Test Post');
    });

    it('should search all posts by keyword', async () => {
        mockPrisma.post.findMany.mockResolvedValue([{ 
            post_id: 2, 
            title: 'Another Test Post', 
            content: 'Another test content.', 
            views: 50, 
            likes_count: 5, 
            post_mileage: 3, 
            parentCategory: { parentcategory_name: 'Category2' }, 
            subCategory: { subcategory_name: 'SubCategory2' } 
        }]);

        const response = await request(app)
            .get('/search/all?keyword=Another')
            .expect(200);

        expect(response.body.results).toHaveLength(1);
        expect(response.body.results[0].title).toBe('Another Test Post');
    });

    it('should get real-time keywords', async () => {
        mockPrisma.keyword.findMany.mockResolvedValue([{ keyword: 'test', search_count: 5 }]);

        const response = await request(app)
            .get('/search/keywords')
            .expect(200);

        expect(response.body).toHaveLength(1);
        expect(response.body[0].keyword).toBe('test');
    });

    it('should save search keyword', async () => {
        mockPrisma.searchKeyword.findFirst.mockResolvedValue(null);
        mockPrisma.searchKeyword.create.mockResolvedValue({ keyword_id: 1 });
        mockPrisma.searchHistory.create.mockResolvedValue({});

        const response = await request(app)
            .post('/search/save')
            .send({ user_id: 1, keyword: 'test keyword' })
            .expect(201);

        expect(response.body.message).toBe('검색어가 저장되었습니다.');
    });
});
