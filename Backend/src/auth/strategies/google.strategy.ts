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
      callbackURL: configService.get<string>('GOOGLE_REDIRECT_URI'), // http://localhost:3000/auth/google/callback
      scope: ['email', 'profile', 'openid'],
      passReqToCallback: true, // 이 옵션 추가
    });
  }

  async validate(
    request: any,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      console.log('Access Token:', accessToken); // 토큰 확인용 로그

      const userData = {
        oauthUid: profile.id,
        provider: 'google' as const,
        nickname: profile.displayName || profile.emails[0].value.split('@')[0],
        profileImage: profile.photos?.[0]?.value || null,
        email: profile.emails[0].value,
      };

      done(null, userData);
    } catch (err) {
      console.error('Google Strategy Error:', err);
      done(err, false);
    }
  }
}
