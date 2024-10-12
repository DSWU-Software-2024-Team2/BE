// description : 정보 게시판 관련 컨트롤러
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient(); // Prisma 클라이언트 인스턴스 생성

// 01. 교내 정보 게시물 조회 
const getCampusInfoPosts = async (_, res) => {
    try {
        const campusPosts = await prisma.campusInfo.findMany({
            where: {
                subCategory_id: 1,
            },
            select: {
                id : true,
                title: true,
                coverImage: true,
                institution: true,
                date: true,
            },
        });
        
        res.json(campusPosts);
    } catch (error) {
        console.error("Error fetching campus info posts:", error);
        res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
};

// 02. 교외 정보 게시물 조회 
const getExternalInfoPosts = async (_, res) => {
    try {
        const campusPosts = await prisma.activity.findMany({
            where: {
                subCategory_id: 2,
            },
            select: {
                id : true,
                title: true,
                host : true,
                dueDate : true,
                viewCount:true,
                coverImage: true,
            },
        });
        
        res.json(campusPosts);
    } catch (error) {
        console.error("Error fetching campus info posts:", error);
        res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
};

// 03. 자격증 정보 게시물 조회 
const getCertificationInfoPosts = async (_, res) => {
    try {
        const campusPosts = await prisma.licns.findMany({
            where: {
                subCategory_id: 3,
            },
            select: {
                id : true,
                license: true,
                organization: true
            },
        });
        
        res.json(campusPosts);
    } catch (error) {
        console.error("Error fetching campus info posts:", error);
        res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
};

// 04. 공모전 정보 게시물 조회 
const getContestInfoPosts = async (_, res) => {
    try {
        const campusPosts = await prisma.contest.findMany({
            where: {
                subCategory_id: 4,
            },
            select: {
                id : true,
                title: true,
                host : true,
                dueDate : true,
                viewCount:true,
                coverImage: true,
            },
        });
        
        res.json(campusPosts);
    } catch (error) {
        console.error("Error fetching campus info posts:", error);
        res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
};

module.exports = {
    getCampusInfoPosts,
    getExternalInfoPosts,
    getCertificationInfoPosts,
    getContestInfoPosts,
};