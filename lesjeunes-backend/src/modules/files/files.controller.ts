// files.controller.ts - File CRUD Endpoints
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { CreateFolderDto, UpdateFolderDto } from './dto/create-folder.dto';
import { UpdateFileDto } from './dto/upload-file.dto';
import { MoveFileDto } from './dto/move-file.dto';
import { Response } from 'express';

@Controller('files')
@UseGuards(JwtAuthGuard) // Protect all routes with authentication
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  // File operations
  @Get()
  async getUserFiles(@Request() req, @Query('folderId') folderId?: string) {
    return this.filesService.getUserFiles(req.user, folderId);
  }

  @Get('folders')
  async getUserFolders(@Request() req, @Query('parentId') parentId?: string) {
    return this.filesService.getUserFolders(req.user, parentId);
  }

  // Folder operations
  @Post('folders')
  @HttpCode(HttpStatus.CREATED)
  async createFolder(@Body() createDto: CreateFolderDto, @Request() req) {
    return this.filesService.createFolder(createDto, req.user);
  }

  @Get(':id')
  async getFileById(@Param('id') id: string, @Request() req) {
    return this.filesService.getFileById(id, req.user);
  }

  @Get(':id/download')
  async downloadFile(
    @Param('id') id: string,
    @Request() req,
    @Res() res: Response,
  ) {
    // This returns file metadata, actual download logic would be in upload module
    const { file, content } = await this.filesService.downloadFile(
      id,
      req.user,
    );

    // Set proper download headers
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${file.originalName}"`,
    );
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Length', file.size);

    // Send the actual file content
    res.send(content);
  }

  @Put(':id')
  async updateFile(
    @Param('id') id: string,
    @Body() updateDto: UpdateFileDto,
    @Request() req,
  ) {
    return this.filesService.updateFile(id, updateDto, req.user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteFile(@Param('id') id: string, @Request() req) {
    return this.filesService.deleteFile(id, req.user);
  }

  @Post(':id/move')
  async moveFile(
    @Param('id') id: string,
    @Body() moveDto: MoveFileDto,
    @Request() req,
  ) {
    return this.filesService.moveFile(id, moveDto, req.user);
  }

  @Get('folders/:id')
  async getFolderById(@Param('id') id: string, @Request() req) {
    return this.filesService.getFolderById(id, req.user);
  }

  @Put('folders/:id')
  async updateFolder(
    @Param('id') id: string,
    @Body() updateDto: UpdateFolderDto,
    @Request() req,
  ) {
    return this.filesService.updateFolder(id, updateDto, req.user);
  }

  @Delete('folders/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteFolder(@Param('id') id: string, @Request() req) {
    return this.filesService.deleteFolder(id, req.user);
  }

  // Search operations
  @Get('search')
  async searchFiles(@Query('q') searchTerm: string, @Request() req) {
    return this.filesService.searchFiles(searchTerm, req.user);
  }
}
