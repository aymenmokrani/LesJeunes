// files.repository.ts - File Database Operations
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from './entities/file.entity';
import { Folder } from './entities/folder.entity';
@Injectable()
export class FilesRepository {
  constructor(
    @InjectRepository(File)
    private readonly fileRepo: Repository<File>,
    @InjectRepository(Folder)
    private readonly folderRepo: Repository<Folder>,
  ) {}

  // File operations
  async createFile(fileData: Partial<File>): Promise<File> {
    const file = this.fileRepo.create(fileData);
    return this.fileRepo.save(file);
  }

  async findFileById(id: string, userId: string): Promise<File | null> {
    return this.fileRepo.findOne({
      where: { id, owner: { id: userId } },
      relations: ['owner', 'folder'],
    });
  }

  async findFilesByUser(userId: string, folderId?: string): Promise<File[]> {
    const whereCondition: any = { owner: { id: userId } };

    if (folderId !== undefined) {
      whereCondition.folder = folderId ? { id: folderId } : null; // null for root level
    }

    return this.fileRepo.find({
      where: whereCondition,
      relations: ['folder'],
      order: { createdAt: 'DESC' },
    });
  }

  async findFilesByFolder(folderId: string, userId: string): Promise<File[]> {
    return this.fileRepo.find({
      where: { folder: { id: folderId }, owner: { id: userId } },
      relations: ['folder'],
      order: { originalName: 'ASC' },
    });
  }

  async updateFile(
    id: string,
    userId: string,
    updateData: Partial<File>,
  ): Promise<File> {
    await this.fileRepo.update(
      { id, owner: { id: userId } },
      { ...updateData, updatedAt: new Date() },
    );
    return this.findFileById(id, userId);
  }

  async deleteFile(id: string, userId: string): Promise<void> {
    await this.fileRepo.delete({ id, owner: { id: userId } });
  }

  async deleteMultipleFiles(fileIds: string[], userId: string): Promise<void> {
    await this.fileRepo.delete({
      id: { $in: fileIds } as any,
      owner: { id: userId },
    });
  }

  async moveFileToFolder(
    fileId: string,
    folderId: string | null,
    userId: string,
  ): Promise<File> {
    const folder = folderId
      ? await this.folderRepo.findOne({ where: { id: folderId } })
      : null;
    return this.updateFile(fileId, userId, { folder });
  }

  async incrementDownloadCount(fileId: string): Promise<void> {
    await this.fileRepo.increment({ id: fileId }, 'downloadCount', 1);
    await this.fileRepo.update({ id: fileId }, { lastAccessedAt: new Date() });
  }

  // Folder operations
  async createFolder(folderData: Partial<Folder>): Promise<Folder> {
    const folder = this.folderRepo.create(folderData);
    return this.folderRepo.save(folder);
  }

  async findFolderById(id: string, userId: string): Promise<Folder | null> {
    return this.folderRepo.findOne({
      where: { id, owner: { id: userId }, isActive: true },
      relations: ['owner', 'parent', 'children', 'files'],
    });
  }

  async findFoldersByUser(
    userId: string,
    parentId?: string,
  ): Promise<Folder[]> {
    const whereCondition: any = { owner: { id: userId }, isActive: true };

    if (parentId !== undefined) {
      whereCondition.parent = parentId ? { id: parentId } : null;
    }

    return this.folderRepo.find({
      where: whereCondition,
      relations: ['parent'],
      order: { name: 'ASC' },
    });
  }

  async updateFolder(
    id: string,
    userId: string,
    updateData: Partial<Folder>,
  ): Promise<Folder> {
    await this.folderRepo.update(
      { id, owner: { id: userId } },
      { ...updateData, updatedAt: new Date() },
    );
    return this.findFolderById(id, userId);
  }

  async deleteFolder(id: string, userId: string): Promise<void> {
    // Soft delete - mark as inactive
    await this.folderRepo.update(
      { id, owner: { id: userId } },
      { isActive: false, updatedAt: new Date() },
    );
  }

  async updateFolderStats(folderId: string): Promise<void> {
    // Update file count and total size for folder
    const stats = await this.fileRepo
      .createQueryBuilder('file')
      .select('COUNT(*)', 'fileCount')
      .addSelect('SUM(file.size)', 'totalSize')
      .where('file.folderId = :folderId', { folderId })
      .getRawOne();

    await this.folderRepo.update(folderId, {
      fileCount: parseInt(stats.fileCount) || 0,
      totalSize: parseInt(stats.totalSize) || 0,
    });
  }

  // Search operations
  async searchFiles(userId: string, searchTerm: string): Promise<File[]> {
    return this.fileRepo
      .createQueryBuilder('file')
      .leftJoinAndSelect('file.folder', 'folder')
      .where('file.ownerId = :userId', { userId })
      .andWhere(
        '(file.originalName ILIKE :searchTerm OR file.tags && ARRAY[:searchTerm])',
        { searchTerm: `%${searchTerm}%` },
      )
      .orderBy('file.createdAt', 'DESC')
      .getMany();
  }

  async searchFolders(userId: string, searchTerm: string): Promise<Folder[]> {
    return this.folderRepo
      .createQueryBuilder('folder')
      .where('folder.ownerId = :userId', { userId })
      .andWhere('folder.isActive = true')
      .andWhere(
        '(folder.name ILIKE :searchTerm OR folder.description ILIKE :searchTerm OR folder.tags && ARRAY[:searchTerm])',
        { searchTerm: `%${searchTerm}%` },
      )
      .orderBy('folder.name', 'ASC')
      .getMany();
  }
}
