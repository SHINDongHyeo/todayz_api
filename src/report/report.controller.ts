import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { CreateInquiryRes } from 'src/inquiry/dto/inquiry.dto';
import { AuthGuard } from 'src/_common/guards/jwt/auth.guard';
import { CreateCommentReportRes, CreatePostReportRes } from './dto/report.dto';
import { ReportService } from './report.service';

@Controller('report')
export class ReportController {
	constructor(private readonly reportService: ReportService) {}

	@UseGuards(AuthGuard)
	@Post('post')
	createPostReport(
		@Req() req: any,
		@Body() createPostReportRes: CreatePostReportRes,
	) {
		return this.reportService.createPostReport(
			req.user,
			createPostReportRes,
		);
	}

	@UseGuards(AuthGuard)
	@Post('comment')
	createCommentReport(
		@Req() req: any,
		@Body() createCommentReportRes: CreateCommentReportRes,
	) {
		return this.reportService.createCommentReport(
			req.user,
			createCommentReportRes,
		);
	}
}
