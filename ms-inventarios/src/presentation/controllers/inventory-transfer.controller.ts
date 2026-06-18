import { Controller, Get, Post, Put, Delete, Body, Param, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InventoryTransferService } from '../../application/services/inventory-transfer.service';
import { CreateInventoryTransferDto } from '../../application/dto/create-inventory-transfer.dto';
import { UpdateInventoryTransferDto } from '../../application/dto/update-inventory-transfer.dto';
import { TransferStatus } from '../../domain/entities/inventory-transfer.entity';

@ApiTags('inventory-transfer')
@Controller('inventory-transfer')
export class InventoryTransferController {
  constructor(private readonly service: InventoryTransferService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new inventory transfer' })
  @ApiResponse({ status: 201, description: 'Transfer created successfully' })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async create(@Body() createDto: CreateInventoryTransferDto) {
    return await this.service.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all inventory transfers' })
  @ApiResponse({ status: 200, description: 'Transfers retrieved successfully' })
  async findAll() {
    return await this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get inventory transfer by ID' })
  @ApiResponse({ status: 200, description: 'Transfer retrieved successfully' })
  async findById(@Param('id') id: string) {
    return await this.service.findById(id);
  }

  @Get('source/:branchId')
  @ApiOperation({ summary: 'Get inventory transfers by source branch' })
  @ApiResponse({ status: 200, description: 'Transfers retrieved successfully' })
  async findBySourceBranch(@Param('branchId') branchId: string) {
    return await this.service.findBySourceBranch(branchId);
  }

  @Get('destination/:branchId')
  @ApiOperation({ summary: 'Get inventory transfers by destination branch' })
  @ApiResponse({ status: 200, description: 'Transfers retrieved successfully' })
  async findByDestinationBranch(@Param('branchId') branchId: string) {
    return await this.service.findByDestinationBranch(branchId);
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Get inventory transfers by status' })
  @ApiResponse({ status: 200, description: 'Transfers retrieved successfully' })
  async findByStatus(@Param('status') status: string) {
    return await this.service.findByStatus(status);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update inventory transfer' })
  @ApiResponse({ status: 200, description: 'Transfer updated successfully' })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async update(@Param('id') id: string, @Body() updateDto: UpdateInventoryTransferDto) {
    return await this.service.update(id, updateDto);
  }

  @Put(':id/status/:status')
  @ApiOperation({ summary: 'Update transfer status' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  async updateStatus(@Param('id') id: string, @Param('status') status: TransferStatus) {
    return await this.service.updateStatus(id, status);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete inventory transfer' })
  @ApiResponse({ status: 200, description: 'Transfer deleted successfully' })
  async delete(@Param('id') id: string) {
    return await this.service.delete(id);
  }
}
