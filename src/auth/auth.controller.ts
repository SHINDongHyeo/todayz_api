import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { UserSocialProvider } from 'src/user/interfaces/user.interface';
import { AuthService } from './auth.service';
import {
	IssueJWTRes,
	ReissueJwtReq,
	SignInReq,
	ValidateNicknameReq,
} from './dto/auth.dto';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('jwt/reissue')
	async reissueJwt(
		@Body() reissueJwtReq: ReissueJwtReq,
	): Promise<IssueJWTRes> {
		const { refreshToken } = reissueJwtReq;
		return this.authService.reissueJwt(refreshToken);
	}

	@Post('sign-in')
	async signIn(@Body() signInReq: SignInReq): Promise<IssueJWTRes> {
		const { token, provider } = signInReq;
		return this.authService.signIn(token, provider);
	}

	@Get('nickname/validate')
	async validateNickname(@Query() validateNicknameReq: ValidateNicknameReq) {
		const { nickname } = validateNicknameReq;
		return this.authService.validateNickname(nickname);
	}
}
