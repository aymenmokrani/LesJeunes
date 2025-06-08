// upload/interceptors/file-validation.interceptor.ts - File Validation
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import * as path from 'path';

@Injectable()
export class FileValidationInterceptor implements NestInterceptor {
  private readonly maxFileSize: number;
  private readonly allowedTypes: string[];
  private readonly allowedExtensions: string[];

  constructor() {
    this.maxFileSize =
      parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 * 1024; // 5GB
    this.allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv',
      'application/zip',
      'application/x-rar-compressed',
      'application/x-zip-compressed',
      'video/mp4',
      'video/quicktime',
      'video/x-msvideo',
      'audio/mpeg',
      'audio/wav',
    ];
    this.allowedExtensions = [
      '.jpg',
      '.jpeg',
      '.png',
      '.gif',
      '.webp',
      '.pdf',
      '.doc',
      '.docx',
      '.xls',
      '.xlsx',
      '.txt',
      '.csv',
      '.zip',
      '.rar',
      '.mp4',
      '.mov',
      '.avi',
      '.mp3',
      '.wav',
    ];
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const file = request.file;
    const files = request.files;

    // Validate single file
    if (file) {
      this.validateFile(file);
    }

    // Validate multiple files
    if (files && Array.isArray(files)) {
      files.forEach((f) => this.validateFile(f));
    }

    return next.handle();
  }

  private validateFile(file: Express.Multer.File): void {
    // Check if file exists
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Validate file size
    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `File size ${this.formatFileSize(file.size)} exceeds maximum allowed size of ${this.formatFileSize(this.maxFileSize)}`,
      );
    }

    // Validate file type
    if (!this.allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type '${file.mimetype}' is not allowed. Allowed types: ${this.allowedTypes.join(', ')}`,
      );
    }

    // Validate file extension
    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (!this.allowedExtensions.includes(fileExtension)) {
      throw new BadRequestException(
        `File extension '${fileExtension}' is not allowed. Allowed extensions: ${this.allowedExtensions.join(', ')}`,
      );
    }

    // Validate filename
    if (!file.originalname || file.originalname.trim().length === 0) {
      throw new BadRequestException('File must have a valid name');
    }

    // Check for potentially dangerous file names
    if (this.isDangerousFileName(file.originalname)) {
      throw new BadRequestException('File name contains invalid characters');
    }

    // Validate MIME type matches extension (basic check)
    if (!this.isValidMimeTypeForExtension(file.mimetype, fileExtension)) {
      throw new BadRequestException('File type does not match file extension');
    }
  }

  private formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  }

  private isDangerousFileName(filename: string): boolean {
    // Check for dangerous patterns
    const dangerousPatterns = [
      /\.\./, // Directory traversal
      /[<>:"|?*]/, // Invalid file name characters
      /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i, // Reserved Windows names
      /^\./, // Hidden files starting with dot
      /\s+$/, // Trailing whitespace
    ];

    return dangerousPatterns.some((pattern) => pattern.test(filename));
  }

  private isValidMimeTypeForExtension(
    mimeType: string,
    extension: string,
  ): boolean {
    const validCombinations: Record<string, string[]> = {
      '.jpg': ['image/jpeg'],
      '.jpeg': ['image/jpeg'],
      '.png': ['image/png'],
      '.gif': ['image/gif'],
      '.webp': ['image/webp'],
      '.pdf': ['application/pdf'],
      '.doc': ['application/msword'],
      '.docx': [
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ],
      '.xls': ['application/vnd.ms-excel'],
      '.xlsx': [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ],
      '.txt': ['text/plain'],
      '.csv': ['text/csv', 'application/csv'],
      '.zip': ['application/zip', 'application/x-zip-compressed'],
      '.rar': ['application/x-rar-compressed'],
      '.mp4': ['video/mp4'],
      '.mov': ['video/quicktime'],
      '.avi': ['video/x-msvideo'],
      '.mp3': ['audio/mpeg'],
      '.wav': ['audio/wav'],
    };

    const allowedMimeTypes = validCombinations[extension];
    return allowedMimeTypes ? allowedMimeTypes.includes(mimeType) : false;
  }
}

// Specialized interceptors for different file types
@Injectable()
export class ImageValidationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const file = request.file;

    if (file) {
      // Validate image-specific requirements
      const allowedImageTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
      ];

      if (!allowedImageTypes.includes(file.mimetype)) {
        throw new BadRequestException('Only image files are allowed');
      }

      // Additional image validations could go here
      // - Image dimensions
      // - Image quality
      // - Image content analysis
    }

    return next.handle();
  }
}

@Injectable()
export class DocumentValidationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const file = request.file;

    if (file) {
      const allowedDocTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
      ];

      if (!allowedDocTypes.includes(file.mimetype)) {
        throw new BadRequestException('Only document files are allowed');
      }
    }

    return next.handle();
  }
}
