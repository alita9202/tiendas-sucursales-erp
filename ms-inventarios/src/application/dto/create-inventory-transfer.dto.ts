import { IsUUID, IsString, IsOptional, IsEnum, IsDateString, ArrayMinSize, ValidateNested, IsInt, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { TransferStatus } from '../../domain/entities/inventory-transfer.entity';

export class CreateInventoryTransferItemDto {
  @IsUUID()
  product_id: string;

  @IsInt()
  quantity: number;

  @IsNumber()
  unit_cost: number;
}

export class CreateInventoryTransferDto {
  @IsUUID()
  source_branch_id: string;

  @IsUUID()
  destination_branch_id: string;

  @IsEnum(TransferStatus)
  @IsOptional()
  status?: TransferStatus;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsDateString()
  @IsOptional()
  transfer_date?: Date;

  @ValidateNested({ each: true })
  @Type(() => CreateInventoryTransferItemDto)
  @ArrayMinSize(1)
  items: CreateInventoryTransferItemDto[];
}
