import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  createJwt(user: any) {
    const payload = {
      provider: user.provider,
      userId: user.userId,
      username: user.username,
    };
    return this.jwtService.sign(payload);
  }
}
