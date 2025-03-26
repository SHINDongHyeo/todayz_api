import {
	Injectable,
	CanActivate,
	ExecutionContext,
	UnauthorizedException,
	Inject,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class OptionalAuthGuard implements CanActivate {
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
			// 인증 정보가 없으면 그대로 통과 (비로그인 허용)
			return true;
		}

		const accessToken = authHeader.split(' ')[1];
		if (!accessToken) {
			throw new UnauthorizedException('Bearer token이 없습니다');
		}

		try {
			const decoded = this.accessTokenJwtService.verify(accessToken);
			request.user = decoded; // 인증된 경우 req.user에 저장
		} catch (error) {
			throw new UnauthorizedException('Bearer token이 유효하지 않습니다');
		}

		return true;
	}
}
