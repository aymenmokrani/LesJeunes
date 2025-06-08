// storage/storage.service.ts - Storage Orchestration Service
import { Injectable, Logger } from '@nestjs/common';
import { StorageProvider } from '@/modules/storage/interfaces/storage.interface';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);

  constructor(private readonly provider: StorageProvider) {
    this.logger.log(
      `Using storage provider: ${this.provider.constructor.name}`,
    );
  }

  // Public API methods that delegate to the active provider
  async uploadFile(file: Buffer, storagePath: string): Promise<string> {
    this.logger.log(`Uploading file: ${storagePath}`);
    return this.provider.upload(file, storagePath);
  }

  async downloadFile(storagePath: string): Promise<Buffer> {
    this.logger.log(`Downloading file: ${storagePath}`);
    return this.provider.download(storagePath);
  }

  async deleteFile(storagePath: string): Promise<void> {
    this.logger.log(`Deleting file: ${storagePath}`);
    return this.provider.delete(storagePath);
  }

  async fileExists(storagePath: string): Promise<boolean> {
    return this.provider.exists(storagePath);
  }

  async getFileSize(storagePath: string): Promise<number> {
    return this.provider.getSize(storagePath);
  }

  async getFileMetadata(storagePath: string): Promise<{
    size: number;
    lastModified: Date;
    contentType?: string;
  }> {
    return this.provider.getMetadata(storagePath);
  }

  async getPublicUrl(
    storagePath: string,
    expiresIn?: number,
  ): Promise<string | null> {
    if (this.provider.getPublicUrl) {
      return this.provider.getPublicUrl(storagePath, expiresIn);
    }
    return null;
  }

  // Helper method to generate unique storage paths
  generateStoragePath(
    userId: string,
    originalFileName: string,
    fileId?: string,
  ): string {
    const fileExtension = originalFileName.split('.').pop();
    const uniqueId = fileId || this.generateUniqueId();
    return `users/${userId}/files/${uniqueId}.${fileExtension}`;
  }

  generateThumbnailPath(originalStoragePath: string): string {
    const pathParts = originalStoragePath.split('/');
    const fileName = pathParts.pop();
    const nameWithoutExt = fileName.split('.')[0];
    const directory = pathParts.join('/');
    return `${directory}/thumbnails/${nameWithoutExt}_thumb.jpg`;
  }

  // Batch operations
  async uploadMultipleFiles(
    files: Array<{ buffer: Buffer; path: string }>,
  ): Promise<string[]> {
    this.logger.log(`Uploading ${files.length} files in batch`);

    const uploadPromises = files.map(({ buffer, path }) =>
      this.uploadFile(buffer, path),
    );

    return Promise.all(uploadPromises);
  }

  async deleteMultipleFiles(storagePaths: string[]): Promise<void> {
    this.logger.log(`Deleting ${storagePaths.length} files in batch`);

    const deletePromises = storagePaths.map((path) =>
      this.deleteFile(path).catch((error) => {
        this.logger.warn(`Failed to delete file ${path}: ${error.message}`);
      }),
    );

    await Promise.all(deletePromises);
  }

  // Get current storage provider info
  getProviderInfo(): {
    type: string;
    name: string;
  } {
    const storageType = process.env.STORAGE_TYPE || 'local';
    return {
      type: storageType,
      name: this.provider.constructor.name,
    };
  }

  // Helper method to generate unique IDs
  private generateUniqueId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
  }

  // Health check method
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    provider: string;
    details?: string;
  }> {
    try {
      // Test basic operations with a small test file
      const testPath = 'health-check/test.txt';
      const testBuffer = Buffer.from('health check test');

      await this.uploadFile(testBuffer, testPath);
      const exists = await this.fileExists(testPath);
      await this.deleteFile(testPath);

      return {
        status: exists ? 'healthy' : 'unhealthy',
        provider: this.provider.constructor.name,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        provider: this.provider.constructor.name,
        details: error.message,
      };
    }
  }
}
