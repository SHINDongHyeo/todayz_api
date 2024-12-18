import {
	Column,
	Entity,
	JoinColumn,
	ManyToMany,
	ManyToOne,
	OneToMany,
	PrimaryColumn,
	PrimaryGeneratedColumn,
	RelationId,
} from 'typeorm';
import { Category } from './category.entity';
import { Post } from './post.entity';

@Entity()
export class Subcategory {
	@PrimaryColumn({ type: 'int' })
	id: number;

	@Column({ type: 'varchar', length: 50 })
	name: string;

	@ManyToOne(() => Category, (category) => category.subcategories)
	@JoinColumn({ name: 'categoryId' })
	category: Category;
	@RelationId((subcategory: Subcategory) => subcategory.category)
	categoryId: number;

	@OneToMany(() => Post, (post) => post.subcategory)
	posts: Post[];
}
