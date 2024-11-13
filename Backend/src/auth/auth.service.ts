import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';

type OAuthPlatform = 'google' | 'github' | 'naver'; // platform 타입 정의 추가

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private configService: ConfigService,
  ) {}

  async validateOAuthLogin(
    oauthUid: string,
    oauthPlatform: 'google',
    profileData: {
      nickname: string;
      profileImage?: string;
      email: string;
    },
  ) {
    let user = await this.usersService.findByOAuthUid(oauthUid, oauthPlatform);

    if (!user) {
      user = await this.usersService.createUser({
        oauthUid,
        oauthPlatform,
        nickname: profileData.nickname,
        profileImage: profileData.profileImage,
      });
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync({ sub: user.id }, { expiresIn: '1h' }),
      this.jwtService.signAsync({ sub: user.id, type: 'refresh' }, { expiresIn: '7d' }),
    ]);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        nickname: user.nickname,
        email: profileData.email,
        profileImage: user.profileImage,
      },
    };
  }
}
