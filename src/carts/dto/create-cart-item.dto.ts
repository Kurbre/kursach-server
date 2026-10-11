import { IsInt, IsPositive, IsUUID } from 'class-validator';

export class CreateCartItemDto {
  @IsUUID()
  productVariantId: string;

  @IsInt()
  @IsPositive()
  quantity: number = 1;
}