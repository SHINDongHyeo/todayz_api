import { User } from 'src/user/entities/user.entity';
import {
	CreateDateColumn,
	Entity,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { Comment } from './comment.entity';

@Entity()
export class LikeComment {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => User, (user) => user.likeComments, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	user: User;

	@ManyToOne(() => Comment, (comment) => comment.likeComments, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	comment: Comment;

	@CreateDateColumn()
	createdAt: Date;
}
