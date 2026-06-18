import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../../domain/entities/company.entity';

@Injectable()
export class CompanyRepository {
  constructor(
    @InjectRepository(Company)
    private readonly repository: Repository<Company>,
  ) {}

  async findAll(): Promise<Company[]> {
    return this.repository.find({ relations: { branches: true } });
  }

  async findOne(id: string): Promise<Company | null> {
    return this.repository.findOne({ where: { id }, relations: { branches: true } });
  }

  async create(company: Partial<Company>): Promise<Company> {
    const newCompany = this.repository.create(company);
    return this.repository.save(newCompany);
  }

  async update(id: string, company: Partial<Company>): Promise<Company | null> {
    await this.repository.update(id, company);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
