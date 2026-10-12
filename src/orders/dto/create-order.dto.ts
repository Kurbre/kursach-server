import { IsOptional, IsEnum } from 'class-validator';

export enum DeliveryMethod {
  COURIER = 'courier',
  NOVA_POSHTA = 'nova_poshta'
}

export class CreateOrderDto {
  @IsOptional()
  @IsEnum(DeliveryMethod)
  deliveryMethod?: DeliveryMethod;

  @IsOptional()
  deliveryInfo?: Record<string, any>;
}