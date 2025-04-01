import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import {
  // BiometricLoginInput,
  StandardLoginInput,
} from './dto/create-auth.input';
import { AuthResponse, BiometricResponse } from '../common/types/auth.types';
import { Public } from '../common/decorator/public.decorator';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => AuthResponse)
  @Public()
  async standardRegisteration(
    @Args('createUserInput') input: StandardLoginInput,
  ): Promise<AuthResponse> {
    return this.authService.registerUser(input);
  }

  @Mutation(() => AuthResponse)
  @Public()
  async standardLogin(
    @Args('creatStandardLoginInput') input: StandardLoginInput,
  ): Promise<AuthResponse> {
    return this.authService.standardLogin(input);
  }

  @Mutation(() => BiometricResponse)
  async registerBiometric(
    @Args('userId') userId: string,
    @Args('biometricKeyRegisterInput')
    biometricKeyRegisterInput: string,
  ): Promise<BiometricResponse> {
    return await this.authService.registerBiometric(
      userId,
      biometricKeyRegisterInput,
    );
  }

  @Mutation(() => AuthResponse)
  @Public()
  async loginWithBiometric(
    @Args('biometricKeyLoginInput') biometricKey: string,
  ) {
    return await this.authService.loginWithBiometric(biometricKey);
  }

  @Mutation(() => BiometricResponse)
  async resetBiometricKey(
    @Args('userId') userId: string,
    @Args('biometricKeyResetInput') biometricKey: string,
  ) {
    return await this.authService.resetBiometricKey(userId, biometricKey);
  }
}
