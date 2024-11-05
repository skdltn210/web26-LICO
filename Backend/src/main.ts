import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

    // ConfigService 가져오기
    const configService = app.get(ConfigService);
  
    // PORT 설정
    const port = configService.get<number>('PORT') || 3000;

  await app.listen(port);
  console.log(`lico is running on: ${await app.getUrl()}`);
}
bootstrap();
