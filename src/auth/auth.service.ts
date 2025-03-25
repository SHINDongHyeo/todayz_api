import {
	BadRequestException,
	Inject,
	InternalServerErrorException,
	NotFoundException,
	UnauthorizedException,
	Injectable,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/auth.interface';
import { UserSocialProvider } from 'src/user/interfaces/user.interface';
import { newRandomNick } from 'random-korean-nickname';
import { User } from 'src/user/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import {
	IssueJwtReq,
	IssueJWTRes,
	ReissueJwtReq,
	SignInReq,
	ValidateNicknameReq,
	ValidateNicknameRes,
} from './dto/auth.dto';

@Injectable()
export class AuthService {
	constructor(
		private readonly configService: ConfigService,
		@Inject('AccessTokenJwtService')
		private readonly accessTokenJwtService: JwtService,
		@Inject('RefreshTokenJwtService')
		private readonly refreshTokenJwtService: JwtService,
		private readonly userService: UserService,
	) {}

	// JWT 발급
	private async issueJwt(issueJwtReq: IssueJwtReq): Promise<IssueJWTRes> {
		const { id, email } = issueJwtReq;

		const payload: JwtPayload = {
			id: id,
			email: email,
		};
		const accessToken = this.accessTokenJwtService.sign(payload);
		const refreshToken = this.refreshTokenJwtService.sign(payload);

		return {
			accessToken,
			refreshToken,
			id,
			email,
		};
	}

	// JWT 재발급
	async reissueJwt(reissueJwtReq: ReissueJwtReq): Promise<IssueJWTRes> {
		const { refreshToken } = reissueJwtReq;
		try {
			const decoded = this.refreshTokenJwtService.verify(refreshToken);

			return this.issueJwt({ id: decoded.id, email: decoded.email });
		} catch (error) {
			throw new UnauthorizedException(
				'refresh token이 유효하지 않습니다',
			);
		}
	}

	// 로그인
	async signIn(signInReq: SignInReq): Promise<IssueJWTRes> {
		let { token, provider } = signInReq;
		let payload: { socialId: string; email: string } & Record<
			string,
			unknown
		>;
		try {
			payload = await this.verifyTokenByProvider(token, provider);

			try {
				const user =
					await this.userService.findUserBySocialIdAndProvider(
						payload.socialId,
						provider,
					);

				return await this.issueJwt({ id: user.id, email: user.email });
			} catch (error) {
				// 회원가입 진행
				if (error instanceof NotFoundException) {
					return await this.signUp(
						payload.socialId,
						provider,
						payload.email,
					);
				}
			}
		} catch (error) {
			throw error;
		}
	}

	// 소셜 로그인 공급자별 검증 분기 처리
	private async verifyTokenByProvider(
		token: string,
		provider: UserSocialProvider,
	) {
		switch (provider) {
			case UserSocialProvider.KAKAO:
				return await this.verifyKakao(token);
			case UserSocialProvider.GOOGLE:
				return await this.verifyGoogle(token);
			default:
				throw new BadRequestException(
					'지원하지 않는 소셜 로그인 공급자입니다',
				);
		}
	}

	// 카카오 api용 access token 요청
	private async getTokenForApiKakao(token: string) {
		const tokenResponse = await fetch(
			'https://kauth.kakao.com/oauth/token',
			{
				method: 'POST',
				headers: {
					'Content-Type':
						'application/x-www-form-urlencoded;charset=utf-8',
				},
				body: new URLSearchParams({
					grant_type: 'authorization_code',
					client_id:
						this.configService.get<string>('KAKAO_CLIENT_ID'),
					redirect_uri: `${this.configService.get<string>('FRONT_BASE_URL')}/sign-in/kakao`,
					code: token,
				}),
			},
		);

		return tokenResponse.json();
	}

