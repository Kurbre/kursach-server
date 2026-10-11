import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator'

export class UpdateReviewDto {
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(5)
  rating?: number

  @IsString()
  @IsOptional()
  comment?: string
}