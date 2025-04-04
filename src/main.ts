import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './_common/interceptor/logging.interceptor';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const configService = app.get(ConfigService);
	// const appPort = configService.get<number>('APP_PORT');
	const appPort = 3000;

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
		origin: configService.get<string>('FRONT_BASE_URL'),
		methods: 'GET, POST, PUT, PATCH, DELETE',
		allowedHeaders: 'Content-Type, Authorization',
		credentials: true,
	});

	// Referer
	// app.use((req, res, next) => {
	// 	const referer = req.headers['referer'];

	// 	if (
	// 		!referer ||
	// 		!referer.startsWith(configService.get<string>('FRONT_BASE_URL'))
	// 	) {
	// 		return res
	// 			.status(403)
	// 			.json({ message: 'Forbidden: Invalid Referer' });
	// 	}

	// 	next();
	// });

	// 웹 소켓
	app.useWebSocketAdapter(new IoAdapter(app));

	await app.listen(appPort);
}
bootstrap();
