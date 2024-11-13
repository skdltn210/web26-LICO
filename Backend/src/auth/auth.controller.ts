import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';
import { access } from 'fs';

@Controller('auth')
export class AuthController {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {}
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: Request & { user: any }, @Res() res: Response) {
    try {
      if (!req.user) {
        throw new UnauthorizedException('No user from Google');
      }

      console.log('Received user data:', req.user); // 디버깅용 로그

      const { accessToken, refreshToken, user } = await this.authService.validateOAuthLogin(
        req.user.oauthUid,
        req.user.provider,
        {
          nickname: req.user.nickname,
          profileImage: req.user.profileImage,
          email: req.user.email,
        },
      );

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/auth',
      });

      res.json({
        success: true,
        accessToken,
        user,
      });
    } catch (error) {
      console.error('Detailed callback error:', error); // 더 자세한 에러 로깅
      res.status(error.status || 401).json({
        success: false,
        message: error.message || 'Authentication failed',
      });
    }
  }
}
