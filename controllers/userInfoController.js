// description : 내 정보 관련 컨트롤러
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 01. 내 정보에서 사용자 정보 불러오기
const getUserInfo = async (req, res) => {
  const userId = parseInt(req.query.userId); // 쿼리 파라미터에서 userId를 가져옴

  if (isNaN(userId)) {
      return res.status(400).json({ error: '유효하지 않은 사용자 ID입니다.' });
  }

  try {
      const user = await prisma.users.findUnique({
          where: { id: userId }, // userId를 사용하여 사용자 조회
          include: {
              memberships: {
                  include: {
                      membershipGrade: true, // MembershipGrade 정보 포함
                  },
              },
              mileage: true, // 마일리지 정보 포함
              profile: { // 프로필 정보 포함
                  select: {
                      profile_picture: true, // 프로필 이미지 가져오기
                  }
              }
          },
      });

      if (!user) {
          return res.status(404).json({ error: '존재하지 않는 사용자입니다.' });
      }

      // 서버 도메인 설정
      const serverDomain = process.env.SERVER_DOMAIN || 'http://172.18.38.29:3000/'; // 환경 변수에서 도메인 가져오기

      // 기본 프로필 이미지 URL
      const defaultProfilePicture = 'uploads/profiles/profile-0.jpg'; // 기본 이미지 경로 설정

      // 프로필 이미지 URL 생성 (로컬 경로를 클라이언트가 접근할 수 있는 URL로 변환)
      const profilePictureURL = user.profile?.profile_picture
          ? `${serverDomain}${user.profile.profile_picture}` // 프로필 이미지 URL
          : `${serverDomain}${defaultProfilePicture}`; // 기본 이미지 URL

      // 멤버십 등급 가져오기
      const membershipLevel = user.memberships.length > 0 
          ? user.memberships[0].membershipGrade.grade_name 
          : null; // 첫 번째 멤버십 등급 가져오기

      // 응답 데이터 포맷
      const userInfo = {
          membershipLevel: membershipLevel,
          nickname: user.nickname,
          major: user.major,
          studentId: user.student_number,
          totalMileage: user.mileage.reduce((total, m) => total + m.mileage, 0),
          profilePicture: profilePictureURL // 프로필 이미지 URL
      };

      res.json(userInfo);
  } catch (error) {
      console.error('Error in getUserInfo:', error.message);
      res.status(500).json({ error: `정보를 불러오는 중 오류가 발생했습니다: ${error.message}` });
  }
};



// 02. 거래 내역 불러오기
const getUserTransactions = async (req, res) => {
    const userId = parseInt(req.query.userId); // 쿼리로 받은 userId
  
    try {
      // 유저가 바이어 또는 셀러로 있는 거래내역 조회
      const transactions = await prisma.mileageTrade.findMany({
        where: {
          OR: [
            { buyer_id: userId }, // 유저가 바이어인 경우
            { seller_id: userId } // 유저가 셀러인 경우
          ]
        },
        include: {
          post: {
            include: {
              parentCategory: true, // 부모 카테고리 정보 포함
              subCategory: true // 서브 카테고리 정보 포함
            }
          },
          buyer: {
            select: { nickname: true } // 바이어 닉네임
          },
          seller: {
            select: { nickname: true } // 셀러 닉네임
          }
        }
      });
  
      if (transactions.length === 0) {
        return res.status(404).json({ message: '거래내역이 없습니다.' });
      }
  
      // 거래내역 포맷팅
      const formattedTransactions = formatPosts(transactions, userId);
  
      // 거래내역 응답
      res.status(200).json(formattedTransactions);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: '거래내역을 불러오는 중 에러가 발생했습니다.' });
    }
};

// 00. 포맷 함수
const formatPosts = (transactions, userId) => {
    return transactions.map(transaction => ({
      post_id: transaction.post.post_id,
      title: transaction.post.title,
      content: transaction.post.content.substring(0, 100), // 내용의 첫 100자만 표시
      views: transaction.post.views,
      likes_count: transaction.post.likes_count,
      post_mileage: transaction.post.post_mileage,
      parent_category_name: transaction.post.parentCategory.parentcategory_name,
      sub_category_name: transaction.post.subCategory.subcategory_name,
      // 거래에서 유저가 바이어인지 셀러인지 확인
      role: transaction.buyer_id === userId ? 'buyer' : 'seller' // 바이어면 'buyer', 셀러면 'seller'
    }));
};
  
//03. 프로필 사진 수정/올리기
const updateProfilePicture = async (req, res) => {
  const userId = req.body.user_id; // 사용자 ID를 요청 본문에서 가져옴
  const profilePicturePath = req.file ? req.file.path : null; // 업로드된 파일의 경로

  try {
      // 프로필 사진 업데이트
      const updatedProfile = await prisma.profiles.update({
          where: { user_id: userId },
          data: {
              profile_picture: profilePicturePath // 이미지 경로를 데이터베이스에 저장
          }
      });

      res.status(200).json(updatedProfile);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: '프로필 사진 업데이트에 실패했습니다.', details: error.message });
  }
};

module.exports = { getUserInfo,getUserTransactions,updateProfilePicture};