// description : 결제 관련 컨트롤러
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 01. 활성화된 아이템만 사기
const processPayment = async (req, res) => {
    const { userId } = req.query; // 쿼리 파라미터에서 userId 가져오기

    // 유효성 검사
    if (!userId) {
        return res.status(400).json({ status: 'fail', message: '유효하지 않은 사용자 ID입니다.' });
    }

    try {
        // 활성화된 장바구니 아이템 조회
        const activeCartItems = await prisma.cart.findMany({
            where: { user_id: Number(userId), is_active: true }, // userId를 숫자로 변환하여 사용
            include: { post: { select: { post_id: true, post_mileage: true, author_id: true } } }
        });

        if (activeCartItems.length === 0) {
            return res.status(404).json({ status: 'fail', message: '활성화된 장바구니 아이템이 없습니다.' });
        }

        const buyerMileageRecord = await prisma.mileage.findFirst({
            where: { user_id: Number(userId) }, // userId를 숫자로 변환하여 사용
            select: { mileage: true, mileage_id: true }
        });

        if (!buyerMileageRecord) {
            return res.status(404).json({ status: 'fail', message: '구매자를 찾을 수 없습니다.' });
        }

        let buyerMileage = buyerMileageRecord.mileage;
        let totalRequestedAmount = 0; // 총 결제 마일리지
        let successfulTrades = [];
        let failedTrades = [];

        for (const cartItem of activeCartItems) {
            const postId = cartItem.post.post_id; // 장바구니 아이템의 게시글 ID
            const requestedAmount = cartItem.post.post_mileage;

            // 거래 기록 확인
            const existingTrade = await prisma.mileageTrade.findFirst({
                where: {
                    buyer_id: Number(userId),
                    post_id: postId
                }
            });

            if (existingTrade) {
                failedTrades.push(`이미 존재하는 거래 기록입니다. (게시글 ID: ${postId})`);
                break; // 거래 중단
            }

            totalRequestedAmount += requestedAmount; // 총 결제 금액에 추가
        }

        // 총 결제 마일리지가 현재 보유량보다 크면 결제 중단
        if (totalRequestedAmount > buyerMileage) {
            return res.status(400).json({ status: 'fail', message: '잔액이 부족합니다.' });
        }

        // 총 결제가 가능하다면 거래 수행
        for (const cartItem of activeCartItems) {
            const postId = cartItem.post.post_id; // 장바구니 아이템의 게시글 ID
            const requestedAmount = cartItem.post.post_mileage;

            // 거래 기록 확인
            const existingTrade = await prisma.mileageTrade.findFirst({
                where: {
                    buyer_id: Number(userId),
                    post_id: postId
                }
            });

            // 이미 결제한 거래가 있다면 중단
            if (existingTrade) {
                failedTrades.push(`이미 존재하는 거래 기록입니다. (게시글 ID: ${postId})`);
                break; // 거래 중단
            }

            const sellerId = cartItem.post.author_id;
            const sellerMileageRecord = await prisma.mileage.findFirst({
                where: { user_id: sellerId },
                select: { mileage: true, mileage_id: true }
            });

            if (!sellerMileageRecord) {
                failedTrades.push(`판매자 ${sellerId}를 찾을 수 없습니다.`);
                continue; // 다음 게시글로 넘어감
            }

            // 거래 수행
            await prisma.mileage.update({
                where: { mileage_id: sellerMileageRecord.mileage_id },
                data: { mileage: sellerMileageRecord.mileage + requestedAmount }
            });

            await prisma.mileageTrade.create({
                data: {
                    buyer_id: Number(userId),
                    seller_id: sellerId,
                    post_id: postId,
                    traded_at: new Date(),
                    description: `게시글 ${postId} 구매`
                }
            });

            // 장바구니에서 게시글 삭제
            await prisma.cart.deleteMany({
                where: { user_id: Number(userId), post_id: postId }
            });

            // 구매자의 마일리지 차감
            buyerMileage -= requestedAmount;

            await prisma.mileage.update({
                where: { mileage_id: buyerMileageRecord.mileage_id },
                data: { mileage: buyerMileage }
            });

            successfulTrades.push(postId); // 성공한 거래 추가
        }

        res.status(200).json({
            status: 'success',
            message: '결제가 완료되었습니다.',
            buyerUpdatedMileage: buyerMileage,
            successfulTrades,
            failedTrades
        });

    } catch (error) {
        console.error('Error in processPayment:', error);
        res.status(500).json({ status: 'error', message: '서버 오류가 발생했습니다. 오류 내용: ' + error.message });
    }
};


