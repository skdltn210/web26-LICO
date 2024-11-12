import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-github2';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService
  ) {
    super({
      clientID: configService.get<string>('GITHUB_CLIENT_ID'),
      clientSecret: configService.get<string>('GITHUB_CLIENT_SECRET'),
      callbackURL: `${configService.get<string>('SERVER_URL')}/auth/github/callback`,
      scope: ['read:user'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: Function,
  ) {
    try {
      const { id: oauthUid, username, displayName, photos } = profile;
      const jwt = await this.authService.validateOAuthLogin(
        oauthUid,
        'github',
        {
          username,
          displayName,
          profileImage: photos[0]?.value,
        },
      );
      const user = { jwt };
      done(null, user);
    } catch (error) {
      done(error, false);
    }
  }
}
