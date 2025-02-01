import { Injectable } from '@nestjs/common';
import Redis from 'ioredis'; // ioredis를 사용

@Injectable()
export class RedisService {
	private redisClient: Redis;

	constructor() {
		this.redisClient = new Redis({
			host: 'redis', // Redis 서버 호스트
			port: 6379, // Redis 서버 포트
			// password: 'yourpassword', // 필요시 비밀번호 추가
		});
	}

	// Redis에 데이터 저장
	async setValue(key: string, value: string): Promise<string> {
		return await this.redisClient.set(key, value);
	}

	// Redis에서 데이터 가져오기
	async getValue(key: string): Promise<string | null> {
		return await this.redisClient.get(key);
	}

	// Redis에서 데이터 삭제하기
	async deleteValue(key: string) {
		return await this.redisClient.del(key);
	}

	// Redis에서 데이터 스캔하기
	async scanValue(pattern: string): Promise<[string, string[]]> {
		const [newCursor, keys] = await this.redisClient.scan(
			0,
			'MATCH',
			pattern,
			'COUNT',
			100,
		);

		return [newCursor, keys];
	}

	// Redis 연결 종료
	async close(): Promise<void> {
		await this.redisClient.quit();
	}
}
