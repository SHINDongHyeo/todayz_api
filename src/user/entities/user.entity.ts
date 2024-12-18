import { Comment } from 'src/post/entities/comment.entity';
import { DraftPost } from 'src/post/entities/draftPost.entity';
import { Inquiry } from 'src/inquiry/entities/inquiry.entity';
import { LikeComment } from 'src/post/entities/likeComment.entity';
import { LikePost } from 'src/post/entities/likePost.entity';
import { Post } from 'src/post/entities/post.entity';
import { SavedPost } from 'src/post/entities/savedPost.entity';
import {
	Column,
	CreateDateColumn,
	Entity,
	OneToMany,
	PrimaryColumn,
	PrimaryGeneratedColumn,
} from 'typeorm';
import {
	UserRank,
	UserRole,
	UserSocialProvider,
} from '../interfaces/user.interface';
import { PostReport } from 'src/report/entities/postReport.entity';
import { CommentReport } from 'src/report/entities/commentReport.entity';
import { SubscribeInfo } from './subscribeInfo.entity';
import { Notification } from 'src/notification/entities/notification.entity';

@Entity()
export class User {
	@PrimaryGeneratedColumn({ type: 'int' })
	id: number;

	@Column({ type: 'varchar', length: 100 })
	socialId: string;

	@Column({ type: 'enum', enum: UserSocialProvider })
	socialProvider: UserSocialProvider;

	@Column({ type: 'varchar', length: 100 })
	email: string;

	@Column({ type: 'varchar', length: 50, unique: true })
	nickname: string;

	@Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
	role: UserRole;

	@Column({ type: 'enum', enum: UserRank, nullable: true })
	rank: UserRank;

	@Column({ type: 'smallint', default: 0 })
	rankPoint: number;

	@Column({ type: 'varchar', length: 200, nullable: true })
	profileImageUrl: string;

	@Column({ type: 'tinytext', nullable: true })
	introduction: string;

	@Column({ type: 'smallint', default: 0 })
	subscriberCount: number;

	@Column({ type: 'smallint', default: 0 })
	subscribeCount: number;

	@Column({ type: 'smallint', default: 0 })
	postCount: number;

	@Column({ type: 'smallint', default: 0 })
	commentCount: number;

	@Column({ type: 'smallint', default: 0 })
	debateCount: number;

	@CreateDateColumn({ type: 'timestamp' })
	createdAt: Date;

	@OneToMany(() => Post, (post) => post.user)
	posts: Post[];

	@OneToMany(() => DraftPost, (drafPost) => drafPost.user)
	draftPosts: DraftPost[];

	@OneToMany(() => Comment, (comment) => comment.user)
	comments: Comment[];

	@OneToMany(() => Comment, (comment) => comment.mentionUser)
	mentionedComments: Comment[];

	@OneToMany(() => LikeComment, (likeComment) => likeComment.user)
	likeComments: LikeComment[];

	@OneToMany(() => LikePost, (likePost) => likePost.user)
	likePosts: LikePost[];

	@OneToMany(() => SavedPost, (savedPost) => savedPost.user)
	savedPosts: SavedPost[];

	@OneToMany(() => Inquiry, (inquiry) => inquiry.user)
	inquiries: Inquiry[];

	@OneToMany(() => PostReport, (postReport) => postReport.user)
	postReports: PostReport[];

	@OneToMany(() => CommentReport, (commentReport) => commentReport.user)
	commentReports: CommentReport[];

	@OneToMany(() => SubscribeInfo, (subscribeInfo) => subscribeInfo.subscriber)
	followings: SubscribeInfo[];

	@OneToMany(() => SubscribeInfo, (subscribeInfo) => subscribeInfo.publisher)
	followers: SubscribeInfo[];

	@OneToMany(() => Notification, (notification) => notification.receiver)
	receivedNotifications: Notification[];

	@OneToMany(() => Notification, (notification) => notification.sender)
	sentNotifications: Notification[];

	@Column({ type: 'boolean', default: false })
	isUnreadNotification: boolean;
}
