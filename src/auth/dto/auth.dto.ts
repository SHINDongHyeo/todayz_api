import {
	IsBoolean,
	IsDate,
	IsEmail,
	IsEnum,
	IsInt,
	IsNotEmpty,
	IsNumber,
	IsString,
} from 'class-validator';
import { BlockList } from 'net';
import {
	UserRank,
	UserSocialProvider,
} from 'src/user/interfaces/user.interface';

// Req
export class ReissueJwtReq {
	@IsString()
	@IsNotEmpty()
	refreshToken: string;
}

export class SignInReq {
	@IsString()
	@IsNotEmpty()
	token: string;

	@IsEnum(UserSocialProvider)
	@IsNotEmpty()
	provider: UserSocialProvider;
}

export class ValidateNicknameReq {
	@IsString()
	@IsNotEmpty()
	nickname: string;
}

export class IssueJwtReq {
	@IsNumber()
	@IsNotEmpty()
	id: number;

	@IsEmail()
	@IsNotEmpty()
	email: string;
}

// Res
export class IssueJWTRes {
	@IsString()
	@IsNotEmpty()
	accessToken: string;

	@IsString()
	@IsNotEmpty()
	refreshToken: string;

	@IsNumber()
	@IsNotEmpty()
	id: number;

	@IsEmail()
	@IsNotEmpty()
	email: string;
}

export class ValidateNicknameRes {
	@IsBoolean()
	@IsNotEmpty()
	canUse: boolean;
}
