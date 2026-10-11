import { IsInt, IsPositive, IsOptional } from 'class-validator';

export class UpdateCartItemDto {
  @IsInt()
  @IsPositive()
  @IsOptional()
  quantity?: number;
}