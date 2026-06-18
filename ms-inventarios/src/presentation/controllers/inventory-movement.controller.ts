import { Controller, Get, Post, Put, Delete, Body, Param, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InventoryMovementService } from '../../application/services/inventory-movement.service';
import { CreateInventoryMovementDto } from '../../application/dto/create-inventory-movement.dto';
import { UpdateInventoryMovementDto } from '../../application/dto/update-inventory-movement.dto';

@ApiTags('inventory-movement')
@Controller('inventory-movement')
export class InventoryMovementController {
  constructor(private readonly service: InventoryMovementService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new inventory movement' })
  @ApiResponse({ status: 201, description: 'Movement created successfully' })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async create(@Body() createDto: CreateInventoryMovementDto) {
    return await this.service.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all inventory movements' })
  @ApiResponse({ status: 200, description: 'Movements retrieved successfully' })
  async findAll() {
    return await this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get inventory movement by ID' })
  @ApiResponse({ status: 200, description: 'Movement retrieved successfully' })
  async findById(@Param('id') id: string) {
    return await this.service.findById(id);
  }

  @Get('branch/:branchId')
  @ApiOperation({ summary: 'Get inventory movements by branch' })
  @ApiResponse({ status: 200, description: 'Movements retrieved successfully' })
  async findByBranch(@Param('branchId') branchId: string) {
    return await this.service.findByBranch(branchId);
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Get inventory movements by product' })
  @ApiResponse({ status: 200, description: 'Movements retrieved successfully' })
  async findByProduct(@Param('productId') productId: string) {
    return await this.service.findByProduct(productId);
  }

  @Get('branch/:branchId/product/:productId')
  @ApiOperation({ summary: 'Get inventory movements by branch and product' })
  @ApiResponse({ status: 200, description: 'Movements retrieved successfully' })
  async findByBranchAndProduct(@Param('branchId') branchId: string, @Param('productId') productId: string) {
    return await this.service.findByBranchAndProduct(branchId, productId);
  }

  @Get('type/:movementType')
  @ApiOperation({ summary: 'Get inventory movements by type' })
  @ApiResponse({ status: 200, description: 'Movements retrieved successfully' })
  async findByMovementType(@Param('movementType') movementType: string) {
    return await this.service.findByMovementType(movementType);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update inventory movement' })
  @ApiResponse({ status: 200, description: 'Movement updated successfully' })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async update(@Param('id') id: string, @Body() updateDto: UpdateInventoryMovementDto) {
    return await this.service.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete inventory movement' })
  @ApiResponse({ status: 200, description: 'Movement deleted successfully' })
  async delete(@Param('id') id: string) {
    return await this.service.delete(id);
  }
}
