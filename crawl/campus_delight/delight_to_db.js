const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function insertCampusInfo(programs) {
    for (const program of programs) {
        const { title, coverImage, date, institution } = program;
        try {
            const newCampusInfo = await prisma.campusInfo.create({
                data: {
                    title,
                    coverImage,
                    date,
                    institution,
                },
            });
            console.log(`Inserted: ${newCampusInfo.title}`);
        } catch (error) {
            console.error(`Failed to insert: ${title}, Error: ${error.message}`);
        }
    }
}

// JSON 파일 읽기
fs.readFile('programs.json', 'utf8', async (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    const programs = JSON.parse(data);
    await insertCampusInfo(programs);
    await prisma.$disconnect(); // 데이터베이스 연결 종료
});
