import { IsUUID, IsString, IsOptional, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateSaleItemDto } from './create-sale-item.dto';
import { SaleStatus } from '../../domain/entities/sale.entity';

export class CreateSaleDto {
  @IsUUID()
  branch_id: string;

  @IsUUID()
  @IsOptional()
  customer_id?: string;

  @IsString()
  receipt_number: string;

  @IsString()
  payment_method: string;

  @IsEnum(SaleStatus)
  @IsOptional()
  status?: SaleStatus;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  items: CreateSaleItemDto[];
}
