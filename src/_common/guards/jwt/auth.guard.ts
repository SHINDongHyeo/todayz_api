import {
	Injectable,
	CanActivate,
	ExecutionContext,
	UnauthorizedException,
	Inject,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(
		@Inject('AccessTokenJwtService')
		private readonly accessTokenJwtService: JwtService,
	) {}

	canActivate(
		context: ExecutionContext,
	): boolean | Promise<boolean> | Observable<boolean> {
		const request = context.switchToHttp().getRequest();

		const authHeader = request.headers.authorization;
		if (!authHeader) {
			throw new UnauthorizedException('인증 헤더가 없습니다');
		}

		const accessToken = authHeader.split(' ')[1];
		if (!accessToken) {
			throw new UnauthorizedException('Bearer token이 없습니다');
		}

		try {
			const decoded = this.accessTokenJwtService.verify(accessToken);
			request.user = decoded;
			return true;
		} catch (error) {
			throw new UnauthorizedException('Bearer token이 유효하지 않습니다');
		}
	}
}
