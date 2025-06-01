// upload/upload.service.ts - Upload Processing Logic
import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { StorageService } from '@/storage/storage.service';
import { FilesService } from '@/files/files.service';
import { UsersService } from '@/modules/users/users.service';
import { User } from '@/modules/users/entities/user.entity';
import { File } from '@/files/entities/file.entity';
import { UploadFileDto } from '@/files/dto/upload-file.dto';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuid } from 'uuid';
import * as crypto from 'crypto';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(
    private readonly storageService: StorageService,
    private readonly filesService: FilesService,
    private readonly usersService: UsersService,
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

      // Read file buffer (if stored on disk) or use memory buffer
      const fileBuffer = file.buffer || (await fs.readFile(file.path));

      // Upload to storage provider
      const uploadedPath = await this.storageService.uploadFile(
        fileBuffer,
        storagePath,
      );

      // Create file record in database
      const fileRecord = await this.filesService.createFileRecord(
        {
          originalName: file.originalname,
          fileName: `${fileId}${path.extname(file.originalname)}`,
          mimeType: file.mimetype,
          size: file.size,
          storagePath: uploadedPath,
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

      // Clean up temporary file if it exists
      if (file.path) {
        await this.cleanupTempFile(file.path);
      }

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

  async replaceFile(
    fileId: number,
    newFile: Express.Multer.File,
    user: User,
  ): Promise<File> {
    this.logger.log(`Replacing file ${fileId} for user ${user.id}`);

    // Get existing file record
    const existingFile = await this.filesService.getFileById(fileId, user);

    // Check storage quota (difference between old and new file size)
    const sizeDifference = newFile.size - existingFile.size;
    if (sizeDifference > 0) {
      const hasSpace = await this.usersService.checkStorageSpace(
        user.id,
        sizeDifference,
      );
      if (!hasSpace) {
        throw new BadRequestException(
          'Insufficient storage space for file replacement',
        );
      }
    }

    try {
      // Delete old file from storage
      await this.storageService.deleteFile(existingFile.storagePath);

      // Upload new file to same path
      const fileBuffer = newFile.buffer || (await fs.readFile(newFile.path));
      await this.storageService.uploadFile(
        fileBuffer,
        existingFile.storagePath,
      );

      // Generate new file hash
      const fileHash = await this.generateFileHash(newFile);

      // Update file record
      const updatedFile = await this.filesService.updateFile(
        fileId,
        {
          originalName: newFile.originalname,
          mimeType: newFile.mimetype,
          size: newFile.size,
          fileHash,
        },
        user,
      );

      // Update user storage usage
      await this.usersService.updateStorageUsage(user.id, sizeDifference);

      // Clean up temporary file
      if (newFile.path) {
        await this.cleanupTempFile(newFile.path);
      }

      this.logger.log(`File replacement completed: ${fileId}`);
      return updatedFile;
    } catch (error) {
      if (newFile.path) {
        await this.cleanupTempFile(newFile.path);
      }
      throw error;
    }
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

  // Upload progress tracking (for large files)
  async getUploadProgress(uploadId: string): Promise<{
    uploadId: string;
    status: 'pending' | 'uploading' | 'completed' | 'failed';
    progress: number;
    fileName?: string;
    error?: string;
  }> {
    // Implementation would depend on your progress tracking mechanism
    // Could use Redis or database to store upload progress
    return {
      uploadId,
      status: 'completed',
      progress: 100,
    };
  }

  // Resume upload functionality (for large files)
  async resumeUpload(
    uploadId: string,
    file: Express.Multer.File,
    chunkIndex: number,
    totalChunks: number,
  ): Promise<{ completed: boolean; fileRecord?: File }> {
    // Implementation for resumable uploads
    // This would handle chunked uploads for large files
    this.logger.log(
      `Resuming upload ${uploadId}, chunk ${chunkIndex}/${totalChunks}`,
    );

    // Return completion status
    const completed = chunkIndex === totalChunks - 1;
    return { completed };
  }

  /*    // Duplicate file detection
    async checkForDuplicates(user: User, fileHash: string): Promise<File[]> {
        // Implementation to find files with same hash for deduplication
        // Would require adding a method to FilesService
        return [];
    }

    // Virus scanning integration placeholder
    private async scanFileForViruses(filePath: string): Promise<boolean> {
        // Integration with virus scanning service would go here
        // Return true if file is clean, false if infected
        return true;
    }*/
}
