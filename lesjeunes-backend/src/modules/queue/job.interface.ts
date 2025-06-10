import { User } from '@/modules/users/entities/user.entity';
import { File } from '@/modules/files/entities/file.entity';

export interface UploadJob {
  jobId: string;
  tempFilePath: string;
  file: File;
  user: User;
}

export interface JobResponse {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  message?: string;
  result?: any;
}
