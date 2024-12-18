import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Comment } from './entities/comment.entity';
import { Category } from './entities/category.entity';
import { Subcategory } from './entities/subcategory.entity';
import { Tag } from './entities/tag.entity';
import { DraftPost } from './entities/draftPost.entity';
import { UserModule } from 'src/user/user.module';
import { AccessTokenJwtModule } from 'src/_common/jwt/access_token_jwt.module';
import { LikeComment } from './entities/likeComment.entity';
import { LikePost } from './entities/likePost.entity';
import { PopularPost } from './entities/popularPost.entity';
import { SavedPost } from './entities/savedPost.entity';
import { Inquiry } from '../inquiry/entities/inquiry.entity';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([
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
		]),
		AccessTokenJwtModule,
		UserModule,
		NotificationModule,
	],
	controllers: [PostController],
	providers: [PostService],
	exports: [PostService],
})
export class PostModule {}
