import { Controller, Get, Param } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesDto } from './dto/categories.dto';
import { CategoryDto } from './dto/category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async getCategories(): Promise<CategoriesDto[]> {
    return await this.categoriesService.readCategories();
  }

  @Get('/:categoriesId')
  async getCategory(@Param('categoriesId') categoriesId: number): Promise<CategoryDto> {
    return await this.categoriesService.readCategory(categoriesId);
  }
}
