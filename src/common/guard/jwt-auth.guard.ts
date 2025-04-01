import {
  Injectable,
  ExecutionContext,
  CanActivate,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
// import { User } from '../user/entities/user.entity';
import { UserService } from '../../user/user.service';

interface GqlContext {
  req: Request; // Ensures `req` exists in the context
}

// Custom metadata key
export const IS_PUBLIC_KEY = 'isPublic';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if the route is marked as public
    const isPublic = this.reflector.get<boolean>(
      IS_PUBLIC_KEY,
      context.getHandler(),
    );
    if (isPublic) {
      return true; // ✅ Skip guard
    }

    // Extract request from GraphQL context
    const ctx = GqlExecutionContext.create(context);
    // const req: Request = ctx.getContext().req;
    const { req } = ctx.getContext<GqlContext>();

    const authHeader = req.headers.authorization;
    if (!authHeader) return false;

    const token = authHeader.split(' ')[1]; // Bearer <token>

    if (!req || !authHeader || !authHeader.startsWith('Bearer ') || !token) {
      throw new UnauthorizedException('No token provided');
    }

    if (!token) return false;

    // let decodedToken: Partial<User>;
    try {
      // ✅ This will throw an error if the token is expired
      // decodedToken = await this.jwtService.verifyAsync(token, {
      //   secret: process.env.JWT_SECRET,
      // });
      await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      return true;
    } catch (error: any) {
      if (error instanceof Error && error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token has expired');
      }
      throw new UnauthorizedException('Invalid token Server');
    }
  }
}
