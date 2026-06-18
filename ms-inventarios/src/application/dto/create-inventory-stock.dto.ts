import { IsUUID, IsInt, IsNumber, IsOptional, IsBoolean, IsDateString } from 'class-validator';

export class CreateInventoryStockDto {
  @IsUUID()
  branch_id: string;

  @IsUUID()
  product_id: string;

  @IsInt()
  quantity: number;

  @IsNumber()
  @IsOptional()
  unit_cost?: number;

  @IsDateString()
  @IsOptional()
  last_restock_date?: Date;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
