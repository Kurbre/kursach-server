import { IsIn, IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer'

export class ProductFilterDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  brandId?: string;

  @IsOptional()
  @IsString()
  modelId?: string;

  @IsOptional()
  @IsString()
  colorId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @IsIn(['newest', 'price-asc', 'price-desc'])
  sortBy?: 'newest' | 'price-asc' | 'price-desc';
}