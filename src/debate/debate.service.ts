import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDebateReq } from './dto/debate.dto';
import { Debate } from './entities/debate.entity';
import { TooManyDebates } from './exceptions/TooManyDebates.exception';
import { TooManyDiscussorException } from './exceptions/TooManyDiscussor.exception';

@Injectable()
export class DebateService {
	constructor(
		@InjectRepository(Debate)
		private readonly debateRepository: Repository<Debate>,
	) {}

	async createDebate(createDebateReq: CreateDebateReq) {
		try {
			// 총 방 개수 제한
			const debatesCount = await this.debateRepository.count();
			if (debatesCount >= 10) {
				throw new TooManyDebates();
			}

			const {
				title,
				content,
				categoryId,
				subcategoryId,
				maxDiscussantCount,
			} = createDebateReq;
			const debate = this.debateRepository.create({
				title,
				content,
				categoryId,
				subcategoryId,
				maxDiscussantCount,
			});
			const savedDebate = await this.debateRepository.save(debate);

			const countDown = setInterval(async () => {
				await this.debateRepository.update(savedDebate.id, {
					leftMinutes: () => 'leftMinutes - 1',
				});
			}, 60000);

			const timer = setTimeout(async () => {
				await this.deleteDebate(savedDebate.id);
				clearInterval(countDown);
			}, savedDebate.leftMinutes * 60000);

			return savedDebate.id;
		} catch (error) {
			throw error;
		}
	}

	async deleteDebate(id: number) {
		try {
			await this.debateRepository.delete({
				id: id,
			});
		} catch (error) {
			throw error;
		}
	}

	async findDebates() {
		try {
			const debates = await this.debateRepository.find({
				relations: ['category', 'subcategory'],
			});
			return debates;
		} catch (error) {
			throw error;
		}
	}

	async updateDiscussantCount(debateId: number, discussantCount: number) {
		try {
			const debates = await this.debateRepository.findBy({
				id: debateId,
			});
			const debate = debates[0];

			if (debate.maxDiscussantCount < discussantCount) {
				console.log('에러던지기');
				throw new TooManyDiscussorException();
			}
			await this.debateRepository.update(
				{ id: debateId },
				{ discussantCount: discussantCount },
			);
		} catch (error) {
			throw error;
		}
	}

	async getLeftMinutesById(id: number) {
		try {
			const debates = await this.debateRepository.find({
				where: {
					id: id,
				},
			});
			const debate = debates[0];
			return debate.leftMinutes;
		} catch (error) {
			throw error;
		}
	}
}
