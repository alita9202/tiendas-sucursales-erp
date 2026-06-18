import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BranchService } from '../../application/services/branch.service';
import { CreateBranchDto } from '../../application/dto/create-branch.dto';
import { UpdateBranchDto } from '../../application/dto/update-branch.dto';
import { Branch } from '../../domain/entities/branch.entity';

@ApiTags('branches')
@Controller('branches')
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Get()
  @ApiOperation({ summary: 'Get all branches' })
  @ApiResponse({ status: 200, description: 'Return all branches', type: [Branch] })
  async findAll(): Promise<Branch[]> {
    return this.branchService.findAll();
  }

  @Get('company/:companyId')
  @ApiOperation({ summary: 'Get branches by company ID' })
  @ApiResponse({ status: 200, description: 'Return branches for a company', type: [Branch] })
  async findByCompany(@Param('companyId') companyId: string): Promise<Branch[]> {
    return this.branchService.findByCompany(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a branch by ID' })
  @ApiResponse({ status: 200, description: 'Return a branch', type: Branch })
  async findOne(@Param('id') id: string): Promise<Branch> {
    return this.branchService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new branch' })
  @ApiResponse({ status: 201, description: 'Branch created successfully', type: Branch })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createBranchDto: CreateBranchDto): Promise<Branch> {
    return this.branchService.create(createBranchDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a branch' })
  @ApiResponse({ status: 200, description: 'Branch updated successfully', type: Branch })
  async update(@Param('id') id: string, @Body() updateBranchDto: UpdateBranchDto): Promise<Branch> {
    return this.branchService.update(id, updateBranchDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a branch' })
  @ApiResponse({ status: 204, description: 'Branch deleted successfully' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.branchService.remove(id);
  }
}
