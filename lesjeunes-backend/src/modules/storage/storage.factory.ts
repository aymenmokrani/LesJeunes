import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageProvider } from './interfaces/storage.interface';
import { LocalStorageService } from './providers/local-storage.service';
import { MinioStorageService } from './providers/minio-storage.service';

@Injectable()
export class StorageFactory {
  constructor(
    private readonly configService: ConfigService,
    private readonly localStorageService: LocalStorageService,
    private readonly minioStorageService: MinioStorageService,
  ) {}

  getStorageProvider(): StorageProvider {
    const provider = this.configService.get<string>(
      'STORAGE_PROVIDER',
      'local',
    );

    switch (provider.toLowerCase()) {
      case 'minio':
        return this.minioStorageService;
      case 'local':
      default:
        return this.localStorageService;
    }
  }
}
