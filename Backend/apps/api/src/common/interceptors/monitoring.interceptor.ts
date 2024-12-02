import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CloudInsightService } from '../services/cloud-insight.service';
import { Request, Response } from 'express';

@Injectable()
export class MonitoringInterceptor implements NestInterceptor {
  constructor(private readonly cloudInsightService: CloudInsightService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();

    const { method, originalUrl } = request;

    return next.handle().pipe(
      tap(() => {
        const response = ctx.getResponse<Response>();

        // 정상 응답 처리
        if (response.statusCode < 400) {
          const responseTime = Date.now() - request['startTime'];

          const data = {
            endpoint: originalUrl,
            method: method,
            status_code: response.statusCode,
            response_time: responseTime,
            request_count: 1,
            error_count: 0,
          };

          // 비동기로 데이터 전송
          this.cloudInsightService.sendData(data).catch((error) => {
            // 에러 핸들링은 서비스 내에서 수행
          });
        }
      }),
    );
  }
}
