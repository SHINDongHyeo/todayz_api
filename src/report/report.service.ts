import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtPayload } from 'src/auth/interfaces/auth.interface';
import { PostService } from 'src/post/post.service';
import { UserService } from 'src/user/user.service';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateCommentReportRes, CreatePostReportRes } from './dto/report.dto';
import { CommentReport } from './entities/commentReport.entity';
import { PostReport } from './entities/postReport.entity';

@Injectable()
export class ReportService {
	constructor(
		@InjectRepository(PostReport)
		private readonly postReportRepository: Repository<PostReport>,
		@InjectRepository(CommentReport)
		private readonly commentReportRepository: Repository<CommentReport>,
		private readonly userService: UserService,
		private readonly postService: PostService,
	) {}

	async createPostReport(
		reqUser: JwtPayload,
		createPostReportRes: CreatePostReportRes,
	) {
		try {
			const user = await this.userService.findUser(reqUser.id);
			const post = await this.postService.findPostById(
				createPostReportRes.postId,
			);

			const report = this.postReportRepository.create({
				...createPostReportRes,
				post,
				user,
			});
			return await this.postReportRepository.save(report);
		} catch (error) {
			if (error instanceof QueryFailedError) {
				if (error.message.includes('Duplicate entry')) {
					throw new ConflictException('이미 신고가 접수되었습니다');
				}
			}
			throw error;
		}
	}

	async createCommentReport(
		reqUser: JwtPayload,
		createCommentReportRes: CreateCommentReportRes,
	) {
		try {
			const user = await this.userService.findUser(reqUser.id);
			const comment = await this.postService.findCommentById(
				createCommentReportRes.commentId,
			);

			const report = this.commentReportRepository.create({
				...createCommentReportRes,
				comment,
				user,
			});
			return await this.commentReportRepository.save(report);
		} catch (error) {
			if (error instanceof QueryFailedError) {
				if (error.message.includes('Duplicate entry')) {
					throw new ConflictException('이미 신고가 접수되었습니다');
				}
			}
			throw error;
		}
	}
}
