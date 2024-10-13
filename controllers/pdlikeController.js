const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const INCRESENUM = 5;
const INCRESEMIL = 500;

//01. 싫어요 추가
const DislikePost = async (req, res) => {
const postId = parseInt(req.params.id);
const userId = parseInt(req.query.userId)
    
try {
    if(isNaN(userId)){
        return res.status(400).json({error:'유효하지 않은 ID입니다.'});
    }
    if (isNaN(postId)) {
        return res.status(400).json({ error: '유효하지 않은 게시글 ID입니다.' });
    }

    // 게시글 조회
    const post = await prisma.post.findUnique(
        {
            where: { post_id: postId },
        });
        if (!post) {
            return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
        }

        // 유료 게시물인지 확인
        if (post.post_mileage > 0) {
            // 사용자가 해당 게시물을 구매했는지 확인
            const hasPurchased = await prisma.mileageTrade.findFirst({
                where: {
                    post_id: postId,
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
                    post_id: postId,
                    user_id: userId,
            },
        });

        if (existingReaction) {
            if (existingReaction.reaction_type == "DISLIKE") {
                return res.status(400).json({ error: '이미 싫어요를 눌렀습니다.' });
            } 
            else {
                // 좋아요를 누른 상태라면 좋아요를 제거하고 싫어요 추가
                await prisma.reaction.delete({
                    where: { reaction_id: existingReaction.reaction_id },
                });

                const updatedPost =  await prisma.post.update({
                    where: { post_id: postId },
                    data: {
                        likes_count: { decrement: 1 },
                        dislikes_count: { increment: 1 },
                    },
                });
                await prisma.reaction.create({
                    data: {
                        post_id: postId,
                        user_id: userId,
                        reaction_type: "DISLIKE"
                    },
                });
                  // 싫어요 등록으로 인해 좋아요 수가 5개이하로 줄어 들면, post_mileage 감소
                if (((updatedPost.likes_count) % INCRESENUM) == 4) {
                    await prisma.post.update({
                        where: { post_id: postId },
                        data: { post_mileage: { decrement: INCRESEMIL } },
                    });
                }
                return res.status(200).json({ message: '좋아요가 제거되고 싫어요가 추가되었습니다.' });
            }
        } else {
            // 싫어요 추가
            await prisma.reaction.create({
                data: {
                    post_id: postId,
                    user_id: userId,
                    reaction_type: "DISLIKE"
                },
            });

            const updatedPost = await prisma.post.update({
                where: { post_id: postId },
                data: { dislikes_count: { increment: 1 } },
            });

            // 싫어요 수가 5개면 dislike_mileage 증가
            if (((updatedPost.dislikes_count) % INCRESENUM) == 0) { 
                await prisma.post.update({
                    where: { post_id: postId },
                    data: { post_mileage: { decrement: INCRESEMIL } },
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
    const postId = parseInt(req.params.id);
    const userId = parseInt(req.query.userId);

    try {
        if(isNaN(userId)){
            return res.status(400).json({error: '유효하지 않은 ID입니다. '})
        }
        if (isNaN(postId)) {
            return res.status(400).json({ error: '유효하지 않은 게시글 ID입니다.' });
        }

        // 반응 조회
        const existingReaction = await prisma.reaction.findUnique({
            where: {
                    post_id: postId,
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
            where: { post_id: postId },
            data: { dislikes_count: { decrement: 1 } },
        });

        // 싫어요 수가 4가 될 때만 dislike_mileage 감소
        // if (updatedPost.dislikes_count % INCRESENUM == 4) { // 정확히 4일 때만 감소
        //     await prisma.post.update({
        //         where: { post_id: postId },
        //         data: { post_mileage: { decrement: INCRESEMIL } },
        //     });
        // }

        return res.status(200).json({ message: '싫어요가 취소되었습니다.' });
    } catch (error) {
        console.error('싫어요 취소에 실패했습니다:', error);
        return res.status(500).json({ error: '싫어요 취소에 실패했습니다.' });
    }
};


module.exports = { DislikePost, CancelDislikePost};
