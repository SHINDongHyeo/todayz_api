import {
	Column,
	Entity,
	Index,
	ManyToMany,
	OneToMany,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { Post } from './post.entity';
import { Subcategory } from './subcategory.entity';

@Entity()
@Index('tag_fulltext', ['name'], { fulltext: true })
export class Tag {
	@PrimaryGeneratedColumn({ type: 'int' })
	id: number;

	@Column({
		type: 'varchar',
		length: 50,
		unique: true,
		collation: 'utf8mb4_general_ci',
	})
	name: string;

	@ManyToMany(() => Post, (post) => post.tags)
	posts: Post[];
}
