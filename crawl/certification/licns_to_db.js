const fs = require('fs');
const csv = require('csv-parser');
const { PrismaClient } = require('@prisma/client');
const iconv = require('iconv-lite');

const prisma = new PrismaClient();

async function main() {
  fs.createReadStream('C:\\Users\\User\\Desktop\\backend\\crawl\\certification\\Licns.csv')
    .pipe(iconv.decodeStream('EUC-KR')) // 인코딩을 EUC-KR로 설정
    .pipe(csv())
    .on('data', async (row) => {
      try {
        console.log('Processing row:', row); // 데이터 로깅

        // License 모델에 데이터 삽입
        await prisma.licns.create({ // 모델 이름을 license로 변경
          data: {
            license: row.license,
            organization: row.organization,
            parentCategory_id: parseInt(row.parentCategory_id, 10),
            subCategory_id: parseInt(row.subCategory_id, 10),
          },
        });

        console.log(`Inserted: ${row.license}`);
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

