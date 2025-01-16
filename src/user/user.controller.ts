import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	ParseIntPipe,
	UseGuards,
	Req,
	UseInterceptors,
	UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { plainToInstance } from 'class-transformer';
import { AuthGuard } from 'src/_common/guards/jwt/auth.guard';

import {
	CreateUserReq,
	FindUserMinRes,
	FindUserRes,
	UpdateUserReq,
} from './dto/user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@UseGuards(AuthGuard)
	@Post()
	async createUser(@Body() createUserReq: CreateUserReq) {
		const { socialId, socialProvider, email, nickname } = createUserReq;
		return await this.userService.createUser(
			socialId,
			socialProvider,
			email,
			nickname,
		);
	}

	@UseGuards(AuthGuard)
	@Get('notification/:id/check')
	async isThereUnreadNotification(
		@Req() req: any,
		@Param('id', ParseIntPipe) id: number,
	) {
		return await this.userService.isThereUnreadNotification(req.user);
	}

	@UseGuards(AuthGuard)
	@Post('subscribe/:id')
	async subscribe(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
		return await this.userService.subscribe(req.user, id);
	}

	@UseGuards(AuthGuard)
	@Delete('unsubscribe/:id')
	async unsubscribe(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
		return await this.userService.unsubscribe(req.user, id);
	}
	@UseGuards(AuthGuard)
	@Get(':id/followings')
	async findMyFollowings(
		@Req() req: any,
		@Param('id', ParseIntPipe) id: number,
	) {
		return await this.userService.findMyFollowings(req.user, id);
	}

	// @UseGuards(AuthGuard)
	@Get(':id')
	async findUser(
		@Req() req: any,
		@Param('id', ParseIntPipe) id: number,
	): Promise<FindUserRes> {
		const user = await this.userService.findUser(id);

		if (req.user?.id === user.id) {
			return plainToInstance(FindUserRes, { ...user });
		} else {
			const isSubscribed = await this.userService.isSubscribed(
				req.id,
				id,
			);
			return plainToInstance(FindUserMinRes, { ...user, isSubscribed });
		}
	}

	@UseGuards(AuthGuard)
	@Patch(':id')
	@UseInterceptors(FileInterceptor('file'))
	async updateUser(
		@Param('id', ParseIntPipe) id: number,
		@Body() updateUserReq: UpdateUserReq,
		@UploadedFile() file: Express.Multer.File,
	): Promise<FindUserRes> {
		return this.userService.updateUser(id, updateUserReq, file);
	}

	@UseGuards(AuthGuard)
	@Delete(':id')
	async deleteUser(@Param('id', ParseIntPipe) id: number) {
		return this.userService.deleteUser(id);
	}
}
