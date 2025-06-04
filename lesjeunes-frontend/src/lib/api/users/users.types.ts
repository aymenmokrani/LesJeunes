// lib/api/users/users.types.ts

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string;
}

export interface UpdateUserDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

export interface UserDto {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}
