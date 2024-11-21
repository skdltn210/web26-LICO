// users.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { UserEntity } from './entity/user.entity';
import { LiveEntity } from '../lives/entity/live.entity';
import { getRepositoryToken, getDataSourceToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from './dto/create.user.dto';
import { UpdateUserDto } from './dto/update.user.dto';
import {
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { S3 } from '@aws-sdk/client-s3';

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: jest.Mocked<Repository<UserEntity>>;
  let livesRepository: jest.Mocked<Repository<LiveEntity>>;
  let dataSource: DataSource;
  let configService: jest.Mocked<ConfigService>;

  // users.service.1.1. Mock Repository 정의
  const mockUsersRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockLivesRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  // users.service.1.2. Mock DataSource 정의
  const mockDataSource = {
    transaction: jest.fn(),
  };

  // users.service.1.3. Mock ConfigService 정의
  const mockConfigService = {
    get: jest.fn(),
  };

  // users.service.1.4. console.error를 모킹하여 테스트 중 에러 로그 숨기기
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  // users.service.1.5. 모든 테스트 후 Mock 함수 복원
  afterAll(() => {
    jest.restoreAllMocks();
  });

  // users.service.1.6. TestingModule 설정 및 의존성 주입
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(UserEntity), useValue: mockUsersRepository },
        { provide: getRepositoryToken(LiveEntity), useValue: mockLivesRepository },
        { provide: getDataSourceToken(), useValue: mockDataSource },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get(getRepositoryToken(UserEntity)) as jest.Mocked<Repository<UserEntity>>;
    livesRepository = module.get(getRepositoryToken(LiveEntity)) as jest.Mocked<Repository<LiveEntity>>;
    dataSource = module.get(getDataSourceToken());
    configService = module.get(ConfigService) as jest.Mocked<ConfigService>;

    // S3 인스턴스 모킹
    service['s3'] = {
      send: jest.fn(),
    } as unknown as jest.Mocked<S3>;
  });

  // users.service.1.7. 각 테스트 후 Mock 함수 초기화
  afterEach(() => {
    jest.clearAllMocks();
  });

  // users.service.2.1. 서비스가 제대로 정의되었는지 확인하는 기본 테스트
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // users.service.3. findByOAuthUid 메서드 테스트 스위트 시작
  describe('findByOAuthUid', () => {
    const oauthUid = 'test-oauth-uid';
    const oauthPlatform: 'google' | 'github' | 'naver' = 'github';
    const mockUser = {
      id: 1,
      oauthUid,
      oauthPlatform,
      nickname: 'TestUser',
      profileImage: 'https://example.com/test-user.jpg',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      live: null,
      following: [],
    } as UserEntity;

    // users.service.3.1.1. 사용자를 성공적으로 찾는 테스트
    it('should return user if found', async () => {
      usersRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByOAuthUid(oauthUid, oauthPlatform);

      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { oauthUid, oauthPlatform },
        relations: ['live'],
      });
      expect(result).toEqual(mockUser);
    });

    // users.service.3.1.2. 사용자를 찾지 못한 경우 null을 반환하는 테스트
    it('should return null if user not found', async () => {
      usersRepository.findOne.mockResolvedValue(null);

      const result = await service.findByOAuthUid(oauthUid, oauthPlatform);

      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { oauthUid, oauthPlatform },
        relations: ['live'],
      });
      expect(result).toBeNull();
    });
  });

  // users.service.4. findById 메서드 테스트 스위트 시작
  describe('findById', () => {
    const userId = 1;
    const mockUser = {
      id: userId,
      oauthUid: 'test-oauth-uid',
      oauthPlatform: 'github' as 'naver' | 'github' | 'google',
      nickname: 'TestUser',
      profileImage: 'https://example.com/test-user.jpg',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      live: null,
      following: [],
    } as UserEntity;

    // users.service.4.1.1. 사용자를 성공적으로 찾는 테스트
    it('should return user if found', async () => {
      usersRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findById(userId);

      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: ['live'],
      });
      expect(result).toEqual(mockUser);
    });

    // users.service.4.1.2. 사용자를 찾지 못한 경우 null을 반환하는 테스트
    it('should return null if user not found', async () => {
      usersRepository.findOne.mockResolvedValue(null);

      const result = await service.findById(userId);

      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: ['live'],
      });
      expect(result).toBeNull();
    });
  });

  // users.service.5. createUser 메서드 테스트 스위트 시작
  describe('createUser', () => {
    const createUserDto: CreateUserDto = {
      oauthUid: 'test-oauth-uid',
      oauthPlatform: 'github',
      nickname: 'TestUser',
      profileImage: 'https://example.com/test-user.jpg',
    };

    const mockUser = {
      id: 1,
      ...createUserDto,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      live: { id: 1 },
      following: [],
    } as UserEntity;

    // users.service.5.1.1. 사용자를 성공적으로 생성하는 테스트
    it('should create and return the new user', async () => {
      const mockTransactionManager = {
        create: jest.fn(),
        save: jest.fn(),
      };

      // dataSource.transaction 메서드를 any로 캐스팅하여 타입 오류 해결
      (dataSource.transaction as any).mockImplementation(
        async (cb: (manager: EntityManager) => Promise<any>) => {
          return await cb(mockTransactionManager as unknown as EntityManager);
        },
      );

      mockTransactionManager.create
        .mockReturnValueOnce({ id: 1 } as LiveEntity) // For LiveEntity
        .mockReturnValueOnce(mockUser); // For UserEntity

      mockTransactionManager.save
        .mockResolvedValueOnce({ id: 1 } as LiveEntity) // Saved LiveEntity
        .mockResolvedValueOnce(mockUser); // Saved UserEntity

      const result = await service.createUser(createUserDto);

      expect(dataSource.transaction).toHaveBeenCalled();

      expect(mockTransactionManager.create).toHaveBeenNthCalledWith(
        1,
        LiveEntity,
        expect.objectContaining({
          categoriesId: null,
          channelId: expect.any(String),
          name: null,
          description: null,
          streamingKey: expect.any(String),
          onAir: false,
          startedAt: null,
        }),
      );

      expect(mockTransactionManager.create).toHaveBeenNthCalledWith(
        2,
        UserEntity,
        {
          ...createUserDto,
          live: { id: 1 },
        },
      );

      expect(result).toEqual(mockUser);
    });

    // users.service.5.1.2. 트랜잭션 에러가 발생한 경우 예외를 던지는 테스트
    it('should throw an error if transaction fails', async () => {
      (dataSource.transaction as any).mockRejectedValue(new Error('Transaction Error'));

      await expect(service.createUser(createUserDto)).rejects.toThrow('Transaction Error');

      expect(dataSource.transaction).toHaveBeenCalled();
    });
  });

  // users.service.6. updateUser 메서드 테스트 스위트 시작
  describe('updateUser', () => {
    const userId = 1;
    const updateUserDto: UpdateUserDto = {
      nickname: 'UpdatedUser',
      profileImage: 'https://example.com/updated-user.jpg',
    };

    const mockUser = {
      id: userId,
      oauthUid: 'test-oauth-uid',
      oauthPlatform: 'github' as 'naver' | 'github' | 'google',
      nickname: 'TestUser',
      profileImage: 'https://example.com/test-user.jpg',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      live: null,
      following: [],
    } as UserEntity;

    // users.service.6.1.1. 사용자를 성공적으로 업데이트하는 테스트
    it('should update and return the user', async () => {
      usersRepository.findOne.mockResolvedValue(mockUser);
      usersRepository.save.mockResolvedValue({
        ...mockUser,
        ...updateUserDto,
        updatedAt: new Date(),
      } as UserEntity);

      const result = await service.updateUser(userId, updateUserDto);

      expect(usersRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });

      expect(usersRepository.save).toHaveBeenCalledWith({
        ...mockUser,
        ...updateUserDto,
        updatedAt: expect.any(Date),
      });

      expect(result).toEqual({
        ...mockUser,
        ...updateUserDto,
        updatedAt: expect.any(Date),
      });
    });

    // users.service.6.1.2. 파일 업로드가 포함된 업데이트 테스트
    it('should upload file and update user when file is provided', async () => {
      usersRepository.findOne.mockResolvedValue(mockUser);

      const mockFile = {
        originalname: 'test.jpg',
        buffer: Buffer.from('test'),
        mimetype: 'image/jpeg',
      } as Express.Multer.File;

      const uploadedUrl = 'https://ncloud-storage.com/profile-images/test.jpg';

      // uploadFileToNcloud 메서드를 모킹
      jest.spyOn<any, any>(service, 'uploadFileToNcloud').mockResolvedValue(uploadedUrl);

      usersRepository.save.mockResolvedValue({
        ...mockUser,
        nickname: updateUserDto.nickname,
        profileImage: uploadedUrl,
        updatedAt: new Date(),
      } as UserEntity);

      const result = await service.updateUser(userId, updateUserDto, mockFile);

      expect(usersRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });

      expect(service['uploadFileToNcloud']).toHaveBeenCalledWith(mockFile);

      expect(usersRepository.save).toHaveBeenCalledWith({
        ...mockUser,
        nickname: updateUserDto.nickname,
        profileImage: uploadedUrl,
        updatedAt: expect.any(Date),
      });

      expect(result).toEqual({
        ...mockUser,
        nickname: updateUserDto.nickname,
        profileImage: uploadedUrl,
        updatedAt: expect.any(Date),
      });
    });

    // users.service.6.1.3. 사용자를 찾지 못한 경우 예외를 던지는 테스트
    it('should throw NotFoundException if user not found', async () => {
      usersRepository.findOne.mockResolvedValue(null);

      await expect(service.updateUser(userId, updateUserDto)).rejects.toThrow(
        NotFoundException,
      );

      expect(usersRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
    });

    // users.service.6.1.4. 지원되지 않는 파일 형식일 경우 예외를 던지는 테스트
    it('should throw BadRequestException if file type is unsupported', async () => {
      usersRepository.findOne.mockResolvedValue(mockUser);

      const mockFile = {
        originalname: 'test.txt',
        buffer: Buffer.from('test'),
        mimetype: 'text/plain',
      } as Express.Multer.File;

      jest.spyOn<any, any>(service, 'uploadFileToNcloud').mockImplementation(() => {
        throw new BadRequestException('지원되지 않는 이미지 형식입니다.');
      });

      await expect(
        service.updateUser(userId, updateUserDto, mockFile),
      ).rejects.toThrow(BadRequestException);

      expect(usersRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
    });
  });
});
