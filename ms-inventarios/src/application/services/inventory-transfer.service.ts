import { Injectable, NotFoundException } from '@nestjs/common';
import { InventoryTransferRepository } from '../../infrastructure/repositories/inventory-transfer.repository';
import { CreateInventoryTransferDto } from '../dto/create-inventory-transfer.dto';
import { UpdateInventoryTransferDto } from '../dto/update-inventory-transfer.dto';
import { TransferStatus } from '../../domain/entities/inventory-transfer.entity';

@Injectable()
export class InventoryTransferService {
  constructor(private readonly repository: InventoryTransferRepository) {}

  async create(createDto: CreateInventoryTransferDto): Promise<any> {
    const { items, ...transferData } = createDto;
    return await this.repository.create(transferData as any);
  }

  async findAll(): Promise<any[]> {
    return await this.repository.findAll();
  }

  async findById(id: string): Promise<any> {
    const transfer = await this.repository.findById(id);
    if (!transfer) {
      throw new NotFoundException('Transfer not found');
    }
    return transfer;
  }

  async findBySourceBranch(branchId: string): Promise<any[]> {
    return await this.repository.findBySourceBranch(branchId);
  }

  async findByDestinationBranch(branchId: string): Promise<any[]> {
    return await this.repository.findByDestinationBranch(branchId);
  }

  async findByStatus(status: string): Promise<any[]> {
    return await this.repository.findByStatus(status);
  }

  async update(id: string, updateDto: UpdateInventoryTransferDto): Promise<any> {
    const transfer = await this.repository.findById(id);
    if (!transfer) {
      throw new NotFoundException('Transfer not found');
    }
    const { items, ...transferData } = updateDto;
    return await this.repository.update(id, transferData);
  }

  async delete(id: string): Promise<void> {
    const transfer = await this.repository.findById(id);
    if (!transfer) {
      throw new NotFoundException('Transfer not found');
    }
    await this.repository.delete(id);
  }

  async updateStatus(id: string, status: TransferStatus): Promise<any> {
    const transfer = await this.repository.findById(id);
    if (!transfer) {
      throw new NotFoundException('Transfer not found');
    }
    
    const updateData: any = { status };
    if (status === TransferStatus.COMPLETED) {
      updateData.completed_date = new Date();
    }
    
    return await this.repository.update(id, updateData);
  }
}
