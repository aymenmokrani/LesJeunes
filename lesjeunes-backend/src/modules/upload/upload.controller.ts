// upload/upload.controller.ts - Upload Endpoints
import {
  Controller,
  Post,
  Body,
  Request,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import {
  FileUploadInterceptor,
  MultipleFilesUploadInterceptor,
} from './interceptors/file-upload.interceptor';
import { FileValidationInterceptor } from './interceptors/file-validation.interceptor';
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
}
