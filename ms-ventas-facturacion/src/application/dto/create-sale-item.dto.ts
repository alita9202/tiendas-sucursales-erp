import { IsString, IsInt, IsNumber } from 'class-validator';

export class CreateSaleItemDto {
  @IsString()
  product_id: string;

  @IsInt()
  quantity: number;

  @IsNumber()
  unit_price: number;
}
