import { LoggerService } from '@nestjs/common';
import * as fs from 'fs';
import moment from 'moment-timezone';
import * as path from 'path';

export class CustomLogger implements LoggerService {
	constructor() {
		moment.tz.setDefault('Asia/Seoul');
	}
	private getLogFilePath(): string {
		const logDir = path.join(__dirname, '../../../logs/api');
		if (!fs.existsSync(logDir)) {
			fs.mkdirSync(logDir, { recursive: true }); // logs 폴더 없으면 생성
		}
		const currentDate = moment().format('YYYY-MM-DD');
		return path.join(logDir, `${currentDate}.log`);
	}

	private writeLog(logObject: Record<string, any>) {
		const logFilePath = this.getLogFilePath();
		const logJson = JSON.stringify(logObject) + '\n'; // JSON 형태로 변환
		fs.appendFileSync(logFilePath, logJson, 'utf8'); // 파일에 추가
	}

	log(message: Record<string, any>) {
		this.writeLog({
			level: 'log',
			timestamp: moment().format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
			...message,
		});
	}

	error(message: Record<string, any>, trace?: string) {
		this.writeLog({
			level: 'error',
			timestamp: moment().format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
			trace,
			...message,
		});
	}

	warn(message: Record<string, any>) {
		this.writeLog({
			level: 'warn',
			timestamp: moment().format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
			...message,
		});
	}

	debug(message: Record<string, any>) {
		this.writeLog({
			level: 'debug',
			timestamp: moment().format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
			...message,
		});
	}

	verbose(message: Record<string, any>) {
		this.writeLog({
			level: 'verbose',
			timestamp: moment().format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
			...message,
		});
	}
}
