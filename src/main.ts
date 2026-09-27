import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module.js';
import { ValidationPipe } from '@nestjs/common';
import { getRequiredEnvVar } from './common/getRequiredEnvVar.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(getRequiredEnvVar('PORT'));
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
}
await bootstrap();
