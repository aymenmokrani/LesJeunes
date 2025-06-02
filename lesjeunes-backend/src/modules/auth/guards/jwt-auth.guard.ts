// auth/guards/jwt-auth.guard.ts - Security Guard
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // Override default error handling for better security messages
  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw new UnauthorizedException(
        'Invalid or missing authentication token',
      );
    }
    return user; // User object attached to the request
  }
}
