import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from '../users/entity/user.entity';
import { LiveEntity } from '../lives/entity/live.entity';
import { CategoryEntity } from '../categories/entity/category.entity';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  // Mock CategoryEntity 정의
  const mockCategoryEntity: CategoryEntity = {
    id: 1,
    name: 'Category Name',
    image: 'http://example.com/category.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    lives: [],
  } as CategoryEntity;

  // Mock LiveEntity 정의
  const mockLiveEntity: LiveEntity = {
    id: 1,
    categoriesId: 1,
    category: mockCategoryEntity,
    channelId: 'channel-123',
    name: 'Live Name',
    description: 'Live Description',
    streamingKey: 'streaming-key-123',
    onAir: true,
    startedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    user: {} as UserEntity, // 순환 참조 방지를 위해 빈 객체로 설정

    // LiveEntity의 메서드 추가
    toLivesDto: jest.fn(),
    toLiveDto: jest.fn(),
  };

  function createMockUserEntity(overrides?: Partial<UserEntity>): UserEntity {
    return {
      id: 1,
      oauthUid: 'oauth-uid',
      oauthPlatform: 'github',
      nickname: 'testuser',
      profileImage: 'http://example.com/profile.jpg',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      live: mockLiveEntity, // live 프로퍼티 추가
      ...overrides,
    };
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByOAuthUid: jest.fn(),
            createUser: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('test-jwt-token'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateOAuthLogin', () => {
    const oauthUid = 'oauth-uid';
    const oauthPlatform = 'github';
    const profileData = {
      username: 'testuser',
      profileImage: 'http://example.com/profile.jpg',
    };

    it('should create a new user if not exists and return jwt', async () => {
      // UsersService의 findByOAuthUid가 undefined 반환 (사용자 없음)
      jest.spyOn(usersService, 'findByOAuthUid').mockResolvedValue(undefined);

      // UsersService의 createUser가 새로운 사용자 반환
      jest.spyOn(usersService, 'createUser').mockResolvedValue(
        createMockUserEntity({
          id: 1,
          oauthUid,
          oauthPlatform,
          nickname: profileData.username,
          profileImage: profileData.profileImage,
        }),
      );

      const jwt = await service.validateOAuthLogin(oauthUid, oauthPlatform, profileData);

      expect(usersService.findByOAuthUid).toHaveBeenCalledWith(oauthUid, oauthPlatform);
      expect(usersService.createUser).toHaveBeenCalledWith({
        oauthUid,
        oauthPlatform,
        nickname: profileData.username,
        profileImage: profileData.profileImage,
      });
      expect(jwt).toEqual('test-jwt-token');
    });

    it('should return jwt if user exists', async () => {
      // UsersService의 findByOAuthUid가 기존 사용자 반환
      jest.spyOn(usersService, 'findByOAuthUid').mockResolvedValue(
        createMockUserEntity({
          id: 1,
          oauthUid,
          oauthPlatform,
          nickname: profileData.username,
          profileImage: profileData.profileImage,
        }),
      );

      const jwt = await service.validateOAuthLogin(oauthUid, oauthPlatform, profileData);

      expect(usersService.findByOAuthUid).toHaveBeenCalledWith(oauthUid, oauthPlatform);
      expect(usersService.createUser).not.toHaveBeenCalled();
      expect(jwt).toEqual('test-jwt-token');
    });
  });
});
