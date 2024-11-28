import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryEntity } from './entity/category.entity';
import { Repository } from 'typeorm';
import { CategoriesDto } from './dto/categories.dto';
import { CategoryDto } from './dto/category.dto';
import { ErrorMessage } from './error/error.message.enum';
import { LivesService } from '../lives/lives.service';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(CategoryEntity) private categoriesRepository: Repository<CategoryEntity>,
    private livesService: LivesService,
  ) {}

  // 모든 카테고리
  async readCategories(): Promise<CategoriesDto[]> {
    const categories = await this.categoriesRepository.find();
    const stats = await this.livesService.getCategoryStats();

    // 카테고리 ID를 키로 하는 맵 생성
    const statsMap = new Map<number, { liveCount: number; viewerCount: number }>();
    stats.forEach((stat) => {
      statsMap.set(stat.categoriesId, {
        liveCount: stat.liveCount,
        viewerCount: stat.viewerCount,
      });
    });

    // 각 카테고리에 통계 정보 매핑
    return categories.map((category) => {
      const stat = statsMap.get(category.id) || { liveCount: 0, viewerCount: 0 };
      return {
        id: category.id,
        name: category.name,
        image: category.image,
        liveCount: stat.liveCount,
        viewerCount: stat.viewerCount,
      };
    });
  }


  // 특정 카테고리 정보와 통계 캐싱
  async readCategory(id: number): Promise<CategoryDto> {
    const category = await this.categoriesRepository.findOne({ where: { id } });

    if (!category) {
      throw new NotFoundException(ErrorMessage.CATEGORY_NOT_FOUND);
    }

    // 라이브 수와 시청자 수 가져오기
    const { liveCount, viewerCount } = await this.livesService.getCategoryStatsById(id);

    return {
      name: category.name,
      image: category.image,
      liveCount,
      viewerCount,
    };
  }
}