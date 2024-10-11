<<<<<<< HEAD
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


//01. 싫어요 추가
const DislikePost = async (req, res) => {
    const { postId } = req.params;
    const userId = 1; // 임시 사용자 ID, 실제 구현 시 인증된 사용자 ID로 대체

    try {
        const postIdInt = parseInt(postId);
        if (isNaN(postIdInt)) {
            return res.status(400).json({ error: '유효하지 않은 게시글 ID입니다.' });
        }

        // 게시글 조회
        const post = await prisma.post.findUnique({
            where: { post_id: postIdInt },
        });

        if (!post) {
            return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
        }

        // 유료 게시물인지 확인
        if (post.post_mileage > 0) {
            // 사용자가 해당 게시물을 구매했는지 확인
            const hasPurchased = await prisma.mileageTrade.findFirst({
                where: {
                    post_id: postIdInt,
                    buyer_id: userId,
                },
            });

            if (!hasPurchased) {
                return res.status(403).json({ error: '구매 후 이용 가능합니다.' });
            }
        }

        // 이미 싫어요를 눌렀는지 확인
        const existingReaction = await prisma.reaction.findUnique({
            where: {
                    post_id: postIdInt,
                    user_id: userId,
            },
        });

        if (existingReaction) {
            if (existingReaction.reaction_type == "DISLIKE") {
                return res.status(400).json({ error: '이미 싫어요를 눌렀습니다.' });
            } else {
                // 좋아요를 누른 상태라면 좋아요를 제거하고 싫어요 추가
                await prisma.reaction.update({
                    where: { reaction_id: existingReaction.reaction_id },
                    //data: { reaction_type: false },
                });

                await prisma.post.update({
                    where: { post_id: postIdInt },
                    data: {
                        likes_count: { decrement: 1 },
                        //dislikes_count: { increment: 1 },
                    },
                });
                await prisma.reaction.create({
                    data: {
                        post_id: postIdInt,
                        user_id: userId,
                        reaction_type: "DISLIKE"
                    },
                });
                const updatedPost = await prisma.post.update({
                    where: { post_id: postIdInt },
                    data: { dislikes_count: { increment: 1 } },
                });

                return res.status(200).json({ message: '좋아요가 제거되고 싫어요가 추가되었습니다.' });
            }
        } else {
            // 싫어요 추가
            await prisma.reaction.create({
                data: {
                    post_id: postIdInt,
                    user_id: userId,
                    reaction_type: "DISLIKE"
                },
            });

            const updatedPost = await prisma.post.update({
                where: { post_id: postIdInt },
                data: { dislikes_count: { increment: 1 } },
            });

            // 싫어요 수가 5개 이상이면 dislike_mileage 증가
            if (updatedPost.dislikes_count === 5) { // 정확히 5일 때만 증가
                await prisma.post.update({
                    where: { post_id: postIdInt },
                    data: { dislike_mileage: { increment: 500 } },
                });
            }

            return res.status(200).json({ message: '싫어요가 추가되었습니다.' });
        }
    } catch (error) {
        console.error('싫어요 추가에 실패했습니다:', error);
        return res.status(500).json({ error: '싫어요 추가에 실패했습니다.' });
    }
};

//02. 싫어요 삭제
const CancelDislikePost = async (req, res) => {
    const { postId } = req.params;
    const userId = 1; // 임시 사용자 ID, 실제 구현 시 인증된 사용자 ID로 대체

    try {
        const postIdInt = parseInt(postId);
        if (isNaN(postIdInt)) {
            return res.status(400).json({ error: '유효하지 않은 게시글 ID입니다.' });
        }

        // 반응 조회
        const existingReaction = await prisma.reaction.findUnique({
            where: {
                    post_id: postIdInt,
                    user_id: userId,
            },
        });

        if (!existingReaction || existingReaction.isLiked) {
            return res.status(404).json({ error: '싫어요 기록을 찾을 수 없습니다.' });
        }

        // 싫어요 제거
        await prisma.reaction.delete({
            where: { reaction_id: existingReaction.reaction_id },
        });

        // 게시글의 싫어요 수 감소
        const updatedPost = await prisma.post.update({
            where: { post_id: postIdInt },
            data: { dislikes_count: { decrement: 1 } },
        });

        // 싫어요 수가 4가 될 때만 dislike_mileage 감소
        if (updatedPost.dislikes_count === 4) { // 정확히 4일 때만 감소
            await prisma.post.update({
                where: { post_id: postIdInt },
                data: { dislike_mileage: { decrement: 500 } },
            });
        }

        return res.status(200).json({ message: '싫어요가 취소되었습니다.' });
    } catch (error) {
        console.error('싫어요 취소에 실패했습니다:', error);
        return res.status(500).json({ error: '싫어요 취소에 실패했습니다.' });
    }
};


module.exports = { DislikePost, CancelDislikePost};
=======
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


