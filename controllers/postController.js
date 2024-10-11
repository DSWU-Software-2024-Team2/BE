<<<<<<< HEAD
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient(); 

//01. 새로운 게시글 작성
const Newpost = async (req, res) => {
    const {poster, postname,posttext,parentCategoryId,subCategoryId } = req.body;
    try {
        const user = await prisma.users.findUnique({
            where: { id: parseInt(poster) },
            include: { membershipGrade: true }
        });
        if (!user) {
            return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
        }

        if (!user.membershipGrade) {
            return res.status(404).json({ error: '사용자의 등급 정보가 없습니다.' });
        }

        const benefits = user.membershipGrade.benefits;

        const newPost = await prisma.post.create({
            data: {
                title:postname,
                content:posttext,
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
        res.status(500).json({ error: '게시글 작성에 실패했습니다.' });
      }
}
// 02. 게시글 수정
const EditPost = async (req, res) => {
    const postId = parseInt(req.params.id); 
    const { title, content } = req.body;

    if (isNaN(postId)) {
        return res.status(400).json({ error: '유효하지 않은 ID입니다.' });
    }
    try {
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
//03. 유/무료 게시글 조회
const GetPost = async (req, res) => {
    const postId = parseInt(req.params.id); 
    //const userId = req.user.id; -> 로그인이랑 연결하여 로그인 상태 확인 되는 경우 수정 예정
    const userId = 1;
    if (isNaN(postId)) {
        return res.status(400).json({ error: '유효하지 않은 ID입니다.' });
    }

    try {
        const post = await prisma.post.findUnique({
            where: { post_id: postId }
        });

        if (!post) {
            return res.status(404).json({ error: '게시물을 찾을 수 없습니다.' });
        }

      // 본인 게시글 = 바로 조회 가능
      if (post.author_id === userId) {

        return res.status(200).json({
            post_id: post.post_id,
            title: post.title,
            content: post.content,
            views: post.views, // 조회수 증가 X
            likes: post.likes_count,
            created_at: post.created_at,
            post_mileage:post.post_mileage
        });
    }
        // 유료 게시물 여부 확인
        if (post.post_mileage > 0) {
            const hasPurchased = await prisma.mileageTrade.findFirst({
                where: {
                    post_id: postId,
                    buyer_id: userId
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

        res.status(200).json({
            post_id: updatedPost.post_id,
            title: updatedPost.title,
            content: updatedPost.content,
            views: updatedPost.views, 
            likes: updatedPost.likes_count,
            created_at: updatedPost.created_at,
            post_mileage:updatedPost.post_mileage
        });

    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).json({ error: '게시물 조회에 실패했습니다.' });
    }
};

=======
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient(); 

//01. 새로운 게시글 작성
const Newpost = async (req, res) => {
    const {poster, postname,posttext,parentCategoryId,subCategoryId } = req.body;
    try {
        const user = await prisma.users.findUnique({
            where: { id: parseInt(poster) },
            include: { membershipGrade: true }
        });
        if (!user) {
            return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
        }

        if (!user.membershipGrade) {
            return res.status(404).json({ error: '사용자의 등급 정보가 없습니다.' });
        }

        const benefits = user.membershipGrade.benefits;

        const newPost = await prisma.post.create({
            data: {
                title:postname,
                content:posttext,
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
        res.status(500).json({ error: '게시글 작성에 실패했습니다.' });
      }
}
// 02. 게시글 수정
const EditPost = async (req, res) => {
    const postId = parseInt(req.params.id); 
    const { title, content } = req.body;

    if (isNaN(postId)) {
        return res.status(400).json({ error: '유효하지 않은 ID입니다.' });
    }
    try {
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
//03. 유/무료 게시글 조회
const GetPost = async (req, res) => {
    const postId = parseInt(req.params.id); 
    //const userId = req.user.id; -> 로그인이랑 연결하여 로그인 상태 확인 되는 경우 수정 예정
    const userId = 1;
    if (isNaN(postId)) {
        return res.status(400).json({ error: '유효하지 않은 ID입니다.' });
    }

    try {
        const post = await prisma.post.findUnique({
            where: { post_id: postId }
        });

        if (!post) {
            return res.status(404).json({ error: '게시물을 찾을 수 없습니다.' });
        }

      // 본인 게시글 = 바로 조회 가능
      if (post.author_id === userId) {

        return res.status(200).json({
            post_id: post.post_id,
            title: post.title,
            content: post.content,
            views: post.views, // 조회수 증가 X
            likes: post.likes_count,
            created_at: post.created_at,
            post_mileage:post.post_mileage
        });
    }
        // 유료 게시물 여부 확인
        if (post.post_mileage > 0) {
            const hasPurchased = await prisma.mileageTrade.findFirst({
                where: {
                    post_id: postId,
                    buyer_id: userId
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

        res.status(200).json({
            post_id: updatedPost.post_id,
            title: updatedPost.title,
            content: updatedPost.content,
            views: updatedPost.views, 
            likes: updatedPost.likes_count,
            created_at: updatedPost.created_at,
            post_mileage:updatedPost.post_mileage
        });

    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).json({ error: '게시물 조회에 실패했습니다.' });
    }
};

>>>>>>> 9aee417fa79ef433aee797247f70fe4ba33d2f72
module.exports = {Newpost,EditPost,GetPost};