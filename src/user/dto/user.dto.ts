import { Exclude } from 'class-transformer';
import {
	IsBoolean,
	IsDate,
	IsEmail,
	IsEnum,
	IsInt,
	IsOptional,
	IsString,
} from 'class-validator';
import {
	UserRank,
	UserRole,
	UserSocialProvider,
} from '../interfaces/user.interface';

export class UserDto {
	@IsInt()
	id: number;

	@IsString()
	socialId: string;

	@IsEnum(UserSocialProvider)
	socialProvider: UserSocialProvider;

	@IsEmail()
	email: string;

	@IsString()
	nickname: string;

	@IsEnum(UserRole)
	role: UserRole;

	@IsEnum(UserRank)
	rank: UserRank;

	@IsInt()
	rankPoint: number;

	@IsString()
	profileImageUrl: string;

	@IsDate()
	createdAt: Date;
}

export class CreateUserReq {
	@IsString()
	socialId: string;

	@IsEnum(UserSocialProvider)
	socialProvider: UserSocialProvider;

	@IsEmail()
	email: string;

	@IsString()
	nickname: string;
}

export class FindUserRes {
	@IsInt()
	id: number;

	@Exclude()
	socialId: string;

	@Exclude()
	socialProvider: string;

	@Exclude()
	email: string;

	@IsString()
	nickname: string;

	@IsEnum(UserRole)
	role: UserRole;

	@IsEnum(UserRank)
	rank: UserRank;

	@IsInt()
	rankPoint: number;

	@IsString()
	profileImageUrl: string;

	@IsString()
	introduction: string;

	@IsInt()
	subscriberCount: number;

	@IsInt()
	subscribeCount: number;

	@IsInt()
	postCount: number;

	@IsInt()
	commentCount: number;

	@IsInt()
	debateCount: number;

	@IsDate()
	createdAt: Date;
}

export class FindUserMinRes {
	@IsInt()
	id: number;

	@Exclude()
	socialId: string;

	@Exclude()
	socialProvider: string;

	@Exclude()
	email: string;

	@IsString()
	nickname: string;

	@IsEnum(UserRole)
	role: UserRole;

	@IsEnum(UserRank)
	rank: UserRank;

	@Exclude()
	rankPoint: number;

	@IsString()
	profileImageUrl: string;

	@IsString()
	introduction: string;

	@IsInt()
	subscriberCount: number;

	@Exclude()
	subscribeCount: number;

	@IsInt()
	postCount: number;

	@Exclude()
	commentCount: number;

	@Exclude()
	debateCount: number;

	@Exclude()
	createdAt: Date;

	@IsBoolean()
	isSubcsribed: boolean;
}

export class UpdateUserReq {
	@IsString()
	@IsOptional()
	nickname: string;

	@IsString()
	@IsOptional()
	introduction: string;

	@IsString()
	@IsOptional()
	profileImageUrl: string;
}

export class UserWithImageRes {
	@IsInt()
	id: number;

	@Exclude()
	socialId: string;

	@Exclude()
	socialProvider: string;

	@Exclude()
	email: string;

	@IsString()
	nickname: string;

	@Exclude()
	role: UserRole;

	@Exclude()
	rank: UserRank;

	@Exclude()
	rankPoint: number;

	@IsString()
	profileImageUrl: string;

	@Exclude()
	introduction: string;

	@Exclude()
	subscriberCount: number;

	@Exclude()
	subscribeCount: number;

	@Exclude()
	postCount: number;

	@Exclude()
	commentCount: number;

	@Exclude()
	debateCount: number;

	@Exclude()
	createdAt: Date;
}
