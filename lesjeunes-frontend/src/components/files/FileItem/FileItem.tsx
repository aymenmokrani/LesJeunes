'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Image,
  File as FileIcon,
  MoreVertical,
  Download,
} from 'lucide-react';
import { File } from '@/domain/files/FileEntities.entity';
import { useFiles } from '@/lib/hooks/useFiles';
import { formatBytes, formatDate } from '@/lib/utils';

interface FileItemProps {
  file: File;
  viewMode: 'grid' | 'list';
  isSelected: boolean;
}

const getFileIcon = (file: File) => {
  if (file.mimeType?.startsWith('image/')) {
    return <Image className="h-8 w-8 text-green-500" />;
  }

  if (file.mimeType?.includes('pdf')) {
    return <FileText className="h-8 w-8 text-red-500" />;
  }

  return <FileIcon className="h-8 w-8 text-gray-500" />;
};

export function FileItem({ file, viewMode, isSelected }: FileItemProps) {
  const { selectItem } = useFiles();

  const handleClick = () => {
    selectItem(file.id);
  };

  const handleDoubleClick = () => {
    // Open file - implement file opening logic
    console.log('Open file:', file.name);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Implement download logic
    console.log('Download file:', file.name);
  };

  if (viewMode === 'grid') {
    return (
      <Card
        className={`p-4 cursor-pointer transition-all hover:shadow-md ${
          isSelected ? 'ring-2 ring-primary bg-accent' : ''
        }`}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
      >
        <div className="flex flex-col items-center space-y-3">
          {file.thumbnailUrl ? (
            <img
              src={file.thumbnailUrl}
              alt={file.name}
              className="h-12 w-12 object-cover rounded"
            />
          ) : (
            getFileIcon(file)
          )}
          <div className="text-center w-full">
            <p
              className="font-medium text-sm truncate w-full"
              title={file.name}
            >
              {file.name}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatDate(file.modifiedAt)}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatBytes(file.size)}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div
      className={`flex items-center p-3 hover:bg-accent cursor-pointer transition-colors ${
        isSelected ? 'bg-accent' : ''
      }`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      <div className="flex items-center space-x-3 flex-1">
        {file.thumbnailUrl ? (
          <img
            src={file.thumbnailUrl}
            alt={file.name}
            className="h-8 w-8 object-cover rounded"
          />
        ) : (
          getFileIcon(file)
        )}
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{file.name}</p>
          <p className="text-sm text-muted-foreground">
            {formatDate(file.modifiedAt)}
          </p>
        </div>
        <div className="text-sm text-muted-foreground w-24">
          {formatBytes(file.size)}
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
