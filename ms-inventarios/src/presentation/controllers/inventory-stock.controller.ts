import { Controller, Get, Post, Put, Delete, Body, Param, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InventoryStockService } from '../../application/services/inventory-stock.service';
import { CreateInventoryStockDto } from '../../application/dto/create-inventory-stock.dto';
import { UpdateInventoryStockDto } from '../../application/dto/update-inventory-stock.dto';

@ApiTags('inventory-stock')
@Controller(['inventory-stock', 'api/inventory', 'inventory'])
export class InventoryStockController {
  constructor(private readonly service: InventoryStockService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new inventory stock' })
  @ApiResponse({ status: 201, description: 'Stock created successfully' })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async create(@Body() createDto: CreateInventoryStockDto) {
    return await this.service.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all inventory stocks' })
  @ApiResponse({ status: 200, description: 'Stocks retrieved successfully' })
  async findAll() {
    return await this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get inventory stock by ID' })
  @ApiResponse({ status: 200, description: 'Stock retrieved successfully' })
  async findById(@Param('id') id: string) {
    return await this.service.findById(id);
  }

  @Get('branch/:branchId')
  @ApiOperation({ summary: 'Get inventory stocks by branch' })
  @ApiResponse({ status: 200, description: 'Stocks retrieved successfully' })
  async findByBranch(@Param('branchId') branchId: string) {
    return await this.service.findByBranch(branchId);
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Get inventory stocks by product' })
  @ApiResponse({ status: 200, description: 'Stocks retrieved successfully' })
  async findByProduct(@Param('productId') productId: string) {
    return await this.service.findByProduct(productId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update inventory stock' })
  @ApiResponse({ status: 200, description: 'Stock updated successfully' })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async update(@Param('id') id: string, @Body() updateDto: UpdateInventoryStockDto) {
    return await this.service.update(id, updateDto);
  }

  @Put(':id/quantity/:quantity')
  @ApiOperation({ summary: 'Update stock quantity' })
  @ApiResponse({ status: 200, description: 'Quantity updated successfully' })
  async updateQuantity(@Param('id') id: string, @Param('quantity') quantity: number) {
    return await this.service.updateQuantity(id, quantity);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete inventory stock' })
  @ApiResponse({ status: 200, description: 'Stock deleted successfully' })
  async delete(@Param('id') id: string) {
    return await this.service.delete(id);
  }
}
