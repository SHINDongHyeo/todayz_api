import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

describe('UserController', () => {
	let userController: UserController;
	let userService: UserService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [UserController],
			providers: [
				UserService,
				{
					provide: getRepositoryToken(User),
					useClass: Repository,
				},
			],
		}).compile();

		userController = module.get<UserController>(UserController);
		userService = module.get<UserService>(UserService);
	});

	it('should be defined', () => {
		expect(userController).toBeDefined();
	});
});
