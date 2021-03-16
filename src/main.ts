import { NestFactory } from '@nestjs/core';
import { LogLevel } from '@nestjs/common';
import { AppModule } from './modules/app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: [
      'error',
      'warn',
      'log',
      ...((process.env.NODE_ENV !== 'production' ? ['debug', 'verbose'] : []) as LogLevel[]),
    ],
  });
  app.enableCors({});
  app.setGlobalPrefix('api');
  await app.listen(process.env.PORT || 5000);
}

bootstrap();
