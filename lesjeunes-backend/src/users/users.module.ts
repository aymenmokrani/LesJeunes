// users.module.ts - Feature Module
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UserRepository } from './users.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // Register the User entity for this module
  ],
  controllers: [UsersController], // Handle HTTP requests
  providers: [
    UsersService, // Business logic service
    UserRepository, // Custom database queries (provider)
  ],
  exports: [UsersService], // Make service available to other modules
})
export class UsersModule {}
