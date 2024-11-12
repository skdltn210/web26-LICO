import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { UserEntity } from './entity/user.entity';

@Controller('users')
export class UsersController {
  @Get('/:userId')
  @UseGuards(JwtAuthGuard) // Guard 적용
  getProfile(@Req() req: Request & { user: UserEntity }) {
    return req.user;
  }
}