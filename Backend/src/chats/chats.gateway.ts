import { InjectRedis } from '@nestjs-modules/ioredis';
import { UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import Redis from 'ioredis';
import { Server, Socket } from 'socket.io';
import { Handshake } from 'socket.io/dist/socket-types';
import { WebSocketAuthGuard } from 'src/auth/guards/websocket-auth.guard';
import { UserEntity } from 'src/users/entity/user.entity';

const NAMESPACE_REGEX = /^\/chats\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@WebSocketGateway({ namespace: NAMESPACE_REGEX })
export class ChatsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(@InjectRedis() private redisClient: Redis) {}

  @SubscribeMessage('chat')
  async publishChat(@ConnectedSocket() client: Socket, @MessageBody() receivedChat: string) {
    const handShake = client.handshake as Handshake & { user: UserEntity };
    const user = handShake.user;

    if (!user?.id) {
      client.emit('notify', JSON.stringify({ message: '채팅을 전송하려면 로그인 해야합니다.' }));
    } else {
      const namespace = client.nsp;
      const newChat = JSON.stringify({
        content: receivedChat,
        nickname: user.nickname,
        userId: user.id,
        timestamp: new Date(),
      });
      const redisKey = `${namespace.name}:chats`;

      namespace.emit('chat', newChat); // 해당 네임스페이스의 모든 클라이언트에게 메시지 전송
      this.redisClient.rpush(redisKey, newChat);
      this.redisClient.ltrim(redisKey, -50, -1); // TODO .env로 주입받기
    }
  }

  @UseGuards(WebSocketAuthGuard)
  async handleConnection(@ConnectedSocket() client: Socket) {
    const oldChats = await this.redisClient.lrange(`${client.nsp.name}:chats`, 0, -1);

    client.emit('chat', JSON.stringify({ oldChats, type: 'old' }));
  }
}
