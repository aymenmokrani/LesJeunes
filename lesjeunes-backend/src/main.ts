import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    const port = process.env.PORT ?? 4000;
    const app = await NestFactory.create(AppModule);
    await app.listen(port);
    console.log(`🚀 Server started listening on port ${port}`);
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1); // ← App terminates
  }
}
bootstrap();
