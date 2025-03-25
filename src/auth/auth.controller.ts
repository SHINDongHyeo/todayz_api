import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { UserSocialProvider } from 'src/user/interfaces/user.interface';
import { AuthService } from './auth.service';
import {
	IssueJWTRes,
	ReissueJwtReq,
	SignInReq,
	SignInRes,
	SignUpReq,
} from './dto/auth.dto';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('jwt/reissue')
	async reissueJwt(
		@Body('refreshToken') refreshToken: string,
	): Promise<IssueJWTRes> {
		return this.authService.reissueJwt(refreshToken);
	}

	@Post('sign-in')
	async signIn(@Body() signInReq: SignInReq): Promise<SignInRes> {
		const { token, provider } = signInReq;
		const result = this.authService.signIn(token, provider);
		return result;
	}

	@Get('nickname/validate')
	async validateNickname(@Query('nickname') nickname: string) {
		return this.authService.validateNickname(nickname);
	}
}
