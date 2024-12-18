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
import { AuthGuard } from 'src/_common/guards/jwt/auth.guard';
import { CreateInquiryRes } from './dto/inquiry.dto';
import { InquiryService } from './inquiry.service';

@Controller('inquiry')
export class InquiryController {
	constructor(private readonly inquiryService: InquiryService) {}

	@UseGuards(AuthGuard)
	@Post()
	createInquiry(@Req() req: any, @Body() createInquiryRes: CreateInquiryRes) {
		return this.inquiryService.createInquiry(req.user, createInquiryRes);
	}

	@UseGuards(AuthGuard)
	@Get()
	getMyInquiries(@Req() req: any) {
		return this.inquiryService.getMyInquiries(req.user);
	}
}
