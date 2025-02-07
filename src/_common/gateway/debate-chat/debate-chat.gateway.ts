import {
	WebSocketGateway,
	SubscribeMessage,
	MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	WebSocketServer,
	OnGatewayInit,
	ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DebateService } from 'src/debate/debate.service';
import { TooManyDiscussorException } from 'src/debate/exceptions/TooManyDiscussor.exception';
import { UserService } from 'src/user/user.service';
import { WebsocketLogger } from 'src/_common/logger/websocket.logger';

@WebSocketGateway({
	cors: {
		origin: '*',
	},
	path: '/socket.io',
})
export class DebateChatGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	private readonly logger = new WebsocketLogger();

	@WebSocketServer()
	server: Server;

	constructor(
		private readonly debateService: DebateService,
		private readonly userService: UserService,
	) {}

	private clientUserMap = new Map<
		string,
		{ userId: number; userNickname: string }
	>();

	afterInit(server: Server) {
		this.logger.log({
			level: 'info',
			type: 'init',
		});
	}

	handleConnection(client: Socket) {
		this.logger.log({
			level: 'info',
			type: 'connect',
			clientId: client.id,
		});
	}

	handleDisconnect(client: Socket) {
		client.rooms.forEach((roomId) => {
			client.leave(roomId);
		});
		this.logger.log({
			level: 'info',
			type: 'disconnect',
			clientId: client.id,
		});
	}

	@SubscribeMessage('join')
	async handleJoin(
		@MessageBody()
		payload: { userId: number; roomId: string },
		@ConnectedSocket() client: Socket,
	) {
		try {
			const { userId, roomId } = payload;

			client.join(roomId);

			const userNickname =
				await this.userService.findNicknameById(userId);

			this.clientUserMap.set(client.id, { userId, userNickname });

			const users = Array.from(
				this.server.sockets.adapter.rooms.get(roomId) || [],
			);
			const userCount = users.length;
			await this.debateService.updateDiscussantCount(
				Number(roomId),
				userCount,
			);

			const usersInfo = users.map((socketId) =>
				this.clientUserMap.get(socketId),
			);

			this.server.to(roomId).emit('users', {
				userId,
				userNickname,
				type: 'join',
				joiningUsers: usersInfo,
			});

			this.logger.log({
				level: 'info',
				type: 'join',
				clientId: client.id,
				userId: userId,
				roomId: roomId,
			});
		} catch (error) {
			if (error instanceof TooManyDiscussorException) {
				client.emit('error', error.message);
			} else {
				client.emit('error', 'Failed to join room. Please try again.');
			}
		}
	}

	@SubscribeMessage('leave')
	async handleLeave(
		@MessageBody()
		payload: { userId: number; roomId: string },
		@ConnectedSocket() client: Socket,
	) {
		try {
			const { userId, roomId } = payload;

			client.leave(roomId);

			const userNickname = this.clientUserMap.get(client.id).userNickname;

			const users = Array.from(
				this.server.sockets.adapter.rooms.get(roomId) || [],
			);
			const userCount = users.length;
			await this.debateService.updateDiscussantCount(
				Number(roomId),
				userCount - 1,
			);

			const usersInRoom = Array.from(
				this.server.sockets.adapter.rooms.get(roomId) || [],
			);
			const usersInfo = usersInRoom.map((socketId) =>
				this.clientUserMap.get(socketId),
			);
			this.server.to(roomId).emit('users', {
				userId,
				userNickname,
				type: 'leave',
				joiningUsers: usersInfo,
			});

			this.logger.log({
				level: 'info',
				type: 'leave',
				clientId: client.id,
				userId: userId,
				roomId: roomId,
			});
		} catch (error) {
			client.emit('error', 'Failed to leave room. Please try again.');
		}
	}

	@SubscribeMessage('message')
	handleMessage(
		@MessageBody()
		payload: {
			userId: number;
			roomId: string;
			message: string;
		},
		@ConnectedSocket() client: Socket,
	) {
		const { userId, roomId, message } = payload;

		const userNickname = this.clientUserMap.get(client.id).userNickname;

		this.server
			.to(roomId)
			.emit('message', { userId, userNickname, message, type: 'msg' });

		this.logger.log({
			level: 'info',
			type: 'message',
			userId: userId,
			content: { message: message },
			roomId: roomId,
		});
	}
}
