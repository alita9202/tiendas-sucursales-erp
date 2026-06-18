import { Injectable, NotFoundException } from '@nestjs/common';
import { CompanyRepository } from '../../infrastructure/repositories/company.repository';
import { CreateCompanyDto } from '../dto/create-company.dto';
import { UpdateCompanyDto } from '../dto/update-company.dto';
import { Company } from '../../domain/entities/company.entity';

@Injectable()
export class CompanyService {
  constructor(private readonly companyRepository: CompanyRepository) {}

  async findAll(): Promise<Company[]> {
    return this.companyRepository.findAll();
  }

  async findOne(id: string): Promise<Company> {
    const company = await this.companyRepository.findOne(id);
    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }
    return company;
  }

  async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    return this.companyRepository.create(createCompanyDto);
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto): Promise<Company> {
    await this.findOne(id);
    const updated = await this.companyRepository.update(id, updateCompanyDto);
    if (!updated) {
      throw new NotFoundException(`Company with ID ${id} not found after update`);
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.companyRepository.remove(id);
  }
}
