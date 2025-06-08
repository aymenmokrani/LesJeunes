// users.repository.ts - Custom Provider (Database Layer)
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // Custom query methods (Provider functionality)
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email } });
  }

  async findActiveUsers(): Promise<User[]> {
    return this.userRepo.find({ where: { isActive: true } });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepo.create(userData);
    return this.userRepo.save(user);
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { id } });
  }

  async update(id: string, userData: Partial<User>): Promise<User> {
    await this.userRepo.update(id, userData);
    return this.findById(id);
  }

  async softDelete(id: string): Promise<void> {
    await this.userRepo.update(id, { isActive: false });
  }
}
