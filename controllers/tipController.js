// description : 꿀팁 게시판 관련 컨트롤러
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 01. 꿀팁 게시판 전체 목록 조회 (페이지네이션 포함)
const getAllTips = async (req, res) => {
  const { page = 1, limit = 4 } = req.query; // 페이지와 한 페이지당 게시글 수
  const skip = (page - 1) * limit; // 건너뛸 게시글 수 계산

  try {
      // 게시글 조회
      const tips = await prisma.post.findMany({
          where: {
              parent_category_id: {
                  equals: 2, // 꿀팁 카테고리 ID
              },
              status: 'ACTIVE', // 활성 상태인 게시글만 조회
          },
          skip: parseInt(skip),
          take: parseInt(limit),
          orderBy: {
            created_at: 'desc', // 최신글부터 조회
          },
          include: {
              user: true, // 작성자 정보 포함
              parentCategory: true, // 부모 카테고리 정보 포함
              postLikesDislikes: true, // 좋아요 및 싫어요 정보 포함
              subCategory: true, // 하위 카테고리 정보 포함
              _count: {
                  select: { postLikesDislikes: true }, // 좋아요 수 포함
              },
          },
      });

      // 결과를 가공하여 필요한 정보만 반환
      const formattedTips = tips.map(tip => ({
          post_id: tip.post_id,
          title: tip.title,
          content: tip.content.substring(0, 100) + '...', // 본문 100자
          post_mileage: tip.post_mileage,
          likes_count: tip._count.postLikesDislikes,
          sub_category_name: tip.subCategory.subcategory_name, // 세부 카테고리 이름
          author_name: tip.user.name, // 작성자 이름
      }));

      res.status(200).json(formattedTips); // 가공된 게시글 목록 반환
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: '게시글 목록 조회 중 오류가 발생했습니다.' }); // 오류 발생 시 응답
  }
};



// 02. 카테고리별 꿀팁 목록 조회 (페이지네이션 포함)
const getTipsByCategory = async (req, res) => {
  const { category } = req.params; // URL 파라미터에서 카테고리 추출
  const { page = 1, limit = 4 } = req.query; // 페이지와 한 페이지당 게시글 수
  const skip = (page - 1) * limit; // 건너뛸 게시글 수 계산

  try {
      // 카테고리에 해당하는 꿀팁 게시글 조회
      const tips = await prisma.post.findMany({
          where: {
              parent_category_id: {
                  equals: parseInt(category), // 카테고리 ID를 정수로 변환
              },
              status: 'ACTIVE', // 활성 상태인 게시글만 조회
          },
          skip: parseInt(skip),
          take: parseInt(limit),
          orderBy: {
              created_at: 'desc', // 최신글부터 조회
          },
          include: {
              user: true, // 작성자 정보 포함
              parentCategory: true, // 부모 카테고리 정보 포함
              subCategory: true, // 하위 카테고리 정보 포함
              postLikesDislikes: true, // 좋아요 및 싫어요 정보 포함
              _count: {
                  select: { postLikesDislikes: true }, // 좋아요 수 포함
              },
          },
      });

      // 결과를 가공하여 필요한 정보만 반환
      const formattedTips = tips.map(tip => ({
          post_id: tip.post_id,
          title: tip.title,
          content: tip.content.substring(0, 100) + '...', // 본문 100자
          post_mileage: tip.post_mileage,
          likes_count: tip._count.postLikesDislikes,
          sub_category_name: tip.subCategory.subcategory_name, // 세부 카테고리 이름
          author_name: tip.user.name, // 작성자 이름
      }));

      res.status(200).json(formattedTips); // 가공된 게시글 목록 반환
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: '카테고리별 게시글 조회 중 오류가 발생했습니다.' }); // 오류 발생 시 응답
  }
};


module.exports = {
    getAllTips,
    getTipsByCategory,
};
