import { Module } from '@nestjs/common'
import * as winston from 'winston'
import { WinstonModule, utilities } from 'nest-winston'
import 'winston-daily-rotate-file'
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core'
import { LoggerInterceptor } from './logger.interceptor'
import { LoggerExceptionFilter } from './logger.filter'

@Module({
  imports: [
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            utilities.format.nestLike('Logger', {
              colors: true,
            }),
          ),
        }),
        new winston.transports.DailyRotateFile({
          level: 'error',
          filename: 'error-%DATE%.log',
          dirname: 'logs',
          maxSize: '10m',
          maxFiles: '14d',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.errors({ stack: true, cause: true }),
            winston.format.printf((info) => {
              return `${info.timestamp} ${info.cause || ''}: ${info.stack}`
            }),
          ),
        }),
        new winston.transports.DailyRotateFile({
          level: 'info',
          filename: 'info-%DATE%.log',
          dirname: 'logs',
          maxSize: '10m',
          maxFiles: '14d',
          zippedArchive: true,
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.printf((info) => {
              return `${info.timestamp} ${info.level} ${info.message}`
            }),
          ),
        }),
      ],
    }),
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggerInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: LoggerExceptionFilter,
    },
  ],
})
export class LoggerModule {}
