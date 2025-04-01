import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { comparePassword, hashPassword } from '../common/utils/hash.util';
import { JwtService } from '@nestjs/jwt';
import { StandardLoginInput } from './dto/create-auth.input';
import { UserService } from '../user/user.service';
import { AuthResponse, BiometricResponse } from '../common/types/auth.types';
import { User } from '../user/entities/user.entity';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async registerUser(
    standardLoginInput: StandardLoginInput,
  ): Promise<AuthResponse> {
    try {
      // Check if user is already registered
      const existingUser = await this.prisma.user.findUnique({
        where: { email: standardLoginInput.email },
      });

      if (existingUser) {
        throw new ConflictException(`Email already exists`);
      }

      const hashedPassword = (await hashPassword(
        standardLoginInput.password,
      )) as unknown as string;

      const payload: StandardLoginInput = {
        ...standardLoginInput,
        password: hashedPassword,
      };

      const user = await this.userService.createUserWithStandardLogin(payload);

      const access_token = (await this.signJwtToken(
        user as unknown as Partial<User>,
      )) as unknown as string | undefined;

      return {
        message: 'Registration successfully',
        authorization: {
          access_token,
          type: 'Bearer',
        },
      };
    } catch (error) {
      return this.handleException(error, 'Registration failed');
    }
  }

  // 🔹 Register Biometric Key
  async registerBiometric(
    userId: string,
    biometricKey: string,
  ): Promise<BiometricResponse> {
    // Check if user exists
    if (!biometricKey) {
      throw new BadRequestException('Biometric key cannot be empty.');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found. Please sign up first.');
    }

    try {
      const hashedPassword = await hashPassword(biometricKey);
      await this.userService.updateBiometric(userId, hashedPassword);

      return {
        message: 'Biometric registration successfully',
      };
    } catch (error) {
      return this.handleException(error, 'Biometric key reset failed');
    }
  }

  async standardLogin(
    standardLoginInput: StandardLoginInput,
  ): Promise<AuthResponse> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: standardLoginInput.email },
      });

      if (!user) throw new UnauthorizedException('Invalid email or password');

      const isValidPassword = await comparePassword(
        standardLoginInput.password,
        user.password,
      );
      if (!isValidPassword)
        throw new UnauthorizedException('Invalid email or password');

      const access_token = this.signJwtToken(
        user as unknown as Partial<User>,
      ) as unknown as string | undefined;

      return {
        message: 'Login successfully',
        authorization: {
          access_token,
          type: 'Bearer',
        },
      };
    } catch (error) {
      return this.handleException(error, 'Standard login failed');
    }
  }

  private generateToken(userId: string, email: string) {
    return {
      accessToken: this.jwtService.sign({ userId, email }),
    };
  }

  // 🔹 Biometric Login
  async loginWithBiometric(biometricKey: string): Promise<AuthResponse> {
    if (!biometricKey) {
      throw new BadRequestException('Biometric key is required.');
    }

    // Fetch users with biometric key (but don't expose all user data)
    const users = await this.prisma.user.findMany({
      where: { biometricKey: { not: null } },
      select: { id: true, email: true, biometricKey: true }, // Select only needed fields
    });

    if (!users.length) {
      throw new UnauthorizedException(
        'No users found with biometric authentication enabled.',
      );
    }

    // Compare biometric keys asynchronously
    const matches = await Promise.all(
      users.map(async (user) => ({
        user,
        isMatch: await comparePassword(
          biometricKey,
          user.biometricKey as unknown as string,
        ),
      })),
    );

    // Find the first matched user
    const matchedUser = matches.find((match) => match.isMatch)?.user;

    if (!matchedUser) {
      throw new UnauthorizedException('Invalid biometric key');
    }

    // Generate JWT token
    const payload = { id: matchedUser.id, email: matchedUser.email };

    const access_token = this.signJwtToken(payload) as unknown as string;

    return {
      message: 'Login with biometric key was successful',
      authorization: {
        access_token,
        type: 'Bearer',
      },
    };
  }

  // 🔹 Reset Biometric Key
  async resetBiometricKey(
    userId: string,
    biometricKey: string,
  ): Promise<BiometricResponse> {
    if (!biometricKey) {
      throw new BadRequestException('Biometric key cannot be empty.');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found. Please sign up first.');
    }

    try {
      const hashedPassword = await hashPassword(biometricKey);
      await this.userService.updateBiometric(userId, hashedPassword);

      return { message: 'Biometric key reset successfully' };
    } catch (error) {
      return this.handleException(error, 'Biometric key reset failed');
    }
  }

  async signJwtToken(body: Partial<User>) {
    try {
      if (!body || !body.id || !body.email) {
        throw new BadGatewayException('Invalid body parameters');
      }

      // Sign JWT Token with email, id, and adminRole
      const JwtToken = await this.jwtService.signAsync({
        sub: body.id,
        user_email: body.email,
      });

      if (!JwtToken) {
        throw new BadGatewayException('JWT Token not available for signup');
      }

      return JwtToken;
    } catch (error) {
      // Check if error is an instance of HttpException
      if (error instanceof HttpException) {
        throw error;
      }
      // ✅ Handle unexpected errors with 500 status code
      // Fallback for unknown errors
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'An unexpected error occurred',
      );
    }
  }

  /**
   * Centralized error handler
   */
  private handleException(error: unknown, message: string): never {
    // ✅ If it's already an HTTP exception (e.g., ConflictException), preserve the status code
    if (error instanceof HttpException) {
      throw error;
    }

    // ✅ Handle Prisma-specific errors
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException('Email already exists.');
      }
      if (error.code === 'P2025') {
        throw new NotFoundException('Record not found.');
      }
    }

    // ✅ Default to Internal Server Error, preserving message if available
    throw new InternalServerErrorException(
      error instanceof Error ? error.message : message,
    );
  }
}
