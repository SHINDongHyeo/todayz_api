import {
	IsDate,
	IsEmail,
	IsEnum,
	IsInt,
	IsNotEmpty,
	IsString,
} from 'class-validator';
import {
	UserRank,
	UserSocialProvider,
} from 'src/user/interfaces/user.interface';

export class ReissueJwtReq {
	@IsString()
	@IsNotEmpty()
	refreshToken: string;
}

export class SignUpReq {
	@IsString()
	token: string;

	@IsString()
	nickname: string;

	@IsEnum(UserSocialProvider)
	provider: UserSocialProvider;
}

export class SignInReq {
	@IsString()
	token: string;

	@IsEnum(UserSocialProvider)
	provider: UserSocialProvider;
}

export class SignInRes {
	@IsString()
	accessToken: string;

	@IsString()
	refreshToken: string;

	@IsInt()
	id: number;

	@IsString()
	email: string;
}
