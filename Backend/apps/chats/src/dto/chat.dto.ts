import { IsString, IsNotEmpty, IsNumber, IsDate, IsBooleanString, IsBoolean } from 'class-validator';
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

  @IsBooleanString()
  fillteringResult: string;
}
