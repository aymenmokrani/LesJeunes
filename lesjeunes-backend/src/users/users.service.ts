// users.service.ts - Business Logic Service
import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from './users.repository';
import { CreateUserDto, UpdateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';

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

    return this.userRepository.create(createUserDto);
  }

  // Business logic: Get all active users
  async findAll(): Promise<User[]> {
    return this.userRepository.findActiveUsers();
  }

  // Business logic: Get user by ID with existence check
  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user || !user.isActive) {
      throw new NotFoundException('User not found'); // Error handling
    }
    return user;
  }

  // Business logic: Update user with existence check
  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    // Ensure the user exists before updating
    await this.findOne(id); // Reuse existing validation
    return this.userRepository.update(id, updateUserDto);
  }

  // Business logic: Soft delete (deactivate user)
  async remove(id: number): Promise<void> {
    // Ensure user exists before deleting
    await this.findOne(id); // Reuse existing validation
    await this.userRepository.softDelete(id);
  }
}
