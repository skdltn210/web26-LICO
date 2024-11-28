import { Body, Controller, Post, Req, UseGuards, ValidationPipe } from '@nestjs/common';
import { SendChatDto } from './dto/send.chat.dto';
import { ChatsService } from './chats.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserEntity } from '../users/entity/user.entity';

@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async sendChat(@Body(ValidationPipe) sendChatDto: SendChatDto, @Req() req: Request & { user: UserEntity }) {
    this.chatsService.ingestChat({ ...sendChatDto, userId: req.user.id, nickname: req.user.nickname });
  }
}
