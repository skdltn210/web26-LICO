import { Controller, Get } from '@nestjs/common';
import { LivesService } from './lives.service';
import { LivesDto } from './dto/lives.dto';

@Controller('lives')
export class LivesController {
  constructor(private readonly livesService: LivesService) {}

  @Get()
  async getLives(): Promise<LivesDto[]> {
    return await this.livesService.readLives();
  }
}
