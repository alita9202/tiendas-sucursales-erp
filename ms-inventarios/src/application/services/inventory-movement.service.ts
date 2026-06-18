import { Injectable, NotFoundException } from '@nestjs/common';
import { InventoryMovementRepository } from '../../infrastructure/repositories/inventory-movement.repository';
import { CreateInventoryMovementDto } from '../dto/create-inventory-movement.dto';
import { UpdateInventoryMovementDto } from '../dto/update-inventory-movement.dto';

@Injectable()
export class InventoryMovementService {
  constructor(private readonly repository: InventoryMovementRepository) {}

  async create(createDto: CreateInventoryMovementDto): Promise<any> {
    return await this.repository.create(createDto);
  }

  async findAll(): Promise<any[]> {
    return await this.repository.findAll();
  }

  async findById(id: string): Promise<any> {
    const movement = await this.repository.findById(id);
    if (!movement) {
      throw new NotFoundException('Movement not found');
    }
    return movement;
  }

  async findByBranch(branchId: string): Promise<any[]> {
    return await this.repository.findByBranch(branchId);
  }

  async findByProduct(productId: string): Promise<any[]> {
    return await this.repository.findByProduct(productId);
  }

  async findByBranchAndProduct(branchId: string, productId: string): Promise<any[]> {
    return await this.repository.findByBranchAndProduct(branchId, productId);
  }

  async findByMovementType(movementType: string): Promise<any[]> {
    return await this.repository.findByMovementType(movementType);
  }

  async update(id: string, updateDto: UpdateInventoryMovementDto): Promise<any> {
    const movement = await this.repository.findById(id);
    if (!movement) {
      throw new NotFoundException('Movement not found');
    }
    return await this.repository.update(id, updateDto);
  }

  async delete(id: string): Promise<void> {
    const movement = await this.repository.findById(id);
    if (!movement) {
      throw new NotFoundException('Movement not found');
    }
    await this.repository.delete(id);
  }
}
