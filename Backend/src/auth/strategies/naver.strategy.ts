import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-naver';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NaverStrategy extends PassportStrategy(Strategy, 'naver') {
  constructor(configService: ConfigService) {
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
    const { id, emails, displayName, _json } = profile;
    const user = {
      provider: 'naver',
      userId: id,
      email: emails[0],
      nickname: _json.nickname,
      profileImage: _json.profile_image,
      accessToken,
    };
    done(null, user);
  }
}