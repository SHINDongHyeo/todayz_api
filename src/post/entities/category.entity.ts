import {
	Column,
	Entity,
	OneToMany,
	PrimaryColumn,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { Post } from './post.entity';
import { Subcategory } from './subcategory.entity';

@Entity()
export class Category {
	@PrimaryColumn({ type: 'int' })
	id: number;

	@Column({ type: 'varchar', length: 50 })
	name: string;

	@OneToMany(() => Subcategory, (subcategory) => subcategory.category)
	subcategories: Subcategory[];

	@OneToMany(() => Post, (post) => post.subcategory)
	posts: Post[];
}
