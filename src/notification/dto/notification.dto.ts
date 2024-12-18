import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsString } from 'class-validator';
import { FindUserMinRes } from 'src/user/dto/user.dto';
import { NotificationType } from '../interfaces/notification.interface';

export class NotificationDto {}

export class FindNotification {
	@IsInt()
	@IsNotEmpty()
	id: number;

	@IsEnum(NotificationType)
	type: NotificationType;

	@Type(() => FindUserMinRes)
	receiver: FindUserMinRes;

	@Type(() => FindUserMinRes)
	sender: FindUserMinRes;

	@IsInt()
	@IsNotEmpty()
	postId: number;

	@IsInt()
	@IsNotEmpty()
	commenttId: number;
}
