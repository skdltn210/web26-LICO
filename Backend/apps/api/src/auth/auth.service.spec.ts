import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let configService: ConfigService;

  // auth.service.1.1. Mock UsersService 정의
  const mockUsersService = {
    findByOAuthUid: jest.fn(),
    createUser: jest.fn(),
    findById: jest.fn(),
  };

  // auth.service.1.2. Mock JwtService 정의
  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  // auth.service.1.3. Mock ConfigService 정의
  const mockConfigService = {
    get: jest.fn(),
  };

  // auth.service.1.4. console.error를 모킹하여 테스트 중 에러 로그 숨기기
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  // auth.service.1.5. 모든 테스트 후 Mock 함수 복원
  afterAll(() => {
    jest.restoreAllMocks();
  });

  // auth.service.1.6. TestingModule 설정 및 의존성 주입
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  // auth.service.1.7. 각 테스트 후 Mock 함수 초기화
  afterEach(() => {
    jest.clearAllMocks();
  });

  // auth.service.2.1. 서비스가 제대로 정의되었는지 확인하는 기본 테스트
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // auth.service.3. validateOAuthLogin 메서드에 대한 테스트 스위트 시작
  describe('validateOAuthLogin', () => {
    const oauthUid = 'test-oauth-uid';
    const oauthPlatform: 'google' | 'github' | 'naver' = 'github';
    const profileData = {
      nickname: 'TestUser',
      profileImage: 'https://example.com/test-user.jpg',
      email: 'testuser@example.com',
    };

    // auth.service.3.1.1. Mock 사용자 데이터 정의 (live를 null로 설정)
    const mockUser = {
      id: 1,
      oauthUid,
      oauthPlatform,
      nickname: profileData.nickname,
      profileImage: profileData.profileImage,
      live: null, // live를 null로 설정
    };

    // auth.service.3.1.2. JWT 페이로드 정의
    const mockPayload = {
      sub: {
        id: mockUser.id,
        provider: mockUser.oauthPlatform,
      },
    };

    // auth.service.3.1.3. 사용자가 존재하지 않을 경우 새로운 사용자를 생성하고 토큰을 반환하는 테스트
    it('should create a new user if not exists and return tokens with user data', async () => {
      // UsersService.findByOAuthUid가 undefined를 반환하여 사용자가 존재하지 않음을 모킹
      mockUsersService.findByOAuthUid.mockResolvedValue(undefined);

      // UsersService.createUser가 새로운 사용자를 반환하도록 모킹
      mockUsersService.createUser.mockResolvedValue(mockUser);

      // JwtService.signAsync가 액세스 토큰과 리프레시 토큰을 반환하도록 모킹
      mockJwtService.signAsync
        .mockResolvedValueOnce('access-token') // accessToken
        .mockResolvedValueOnce('refresh-token'); // refreshToken

      // ConfigService.get이 JWT 시크릿을 반환하도록 모킹
      mockConfigService.get.mockReturnValue('test-jwt-secret');

      // validateOAuthLogin 메서드 호출
      const result = await service.validateOAuthLogin(
        oauthUid,
        oauthPlatform,
        profileData,
      );

      // UsersService.findByOAuthUid가 올바르게 호출되었는지 확인
      expect(usersService.findByOAuthUid).toHaveBeenCalledWith(
        oauthUid,
        oauthPlatform,
      );

      // UsersService.createUser가 올바르게 호출되었는지 확인
      expect(usersService.createUser).toHaveBeenCalledWith({
        oauthUid,
        oauthPlatform,
        nickname: profileData.nickname,
        profileImage: profileData.profileImage,
      });

      // JwtService.signAsync가 올바른 페이로드와 옵션으로 호출되었는지 확인
      expect(jwtService.signAsync).toHaveBeenNthCalledWith(
        1,
        mockPayload,
        { expiresIn: '1h' },
      );

      expect(jwtService.signAsync).toHaveBeenNthCalledWith(
        2,
        { ...mockPayload, type: 'refresh' },
        { expiresIn: '7d' },
      );

      // 반환된 결과가 예상과 일치하는지 확인
      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: {
          id: mockUser.id,
          nickname: mockUser.nickname,
          profileImage: mockUser.profileImage,
          channelId: null, // live가 null이므로 channelId도 null
          liveId: null,    // live가 null이므로 liveId도 null
        },
      });
    });

    // auth.service.3.1.4. 사용자가 이미 존재할 경우 토큰을 반환하는 테스트
    it('should return tokens with user data if user already exists', async () => {
      // UsersService.findByOAuthUid가 기존 사용자를 반환하도록 모킹
      mockUsersService.findByOAuthUid.mockResolvedValue(mockUser);

      // JwtService.signAsync가 액세스 토큰과 리프레시 토큰을 반환하도록 모킹
      mockJwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      // ConfigService.get이 JWT 시크릿을 반환하도록 모킹
      mockConfigService.get.mockReturnValue('test-jwt-secret');

      // validateOAuthLogin 메서드 호출
      const result = await service.validateOAuthLogin(
        oauthUid,
        oauthPlatform,
        profileData,
      );

      // UsersService.findByOAuthUid가 올바르게 호출되었는지 확인
      expect(usersService.findByOAuthUid).toHaveBeenCalledWith(
        oauthUid,
        oauthPlatform,
      );

      // UsersService.createUser가 호출되지 않았는지 확인
      expect(usersService.createUser).not.toHaveBeenCalled();

      // JwtService.signAsync가 올바른 페이로드와 옵션으로 호출되었는지 확인
      expect(jwtService.signAsync).toHaveBeenNthCalledWith(
        1,
        mockPayload,
        { expiresIn: '1h' },
      );

      expect(jwtService.signAsync).toHaveBeenNthCalledWith(
        2,
        { ...mockPayload, type: 'refresh' },
        { expiresIn: '7d' },
      );

      // 반환된 결과가 예상과 일치하는지 확인
      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: {
          id: mockUser.id,
          nickname: mockUser.nickname,
          profileImage: mockUser.profileImage,
          channelId: null,
          liveId: null,
        },
      });
    });
  });

  // auth.service.4. refreshTokens 메서드에 대한 테스트 스위트 시작
  describe('refreshTokens', () => {
    const mockRefreshToken = 'existing-refresh-token';
    const mockNewAccessToken = 'new-access-token';
    const mockNewRefreshToken = 'new-refresh-token';
    const mockPayload = {
      sub: {
        id: 1,
        provider: 'github',
      },
      type: 'refresh',
    };

    // auth.service.4.1.1. Mock 사용자 데이터 정의 (live를 null로 설정)
    const mockUser = {
      id: 1,
      oauthUid: 'test-oauth-uid',
      oauthPlatform: 'github',
      nickname: 'TestUser',
      profileImage: 'https://example.com/test-user.jpg',
      live: null, // live를 null로 설정
    };

    // auth.service.4.1.2. refreshTokens 메서드가 성공적으로 토큰을 재발급하는 테스트
    it('should refresh tokens and return new tokens with user data', async () => {
      // JwtService.verifyAsync가 유효한 페이로드를 반환하도록 모킹
      mockJwtService.verifyAsync.mockResolvedValue(mockPayload);

      // UsersService.findById가 기존 사용자를 반환하도록 모킹
      mockUsersService.findById.mockResolvedValue(mockUser);

      // JwtService.signAsync가 새로운 액세스 토큰과 리프레시 토큰을 반환하도록 모킹
      mockJwtService.signAsync
        .mockResolvedValueOnce(mockNewAccessToken) // new accessToken
        .mockResolvedValueOnce(mockNewRefreshToken); // new refreshToken

      // ConfigService.get이 JWT 시크릿을 반환하도록 모킹
      mockConfigService.get.mockReturnValue('test-jwt-secret');

      // refreshTokens 메서드 호출
      const result = await service.refreshTokens(mockRefreshToken);

      // JwtService.verifyAsync가 올바르게 호출되었는지 확인
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(mockRefreshToken, {
        secret: 'test-jwt-secret', // 수정된 부분
      });

      // UsersService.findById가 올바르게 호출되었는지 확인
      expect(usersService.findById).toHaveBeenCalledWith(1);

      // JwtService.signAsync가 올바른 페이로드와 옵션으로 호출되었는지 확인
      expect(jwtService.signAsync).toHaveBeenNthCalledWith(
        1,
        {
          sub: {
            id: mockUser.id,
            provider: mockUser.oauthPlatform,
          },
        },
        { expiresIn: '1h' },
      );

      expect(jwtService.signAsync).toHaveBeenNthCalledWith(
        2,
        {
          ...{
            sub: {
              id: mockUser.id,
              provider: mockUser.oauthPlatform,
            },
          },
          type: 'refresh',
        },
        { expiresIn: '7d' },
      );

      // 반환된 결과가 예상과 일치하는지 확인
      expect(result).toEqual({
        accessToken: mockNewAccessToken,
        refreshToken: mockNewRefreshToken,
        user: {
          id: mockUser.id,
          nickname: mockUser.nickname,
          profileImage: mockUser.profileImage,
          channelId: null, // live가 null이므로 channelId도 null
          liveId: null,    // live가 null이므로 liveId도 null
        },
      });
    });

    // auth.service.4.1.3. refresh 토큰이 유효하지 않을 경우 UnauthorizedException을 던지는 테스트
    it('should throw UnauthorizedException if refresh token is invalid', async () => {
      // JwtService.verifyAsync가 에러를 던지도록 모킹
      mockJwtService.verifyAsync.mockRejectedValue(
        new Error('Invalid token'),
      );

      // ConfigService.get이 JWT 시크릿을 반환하도록 모킹
      mockConfigService.get.mockReturnValue('test-jwt-secret');

      // refreshTokens 메서드가 UnauthorizedException을 던지는지 확인
      await expect(
        service.refreshTokens(mockRefreshToken),
      ).rejects.toThrow(UnauthorizedException);

      // JwtService.verifyAsync가 올바르게 호출되었는지 확인
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(mockRefreshToken, {
        secret: 'test-jwt-secret', // 수정된 부분
      });

      // UsersService.findById가 호출되지 않았는지 확인
      expect(usersService.findById).not.toHaveBeenCalled();

      // JwtService.signAsync가 호출되지 않았는지 확인
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    // auth.service.4.1.4. refresh 토큰 타입이 'refresh'가 아닐 경우 UnauthorizedException을 던지는 테스트
    it('should throw UnauthorizedException if refresh token type is not refresh', async () => {
      const invalidPayload = {
        sub: {
          id: 1,
          provider: 'github',
        },
        type: 'access', // invalid type
      };

      // JwtService.verifyAsync가 invalidPayload를 반환하도록 모킹
      mockJwtService.verifyAsync.mockResolvedValue(invalidPayload);

      // ConfigService.get이 JWT 시크릿을 반환하도록 모킹
      mockConfigService.get.mockReturnValue('test-jwt-secret');

      // refreshTokens 메서드가 UnauthorizedException을 던지는지 확인
      await expect(
        service.refreshTokens(mockRefreshToken),
      ).rejects.toThrow(UnauthorizedException);

      // JwtService.verifyAsync가 올바르게 호출되었는지 확인
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(mockRefreshToken, {
        secret: 'test-jwt-secret', // 수정된 부분
      });

      // UsersService.findById가 호출되지 않았는지 확인
      expect(usersService.findById).not.toHaveBeenCalled();

      // JwtService.signAsync가 호출되지 않았는지 확인
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    // auth.service.4.1.5. 사용자가 존재하지 않을 경우 UnauthorizedException을 던지는 테스트
    it('should throw UnauthorizedException if user not found', async () => {
      // JwtService.verifyAsync가 유효한 페이로드를 반환하도록 모킹
      mockJwtService.verifyAsync.mockResolvedValue(mockPayload);

      // UsersService.findById가 null을 반환하여 사용자가 존재하지 않음을 모킹
      mockUsersService.findById.mockResolvedValue(null);

      // ConfigService.get이 JWT 시크릿을 반환하도록 모킹
      mockConfigService.get.mockReturnValue('test-jwt-secret');

      // refreshTokens 메서드가 UnauthorizedException을 던지는지 확인
      await expect(
        service.refreshTokens(mockRefreshToken),
      ).rejects.toThrow(UnauthorizedException);

      // JwtService.verifyAsync가 올바르게 호출되었는지 확인
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(mockRefreshToken, {
        secret: 'test-jwt-secret', // 수정된 부분
      });

      // UsersService.findById가 올바르게 호출되었는지 확인
      expect(usersService.findById).toHaveBeenCalledWith(1);

      // JwtService.signAsync가 호출되지 않았는지 확인
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });
  });
});
