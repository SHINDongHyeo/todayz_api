import { Module } from '@nestjs/common';
import { InquiryService } from './inquiry.service';
import { InquiryController } from './inquiry.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inquiry } from './entities/inquiry.entity';
import { UserModule } from 'src/user/user.module';
import { AccessTokenJwtModule } from 'src/_common/jwt/access_token_jwt.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([Inquiry]),
		UserModule,
		AccessTokenJwtModule,
	],
	controllers: [InquiryController],
	providers: [InquiryService],
})
export class InquiryModule {}
