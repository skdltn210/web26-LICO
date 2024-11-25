import { IsString, IsNotEmpty, IsNumber, IsDate, IsBoolean } from 'class-validator';
export class ChatDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsString()
  @IsNotEmpty()
  nickname: string;

  @IsDate()
  timestamp: Date;

  @IsBoolean()
  fillteringResult: boolean;
}
