import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { UserEntity } from '../../users/entity/user.entity';

@Injectable()
export class WebSocketStrategy extends PassportStrategy(Strategy, 'websocket') {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any): Promise<UserEntity | { id: number }> {
    const { id, provider } = payload.sub;

    const user = await this.usersService.findById(id);

    if (user && user.oauthPlatform === provider) {
      return user; // req.user에 사용자 정보 첨부
    }
    return { id: -1 };
  }
}
