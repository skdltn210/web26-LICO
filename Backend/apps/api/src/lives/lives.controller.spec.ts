import { Test, TestingModule } from '@nestjs/testing';
import { LivesController } from './lives.controller';
import { LivesService } from './lives.service';
import { LivesDto } from './dto/lives.dto';

describe('LivesController', () => {
  let controller: LivesController;
  let service: LivesService;

  const mockLives = [
    {
      channelId: 'abc123',
      livesName: 'Awesome Live Stream',
      usersNickname: 'JohnDoe',
      usersProfileImage: 'https://example.com/profile.jpg',
      categoriesId: 1,
      categoriesName: 'Gaming',
      onAir: true,
    },
    {
      channelId: 'def456',
      livesName: 'Music Jam Session',
      usersNickname: 'JaneDoe',
      usersProfileImage: 'https://example.com/jane-profile.jpg',
      categoriesId: 2,
      categoriesName: 'Music',
      onAir: true,
    },
  ];

  const mockLivesService = {
    readLives: jest.fn(),
    readLive: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LivesController],
      providers: [
        {
          provide: LivesService,
          useValue: mockLivesService,
        },
      ],
    }).compile();

    controller = module.get<LivesController>(LivesController);
    service = module.get<LivesService>(LivesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getOnAirLives', () => {
    it('라이브 컨트롤러가 방송중인 라이브 목록을 반환합니다.', async () => {
      // Given
      mockLivesService.readLives.mockResolvedValue(mockLives);

      // When
      const lives = await controller.getOnAirLives();

      // Then
      expect(service.readLives).toHaveBeenCalledTimes(1);
      expect(service.readLives).toHaveBeenCalledWith({ onAir: true });
      expect(lives).toEqual(mockLives);
    });
  });
});
