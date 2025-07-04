// upload/upload.worker.ts
import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { RABBITMQ_CONFIG } from '@/config/rabbitmq.config';
import { UploadJob } from '@/modules/queue/job.interface';
import { StorageService } from '@/modules/storage/storage.service';
import { TempStorageService } from '@/modules/storage/providers/temp-storage.service';
import { UsersService } from '@/modules/users/users.service';
import { FilesService } from '@/modules/files/files.service';

@Controller()
export class UploadWorker {
  private readonly logger = new Logger(UploadWorker.name);

  constructor(
    private readonly storageService: StorageService,
    private readonly tempStorageService: TempStorageService,
    private readonly usersService: UsersService,
    private readonly filesService: FilesService,
  ) {}

  @EventPattern(RABBITMQ_CONFIG.UPLOAD_TOPIC)
  async handleUploadJob(@Payload() job: UploadJob) {
    this.logger.log(`Processing upload job: ${job.jobId}`);
    const { tempFilePath, file, user } = job;

    try {
      // Validate temp file exists
      await this.tempStorageService.getTempFileStats(tempFilePath);

      // Create read stream from temp file
      const fileStream = this.tempStorageService.createReadStream(tempFilePath);

      // Upload to storage (MinIO) using stream
      const uploadResult = await this.storageService.uploadFile(
        fileStream,
        file.storagePath,
      );

      // Update user storage usage
      await this.usersService.updateStorageUsage(job.user.id, job.file.size);

      // Update file status
      await this.filesService.updateFile(file.id, { status: 'present' }, user);

      // Clean up temp file
      await this.tempStorageService.deleteTempFile(tempFilePath);

      this.logger.log(`Upload job completed: ${job.jobId} -> ${uploadResult}`);

      return {
        jobId: job.jobId,
        status: 'completed',
        result: uploadResult,
      };
    } catch (error) {
      this.logger.error(`Upload job failed: ${job.jobId}`, error.stack);

      // Clean up temp file even on failure
      try {
        await this.tempStorageService.deleteTempFile(tempFilePath);
      } catch (cleanupError) {
        this.logger.warn(
          `Failed to cleanup temp file: ${tempFilePath}, ${cleanupError}`,
        );
      }

      throw error;
    }
  }
}
