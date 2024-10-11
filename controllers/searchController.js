// description : 검색 관련 컨트롤러
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient(); // Prisma 클라이언트 인스턴스 생성

// 00. 게시글 포맷팅 함수
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

// 00. 카테고리 ID 유효성 검사 함수
const validateCategoryId = async (categoryId, categoryModel, categoryName) => {
    if (categoryId && categoryId !== 0) { // ID가 0이 아닌 경우에만 체크
        const categoryExists = await prisma[categoryModel].findUnique({
            where: { [`${categoryName}_id`]: categoryId },
        });
        if (!categoryExists) {
            throw new Error(`존재하지 않는 ${categoryName} 카테고리 ID입니다.`);
        }
    }
};

// 01. 검색 관련 함수
const searchPosts = async (req, res) => {
    const { keyword, parentCategoryId = 0, subCategoryId = 0, page = 1, pageSize = 5 } = req.query;

    // 검색어가 두 글자 이상인지 확인
    if (keyword && keyword.length < 2) {
        return res.status(400).json({ error: '검색어는 최소 두 글자 이상 입력해야 합니다.' });
    }

    const parentId = parseInt(parentCategoryId);
    const subId = parseInt(subCategoryId);

    // 유효하지 않은 ID 확인
    if ((parentId && isNaN(parentId)) || (subId && isNaN(subId))) {
        return res.status(400).json({ error: '유효하지 않은 카테고리 ID입니다.' });
    }

    try {
        // 부모 및 하위 카테고리 ID 유효성 검사 (0인 경우 전체 검색)
        await validateCategoryId(parentId, 'parentCategory', 'parentcategory');
        await validateCategoryId(subId, 'subCategory', 'subcategory');

        // 1차 필터링: 부모 카테고리 조건 (ID가 0이면 전체 검색)
        const mainCategoryCondition = parentId !== 0 ? { parent_category_id: parentId } : {};

        // 2차 필터링: 하위 카테고리 조건 (ID가 0이면 전체 검색)
        const subCategoryCondition = subId !== 0 ? { sub_category_id: subId } : {};

        // 검색 조건 설정
        const whereConditions = {
            ...mainCategoryCondition,
            ...subCategoryCondition,
            ...(keyword ? {
                OR: [
                    { title: { contains: keyword } },
                    { content: { contains: keyword } },
                ],
            } : {}) // 키워드가 있을 때만 추가
        };

        // 게시물 검색 쿼리
        const posts = await prisma.post.findMany({
            where: whereConditions,
            orderBy: { created_at: 'desc' },
            skip: (page - 1) * pageSize, // 페이지 계산
            take: parseInt(pageSize),      // 페이지당 개수
            include: { parentCategory: true, subCategory: true },
        });

        // 결과가 없으면 메시지 반환
        if (posts.length === 0) {
            return res.status(404).json({ message: '검색 결과가 없습니다.' });
        }

        // 포맷팅된 결과 반환
        res.json({ results: formatPosts(posts) });

    } catch (error) {
        console.error('Error in searchPosts:', error.message);
        res.status(500).json({ error: `검색 중 오류가 발생했습니다: ${error.message}` });
    }
};

// 02. 실시간 검색어 순위 10개
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

// 03. 검색어 저장 및 카운팅
const saveSearchKeyword = async (req, res) => {
    const { user_id, keyword } = req.body;

    try {
        // 먼저 keyword가 존재하는지 확인
        let existingKeyword = await prisma.searchKeyword.findFirst({
            where: { keyword }, // 검색어가 있는지 확인
        });

        if (existingKeyword) {
            // 검색어가 존재하면 search_count 증가
            await prisma.searchKeyword.update({
                where: { keyword_id: existingKeyword.keyword_id },
                data: { search_count: { increment: 1 } },
            });
        } else {
            // 존재하지 않으면 새로 생성
            existingKeyword = await prisma.searchKeyword.create({
                data: { keyword, search_count: 1 },
            });
        }

        // 검색 기록 저장
        await prisma.searchHistory.create({
            data: {
                user_id,
                keyword_id: existingKeyword.keyword_id, // 생성되거나 기존의 키워드 ID 사용
                searched_at: new Date(),
            },
        });

        res.status(201).json({ message: '검색어가 저장되었습니다.' });
    } catch (error) {
        console.error('Error in saveSearchKeyword:', error);
        res.status(500).json({ error: '검색어 저장 중 오류가 발생했습니다.', details: error.message }); // 에러 세부 정보 추가
    }
};


module.exports = {
    searchPosts,
    getRealTimeKeywords,
    saveSearchKeyword,
};
