import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Category } from 'src/post/entities/category.entity';
import { Subcategory } from 'src/post/entities/subcategory.entity';

@Injectable()
export class InitSeed {
	constructor(private dataSource: DataSource) {}

	async seed() {
		const categoryRepository: Repository<Category> =
			this.dataSource.getRepository(Category);
		const subcategoryRepository: Repository<Subcategory> =
			this.dataSource.getRepository(Subcategory);

		const categoryCount = await categoryRepository.count();
		const subcategoryCount = await subcategoryRepository.count();

		if (categoryCount === 0) {
			await categoryRepository.insert([
				{ id: 1, name: 'IT' },
				{ id: 2, name: '스포츠' },
				{ id: 3, name: '정치' },
				{ id: 4, name: '엔터' },
			]);
		} else {
			console.log('카테고리 기존 데이터가 존재하여 시드 정보 주입 불가');
		}

		if (subcategoryCount === 0) {
			await subcategoryRepository.insert([
				{ id: 1, name: '개발', category: { id: 1 } },
				{ id: 2, name: '보안', category: { id: 1 } },
				{ id: 3, name: '전자제품', category: { id: 1 } },
				{ id: 4, name: '축구', category: { id: 2 } },
				{ id: 5, name: '야구', category: { id: 2 } },
				{ id: 6, name: '농구', category: { id: 2 } },
				{ id: 7, name: '국내 정치', category: { id: 3 } },
				{ id: 8, name: '국외 정치', category: { id: 3 } },
				{ id: 9, name: '영화', category: { id: 4 } },
				{ id: 10, name: '드라마', category: { id: 4 } },
				{ id: 11, name: '아이돌', category: { id: 4 } },
			]);
		} else {
			console.log(
				'서브카테고리 기존 데이터가 존재하여 시드 정보 주입 불가',
			);
		}
	}
}
