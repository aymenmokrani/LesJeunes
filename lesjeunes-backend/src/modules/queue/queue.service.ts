// queue/services/queue.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory } from '@nestjs/microservices';
import { getRabbitMQConfig, RABBITMQ_CONFIG } from '@/config/rabbitmq.config';
import { UploadJob } from './job.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);
  private client: ClientProxy;

  constructor() {
    this.client = ClientProxyFactory.create(getRabbitMQConfig());
  }

  async onModuleInit() {
    await this.client.connect();
    this.logger.log('Connected to RabbitMQ');
  }

  async onModuleDestroy() {
    await this.client.close();
    this.logger.log('Disconnected from RabbitMQ');
  }

  async addUploadJob(jobData: Omit<UploadJob, 'jobId'>): Promise<string> {
    const jobId = uuidv4();
    const job: UploadJob = {
      jobId,
      ...jobData,
    };

    try {
      this.client.emit(RABBITMQ_CONFIG.UPLOAD_TOPIC, job);
      this.logger.log(`Upload job queued: ${jobId}`);
      return jobId;
    } catch (error) {
      this.logger.error(`Failed to queue upload job: ${error.message}`);
      throw new Error('Failed to queue upload job');
    }
  }
}
