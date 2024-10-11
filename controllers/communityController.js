// description : 커뮤니티 게시판 관련 컨트롤러
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const DEFAULT_LIMIT = 5;
const COUMMUNITY_CATEGORY_ID = 3; // 커뮤니티 카테고리 ID

// 01. 커뮤니티 게시판 전체 목록 조회 (페이지네이션 포함)
const getAllCommunities = async (req, res) => {
  let { page = 1, limit = DEFAULT_LIMIT } = req.query;
  page = Math.max(1, parseInt(page));
  limit = Math.max(1, parseInt(limit));
  const skip = (page - 1) * limit;

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
              status: 'ACTIVE',
          },
          skip,
          take: limit,
          orderBy: { created_at: 'desc' },
          include: includeOptions,
      });

      const formattedTips = tips.map(tip => ({
          post_id: tip.post_id,
          title: tip.title,
          content: tip.content.substring(0, 100) + '...',
          post_mileage: tip.post_mileage,
          likes_count: tip._count.postLikesDislikes,
          sub_category_name: tip.subCategory?.subcategory_name || 'N/A', // null 체크
          author_nickname: tip.user?.nickname  || 'Anonymous', // null 체크
      }));

      res.status(200).json(formattedTips);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: '게시글 목록 조회 중 오류가 발생했습니다.' });
  }
};

// 02. 카테고리별 꿀팁 목록 조회 (페이지네이션 포함)
const getCommunitiesByCategory = async (req, res) => {
    const { category } = req.params;  // URL 파라미터에서 세부 카테고리 받기
    let { page = 1, limit = DEFAULT_LIMIT } = req.query;  // 페이지네이션 관련 쿼리 받기
  
    page = Math.max(1, parseInt(page));  // 페이지 번호
    limit = Math.max(1, parseInt(limit));  // 한 페이지당 게시물 수
    const skip = (page - 1) * limit;  // 스킵할 게시물 계산
  
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
            parent_category_id: COUMMUNITY_CATEGORY_ID,  // 부모 카테고리 고정
            sub_category_id: { equals: parseInt(category) },  // 세부 카테고리 필터링
            status: 'ACTIVE',  // 활성화된 게시물만 조회
        };
  
        const tips = await prisma.post.findMany({
            where: whereOptions,
            skip,
            take: limit,
            orderBy: { created_at: 'desc' },  // 최신순 정렬
            include: includeOptions,
        });
  
        const formattedTips = tips.map(tip => ({
            post_id: tip.post_id,
            title: tip.title,
            content: tip.content.substring(0, 100) + '...',  // 게시물 내용 미리보기
            post_mileage: tip.post_mileage,
            likes_count: tip._count.postLikesDislikes,
            sub_category_name: tip.subCategory?.subcategory_name || 'N/A',  // 세부 카테고리 이름
            author_nickname: tip.user?.nickname || 'Anonymous',  // 작성자 닉네임
        }));
  
        res.status(200).json(formattedTips);  // 결과 반환
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: '카테고리별 게시글 조회 중 오류가 발생했습니다.' });
    }
};

module.exports = {
    getAllCommunities,
    getCommunitiesByCategory,
};
