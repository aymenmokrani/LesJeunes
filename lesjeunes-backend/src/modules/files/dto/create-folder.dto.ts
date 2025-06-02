// dto/create-folder.dto.ts - Folder Creation Validation
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  IsEnum,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateFolderDto {
  @IsNotEmpty({ message: 'Folder name is required' })
  @IsString({ message: 'Folder name must be a string' })
  @MinLength(1, { message: 'Folder name cannot be empty' })
  @MaxLength(100, { message: 'Folder name cannot exceed 100 characters' })
  name: string; // Folder name

  @IsOptional()
  @IsNumber({}, { message: 'Parent folder ID must be a number' })
  parentId?: number; // Parent folder (null = root level)

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(500, { message: 'Description cannot exceed 500 characters' })
  description?: string; // Folder description

  @IsOptional()
  @IsArray({ message: 'Tags must be an array' })
  @IsString({ each: true, message: 'Each tag must be a string' })
  @MaxLength(20, {
    each: true,
    message: 'Each tag cannot exceed 20 characters',
  })
  tags?: string[]; // Folder tags

  @IsOptional()
  @IsEnum(['private', 'shared', 'public'], {
    message: 'Invalid visibility option',
  })
  visibility?: 'private' | 'shared' | 'public';
}

export class UpdateFolderDto {
  @IsOptional()
  @IsString({ message: 'Folder name must be a string' })
  @MinLength(1, { message: 'Folder name cannot be empty' })
  @MaxLength(100, { message: 'Folder name cannot exceed 100 characters' })
  name?: string; // Rename folder

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
  @IsNumber({}, { message: 'Parent folder ID must be a number' })
  parentId?: number; // Move folder to different parent
}
