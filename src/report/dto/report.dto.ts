import { Transform, Type } from 'class-transformer';
import {
	IsEnum,
	IsInt,
	IsNotEmpty,
	IsOptional,
	IsString,
} from 'class-validator';
import {
	CommentReportType,
	PostReportType,
} from '../inferfaces/report.interface';

export class CreatePostReportRes {
	@IsEnum(PostReportType)
	@IsNotEmpty()
	type: PostReportType;

	@IsString()
	detail: string;

	@Transform(({ value }) => {
		if (value === null || value === undefined || value === '') {
			return null;
		}
		return Number(value);
	})
	@IsInt()
	@IsNotEmpty()
	postId: number;
}

export class CreateCommentReportRes {
	@IsEnum(CommentReportType)
	@IsNotEmpty()
	type: CommentReportType;

	@IsString()
	detail: string;

	@Transform(({ value }) => {
		if (value === null || value === undefined || value === '') {
			return null;
		}
		return Number(value);
	})
	@IsInt()
	@IsNotEmpty()
	commentId: number;
}
