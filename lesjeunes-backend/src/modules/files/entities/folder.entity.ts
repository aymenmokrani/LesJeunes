// entities/folder.entity.ts - Folder Hierarchy Entity
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Index,
} from 'typeorm';
import { User } from '@/modules/users/entities/user.entity';
import { File } from './file.entity';

@Entity('folders')
@Index(['owner', 'parent']) // Optimize folder tree queries
export class Folder {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  // Folder information
  @Column()
  name: string; // Folder name: "Documents", "Photos"

  @Column({ nullable: true })
  description: string; // Optional folder description

  @Column({ type: 'simple-array', nullable: true })
  tags: string[]; // Folder tags: ["work", "personal"]

  // Hierarchy structure
  @ManyToOne(() => Folder, (folder) => folder.children, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  parent: Folder; // Parent folder (null = root level)

  @OneToMany(() => Folder, (folder) => folder.parent)
  children: Folder[]; // Child folders

  @OneToMany(() => File, (file) => file.folder)
  files: File[]; // Files in this folder

  // Ownership
  @ManyToOne(() => User, (user) => user.folders, { onDelete: 'CASCADE' })
  owner: User; // Folder owner

  // Access control
  @Column({ default: 'private' })
  visibility: 'private' | 'shared' | 'public';

  @Column({ default: true })
  isActive: boolean; // Soft delete flag

  // Statistics (computed fields)
  @Column({ default: 0 })
  fileCount: number; // Number of files (direct children)

  @Column({ default: 0 })
  totalSize: number; // Total size of all files in folder

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
