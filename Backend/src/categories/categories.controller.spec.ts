import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let service: CategoriesService;

  const mockCategories = [
    { id: 1, name: '게임', image: 'https://example.com/game.jpg' },
    { id: 2, name: '음악', image: 'https://example.com/music.jpg' },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: {
            readCategories: jest.fn().mockResolvedValue(mockCategories),
          },
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
    service = module.get<CategoriesService>(CategoriesService);
  });

  it('카테고리 컨트롤러가 카테고리 목록을 반환합니다.', async () => {
    const categories = await controller.getCategories();
    expect(categories).toEqual(mockCategories);
  });
});
