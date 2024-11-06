import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { NotFoundException } from '@nestjs/common';
import { ErrorMessage } from './error/error.message.enum';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let service: CategoriesService;

  const mockCategories = [
    { id: 1, name: '게임', image: 'https://example.com/game.jpg' },
    { id: 2, name: '음악', image: 'https://example.com/music.jpg' },
  ];

  const mockCategoriesService = {
    readCategories: jest.fn(),
    readCategory: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: mockCategoriesService,
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
    service = module.get<CategoriesService>(CategoriesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCategories', () => {
    it('카테고리 컨트롤러가 카테고리 목록을 반환합니다.', async () => {
      // Given
      mockCategoriesService.readCategories.mockResolvedValue(mockCategories);

      // When
      const categories = await controller.getCategories();

      // Then
      expect(service.readCategories).toHaveBeenCalledTimes(1);
      expect(categories).toEqual(mockCategories);
    });
  });

  describe('getCategory', () => {
    it('카테고리 컨트롤러가 단일 카테고리 정보를 반환합니다.', async () => {
      // Given
      const categoryId = 2;
      const expectedCategory = { name: '음악', image: 'https://example.com/music.jpg' };
      mockCategoriesService.readCategory.mockResolvedValue(expectedCategory);

      // When
      const category = await controller.getCategory(categoryId);

      // Then
      expect(service.readCategory).toHaveBeenCalledTimes(1);
      expect(service.readCategory).toHaveBeenCalledWith(categoryId);
      expect(category).toEqual(expectedCategory);
    });

    it('존재하지 않는 카테고리 ID로 조회 시 404 에러를 반환합니다.', async () => {
      // Given
      const invalidCategoryId = 999;
      mockCategoriesService.readCategory.mockRejectedValue(new NotFoundException(ErrorMessage.READ_CATEGORY_404));

      // When & Then
      await expect(controller.getCategory(invalidCategoryId)).rejects.toThrow(
        new NotFoundException(ErrorMessage.READ_CATEGORY_404),
      );
      expect(service.readCategory).toHaveBeenCalledTimes(1);
      expect(service.readCategory).toHaveBeenCalledWith(invalidCategoryId);
    });
  });
});
