import { Transform } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

export class TagDto {
	@Transform(({ value }) => parseInt(value, 10))
	@IsNumber()
	id: number;

	@IsString()
	name: string;
}
