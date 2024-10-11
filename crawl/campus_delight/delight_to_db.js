const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function insertCampusInfo(programs) {
    for (const program of programs) {
        const { title, coverImage, date, institution, parentCategory_id = 1, subCategory_id = 1 } = program; // 기본값 설정
        try {
            const newCampusInfo = await prisma.campusInfo.create({
                data: {
                    title,
                    coverImage,
                    date,
                    institution,
                    parentCategory_id, // 외래 키
                    subCategory_id, // 외래 키
                },
            });
            console.log(`Inserted: ${newCampusInfo.title}`);
        } catch (error) {
            console.error(`Failed to insert: ${title}, Error: ${error.message}`);
        }
    }
}

// JSON 파일 읽기
async function main() {
    try {
        const data = await fs.promises.readFile('crawl\\campus_delight\\programs.json', 'utf8');
        const programs = JSON.parse(data);
        await insertCampusInfo(programs);
    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect(); // 데이터베이스 연결 종료
    }
}

main();
