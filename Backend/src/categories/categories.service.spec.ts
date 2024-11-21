import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { Repository } from 'typeorm';
import { CategoryEntity } from './entity/category.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { ErrorMessage } from './error/error.message.enum';
import { LivesService } from '../lives/lives.service';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let repository: Repository<CategoryEntity>;
  let livesService: LivesService;

  const mockCategories = [
    {
      id: 1,
      name: '게임',
      image: 'https://example.com/game.jpg',
      createdAt: new Date('2024-11-06T12:00:00Z'),
    },
    {
      id: 2,
      name: '음악',
      image: 'https://example.com/music.jpg',
      createdAt: new Date('2024-11-06T13:00:00Z'),
      updatedAt: new Date('2024-11-06T13:00:00Z'),
    },
  ];

  const mockCategoryRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockLivesService = {
    getCategoryStats: jest.fn(),
    getCategoryStatsById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(CategoryEntity),
          useValue: mockCategoryRepository,
        },
        {
          provide: LivesService,
          useValue: mockLivesService,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    repository = module.get<Repository<CategoryEntity>>(getRepositoryToken(CategoryEntity));
    livesService = module.get<LivesService>(LivesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('readCategories', () => {
    it('카테고리 서비스가 카테고리 목록을 반환합니다.', async () => {
      // Given
      mockCategoryRepository.find.mockResolvedValue(mockCategories);
      const mockStats = [
        { categoriesId: 1, liveCount: 3, viewerCount: 50 },
        { categoriesId: 2, liveCount: 5, viewerCount: 100 },
      ];
      mockLivesService.getCategoryStats.mockResolvedValue(mockStats);

      // When
      const categories = await service.readCategories();

      // Then
      expect(repository.find).toHaveBeenCalledTimes(1);
      expect(livesService.getCategoryStats).toHaveBeenCalledTimes(1);
      expect(categories).toEqual([
        {
          id: 1,
          name: '게임',
          image: 'https://example.com/game.jpg',
          liveCount: 3,
          viewerCount: 50,
        },
        {
          id: 2,
          name: '음악',
          image: 'https://example.com/music.jpg',
          liveCount: 5,
          viewerCount: 100,
        },
      ]);
    });
  });

  describe('readCategory', () => {
    it('카테고리 서비스가 단일 카테고리 정보를 반환합니다.', async () => {
      // Given
      const categoryId = 2;
      mockCategoryRepository.findOne.mockResolvedValue(mockCategories[1]);
      const mockStat = { liveCount: 5, viewerCount: 100 };
      mockLivesService.getCategoryStatsById.mockResolvedValue(mockStat);

      // When
      const category = await service.readCategory(categoryId);

      // Then
      expect(repository.findOne).toHaveBeenCalledTimes(1);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: categoryId } });
      expect(livesService.getCategoryStatsById).toHaveBeenCalledTimes(1);
      expect(livesService.getCategoryStatsById).toHaveBeenCalledWith(categoryId);
      expect(category).toEqual({
        name: '음악',
        image: 'https://example.com/music.jpg',
        liveCount: 5,
        viewerCount: 100,
      });
    });

    it('카테고리 서비스가 존재하지 않는 카테고리 ID로 조회 시 404 에러를 반환합니다.', async () => {
      // Given
      mockCategoryRepository.findOne.mockResolvedValue(null);
      const invalidCategoryId = 999;

      // When & Then
      await expect(service.readCategory(invalidCategoryId)).rejects.toThrow(
        new NotFoundException(ErrorMessage.CATEGORY_NOT_FOUND),
      );
      expect(repository.findOne).toHaveBeenCalledTimes(1);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: invalidCategoryId },
      });
    });
  });
});
