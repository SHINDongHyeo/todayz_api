import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

describe('UserService', () => {
	let userService: UserService;
	let userRepository: Repository<User>;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UserService,
				{
					provide: getRepositoryToken(User),
					useValue: {
						create: jest.fn().mockImplementation((dto) => dto),
						insert: jest.fn().mockResolvedValue(undefined),
					},
				},
			],
		}).compile();

		userService = module.get<UserService>(UserService);
		userRepository = module.get<Repository<User>>(getRepositoryToken(User));
	});

	it('신규 유저 생성 성공', async () => {
		// Arrange
		const createUserReq = {
			socialId: 'testSocialId',
			email: 'test@example.com',
			nickname: 'testNick',
		};

		// Act
		await userService.createUser(createUserReq);

		// Assert
		expect(userRepository.insert).toHaveBeenCalledWith(
			userRepository.create(createUserReq),
		);
	});
});
