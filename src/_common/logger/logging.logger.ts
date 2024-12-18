import { createLogger, format, transports } from 'winston';
import moment from 'moment-timezone';

const customFormat = format.printf(({ message, timestamp }) => {
	const msg = typeof message === 'object' ? message : { message };
	return JSON.stringify(
		{
			timestamp,
			...msg, // spread operator
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
		new transports.File({ filename: './logs/todays.log' }),
	],
});

export default logger;
