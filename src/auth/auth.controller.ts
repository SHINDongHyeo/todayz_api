import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ReissueJwtReq, SignInReq, SignInRes, SignUpReq } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('jwt/reissue')
	async reissueJwt(@Body('refreshToken') refreshToken: string) {
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
