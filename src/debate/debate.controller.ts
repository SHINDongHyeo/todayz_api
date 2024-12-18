import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	Query,
	ParseIntPipe,
	UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/_common/guards/jwt/auth.guard';
import { DebateService } from './debate.service';
import { CreateDebateReq } from './dto/debate.dto';

@Controller('debate')
export class DebateController {
	constructor(private readonly debateService: DebateService) {}

	@UseGuards(AuthGuard)
	@Post()
	async createDebate(@Body() createDebateReq: CreateDebateReq) {
		return this.debateService.createDebate(createDebateReq);
	}

	@UseGuards(AuthGuard)
	@Get()
	async findDebates() {
		return this.debateService.findDebates();
	}
}
