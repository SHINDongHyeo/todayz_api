import {
	IsDate,
	IsEmail,
	IsEnum,
	IsInt,
	IsNotEmpty,
	IsNumber,
	IsString,
} from 'class-validator';
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
