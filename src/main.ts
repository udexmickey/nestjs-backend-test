import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });
  app.useBodyParser('json', { limit: '10mb' });
  // ✅ Ensure validation errors return correct HTTP responses
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  // ✅ Global Exception Filter for proper error formatting
  app.useGlobalFilters(new AllExceptionsFilter());

  // ✅ Check if running in Docker environment or running locally
  const isDocker = process.env.DOCKER_ENV === 'true';

  // Start the Express server
  const PORT = process.env.PORT ?? 3000;

  await app.listen(PORT, () => {
    console.log(
      `🚀 App Running On: ${isDocker ? 'Docker 🐳' : 'Local Machine 💻'}`,
    );
    console.log(`Server is running on port ${PORT}`);
  });
}
bootstrap();
