import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get<string>('CLIENT_URL') + '/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      const { id, emails, displayName, photos } = profile;
      const user = {
        provider: 'google' as 'google',
        userId: id,
        email: emails[0].value,
        username: displayName,
        profileImage: photos[0]?.value,
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