import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Sale } from '../../domain/entities/sale.entity';

@Injectable()
export class SaleRepository {
  constructor(
    @InjectRepository(Sale)
    private readonly repository: Repository<Sale>,
  ) {}

  async create(sale: DeepPartial<Sale>): Promise<Sale> {
    const newSale = this.repository.create(sale);
    return await this.repository.save(newSale);
  }

  async findAll(): Promise<Sale[]> {
    return await this.repository.find({ relations: { items: true } });
  }

  async findById(id: string): Promise<Sale | null> {
    return await this.repository.findOne({ where: { id }, relations: { items: true } });
  }

  async findByBranch(branchId: string): Promise<Sale[]> {
    return await this.repository.find({ where: { branch_id: branchId }, relations: { items: true } });
  }

  async update(id: string, sale: Partial<Sale>): Promise<Sale | null> {
    await this.repository.update(id, sale);
    return await this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
