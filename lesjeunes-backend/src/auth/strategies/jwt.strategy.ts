// auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '@/modules/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
    });
  }

  async validate(payload: any) {
    // 'payload' is the decoded JWT content
    // Example payload: { sub: 123, email: "user@example.com", iat: 1234567890 }

    console.log('JWT Payload:', payload); // { sub: 123, email: "user@example.com" }

    const user = await this.usersService.findOne(payload.sub);

    // Find user in a database to ensure they still exist
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User no longer exists');
    }
    return user;
  }
}
