import { IsUUID, IsString, IsOptional, IsEnum } from 'class-validator';
import { SaleStatus } from '../../domain/entities/sale.entity';

export class UpdateSaleDto {
  @IsUUID()
  @IsOptional()
  customer_id?: string;

  @IsString()
  @IsOptional()
  payment_method?: string;

  @IsEnum(SaleStatus)
  @IsOptional()
  status?: SaleStatus;
}
