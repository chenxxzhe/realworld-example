import { HttpAdapterHost, NestFactory, Reflector } from '@nestjs/core'
import { AppModule } from './app.module'
import { PrismaService } from 'nestjs-prisma'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { ValidationPipe } from '@nestjs/common'
import helmet from 'helmet'
import { ConfigService } from '@nestjs/config'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // =========================== APP Setting ==============================
  const config = app.get(ConfigService)
  const port = config.get<number>('PORT', 3000)

  app.use(helmet())
  app.setGlobalPrefix('/api')
  // app.useGlobalGuards(new JwtAuthGuard(app.get(Reflector)))
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      // disableErrorMessages: true,
    }),
  )
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER))

  // =========================== Prisma ==============================
  const ps = app.get(PrismaService)
  await ps.enableShutdownHooks(app)

  // =========================== Swagger ==============================
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Real World API')
    .setVersion('0.1.0')
    .build()
  const doc = SwaggerModule.createDocument(app, swaggerConfig)
  SwaggerModule.setup('api-doc', app, doc)

  // =========================== Start ==============================

  await app.listen(port)
  console.log(`Nest APP running at ${port}`)
}
bootstrap()
