import { Injectable, NotFoundException } from '@nestjs/common';
import { BranchRepository } from '../../infrastructure/repositories/branch.repository';
import { CreateBranchDto } from '../dto/create-branch.dto';
import { UpdateBranchDto } from '../dto/update-branch.dto';
import { Branch } from '../../domain/entities/branch.entity';

@Injectable()
export class BranchService {
  constructor(private readonly branchRepository: BranchRepository) {}

  async findAll(): Promise<Branch[]> {
    return this.branchRepository.findAll();
  }

  async findOne(id: string): Promise<Branch> {
    const branch = await this.branchRepository.findOne(id);
    if (!branch) {
      throw new NotFoundException(`Branch with ID ${id} not found`);
    }
    return branch;
  }

  async findByCompany(companyId: string): Promise<Branch[]> {
    return this.branchRepository.findByCompany(companyId);
  }

  async create(createBranchDto: CreateBranchDto): Promise<Branch> {
    return this.branchRepository.create(createBranchDto);
  }

  async update(id: string, updateBranchDto: UpdateBranchDto): Promise<Branch> {
    await this.findOne(id);
    const updated = await this.branchRepository.update(id, updateBranchDto);
    if (!updated) {
      throw new NotFoundException(`Branch with ID ${id} not found after update`);
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.branchRepository.remove(id);
  }
}
