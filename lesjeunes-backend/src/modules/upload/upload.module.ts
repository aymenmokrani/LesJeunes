// upload/upload.module.ts - Upload Feature Module
import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { FileValidationInterceptor } from './interceptors/file-validation.interceptor';
import { StorageModule } from '@/modules/storage/storage.module';
import { FilesModule } from '@/modules/files/files.module';
import { UsersModule } from '@/modules/users/users.module';
import * as fs from 'fs';
import { QueueModule } from '@/modules/queue/queue.module';

@Module({
  imports: [
    // Configure Multer for file uploads
    MulterModule.registerAsync({
      useFactory: () => {
        // Ensure temp-uploads directory exists
        const tempUploadsDir = './temp-uploads';
        if (!fs.existsSync(tempUploadsDir)) {
          fs.mkdirSync(tempUploadsDir, { recursive: true });
        }

        return {
          dest: tempUploadsDir,
          limits: {
            fileSize: parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024, // 50MB
            files: parseInt(process.env.MAX_FILES_PER_UPLOAD) || 10,
          },
        };
      },
    }),

    // Import required modules
    StorageModule, // For file storage operations
    FilesModule, // For file metadata management
    UsersModule, // For user storage quota management
    QueueModule,
  ],

  controllers: [UploadController], // HTTP upload endpoints

  providers: [
    UploadService, // Upload processing business logic
    FileValidationInterceptor, // File validation interceptor
  ],

  exports: [
    UploadService, // Make upload service available to other modules
  ],
})
export class UploadModule {}