	// 카카오 api 활용해 개인 정보 요청
	private async getUserInfoKakao(accessToken: string) {
		const userInfoResponse = await fetch(
			'https://kapi.kakao.com/v2/user/me',
			{
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${accessToken}`,
					'Content-Type':
						'application/x-www-form-urlencoded;charset=utf-8',
				},
			},
		);

		return userInfoResponse.json();
	}

	// 카카오 인증
	private async verifyKakao(token: string) {
		try {
			const tokenForApi = await this.getTokenForApiKakao(token);
			const accessToken = tokenForApi['access_token'];
			const userInfo = await this.getUserInfoKakao(accessToken);

			if (
				userInfo &&
				userInfo.id &&
				userInfo.kakao_account &&
				userInfo.kakao_account.email
			) {
				return {
					socialId: userInfo.id,
					email: userInfo.kakao_account.email,
				};
			}
			throw new UnauthorizedException(
				'카카오 oauth 인증 성공 후 반환된 값 형식에 문제가 있습니다',
			);
		} catch (error) {
			throw new UnauthorizedException('카카오 oauth 인증에 실패했습니다');
		}
	}

	// 구글 api용 access token 요청
	private async getTokenForApiGoogle(token: string) {
		const tokenResponse = await fetch(
			'https://oauth2.googleapis.com/token',
			{
				method: 'POST',
				headers: {
					'Content-Type':
						'application/x-www-form-urlencoded;charset=utf-8',
				},
				body: new URLSearchParams({
					grant_type: 'authorization_code',
					client_id:
						this.configService.get<string>('GOOGLE_CLIENT_ID'),
					client_secret: this.configService.get<string>(
						'GOOGLE_CLIENT_SECRET',
					),
					redirect_uri: `${this.configService.get<string>('FRONT_BASE_URL')}/sign-in/google`,
					code: token,
				}),
			},
		);
		return tokenResponse.json();
	}

	// 구글 api 활용해 개인 정보 요청
	private async getUserInfoGoogle(accessToken: string) {
		const userInfoResponse = await fetch(
			'https://www.googleapis.com/userinfo/v2/me',
			{
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${accessToken}`,
					'Content-Type':
						'application/x-www-form-urlencoded;charset=utf-8',
				},
			},
		);

		return userInfoResponse.json();
	}

	// 구글 인증
	private async verifyGoogle(token: string) {
		try {
			const tokenForApi = await this.getTokenForApiGoogle(token);
			const accessToken = tokenForApi['access_token'];
			const userInfo = await this.getUserInfoGoogle(accessToken);

			if (userInfo && userInfo.id && userInfo.email) {
				return {
					socialId: userInfo.id,
					email: userInfo.email,
				};
			}
			throw new UnauthorizedException(
				'구글 oauth 인증 성공 후 반환된 값 형식에 문제가 있습니다',
			);
		} catch (error) {
			throw new UnauthorizedException('구글 oauth 인증에 실패했습니다');
		}
	}

	// 회원가입
	private async signUp(
		socialId: string,
		provider: UserSocialProvider,
		email: string,
	) {
		let nickname: string;
		try {
			// 랜덤 닉네임 생성
			nickname = await newRandomNick();

			// 유저 생성
			const user = await this.userService.createUser(
				socialId,
				provider,
				email,
				nickname,
			);

			return await this.issueJwt({ id: user.id, email: user.email });
		} catch (error) {
			// 닉네임 중복 시
			if (
				error.code === 'ER_DUP_ENTRY' &&
				error.sqlMessage.includes('user.IDX_e2364281027b926b879fa2fa1e')
			) {
				await this.retrySignUp(socialId, provider, email, nickname, 1);
			} else {
				throw new InternalServerErrorException(
					'회원가입 중 예상치 못한 에러 발생',
				);
			}
		}
	}

	// 닉네임 중복 시 뒤에 숫자 붙여서 재생성
	private async retrySignUp(
		socialId: string,
		provider: UserSocialProvider,
		email: string,
		nickname: string,
		cnt: number, // 무한하게 호출될 위험성으로 5번만 재시도하도록
	) {
		if (cnt >= 5) {
			throw new InternalServerErrorException(
				'랜덤 닉네임 생성 중 에러 발생',
			);
		}

		let user: User;
		try {
			const randomNumber = String(
				Math.floor(Math.random() * 90000) + 10000,
			);

			user = await this.userService.createUser(
				socialId,
				provider,
				email,
				nickname + '-' + randomNumber,
			);

			return await this.issueJwt({ id: user.id, email: user.email });
		} catch (error) {
			if (
				error.code === 'ER_DUP_ENTRY' &&
				error.sqlMessage.includes('user.IDX_e2364281027b926b879fa2fa1e')
			) {
				await this.retrySignUp(
					socialId,
					provider,
					email,
					nickname,
					cnt + 1,
				);
			} else {
				throw new InternalServerErrorException(
					'랜덤 닉네임 생성 중 에러 발생',
				);
			}
		}
	}

	// 닉네임 중복 검사
	async validateNickname(
		validateNicknameReq: ValidateNicknameReq,
	): Promise<ValidateNicknameRes> {
		const { nickname } = validateNicknameReq;
		try {
			// 닉네임 사용할 수 없는 경우(유저 존재 O)
			await this.userService.findUserByNickname(nickname);

			return {
				canUse: false,
			};
		} catch (error) {
			// 닉네임 사용할 수 있는 경우(유저 존재 X)
			if (error instanceof NotFoundException) {
				return {
					canUse: true,
				};
			} else {
				throw error;
			}
		}
	}
}
