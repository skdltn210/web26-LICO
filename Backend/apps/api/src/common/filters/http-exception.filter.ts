import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { CloudInsightService } from '../services/cloud-insight.service';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly cloudInsightService: CloudInsightService, // 추가
  ) {}

  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : exception;

    this.logger.error(
      `HTTP Status: ${status} Error Message: ${JSON.stringify(message)}`,
    );

    // 요청 시작 시간을 가져오기 위해 미들웨어에서 설정한 startTime 사용
    const responseTime = Date.now() - (request['startTime'] || Date.now());

    // Cloud Insight로 전송할 데이터 구성
    const data = {
      endpoint: request.originalUrl,
      method: request.method,
      status_code: status,
      response_time: responseTime,
      request_count: 1,
      error_count: 1,
    };

    // 비동기로 데이터 전송
    await this.cloudInsightService.sendData(data).catch((error) => {
      // 에러 핸들링은 서비스 내에서 수행
    });

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}