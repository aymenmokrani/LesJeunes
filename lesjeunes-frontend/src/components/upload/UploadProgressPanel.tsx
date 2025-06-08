// components/upload/UploadProgressPanel.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  Image,
  File,
  CheckCircle,
  AlertCircle,
  Minimize2,
  Maximize2,
  Upload,
  Pause,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  selectUploads,
  selectActiveUploads,
  clearCompletedUploads,
  cancelUpload,
} from '@/store/uploadSlice';
import { UploadProgress } from '@/domain/upload/UploadEntities.entity';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/useAppDispatch';

// Types
interface UploadProgressPanelProps {
  className?: string;
  maxHeight?: number;
  autoHide?: boolean;
  autoHideDelay?: number;
}

// File type icons mapping
const getFileIcon = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase();

  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension || '')) {
    return <Image className="h-4 w-4 text-blue-500" />;
  }

  if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(extension || '')) {
    return <FileText className="h-4 w-4 text-red-500" />;
  }

  return <File className="h-4 w-4 text-gray-500" />;
};

// Format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Format time remaining
const formatTimeRemaining = (seconds?: number): string => {
  if (!seconds || seconds <= 0) return '';
  if (seconds < 60) return `${Math.round(seconds)}s remaining`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m remaining`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m remaining`;
};

// Individual upload item component
interface UploadItemProps {
  upload: UploadProgress;
  onCancel?: (uploadId: string) => void;
  onPause?: (uploadId: string) => void;
  onResume?: (uploadId: string) => void;
}

const UploadItem: React.FC<UploadItemProps> = ({
  upload,
  onCancel,
  onPause,
}) => {
  const getStatusColor = () => {
    switch (upload.status) {
      case 'complete':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'cancelled':
        return 'text-gray-500';
      case 'uploading':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const getProgressColor = () => {
    switch (upload.status) {
      case 'complete':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'cancelled':
        return 'bg-gray-400';
      default:
        return 'bg-blue-500';
    }
  };

  const getStatusIcon = () => {
    switch (upload.status) {
      case 'complete':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'cancelled':
        return <X className="h-4 w-4 text-gray-500" />;
      case 'uploading':
        return (
          <div className="relative">
            <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        );
      default:
        return <Upload className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors">
      {/* File Icon */}
      <div className="flex-shrink-0">{getFileIcon(upload.fileName)}</div>

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-medium text-gray-900 truncate pr-2">
            {upload.fileName}
          </p>
          <div className="flex items-center gap-1">{getStatusIcon()}</div>
        </div>

        {/* Progress Bar */}
        <div className="mb-1">
          <Progress
            value={upload.progress}
            className="h-1.5"
            style={
              {
                '--progress-background': getProgressColor(),
              } as React.CSSProperties
            }
          />
        </div>

        {/* Status Info */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className={getStatusColor()}>
            {upload.status === 'uploading' && `${upload.progress}%`}
            {upload.status === 'complete' && 'Complete'}
            {upload.status === 'error' && (upload.error || 'Failed')}
            {upload.status === 'cancelled' && 'Cancelled'}
            {upload.status === 'pending' && 'Pending...'}
          </span>

          <div className="flex items-center gap-2">
            {upload.uploadSpeed && (
              <span>{formatFileSize(upload.uploadSpeed)}/s</span>
            )}
            {upload.estimatedTimeRemaining && (
              <span>{formatTimeRemaining(upload.estimatedTimeRemaining)}</span>
            )}
            <span>
              {formatFileSize(upload.uploadedSize)} /{' '}
              {formatFileSize(upload.totalSize)}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {upload.status === 'uploading' && onPause && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => onPause(upload.uploadId)}
          >
            <Pause className="h-3 w-3" />
          </Button>
        )}

        {(upload.status === 'uploading' || upload.status === 'pending') &&
          onCancel && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
              onClick={() => onCancel(upload.uploadId)}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
      </div>
    </div>
  );
};

// Main upload progress panel component
export const UploadProgressPanel: React.FC<UploadProgressPanelProps> = ({
  className,
  maxHeight = 400,
}) => {
  const dispatch = useAppDispatch();
  const uploads = useAppSelector(selectUploads);
  const activeUploads = useAppSelector(selectActiveUploads);

  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const uploadsArray = Object.values(uploads);
  const hasUploads = uploadsArray.length > 0;
  const hasActiveUploads = activeUploads.length > 0;
  const completedCount = uploadsArray.filter(
    (u) => u.status === 'complete'
  ).length;
  const totalCount = uploadsArray.length;

  // Auto-hide functionality
  useEffect(() => {
    if (hasActiveUploads) {
      setIsVisible(true);
    } else if (!hasUploads) {
      setIsVisible(false);
    }
  }, [hasActiveUploads, hasUploads]);

  // Don't render if no uploads and not visible
  if (!hasUploads && !isVisible) {
    return null;
  }

  const handleCancel = (uploadId: string) => {
    dispatch(cancelUpload({ uploadId }));
  };

  const handleClearCompleted = () => {
    dispatch(clearCompletedUploads());
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-50 transition-all duration-300 ease-in-out',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0',
        className
      )}
    >
      <Card className="w-80 shadow-lg border-0 bg-white/95 backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b bg-gray-50/50">
          <div className="flex items-center gap-2">
            <Upload className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-900">
              {hasActiveUploads ? 'Uploading...' : 'Uploads'}
            </span>
            {totalCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {completedCount}/{totalCount}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? (
                <Maximize2 className="h-3 w-3" />
              ) : (
                <Minimize2 className="h-3 w-3" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={handleClose}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Content */}
        {!isMinimized && (
          <div className="overflow-y-auto" style={{ maxHeight }}>
            {uploadsArray.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {uploadsArray.map((upload) => (
                  <UploadItem
                    key={upload.uploadId}
                    upload={upload}
                    onCancel={handleCancel}
                  />
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                <Upload className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No uploads</p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        {!isMinimized && completedCount > 0 && (
          <div className="p-3 border-t bg-gray-50/50">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs h-7"
              onClick={handleClearCompleted}
            >
              Clear completed ({completedCount})
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default UploadProgressPanel;
