import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	Req,
	UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationDto } from './dto/notification.dto';
import { AuthGuard } from 'src/_common/guards/jwt/auth.guard';

@Controller('notification')
export class NotificationController {
	constructor(private readonly notificationService: NotificationService) {}

	@UseGuards(AuthGuard)
	@Get()
	getMyNotifications(@Req() req: any) {
		return this.notificationService.getMyNotifications(req.user);
	}
}
