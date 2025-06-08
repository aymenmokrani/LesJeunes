// worker.module.ts
import { Module } from '@nestjs/common';
import { UploadWorker } from './modules/upload/upload.worker';
import { StorageModule } from './modules/storage/storage.module';
import { TempStorageService } from './modules/storage/providers/temp-storage.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot(), StorageModule],
  controllers: [UploadWorker],
  providers: [TempStorageService],
})
export class WorkerModule {}
