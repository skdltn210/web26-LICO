import { IsNotEmpty, IsUUID, IsString } from 'class-validator';
import { UUID } from 'crypto';
export class SendChatDto {
  @IsUUID()
  @IsNotEmpty()
  channelId: UUID;

  @IsString()
  @IsNotEmpty()
  message: string;
}
