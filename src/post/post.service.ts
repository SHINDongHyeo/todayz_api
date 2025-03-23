import {
	BadRequestException,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { error } from 'console';
import { endWith } from 'rxjs';
import { JwtPayload } from 'src/auth/interfaces/auth.interface';
import { NotificationType } from 'src/notification/interfaces/notification.interface';
import { NotificationService } from 'src/notification/notification.service';
import { UserService } from 'src/user/user.service';
import { RedisService } from 'src/_common/redis/redis.service';
import { In, LessThan, Repository } from 'typeorm';
import { CreateCommentReq } from './dto/comment.dto';
import {
	CreatePostReq,
	FindPopularPostMinRes,
	FindPostMinRes,
	FindPostRes,
	SubscribedReq,
} from './dto/post.dto';
import { Category } from './entities/category.entity';
import { Comment } from './entities/comment.entity';
import { LikeComment } from './entities/likeComment.entity';
import { LikePost } from './entities/likePost.entity';
import { PopularPost } from './entities/popularPost.entity';
import { Post } from './entities/post.entity';
import { SavedPost } from './entities/savedPost.entity';
import { Subcategory } from './entities/subcategory.entity';
import { Tag } from './entities/tag.entity';

@Injectable()
export class PostService {
	constructor(
		@InjectRepository(Post)
		private readonly postRepository: Repository<Post>,
		@InjectRepository(PopularPost)
		private readonly popularPostRepository: Repository<PopularPost>,
		@InjectRepository(SavedPost)
		private readonly savedPostRepository: Repository<SavedPost>,
		@InjectRepository(Comment)
		private readonly commentRepository: Repository<Comment>,
		@InjectRepository(Category)
		private readonly categoryRepository: Repository<Category>,
		@InjectRepository(Subcategory)
		private readonly subcategoryRepository: Repository<Subcategory>,
		@InjectRepository(Tag)
		private readonly tagRepository: Repository<Tag>,
		@InjectRepository(LikeComment)
		private readonly likeCommentRepository: Repository<LikeComment>,
		@InjectRepository(LikePost)
		private readonly likePostRepository: Repository<LikePost>,
		private readonly userService: UserService,
		private readonly notificationService: NotificationService,
		private readonly redisService: RedisService,
	) {}

	// test
	async test() {
		return 'test success!';
	}

	// 포스트
	async createPost(
		reqUser: JwtPayload,
		createPostReq: CreatePostReq,
	): Promise<Post> {
		try {
			// redis 데이터 삭제
			const [newCursor, keys] =
				await this.redisService.scanValue('posts:*');
			for (let key of keys) {
				await this.redisService.deleteValue(key);
			}

			const {
				title,
				content,
				excerpt,
				categoryId,
				subcategoryId,
				rawTags,
			} = createPostReq;

			const subcategories = await this.subcategoryRepository.findBy({
				id: subcategoryId,
			});
			const subcategory = subcategories[0];
			if (subcategory.categoryId !== categoryId) {
				throw new BadRequestException(
					'카테고리와 서브카테고리가 적절한 관계를 맺고 있지 않습니다.',
				);
			}

			let tags: Tag[] = [];
			for (const rawTag of rawTags) {
				if (rawTag.id === -1) {
					const tag = await this.tagRepository.find({
						where: { name: rawTag.name },
					})[0];
					if (tag) {
						tags.push(tag);
					} else {
						const newTag = this.tagRepository.create({
							name: rawTag.name,
						});
						const newTagResponse =
							await this.tagRepository.save(newTag);
						tags.push(newTagResponse);
					}
				} else {
					const tag = await this.tagRepository.find({
						where: { id: rawTag.id },
					})[0];
					tags.push(tag);
				}
			}

			await this.userService.updatePostCount(reqUser.id, true);

			const post = this.postRepository.create({
				title,
				content,
				excerpt,
				categoryId,
				subcategoryId,
				tags,
				userId: reqUser.id,
				// user: { id: reqUser.id },
			});
			return await this.postRepository.save(post);
		} catch (error) {
			throw error;
		}
	}

	async findPostsLatest(offset: number = 0) {
		try {
			// 메모리 캐시 먼저 확인
			const cachedData = await this.redisService.getValue(
				`posts:${offset}`,
			);
			if (cachedData) {
				return JSON.parse(cachedData);
			}

			const posts = await this.postRepository
				.createQueryBuilder('post')
				.innerJoin(
					(qb) =>
						qb
							.select('id')
							.from(Post, 'post')
							.orderBy('post.id', 'DESC')
							.limit(10)
							.offset(offset),
					'latest_posts',
					'latest_posts.id = post.id',
				)
				.leftJoin('post.tags', 't')
				.leftJoin('post.category', 'c')
				.leftJoin('post.subcategory', 's')
				.leftJoin('post.user', 'u')
				.select([
					'post.id AS post_id',
					'post.title AS post_title',
					'post.createdAt AS post_createdAt',
					't.id AS t_id',
					't.name AS t_name',
					'c.id AS c_id',
					'c.name AS c_name',
					's.id AS s_id',
					's.name AS s_name',
					'u.id AS u_id',
					'u.nickname AS u_nickname',
				])
				.orderBy('post.createdAt', 'DESC')
				.getRawMany();
			const totalCount = await this.postRepository
				.createQueryBuilder('post')
				.getCount();

			const postsResult = plainToInstance(FindPostMinRes, posts);
			let result = {
				post: postsResult,
				['isOneNextPageExists']: totalCount - (offset + 10) > 0,
				['isTwoNextPageExists']: totalCount - (offset + 20) > 0,
				['isThreeNextPageExists']: totalCount - (offset + 30) > 0,
				['isFourNextPageExists']: totalCount - (offset + 40) > 0,
				['isFiveNextPageExists']: totalCount - (offset + 50) > 0,
			};

			// 메모리 캐시에 저장
			await this.redisService.setValue(
				`posts:${offset}`,
				JSON.stringify(result),
			);
			return result;
		} catch (error) {
			throw error;
		}
	}

	async findPostsLatestByCategory(
		offset: number = 0,
		categoryId: number,
		subcategoryId?: number,
	) {
		try {
			let whereConditions: any = {};

			whereConditions.categoryId = categoryId;
			if (subcategoryId) {
				whereConditions.subcategoryId = subcategoryId;
			}
			const [posts, totalCount] = await this.postRepository.findAndCount({
				where: whereConditions,
				order: {
					createdAt: 'DESC',
				},
				relations: ['tags'],
				take: 10,
				skip: offset,
			});

			const postsResult = plainToInstance(FindPostMinRes, posts);
			let result = {
				post: postsResult,
				['isOneNextPageExists']: totalCount - (offset + 10) > 0,
				['isTwoNextPageExists']: totalCount - (offset + 20) > 0,
				['isThreeNextPageExists']: totalCount - (offset + 30) > 0,
				['isFourNextPageExists']: totalCount - (offset + 40) > 0,
				['isFiveNextPageExists']: totalCount - (offset + 50) > 0,
			};
			return result;
		} catch (error) {
			throw error;
		}
	}

	async findPostsPopular(offset: number = 0) {
		try {
			const posts = await this.popularPostRepository.find({
				order: {
					id: 'ASC',
				},
				relations: ['post', 'tags'],
				take: 10,
				skip: offset,
			});

			return plainToInstance(FindPopularPostMinRes, posts);
		} catch (error) {
			throw error;
		}
	}

	async findPostsCategory(offset: number = 0, categoryId: number) {
		try {
			const posts = await this.postRepository.find({
				where: {
					category: { id: categoryId },
				},
				order: {
					id: 'ASC',
				},
				take: 10,
				skip: offset,
			});

			return plainToInstance(FindPopularPostMinRes, posts);
		} catch (error) {
			throw error;
		}
	}

	async findSubscribedPosts(
		reqUser: JwtPayload,
		subscribedReq: SubscribedReq,
	) {
		const { offset, userId } = subscribedReq;
		try {
			let posts;
			if (userId) {
				posts = await this.postRepository.find({
					order: {
						createdAt: 'DESC',
					},
					where: {
						userId: userId,
					},
					relations: ['tags'],
					take: 10,
					skip: offset,
				});
			} else {
				const subscribeInfos = await this.userService.findFollowings(
					reqUser.id,
				);

				const publisherUserIds = subscribeInfos.map(
					(info) => info.publisherId,
				);

				posts = await this.postRepository.find({
					order: {
						createdAt: 'DESC',
					},
					where: {
						userId: In(publisherUserIds),
					},
					relations: ['tags'],
					take: 10,
					skip: offset,
				});
			}

			return plainToInstance(FindPostMinRes, posts);
		} catch (error) {
			throw error;
		}
	}

	async findPostById(id: number) {
		try {
			const posts = await this.postRepository.findBy({
				id,
			});
			const post = posts[0];

			return post;
		} catch (error) {
			throw error;
		}
	}

	async findPost(reqUser: JwtPayload, id: number) {
		try {
			const posts = await this.postRepository.find({
				where: { id: id },
				withDeleted: true,
				relations: ['tags'],
			});
			const post = posts[0];

			// 로그인 vs 비로그인
			let newPost = {};
			if (reqUser) {
				const likePosts = await this.likePostRepository.find({
					where: {
						post: { id: id },
						user: { id: reqUser.id },
					},
				});
				let isUserLikeThis = false;
				if (likePosts.length !== 0) {
					isUserLikeThis = true;
				} else {
					isUserLikeThis = false;
				}

				const savedPosts = await this.savedPostRepository.find({
					where: {
						post: { id: id },
						user: { id: reqUser.id },
					},
				});
				let isUserSaveThis = false;
				if (savedPosts.length !== 0) {
					isUserSaveThis = true;
				} else {
					isUserSaveThis = false;
				}

				const isSubscribed = await this.userService.isSubscribed(
					reqUser.id,
					post.user.id,
				);

				newPost = {
					...post,
					isUserLikeThis,
					isUserSaveThis,
					isSubscribed,
				};
				return newPost;
			} else {
				return post;
			}
		} catch (error) {
			throw error;
		}
	}

	// 카테고리
	async findCategories() {
		try {
			const categories = await this.categoryRepository.find({
				relations: ['subcategories'],
			});
			return categories;
		} catch (error) {
			throw error;
		}
	}

	// 태그
	async findTags(keyword: string) {
		// TODO: 속도가 느리다면 redis 이용하는 방식으로 수정
		try {
			const tags = await this.tagRepository
				.createQueryBuilder('tag')
				.where('MATCH(tag.name) AGAINST(:keyword IN BOOLEAN MODE)', {
					keyword: `${keyword}*`,
				})
				.take(5)
				.getMany();
			return tags;
		} catch (error) {
			throw error;
		}
	}

	async createComment(
		reqUser: JwtPayload,
		postId: number,
		createCommentReq: CreateCommentReq,
	) {
		try {
			const { parentId, mentionUserId, content } = createCommentReq;

			const posts = await this.postRepository.findBy({ id: postId });
			const post = posts[0];
			const user = await this.userService.findUser(reqUser.id);
			let mentionUser = null;
			if (mentionUserId) {
				mentionUser = await this.userService.findUser(mentionUserId);
			}
			const comment = this.commentRepository.create({
				parentId,
				mentionUser,
				content,
				post,
				user,
			});

			await this.postRepository.update(
				{ id: postId },
				{
					commentCount: () => 'commentCount + 1',
				},
			);

			await this.userService.updateCommentCount(reqUser.id, true);

			const savedComment = await this.commentRepository.save(comment);

			let notificationType = null;
			let receiverId = null;
			if (parentId) {
				if (mentionUser) {
					notificationType =
						NotificationType.MY_COMMENT_REPLY_MENTION;
					receiverId = mentionUser.id;
				} else {
					notificationType = NotificationType.MY_COMMENT_REPLY;
					receiverId = comment.userId;
				}
			} else {
				notificationType = NotificationType.MY_POST_REPLY;
				receiverId = post.userId;
			}

			await this.notificationService.createNotification(
				notificationType,
				receiverId,
				reqUser.id,
				post.id,
				savedComment.id,
			);
			return savedComment;
		} catch (error) {
			throw error;
		}
	}

	async findCommentById(id: number) {
		try {
			const comments = await this.commentRepository.findBy({ id });
			const comment = comments[0];

			return comment;
		} catch (error) {
			throw error;
		}
	}

	async findComments(reqUser: JwtPayload, postId: number) {
		try {
			const comments = await this.commentRepository.find({
				where: { post: { id: postId } },
				relations: [
					'user',
					'mentionUser',
					'likeComments',
					'likeComments.user',
				],
				order: {
					createdAt: 'ASC',
				},
				withDeleted: true,
			});

			// 로그인 vs 비로그인
			if (reqUser) {
				return comments.map((comment) => {
					if (comment.deletedAt) {
						const { content, ...rest } = comment;
						const likedByCurrentUser = comment.likeComments.some(
							(likeComment) =>
								likeComment?.user?.id === reqUser.id,
						);

						return {
							...rest,
							likedByCurrentUser,
						};
					}

					const likedByCurrentUser = comment.likeComments.some(
						(likeComment) => likeComment?.user?.id === reqUser.id,
					);

					return {
						...comment,
						likedByCurrentUser,
					};
				});
			} else {
				return comments;
			}
		} catch (error) {
			throw error;
		}
	}

	async createLikeComment(reqUser: JwtPayload, commentId: number) {
		try {
			const comments = await this.commentRepository.findBy({
				id: commentId,
			});
			const comment = comments[0];
			comment.likedCount += 1;
			await this.commentRepository.save(comment);

			const user = await this.userService.findUser(reqUser.id);
			const like = this.likeCommentRepository.create({
				user,
				comment,
			});
			await this.likeCommentRepository.save(like);

			await this.notificationService.createNotification(
				NotificationType.MY_COMMENT_LIKE,
				comment.userId,
				reqUser.id,
				comment.postId,
				comment.id,
			);
			return;
		} catch (error) {
			throw error;
		}
	}

	async removeLikeComment(reqUser: JwtPayload, commentId: number) {
		try {
			const comments = await this.commentRepository.findBy({
				id: commentId,
			});
			const comment = comments[0];
			comment.likedCount -= 1;
			await this.commentRepository.save(comment);

			const likes = await this.likeCommentRepository.findBy({
				user: { id: reqUser.id },
				comment: { id: commentId }, // TODO: 자기참조관계로 변경 시 수정
			});
			const like = likes[0];
			await this.likeCommentRepository.remove(like);

			await this.notificationService.createNotification(
				NotificationType.MY_COMMENT_LIKE_CANCLE,
				comment.userId,
				reqUser.id,
				comment.postId,
				comment.id,
			);
			return;
		} catch (error) {
			throw error;
		}
	}

	async removeComment(reqUser: JwtPayload, commentId: number) {
		try {
			const comments = await this.commentRepository.find({
				where: { id: commentId },
				relations: ['user'],
			});
			const comment = comments[0];

			if (comment.user.id === reqUser.id) {
				await this.commentRepository.softRemove(comment);
			}

			return;
		} catch (error) {
			throw error;
		}
	}

	async createLikePost(reqUser: JwtPayload, postId: number) {
		try {
			const posts = await this.postRepository.findBy({
				id: postId,
			});
			const post = posts[0];
			post.likeCount += 1;
			await this.postRepository.save(post);

			const user = await this.userService.findUser(reqUser.id);
			const like = this.likePostRepository.create({
				user,
				post,
			});
			await this.likePostRepository.save(like);

			await this.notificationService.createNotification(
				NotificationType.MY_POST_LIKE,
				post.userId,
				reqUser.id,
				post.id,
				null,
			);
			return;
		} catch (error) {
			throw error;
		}
	}

	async removeLikePost(reqUser: JwtPayload, postId: number) {
		try {
			const posts = await this.postRepository.findBy({
				id: postId,
			});
			const post = posts[0];
			post.likeCount -= 1;
			await this.postRepository.save(post);

			const likes = await this.likePostRepository.findBy({
				user: { id: reqUser.id },
				post: { id: postId }, // TODO: 자기참조관계로 변경 시 수정
			});
			const like = likes[0];

			await this.notificationService.createNotification(
				NotificationType.MY_POST_LIKE_CANCLE,
				post.userId,
				reqUser.id,
				post.id,
				null,
			);
			return await this.likePostRepository.remove(like);
		} catch (error) {
			throw error;
		}
	}

	async upPostViewCount(reqUser: JwtPayload, postId: number) {
		try {
			await this.postRepository.update(
				{ id: postId },
				{
					viewCount: () => 'viewCount + 1',
				},
			);
			return;
		} catch (error) {
			throw error;
		}
	}

	async getPostsOfUser(reqUser: JwtPayload, userId: number) {
		try {
			const posts = await this.postRepository.find({
				where: { user: { id: userId } },
				order: {
					createdAt: 'DESC',
				},
			});

			return posts;
		} catch (error) {
			throw error;
		}
	}

	async getCommentOfUser(reqUser: JwtPayload, userId: number) {
		try {
			if (reqUser.id !== userId) {
				throw new UnauthorizedException('권한이 없습니다');
			}
			// TODO: 삭제했던 내용도 볼 수 있음. 이를 유지할지 결정
			return await this.commentRepository.find({
				where: { user: { id: userId } },
				relations: ['post'],
				order: {
					createdAt: 'DESC',
				},
				withDeleted: true,
			});
		} catch (error) {
			throw error;
		}
	}

	async searchPosts(offset: number = 0, searchWord: string) {
		const posts = this.postRepository
			.createQueryBuilder('post')
			.leftJoinAndSelect('post.user', 'user')
			.leftJoinAndSelect('post.tags', 'tags')
			.leftJoinAndSelect('post.category', 'category')
			.leftJoinAndSelect('post.subcategory', 'subcategory')
			.where(
				'MATCH(post.title, post.excerpt, post.content) AGAINST(:searchWord IN BOOLEAN MODE)',
				{
					searchWord: `${searchWord}*`,
				},
			)
			.orderBy('post.createdAt', 'DESC')
			.take(10)
			.skip(offset)
			.getMany();

		return plainToInstance(FindPostMinRes, posts);
	}

	async savePost(reqUser: JwtPayload, postId: number) {
		try {
			const posts = await this.postRepository.findBy({
				id: postId,
			});
			const post = posts[0];

			const user = await this.userService.findUser(reqUser.id);
			const savedPost = this.savedPostRepository.create({
				user,
				post,
			});
			await this.savedPostRepository.save(savedPost);
			return;
		} catch (error) {
			throw error;
		}
	}

	async cancelSavePost(reqUser: JwtPayload, postId: number) {
		try {
			const savedPosts = await this.savedPostRepository.findBy({
				user: { id: reqUser.id },
				post: { id: postId },
			});
			const savedPost = savedPosts[0];
			return await this.savedPostRepository.remove(savedPost);
		} catch (error) {
			throw error;
		}
	}

	async getSavedPost(reqUser: JwtPayload) {
		try {
			const savedPosts = await this.savedPostRepository.find({
				where: { user: { id: reqUser.id } },
				relations: ['post', 'post.tags'],
				order: {
					id: 'DESC',
				},
			});

			return plainToInstance(FindPopularPostMinRes, savedPosts);
		} catch (error) {
			throw error;
		}
	}
}
