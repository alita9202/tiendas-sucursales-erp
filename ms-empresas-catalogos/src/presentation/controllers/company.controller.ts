import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CompanyService } from '../../application/services/company.service';
import { CreateCompanyDto } from '../../application/dto/create-company.dto';
import { UpdateCompanyDto } from '../../application/dto/update-company.dto';
import { Company } from '../../domain/entities/company.entity';

@ApiTags('companies')
@Controller('companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get()
  @ApiOperation({ summary: 'Get all companies' })
  @ApiResponse({ status: 200, description: 'Return all companies', type: [Company] })
  async findAll(): Promise<Company[]> {
    return this.companyService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a company by ID' })
  @ApiResponse({ status: 200, description: 'Return a company', type: Company })
  async findOne(@Param('id') id: string): Promise<Company> {
    return this.companyService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new company' })
  @ApiResponse({ status: 201, description: 'Company created successfully', type: Company })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCompanyDto: CreateCompanyDto): Promise<Company> {
    return this.companyService.create(createCompanyDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a company' })
  @ApiResponse({ status: 200, description: 'Company updated successfully', type: Company })
  async update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto): Promise<Company> {
    return this.companyService.update(id, updateCompanyDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a company' })
  @ApiResponse({ status: 204, description: 'Company deleted successfully' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.companyService.remove(id);
  }
}
