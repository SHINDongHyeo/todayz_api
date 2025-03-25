import {
	BadRequestException,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import { now } from 'moment-timezone';
import { FindUserRes } from 'src/user/dto/user.dto';
import { User } from 'src/user/entities/user.entity';
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

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AuthService,
				{
					provide: 'AccessTokenJwtService',
					useValue: {
						sign: jest.fn(),
						verify: jest.fn(),
					},
				},
				{
					provide: 'RefreshTokenJwtService',
					useValue: {
						sign: jest.fn(),
						verify: jest.fn(),
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
						createUser: jest.fn(),
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

	it('JWT 재발급: 성공', async () => {
		// given
		const refreshToken = 'testRefreshToken';
		jest.spyOn(refreshTokenJwtService, 'verify').mockReturnValue({
			id: 'testId',
			email: 'testEmail',
		});
		jest.spyOn(accessTokenJwtService, 'sign').mockReturnValue(
			'testAccessToken',
		);
		jest.spyOn(refreshTokenJwtService, 'sign').mockReturnValue(
			'testRefreshToken',
		);

		// when
		const result = await authService.reissueJwt({ refreshToken });

		// then
		expect(result).toEqual({
			accessToken: 'testAccessToken',
			refreshToken: 'testRefreshToken',
			id: 'testId',
			email: 'testEmail',
		});
	});

	it('JWT 재발급: 실패 - 리프레쉬 토큰 검증 실패', async () => {
		// given
		const refreshToken = 'testRefreshToken';
		jest.spyOn(refreshTokenJwtService, 'verify').mockImplementation(() => {
			throw new UnauthorizedException();
		});
		jest.spyOn(accessTokenJwtService, 'sign').mockReturnValue(
			'testAccessToken',
		);
		jest.spyOn(refreshTokenJwtService, 'sign').mockReturnValue(
			'testRefreshToken',
		);

		// when & then
		await expect(authService.reissueJwt({ refreshToken })).rejects.toThrow(
			UnauthorizedException,
		);
	});

	it('로그인: 성공(카카오)', async () => {
		// given
		const socialId = 'testSocialId';
		const email = 'testEmail';
		const token = 'testToken';
		const provider = UserSocialProvider.KAKAO;
		const id = 1;
		const testAccessToken = 'testAccessToken';
		const testRefreshToken = 'testRefreshToken';
		jest.spyOn(authService as any, 'verifyKakao').mockResolvedValue({
			socialId: socialId,
			email: email,
		});
		jest.spyOn(
			userService,
			'findUserBySocialIdAndProvider',
		).mockResolvedValue({
			id: id,
			socialId: socialId,
			socialProvider: provider,
			email: email,
			nickname: 'testNickname',
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
		jest.spyOn(accessTokenJwtService, 'sign').mockReturnValue(
			testAccessToken,
		);
		jest.spyOn(refreshTokenJwtService, 'sign').mockReturnValue(
			testRefreshToken,
		);

		// when
		const result = await authService.signIn({ token, provider });

		// then
		expect(result).toEqual({
			accessToken: testAccessToken,
			refreshToken: testRefreshToken,
			id: id,
			email: email,
		});
	});

	it('로그인: 성공(카카오) - 자동 회원가입 후 로그인', async () => {
		// given
		const socialId = 'testSocialId';
		const email = 'testEmail';
		const token = 'testToken';
		const provider = UserSocialProvider.KAKAO;
		const id = 1;
		const testAccessToken = 'testAccessToken';
		const testRefreshToken = 'testRefreshToken';
		jest.spyOn(authService as any, 'verifyKakao').mockResolvedValue({
			socialId: socialId,
			email: email,
		});
		jest.spyOn(
			userService,
			'findUserBySocialIdAndProvider',
		).mockImplementation(() => {
			throw new NotFoundException();
		});
		jest.spyOn(userService, 'createUser').mockResolvedValue({
			id: id,
			email: email,
		} as User);
		jest.spyOn(accessTokenJwtService, 'sign').mockReturnValue(
			testAccessToken,
		);
		jest.spyOn(refreshTokenJwtService, 'sign').mockReturnValue(
			testRefreshToken,
		);

		// when
		const result = await authService.signIn({ token, provider });

		// then
		expect(result).toEqual({
			accessToken: testAccessToken,
			refreshToken: testRefreshToken,
			id: id,
			email: email,
		});
	});

	it('로그인: 성공(구글)', async () => {
		// given
		const socialId = 'testSocialId';
		const email = 'testEmail';
		const token = 'testToken';
		const provider = UserSocialProvider.GOOGLE;
		const id = 1;
		const testAccessToken = 'testAccessToken';
		const testRefreshToken = 'testRefreshToken';
		jest.spyOn(authService as any, 'verifyGoogle').mockResolvedValue({
			socialId: socialId,
			email: email,
		});
		jest.spyOn(
			userService,
			'findUserBySocialIdAndProvider',
		).mockResolvedValue({
			id: id,
			socialId: socialId,
			socialProvider: provider,
			email: email,
			nickname: 'testNickname',
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
		jest.spyOn(accessTokenJwtService, 'sign').mockReturnValue(
			testAccessToken,
		);
		jest.spyOn(refreshTokenJwtService, 'sign').mockReturnValue(
			testRefreshToken,
		);

		// when
		const result = await authService.signIn({ token, provider });

		// then
		expect(result).toEqual({
			accessToken: testAccessToken,
			refreshToken: testRefreshToken,
			id: id,
			email: email,
		});
	});

	it('로그인: 성공(구글) - 자동 회원가입 후 로그인', async () => {
		// given
		const socialId = 'testSocialId';
		const email = 'testEmail';
		const token = 'testToken';
		const provider = UserSocialProvider.GOOGLE;
		const id = 1;
		const testAccessToken = 'testAccessToken';
		const testRefreshToken = 'testRefreshToken';
		jest.spyOn(authService as any, 'verifyGoogle').mockResolvedValue({
			socialId: socialId,
			email: email,
		});
		jest.spyOn(
			userService,
			'findUserBySocialIdAndProvider',
		).mockImplementation(() => {
			throw new NotFoundException();
		});
		jest.spyOn(userService, 'createUser').mockResolvedValue({
			id: id,
			email: email,
		} as User);
		jest.spyOn(accessTokenJwtService, 'sign').mockReturnValue(
			testAccessToken,
		);
		jest.spyOn(refreshTokenJwtService, 'sign').mockReturnValue(
			testRefreshToken,
		);

		// when
		const result = await authService.signIn({ token, provider });

		// then
		expect(result).toEqual({
			accessToken: testAccessToken,
			refreshToken: testRefreshToken,
			id: id,
			email: email,
		});
	});

	it('로그인: 실패 - 허용되지 않은 공급자', async () => {
		// given
		const token = 'testToken';
		const provider = 'notAllowedProvider' as UserSocialProvider;

		// when & then
		await expect(authService.signIn({ token, provider })).rejects.toThrow(
			new BadRequestException('지원하지 않는 소셜 로그인 공급자입니다'),
		);
	});

	it('닉네임 중복 검사: 성공 - 중복된 닉네임', async () => {
		// given
		jest.spyOn(userService, 'findUserByNickname').mockResolvedValue(
			plainToInstance(FindUserRes, {
				id: 1,
				nickname: 'testNickname',
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

		// when & then
		await expect(
			authService.validateNickname({ nickname: 'testNickname' }),
		).resolves.toEqual({
			canUse: false,
		});
	});

	it('닉네임 중복 검사: 성공 - 중복되지 않은 닉네임', async () => {
		// given
		jest.spyOn(userService, 'findUserByNickname').mockImplementation(() => {
			throw new NotFoundException(`해당 유저가 발견되지 않습니다`);
		});

		// when & then
		await expect(
			authService.validateNickname({ nickname: 'testNickname' }),
		).resolves.toEqual({
			canUse: true,
		});
	});
});
