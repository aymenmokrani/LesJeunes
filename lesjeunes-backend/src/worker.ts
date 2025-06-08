// worker.ts
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { WorkerModule } from './worker.module';
import { getRabbitMQConfig } from './config/rabbitmq.config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('UploadWorker');

  try {
    const worker = await NestFactory.createMicroservice<MicroserviceOptions>(
      WorkerModule,
      getRabbitMQConfig(),
    );

    await worker.listen();
    logger.log('🚀 Upload worker is listening for jobs...');
  } catch (error) {
    logger.error('❌ Failed to start upload worker', error);
    process.exit(1);
  }
}

bootstrap();
