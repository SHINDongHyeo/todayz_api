import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: `.env.${process.env.NODE_ENV}`,
			validationSchema: Joi.object({
				// 애플리케이션 포트
				APP_PORT: Joi.number().default(3000),

				// 데이터베이스
				DB_HOST: Joi.string().required(),
				DB_PORT: Joi.number().default(3306),
				DB_USERNAME: Joi.string().required(),
				DB_PASSWORD: Joi.string().required(),
				DB_DATABASE: Joi.string().required(),
			}),
		}),
	],
})
export class AppConfigModule {}
