import {
	HttpException,
	HttpStatus,
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { JwtPayload } from 'src/auth/interfaces/auth.interface';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { FollowingRes } from './dto/subscribeInfo.dto';
import {
	CreateUserReq,
	FindUserRes,
	UpdateUserReq,
	UserDto,
} from './dto/user.dto';
import { SubscribeInfo } from './entities/subscribeInfo.entity';
import { User } from './entities/user.entity';
import { UserRank, UserSocialProvider } from './interfaces/user.interface';
import {
	S3Client,
	PutObjectCommand,
	DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
	private readonly s3Client: S3Client;
	private readonly bucketName: string;

	constructor(
		private readonly configService: ConfigService,
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		@InjectRepository(SubscribeInfo)
		private readonly subscribeInfoRepository: Repository<SubscribeInfo>,
		private readonly dataSource: DataSource,
	) {
		// ConfigService에서 값을 읽어와 초기화
		this.s3Client = new S3Client({
			region:
				this.configService.get<string>('AWS_REGION') ||
				'ap-northeast-2',
			credentials: {
				accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY'),
				secretAccessKey:
					this.configService.get<string>('AWS_SECRET_KEY'),
			},
		});
		this.bucketName =
			this.configService.get<string>('AWS_BUCKET_NAME') || 'todayz';
	}

	async isThereUnreadNotification(reqUser: JwtPayload) {
		try {
			const users = await this.userRepository.findBy({
				id: reqUser.id,
			});
			const user = users[0];

			return user.isUnreadNotification;
		} catch (error) {
			throw error;
		}
	}

	async createUser(
		socialId: string,
		socialProvider: UserSocialProvider,
		email: string,
		nickname: string,
	) {
		try {
			const user = this.userRepository.create({
				socialId,
				socialProvider,
				email,
				nickname,
				rank: UserRank.BRONZE,
			});
			await this.userRepository.insert(user);
			return user;
		} catch (error) {
			throw error;
		}
	}

	async findUser(id: number) {
		try {
			const users = await this.userRepository.findBy({ id });
			const user = users[0];
			if (!user) {
				throw new NotFoundException(`해당 유저가 발견되지 않습니다`);
			}
			return user;
		} catch (error) {
			throw error;
		}
	}

	async findUserBySocialIdAndProvider(
		socialId: string,
		socialProvider: UserSocialProvider,
	) {
		try {
			const user = await this.userRepository.findOneBy({
				socialId,
				socialProvider,
			});
			if (!user) {
				throw new NotFoundException(`해당 유저가 발견되지 않습니다`);
			}
			return plainToInstance(FindUserRes, user);
		} catch (error) {
			throw error;
		}
	}

	async findUserByNickname(nickname: string): Promise<FindUserRes> {
		try {
			const user = await this.userRepository.findOneBy({
				nickname,
			});
			if (!user) {
				throw new NotFoundException(`해당 유저가 발견되지 않습니다`);
			}
			return plainToInstance(FindUserRes, user);
		} catch (error) {
			throw error;
		}
	}

	async updateUser(
		id: number,
		updateUserReq: UpdateUserReq,
		file: Express.Multer.File,
	) {
		try {
			if (file) {
				// 커스텀 사진 s3에 업로드
				const key = `profile/${uuidv4()}-${file.originalname}`;

				const params = {
					Bucket: this.bucketName,
					Key: key,
					Body: file.buffer,
					ContentType: file.mimetype,
				};

				try {
					const s3Response = await this.s3Client.send(
						new PutObjectCommand(params),
					);

					const user = await this.userRepository.update(
						{ id },
						{
							nickname: updateUserReq.nickname,
							profileImageUrl: `https://${this.bucketName}.s3.${this.configService.get('AWS_REGION')}.amazonaws.com/${key}`,
						},
					);
					if (!user) {
						throw new NotFoundException(
							`해당 유저가 발견되지 않습니다`,
						);
					}
					return plainToInstance(FindUserRes, user);
				} catch (error) {
					console.error('S3 upload error:', error);
					throw new Error('파일 업로드 실패');
				}
			} else {
				const user = await this.userRepository.update(
					{ id },
					updateUserReq,
				);
				if (!user) {
					throw new NotFoundException(
						`해당 유저가 발견되지 않습니다`,
					);
				}
				return plainToInstance(FindUserRes, user);
			}
		} catch (error) {
			throw error;
		}
	}

	async updateNotification(id: number, isUnreadNotification: boolean) {
		try {
			await this.userRepository.update({ id }, { isUnreadNotification });
			return;
		} catch (error) {
			throw error;
		}
	}

	async updateCommentCount(id: number, isCreating: boolean) {
		try {
			if (isCreating) {
				await this.userRepository.update(id, {
					commentCount: () => 'commentCount + 1',
				});
			} else {
				await this.userRepository.update(id, {
					commentCount: () => 'commentCount - 1',
				});
			}
			return;
		} catch (error) {
			throw error;
		}
	}

	async updatePostCount(id: number, isCreating: boolean) {
		try {
			if (isCreating) {
				await this.userRepository.update(id, {
					postCount: () => 'postCount + 1',
				});
			} else {
				await this.userRepository.update(id, {
					postCount: () => 'postCount - 1',
				});
			}
			return;
		} catch (error) {
			throw error;
		}
	}

	async deleteUser(id: number) {
		try {
			const user = await this.userRepository.findOne({ where: { id } });
			if (!user) {
				throw new NotFoundException(`해당 유저가 발견되지 않습니다`);
			}

			await this.userRepository.delete({ id });
		} catch (error) {
			throw error;
		}
	}

	async subscribe(reqUser: JwtPayload, publisherUserId: number) {
		const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
		await queryRunner.connect();
		await queryRunner.startTransaction();

		try {
			await queryRunner.manager
				.createQueryBuilder()
				.update(User)
				.set({ subscribeCount: () => '`subscribeCount` + 1' })
				.where('id = :id', { id: reqUser.id })
				.execute();

			await queryRunner.manager
				.createQueryBuilder()
				.update(User)
				.set({ subscriberCount: () => '`subscriberCount` + 1' })
				.where('id = :id', { id: publisherUserId })
				.execute();

			await queryRunner.manager.insert(SubscribeInfo, {
				subscriber: { id: reqUser.id },
				publisher: { id: publisherUserId },
			});

			await queryRunner.commitTransaction();
			return;
		} catch (error) {
			throw error;
		} finally {
			await queryRunner.release();
		}
	}

	async unsubscribe(reqUser: JwtPayload, publisherUserId: number) {
		const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
		await queryRunner.connect();
		await queryRunner.startTransaction();

		try {
			await queryRunner.manager
				.createQueryBuilder()
				.update(User)
				.set({ subscribeCount: () => '`subscribeCount` - 1' })
				.where('id = :id', { id: reqUser.id })
				.execute();

			await queryRunner.manager
				.createQueryBuilder()
				.update(User)
				.set({ subscriberCount: () => '`subscriberCount` - 1' })
				.where('id = :id', { id: publisherUserId })
				.execute();

			await queryRunner.manager.delete(SubscribeInfo, {
				subscriber: { id: reqUser.id },
				publisher: { id: publisherUserId },
			});

			await queryRunner.commitTransaction();
			return;
		} catch (error) {
			throw error;
		} finally {
			await queryRunner.release();
		}
	}

	async isSubscribed(followerId: number, followingId: number) {
		try {
			const subscribeInfos = await this.subscribeInfoRepository.find({
				where: {
					subscriber: { id: followerId },
					publisher: { id: followingId },
				},
			});
			const subscribeInfo = subscribeInfos[0];

			return !!subscribeInfo;
		} catch (error) {
			throw error;
		}
	}

	async findFollowings(followerId: number) {
		try {
			const subscribeInfos = await this.subscribeInfoRepository.find({
				where: {
					subscriber: { id: followerId },
				},
			});

			return subscribeInfos;
		} catch (error) {
			throw error;
		}
	}

	async findMyFollowings(reqUser: JwtPayload, followerId: number) {
		try {
			if (reqUser.id !== followerId) {
				throw new UnauthorizedException(
					'해당 유저에 대한 구독 정보 조회 권한이 없습니다',
				);
			}

			const subscribeInfos = await this.subscribeInfoRepository.find({
				where: {
					subscriber: { id: followerId },
				},
				relations: ['publisher'],
			});

			// return subscribeInfos;
			return plainToInstance(FollowingRes, subscribeInfos);
		} catch (error) {
			throw error;
		}
	}

	async findNicknameById(id: number) {
		try {
			const users = await this.userRepository.find({
				where: {
					id: id,
				},
			});
			const user = users[0];
			return user.nickname;
		} catch (error) {
			throw error;
		}
	}
}
