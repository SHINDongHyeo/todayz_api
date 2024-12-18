import { Transform, Type } from 'class-transformer';
import {
	IsEnum,
	IsInt,
	IsNotEmpty,
	IsOptional,
	IsString,
} from 'class-validator';
import { InquiryType } from '../interfaces/inquiry.interface';

export class CreateInquiryRes {
	@IsEnum(InquiryType)
	@IsNotEmpty()
	inquiryType: InquiryType;

	@IsString()
	@IsNotEmpty()
	title: string;

	@IsString()
	@IsNotEmpty()
	content: string;
}
