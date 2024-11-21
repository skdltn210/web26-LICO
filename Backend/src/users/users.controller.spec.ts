import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update.user.dto';
import { UserEntity } from './entity/user.entity';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: jest.Mocked<UsersService>;

  // users.controller.1.1. Mock UsersService 정의
  const mockUsersService = {
    findById: jest.fn(),
    updateUser: jest.fn(),
  };

  // users.controller.1.2. console.error를 모킹하여 테스트 중 에러 로그 숨기기
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  // users.controller.1.3. 모든 테스트 후 Mock 함수 복원
  afterAll(() => {
    jest.restoreAllMocks();
  });

  // users.controller.1.4. TestingModule 설정 및 의존성 주입
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get(UsersService) as jest.Mocked<UsersService>;
  });

  // users.controller.1.5. 각 테스트 후 Mock 함수 초기화
  afterEach(() => {
    jest.clearAllMocks();
  });

  // users.controller.2.1. 컨트롤러가 제대로 정의되었는지 확인하는 기본 테스트
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // users.controller.3. getProfile 메서드 테스트 스위트 시작
  describe('getProfile', () => {
    const userId = 1;
    const mockUser = {
      id: userId,
      nickname: 'TestUser',
      profileImage: 'https://example.com/test-user.jpg',
      createdAt: new Date(),
    } as UserEntity;

    // users.controller.3.1.1. 프로필을 성공적으로 가져오는 테스트
    it('should return user profile', async () => {
      usersService.findById.mockResolvedValue(mockUser);

      const result = await controller.getProfile(userId);

      expect(usersService.findById).toHaveBeenCalledWith(userId);

      expect(result).toEqual({
        users_id: mockUser.id,
        nickname: mockUser.nickname,
        profile_image: mockUser.profileImage,
        created_at: mockUser.createdAt,
      });
    });

    // users.controller.3.1.2. 사용자를 찾지 못한 경우 예외를 던지는 테스트
    it('should throw NotFoundException if user not found', async () => {
      usersService.findById.mockResolvedValue(null);

      await expect(controller.getProfile(userId)).rejects.toThrow(NotFoundException);

      expect(usersService.findById).toHaveBeenCalledWith(userId);
    });
  });

  // users.controller.4. updateProfile 메서드 테스트 스위트 시작
  describe('updateProfile', () => {
    const userId = 1;
    const mockUser = {
      id: userId,
      nickname: 'TestUser',
      profileImage: 'https://example.com/test-user.jpg',
      createdAt: new Date(),
    } as UserEntity;
    const updateUserDto: UpdateUserDto = {
      nickname: 'UpdatedUser',
      profileImage: 'https://example.com/updated-user.jpg',
    };

    // users.controller.4.1.1. 프로필을 성공적으로 업데이트하는 테스트
    it('should update and return user profile', async () => {
      const req = { user: { id: userId } } as any;

      usersService.updateUser.mockResolvedValue({
        ...mockUser,
        ...updateUserDto,
      } as UserEntity);

      const result = await controller.updateProfile(
        userId,
        req,
        updateUserDto,
        undefined,
      );

      expect(usersService.updateUser).toHaveBeenCalledWith(
        userId,
        updateUserDto,
        undefined,
      );

      expect(result).toEqual({
        users_id: mockUser.id,
        nickname: updateUserDto.nickname,
        profile_image: updateUserDto.profileImage,
        created_at: mockUser.createdAt,
      });
    });

    // users.controller.4.1.2. 로그인한 사용자와 요청한 사용자 ID가 다른 경우 예외를 던지는 테스트
    it('should throw ForbiddenException if user IDs do not match', async () => {
      const req = { user: { id: 2 } } as any; // 다른 사용자 ID

      await expect(
        controller.updateProfile(userId, req, updateUserDto, undefined),
      ).rejects.toThrow(ForbiddenException);
    });

    // users.controller.4.1.3. 파일 업로드가 포함된 업데이트 테스트
    it('should update profile with file upload', async () => {
      const req = { user: { id: userId } } as any;

      const mockFile = {
        originalname: 'test.jpg',
        buffer: Buffer.from('test'),
        mimetype: 'image/jpeg',
      } as Express.Multer.File;

      usersService.updateUser.mockResolvedValue({
        ...mockUser,
        nickname: updateUserDto.nickname,
        profileImage: 'https://ncloud-storage.com/profile-images/test.jpg',
      } as UserEntity);

      const result = await controller.updateProfile(
        userId,
        req,
        updateUserDto,
        mockFile,
      );

      expect(usersService.updateUser).toHaveBeenCalledWith(
        userId,
        updateUserDto,
        mockFile,
      );

      expect(result).toEqual({
        users_id: mockUser.id,
        nickname: updateUserDto.nickname,
        profile_image: 'https://ncloud-storage.com/profile-images/test.jpg',
        created_at: mockUser.createdAt,
      });
    });

    // users.controller.4.1.4. 사용자를 찾지 못한 경우 예외를 던지는 테스트
    it('should throw NotFoundException if user not found', async () => {
      const req = { user: { id: userId } } as any;

      usersService.updateUser.mockRejectedValue(new NotFoundException());

      await expect(
        controller.updateProfile(userId, req, updateUserDto, undefined),
      ).rejects.toThrow(NotFoundException);
    });

    // users.controller.4.1.5. 지원되지 않는 파일 형식일 경우 예외를 던지는 테스트
    it('should throw BadRequestException if file type is unsupported', async () => {
      const req = { user: { id: userId } } as any;

      const mockFile = {
        originalname: 'test.txt',
        buffer: Buffer.from('test'),
        mimetype: 'text/plain',
      } as Express.Multer.File;

      usersService.updateUser.mockRejectedValue(new BadRequestException());

      await expect(
        controller.updateProfile(userId, req, updateUserDto, mockFile),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
