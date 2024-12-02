import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  ValidationPipe,
  Query,
} from '@nestjs/common';
import { LivesService } from './lives.service';
import { LivesDto } from './dto/lives.dto';
import { LiveDto } from './dto/live.dto';
import { UpdateLiveDto } from './dto/update.live.dto';
import { UUID } from 'crypto';
import { StatusDto } from './dto/status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserEntity } from '../users/entity/user.entity';

@Controller('lives')
export class LivesController {
  constructor(private readonly livesService: LivesService) {}

  @Get() // 새로운 live 요청
  async getOnAirLives(
    @Query('sort') sort: 'latest' | 'viewers' | 'recommendation' = 'latest',
    @Query('limit') limit = 20,
    @Query('offset') offset = 0,
  ): Promise<LivesDto[]> {
    return await this.livesService.readLives({ sort, limit, offset });
  }

  @Get('/streaming-key')
  @UseGuards(JwtAuthGuard)
  async getStreamingKey(@Req() req: Request & { user: UserEntity }) {
    return req.user.live.streamingKey;
  }

  @Get('/:channelId')
  async getLive(@Param('channelId') channelId: UUID): Promise<LiveDto> {
    return await this.livesService.readLive(channelId);
  }

  @Patch('/:channelId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async setLive(
    @Param('channelId') channelId: UUID,
    @Body(ValidationPipe) updateLiveDto: UpdateLiveDto,
    @Req() req: Request & { user: UserEntity },
  ) {
    await this.livesService.updateLive({ channelId, updateLiveDto, userId: req.user.id });
  }

  @Get('/channel-id/:streamingKey')
  async getChannelId(@Param('streamingKey') streamingKey: UUID) {
    return await this.livesService.readChannelId(streamingKey);
  }

  @Post('/onair/:streamingKey')
  @HttpCode(200)
  async startLive(@Param('streamingKey') streamingKey: UUID) {
    await this.livesService.startLive(streamingKey);
    return { code: 0 };
  }

  @Delete('/onair/:streamingKey')
  @HttpCode(202)
  async endLive(@Param('streamingKey') streamingKey: UUID) {
    this.livesService.endLive(streamingKey);
  }

  @Get('/onair/:streamingKey')
  async getOnAir(@Param('streamingKey') streamingKey: UUID) {
    return await this.livesService.readOnAir(streamingKey);
  }

  @Get('/status/:channelId')
  async getStatus(@Param('channelId') channelId: UUID): Promise<StatusDto> {
    return await this.livesService.readStatus(channelId);
  }
}
