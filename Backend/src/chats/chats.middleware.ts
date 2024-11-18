// socket-user.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { UsersService } from 'src/users/users.service';
import * as crypto from 'crypto';

@Injectable()
export class ChatsMiddleware implements NestMiddleware {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async use(socket: Socket, next: (err?: Error) => void) {
    try {
      const token = socket.handshake.auth?.token;

      if (token) {
        // 토큰이 있는 경우
        const payload = this.jwtService.verify(token);
        const { id } = payload.sub;
        const user = await this.usersService.findById(id);

        if (user) {
          socket.data.user = user;
        }
      }

      if (!socket.data.user) {
        socket.data.user = { id: crypto.createHash('sha256').update(socket.handshake.address).digest('hex') };
      }
    } catch (error) {
      // 토큰 검증 실패 등의 경우
      socket.data.user = { id: crypto.createHash('sha256').update(socket.handshake.address).digest('hex') };
    }
    next();
  }
}
