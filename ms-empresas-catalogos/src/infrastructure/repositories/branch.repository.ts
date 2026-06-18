import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch } from '../../domain/entities/branch.entity';

@Injectable()
export class BranchRepository {
  constructor(
    @InjectRepository(Branch)
    private readonly repository: Repository<Branch>,
  ) {}

  async findAll(): Promise<Branch[]> {
    return this.repository.find({ relations: { company: true } });
  }

  async findOne(id: string): Promise<Branch | null> {
    return this.repository.findOne({ where: { id }, relations: { company: true } });
  }

  async findByCompany(companyId: string): Promise<Branch[]> {
    return this.repository.find({ where: { company_id: companyId }, relations: { company: true } });
  }

  async create(branch: Partial<Branch>): Promise<Branch> {
    const newBranch = this.repository.create(branch);
    return this.repository.save(newBranch);
  }

  async update(id: string, branch: Partial<Branch>): Promise<Branch | null> {
    await this.repository.update(id, branch);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
