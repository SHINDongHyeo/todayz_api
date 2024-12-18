import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import LoggingInterceptor from './_common/interceptor/logging.interceptor';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const configService = app.get(ConfigService);
	const appPort = configService.get<number>('APP_PORT');

	// Log Interceptor
	app.useGlobalInterceptors(new LoggingInterceptor());

	// DTO validation Pipe
	app.useGlobalPipes(
		new ValidationPipe({
			transform: true,
			whitelist: true,
			forbidNonWhitelisted: true,
		}),
	);

	// CORS
	app.enableCors({
		origin: 'http://localhost:2999',
		methods: 'GET, POST, PUT, PATCH, DELETE',
		allowedHeaders: 'Content-Type, Authorization',
		credentials: true,
	});
	await app.listen(appPort);
}
bootstrap();
