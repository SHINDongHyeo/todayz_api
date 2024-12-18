import { Comment } from 'src/post/entities/comment.entity';
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
import {
	CommentReportType,
	PostReportType,
} from '../inferfaces/report.interface';

@Entity()
@Unique(['comment', 'user'])
export class CommentReport {
	@PrimaryGeneratedColumn({ type: 'int' })
	id: number;

	@Column({ type: 'varchar', length: 50 })
	type: CommentReportType;

	@Column({ type: 'text', collation: 'utf8mb4_general_ci' })
	detail: string;

	@CreateDateColumn({ type: 'timestamp' })
	createdAt: Date;

	@ManyToOne(() => Comment, (comment) => comment.commentReports, {
		nullable: false,
	})
	comment: Comment;

	@ManyToOne(() => User, (user) => user.commentReports, { nullable: false })
	user: User;
}
