// users.controller.ts - HTTP Request Handler
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards, // Security
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard'; // Security guard

@Controller('users')
@UseGuards(JwtAuthGuard) // Security: Protect all routes with JWT
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createUserDto: CreateUserDto) {
    // Validation: DTO automatically validated
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    // Validation: Ensure ID is number
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string, // Validation pipe
    @Body() updateUserDto: UpdateUserDto, // Validation DTO
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
