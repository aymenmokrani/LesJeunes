// files.module.ts - Files Feature Module
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { FilesRepository } from './files.repository';
import { File } from './entities/file.entity';
import { Folder } from './entities/folder.entity';
import { StorageModule } from '@/modules/storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([File, Folder]),
    StorageModule, // Register entities for this module
  ],
  controllers: [FilesController], // HTTP endpoints
  providers: [
    FilesService, // Business logic
    FilesRepository, // Database operations
  ],
  exports: [FilesService, FilesRepository], // Make available to other modules
})
export class FilesModule {}
