import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-naver';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class NaverStrategy extends PassportStrategy(Strategy, 'naver') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('NAVER_CLIENT_ID'),
      clientSecret: configService.get<string>('NAVER_CLIENT_SECRET'),
      callbackURL: configService.get<string>('NAVER_REDIRECT_URI'),
      svcType: 0,
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: Function): Promise<any> {
    try {
      const { id: oauthUid, emails, displayName, _json } = profile;

      // Naver 사용자 데이터 구성
      const userData = {
        oauthUid,
        provider: 'naver' as 'naver',
        nickname: displayName || _json.nickname || `User${oauthUid.substring(0, 8)}`,
        profileImage: _json.profile_image || null,
        email: emails?.[0]?.value || null,
      };

      done(null, userData);
    } catch (err) {
      console.error('Naver Strategy Error:', err);
      done(err, false);
    }
  }
}
