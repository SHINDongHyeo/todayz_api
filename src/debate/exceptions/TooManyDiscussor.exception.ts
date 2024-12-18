import { HttpException, HttpStatus } from '@nestjs/common';

export class TooManyDiscussorException extends HttpException {
	constructor() {
		super('방에 인원이 꽉 찼습니다', HttpStatus.BAD_REQUEST);
	}
}
