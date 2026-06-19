import { IsUUID, IsInt, IsNumber } from 'class-validator';

export class CreateSaleItemDto {
  @IsUUID()
  product_id: string;

  @IsInt()
  quantity: number;

  @IsNumber()
  unit_price: number;
}
