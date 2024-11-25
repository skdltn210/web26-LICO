import * as winston from 'winston';

export const winstonConfig: winston.LoggerOptions = {
  level: 'error', // 'error' 레벨 이상의 로그만 출력
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message, stack }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message} ${
        stack ? '\n' + stack : ''
      }`;
    }),
  ),
  transports: [
    new winston.transports.Console(),
  ],
};