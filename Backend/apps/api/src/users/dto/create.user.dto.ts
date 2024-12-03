import { IsString, IsEnum, IsOptional, IsUrl } from 'class-validator';
export class CreateUserDto {
  @IsString()
  oauthUid: string;
  
  @IsEnum(['naver', 'github', 'google', 'lico'])
  oauthPlatform: 'naver' | 'github' | 'google'| 'lico';
  
  @IsString()
  @IsOptional()
  nickname?: string;
  
  @IsUrl()
  @IsOptional()
  profileImage?: string | null;
}