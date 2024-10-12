const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient(); 

// 01. 새로운 게시글 작성
const Newpost = async (req, res) => {
    const { poster, title, content, parentCategoryId, subCategoryId } = req.body; // 변수명 변경
    try {
        const user = await prisma.users.findUnique({
            where: { id: parseInt(poster) },
            include: { memberships: { include: { membershipGrade: true } } } // memberships 관계 포함
        });

        if (!user) {
            return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
        }

        const userMembership = user.memberships[0]; // 첫 번째 멤버십 가져오기
        if (!userMembership || !userMembership.membershipGrade) {
            return res.status(404).json({ error: '사용자의 등급 정보가 없습니다.' });
        }

        const benefits = userMembership.membershipGrade.benefits;

        const newPost = await prisma.post.create({
            data: {
                title: title, // 일관되게 사용
                content: content, // 일관되게 사용
                user: {
                    connect: { id: parseInt(poster) }
                },
                parentCategory: {
                    connect: { parentcategory_id: parseInt(parentCategoryId) }
                },
                subCategory: {
                    connect: { subcategory_id: parseInt(subCategoryId) }
                },
                post_mileage: benefits
            }
        });

        res.status(201).json(newPost);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: '게시글 작성에 실패했습니다.', details: error.message });
    }
}

// 02. 게시글 수정
const EditPost = async (req, res) => {
    const postId = parseInt(req.params.id); 
    const { title, content, userId } = req.body; // 사용자 ID 추가

    if (isNaN(postId)) {
        return res.status(400).json({ error: '유효하지 않은 ID입니다.' });
    }

    const numericUserId = parseInt(userId); // userId를 숫자로 변환

    if (isNaN(numericUserId)) {
        return res.status(400).json({ error: '유효하지 않은 사용자 ID입니다.' });
    }

    try {
        // 게시글 조회
        const post = await prisma.post.findUnique({
            where: { post_id: postId }
        });

        // 게시글이 존재하는지 확인 및 작성자 확인
        if (!post) {
            return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
        }

        if (post.author_id !== numericUserId) { // 현재 사용자의 ID와 게시글 작성자 ID 비교
            return res.status(403).json({ error: '수정 권한이 없습니다.' });
        }

        const updatedPost = await prisma.post.update({
            where: {
                post_id: postId 
            },
            data: {
                title: title,
                content: content,
                updated_at: new Date(),
            },
        });

        res.status(200).json({ message: '게시글이 성공적으로 수정되었습니다.', post: updatedPost });
    } catch (error) {
        console.error('게시글 수정 실패:', error);

        if (error.code === 'P2025') {
            return res.status(404).send('게시글을 찾을 수 없습니다.');
        }

        res.status(500).send('서버 오류');
    }
};


// 03. 유/무료 게시글 조회
const GetPost = async (req, res) => {
    const postId = parseInt(req.params.id); 
    const { userId } = req.query; // 사용자 ID를 요청 본문에서 받음

    if (isNaN(postId)) {
        return res.status(400).json({ error: '유효하지 않은 ID입니다.' });
    }

    const numericUserId = parseInt(userId); // userId를 숫자로 변환
    if (isNaN(numericUserId)) {
        return res.status(400).json({ error: '유효하지 않은 사용자 ID입니다.' });
    }

    try {
        const post = await prisma.post.findUnique({
            where: { post_id: postId },
            include: {
                images: true,
                // author_id: { // 작성자 정보 포함
                //     select: {
                //         name: true, // 작성자 이름
                //         grade: true // 작성자 등급
                //     }
                // }
            }
        });

        if (!post) {
            return res.status(404).json({ error: '게시물을 찾을 수 없습니다.' });
        }

        // 본인 게시글 = 바로 조회 가능
        if (post.author_id === numericUserId) {
            return res.status(200).json({
                post_id: post.post_id,
                title: post.title,
                content: post.content,
                views: post.views, // 조회수 증가 X
                likes: post.likes_count,
                created_at: post.created_at,
                post_mileage: post.post_mileage,
                images: post.images.map(image => image.url)
            });
        }

        // 유료 게시물 여부 확인
        if (post.post_mileage > 0) {
            const hasPurchased = await prisma.mileageTrade.findFirst({
                where: {
                    post_id: postId,
                    buyer_id: numericUserId
                }
            });

            if (!hasPurchased) {
                return res.status(200).json({ message: '구매 후 이용 가능합니다.' });
            }
        }

        const updatedPost = await prisma.post.update({
            where: { post_id: postId },
            data: { views: post.views + 1 }
        });

        const author = await prisma.users.findUnique({
            where: { id: updatedPost.author_id },
            select: {
                name: true, 
            }
        });

        const author_mem = await prisma.userMembership.findUnique({
            where: { user_id: updatedPost.author_id },
            select: {
                membershipGrade_id: true, 
            }
        });
        const author_mem1 = await prisma.membershipGrade.findUnique({
            where: { membershipgrade_id: author_mem.membershipGrade_id },
            select: {
                grade_name: true, 
            }
        });
        
        res.status(200).json({
            post_id: updatedPost.post_id,
            title: updatedPost.title,
            content: updatedPost.content,
            views: updatedPost.views, 
            likes: updatedPost.likes_count,
            dislikes: updatedPost.dislikes_count,
            created_at: updatedPost.created_at,
            post_mileage: updatedPost.post_mileage,
            author_name: author.name,
            author_grade: author_mem1.grade_name,
            images: updatedPost.images.map(image => image.url)
        });

    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).json({ error: '게시물 조회에 실패했습니다.' });
    }
};

module.exports = {
    Newpost,
    EditPost,
    GetPost
};