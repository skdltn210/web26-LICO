import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';

// auth.controller.1.1. 필요한 메서드만 포함하는 커스텀 MockResponse 타입 정의
type MockResponse = Partial<Response> & {
  cookie: jest.Mock;
  json: jest.Mock;
  status: jest.Mock;
};

// auth.controller.1.2. mockResponse 함수 정의
const mockResponse = (): MockResponse => ({
  cookie: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
  status: jest.fn().mockReturnThis(),
});

// auth.controller.1.3. console.error를 모킹하여 테스트 중 에러 로그 숨기기
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let configService: ConfigService;

  // auth.controller.2.1. Mock AuthService 정의
  const mockAuthService = {
    validateOAuthLogin: jest.fn(),
    refreshTokens: jest.fn(),
  };

  // auth.controller.2.2. Mock ConfigService 정의
  const mockConfigService = {
    get: jest.fn(),
  };

  // auth.controller.2.3. TestingModule 설정 및 의존성 주입
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    configService = module.get<ConfigService>(ConfigService);
  });

  // auth.controller.2.4. 각 테스트 후 Mock 함수 초기화
  afterEach(() => {
    jest.clearAllMocks();
  });

  // auth.controller.3. OAuth Callback Endpoints 테스트 스위트 시작
  describe('OAuth Callback Endpoints', () => {
    // auth.controller.3.1.1. Mock 요청 객체 생성 함수 정의
    const mockRequest = (user: any) => ({
      user,
    }) as Request & { user: any };

    // auth.controller.3.1.2. OAuth 콜백 핸들링 함수 정의 (테스트 재사용을 위해)
    const handleOAuthCallback = async (
      provider: string,
      user: any,
      expectedRedirectUrl: string,
    ) => {
      // ConfigService의 get 메서드 모킹
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'IS_PRODUCTION') return 'false';
        if (key === 'CLIENT_URL') return expectedRedirectUrl;
        return null;
      });

      // AuthService의 validateOAuthLogin 메서드 모킹
      mockAuthService.validateOAuthLogin.mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: {
          id: user.id,
          nickname: user.nickname,
          profileImage: user.profileImage,
          channelId: null,
          liveId: null,
        },
      });

      // Mock 요청 및 응답 객체 생성
      const req = mockRequest(user);
      const res = mockResponse();

      // 동적으로 적절한 콜백 메서드 호출
      if (provider === 'google') {
        await controller.googleAuthCallback(req, res as unknown as Response);
      } else if (provider === 'github') {
        await controller.githubAuthCallback(req, res as unknown as Response);
      } else if (provider === 'naver') {
        await controller.naverAuthCallback(req, res as unknown as Response);
      }

      // AuthService.validateOAuthLogin 호출 검증
      expect(authService.validateOAuthLogin).toHaveBeenCalledWith(
        user.oauthUid,
        user.provider,
        {
          nickname: user.nickname,
          profileImage: user.profileImage,
          email: user.email,
        },
      );

      // res.cookie 호출 검증
      expect(res.cookie).toHaveBeenCalledWith('refreshToken', 'refresh-token', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        domain: '.lico.digital',
        path: '/',
      });

      // res.json 호출 검증
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        accessToken: 'access-token',
        user: {
          id: user.id,
          nickname: user.nickname,
          profileImage: user.profileImage,
          channelId: null,
          liveId: null,
        },
      });
    };

    // auth.controller.3.2.1. Google OAuth 콜백 핸들링 테스트
    it('should handle Google OAuth callback correctly', async () => {
      const user = {
        oauthUid: 'google-oauth-uid',
        provider: 'google',
        nickname: 'GoogleUser',
        profileImage: 'https://example.com/google-user.jpg',
        email: 'googleuser@example.com',
      };
      const expectedRedirectUrl = 'http://localhost:3000';
      await handleOAuthCallback('google', user, expectedRedirectUrl);
    });

    // auth.controller.3.2.2. GitHub OAuth 콜백 핸들링 테스트
    it('should handle GitHub OAuth callback correctly', async () => {
      const user = {
        oauthUid: 'github-oauth-uid',
        provider: 'github',
        nickname: 'GithubUser',
        profileImage: 'https://example.com/github-user.jpg',
        email: 'githubuser@example.com',
      };
      const expectedRedirectUrl = 'http://localhost:3000';
      await handleOAuthCallback('github', user, expectedRedirectUrl);
    });

    // auth.controller.3.2.3. Naver OAuth 콜백 핸들링 테스트
    it('should handle Naver OAuth callback correctly', async () => {
      const user = {
        oauthUid: 'naver-oauth-uid',
        provider: 'naver',
        nickname: 'NaverUser',
        profileImage: 'https://example.com/naver-user.jpg',
        email: 'naveruser@example.com',
      };
      const expectedRedirectUrl = 'http://localhost:3000';
      await handleOAuthCallback('naver', user, expectedRedirectUrl);
    });

    // auth.controller.3.2.4. OAuth 콜백 실패 처리 테스트
    it('should handle OAuth callback failure', async () => {
      // ConfigService의 get 메서드 모킹
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'IS_PRODUCTION') return 'false';
        if (key === 'CLIENT_URL') return 'http://localhost:3000';
        return null;
      });

      // AuthService.validateOAuthLogin가 UnauthorizedException을 던지도록 모킹
      mockAuthService.validateOAuthLogin.mockRejectedValue(
        new UnauthorizedException('OAuth 인증 실패'),
      );

      // user가 null인 경우의 요청 및 응답 객체 생성
      const req = mockRequest(null); // user가 null인 경우
      const res = mockResponse();

      // Google OAuth 콜백 메서드 호출
      await controller.googleAuthCallback(req, res as unknown as Response);

      // AuthService.validateOAuthLogin가 호출되지 않았는지 검증
      expect(authService.validateOAuthLogin).not.toHaveBeenCalled();

      // res.status 호출 검증
      expect(res.status).toHaveBeenCalledWith(401);

      // res.json 호출 검증
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'OAuth 인증 실패',
      });
    });
  });

  // auth.controller.4. Logout Endpoint 테스트 스위트 시작
  describe('Logout Endpoint', () => {
    // auth.controller.4.1.1. 정상적인 로그아웃 처리 테스트
    it('should clear refreshToken cookie and respond with success', async () => {
      mockConfigService.get.mockReturnValue('false'); // IS_PRODUCTION = false

      const req = {} as Request;
      const res = mockResponse();

      // logout 메서드 호출
      await controller.logout(req, res as unknown as Response);

      // res.cookie 호출 검증
      expect(res.cookie).toHaveBeenCalledWith('refreshToken', '', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 0,
        domain: '.lico.digital',
        path: '/',
      });

      // res.status 호출 검증
      expect(res.status).toHaveBeenCalledWith(200);

      // res.json 호출 검증
      expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    // auth.controller.4.1.2. 로그아웃 실패 시 예외 처리 테스트
    it('should handle logout failure gracefully', async () => {
      mockConfigService.get.mockReturnValue('false'); // IS_PRODUCTION = false

      const req = {} as Request;
      const res = mockResponse();

      // logout 중 에러를 발생시키도록 res.cookie 모킹
      res.cookie.mockImplementation(() => {
        throw new Error('Cookie Error');
      });

      // logout 메서드 호출
      await controller.logout(req, res as unknown as Response);

      // res.cookie 호출 검증
      expect(res.cookie).toHaveBeenCalled();

      // res.status 호출 검증
      expect(res.status).toHaveBeenCalledWith(500);

      // res.json 호출 검증
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '로그아웃에 실패했습니다.',
      });
    });
  });

  // auth.controller.5. Refresh Tokens Endpoint 테스트 스위트 시작
  describe('Refresh Tokens Endpoint', () => {
    // auth.controller.5.1.1. 정상적으로 토큰이 재발급되고 쿠키가 설정되는지 테스트
    it('should refresh tokens and set new refreshToken cookie', async () => {
      const mockRefreshToken = 'existing-refresh-token';
      const mockNewTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        user: {
          id: 1,
          nickname: 'TestUser',
          profileImage: 'https://example.com/test-user.jpg',
          channelId: null,
          liveId: null,
        },
      };

      // AuthService.refreshTokens가 새로운 토큰을 반환하도록 모킹
      mockAuthService.refreshTokens.mockResolvedValue(mockNewTokens);
      mockConfigService.get.mockReturnValue('false'); // IS_PRODUCTION = false

      // refresh 토큰이 포함된 요청 객체 생성
      const req = {
        cookies: {
          refreshToken: mockRefreshToken,
        },
      } as unknown as Request;

      const res = mockResponse();

      // refresh 메서드 호출
      await controller.refresh(req, res as unknown as Response);

      // AuthService.refreshTokens 호출 검증
      expect(authService.refreshTokens).toHaveBeenCalledWith(mockRefreshToken);

      // res.cookie 호출 검증
      expect(res.cookie).toHaveBeenCalledWith('refreshToken', 'new-refresh-token', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        domain: '.lico.digital',
        path: '/',
      });

      // res.status 호출 검증
      expect(res.status).toHaveBeenCalledWith(200);

      // res.json 호출 검증
      expect(res.json).toHaveBeenCalledWith({
        accessToken: 'new-access-token',
        user: {
          id: 1,
          nickname: 'TestUser',
          profileImage: 'https://example.com/test-user.jpg',
          channelId: null,
          liveId: null,
        },
      });
    });

    // auth.controller.5.1.2. refresh 토큰이 없을 경우 UnauthorizedException을 던지는지 테스트
    it('should throw UnauthorizedException if refresh token is missing', async () => {
      const req = {
        cookies: {},
      } as unknown as Request;

      const res = mockResponse();

      // refresh 메서드가 UnauthorizedException을 던지는지 확인
      await expect(controller.refresh(req, res as unknown as Response)).rejects.toThrow(
        UnauthorizedException,
      );

      // AuthService.refreshTokens가 호출되지 않았는지 확인
      expect(authService.refreshTokens).not.toHaveBeenCalled();
    });

    // auth.controller.5.1.3. refresh 토큰이 유효하지 않을 경우 UnauthorizedException을 던지는지 테스트
    it('should throw UnauthorizedException if refresh token is invalid', async () => {
      const mockRefreshToken = 'invalid-refresh-token';

      // AuthService.refreshTokens가 UnauthorizedException을 던지도록 모킹
      mockAuthService.refreshTokens.mockRejectedValue(
        new UnauthorizedException('Could not refresh tokens'),
      );

      // refresh 토큰이 포함된 요청 객체 생성
      const req = {
        cookies: {
          refreshToken: mockRefreshToken,
        },
      } as unknown as Request;

      const res = mockResponse();

      // refresh 메서드가 UnauthorizedException을 던지는지 확인
      await expect(controller.refresh(req, res as unknown as Response)).rejects.toThrow(
        UnauthorizedException,
      );

      // AuthService.refreshTokens 호출 검증
      expect(authService.refreshTokens).toHaveBeenCalledWith(mockRefreshToken);
    });
  });
});
