import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // Ensures expired tokens are rejected
      secretOrKey: configService.get<string>('JWT_SECRET', ''), // Default to empty string if undefined
    });

    // Ensure JWT_SECRET is defined
    if (!this.configService.get<string>('JWT_SECRET')) {
      throw new Error('Missing JWT_SECRET in environment variables');
    }
  }

  validate(payload: Record<string, any>) {
    console.log('validate', payload);

    if (!payload) {
      throw new UnauthorizedException('Invalid token');
    }
    return payload;
  }
}
