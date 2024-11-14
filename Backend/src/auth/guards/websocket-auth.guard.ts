import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Socket } from 'socket.io';

@Injectable()
export class WebSocketAuthGuard extends AuthGuard('websocket') {
  getRequest(context: ExecutionContext) {
    const client: Socket = context.switchToWs().getClient<Socket>();

    const token = client.handshake.auth?.token;

    client.handshake.headers.authorization = `Bearer ${token}`;
    return client.handshake;
  }
}
