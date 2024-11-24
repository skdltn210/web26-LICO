import { InjectRedis } from '@nestjs-modules/ioredis';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import Redis from 'ioredis';
import { Server, Socket } from 'socket.io';
import * as crypto from 'crypto';
import { UUID } from 'crypto';
import { plainToInstance } from 'class-transformer';
import { ChatDto } from './dto/chat.dto';

@WebSocketGateway()
export class ChatsGateway implements OnGatewayDisconnect, OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  private readonly OLD_CHATS_MAXIMUM_SIZE = 50;

  constructor(@InjectRedis() private redisClient: Redis) {
    const subscriber = this.redisClient.duplicate();
    subscriber.psubscribe('*:chat');
    subscriber.on('pmessage', async (pattern, channel, message) => {
      if (pattern === '*:chat') {
        const channelId = channel.slice(0, -5) as UUID;
        const chat = plainToInstance(ChatDto, message);
        this.emitChat({ channelId, chat });
      }
    });
  }

  async handleConnection(socket: Socket) {
    socket.data.hash = crypto.createHash('sha256').update(socket.handshake.address).digest('hex');
  }

  @SubscribeMessage('join')
  async joinChatRoom(@ConnectedSocket() socket: Socket, @MessageBody('channelId') channelId: UUID) {
    socket.join(channelId);
    socket.data.channelId = channelId;

    const results = await this.redisClient
      .multi()
      .hincrby(`${channelId}:viewers`, socket.data.hash, 1)
      .lrange(`${channelId}:chats`, -this.OLD_CHATS_MAXIMUM_SIZE, -1)
      .exec();

    socket.emit('chat', results[1]);
  }

  async handleDisconnect(socket: Socket) {
    const { hash, channelId } = socket.data;
    const redisKey = `${channelId}:viewers`;

    // 사용자 제거
    const results = await this.redisClient.multi().hincrby(redisKey, hash, -1).hget(redisKey, hash).exec();

    if (typeof results[1][1] === 'string' && parseInt(results[1][1]) <= 0) {
      this.redisClient.hdel(redisKey, hash);
    }
  }

  async emitChat({ channelId, chat }) {
    this.server.to(channelId).emit('chat', [chat]);
  }
}
