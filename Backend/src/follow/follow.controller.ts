// src/follow/follow.controller.ts

import {
  Controller,
  Get,
  Post,
  Delete,
  UseGuards,
  Req,
  Param,
  Body,
  HttpCode,
  ParseIntPipe,
} from '@nestjs/common';
import { FollowService } from './follow.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { UserEntity } from '../users/entity/user.entity';

@Controller('follow')
@UseGuards(JwtAuthGuard)
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  // 팔로우한 스트리머 목록 조회
  @Get()
  async getFollowing(@Req() req: Request & { user: UserEntity }) {
    const userId = req.user.id;
    return this.followService.getFollowingStreamers(userId);
  }

  // 스트리머 팔로우
  @Post()
  @HttpCode(201)
  async followStreamer(
    @Req() req: Request & { user: UserEntity },
    @Body('streamerId', ParseIntPipe) streamerId: number,
  ) {
    const userId = req.user.id;
    await this.followService.followStreamer(userId, streamerId);
    return { message: '팔로우 성공' };
  }

  // 스트리머 언팔로우
  @Delete(':streamerId')
  async unfollowStreamer(
    @Req() req: Request & { user: UserEntity },
    @Param('streamerId', ParseIntPipe) streamerId: number,
  ) {
    const userId = req.user.id;
    await this.followService.unfollowStreamer(userId, streamerId);
    return { message: '언팔로우 성공' };
  }
}
