// auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '@/modules/users/users.service';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.access_token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey:
        process.env.JWT_SECRET ||
        'temp-secret-aB3xK9mP7qR2wN8vF1cM5zL6sH4jD0gE',
    });
  }

  async validate(payload: any) {
    // 'payload' is the decoded JWT content
    // Example payload: { sub: 123, email: "user@example.com", iat: 1234567890 }
    const user = await this.usersService.findOne(payload.sub);

    // Find user in a database to ensure they still exist
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User no longer exists');
    }
    return user;
  }
}
