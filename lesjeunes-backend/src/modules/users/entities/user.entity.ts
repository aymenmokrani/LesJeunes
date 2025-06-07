// entities/user.entity.ts - Database Entity
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { File } from '@/modules/files/entities/file.entity';
import { Folder } from '@/modules/files/entities/folder.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string; // Hashed password

  @Column()
  name: string;

  @Column({ default: true })
  isActive: boolean;

  // Auth-related fields
  @Column('text', { array: true, default: [] })
  refreshTokens: string[]; // Store refresh tokens

  // Storage settings
  @Column({ type: 'bigint', default: 5368709120 }) // 5GB default
  storageQuota: number; // Storage limit in bytes

  @Column({ type: 'bigint', default: 0 })
  storageUsed: number; // Current storage usage

  // File relationships
  @OneToMany(() => File, (file) => file.owner)
  files: File[];

  @OneToMany(() => Folder, (folder) => folder.owner)
  folders: Folder[];

  // Helper method to check storage availability
  hasStorageSpace(fileSize: number): boolean {
    return this.storageUsed + fileSize <= this.storageQuota;
  }

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
