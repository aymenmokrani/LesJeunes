import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageProvider } from '@/modules/storage/interfaces/storage.interface';
import * as Minio from 'minio';

@Injectable()
export class MinioStorageService implements StorageProvider, OnModuleInit {
  private readonly logger = new Logger(MinioStorageService.name);
  private readonly minioClient: Minio.Client;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    this.bucketName = this.configService.get<string>(
      'MINIO_BUCKET_NAME',
      'uploads',
    );

    this.minioClient = new Minio.Client({
      endPoint: this.configService.get<string>('MINIO_ENDPOINT', 'localhost'),
      port: parseInt(this.configService.get<string>('MINIO_PORT', '9000')),
      useSSL:
        this.configService.get<string>('MINIO_USE_SSL', 'false') === 'true',
      accessKey: this.configService.get<string>('MINIO_ACCESS_KEY'),
      secretKey: this.configService.get<string>('MINIO_SECRET_KEY'),
    });
  }

  async onModuleInit() {
    await this.ensureBucketExists();
  }

  async upload(file: Buffer, storagePath: string): Promise<string> {
    try {
      await this.minioClient.putObject(this.bucketName, storagePath, file);
      this.logger.log(`File uploaded successfully to MinIO: ${storagePath}`);
      return storagePath;
    } catch (error) {
      this.logger.error(
        `Failed to upload file to MinIO: ${storagePath}`,
        error,
      );
      throw new Error(`MinIO upload failed: ${error.message}`);
    }
  }

  async uploadStream(
    stream: import('stream').Readable,
    path: string,
  ): Promise<string> {
    try {
      await this.minioClient.putObject(this.bucketName, path, stream);
      this.logger.log(`File stream uploaded successfully to MinIO: ${path}`);
      return path;
    } catch (error) {
      this.logger.error(
        `Failed to upload file stream to MinIO: ${path}`,
        error,
      );
      throw new Error(`MinIO stream upload failed: ${error.message}`);
    }
  }

  async download(storagePath: string): Promise<Buffer> {
    try {
      const stream = await this.minioClient.getObject(
        this.bucketName,
        storagePath,
      );
      const chunks: Uint8Array[] = [];

      return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
      });
    } catch (error) {
      this.logger.error(
        `Failed to download file from MinIO: ${storagePath}`,
        error,
      );
      throw new Error(`MinIO download failed: ${error.message}`);
    }
  }

  async delete(storagePath: string): Promise<void> {
    try {
      await this.minioClient.removeObject(this.bucketName, storagePath);
      this.logger.log(`File deleted successfully from MinIO: ${storagePath}`);
    } catch (error) {
      this.logger.error(
        `Failed to delete file from MinIO: ${storagePath}`,
        error,
      );
      throw new Error(`MinIO delete failed: ${error.message}`);
    }
  }

  async exists(storagePath: string): Promise<boolean> {
    try {
      await this.minioClient.statObject(this.bucketName, storagePath);
      return true;
    } catch (error) {
      if (error.code === 'NotFound') {
        return false;
      }
      throw error;
    }
  }

  async getSize(storagePath: string): Promise<number> {
    try {
      const stat = await this.minioClient.statObject(
        this.bucketName,
        storagePath,
      );
      return stat.size;
    } catch (error) {
      this.logger.error(
        `Failed to get file size from MinIO: ${storagePath}`,
        error,
      );
      throw new Error(`MinIO get size failed: ${error.message}`);
    }
  }

  async getMetadata(storagePath: string): Promise<{
    size: number;
    lastModified: Date;
    contentType?: string;
  }> {
    try {
      const stat = await this.minioClient.statObject(
        this.bucketName,
        storagePath,
      );
      return {
        size: stat.size,
        lastModified: stat.lastModified,
        contentType:
          stat.metaData?.['content-type'] || this.getContentType(storagePath),
      };
    } catch (error) {
      this.logger.error(
        `Failed to get metadata from MinIO: ${storagePath}`,
        error,
      );
      throw new Error(`MinIO get metadata failed: ${error.message}`);
    }
  }

  async getPublicUrl(
    storagePath: string,
    expiresIn: number = 7 * 24 * 60 * 60,
  ): Promise<string | null> {
    try {
      // Generate presigned URL (expires in specified seconds, default 7 days)
      const url = await this.minioClient.presignedGetObject(
        this.bucketName,
        storagePath,
        expiresIn,
      );
      return url;
    } catch (error) {
      this.logger.error(
        `Failed to generate public URL for MinIO: ${storagePath}`,
        error,
      );
      return null;
    }
  }

  // Helper methods
  private async ensureBucketExists(): Promise<void> {
    try {
      const bucketExists = await this.minioClient.bucketExists(this.bucketName);
      if (!bucketExists) {
        await this.minioClient.makeBucket(this.bucketName);
        this.logger.log(`Created MinIO bucket: ${this.bucketName}`);
      } else {
        this.logger.log(`MinIO bucket already exists: ${this.bucketName}`);
      }
    } catch (error) {
      // Handle the "bucket already exists" error specifically
      if (
        error.code === 'BucketAlreadyOwnedByYou' ||
        error.message.includes('already own it')
      ) {
        this.logger.log(`MinIO bucket already exists: ${this.bucketName}`);
        return; // This is fine, continue
      }
      this.logger.error(
        `Failed to ensure bucket exists: ${this.bucketName}`,
        error,
      );
      throw new Error(`MinIO bucket setup failed: ${error.message}`);
    }
  }

  private getContentType(filePath: string): string {
    const ext = filePath.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      txt: 'text/plain',
      zip: 'application/zip',
    };
    return mimeTypes[ext || ''] || 'application/octet-stream';
  }
}
