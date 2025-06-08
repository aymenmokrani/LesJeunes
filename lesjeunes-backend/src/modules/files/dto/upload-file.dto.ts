// dto/upload-file.dto.ts - File Upload Validation
import {
  IsOptional,
  IsNumber,
  IsString,
  IsArray,
  IsEnum,
  MaxLength,
} from 'class-validator';

export class UploadFileDto {
  @IsOptional()
  folderId?: string; // Optional parent folder

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(500, { message: 'Description cannot exceed 500 characters' })
  description?: string; // File description

  @IsOptional()
  @IsArray({ message: 'Tags must be an array' })
  @IsString({ each: true, message: 'Each tag must be a string' })
  @MaxLength(20, {
    each: true,
    message: 'Each tag cannot exceed 20 characters',
  })
  tags?: string[]; // File tags

  @IsOptional()
  @IsEnum(['private', 'shared', 'public'], {
    message: 'Invalid visibility option',
  })
  visibility?: 'private' | 'shared' | 'public';
}

export class UpdateFileDto {
  @IsOptional()
  @IsString({ message: 'Original name must be a string' })
  @MaxLength(255, { message: 'Filename cannot exceed 255 characters' })
  originalName?: string; // Rename file

  @IsOptional()
  @IsString({ message: 'MIME type must be a string' })
  mimeType?: string; // File MIME type

  @IsOptional()
  @IsNumber({}, { message: 'Size must be a number' })
  size?: number; // File size in bytes

  @IsOptional()
  @IsString({ message: 'File hash must be a string' })
  fileHash?: string; // File hash for integrity

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(500, { message: 'Description cannot exceed 500 characters' })
  description?: string;

  @IsOptional()
  @IsArray({ message: 'Tags must be an array' })
  @IsString({ each: true, message: 'Each tag must be a string' })
  tags?: string[];

  @IsOptional()
  @IsEnum(['private', 'shared', 'public'], {
    message: 'Invalid visibility option',
  })
  visibility?: 'private' | 'shared' | 'public';

  @IsOptional()
  folderId?: string; // Move to different folder
}
