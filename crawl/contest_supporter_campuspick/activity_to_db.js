const fs = require('fs');
const csv = require('csv-parser');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  fs.createReadStream('C:\\Users\\User\\Desktop\\backend\\crawl\\contest_supporter_campuspick\\crawled_data_activity.csv')
    .pipe(csv())
    .on('data', async (row) => {
      try {
        console.log('Processing row:', row); // 데이터 로깅

        // Activity 모델에 데이터 삽입
        await prisma.activity.create({
          data: {
            title: row.title,
            host: row.host,
            dueDate: row.dueDate,
            viewCount: parseInt(row.viewCount, 10),
            coverImage: row.coverImage,
            parentCategory_id: parseInt(row.parentCategory_id, 10),
            subCategory_id: parseInt(row.subCategory_id, 10),
          },
        });

        console.log(`Inserted: ${row.title}`);
      } catch (error) {
        console.error('Error inserting row:', error); // 삽입 오류 로깅
      }
    })
    .on('end', () => {
      console.log('CSV file successfully processed');
    })
    .on('error', (error) => {
      console.error('Error reading CSV file:', error);
    });
}

main()
  .catch(e => {
    console.error('Error in main:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
