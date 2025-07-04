// storage/temp/temp-storage.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { createReadStream, promises as fs } from 'fs';

@Injectable()
export class TempStorageService {
  private readonly logger = new Logger(TempStorageService.name);
  private readonly tempDir = process.env.TEMP_DIR || './temp';

  async onModuleInit() {
    // Ensure temp directory exists
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
      this.logger.log(`Temp directory ready: ${this.tempDir}`);
    } catch (error) {
      this.logger.error(`Failed to create temp directory: ${error.message}`);
    }
  }

  createReadStream(tempFilePath: string): NodeJS.ReadableStream {
    return createReadStream(tempFilePath);
  }

  async deleteTempFile(tempFilePath: string): Promise<void> {
    try {
      await fs.unlink(tempFilePath);
      this.logger.log(`Temp file deleted: ${tempFilePath}`);
    } catch (error) {
      this.logger.warn(
        `Failed to delete temp file: ${tempFilePath}, ${error.message}`,
      );
    }
  }

  async getTempFileStats(tempFilePath: string) {
    try {
      return await fs.stat(tempFilePath);
    } catch {
      throw new Error(`Temp file not found: ${tempFilePath}`);
    }
  }
}
