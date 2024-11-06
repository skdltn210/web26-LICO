import { Body, Controller, Get, HttpCode, Param, Patch, ValidationPipe } from '@nestjs/common';
import { LivesService } from './lives.service';
import { LivesDto } from './dto/lives.dto';
import { LiveDto } from './dto/live.dto';
import { UpdateLiveDto } from './dto/update.live.dto';

@Controller('lives')
export class LivesController {
  constructor(private readonly livesService: LivesService) {}

  @Get()
  async getLives(): Promise<LivesDto[]> {
    return await this.livesService.readLives();
  }

  @Get('/:channelId')
  async getLive(@Param('channelId') channelId: string): Promise<LiveDto> {
    return await this.livesService.readLive(channelId);
  }

  @Patch('/:channelId')
  @HttpCode(202)
  async setLive(@Param('channelId') channelId: string, @Body(ValidationPipe) updateLiveDto: UpdateLiveDto) {
    await this.livesService.updateLive({ channelId, updateLiveDto });
  }
}
