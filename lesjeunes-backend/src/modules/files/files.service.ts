// files.service.ts - File Business Logic
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { FilesRepository } from './files.repository';
import { File } from './entities/file.entity';
import { Folder } from './entities/folder.entity';
import { User } from '@/modules/users/entities/user.entity';
import { CreateFolderDto, UpdateFolderDto } from './dto/create-folder.dto';
import { UpdateFileDto } from './dto/upload-file.dto';
import { MoveFileDto } from './dto/move-file.dto';
import { StorageService } from '@/modules/storage/storage.service';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);

  constructor(
    private readonly filesRepository: FilesRepository,
    private readonly storageService: StorageService,
  ) {}

  // File operations
  async createFileRecord(fileData: Partial<File>, user: User): Promise<File> {
    const file = await this.filesRepository.createFile({
      ...fileData,
      owner: user,
    });

    // Update parent folder stats if file is in a folder
    if (file.folder) {
      await this.filesRepository.updateFolderStats(file.folder.id);
    }

    return file;
  }

  async getFileById(id: number, user: User): Promise<File> {
    const file = await this.filesRepository.findFileById(id, user.id);
    if (!file) {
      throw new NotFoundException('File not found');
    }
    return file;
  }

  async getUserFiles(user: User, folderId?: number): Promise<File[]> {
    // Validate folder exists and belongs to user if folderId provided
    if (folderId) {
      const folder = await this.getFolderById(folderId, user);
      if (!folder) {
        throw new NotFoundException('Folder not found');
      }
    }

    return this.filesRepository.findFilesByUser(user.id, folderId);
  }

  async updateFile(
    id: number,
    updateDto: UpdateFileDto,
    user: User,
  ): Promise<File> {
    const file = await this.getFileById(id, user);

    // If moving to different folder, validate destination
    if (updateDto.folderId !== undefined) {
      if (updateDto.folderId !== null) {
        const destinationFolder = await this.getFolderById(
          updateDto.folderId,
          user,
        );
        if (!destinationFolder) {
          throw new NotFoundException('Destination folder not found');
        }
      }

      // Update folder stats
      const oldFolderId = file.folder?.id;
      await this.filesRepository.moveFileToFolder(
        id,
        updateDto.folderId,
        user.id,
      );

      if (oldFolderId) {
        await this.filesRepository.updateFolderStats(oldFolderId);
      }
      if (updateDto.folderId) {
        await this.filesRepository.updateFolderStats(updateDto.folderId);
      }
    }

    return this.filesRepository.updateFile(id, user.id, updateDto);
  }

  async deleteFile(id: number, user: User): Promise<void> {
    const file = await this.getFileById(id, user);

    await this.filesRepository.deleteFile(id, user.id);

    // Update parent folder stats
    if (file.folder) {
      await this.filesRepository.updateFolderStats(file.folder.id);
    }
  }

  async moveFile(id: number, moveDto: MoveFileDto, user: User): Promise<File> {
    const file = await this.getFileById(id, user);

    // Validate destination folder
    if (moveDto.destinationFolderId) {
      const destinationFolder = await this.getFolderById(
        moveDto.destinationFolderId,
        user,
      );
      if (!destinationFolder) {
        throw new NotFoundException('Destination folder not found');
      }
    }

    const oldFolderId = file.folder?.id;
    const updatedFile = await this.filesRepository.moveFileToFolder(
      id,
      moveDto.destinationFolderId,
      user.id,
    );

    // Update folder stats
    if (oldFolderId) {
      await this.filesRepository.updateFolderStats(oldFolderId);
    }
    if (moveDto.destinationFolderId) {
      await this.filesRepository.updateFolderStats(moveDto.destinationFolderId);
    }

    return updatedFile;
  }

  async downloadFile(
    id: number,
    user: User,
  ): Promise<{
    file: File;
    content: Buffer;
  }> {
    try {
      // Get file info from database with ownership validation
      const file = await this.getFileById(id, user);

      // Security: Check file visibility permissions
      if (file.visibility === 'private' && file.owner.id !== user.id) {
        throw new ForbiddenException('Access denied to this file');
      }

      // Validate file still exists in storage
      const fileExists = await this.storageService.fileExists(file.storagePath);
      if (!fileExists) {
        this.logger.error(`File not found in storage: ${file.storagePath}`);
        throw new NotFoundException('File content not found in storage');
      }

      // Get actual file content from storage
      const content = await this.storageService.downloadFile(file.storagePath);

      // Validate content size matches database record
      if (content.length !== Number(file.size)) {
        this.logger.warn(
          `File size mismatch for ${file.id}: expected ${file.size}, got ${content.length}`,
        );
        throw new BadRequestException('File integrity check failed');
      }

      // Increment download count (async, don't wait)
      this.filesRepository.incrementDownloadCount(id).catch((error) => {
        this.logger.warn(
          `Failed to increment download count for file ${id}:`,
          error,
        );
      });

      this.logger.log(`File downloaded: ${file.id} by user ${user.id}`);

      return { file, content };
    } catch (error) {
      this.logger.error(
        `Download failed for file ${id} by user ${user.id}:`,
        error,
      );
      throw error;
    }
  }

  // Folder operations
  async createFolder(createDto: CreateFolderDto, user: User): Promise<Folder> {
    // Validate parent folder if provided
    let parentFolder = null;
    if (createDto.parentId) {
      parentFolder = await this.getFolderById(createDto.parentId, user);
      if (!parentFolder) {
        throw new NotFoundException('Parent folder not found');
      }
    }

    // Check for duplicate folder name in same parent
    const existingFolders = await this.filesRepository.findFoldersByUser(
      user.id,
      createDto.parentId,
    );

    const duplicateName = existingFolders.find(
      (folder) => folder.name.toLowerCase() === createDto.name.toLowerCase(),
    );

    if (duplicateName) {
      throw new BadRequestException(
        'Folder with this name already exists in this location',
      );
    }

    return this.filesRepository.createFolder({
      ...createDto,
      parent: parentFolder,
      owner: user,
    });
  }

  async getFolderById(id: number, user: User): Promise<Folder> {
    const folder = await this.filesRepository.findFolderById(id, user.id);
    if (!folder) {
      throw new NotFoundException('Folder not found');
    }
    return folder;
  }

  async getUserFolders(user: User, parentId?: number): Promise<Folder[]> {
    return this.filesRepository.findFoldersByUser(user.id, parentId);
  }

  async updateFolder(
    id: number,
    updateDto: UpdateFolderDto,
    user: User,
  ): Promise<Folder> {
    //const folder = await this.getFolderById(id, user);

    // If moving to different parent, validate and prevent circular reference
    if (updateDto.parentId !== undefined) {
      if (updateDto.parentId !== null) {
        const newParent = await this.getFolderById(updateDto.parentId, user);
        if (!newParent) {
          throw new NotFoundException('Parent folder not found');
        }

        // Prevent moving folder into its own child (circular reference)
        if (await this.isChildFolder(updateDto.parentId, id, user)) {
          throw new BadRequestException(
            'Cannot move folder into its own child folder',
          );
        }
      }
    }

    return this.filesRepository.updateFolder(id, user.id, updateDto);
  }

  async deleteFolder(id: number, user: User): Promise<void> {
    const folder = await this.getFolderById(id, user);

    // Check if folder has files or subfolders
    if (folder.files.length > 0 || folder.children.length > 0) {
      throw new BadRequestException(
        'Cannot delete folder that contains files or subfolders',
      );
    }

    await this.filesRepository.deleteFolder(id, user.id);
  }

  // Search operations
  async searchFiles(
    searchTerm: string,
    user: User,
  ): Promise<{ files: File[]; folders: Folder[] }> {
    const [files, folders] = await Promise.all([
      this.filesRepository.searchFiles(user.id, searchTerm),
      this.filesRepository.searchFolders(user.id, searchTerm),
    ]);

    return { files, folders };
  }

  // Helper methods
  private async isChildFolder(
    parentId: number,
    childId: number,
    user: User,
  ): Promise<boolean> {
    const parent = await this.getFolderById(parentId, user);
    if (!parent.parent) return false;

    if (parent.parent.id === childId) return true;

    return this.isChildFolder(parent.parent.id, childId, user);
  }
}
