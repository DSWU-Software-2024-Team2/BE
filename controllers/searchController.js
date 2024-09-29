// description : 검색 관련 컨트롤러
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient(); // Prisma 클라이언트 인스턴스 생성

// 0. 게시글 포맷팅 함수
const formatPosts = (posts) => {
    return posts.map(post => ({
        post_id: post.post_id,
        title: post.title,
        content: post.content.substring(0, 100), // 내용의 첫 100자만 표시
        views: post.views,
        likes_count: post.likes_count,
        post_mileage: post.post_mileage,
        parent_category_name: post.parentCategory.parentcategory_name,
        sub_category_name: post.subCategory.subcategory_name,
    }));
};

// 01. 카테고리별 검색
const searchPosts = async (req, res) => {
    const { mainCategory, subCategory, keyword } = req.query;

    try {
        const posts = await prisma.post.findMany({
            where: {
                parent_category_id: parseInt(mainCategory),
                sub_category_id: parseInt(subCategory),
                title: {
                    contains: keyword,
                },
            },
            orderBy: {
                created_at: 'desc',
            },
            take: 5,
            include: {
                parentCategory: true,
                subCategory: true,
            },
        });

        res.json({ results: formatPosts(posts) }); // 게시글 결과 반환
    } catch (error) {
        console.error('Error in searchPosts:', error); // 디버깅을 위한 로그
        res.status(500).json({ error: '게시글 검색 중 오류가 발생했습니다.' });
    }
};

// 02. 전체 검색
const searchAll = async (req, res) => {
    const { keyword } = req.query;

    try {
        const posts = await prisma.post.findMany({
            where: {
                OR: [
                    {
                        title: {
                            contains: keyword,
                        },
                    },
                    {
                        content: {
                            contains: keyword,
                        },
                    },
                ],
            },
            orderBy: {
                created_at: 'desc',
            },
            take: 5,
            include: {
                parentCategory: true,
                subCategory: true,
            },
        });

        res.json({ results: formatPosts(posts) }); // 게시글 결과 반환
    } catch (error) {
        console.error('Error in searchAll:', error);
        res.status(500).json({ error: '전체 검색 중 오류가 발생했습니다.' });
    }
};

// 03. 실시간 검색어 순위 10개
const getRealTimeKeywords = async (req, res) => {
    try {
        const keywords = await prisma.keyword.findMany({
            orderBy: {
                search_count: 'desc',
            },
            take: 10,
        });
        res.json(keywords); // 검색어 결과 반환
    } catch (error) {
        console.error('Error in getRealTimeKeywords:', error);
        res.status(500).json({ error: '실시간 검색어 조회 중 오류가 발생했습니다.' });
    }
};

// 04. 검색어 저장 및 카운팅
const saveSearchKeyword = async (req, res) => {
    const { user_id, keyword } = req.body;

    try {
        const existingKeyword = await prisma.searchKeyword.findFirst({
            where: { keyword },
        });

        if (existingKeyword) {
            await prisma.searchKeyword.update({
                where: { keyword_id: existingKeyword.keyword_id },
                data: { search_count: { increment: 1 } },
            });
        } else {
            const newKeyword = await prisma.searchKeyword.create({
                data: {
                    keyword,
                    search_count: 1,
                },
            });
        }

        const keywordId = existingKeyword 
            ? existingKeyword.keyword_id 
            : (await prisma.searchKeyword.create({
                data: {
                    keyword,
                    search_count: 1,
                },
            })).keyword_id; // 새로 생성된 키워드의 ID 사용

        await prisma.searchHistory.create({
            data: {
                user_id,
                keyword_id: keywordId,
                searched_at: new Date(),
            },
        });

        res.status(201).json({ message: '검색어가 저장되었습니다.' });
    } catch (error) {
        console.error('Error in saveSearchKeyword:', error);
        res.status(500).json({ error: '검색어 저장 중 오류가 발생했습니다.' });
    }
};

module.exports = {
    searchPosts,
    searchAll,
    getRealTimeKeywords,
    saveSearchKeyword,
};
