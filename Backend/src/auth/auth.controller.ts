import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('github')
  @UseGuards(AuthGuard('github'))
  async githubAuth() {}

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubAuthCallback(@Req() req: Request & { user: any }, @Res() res: Response) {
    const jwt = this.authService.createJwt(req.user, 'github');

    res.cookie('jwt', jwt, {
      httpOnly: true,
      secure: false,
      maxAge: 36000000, // 10시간
      sameSite: 'lax',
    });

    res.redirect('http://localhost:3000');
  }
}

