import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
  HttpException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from '@prisma/client';
// import { Prisma, User as PrismaUser } from '@prisma/client';

import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { StandardLoginInput } from '../auth/dto/create-auth.input';
// import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async createUserWithStandardLogin(
    standardLoginInput: StandardLoginInput,
  ): Promise<StandardLoginInput> {
    try {
      return await this.prisma.user.create({ data: standardLoginInput });
    } catch (error) {
      return this.handleException(error, 'Failed to create user.');
    }
  }

  // 🔹 Update Biometric Key
  async updateBiometric(userId: string, biometricKey: string) {
    try {
      return this.prisma.user.update({
        where: { id: userId },
        data: { biometricKey },
      });
    } catch (error: any) {
      return this.handleException(error, 'Failed to update biometric key');
    }
  }

  async findAllUsers(): Promise<User[]> {
    try {
      return (await this.prisma.user.findMany()) as unknown as User[];
    } catch (error) {
      return this.handleException(error, 'Failed to retrieve users.');
    }
  }

  async findOneUser(id: string): Promise<User> {
    try {
      const user = await this.prisma.user.findUnique({ where: { id } });
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found.`);
      }
      return user as unknown as User;
    } catch (error) {
      return this.handleException(error, 'Failed to fetch user.');
    }
  }

  async updateOneUser(
    id: string,
    updateUserInput: UpdateUserInput,
  ): Promise<User> {
    try {
      return (await this.prisma.user.update({
        where: { id },
        data: updateUserInput,
      })) as unknown as User;
    } catch (error) {
      return this.handleException(error, `Failed to update user.`);
    }
  }

  async removeOneUser(id: string): Promise<string> {
    try {
      await this.prisma.user.delete({ where: { id } });
      return `User with ID ${id} has been removed successfully.`;
    } catch (error) {
      return this.handleException(error, `Failed to delete user.`);
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
