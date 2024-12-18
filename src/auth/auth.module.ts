import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { AccessTokenJwtModule } from 'src/_common/jwt/access_token_jwt.module';
import { RefreshTokenJwtModule } from 'src/_common/jwt/refresh_token_jwt.module';

@Module({
	imports: [AccessTokenJwtModule, RefreshTokenJwtModule, UserModule],
	controllers: [AuthController],
	providers: [AuthService],
})
export class AuthModule {}
