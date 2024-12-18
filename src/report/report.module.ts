import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostReport } from './entities/postReport.entity';
import { UserModule } from 'src/user/user.module';
import { AccessTokenJwtModule } from 'src/_common/jwt/access_token_jwt.module';
import { PostModule } from 'src/post/post.module';
import { CommentReport } from './entities/commentReport.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([PostReport, CommentReport]),
		UserModule,
		PostModule,
		AccessTokenJwtModule,
	],
	controllers: [ReportController],
	providers: [ReportService],
})
export class ReportModule {}
