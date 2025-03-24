import {
	ConflictException,
	Inject,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/auth.interface';
import {
	UserRank,
	UserSocialProvider,
} from 'src/user/interfaces/user.interface';
import { newRandomNick } from 'random-korean-nickname';
import { User } from 'src/user/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { IssueJWTRes } from './dto/auth.dto';

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
	async issueJwt(id: number, email: string): Promise<IssueJWTRes> {
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
	async reissueJwt(refreshToken: string) {
		try {
			const decoded = this.refreshTokenJwtService.verify(refreshToken);
			return this.issueJwt(decoded.id, decoded.email);
		} catch (error) {
			throw new UnauthorizedException(
				'refresh token이 유효하지 않습니다',
			);
		}
	}

	// JWT 인증
	// async validateJwt(accessToken: string, refreshToken: string) {
	// 	try {
	// 		this.accessTokenJwtService.verify(accessToken);
	// 		return;
	// 	} catch (error) {
	// 		try {
	// 			this.refreshTokenJwtService.verify(refreshToken);
	// 			return;
	// 		} catch (error) {
	// 			throw new UnauthorizedException(
	// 				'access token, refresh token 모두 유효하지 않습니다',
	// 			);
	// 		}
	// 	}
	// }

	// 로그인
	async signIn(token: string, provider: UserSocialProvider) {
		try {
			let payload: any;
			let socialId: string;
			let email: string;

			switch (provider) {
				case UserSocialProvider.KAKAO:
					payload = await this.verifyKakao(token);
					socialId = payload.socialId;
					email = payload.email;
					break;
				case UserSocialProvider.GOOGLE:
					payload = await this.verifyGoogle(token);
					socialId = payload.socialId;
					email = payload.email;
					break;
			}

			try {
				const user =
					await this.userService.findUserBySocialIdAndProvider(
						socialId,
						provider,
					);
				return await this.issueJwt(user.id, user.email);
			} catch (error) {
				// 데이터베이스에 유저 정보 없으면 회원가입 처리
				if (error instanceof NotFoundException) {
					return await this.signUp(socialId, provider, email);
				}
			}
		} catch (error) {
			throw error;
		}
	}

	// 카카오 인증
	async verifyKakao(token: string) {
		try {
			// 카카오 api용 access token 요청
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
			const tokenResponseJson = await tokenResponse.json();
			const access_token = tokenResponseJson['access_token'];

			// 카카오 api 활용해 개인 정보 요청
			const userInfoResponse = await fetch(
				'https://kapi.kakao.com/v2/user/me',
				{
					method: 'GET',
					headers: {
						'Authorization': `Bearer ${access_token}`,
						'Content-Type':
							'application/x-www-form-urlencoded;charset=utf-8',
					},
				},
			);
			const userInfo = await userInfoResponse.json();

			if (userInfo) {
				let payload = {
					socialId: '',
					email: '',
				};
				payload.socialId = userInfo.id;
				payload.email = userInfo.kakao_account.email;

				return payload;
			}
			throw new UnauthorizedException(
				'카카오 oauth 인증 성공 후 반환된 값이 없습니다',
			);
		} catch (error) {
			throw new UnauthorizedException('카카오 oauth 인증에 실패했습니다');
		}
	}

	// 구글 인증
	async verifyGoogle(token: string) {
		try {
			// 구글 api용 access token 요청
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
			const tokenResponseJson = await tokenResponse.json();
			const access_token = tokenResponseJson['access_token'];

			// 구글 api 활용해 개인 정보 요청
			const userInfoResponse = await fetch(
				'https://www.googleapis.com/userinfo/v2/me',
				{
					method: 'GET',
					headers: {
						'Authorization': `Bearer ${access_token}`,
						'Content-Type':
							'application/x-www-form-urlencoded;charset=utf-8',
					},
				},
			);
			const userInfo = await userInfoResponse.json();

			if (userInfo) {
				let payload = {
					socialId: '',
					email: '',
				};
				payload.socialId = userInfo.id;
				payload.email = userInfo.email;

				return payload;
			}
			throw new UnauthorizedException(
				'구글 oauth 인증 성공 후 반환된 값이 없습니다',
			);
		} catch (error) {
			throw new UnauthorizedException('구글 oauth 인증에 실패했습니다');
		}
	}

	// 회원가입
	async signUp(
		socialId: string,
		provider: UserSocialProvider,
		email: string,
	) {
		let user: User;
		let nickname: string;
		try {
			nickname = await newRandomNick();

			// 닉네임 중복 방지
			user = await this.userService.createUser(
				socialId,
				provider,
				email,
				nickname,
			);
		} catch (error) {
			if (
				error.code === 'ER_DUP_ENTRY' &&
				error.sqlMessage.includes('user.IDX_e2364281027b926b879fa2fa1e')
			) {
				user = await this.retrySignUp(
					socialId,
					provider,
					email,
					nickname,
					1,
				);
			} else {
				throw new InternalServerErrorException(
					'랜덤 닉네임 생성 중 에러 발생',
				);
			}
		}
		return await this.issueJwt(user.id, user.email);
	}

	// 닉네임 중복 시 뒤에 숫자 붙여서 재생성
	async retrySignUp(
		socialId: string,
		provider: UserSocialProvider,
		email: string,
		nickname: string,
		cnt: number, // 무한하게 호출될 위험성으로 5번만 재시도하도록
	) {
		let user: User;
		if (cnt >= 5) {
			throw new InternalServerErrorException(
				'랜덤 닉네임 생성 중 에러 발생',
			);
		}
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
		} catch (error) {
			if (
				error.code === 'ER_DUP_ENTRY' &&
				error.sqlMessage.includes('user.IDX_e2364281027b926b879fa2fa1e')
			) {
				user = await this.retrySignUp(
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
		return user;
	}

	// 닉네임 중복 검사
	async validateNickname(nickname: string) {
		try {
			const user = await this.userService.findUserByNickname(nickname);
			return {
				canUse: false,
			};
		} catch (error) {
			if (error instanceof NotFoundException) {
				return {
					canUse: true,
				};
			}
		}
	}
}
