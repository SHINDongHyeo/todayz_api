import {
	CallHandler,
	ExecutionContext,
	Injectable,
	NestInterceptor,
} from '@nestjs/common';
import moment from 'moment-timezone';
import { Observable, tap } from 'rxjs';
import { CustomLogger } from '../logger/logging.logger';

@Injectable()
export class LoggingInterceptor implements LoggingInterceptor {
	private readonly logger = new CustomLogger();

	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const request = context.switchToHttp().getRequest();
		const { method, url, headers, body, ip } = request;

		const requestLog = {
			method,
			event: 'request',
			url,
			ip,
			headers,
			body,
		};

		this.logger.log(requestLog); // 요청 로그 기록

		return next.handle().pipe(
			tap((response) => {
				const responseLog = {
					method,
					event: 'response',
					url,
					status: context.switchToHttp().getResponse().statusCode,
					response,
				};

				this.logger.log(responseLog); // 응답 로그 기록
			}),
		);
	}
}
