// storage/storage.module.ts - Storage Infrastructure Module
import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { LocalStorageService } from '@/modules/storage/providers/local-storage.service';
@Module({
  providers: [
    StorageService, // Main storage orchestration service
    LocalStorageService, // Local disk storage provider
  ],
  exports: [
    StorageService, // Export main service for other modules to use
  ],
})
export class StorageModule {}
