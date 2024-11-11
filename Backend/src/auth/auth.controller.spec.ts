// src/auth/auth.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { ExecutionContext } from '@nestjs/common';
import { Request, Response } from 'express';

jest.mock('@nestjs/passport', () => ({
  AuthGuard: () => {
    return class MockAuthGuard {
      canActivate(context: ExecutionContext) {
        return true;
      }
    };
  },
}));

describe('AuthController', () => {
  let controller: AuthController;
  let configService: ConfigService;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        ConfigService,
        {
          provide: AuthService,
          useValue: {}, // 필요한 경우 AuthService를 모의로 제공
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    configService = module.get<ConfigService>(ConfigService);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('OAuth 로그인 엔드포인트', () => {
    it('should have githubAuth method', () => {
      expect(controller.githubAuth).toBeDefined();
    });

    it('should have googleAuth method', () => {
      expect(controller.googleAuth).toBeDefined();
    });

    it('should have naverAuth method', () => {
      expect(controller.naverAuth).toBeDefined();
    });
  });

  describe('OAuth 콜백 엔드포인트', () => {
    it('should have githubAuthCallback method', () => {
      expect(controller.githubAuthCallback).toBeDefined();
    });

    it('should have googleAuthCallback method', () => {
      expect(controller.googleAuthCallback).toBeDefined();
    });

    it('should have naverAuthCallback method', () => {
      expect(controller.naverAuthCallback).toBeDefined();
    });
  });

  describe('handleAuthCallback', () => {
    it('should set cookie and redirect', () => {
      const req = {
        user: {
          jwt: 'test-jwt-token',
        },
      } as Request & { user: any };

      const res = {
        cookie: jest.fn(),
        redirect: jest.fn(),
      } as unknown as Response;

      jest.spyOn(configService, 'get').mockImplementation((key: string) => {
        if (key === 'CLIENT_URL') {
          return 'http://localhost:3000';
        }
        return null;
      });

      controller['handleAuthCallback'](req, res);

      expect(res.cookie).toHaveBeenCalledWith('jwt', 'test-jwt-token', {
        httpOnly: true,
        secure: false,
        maxAge: 36000000,
        sameSite: 'lax',
      });
      expect(res.redirect).toHaveBeenCalledWith('http://localhost:3000');
    });
  });
});
