import { User } from 'src/user/entities/user.entity';
import {
	CreateDateColumn,
	Entity,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { Post } from './post.entity';

@Entity()
export class SavedPost {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => User, (user) => user.savedPosts, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	user: User;

	@ManyToOne(() => Post, (post) => post.savedPosts, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	post: Post;

	@CreateDateColumn()
	createdAt: Date;
}
