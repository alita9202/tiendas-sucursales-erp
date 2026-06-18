import { IsUUID, IsInt, IsNumber, IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { MovementType } from '../../domain/entities/inventory-stock.entity';

export class CreateInventoryMovementDto {
  @IsUUID()
  branch_id: string;

  @IsUUID()
  product_id: string;

  @IsEnum(MovementType)
  movement_type: MovementType;

  @IsInt()
  quantity: number;

  @IsNumber()
  unit_cost: number;

  @IsString()
  @IsOptional()
  reference?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsDateString()
  @IsOptional()
  movement_date?: Date;
}
