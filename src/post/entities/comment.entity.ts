import { Notification } from 'src/notification/entities/notification.entity';
import { CommentReport } from 'src/report/entities/commentReport.entity';
import { User } from 'src/user/entities/user.entity';
import {
	Column,
	CreateDateColumn,
	DeleteDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
	RelationId,
} from 'typeorm';
import { LikeComment } from './likeComment.entity';
import { Post } from './post.entity';

@Entity()
export class Comment {
	@PrimaryGeneratedColumn({ type: 'int' })
	id: number;

	@Column({ type: 'int', nullable: true })
	parentId: number;

	@Column({ type: 'text' })
	content: string;

	@Column({ type: 'int', default: 0 })
	likedCount: number;

	@CreateDateColumn({ type: 'timestamp' })
	createdAt: Date;

	@DeleteDateColumn({ type: 'timestamp', nullable: true })
	deletedAt: Date;

	@ManyToOne(() => Post, (post) => post.comments, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	post: Post;
	@Column()
	postId: number;

	@ManyToOne(() => User, (user) => user.comments, {
		nullable: true,
		onDelete: 'SET NULL', // 사용자가 악의적 댓글 작성 후 탈퇴해 발뺌하는 경우 방지
		onUpdate: 'CASCADE',
	})
	@JoinColumn({ name: 'userId' })
	user: User;
	@RelationId((comment: Comment) => comment.user)
	userId: number;

	@ManyToOne(() => User, (user) => user.mentionedComments, {
		nullable: true,
		onDelete: 'SET NULL', // 사용자가 악의적 댓글 작성 후 탈퇴해 발뺌하는 경우 방지
		onUpdate: 'CASCADE',
	})
	mentionUser: User;

	@OneToMany(() => LikeComment, (likeComment) => likeComment.comment)
	likeComments: LikeComment[];

	@OneToMany(() => CommentReport, (commentReport) => commentReport.comment)
	commentReports: CommentReport[];

	@OneToMany(() => Notification, (notification) => notification.comment)
	notifications: Notification[];
}
