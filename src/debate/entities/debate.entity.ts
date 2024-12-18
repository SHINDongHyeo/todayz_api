import { IsNotEmpty, IsString } from 'class-validator';
import { Category } from 'src/post/entities/category.entity';
import { Subcategory } from 'src/post/entities/subcategory.entity';
import { PostReport } from 'src/report/entities/postReport.entity';
import { User } from 'src/user/entities/user.entity';
import {
	Column,
	CreateDateColumn,
	Entity,
	JoinTable,
	ManyToMany,
	ManyToOne,
	OneToMany,
	OneToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Debate {
	@PrimaryGeneratedColumn({ type: 'int' })
	id: number;

	@Column({ type: 'varchar', length: 100, collation: 'utf8mb4_general_ci' })
	title: string;

	@Column({ type: 'text', nullable: true, collation: 'utf8mb4_general_ci' })
	content: string;

	@CreateDateColumn({ type: 'timestamp' })
	createdAt: Date;

	@Column({ type: 'int', default: 0 })
	discussantCount: number;

	@Column({ type: 'int', default: 10 })
	maxDiscussantCount: number;

	@ManyToOne(() => Category, (category) => category.posts)
	category: Category;
	@Column()
	categoryId: number;

	@ManyToOne(() => Subcategory, (subcategory) => subcategory.posts)
	subcategory: Subcategory;
	@Column({
		nullable: true,
	})
	subcategoryId: number;
}
