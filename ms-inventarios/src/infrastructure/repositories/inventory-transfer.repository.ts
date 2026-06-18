import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryTransfer } from '../../domain/entities/inventory-transfer.entity';

@Injectable()
export class InventoryTransferRepository {
  constructor(
    @InjectRepository(InventoryTransfer)
    private readonly repository: Repository<InventoryTransfer>,
  ) {}

  async create(transfer: Partial<InventoryTransfer>): Promise<InventoryTransfer> {
    const newTransfer = this.repository.create(transfer);
    return await this.repository.save(newTransfer);
  }

  async findAll(): Promise<InventoryTransfer[]> {
    return await this.repository.find({ relations: { items: true } });
  }

  async findById(id: string): Promise<InventoryTransfer | null> {
    return await this.repository.findOne({ 
      where: { id },
      relations: { items: true }
    });
  }

  async findBySourceBranch(branchId: string): Promise<InventoryTransfer[]> {
    return await this.repository.find({ 
      where: { source_branch_id: branchId },
      relations: { items: true }
    });
  }

  async findByDestinationBranch(branchId: string): Promise<InventoryTransfer[]> {
    return await this.repository.find({ 
      where: { destination_branch_id: branchId },
      relations: { items: true }
    });
  }

  async findByStatus(status: string): Promise<InventoryTransfer[]> {
    return await this.repository.find({ 
      where: { status: status as any },
      relations: { items: true }
    });
  }

  async update(id: string, transfer: Partial<InventoryTransfer>): Promise<InventoryTransfer | null> {
    await this.repository.update(id, transfer);
    return await this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }
}
