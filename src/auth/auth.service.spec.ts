import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import { now } from 'moment-timezone';
import { FindUserRes } from 'src/user/dto/user.dto';
import {
	UserRank,
	UserRole,
	UserSocialProvider,
} from 'src/user/interfaces/user.interface';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
	let authService: AuthService;
	let accessTokenJwtService: JwtService;
	let refreshTokenJwtService: JwtService;
	let configService: ConfigService;
	let userService: UserService;

	const id = 1;
	const email = 'test@todayz.org';
	const accessToken = 'access_token_sign';
	const refreshToken = 'refresh_token_sign';

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AuthService,
				{
					provide: 'AccessTokenJwtService',
					useValue: {
						sign: jest.fn().mockReturnValue(accessToken),
						verify: jest.fn(),
					},
				},
				{
					provide: 'RefreshTokenJwtService',
					useValue: {
						sign: jest.fn().mockReturnValue(refreshToken),
						verify: jest
							.fn()
							.mockReturnValue({ id: id, email: email }),
					},
				},
				{
					provide: ConfigService,
					useValue: {},
				},
				{
					provide: UserService,
					useValue: {
						findUserBySocialIdAndProvider: jest.fn(),
						findUserByNickname: jest.fn(),
					},
				},
			],
		}).compile();

		authService = module.get<AuthService>(AuthService);
		accessTokenJwtService = module.get<JwtService>('AccessTokenJwtService');
		refreshTokenJwtService = module.get<JwtService>(
			'RefreshTokenJwtService',
		);
		configService = module.get<ConfigService>(ConfigService);
		userService = module.get<UserService>(UserService);
	});

	it('JWT 토큰 발급 성공', async () => {
		const result = await authService.issueJwt(id, email);

		expect(result).toEqual({
			accessToken: accessToken,
			refreshToken: refreshToken,
			id: id,
			email: email,
		});
	});

	it('JWT 토큰 재발급 성공', async () => {
		const result = await authService.reissueJwt(refreshToken);

		expect(result).toEqual({
			accessToken: accessToken,
			refreshToken: refreshToken,
			id: id,
			email: email,
		});
	});

	it('로그인 성공', async () => {
		const token = '123';
		const provider = UserSocialProvider.KAKAO;

		jest.spyOn(authService, 'verifyKakao').mockResolvedValue({
			socialId: 'socialId',
			email: email,
		});
		jest.spyOn(
			userService,
			'findUserBySocialIdAndProvider',
		).mockResolvedValue({
			id: id,
			socialId: 'socialId',
			socialProvider: UserSocialProvider.KAKAO,
			email: email,
			nickname: 'nickname',
			role: UserRole.USER,
			rank: UserRank.BRONZE,
			rankPoint: 0,
			profileImageUrl: '',
			introduction: '',
			subscriberCount: 0,
			subscribeCount: 0,
			postCount: 0,
			commentCount: 0,
			debateCount: 0,
			createdAt: new Date(),
		});

		const result = await authService.signIn(token, provider);

		expect(result).toEqual({
			accessToken: accessToken,
			refreshToken: refreshToken,
			id: id,
			email: email,
		});
	});

	it('닉네임 중복 테스트 성공', async () => {
		jest.spyOn(userService, 'findUserByNickname').mockResolvedValue(
			plainToInstance(FindUserRes, {
				id: 1,
				nickname: 'test',
				role: UserRole.USER,
				rank: UserRank.BRONZE,
				rankPoint: 1,
				profileImageUrl: 'test',
				introduction: 'test',
				subscriberCount: 1,
				subscribeCount: 1,
				postCount: 1,
				commentCount: 1,
				debateCount: 1,
				createdAt: new Date(),
			}),
		);

		const result = await authService.validateNickname('test');

		expect(result).toEqual({ canUse: false });
	});

	it('닉네임 중복 테스트 실패', async () => {
		jest.spyOn(userService, 'findUserByNickname').mockRejectedValue(
			new NotFoundException(`해당 유저가 발견되지 않습니다`),
		);

		const result = await authService.validateNickname('test');

		expect(result).toEqual({ canUse: true });
	});
});
