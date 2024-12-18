import { User } from 'src/user/entities/user.entity';
import { UserRole } from 'src/user/interfaces/user.interface';
import {
	Column,
	CreateDateColumn,
	Entity,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { InquiryType } from '../interfaces/inquiry.interface';
import { Post } from '../../post/entities/post.entity';
import { Subcategory } from '../../post/entities/subcategory.entity';

@Entity()
export class Inquiry {
	@PrimaryGeneratedColumn({ type: 'int' })
	id: number;

	@Column({ type: 'enum', enum: InquiryType, default: InquiryType.BUG })
	inquiryType: InquiryType;

	@Column({ type: 'varchar', length: 100, collation: 'utf8mb4_general_ci' })
	title: string;

	@Column({ type: 'text', nullable: true, collation: 'utf8mb4_general_ci' })
	content: string;

	@Column({ type: 'boolean', default: false })
	isReplied: boolean;

	@Column({ type: 'text', nullable: true, collation: 'utf8mb4_general_ci' })
	replyContent: string;

	@CreateDateColumn({ type: 'timestamp' })
	createdAt: Date;

	@ManyToOne(() => User, (user) => user.inquiries)
	user: User;
}
