import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Authorization {
  @Field(() => String || undefined)
  access_token: string | undefined;

  @Field()
  type: string;
}

@ObjectType()
export class AuthResponse {
  @Field()
  message: string;

  @Field(() => Authorization)
  authorization: Authorization;
}

@ObjectType()
export class BiometricResponse {
  @Field()
  message: string;
}
