// config/rabbitmq.config.ts
import { RmqOptions, Transport } from '@nestjs/microservices';

export const getRabbitMQConfig = (): RmqOptions => ({
  transport: Transport.RMQ,
  options: {
    urls: [
      process.env.RABBITMQ_URL || 'amqp://admin:password123@localhost:5672',
    ],
    queue: RABBITMQ_CONFIG.UPLOAD_QUEUE,
    queueOptions: {
      durable: true, // Queue survives RabbitMQ restarts
    },
    socketOptions: {
      heartbeatIntervalInSeconds: 60,
      reconnectTimeInSeconds: 5,
    },
  },
});

export const RABBITMQ_CONFIG = {
  UPLOAD_QUEUE: 'upload_queue',
  UPLOAD_TOPIC: 'file.upload',
};
