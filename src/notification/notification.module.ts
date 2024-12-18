import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { AccessTokenJwtModule } from 'src/_common/jwt/access_token_jwt.module';
import { UserModule } from 'src/user/user.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([Notification]),
		AccessTokenJwtModule,
		UserModule,
	],
	controllers: [NotificationController],
	providers: [NotificationService],
	exports: [NotificationService],
})
export class NotificationModule {}
