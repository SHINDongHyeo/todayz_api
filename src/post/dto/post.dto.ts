import { Exclude, Transform, Type } from 'class-transformer';
import {
	IsArray,
	IsDate,
	IsInt,
	IsNotEmpty,
	IsOptional,
	IsString,
	ValidateNested,
} from 'class-validator';
import { FindUserMinRes, FindUserRes } from 'src/user/dto/user.dto';
import { TagDto } from 'src/post/dto/tag.dto';
import { Category } from '../entities/category.entity';
import { Subcategory } from '../entities/subcategory.entity';
import { CategoryRes, SubcategoryRes } from './category.dto';

export class CreatePostReq {
	@IsString()
	@IsNotEmpty()
	title: string;

	@IsString()
	@IsNotEmpty()
	content: string;

	@IsString()
	@IsNotEmpty()
	excerpt: string;

	@Transform(({ value }) => {
		if (value === null || value === undefined || value === '') {
			return null;
		}
		return Number(value);
	})
	@IsInt()
	@IsNotEmpty()
	categoryId: number;

	@Transform(({ value }) => {
		if (value === null || value === undefined || value === '') {
			return null;
		}
		return Number(value);
	})
	@IsInt()
	@IsNotEmpty()
	subcategoryId: number;

	@Transform(({ value }) => {
		if (!value) {
			return [];
		}

		return typeof value === 'string' ? JSON.parse(value) : value;
	})
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => TagDto)
	@IsOptional()
	rawTags: TagDto[];
}

export class FindPostRes {
	@IsInt()
	@IsNotEmpty()
	id: number;

	@IsString()
	@IsNotEmpty()
	title: string;

	@IsString()
	@IsNotEmpty()
	content: string;

	@IsString()
	@IsNotEmpty()
	excerpt: string;

	@IsDate()
	@IsNotEmpty()
	createdAt: Date;

	@IsInt()
	@IsNotEmpty()
	viewCount: number;

	@IsInt()
	@IsNotEmpty()
	likeCount: number;

	@IsInt()
	@IsNotEmpty()
	commentCount: number;

	@Type(() => FindUserMinRes)
	user: FindUserMinRes;
}

export class FindPostMinRes {
	@IsInt()
	@IsNotEmpty()
	id: number;

	@IsString()
	@IsNotEmpty()
	title: string;

	@Exclude()
	content: string;

	@IsString()
	@IsNotEmpty()
	excerpt: string;

	@IsDate()
	@IsNotEmpty()
	createdAt: string;

	@IsInt()
	@IsNotEmpty()
	viewCount: number;

	@IsInt()
	@IsNotEmpty()
	likeCount: number;

	@IsInt()
	@IsNotEmpty()
	commentCount: number;

	@Type(() => FindUserMinRes)
	user: FindUserMinRes;

	@Type(() => CategoryRes)
	category: CategoryRes;

	@Type(() => SubcategoryRes)
	subcategory: SubcategoryRes;
}

export class FindPopularPostMinRes {
	@IsInt()
	@IsNotEmpty()
	id: number;

	@Type(() => FindPostMinRes)
	post: FindPostMinRes;
}

export class FindPostIdOnlyRes {
	@IsInt()
	@IsNotEmpty()
	id: number;

	@Exclude()
	title: string;

	@Exclude()
	content: string;

	@Exclude()
	excerpt: string;

	@Exclude()
	createdAt: string;

	@Exclude()
	viewCount: number;

	@Exclude()
	likeCount: number;

	@Exclude()
	commentCount: number;

	@Exclude()
	user: FindUserMinRes;
}

export class SubscribedReq {
	@Transform(({ value }) => {
		if (value === null || value === undefined || value === '') {
			return null;
		}
		return Number(value);
	})
	@IsInt()
	@IsNotEmpty()
	offset: number;

	@Transform(({ value }) => {
		if (value === null || value === undefined || value === '') {
			return null;
		}
		return Number(value);
	})
	@IsInt()
	@IsOptional()
	userId: number;
}
