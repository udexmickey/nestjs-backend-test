import { AuthService } from '../auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Test, TestingModule } from '@nestjs/testing';
import { mockPrismaService } from '../mocks/prisma.service.mock';
import { mockJwtService } from '../mocks/jwt.service.mock';
import {
  ConflictException,
  // UnauthorizedException,
  // NotFoundException,
} from '@nestjs/common';
import { mockUserService } from '../../user/__mocks__/user.service.mock';

// ✅ Mock password hashing functions
jest.mock('../../common/utils/hash.util', () => ({
  comparePassword: jest.fn(),
  hashPassword: jest.fn(),
}));

import { hashPassword, comparePassword } from '../../common/utils/hash.util';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { UserService } from '../../user/user.service';

describe('AuthService', () => {
  let authService: AuthService;
  // let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: 'test-secret' })],
      providers: [
        AuthService,
        // UserService,
        PrismaService,
        JwtService,
        // { provide: 'PrismaService', useValue: mockPrismaService },
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    // authService = module.get<AuthService>(AuthService);
    authService = module.get<AuthService>(AuthService);
    // userService = module.get<UserService>(UserService);

    // ✅ Reset mocks before each test
    (hashPassword as jest.Mock).mockReset();
    (comparePassword as jest.Mock).mockReset();
  });

  describe('registerUser', () => {
    it('should register a user successfully', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      (hashPassword as jest.Mock).mockResolvedValue('hashed_password');
      mockUserService.createUserStandardLogin.mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        passport: '1234',
      });

      const result = await authService.registerUser({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual({
        message: 'Registration successfully',
        authorization: {
          access_token: 'mocked_jwt_token',
          type: 'Bearer',
        },
      });

      expect(hashPassword).toHaveBeenCalledWith('password123');
    });

    it('should throw a ConflictException if email already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        email: 'test@example.com',
      });

      await expect(
        authService.registerUser({
          email: 'test@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  // describe('standardLogin', () => {
  //   it('should login successfully with correct credentials', async () => {
  //     mockPrismaService.user.findUnique.mockResolvedValue({
  //       id: '1',
  //       email: 'test@example.com',
  //       password: 'hashed_password',
  //     });
  //     (comparePassword as jest.Mock).mockResolvedValue(true);

  //     const result = await authService.standardLogin({
  //       email: 'test@example.com',
  //       password: 'password123',
  //     });

  //     expect(result).toEqual({
  //       message: 'Login successfully',
  //       authorization: {
  //         access_token: 'mocked_jwt_token',
  //         type: 'Bearer',
  //       },
  //     });

  //     // ✅ Ensure password comparison was called with the right values
  //     expect(comparePassword).toHaveBeenCalledWith(
  //       'password123',
  //       'hashed_password',
  //     );
  //   });

  //   it('should throw an UnauthorizedException for incorrect password', async () => {
  //     mockPrismaService.user.findUnique.mockResolvedValue({
  //       email: 'test@example.com',
  //       password: 'hashed_password',
  //     });
  //     (comparePassword as jest.Mock).mockResolvedValue(false);

  //     await expect(
  //       authService.standardLogin({
  //         email: 'test@example.com',
  //         password: 'wrongpassword',
  //       }),
  //     ).rejects.toThrow(UnauthorizedException);
  //   });

  //   it('should throw an UnauthorizedException if email does not exist', async () => {
  //     mockPrismaService.user.findUnique.mockResolvedValue(null);

  //     await expect(
  //       authService.standardLogin({
  //         email: 'nonexistent@example.com',
  //         password: 'password123',
  //       }),
  //     ).rejects.toThrow(UnauthorizedException);
  //   });
  // });

  // describe('registerBiometric', () => {
  //   it('should register biometric key successfully', async () => {
  //     mockPrismaService.user.findUnique.mockResolvedValue({ id: '1' });
  //     (hashPassword as jest.Mock).mockResolvedValue('hashed_biometric');
  //     mockUserService.updateBiometric.mockResolvedValue(true);

  //     const result = await authService.registerBiometric('1', 'biometric_key');

  //     expect(result).toEqual({
  //       message: 'Biometric registration successfully',
  //     });

  //     // ✅ Ensure biometric key hashing function was called correctly
  //     expect(hashPassword).toHaveBeenCalledWith('biometric_key');
  //   });

  //   it('should throw NotFoundException if user does not exist', async () => {
  //     mockPrismaService.user.findUnique.mockResolvedValue(null);

  //     await expect(
  //       authService.registerBiometric('1', 'biometric_key'),
  //     ).rejects.toThrow(NotFoundException);
  //   });
  // });

  // describe('loginWithBiometric', () => {
  //   it('should login successfully with valid biometric key', async () => {
  //     mockPrismaService.user.findMany.mockResolvedValue([
  //       {
  //         id: '1',
  //         email: 'test@example.com',
  //         biometricKey: 'hashed_biometric',
  //       },
  //     ]);
  //     (comparePassword as jest.Mock).mockResolvedValue(true);

  //     const result = await authService.loginWithBiometric('biometric_key');

  //     expect(result).toEqual({
  //       message: 'Login with biometric key was successful',
  //       authorization: {
  //         access_token: 'mocked_jwt_token',
  //         type: 'Bearer',
  //       },
  //     });

  //     // ✅ Ensure biometric comparison was called with the right values
  //     expect(comparePassword).toHaveBeenCalledWith(
  //       'biometric_key',
  //       'hashed_biometric',
  //     );
  //   });

  //   it('should throw UnauthorizedException for invalid biometric key', async () => {
  //     mockPrismaService.user.findMany.mockResolvedValue([
  //       {
  //         id: '1',
  //         email: 'test@example.com',
  //         biometricKey: 'hashed_biometric',
  //       },
  //     ]);
  //     (comparePassword as jest.Mock).mockResolvedValue(false);

  //     await expect(authService.loginWithBiometric('wrong_key')).rejects.toThrow(
  //       UnauthorizedException,
  //     );
  //   });

  //   it('should throw UnauthorizedException if no biometric users exist', async () => {
  //     mockPrismaService.user.findMany.mockResolvedValue([]);

  //     await expect(
  //       authService.loginWithBiometric('biometric_key'),
  //     ).rejects.toThrow(UnauthorizedException);
  //   });
  // });
});
