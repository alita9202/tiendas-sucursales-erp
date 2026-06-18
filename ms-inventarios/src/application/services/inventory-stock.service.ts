import { Injectable, NotFoundException } from '@nestjs/common';
import { InventoryStockRepository } from '../../infrastructure/repositories/inventory-stock.repository';
import { CreateInventoryStockDto } from '../dto/create-inventory-stock.dto';
import { UpdateInventoryStockDto } from '../dto/update-inventory-stock.dto';

@Injectable()
export class InventoryStockService {
  constructor(private readonly repository: InventoryStockRepository) {}

  async create(createDto: CreateInventoryStockDto): Promise<any> {
    // Check if stock already exists for this branch and product
    const existing = await this.repository.findByBranchAndProduct(
      createDto.branch_id,
      createDto.product_id,
    );
    
    if (existing) {
      throw new NotFoundException('Stock already exists for this branch and product');
    }

    return await this.repository.create(createDto);
  }

  async findAll(): Promise<any[]> {
    return await this.repository.findAll();
  }

  async findById(id: string): Promise<any> {
    const stock = await this.repository.findById(id);
    if (!stock) {
      throw new NotFoundException('Stock not found');
    }
    return stock;
  }

  async findByBranch(branchId: string): Promise<any[]> {
    return await this.repository.findByBranch(branchId);
  }

  async findByProduct(productId: string): Promise<any[]> {
    return await this.repository.findByProduct(productId);
  }

  async update(id: string, updateDto: UpdateInventoryStockDto): Promise<any> {
    const stock = await this.repository.findById(id);
    if (!stock) {
      throw new NotFoundException('Stock not found');
    }
    return await this.repository.update(id, updateDto);
  }

  async delete(id: string): Promise<void> {
    const stock = await this.repository.findById(id);
    if (!stock) {
      throw new NotFoundException('Stock not found');
    }
    await this.repository.delete(id);
  }

  async updateQuantity(id: string, quantity: number): Promise<any> {
    const stock = await this.repository.findById(id);
    if (!stock) {
      throw new NotFoundException('Stock not found');
    }
    return await this.repository.update(id, { quantity: stock.quantity + quantity });
  }
}
