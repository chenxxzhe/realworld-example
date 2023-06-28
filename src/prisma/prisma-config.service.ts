import {
  BadRequestException,
  Inject,
  Injectable,
  LoggerService,
} from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'
import { PrismaOptionsFactory, PrismaServiceOptions } from 'nestjs-prisma'

@Injectable()
export class PrismaConfigService implements PrismaOptionsFactory {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private logger: LoggerService,
  ) {}

  createPrismaOptions(): PrismaServiceOptions | Promise<PrismaServiceOptions> {
    const loggingMiddleware = (): Prisma.Middleware => {
      return async (params, next) => {
        const before = Date.now()

        let result
        try {
          result = await next(params)
        } catch (e) {
          throw new BadRequestException({
            name: e.name,
            code: e.code,
            message: e.message,
          })
        }

        const after = Date.now()
        const time = after - before
        this.logger.log(
          `${params.model}.${params.action} - ${time}ms`,
          'PrismaQuery',
        )

        return result
      }
    }

    return {
      middlewares: [loggingMiddleware()],
    }
  }
}
