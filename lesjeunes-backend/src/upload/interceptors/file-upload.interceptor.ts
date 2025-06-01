// upload/interceptors/file-upload.interceptor.ts - Multer Configuration
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { v4 as uuid } from 'uuid';
import * as path from 'path';

// Single file upload interceptor with custom configuration
export const FileUploadInterceptor = (fieldName: string = 'file') => {
  const multerOptions: MulterOptions = {
    storage: diskStorage({
      destination: (req, file, cb) => {
        // Temporary storage - files will be moved to permanent storage by upload service
        cb(null, './temp-uploads');
      },
      filename: (req, file, cb) => {
        // Generate unique temporary filename
        const uniqueName = `${uuid()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
      },
    }),
    limits: {
      fileSize: parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024, // 50MB default
      files: 1, // Single file
    },
    fileFilter: (req, file, cb) => {
      // Basic file filter - detailed validation in separate interceptor
      const allowedMimes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'application/zip',
        'video/mp4',
        'video/quicktime',
      ];

      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(`File type ${file.mimetype} not allowed`), false);
      }
    },
  };

  return FileInterceptor(fieldName, multerOptions);
};

// Multiple files upload interceptor
export const MultipleFilesUploadInterceptor = (
  fieldName: string = 'files',
  maxCount: number = 10,
) => {
  const multerOptions: MulterOptions = {
    storage: diskStorage({
      destination: (req, file, cb) => {
        cb(null, './temp-uploads');
      },
      filename: (req, file, cb) => {
        const uniqueName = `${uuid()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
      },
    }),
    limits: {
      fileSize: parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024,
      files: maxCount,
    },
    fileFilter: (req, file, cb) => {
      const allowedMimes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'application/zip',
        'video/mp4',
        'video/quicktime',
      ];

      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(`File type ${file.mimetype} not allowed`), false);
      }
    },
  };

  return FilesInterceptor(fieldName, maxCount, multerOptions);
};

// Memory storage interceptor for direct processing
export const MemoryFileUploadInterceptor = (fieldName: string = 'file') => {
  const multerOptions: MulterOptions = {
    storage: 'memory', // Store in memory for direct processing
    limits: {
      fileSize: parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024,
      files: 1,
    },
    fileFilter: (req, file, cb) => {
      const allowedMimes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf',
        'text/plain',
      ];

      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(`File type ${file.mimetype} not allowed`), false);
      }
    },
  };

  return FileInterceptor(fieldName, multerOptions);
};
