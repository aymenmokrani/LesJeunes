// storage/providers/local-storage.service.ts - Local Disk Storage Implementation
import { Injectable, Logger } from '@nestjs/common';
import { StorageProvider } from '@/modules/storage/interfaces/storage.interface';
import * as fs from 'fs/promises';
import * as path from 'path';
import { createWriteStream, existsSync } from 'fs';
import { pipeline } from 'stream/promises';

@Injectable()
export class LocalStorageService implements StorageProvider {
  private readonly logger = new Logger(LocalStorageService.name);
  private readonly baseStoragePath: string;

  constructor() {
    // Set storage directory (configurable via environment)
    this.baseStoragePath = process.env.STORAGE_PATH || './uploads';
    this.ensureStorageDirectory();
  }

  async upload(file: Buffer, storagePath: string): Promise<string> {
    const fullPath = path.join(this.baseStoragePath, storagePath);
    const directory = path.dirname(fullPath);

    try {
      // Ensure directory exists
      await fs.mkdir(directory, { recursive: true });

      // Write file to disk
      await fs.writeFile(fullPath, file);

      this.logger.log(`File uploaded successfully: ${storagePath}`);
      return storagePath;
    } catch (error) {
      this.logger.error(`Failed to upload file: ${storagePath}`, error);
      throw new Error(`Upload failed: ${error.message}`);
    }
  }

  async uploadStream(
    stream: import('stream').Readable,
    storagePath: string,
  ): Promise<string> {
    const fullPath = path.join(this.baseStoragePath, storagePath);
    const directory = path.dirname(fullPath);

    try {
      // Ensure directory exists
      await fs.mkdir(directory, { recursive: true });

      // Create write stream and pipe the readable stream to it
      const writeStream = createWriteStream(fullPath);
      await pipeline(stream, writeStream);

      this.logger.log(`File stream uploaded successfully: ${storagePath}`);
      return storagePath;
    } catch (error) {
      this.logger.error(`Failed to upload file stream: ${storagePath}`, error);
      throw new Error(`Stream upload failed: ${error.message}`);
    }
  }

  async download(storagePath: string): Promise<Buffer> {
    const fullPath = path.join(this.baseStoragePath, storagePath);

    try {
      const fileBuffer = await fs.readFile(fullPath);
      this.logger.log(`File downloaded successfully: ${storagePath}`);
      return fileBuffer;
    } catch (error) {
      this.logger.error(`Failed to download file: ${storagePath}`, error);
      throw new Error(`Download failed: ${error.message}`);
    }
  }

  async delete(storagePath: string): Promise<void> {
    const fullPath = path.join(this.baseStoragePath, storagePath);

    try {
      await fs.unlink(fullPath);
      this.logger.log(`File deleted successfully: ${storagePath}`);

      // Clean up empty directories
      await this.cleanupEmptyDirectories(path.dirname(fullPath));
    } catch (error) {
      this.logger.error(`Failed to delete file: ${storagePath}`, error);
      throw new Error(`Delete failed: ${error.message}`);
    }
  }

  async exists(storagePath: string): Promise<boolean> {
    const fullPath = path.join(this.baseStoragePath, storagePath);

    try {
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  async getSize(storagePath: string): Promise<number> {
    const fullPath = path.join(this.baseStoragePath, storagePath);

    try {
      const stats = await fs.stat(fullPath);
      return stats.size;
    } catch (error) {
      this.logger.error(`Failed to get file size: ${storagePath}`, error);
      throw new Error(`Get size failed: ${error.message}`);
    }
  }

  async getMetadata(storagePath: string): Promise<{
    size: number;
    lastModified: Date;
    contentType?: string;
  }> {
    const fullPath = path.join(this.baseStoragePath, storagePath);

    try {
      const stats = await fs.stat(fullPath);
      return {
        size: stats.size,
        lastModified: stats.mtime,
        contentType: this.getContentType(storagePath),
      };
    } catch (error) {
      this.logger.error(`Failed to get metadata: ${storagePath}`, error);
      throw new Error(`Get metadata failed: ${error.message}`);
    }
  }

  async getPublicUrl(storagePath: string): Promise<string | null> {
    // For local storage, return a URL that serves files through your API
    const baseUrl = process.env.BASE_URL || 'http://localhost:4000';
    return `${baseUrl}/files/serve/${encodeURIComponent(storagePath)}`;
  }

  // Helper methods
  private async ensureStorageDirectory(): Promise<void> {
    if (!existsSync(this.baseStoragePath)) {
      await fs.mkdir(this.baseStoragePath, { recursive: true });
      this.logger.log(`Created storage directory: ${this.baseStoragePath}`);
    }
  }

  private async cleanupEmptyDirectories(dirPath: string): Promise<void> {
    try {
      // Don't delete the base storage directory
      if (dirPath === this.baseStoragePath) return;

      const files = await fs.readdir(dirPath);
      if (files.length === 0) {
        await fs.rmdir(dirPath);
        this.logger.log(`Removed empty directory: ${dirPath}`);

        // Recursively clean parent directories
        await this.cleanupEmptyDirectories(path.dirname(dirPath));
      }
    } catch {
      // Directory not empty or other error - ignore
    }
  }

  private getContentType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx':
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.txt': 'text/plain',
      '.zip': 'application/zip',
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }
}
