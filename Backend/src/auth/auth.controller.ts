import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(private configService: ConfigService, private authService: AuthService) {}

  @Get('github')
  @UseGuards(AuthGuard('github'))
  async githubAuth() {}

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubAuthCallback(@Req() req: Request & { user: any }, @Res() res: Response) {
    this.handleAuthCallback(req, res);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: Request & { user: any }, @Res() res: Response) {
    this.handleAuthCallback(req, res);
  }

  @Get('naver')
  @UseGuards(AuthGuard('naver'))
  async naverAuth(@Req() req) {}

  @Get('naver/callback')
  @UseGuards(AuthGuard('naver'))
  async naverAuthCallback(@Req() req: Request & { user: any }, @Res() res: Response) {
    this.handleAuthCallback(req, res);
  }

  private handleAuthCallback(req: Request & { user: any }, res: Response) {
    const jwt = req.user.jwt;

    res.cookie('jwt', jwt, {
      httpOnly: true,
      secure: true,
      maxAge: 36000000, // 10시간
      sameSite: 'none',
    });

    const clientUrl = this.configService.get<string>('CLIENT_URL');
    res.redirect(clientUrl);
  }
}
