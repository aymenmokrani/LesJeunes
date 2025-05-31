import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '@/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      // Extract JWT from the Authorization header: "Bearer token"
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // Reject expired tokens
      secretOrKey: 'your-secret-key', // Must-match signing secret
    });
  }

  // This method creates the 'user' object that goes to the guard
  async validate(payload: any) {
    // 'payload' is the decoded JWT content
    // Example payload: { sub: 123, email: "user@example.com", iat: 1234567890 }

    console.log('JWT Payload:', payload); // { sub: 123, email: "user@example.com" }

    // Find user in a database to ensure they still exist
    const user = await this.usersService.findOne(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    // This returned object becomes the 'user' in the guard
    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }
}
