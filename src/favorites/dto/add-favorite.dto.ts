import { IsUUID } from 'class-validator';

export class AddFavoriteDto {
  @IsUUID()
  productId: string;
}