import { User } from 'src/user/entities/user.entity';
import {
	Column,
	CreateDateColumn,
	Entity,
	JoinTable,
	ManyToMany,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { Category } from './category.entity';
import { Comment } from './comment.entity';
import { Subcategory } from './subcategory.entity';
import { Tag } from './tag.entity';

@Entity()
export class DraftPost {
	@PrimaryGeneratedColumn({ type: 'int' })
	id: number;

	@Column({ type: 'varchar', length: 100, nullable: true })
	title: string;

	@Column({ type: 'text', nullable: true })
	content: string;

	@CreateDateColumn({ type: 'timestamp' })
	createdAt: Date;

	@ManyToOne(() => User, (user) => user.posts, { eager: true })
	user: User;

	@ManyToOne(() => Category, (category) => category.posts)
	category: Category;

	@ManyToOne(() => Subcategory, (subcategory) => subcategory.posts)
	subcategory: Subcategory;

	@ManyToMany(() => Tag, (tag) => tag.posts)
	@JoinTable()
	tags: Tag[];
}
