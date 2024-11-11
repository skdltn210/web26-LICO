import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LivesService } from './lives.service';
import { LiveEntity } from './entity/live.entity';

describe('LivesService', () => {
  let service: LivesService;
  let repository: Repository<LiveEntity>;

  const createMockLiveEntity = (data): LiveEntity => {
    const entity = new LiveEntity();
    Object.assign(entity, data);
    return entity;
  };

  const mockLives = [
    createMockLiveEntity({
      id: 1,
      categoriesId: 1,
      category: {
        id: 1,
        name: 'Gaming',
        image: 'https://example.com/game.jpg',
        createdAt: new Date('2024-11-06T12:00:00Z'),
        updatedAt: new Date('2024-11-06T12:00:00Z'),
      },
      channelId: 'abc123',
      name: 'Awesome Live Stream',
      description: 'Join me for some gaming fun!',
      streamingKey: 'key123',
      onAir: true,
      startedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      user: {
        id: 1,
        nickname: 'JohnDoe',
        profileImage: 'https://example.com/profile.jpg',
      },
    }),
    createMockLiveEntity({
      id: 2,
      categoriesId: 2,
      category: {
        id: 2,
        name: 'Music',
        image: 'https://example.com/music.jpg',
        createdAt: new Date('2024-11-06T13:00:00Z'),
        updatedAt: new Date('2024-11-06T13:00:00Z'),
      },
      channelId: 'def456',
      name: 'Music Jam Session',
      description: 'Tune in for live music!',
      streamingKey: 'key456',
      onAir: true,
      startedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      user: {
        id: 2,
        nickname: 'JaneDoe',
        profileImage: 'https://example.com/jane-profile.jpg',
      },
    }),
    createMockLiveEntity({
      id: 3,
      categoriesId: 3,
      category: {
        id: 3,
        name: 'Talk Show',
        image: 'https://example.com/talkshow.jpg',
        createdAt: new Date('2024-11-06T14:00:00Z'),
        updatedAt: new Date('2024-11-06T14:00:00Z'),
      },
      channelId: 'ghi789',
      name: 'Evening Talk Show',
      description: 'Discussing trending topics.',
      streamingKey: 'key789',
      onAir: false, // `onAir` 값이 false로 설정됨
      startedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      user: {
        id: 3,
        nickname: 'HostName',
        profileImage: 'https://example.com/host-profile.jpg',
      },
    }),
  ];

  const mockLivesRepository = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LivesService,
        {
          provide: getRepositoryToken(LiveEntity),
          useValue: mockLivesRepository,
        },
      ],
    }).compile();

    service = module.get<LivesService>(LivesService);
    repository = module.get<Repository<LiveEntity>>(getRepositoryToken(LiveEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('readLives', () => {
    it('라이브 서비스가 라이브 목록을 반환합니다.', async () => {
      // Given
      mockLivesRepository.find.mockResolvedValue(mockLives.filter(entity => entity.onAir));

      // When
      const lives = await service.readLives();

      // Then
      expect(repository.find).toHaveBeenCalledTimes(1);
      expect(repository.find).toHaveBeenCalledWith({ relations: ['category', 'user'], where: { onAir: true } });
      expect(lives).toEqual([
        {
          categoriesId: 1,
          categoriesName: 'Gaming',
          livesName: 'Awesome Live Stream',
          channelId: 'abc123',
          usersNickname: 'JohnDoe',
          usersProfileImage: 'https://example.com/profile.jpg',
        },
        {
          categoriesId: 2,
          categoriesName: 'Music',
          livesName: 'Music Jam Session',
          channelId: 'def456',
          usersNickname: 'JaneDoe',
          usersProfileImage: 'https://example.com/jane-profile.jpg',
        },
      ]);
    });
  });
});
