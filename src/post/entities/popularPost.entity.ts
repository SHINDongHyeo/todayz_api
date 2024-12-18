import { Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { Post } from './post.entity';

@Entity()
export class PopularPost {
	@PrimaryColumn({ type: 'int' })
	id: number;

	@OneToOne(() => Post, (post) => post.popularPost, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	@JoinColumn()
	post: Post;
}
