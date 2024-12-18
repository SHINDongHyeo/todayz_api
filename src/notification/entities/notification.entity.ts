import { Comment } from 'src/post/entities/comment.entity';
import { Post } from 'src/post/entities/post.entity';
import { User } from 'src/user/entities/user.entity';
import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
	RelationId,
} from 'typeorm';
import { NotificationType } from '../interfaces/notification.interface';

@Entity()
export class Notification {
	@PrimaryGeneratedColumn({ type: 'int' })
	id: number;

	@Column({ type: 'enum', enum: NotificationType })
	type: NotificationType;

	@ManyToOne(() => User, (user) => user.receivedNotifications)
	@JoinColumn({ name: 'receiverId' })
	receiver: User;
	@RelationId((notification: Notification) => notification.receiver)
	receiverId: number;

	@ManyToOne(() => User, (user) => user.sentNotifications)
	@JoinColumn({ name: 'senderId' })
	sender: User;
	@RelationId((notification: Notification) => notification.sender)
	senderId: number;

	@ManyToOne(() => Post, (post) => post.notifications)
	@JoinColumn({ name: 'postId' })
	post: Post;
	@RelationId((notification: Notification) => notification.post)
	postId: number;

	@ManyToOne(() => Comment, (comment) => comment.notifications, {
		nullable: true,
	})
	@JoinColumn({ name: 'commentId' })
	comment: Comment;
	@RelationId((notification: Notification) => notification.comment)
	commentId: number;

	@CreateDateColumn()
	createdAt: Date;

	@Column({ type: 'boolean', default: false })
	isRead: boolean;
}
