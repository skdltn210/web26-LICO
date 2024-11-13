import { IsString, IsEnum, IsOptional, IsUrl } from 'class-validator';

export class CreateUserDto {
  oauthUid: string;
  oauthPlatform: 'naver' | 'github' | 'google';
  nickname: string;
  profileImage?: string;
}
