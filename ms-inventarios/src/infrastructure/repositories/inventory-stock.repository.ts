import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryStock } from '../../domain/entities/inventory-stock.entity';

@Injectable()
export class InventoryStockRepository {
  constructor(
    @InjectRepository(InventoryStock)
    private readonly repository: Repository<InventoryStock>,
  ) {}

  async create(stock: Partial<InventoryStock>): Promise<InventoryStock> {
    const newStock = this.repository.create(stock);
    return await this.repository.save(newStock);
  }

  async findAll(): Promise<InventoryStock[]> {
    return await this.repository.find({ where: { is_active: true } });
  }

  async findById(id: string): Promise<InventoryStock | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async findByBranch(branchId: string): Promise<InventoryStock[]> {
    return await this.repository.find({ where: { branch_id: branchId, is_active: true } });
  }

  async findByProduct(productId: string): Promise<InventoryStock[]> {
    return await this.repository.find({ where: { product_id: productId, is_active: true } });
  }

  async findByBranchAndProduct(branchId: string, productId: string): Promise<InventoryStock | null> {
    return await this.repository.findOne({ 
      where: { branch_id: branchId, product_id: productId, is_active: true } 
    });
  }

  async update(id: string, stock: Partial<InventoryStock>): Promise<InventoryStock | null> {
    await this.repository.update(id, stock);
    return await this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }
}
