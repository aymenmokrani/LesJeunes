import { Module, Provider } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StorageProvider } from './interfaces/storage.interface';
import { LocalStorageService } from './providers/local-storage.service';
import { MinioStorageService } from './providers/minio-storage.service';
import { StorageFactory } from './storage.factory';
import { StorageService } from '@/modules/storage/storage.service';

// Token for dependency injection
export const STORAGE_PROVIDER_TOKEN = 'STORAGE_PROVIDER';

const storageProviderFactory: Provider = {
  provide: STORAGE_PROVIDER_TOKEN,
  useFactory: (storageFactory: StorageFactory): StorageProvider => {
    return storageFactory.getStorageProvider();
  },
  inject: [StorageFactory],
};

// StorageService factory
const storageServiceFactory: Provider = {
  provide: StorageService,
  useFactory: (storageProvider: StorageProvider): StorageService => {
    return new StorageService(storageProvider);
  },
  inject: [STORAGE_PROVIDER_TOKEN],
};

@Module({
  imports: [ConfigModule],
  providers: [
    LocalStorageService,
    MinioStorageService,
    StorageFactory,
    storageProviderFactory,
    storageServiceFactory,
  ],
  exports: [STORAGE_PROVIDER_TOKEN, StorageService],
})
export class StorageModule {}
