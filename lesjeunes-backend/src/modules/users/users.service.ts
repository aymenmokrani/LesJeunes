// users.service.ts - Business Logic Service
import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from './users.repository';
import { CreateUserDto, UpdateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository, // Inject a custom provider
  ) {}

  // Business logic: Create a user with email uniqueness check
  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if email already exists (business rule)
    const existingUser = await this.userRepository.findByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      throw new ConflictException('Email already exists'); // Error handling
    }

    // Hash password before saving
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      saltRounds,
    );

    return this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
  }

  // Business logic: Get all active users
  async findAll(): Promise<User[]> {
    return this.userRepository.findActiveUsers();
  }

  // Business logic: Get user by ID with existence check
  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user || !user.isActive) {
      throw new NotFoundException('User not found'); // Error handling
    }
    return user;
  }

  // Business logic: Update user with existence check
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // Ensure the user exists before updating
    await this.findOne(id); // Reuse existing validation
    return this.userRepository.update(id, updateUserDto);
  }

  // Business logic: Soft delete (deactivate user)
  async remove(id: string): Promise<void> {
    // Ensure user exists before deleting
    await this.findOne(id); // Reuse existing validation
    await this.userRepository.softDelete(id);
  }

  // Business logic: Update user storage usage
  async updateStorageUsage(userId: string, sizeChange: number): Promise<void> {
    const user = await this.findOne(userId);
    const newStorageUsed = user.storageUsed + sizeChange;

    if (newStorageUsed < 0) {
      throw new Error('Storage usage cannot be negative');
    }

    await this.userRepository.update(userId, { storageUsed: newStorageUsed });
  }

  // Business logic: Check if user has enough storage space
  async checkStorageSpace(
    userId: string,
    requiredSpace: number,
  ): Promise<boolean> {
    const user = await this.findOne(userId);
    return user.hasStorageSpace(requiredSpace);
  }
}
