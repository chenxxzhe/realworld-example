import { Module } from '@nestjs/common'
import { PrismaConfigService } from './prisma-config.service'
import { PrismaModule } from 'nestjs-prisma'

@Module({
  imports: [
    PrismaModule.forRootAsync({
      isGlobal: true,
      useClass: PrismaConfigService,
    }),
  ],
})
export class CustomPrismaModule {}
