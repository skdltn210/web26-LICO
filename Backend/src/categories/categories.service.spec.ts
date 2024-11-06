import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { Repository } from 'typeorm';
import { CategoryEntity } from './entity/category.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let repository: Repository<CategoryEntity>;

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

  const mockCategoriesRepository = {
    find: jest.fn().mockResolvedValue(mockCategories),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(CategoryEntity),
          useValue: mockCategoriesRepository,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    repository = module.get<Repository<CategoryEntity>>(getRepositoryToken(CategoryEntity));
  });

  it('카테고리 서비스가 카테고리 목록을 반환합니다.', async () => {
    // Given
    mockCategoriesRepository.find.mockResolvedValue(mockCategories);

    // When
    const categories = await service.readCategories();

    // Then
    expect(categories).toEqual([
      {
        id: 1,
        name: '게임',
        image: 'https://example.com/game.jpg',
      },
      {
        id: 2,
        name: '음악',
        image: 'https://example.com/music.jpg',
      },
    ]);
  });
});
