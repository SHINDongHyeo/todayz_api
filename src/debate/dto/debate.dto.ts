import { Transform, Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Category } from 'src/post/entities/category.entity';

export class CreateDebateReq {
	@IsString()
	@IsNotEmpty()
	title: string;

	@IsString()
	@IsNotEmpty()
	content: string;

	@Transform(({ value }) => {
		if (value === '' || value === null || value === undefined) {
			return null;
		}
		return Number(value);
	})
	@IsInt()
	@IsNotEmpty()
	categoryId: number;

	@Transform(({ value }) => {
		if (value === '' || value === null || value === undefined) {
			return null;
		}
		return Number(value);
	})
	@IsInt()
	@IsOptional()
	subcategoryId: number;

	@Transform(({ value }) => {
		if (value === '' || value === null || value === undefined) {
			return null;
		}
		return Number(value);
	})
	@IsInt()
	@IsNotEmpty()
	maxDiscussantCount: number;
}
