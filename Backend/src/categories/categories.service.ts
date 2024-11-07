import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryEntity } from './entity/category.entity';
import { Repository } from 'typeorm';
import { CategoriesDto } from './dto/categories.dto';
import { CategoryDto } from './dto/category.dto';
import { ErrorMessage } from './error/error.message.enum';

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

  async readCategory(id: number): Promise<CategoryDto> {
    const category = await this.categoriesRepository.findOne({ where: { id } });

    if (!category) {
      throw new NotFoundException(ErrorMessage.READ_CATEGORY_404);
    }

    return { name: category.name, image: category.image };
  }
}
