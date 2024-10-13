const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient(); 

// 01. 새로운 게시글 작성
const Newpost = async (req, res) => {
    const { poster, title, content, parentCategoryId, subCategoryId } = req.body; // 변수명 변경
    const images = req.files; // 업로드된 이미지 파일들

    // 유효성 검사
    if (!poster || !title || !content || !parentCategoryId || !subCategoryId) {
        return res.status(400).json({ error: '모든 필드를 채워주세요.' });
    }

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

        // 게시글 생성
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

        // 이미지 정보 저장
        if (images && images.length > 0) { // 올바른 if 조건문
            const imageData = images.map(image => ({
                post_id: newPost.post_id, // 새로 생성된 게시글의 ID
                url: image.path // 이미지의 저장 경로
            }));

            await prisma.image.createMany({
                data: imageData // 이미지 정보를 데이터베이스에 저장
            });
        }

        res.status(201).json(newPost);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: '게시글 작성에 실패했습니다.', details: error.message });
    }
};


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
    const userId = parseInt(req.query.userId); 

    try {
        // 요청 ID 유효성 검증
        if (isNaN(postId) || isNaN(userId)) {
            return res.status(400).json({ error: '유효하지 않은 ID입니다.' });
        }

        // 게시물 조회 (이미지 포함)
        const post = await prisma.post.findUnique({
            where: { post_id: postId },
            include: { images: true },
        });

        if (!post) {
            return res.status(404).json({ error: '게시물을 찾을 수 없습니다.' });
        }

        let hasPurchased = false;

        // 유료 게시물 여부 확인 및 구매 이력 조회
        if (post.post_mileage > 0) {
            const purchaseRecord = await prisma.mileageTrade.findFirst({
                where: {
                    post_id: postId,
                    buyer_id: userId
                }
            });

            hasPurchased = !!purchaseRecord; // 구매 여부를 불린 값으로 설정
        }

        // 작성자 정보 조회 (프로필 이미지 포함)
        const author = await prisma.users.findUnique({
            where: { id: post.author_id },
            include: {
                profile: { // 프로필 정보 포함
                    select: {
                        profile_picture: true, // 프로필 이미지 가져오기
                    }
                },
                memberships: {
                    include: {
                        membershipGrade: true, // MembershipGrade 정보 포함
                    },
                },
            }
        });

        // 서버 도메인 및 프로필 이미지 URL 생성
        const serverDomain = process.env.SERVER_DOMAIN || 'http://172.18.38.29:3000/'; // 환경 변수로 도메인 설정
        const authorProfilePictureURL = author.profile?.profile_picture
            ? `${serverDomain}${author.profile.profile_picture}`
            : null; // 서버 도메인과 프로필 이미지 경로 결합

        // 작성자의 멤버십 등급 조회
        const authorWithGrade = await prisma.userMembership.findUnique({
            where: { user_id: post.author_id },
            include: {
                membershipGrade: { 
                    select: { grade_name: true }
                }
            }
        });

        const authorGrade = authorWithGrade?.membershipGrade?.grade_name ?? '일반 회원';

        // 본인 게시물인 경우 구매 여부와 관계없이 조회수 증가 없이 바로 반환
        if (post.author_id === userId) {
            return res.status(200).json({
                post_id: post.post_id,
                title: post.title,
                content: post.content,
                views: post.views,
                likes: post.likes_count,
                dislikes: post.dislikes_count,
                created_at: post.created_at,
                post_mileage: post.post_mileage,
                author_name: author.name,
                author_nickname: author.nickname,
                author_grade: authorGrade,
                author_profile_picture: authorProfilePictureURL, // 작성자 프로필 이미지
                images: post.images?.length > 0 
                    ? post.images.map(img => `${serverDomain}${img.url}`) // 서버 도메인과 이미지 URL 결합
                    : [],
                message: '자기' // 자기 게시글 메시지
            });
        }

        // 유료 게시물이지만 구매하지 않은 경우 - 조회수 증가 처리
        if (post.post_mileage > 0) {
            if (!hasPurchased) {
                await prisma.post.update({
                    where: { post_id: postId },
                    data: { views: post.views + 1 }
                });

                // 유료 게시물에 대한 응답
                return res.status(200).json({
                    post_id: post.post_id,
                    title: post.title,
                    content: post.content, // 블러 처리된 메시지
                    views: post.views,
                    likes: post.likes_count,
                    dislikes: post.dislikes_count,
                    created_at: post.created_at,
                    post_mileage: post.post_mileage,
                    author_name: author.name,
                    author_nickname: author.nickname,
                    author_grade: authorGrade,
                    author_profile_picture: authorProfilePictureURL, // 작성자 프로필 이미지
                    images: post.images?.length > 0 
                        ? post.images.map(img => `${serverDomain}${img.url}`) // 서버 도메인과 이미지 URL 결합
                        : [],
                    message: '유료' // 유료 메시지
                });
            } else {
                // 유료 게시물이지만 구매한 경우
                return res.status(200).json({
                    post_id: post.post_id,
                    title: post.title,
                    content: post.content, // 블러 처리된 메시지
                    views: post.views,
                    likes: post.likes_count,
                    dislikes: post.dislikes_count,
                    created_at: post.created_at,
                    post_mileage: post.post_mileage,
                    author_name: author.name,
                    author_nickname: author.nickname,
                    author_grade: authorGrade,
                    author_profile_picture: authorProfilePictureURL, // 작성자 프로필 이미지
                    images: post.images?.length > 0 
                        ? post.images.map(img => `${serverDomain}${img.url}`) // 서버 도메인과 이미지 URL 결합
                        : [],
                    message: '구매' // 구매한 게시글 메시지
                });
            }
        }

        // 무료 게시물인 경우
        return res.status(200).json({
            post_id: post.post_id,
            title: post.title,
            content: post.content,
            views: post.views,
            likes: post.likes_count,
            dislikes: post.dislikes_count,
            created_at: post.created_at,
            post_mileage: post.post_mileage,
            author_name: author.name,
            author_nickname: author.nickname,
            author_grade: authorGrade,
            author_profile_picture: authorProfilePictureURL, // 작성자 프로필 이미지
            images: post.images?.length > 0 
                ? post.images.map(img => `${serverDomain}${img.url}`) // 서버 도메인과 이미지 URL 결합
                : [],
            message: '무료' // 무료 메시지
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