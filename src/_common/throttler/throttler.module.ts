import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

@Module({
	imports: [
		ThrottlerModule.forRoot({
			throttlers: [
				{
					limit: 10,
					ttl: 10000,
				},
			],
		}),
	],
	providers: [
		{
			provide: APP_GUARD,
			useClass: ThrottlerGuard,
		},
	],
})
export class AppThrottlerModule {}
