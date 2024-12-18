import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from 'src/post/entities/post.entity';
import { Comment } from 'src/post/entities/comment.entity';
import { User } from 'src/user/entities/user.entity';
import { Category } from 'src/post/entities/category.entity';
import { Subcategory } from 'src/post/entities/subcategory.entity';
import { Tag } from 'src/post/entities/tag.entity';
import { DraftPost } from 'src/post/entities/draftPost.entity';
import { LikeComment } from 'src/post/entities/likeComment.entity';
import { LikePost } from 'src/post/entities/likePost.entity';
import { PopularPost } from 'src/post/entities/popularPost.entity';
import { SavedPost } from 'src/post/entities/savedPost.entity';
import { Inquiry } from 'src/inquiry/entities/inquiry.entity';
import { PostReport } from 'src/report/entities/postReport.entity';
import { CommentReport } from 'src/report/entities/commentReport.entity';
import { SubscribeInfo } from 'src/user/entities/subscribeInfo.entity';
import { Debate } from 'src/debate/entities/debate.entity';
import { Notification } from 'src/notification/entities/notification.entity';
import { InitSeed } from './init-seed';

@Module({
	imports: [
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: async (configService: ConfigService) => ({
				type: 'mysql',
				host: configService.get<string>('DB_HOST'),
				port: configService.get<number>('DB_PORT'),
				username: configService.get<string>('DB_USERNAME'),
				password: configService.get<string>('DB_PASSWORD'),
				database: configService.get<string>('DB_DATABASE'),
				logging: true,
				entities: [
					User,
					Post,
					Comment,
					Category,
					Subcategory,
					Tag,
					DraftPost,
					LikeComment,
					LikePost,
					PopularPost,
					SavedPost,
					Inquiry,
					PostReport,
					CommentReport,
					SubscribeInfo,
					Debate,
					Notification,
				],
				synchronize:
					configService.get<string>('NODE_ENV') === 'development',
			}),
		}),
	],
	providers: [InitSeed],
	exports: [InitSeed],
})
export class DatabaseModule {}
