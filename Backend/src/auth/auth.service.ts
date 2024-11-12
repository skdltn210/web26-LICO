import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService, 
    private usersService: UsersService,
  ) {}

  async validateOAuthLogin(
    oauthUid: string,
    oauthPlatform: 'naver' | 'github' | 'google',
    profileData: any,
  ): Promise<string> {
    let user = await this.usersService.findByOAuthUid(oauthUid, oauthPlatform);

    if (!user) {
      user = await this.usersService.createUser({
        oauthUid,
        oauthPlatform,
        nickname: profileData.nickname || profileData.username || profileData.displayName,
        profileImage: profileData.profileImage || profileData.picture || null,
      });
    }

    // JWT 생성
    const payload = { sub: user.id, platform: user.oauthPlatform };
    return this.jwtService.sign(payload);
  }
}
