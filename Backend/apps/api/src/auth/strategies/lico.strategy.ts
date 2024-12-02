import { Strategy } from 'passport-custom';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { adjectives, nouns } from './nickname-data'

@Injectable()
export class LicoStrategy extends PassportStrategy(Strategy, 'lico') {
  async validate(req: Request, done: Function) {
    try {
      const oauthUid = crypto.randomBytes(16).toString('hex');

      // 랜덤 닉네임 생성
      const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
      const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
      const nickname = `${randomAdjective} ${randomNoun}`;

      const userData = {
        oauthUid,
        provider: 'lico' as 'lico',
        nickname,
        profileImage: null,
        email: null,
      };

      done(null, userData);
    } catch (error) {
      done(error, false);
    }
  }
}