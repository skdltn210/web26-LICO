import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-github2';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('GITHUB_CLIENT_ID'),
      clientSecret: configService.get<string>('GITHUB_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GITHUB_REDIRECT_URI'),
      scope: ['read:user', 'user:email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile, done: Function) {
    try {
      const { id: oauthUid, username, displayName, photos, emails } = profile;

      // GitHub 사용자 데이터 구성
      const userData = {
        oauthUid,
        provider: 'github' as 'github',
        nickname: displayName || username || `User${oauthUid.substring(0, 8)}`,
        profileImage: photos?.[0]?.value || null,
        email: emails?.[0]?.value || null,
      };

      done(null, userData);
    } catch (error) {
      done(error, false);
    }
  }
}
