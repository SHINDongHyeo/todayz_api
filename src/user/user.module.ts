import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AccessTokenJwtModule } from 'src/_common/jwt/access_token_jwt.module';
import { SubscribeInfo } from './entities/subscribeInfo.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([User, SubscribeInfo]),
		AccessTokenJwtModule,
	],
	controllers: [UserController],
	providers: [UserService],
	exports: [UserService],
})
export class UserModule {}
