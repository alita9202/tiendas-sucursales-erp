import { IsString, IsOptional, IsBoolean, IsEmail, IsUUID } from 'class-validator';

export class CreateBranchDto {
  @IsUUID()
  company_id: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