// 02. 바로 결제 로직
const directPayment = async (req, res) => {
    const { userId, postId } = req.query; // 쿼리 파라미터에서 userId와 postId 가져오기

    // 유효성 검사
    if (!userId || !postId) {
        return res.status(400).json({ status: 'fail', message: '유효하지 않은 사용자 ID 또는 게시글 ID입니다.' });
    }

    try {
        // 게시글 정보 조회 (마일리지, 작성자 ID)
        const post = await prisma.post.findUnique({
            where: { post_id: Number(postId) }, // postId를 숫자로 변환하여 사용
            select: { post_mileage: true, author_id: true }
        });

        if (!post) {
            return res.status(404).json({ status: 'fail', message: '게시글을 찾을 수 없습니다.' });
        }

        // 자기 글 구매 방지
        if (post.author_id === Number(userId)) { // userId를 숫자로 변환하여 사용
            return res.status(400).json({ status: 'fail', message: '자신의 게시글을 구매할 수 없습니다.' });
        }

        // 구매자의 마일리지 정보 조회
        const buyerMileageRecord = await prisma.mileage.findFirst({
            where: { user_id: Number(userId) }, // userId를 숫자로 변환하여 사용
            select: { mileage: true, mileage_id: true }
        });

        if (!buyerMileageRecord) {
            return res.status(404).json({ status: 'fail', message: '구매자를 찾을 수 없습니다.' });
        }

        const requestedAmount = post.post_mileage; // 요청된 금액

        if (requestedAmount > buyerMileageRecord.mileage) {
            return res.status(400).json({ status: 'fail', message: '잔액이 부족합니다.' });
        }

        const sellerId = post.author_id; // 판매자 ID

        // 판매자의 마일리지 정보 조회
        const sellerMileageRecord = await prisma.mileage.findFirst({
            where: { user_id: sellerId },
            select: { mileage: true, mileage_id: true }
        });

        if (!sellerMileageRecord) {
            return res.status(404).json({ status: 'fail', message: '판매자를 찾을 수 없습니다.' });
        }

        // 거래 기록 확인
        const existingTrade = await prisma.mileageTrade.findFirst({
            where: {
                buyer_id: Number(userId), // userId를 숫자로 변환하여 사용
                post_id: Number(postId) // postId를 숫자로 변환하여 사용
            }
        });

        if (existingTrade) {
            return res.status(400).json({ status: 'fail', message: '이미 존재하는 거래 기록입니다.' });
        }

        // 판매자 마일리지 업데이트
        await prisma.mileage.update({
            where: { mileage_id: sellerMileageRecord.mileage_id },
            data: { mileage: sellerMileageRecord.mileage + requestedAmount }
        });

        // 거래 기록 생성
        await prisma.mileageTrade.create({
            data: {
                buyer_id: Number(userId), // userId를 숫자로 변환하여 사용
                seller_id: sellerId,
                post_id: Number(postId), // postId를 숫자로 변환하여 사용
                traded_at: new Date(),
                description: `게시글 ${postId} 구매`
            }
        });

        // 구매자의 마일리지 차감
        await prisma.mileage.update({
            where: { mileage_id: buyerMileageRecord.mileage_id },
            data: { mileage: buyerMileageRecord.mileage - requestedAmount }
        });

        res.status(200).json({
            status: 'success',
            message: '결제가 완료되었습니다.',
            remainingMileage: buyerMileageRecord.mileage - requestedAmount
        });

    } catch (error) {
        console.error('Error in directPayment:', error);
        res.status(500).json({ status: 'error', message: '서버 오류가 발생했습니다. 오류 내용: ' + error.message });
    }
};



module.exports = { processPayment, directPayment };
