// dto/move-file.dto.ts - File Operations Validation
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  ArrayMinSize,
} from 'class-validator';

export class MoveFileDto {
  @IsNotEmpty({ message: 'Destination folder ID is required' })
  destinationFolderId: string; // Target folder (null for root)
}

export class MoveMultipleFilesDto {
  @IsNotEmpty({ message: 'File IDs are required' })
  @IsArray({ message: 'File IDs must be an array' })
  @ArrayMinSize(1, { message: 'At least one file ID is required' })
  fileIds: string[]; // Array of file IDs to move

  @IsNotEmpty({ message: 'Destination folder ID is required' })
  destinationFolderId: string;
}

export class CopyFileDto {
  @IsNotEmpty({ message: 'Destination folder ID is required' })
  destinationFolderId: string; // Target folder for copy

  @IsOptional()
  @IsString({ message: 'New name must be a string' })
  newName?: string; // Optional new name for copied file
}

export class RenameFileDto {
  @IsNotEmpty({ message: 'New name is required' })
  @IsString({ message: 'New name must be a string' })
  newName: string; // New filename
}

export class DeleteMultipleFilesDto {
  @IsNotEmpty({ message: 'File IDs are required' })
  @IsArray({ message: 'File IDs must be an array' })
  @ArrayMinSize(1, { message: 'At least one file ID is required' })
  fileIds: string[]; // Array of file IDs to delete
}
