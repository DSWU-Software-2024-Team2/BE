// description : 정보 게시판 관련 컨트롤러
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient(); // Prisma 클라이언트 인스턴스 생성

// 01. 교내 정보 게시물 조회 
const getCampusInfoPosts = async (req, res) => {
    const { page = 1, limit = 5 } = req.query; // 쿼리에서 페이지와 한 페이지당 항목 수를 가져옵니다.
    
    try {
        const campusPosts = await prisma.campusInfo.findMany({
            where: {
                subCategory_id: 1,
            },
            select: {
                title: true,
                coverImage: true,
                institution: true,
                date: true,
            },
            skip: (page - 1) * limit, 
            take: Number(limit), 
        });
        
        res.json(campusPosts);
    } catch (error) {
        console.error("Error fetching campus info posts:", error);
        res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
};



module.exports = {
    getCampusInfoPosts,
};