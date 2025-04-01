import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field()
  id: string;

  @Field()
  email: string;

  @Field()
  password: string;

  @Field({ nullable: true })
  biometricKey: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
