// worker.module.ts
import { Module } from '@nestjs/common';
import { UploadWorker } from './modules/upload/upload.worker';
import { StorageModule } from './modules/storage/storage.module';
import { TempStorageService } from './modules/storage/providers/temp-storage.service';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from '@/modules/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from '@/config/database.config';
import { FilesModule } from '@/modules/files/files.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      useFactory: databaseConfig,
    }),
    StorageModule,
    UsersModule,
    FilesModule,
  ],
  controllers: [UploadWorker],
  providers: [TempStorageService],
})
export class WorkerModule {}
