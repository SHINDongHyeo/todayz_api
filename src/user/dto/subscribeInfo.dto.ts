import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UserWithImageRes } from './user.dto';

export class FollowingRes {
	@IsInt()
	@IsNotEmpty()
	id: number;

	@IsString()
	@IsNotEmpty()
	notificationEnabled: string;

	@Type(() => UserWithImageRes)
	publisher: UserWithImageRes;
}
