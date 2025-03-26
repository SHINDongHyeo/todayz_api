import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	Query,
	UseGuards,
	Req,
	ParseIntPipe,
	DefaultValuePipe,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { plainToInstance } from 'class-transformer';
import { AuthGuard } from 'src/_common/guards/jwt/auth.guard';
import { OptionalAuthGuard } from 'src/_common/guards/jwt/optionalAuth.guard';
import {
	CreateCommentReq,
	FindCommentsRes,
	FindMyCommentsRes,
} from './dto/comment.dto';
import {
	CreatePostReq,
	FindPostMinRes,
	FindPostRes,
	SubscribedReq,
} from './dto/post.dto';
import { Category } from './entities/category.entity';
import { PostType } from './interfaces/post.interface';
import { PostService } from './post.service';

@Controller('post')
export class PostController {
	constructor(private readonly postService: PostService) {}

	// 테스트용
	@Get('test')
	async test() {
		return await this.postService.test();
	}

	// 게시물
	// @UseGuards(AuthGuard)
	@Get()
	async findPosts(
		@Query('offset', ParseIntPipe) offset: number,
		@Query('type') type: PostType,
		@Query('categoryId') categoryId?: number,
		@Query('subcategoryId') subcategoryId?: number,
	) {
		if (type === PostType.LATEST) {
			if (!categoryId) {
				return await this.postService.findPostsLatest(offset);
			} else {
				return await this.postService.findPostsLatestByCategory(
					offset,
					categoryId,
					subcategoryId,
				);
			}
		} else if (type === PostType.POPULAR) {
			return await this.postService.findPostsPopular(offset);
		} else {
			return;
		}
	}

	@UseGuards(AuthGuard)
	@Post()
	async createPost(@Req() req: any, @Body() createPostReq: CreatePostReq) {
		return await this.postService.createPost(req.user, createPostReq);
	}

	@UseGuards(AuthGuard)
	@Get('subscribed')
	async findSubscribedPosts(
		@Req() req: any,
		@Query() subscribedReq: SubscribedReq,
	) {
		return await this.postService.findSubscribedPosts(
			req.user,
			subscribedReq,
		);
	}

	// @UseGuards(AuthGuard)
	@Get('search')
	async searchPosts(
		@Query('offset', ParseIntPipe) offset: number,
		@Query('searchWord') searchWord: string,
	) {
		return await this.postService.searchPosts(offset, searchWord);
	}

	@UseGuards(AuthGuard)
	@Get('saved')
	async getSavedPost(@Req() req: any) {
		return await this.postService.getSavedPost(req.user);
	}

	// 카테고리
	// @UseGuards(AuthGuard)
	@Get('category')
	async findCategories() {
		return await this.postService.findCategories();
	}

	// 댓글

	// 태그
	@UseGuards(AuthGuard)
	@Get('tag')
	async findTags(@Query('keyword') keyword: string) {
		return await this.postService.findTags(keyword);
	}

	///////////////////////////// 동적 라우팅 ////////////////////////////////////
	@UseGuards(AuthGuard)
	@Get('comment/user/:id')
	async getCommentOfUser(
		@Req() req: any,
		@Param('id', ParseIntPipe) id: number,
	) {
		const comments = await this.postService.getCommentOfUser(req.user, id);
		return plainToInstance(FindMyCommentsRes, comments);
	}

	@UseGuards(AuthGuard)
	@Post('comment/:id/like')
	async createLikeComment(
		@Req() req: any,
		@Param('id', ParseIntPipe) id: number,
	) {
		await this.postService.createLikeComment(req.user, id);
		return;
	}

	@UseGuards(AuthGuard)
	@Delete('comment/:id/like')
	async removeLikeComment(
		@Req() req: any,
		@Param('id', ParseIntPipe) id: number,
	) {
		await this.postService.removeLikeComment(req.user, id);
		return;
	}

	@UseGuards(AuthGuard)
	@Delete('comment/:id')
	async removeComment(
		@Req() req: any,
		@Param('id', ParseIntPipe) id: number,
	) {
		return await this.postService.removeComment(req.user, id);
	}

	// @UseGuards(AuthGuard)
	@Get('user/:id')
	async getPostsOfUser(
		@Param('id', ParseIntPipe) id: number,
		@Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
	) {
		const posts = await this.postService.getPostsOfUser(id, offset);
		return plainToInstance(FindPostMinRes, posts);
	}

	@UseGuards(OptionalAuthGuard)
	@Get(':id/comment')
	async findComments(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
		const comments = await this.postService.findComments(req.user, id);
		return plainToInstance(FindCommentsRes, comments);
	}

	@UseGuards(AuthGuard)
	@Post(':id/comment')
	async createComment(
		@Req() req: any,
		@Param('id', ParseIntPipe) id: number,
		@Body() createCommentReq: CreateCommentReq,
	) {
		const comment = await this.postService.createComment(
			req.user,
			id,
			createCommentReq,
		);
		return plainToInstance(FindCommentsRes, comment);
	}

	// @UseGuards(AuthGuard)
	@Patch(':id/view')
	async upPostViewCount(
		@Req() req: any,
		@Param('id', ParseIntPipe) id: number,
	) {
		await this.postService.upPostViewCount(req.user, id);
		return;
	}

	@UseGuards(AuthGuard)
	@Post(':id/like')
	async createLikePost(
		@Req() req: any,
		@Param('id', ParseIntPipe) id: number,
	) {
		await this.postService.createLikePost(req.user, id);
		return;
	}

	@UseGuards(AuthGuard)
	@Delete(':id/like')
	async removeLikePost(
		@Req() req: any,
		@Param('id', ParseIntPipe) id: number,
	) {
		await this.postService.removeLikePost(req.user, id);
		return;
	}

	@UseGuards(AuthGuard)
	@Post(':id/save')
	async savePost(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
		await this.postService.savePost(req.user, id);
		return;
	}

	@UseGuards(AuthGuard)
	@Delete(':id/save')
	async cancelSavePost(
		@Req() req: any,
		@Param('id', ParseIntPipe) id: number,
	) {
		await this.postService.cancelSavePost(req.user, id);
		return;
	}

	@UseGuards(OptionalAuthGuard)
	@Get(':id')
	async findPost(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
		return plainToInstance(
			FindPostRes,
			await this.postService.findPost(req.user, id),
		);
	}
}
