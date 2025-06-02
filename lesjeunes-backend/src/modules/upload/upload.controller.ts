// upload/upload.controller.ts - Upload Endpoints
import {
  Controller,
  Post,
  Put,
  Get,
  Body,
  Param,
  Request,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import {
  FileUploadInterceptor,
  MultipleFilesUploadInterceptor,
  MemoryFileUploadInterceptor,
} from './interceptors/file-upload.interceptor';
import {
  FileValidationInterceptor,
  ImageValidationInterceptor,
  DocumentValidationInterceptor,
} from './interceptors/file-validation.interceptor';
import { UploadFileDto } from '@/modules/files/dto/upload-file.dto';

@Controller('upload')
@UseGuards(JwtAuthGuard) // Protect all upload endpoints
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  // Single file upload
  @Post('single')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileUploadInterceptor('file'), FileValidationInterceptor)
  async uploadSingleFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadFileDto,
    @Request() req,
  ) {
    return this.uploadService.uploadSingleFile(file, uploadDto, req.user);
  }

  // Multiple files upload
  @Post('multiple')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    MultipleFilesUploadInterceptor('files', 10), // Max 10 files
    FileValidationInterceptor,
  )
  async uploadMultipleFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() uploadDto: UploadFileDto,
    @Request() req,
  ) {
    return this.uploadService.uploadMultipleFiles(files, uploadDto, req.user);
  }

  // Image upload with specific validation
  @Post('image')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    MemoryFileUploadInterceptor('image'),
    ImageValidationInterceptor,
  )
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadFileDto,
    @Request() req,
  ) {
    return this.uploadService.uploadSingleFile(file, uploadDto, req.user);
  }

  // Document upload with specific validation
  @Post('document')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileUploadInterceptor('document'),
    DocumentValidationInterceptor,
  )
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadFileDto,
    @Request() req,
  ) {
    return this.uploadService.uploadSingleFile(file, uploadDto, req.user);
  }

  // Replace existing file
  @Put('replace/:id')
  @UseInterceptors(FileUploadInterceptor('file'), FileValidationInterceptor)
  async replaceFile(
    @Param('id', ParseIntPipe) fileId: number,
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    return this.uploadService.replaceFile(fileId, file, req.user);
  }

  // Get upload progress (for large files)
  @Get('progress/:uploadId')
  async getUploadProgress(@Param('uploadId') uploadId: string) {
    return this.uploadService.getUploadProgress(uploadId);
  }

  // Chunked upload for large files
  @Post('chunked/:uploadId')
  @UseInterceptors(MemoryFileUploadInterceptor('chunk'))
  async uploadChunk(
    @Param('uploadId') uploadId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body()
    chunkData: {
      chunkIndex: number;
      totalChunks: number;
    },
  ) {
    return this.uploadService.resumeUpload(
      uploadId,
      file,
      chunkData.chunkIndex,
      chunkData.totalChunks,
    );
  }

  // Avatar upload (specialized endpoint)
  @Post('avatar')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    MemoryFileUploadInterceptor('avatar'),
    ImageValidationInterceptor,
  )
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    // Special handling for avatar uploads
    const uploadDto: UploadFileDto = {
      visibility: 'public',
      tags: ['avatar'],
    };

    return this.uploadService.uploadSingleFile(file, uploadDto, req.user);
  }

  // Bulk upload with zip extraction
  @Post('bulk-zip')
  @UseInterceptors(FileUploadInterceptor('zipFile'), FileValidationInterceptor)
  async uploadBulkZip() {
    // @Request() req, // @Body() uploadDto: UploadFileDto, // @UploadedFile() file: Express.Multer.File,
    // TODO: Implement zip extraction and bulk upload
    // Would extract zip file and upload individual files
    throw new Error('Bulk zip upload not yet implemented');
  }

  // Upload from URL
  @Post('from-url')
  async uploadFromUrl /*    @Body() urlData: {
            url: string;
            fileName?: string;
            folderId?: number;
        },
        @Request() req,*/() {
    // TODO: Implement URL-based upload
    // Would download file from URL and upload to storage
    throw new Error('URL upload not yet implemented');
  }
}
