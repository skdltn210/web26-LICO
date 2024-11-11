import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-naver';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class NaverStrategy extends PassportStrategy(Strategy, 'naver') {
  constructor(
    configService: ConfigService,
    private authService: AuthService
  ) {
    super({
      clientID: configService.get<string>('NAVER_CLIENT_ID'),
      clientSecret: configService.get<string>('NAVER_CLIENT_SECRET'),
      callbackURL: 'http://localhost:3000/auth/naver/callback',
      svcType: 0, // optional, 0 for PC web
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: Function,
  ): Promise<any> {
    try {
      console.log('Naver Profile:', profile);
      const { id, emails, displayName, _json } = profile;
      const user = {
        provider: 'naver' as 'naver',
        userId: id,
        email: emails[0].value, // 이메일 구조에 따라 수정 필요
        username: displayName || _json.nickname,
        profileImage: _json.profile_image,
      };

      // AuthService를 통해 사용자 검증 및 JWT 생성
      const jwt = await this.authService.validateOAuthLogin(
        user.userId,
        user.provider,
        {
          username: user.username,
          email: user.email,
          profileImage: user.profileImage,
        },
      );

      done(null, { jwt });
    } catch (err) {
      done(err, false);
    }
  }
}