//01. 싫어요 추가
const DislikePost = async (req, res) => {
    const { postId } = req.params;
    const userId = 1; // 임시 사용자 ID, 실제 구현 시 인증된 사용자 ID로 대체

    try {
        const postIdInt = parseInt(postId);
        if (isNaN(postIdInt)) {
            return res.status(400).json({ error: '유효하지 않은 게시글 ID입니다.' });
        }

        // 게시글 조회
        const post = await prisma.post.findUnique({
            where: { post_id: postIdInt },
        });

        if (!post) {
            return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
        }

        // 유료 게시물인지 확인
        if (post.post_mileage > 0) {
            // 사용자가 해당 게시물을 구매했는지 확인
            const hasPurchased = await prisma.mileageTrade.findFirst({
                where: {
                    post_id: postIdInt,
                    buyer_id: userId,
                },
            });

            if (!hasPurchased) {
                return res.status(403).json({ error: '구매 후 이용 가능합니다.' });
            }
        }

        // 이미 싫어요를 눌렀는지 확인
        const existingReaction = await prisma.reaction.findUnique({
            where: {
                    post_id: postIdInt,
                    user_id: userId,
            },
        });

        if (existingReaction) {
            if (existingReaction.reaction_type == "DISLIKE") {
                return res.status(400).json({ error: '이미 싫어요를 눌렀습니다.' });
            } else {
                // 좋아요를 누른 상태라면 좋아요를 제거하고 싫어요 추가
                await prisma.reaction.update({
                    where: { reaction_id: existingReaction.reaction_id },
                    //data: { reaction_type: false },
                });

                await prisma.post.update({
                    where: { post_id: postIdInt },
                    data: {
                        likes_count: { decrement: 1 },
                        //dislikes_count: { increment: 1 },
                    },
                });
                await prisma.reaction.create({
                    data: {
                        post_id: postIdInt,
                        user_id: userId,
                        reaction_type: "DISLIKE"
                    },
                });
                const updatedPost = await prisma.post.update({
                    where: { post_id: postIdInt },
                    data: { dislikes_count: { increment: 1 } },
                });

                return res.status(200).json({ message: '좋아요가 제거되고 싫어요가 추가되었습니다.' });
            }
        } else {
            // 싫어요 추가
            await prisma.reaction.create({
                data: {
                    post_id: postIdInt,
                    user_id: userId,
                    reaction_type: "DISLIKE"
                },
            });

            const updatedPost = await prisma.post.update({
                where: { post_id: postIdInt },
                data: { dislikes_count: { increment: 1 } },
            });

            // 싫어요 수가 5개 이상이면 dislike_mileage 증가
            if (updatedPost.dislikes_count === 5) { // 정확히 5일 때만 증가
                await prisma.post.update({
                    where: { post_id: postIdInt },
                    data: { dislike_mileage: { increment: 500 } },
                });
            }

            return res.status(200).json({ message: '싫어요가 추가되었습니다.' });
        }
    } catch (error) {
        console.error('싫어요 추가에 실패했습니다:', error);
        return res.status(500).json({ error: '싫어요 추가에 실패했습니다.' });
    }
};

//02. 싫어요 삭제
const CancelDislikePost = async (req, res) => {
    const { postId } = req.params;
    const userId = 1; // 임시 사용자 ID, 실제 구현 시 인증된 사용자 ID로 대체

    try {
        const postIdInt = parseInt(postId);
        if (isNaN(postIdInt)) {
            return res.status(400).json({ error: '유효하지 않은 게시글 ID입니다.' });
        }

        // 반응 조회
        const existingReaction = await prisma.reaction.findUnique({
            where: {
                    post_id: postIdInt,
                    user_id: userId,
            },
        });

        if (!existingReaction || existingReaction.isLiked) {
            return res.status(404).json({ error: '싫어요 기록을 찾을 수 없습니다.' });
        }

        // 싫어요 제거
        await prisma.reaction.delete({
            where: { reaction_id: existingReaction.reaction_id },
        });

        // 게시글의 싫어요 수 감소
        const updatedPost = await prisma.post.update({
            where: { post_id: postIdInt },
            data: { dislikes_count: { decrement: 1 } },
        });

        // 싫어요 수가 4가 될 때만 dislike_mileage 감소
        if (updatedPost.dislikes_count === 4) { // 정확히 4일 때만 감소
            await prisma.post.update({
                where: { post_id: postIdInt },
                data: { dislike_mileage: { decrement: 500 } },
            });
        }

        return res.status(200).json({ message: '싫어요가 취소되었습니다.' });
    } catch (error) {
        console.error('싫어요 취소에 실패했습니다:', error);
        return res.status(500).json({ error: '싫어요 취소에 실패했습니다.' });
    }
};


module.exports = { DislikePost, CancelDislikePost};
>>>>>>> 9aee417fa79ef433aee797247f70fe4ba33d2f72
