export const mockJwtService = {
  signAsync: jest.fn().mockResolvedValue('mocked_jwt_token'),
  verify: jest.fn(),
};
