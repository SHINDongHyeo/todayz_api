import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';

@Module({
	imports: [
		JwtModule.registerAsync({
			useFactory: async (configService: ConfigService) => ({
				secret: configService.get<string>('REFRESH_TOKEN_JWT_SECRET'),
				signOptions: { expiresIn: '1h' },
			}),
			inject: [ConfigService],
		}),
	],
	providers: [
		{
			provide: 'AccessTokenJwtService',
			useExisting: JwtService,
		},
	],
	exports: ['AccessTokenJwtService'],
})
export class AccessTokenJwtModule {}
