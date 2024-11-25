import { NestFactory } from '@nestjs/core';
import { ChatsModule } from './chats.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(ChatsModule);

  const configService = app.get(ConfigService);

  app.enableCors({
    // CORS 설정
    origin: configService.get<string>('CORS')?.split(',') || '*',
    methods: ['GET'],
  });

  let port = configService.get<number>('CHATS_PORT') || 9000;
  const maxPort = configService.get<number>('CHATS_MAX_PORT') || 10000;

  while (port <= maxPort) {
    try {
      await app.listen(port);
      console.log(`chats is running on: ${await app.getUrl()}`);
      break; // 포트를 성공적으로 사용하면 루프 종료
    } catch (error) {
      if (error.code === 'EADDRINUSE') {
        console.warn(`Port ${port} is already in use. Trying next port...`);
        port++; // 포트 번호 증가
      } else {
        console.error('Failed to start the server:', error);
        process.exit(1); // 다른 오류 발생 시 종료
      }
    }
  }

  if (port > maxPort) {
    console.error('포트 범위를 확인해 주세요');
    process.exit(1);
  }
}
bootstrap();
