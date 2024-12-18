import { User } from 'src/user/entities/user.entity';
import {
	CreateDateColumn,
	Entity,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { Post } from './post.entity';

@Entity()
export class LikePost {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => User, (user) => user.likePosts, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	user: User;

	@ManyToOne(() => Post, (post) => post.likePosts, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	post: Post;

	@CreateDateColumn()
	createdAt: Date;
}
