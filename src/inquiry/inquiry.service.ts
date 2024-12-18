import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtPayload } from 'src/auth/interfaces/auth.interface';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { CreateInquiryRes } from './dto/inquiry.dto';
import { Inquiry } from './entities/inquiry.entity';

@Injectable()
export class InquiryService {
	constructor(
		@InjectRepository(Inquiry)
		private readonly inquiryRepository: Repository<Inquiry>,
		private readonly userService: UserService,
	) {}

	async createInquiry(
		reqUser: JwtPayload,
		createInquiryRes: CreateInquiryRes,
	) {
		try {
			const user = await this.userService.findUser(reqUser.id);

			const inquiry = this.inquiryRepository.create({
				...createInquiryRes,
				user,
			});
			return await this.inquiryRepository.save(inquiry);
		} catch (error) {
			console.log(error);
		}
	}

	async getMyInquiries(reqUser: JwtPayload) {
		try {
			await this.userService.updateNotification(reqUser.id, false);
			const inquiries = await this.inquiryRepository.find({
				where: { user: { id: reqUser.id } },
				take: 10,
			});
			return inquiries;
		} catch (error) {
			console.log(error);
		}
	}
}
