import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CategoryRes {
	@IsInt()
	@IsNotEmpty()
	id: number;

	@IsString()
	@IsNotEmpty()
	name: string;
}

export class SubcategoryRes {
	@IsInt()
	@IsNotEmpty()
	id: number;

	@IsString()
	@IsNotEmpty()
	name: string;
}
