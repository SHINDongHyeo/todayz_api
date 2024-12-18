import { User } from 'src/user/entities/user.entity';
import {
	Column,
	CreateDateColumn,
	Entity,
	ManyToOne,
	PrimaryGeneratedColumn,
	Unique,
} from 'typeorm';
import { Post } from '../../post/entities/post.entity';
import { PostReportType } from '../inferfaces/report.interface';

@Entity()
@Unique(['post', 'user'])
export class PostReport {
	@PrimaryGeneratedColumn({ type: 'int' })
	id: number;

	@Column({ type: 'varchar', length: 50 })
	type: PostReportType;

	@Column({ type: 'text', collation: 'utf8mb4_general_ci' })
	detail: string;

	@CreateDateColumn({ type: 'timestamp' })
	createdAt: Date;

	@ManyToOne(() => Post, (post) => post.postReports)
	post: Post;

	@ManyToOne(() => User, (user) => user.postReports)
	user: User;
}
