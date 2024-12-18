import { Module, OnModuleInit } from '@nestjs/common';

import { AppConfigModule } from './_common/config/config.module';
import { DatabaseModule } from './_common/database/database.module';

import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PostModule } from './post/post.module';
import { DebateModule } from './debate/debate.module';
import { SearchModule } from './search/search.module';
import { InquiryModule } from './inquiry/inquiry.module';
import { ReportModule } from './report/report.module';
import { DebateChatGateway } from './_common/gateway/debate-chat/debate-chat.gateway';
import { NotificationModule } from './notification/notification.module';
import { InitSeed } from './_common/database/init-seed';

@Module({
	imports: [
		// 설정
		AppConfigModule,
		DatabaseModule,
		// 도메인
		AuthModule,
		UserModule,
		PostModule,
		DebateModule,
		SearchModule,
		InquiryModule,
		ReportModule,
		NotificationModule,
	],
})
export class AppModule implements OnModuleInit {
	constructor(private readonly initSeed: InitSeed) {}

	async onModuleInit() {
		await this.initSeed.seed();
	}
}
