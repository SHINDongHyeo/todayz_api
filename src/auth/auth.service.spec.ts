import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
	let authService: AuthService;
	let userService: UserService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AuthService,
				{
					provide: UserService,
					useValue: {
						create: jest.fn(),
					},
				},
			],
		}).compile();

		authService = module.get<AuthService>(AuthService);
		userService = module.get<UserService>(UserService);
	});
});
