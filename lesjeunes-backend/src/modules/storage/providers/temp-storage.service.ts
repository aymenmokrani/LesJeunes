// storage/temp/temp-storage.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { createWriteStream, createReadStream, promises as fs } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { pipeline } from 'stream/promises';

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

  async streamToTempFile(fileStream: NodeJS.ReadableStream): Promise<string> {
    const tempFileName = `${uuidv4()}.tmp`;
    const tempFilePath = join(this.tempDir, tempFileName);

    try {
      const writeStream = createWriteStream(tempFilePath);
      await pipeline(fileStream, writeStream);

      this.logger.log(`File streamed to temp storage: ${tempFilePath}`);
      return tempFilePath;
    } catch (error) {
      this.logger.error(
        `Failed to stream file to temp storage: ${error.message}`,
      );
      throw new Error('Failed to save file to temporary storage');
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
