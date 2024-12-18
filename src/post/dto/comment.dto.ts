import { Exclude, Transform, Type } from 'class-transformer';
import {
	IsDate,
	IsInt,
	IsNotEmpty,
	IsOptional,
	IsString,
} from 'class-validator';
import { FindUserMinRes } from 'src/user/dto/user.dto';
import { Post } from '../entities/post.entity';
import { FindPostIdOnlyRes, FindPostMinRes } from './post.dto';

export class CreateCommentReq {
	@IsInt()
	@IsOptional()
	parentId: number;

	@IsInt()
	@IsOptional()
	mentionUserId: number;

	@IsString()
	@IsNotEmpty()
	content: string;
}

export class FindCommentsRes {
	@IsInt()
	@IsNotEmpty()
	id: number;

	@IsInt()
	@IsOptional()
	parentId: number;

	@IsInt()
	@IsNotEmpty()
	likedCount: number;

	@IsString()
	@IsNotEmpty()
	content: string;

	@IsDate()
	@IsNotEmpty()
	createdAt: Date;

	@Exclude()
	post: Post;

	@Type(() => FindUserMinRes)
	@IsNotEmpty()
	user: FindUserMinRes;

	@Type(() => FindUserMinRes)
	@IsOptional()
	mentionUser: FindUserMinRes;
}

export class FindMyCommentsRes {
	@IsInt()
	@IsNotEmpty()
	id: number;

	@IsInt()
	@IsOptional()
	parentId: number;

	@IsInt()
	@IsNotEmpty()
	likedCount: number;

	@IsString()
	@IsNotEmpty()
	content: string;

	@IsDate()
	@IsNotEmpty()
	createdAt: Date;

	@Type(() => FindPostIdOnlyRes)
	@IsNotEmpty()
	post: Post;

	@Type(() => FindUserMinRes)
	@IsNotEmpty()
	user: FindUserMinRes;

	@Type(() => FindUserMinRes)
	@IsOptional()
	mentionUser: FindUserMinRes;
}
