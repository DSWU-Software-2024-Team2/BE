// description : 커뮤니티 게시판 관련 컨트롤러
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const COUMMUNITY_CATEGORY_ID = 3; // 커뮤니티 카테고리 ID

// 01. 커뮤니티 게시판 전체 목록 조회 (페이지네이션 제거)
const getAllCommunities = async (req, res) => {
    try {
        const includeOptions = {
            user: true,
            parentCategory: true,
            postLikesDislikes: true,
            subCategory: true,
            _count: { select: { postLikesDislikes: true } },
        };

        const tips = await prisma.post.findMany({
            where: {
                parent_category_id: { equals: COUMMUNITY_CATEGORY_ID },
            },
            orderBy: { created_at: 'desc' },
            include: includeOptions,
        });

        const formattedTips = tips.map(tip => ({
            post_id: tip.post_id,
            title: tip.title,
            content: tip.content.substring(0, 100) + '...', // 내용 미리보기
            post_mileage: tip.post_mileage,
            likes_count: tip._count.postLikesDislikes,
            sub_category_name: tip.subCategory?.subcategory_name || 'N/A', // null 체크
            author_nickname: tip.user?.nickname || 'Anonymous', // null 체크
        }));

        // 결과가 없을 경우 메시지 반환
        //if (formattedTips.length === 0) {
        //    return res.status(404).json({ message: '게시글이 없습니다.' });
        //}

        res.status(200).json(formattedTips);
    } catch (error) {
        console.error('Error retrieving communities:', error);
        res.status(500).json({ error: '게시글 목록 조회 중 오류가 발생했습니다.' });
    }
};

// 02. 카테고리별 커뮤니티 목록 조회 (페이지네이션 제거)
const getCommunitiesByCategory = async (req, res) => {
    const { category } = req.params; // URL 파라미터에서 세부 카테고리 받기

    try {
        const includeOptions = {
            user: true,
            parentCategory: true,
            subCategory: true,
            postLikesDislikes: true,
            _count: { select: { postLikesDislikes: true } },
        };

        // 부모 카테고리는 상수로 고정하고 세부 카테고리 필터링
        const whereOptions = {
            parent_category_id: COUMMUNITY_CATEGORY_ID, // 부모 카테고리 고정
            sub_category_id: { equals: parseInt(category) }, // 세부 카테고리 필터링
        };

        const tips = await prisma.post.findMany({
            where: whereOptions,
            orderBy: { created_at: 'desc' }, // 최신순 정렬
            include: includeOptions,
        });

        const formattedTips = tips.map(tip => ({
            post_id: tip.post_id,
            title: tip.title,
            content: tip.content.substring(0, 100) + '...', // 게시물 내용 미리보기
            post_mileage: tip.post_mileage,
            likes_count: tip._count.postLikesDislikes,
            sub_category_name: tip.subCategory?.subcategory_name || 'N/A', // 세부 카테고리 이름
            author_nickname: tip.user?.nickname || 'Anonymous', // 작성자 닉네임
        }));

        // 결과가 없을 경우 메시지 반환
        //if (formattedTips.length === 0) {
        //    return res.status(404).json({ message: '게시글이 없습니다.' });
        //}

        res.status(200).json(formattedTips); // 결과 반환
    } catch (error) {
        console.error('Error retrieving communities by category:', error);
        res.status(500).json({ error: '카테고리별 게시글 조회 중 오류가 발생했습니다.' });
    }
};

module.exports = {
    getAllCommunities,
    getCommunitiesByCategory,
};
