import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesDto } from './dto/categories.dto';
import { CategoryDto } from './dto/category.dto';
import { LivesService } from './../lives/lives.service';

@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly livesService: LivesService,
  ) {}

  @Get()
  async getCategories(): Promise<CategoriesDto[]> {
    return await this.categoriesService.readCategories();
  }

  @Get('/:categoriesId')
  async getCategory(@Param('categoriesId', ParseIntPipe) categoriesId: number): Promise<CategoryDto> {
    return await this.categoriesService.readCategory(categoriesId);
  }

  @Get('/:catrgoriesId/lives')
  async getOnAirLivesByCategory(@Param('categoriesId', ParseIntPipe) categoriesId: number) {
    return await this.livesService.readLives({ categoriesId, onAir: true });
  }
}
