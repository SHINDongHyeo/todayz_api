import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { JwtPayload } from 'src/auth/interfaces/auth.interface';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { FindNotification } from './dto/notification.dto';
import { Notification } from './entities/notification.entity';
import { NotificationType } from './interfaces/notification.interface';

@Injectable()
export class NotificationService {
	constructor(
		@InjectRepository(Notification)
		private readonly notificationRepository: Repository<Notification>,
		private readonly userService: UserService,
	) {}

	async createNotification(
		type: NotificationType,
		receiverId: number,
		senderId: number,
		postId: number,
		commentId: number,
	) {
		try {
			// 자신의 게시물 혹은 댓글을 조작할 경우는 알림 남기지 않습니다
			if (receiverId === senderId) {
				return;
			}
			await this.userService.updateNotification(receiverId, true);

			await this.notificationRepository.save({
				type: type,
				receiver: { id: receiverId }, // 관계 엔티티를 사용
				sender: { id: senderId }, // 관계 엔티티를 사용
				post: postId ? { id: postId } : null, // 존재하면 할당
				comment: commentId ? { id: commentId } : null, // 존재하면 할당
			});
		} catch (error) {
			throw error;
		}
	}

	async getMyNotifications(reqUser: JwtPayload) {
		try {
			await this.userService.updateNotification(reqUser.id, false);
			const notifications = await this.notificationRepository.find({
				where: {
					receiver: { id: reqUser.id },
				},
				order: {
					createdAt: 'DESC',
				},
				relations: ['receiver', 'sender'],
			});

			await this.notificationRepository.update(
				{ receiver: { id: reqUser.id }, isRead: false },
				{ isRead: true },
			);

			const notificationsResult = plainToInstance(
				FindNotification,
				notifications,
			);
			return notificationsResult;
		} catch (error) {
			throw error;
		}
	}
}
