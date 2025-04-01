export const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
  },
  biometric: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};
