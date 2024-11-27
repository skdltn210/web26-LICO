import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Inject,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();

    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const { method, originalUrl } = request;
    const headers = { ...request.headers };
    delete headers['authorization']; // Authorization 헤더 제외 - 보안상

    return next.handle().pipe(
      tap(() => {
        const statusCode = response.statusCode;
        const contentLength = response.get('content-length') || '0';

        this.logger.info(
          `${method} ${originalUrl} ${statusCode} ${contentLength} - ${
            Date.now() - now
          }ms`,
          { headers }, // 제외한 헤더를 로그에 포함
        );
      }),
    );
  }
}
