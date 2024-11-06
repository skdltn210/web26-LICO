import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryEntity } from './entity/category.entity';
import { Repository } from 'typeorm';
import { CategoriesDto } from './dto/categories.dto';

@Injectable()
export class CategoriesService {
  constructor(@InjectRepository(CategoryEntity) private categoriesRepository: Repository<CategoryEntity>) {}

  async readCategories(): Promise<CategoriesDto[]> {
    const categories = await this.categoriesRepository.find();
    return categories.map(({ id, name, image }) => {
      return {
        id,
        name,
        image,
      };
    });
  }
}
