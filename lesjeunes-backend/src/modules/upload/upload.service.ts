// upload/upload.service.ts - Upload Processing Logic
import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { StorageService } from '@/modules/storage/storage.service';
import { FilesService } from '@/modules/files/files.service';
import { UsersService } from '@/modules/users/users.service';
import { User } from '@/modules/users/entities/user.entity';
import { File } from '@/modules/files/entities/file.entity';
import { UploadFileDto } from '@/modules/files/dto/upload-file.dto';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuid } from 'uuid';
import * as crypto from 'crypto';
import { TempStorageService } from '@/modules/storage/providers/temp-storage.service';
import { QueueService } from '@/modules/queue/queue.service';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(
    private readonly storageService: StorageService,
    private readonly filesService: FilesService,
    private readonly usersService: UsersService,
    private readonly tempStorageService: TempStorageService,
    private readonly queueService: QueueService,
  ) {}

  async uploadSingleFile(
    file: Express.Multer.File,
    uploadDto: UploadFileDto,
    user: User,
  ): Promise<File> {
    this.logger.log(
      `Processing upload for user ${user.id}: ${file.originalname}`,
    );

    try {
      // Check user storage quota
      const hasSpace = await this.usersService.checkStorageSpace(
        user.id,
        file.size,
      );
      if (!hasSpace) {
        throw new BadRequestException('Insufficient storage space');
      }

      // Generate file hash for deduplication
      const fileHash = await this.generateFileHash(file);

      // Generate unique storage path
      const fileId = uuid();
      const storagePath = this.storageService.generateStoragePath(
        user.id,
        file.originalname,
        fileId,
      );

      // Queue upload job instead of direct upload
      await this.queueService.addUploadJob({
        tempFilePath: file.path,
        storagePath,
      });

      // Create file record in database
      const fileRecord = await this.filesService.createFileRecord(
        {
          originalName: file.originalname,
          fileName: `${fileId}${path.extname(file.originalname)}`,
          mimeType: file.mimetype,
          size: file.size,
          storagePath: storagePath,
          storageProvider: this.storageService.getProviderInfo().type,
          fileHash,
          folder: uploadDto.folderId
            ? ({ id: uploadDto.folderId } as any)
            : null,
          visibility: uploadDto.visibility || 'private',
          tags: uploadDto.tags || [],
        },
        user,
      );

      // Update user storage usage
      await this.usersService.updateStorageUsage(user.id, file.size);

      this.logger.log(`Upload completed successfully: ${fileRecord.id}`);
      return fileRecord;
    } catch (error) {
      // Clean up temporary file on error
      if (file.path) {
        await this.cleanupTempFile(file.path);
      }

      this.logger.error(`Upload failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  async uploadMultipleFiles(
    files: Express.Multer.File[],
    uploadDto: UploadFileDto,
    user: User,
  ): Promise<File[]> {
    this.logger.log(
      `Processing ${files.length} files upload for user ${user.id}`,
    );

    // Calculate total size
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);

    // Check user storage quota for all files
    const hasSpace = await this.usersService.checkStorageSpace(
      user.id,
      totalSize,
    );
    if (!hasSpace) {
      throw new BadRequestException('Insufficient storage space for all files');
    }

    const uploadedFiles: File[] = [];
    const errors: string[] = [];

    // Process files sequentially to avoid overwhelming the system
    for (const file of files) {
      try {
        const uploadedFile = await this.uploadSingleFile(file, uploadDto, user);
        uploadedFiles.push(uploadedFile);
      } catch (error) {
        errors.push(`${file.originalname}: ${error.message}`);
        this.logger.error(`Failed to upload ${file.originalname}:`, error);
      }
    }

    // If some files failed, log the errors but return successful uploads
    if (errors.length > 0) {
      this.logger.warn(`Some files failed to upload: ${errors.join(', ')}`);
    }

    if (uploadedFiles.length === 0) {
      throw new BadRequestException('All file uploads failed');
    }

    return uploadedFiles;
  }

  // Helper methods
  private async generateFileHash(file: Express.Multer.File): Promise<string> {
    const fileBuffer = file.buffer || (await fs.readFile(file.path));
    return crypto.createHash('sha256').update(fileBuffer).digest('hex');
  }

  private async cleanupTempFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
      this.logger.log(`Cleaned up temporary file: ${filePath}`);
    } catch (error) {
      this.logger.warn(
        `Failed to cleanup temporary file ${filePath}: ${error.message}`,
      );
    }
  }
}
