import { Strategy } from 'passport-custom';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class LicoStrategy extends PassportStrategy(Strategy, 'lico') {
  async validate(req: Request, done: Function) {
    try {
      const oauthUid = crypto.randomBytes(16).toString('hex');

      const userData = {
        oauthUid,
        provider: 'lico' as 'lico',
        nickname: `User_${oauthUid.substring(0, 8)}`,
        profileImage: null,
        email: null,
      };

      done(null, userData);
    } catch (error) {
      done(error, false);
    }
  }
}
