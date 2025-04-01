import { StandardLoginInput } from './create-auth.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateAuthInput extends PartialType(StandardLoginInput) {
  @Field(() => Int)
  id: number;
}
