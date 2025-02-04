import { createLogger, format, transports } from 'winston';
import moment from 'moment-timezone';
import DailyRotateFile from 'winston-daily-rotate-file';

const customFormat = format.printf(({ message, timestamp }) => {
	const msg = typeof message === 'object' ? message : { message };
	return JSON.stringify(
		{
			timestamp,
			...msg,
		},
		null,
		2,
	);
});

const logger = createLogger({
	format: format.combine(
		format.timestamp({
			format: () =>
				moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss'),
		}),
		customFormat,
	),
	transports: [
		new transports.Console(),
		new DailyRotateFile({
			filename: './logs/websocket/%DATE%.log',
			datePattern: 'YYYY-MM-DD',
			zippedArchive: true,
			maxSize: '20m',
			maxFiles: '14d',
		}),
	],
});

export default logger;
