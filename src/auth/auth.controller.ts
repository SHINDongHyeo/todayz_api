import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { UserSocialProvider } from 'src/user/interfaces/user.interface';
import { AuthService } from './auth.service';
import {
	IssueJWTRes,
	ReissueJwtReq,
	SignInReq,
	ValidateNicknameReq,
	ValidateNicknameRes,
} from './dto/auth.dto';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('jwt/reissue')
	async reissueJwt(
		@Body() reissueJwtReq: ReissueJwtReq,
	): Promise<IssueJWTRes> {
		return this.authService.reissueJwt(reissueJwtReq);
	}

	@Post('sign-in')
	async signIn(@Body() signInReq: SignInReq): Promise<IssueJWTRes> {
		return this.authService.signIn(signInReq);
	}

	@Get('nickname/validate')
	async validateNickname(
		@Query() validateNicknameReq: ValidateNicknameReq,
	): Promise<ValidateNicknameRes> {
		return this.authService.validateNickname(validateNicknameReq);
	}
}
