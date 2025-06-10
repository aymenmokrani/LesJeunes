// entities/file.entity.ts - File Metadata Entity
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { User } from '@/modules/users/entities/user.entity';
import { Folder } from './folder.entity';

@Entity('files')
@Index(['owner', 'folder']) // Optimize queries by owner and folder
export class File {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Basic file information
  @Column()
  originalName: string; // User-provided filename: "vacation-photo.jpg"

  @Column({ unique: true })
  fileName: string; // System-generated unique name: "abc-123-def.jpg"

  @Column()
  mimeType: string; // File type: "image/jpeg", "application/pdf"

  @Column('bigint')
  size: number; // File size in bytes

  @Column({ type: 'enum', enum: ['present', 'processing'] })
  status: 'present' | 'processing';

  // Storage information
  @Column()
  storagePath: string; // Path where file is stored: "users/123/files/abc-123.jpg"

  @Column({ default: 'local' })
  storageProvider: string; // Storage type: "local", "s3", "azure"

  @Column({ nullable: true })
  fileHash: string; // File checksum for integrity verification

  // Organization
  @ManyToOne(() => User, (user) => user.files, { onDelete: 'CASCADE' })
  owner: User; // File owner

  @ManyToOne(() => Folder, (folder) => folder.files, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  folder: Folder; // Parent folder (null = root level)

  // Access control
  @Column({ default: 'private' })
  visibility: 'private' | 'shared' | 'public';

  @Column({ type: 'simple-array', nullable: true })
  tags: string[]; // User-defined tags: ["work", "important"]

  // Processing information
  @Column({ nullable: true })
  thumbnailPath: string; // Thumbnail for images/videos

  @Column({ default: 'completed' })
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';

  @Column({ default: 'clean' })
  virusScanStatus: 'pending' | 'clean' | 'infected';

  // Statistics
  @Column({ default: 0 })
  downloadCount: number; // Track download frequency

  @Column({ nullable: true })
  lastAccessedAt: Date; // When file was last accessed

  // Timestamps
  @CreateDateColumn()
  createdAt: Date; // Upload date

  @UpdateDateColumn()
  updatedAt: Date; // Last modification date
}
