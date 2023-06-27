import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  LoggerService,
  Inject,
} from '@nestjs/common'
import { Request, Response } from 'express'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'
import { handleLogger } from './handle-logger'

@Catch(HttpException)
export class LoggerExceptionFilter implements ExceptionFilter {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    // const request = ctx.getRequest<Request>()
    const status = exception.getStatus()

    response.status(status).json({
      message: exception.message,
      statusCode: status,
    })

    handleLogger(ctx, this.logger)
  }
}
