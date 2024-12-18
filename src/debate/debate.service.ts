import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDebateReq } from './dto/debate.dto';
import { Debate } from './entities/debate.entity';
import { TooManyDiscussorException } from './exceptions/TooManyDiscussor.exception';

@Injectable()
export class DebateService {
	constructor(
		@InjectRepository(Debate)
		private readonly debateRepository: Repository<Debate>,
	) {}

	async createDebate(createDebateReq: CreateDebateReq) {
		try {
			const {
				title,
				content,
				categoryId,
				subcategoryId,
				maxDiscussantCount,
			} = createDebateReq;
			const insertResponse = await this.debateRepository.insert({
				title,
				content,
				categoryId,
				subcategoryId,
				maxDiscussantCount,
			});
			const debateId = insertResponse.identifiers[0].id;

			const timer = setTimeout(() => {
				this.deleteDebate(debateId);
			}, 10000);

			return debateId;
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
}
