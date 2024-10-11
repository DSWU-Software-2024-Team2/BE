const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 01. 장바구니 목록 조회 및 활성화된 아이템의 총 마일리지 계산
const getCartItems = async (req, res) => {
    const { userId } = req.body;

    try {
        const cartItems = await prisma.cart.findMany({
            where: { user_id: userId },
            include: {
                post: {
                    select: {
                        title: true,
                        author_id: true, 
                        user: { 
                            select: {
                                nickname: true,
                                major: true,
                            },
                        },
                        created_at: true,
                        sub_category_id: true, 
                        subCategory: { 
                            select: {
                                subcategory_name: true, 
                            },
                        },
                        post_mileage: true,
                    },
                },
            },
        });

        // 총 마일리지 계산 (활성화된 아이템만)
        const totalMileage = cartItems.reduce((total, item) => {
            return total + (item.is_active ? (item.post ? item.post.post_mileage : 0) : 0);
        }, 0);

        // 응답 데이터 구성
        const responseItems = cartItems.map(item => ({
            id: item.id,
            title: item.post.title,
            authorNickname: item.post.user.nickname,
            authorMajor: item.post.user.major,
            createdAt: item.post.created_at,
            subCategory: item.post.subCategory.subcategory_name,
            mileage: item.post.post_mileage,
            isActive: item.is_active,
        }));

        res.status(200).json({ cartItems: responseItems, totalMileage });
    } catch (error) {
        console.error('Error fetching cart items:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
};

// 02. 장바구니에 아이템 추가
const addCartItem = async (req, res) => {
    const { userId, postId } = req.body; 

    try {
        // 해당 포스트의 작성자 ID를 조회
        const post = await prisma.post.findUnique({
            where: { post_id: postId },
            select: { author_id: true }, // author_id만 선택하여 가져옴
        });

        // 작성자와 사용자가 동일한지 확인
        if (post.author_id === userId) {
            return res.status(400).json({ message: '자신의 글은 장바구니에 담을 수 없습니다.' });
        }

        // 이미 장바구니에 존재하는지 확인
        const existingItem = await prisma.cart.findFirst({
            where: { user_id: userId, post_id: postId, is_active: true },
        });

        if (existingItem) {
            return res.status(400).json({ message: '장바구니에 이미 담겨져 있습니다.' });
        }

        // 장바구니에 아이템 추가
        await prisma.cart.create({
            data: {
                user_id: userId,
                post_id: postId,
                quantity: 1, 
            },
        });

        res.status(201).json({ message: '장바구니에 아이템이 추가되었습니다.' });
    } catch (error) {
        console.error('Error adding cart item:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
};


// 03. 장바구니 활성화된 아이템 모두 삭제
const deleteActiveCartItems = async (req, res) => {
    const { userId } = req.body; // userId를 body에서 받음

    try {
        // 해당 userId의 활성화된 장바구니 아이템 삭제
        const deletedItems = await prisma.cart.deleteMany({
            where: {
                user_id: userId, // userId 추가
                is_active: true, // 활성화된 아이템만 삭제
            },
        });

        // 삭제된 아이템이 없으면 에러 처리
        if (deletedItems.count === 0) {
            return res.status(404).json({ message: '삭제할 활성화된 아이템이 없습니다.' });
        }

        res.status(200).json({ message: '활성화된 장바구니 아이템이 삭제되었습니다.' });
    } catch (error) {
        console.error('Error deleting active cart items:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
};



// 04. 장바구니 전체 비우기
const clearCart = async (req, res) => {
    const { userId } = req.body; // req에서 userId 가져오기

    try {
        // 해당 유저의 모든 장바구니 아이템 삭제
        await prisma.cart.deleteMany({
            where: { user_id: userId },
        });

        res.status(200).json({ message: '장바구니가 비워졌습니다.' });
    } catch (error) {
        console.error('Error clearing cart:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
};

// 05. 장바구니 아이템 활성화/비활성화 토글
const toggleCartItemActive = async (req, res) => {
    const { itemId } = req.params;  
    const { userId } = req.body; 

    try {
        // 장바구니 아이템 조회
        const cartItem = await prisma.cart.findUnique({
            where: { id: Number(itemId) },
            include: {
                post: {
                    select: {
                        post_mileage: true, // 마일리지 정보를 가져옴
                    },
                },
            },
        });

        if (!cartItem) {
            return res.status(404).json({ message: '장바구니 아이템을 찾을 수 없습니다.' });
        }

        // 아이템의 user_id가 현재 요청한 userId와 같은지 확인
        if (cartItem.user_id !== userId) {
            return res.status(403).json({ message: '권한이 없습니다. 이 아이템은 다른 사용자의 것입니다.' });
        }

        const newActiveState = !cartItem.is_active;

        // 장바구니 아이템 활성화 상태 업데이트
        await prisma.cart.update({
            where: { id: Number(itemId) },
            data: { is_active: newActiveState },
        });

        // 총 마일리지 계산
        const allActiveItems = await prisma.cart.findMany({
            where: { user_id: userId, is_active: true },
            include: { post: true }, // 포스트 정보도 포함
        });

        const totalMileage = allActiveItems.reduce((total, item) => {
            return total + (item.post ? item.post.post_mileage : 0);
        }, 0);

        res.status(200).json({
            message: `장바구니 아이템이 ${newActiveState ? '활성화' : '비활성화'}되었습니다.`,
            totalMileage, // 새로운 총 마일리지도 응답에 포함
        });
    } catch (error) {
        console.error('Error toggling cart item active state:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
};


module.exports = {
    getCartItems,
    addCartItem,
    deleteActiveCartItems,
    clearCart,
    toggleCartItemActive,
};

