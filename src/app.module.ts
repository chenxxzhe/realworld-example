import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { PrismaModule } from 'nestjs-prisma'
import { APP_GUARD } from '@nestjs/core'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ArticlesModule } from './articles/articles.module'
import { UserModule } from './user/user.module'
import { AuthModule } from './auth/auth.module'
import { LoggerModule } from './logger/logger.module'

@Module({
  imports: [
    LoggerModule,
    PrismaModule.forRoot({
      isGlobal: true,
    }),
    ArticlesModule,
    UserModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
    }),
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 60,
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // consumer.apply().forRoutes('*')
  }
}
