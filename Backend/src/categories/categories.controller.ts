import { Controller, Get } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesDto } from './dto/categories.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async getCategories(): Promise<CategoriesDto[]> {
    return await this.categoriesService.readCategories();
  }
}
