import { HttpException, HttpStatus } from '@nestjs/common';

export class TooManyDebates extends HttpException {
	constructor() {
		super('더 이상 토론방을 추가할 수 없습니다', HttpStatus.BAD_REQUEST);
	}
}
