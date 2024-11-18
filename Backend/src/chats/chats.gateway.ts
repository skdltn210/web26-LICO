import { InjectRedis } from '@nestjs-modules/ioredis';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import Redis from 'ioredis';
import { Server, Socket } from 'socket.io';
import { UsersService } from 'src/users/users.service';
import { ChatsMiddleware } from './chats.middleware';
import { UUID } from 'crypto';

@WebSocketGateway({ namespace: '/chats' })
export class ChatsGateway implements OnGatewayInit, OnGatewayDisconnect, OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(
    @InjectRedis() private redisClient: Redis,
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async afterInit(server: Server) {
    const middleware = new ChatsMiddleware(this.jwtService, this.usersService);

    server.use((socket: Socket, next) => {
      middleware.use(socket, next);
    });
  }

  @SubscribeMessage('join')
  async joinChatRoom(@ConnectedSocket() socket: Socket, @MessageBody('channelId') channelId: UUID) {
    socket.join(channelId);
    socket.data.channelId = channelId;

    this.redisClient.hincrby(`${channelId}:viewers`, socket.data.user.id, 1);

    const oldChats = await this.redisClient.lrange(`${channelId}:chats`, 0, -1);
    socket.emit('chat', oldChats);
  }

  @SubscribeMessage('chat')
  async publishChat(@ConnectedSocket() socket: Socket, @MessageBody() receivedChat: { message }) {
    const { user, channelId } = socket.data;

    // if (user instanceof UserEntity) {
    const newChat = {
      content: receivedChat,
      nickname: user.nickname || '홍길동',
      userId: user.id || -1,
      timestamp: new Date(),
    };

    const redisKey = `${channelId}:chats`;

    this.server.to(channelId).emit('chat', [newChat]);
    this.redisClient.rpush(redisKey, JSON.stringify(newChat));
    this.redisClient.ltrim(redisKey, -50, -1);
    // }
  }

  async handleConnection(socket: Socket) {
    const { user, channelId } = socket.data;
    const redisKey = `${channelId}:viewers`;

    if (channelId) {
      // channelId가 있다면 채팅방 입장한 상태에서 재연결 된 것
      this.redisClient.hincrby(redisKey, user.id, 1);
    }
  }

  async handleDisconnect(socket: Socket) {
    const { user, channelId } = socket.data;
    const redisKey = `${channelId}:viewers`;

    await this.redisClient.hincrby(redisKey, user.id, -1);
    const count = await this.redisClient.hget(redisKey, user.id);

    if (parseInt(count) <= 0) {
      this.redisClient.hdel(redisKey, user.id);
    }
  }
}
