import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';

@Module({
	imports: [
		JwtModule.registerAsync({
			useFactory: async (configService: ConfigService) => ({
				secret: configService.get<string>('REFRESH_TOKEN_JWT_SECRET'),
				signOptions: { expiresIn: '7d' },
			}),
			inject: [ConfigService],
		}),
	],
	providers: [
		{
			provide: 'RefreshTokenJwtService',
			useExisting: JwtService,
		},
	],
	exports: ['RefreshTokenJwtService'],
})
export class RefreshTokenJwtModule {}
