import { Injectable, NotFoundException } from '@nestjs/common';
import { DeepPartial } from 'typeorm';
import { SaleRepository } from '../../infrastructure/repositories/sale.repository';
import { Sale } from '../../domain/entities/sale.entity';
import { CreateSaleDto } from '../dto/create-sale.dto';
import { UpdateSaleDto } from '../dto/update-sale.dto';
import { ReceiptResponseDto, ReceiptItemDto } from '../dto/receipt-response.dto';

@Injectable()
export class SaleService {
  constructor(private readonly repository: SaleRepository) {}

  async create(createDto: CreateSaleDto): Promise<any> {
    const total = createDto.items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
    const saleData: DeepPartial<Sale> = {
      branch_id: createDto.branch_id,
      customer_id: createDto.customer_id,
      receipt_number: createDto.receipt_number,
      payment_method: createDto.payment_method,
      total_amount: total,
      status: createDto.status,
      items: createDto.items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.quantity * item.unit_price,
      })),
    };
    return await this.repository.create(saleData);
  }

  async findAll(): Promise<any[]> {
    return await this.repository.findAll();
  }

  async findById(id: string): Promise<any> {
    const sale = await this.repository.findById(id);
    if (!sale) {
      throw new NotFoundException('Sale not found');
    }
    return sale;
  }

  async findByBranch(branchId: string): Promise<any[]> {
    return await this.repository.findByBranch(branchId);
  }

  async update(id: string, updateDto: UpdateSaleDto): Promise<any> {
    const sale = await this.repository.findById(id);
    if (!sale) {
      throw new NotFoundException('Sale not found');
    }
    return await this.repository.update(id, updateDto);
  }

  async delete(id: string): Promise<void> {
    const sale = await this.repository.findById(id);
    if (!sale) {
      throw new NotFoundException('Sale not found');
    }
    await this.repository.delete(id);
  }

  async getReceipt(id: string): Promise<ReceiptResponseDto> {
    const sale = await this.repository.findById(id);
    if (!sale) {
      throw new NotFoundException('Sale not found');
    }

    const taxRate = 0.13;
    const subtotal = Number(sale.total_amount);
    const taxAmount = parseFloat((subtotal * taxRate).toFixed(2));
    const total = parseFloat((subtotal + taxAmount).toFixed(2));

    return {
      receipt_number: sale.receipt_number,
      sale_id: sale.id,
      branch_id: sale.branch_id,
      customer_id: sale.customer_id,
      payment_method: sale.payment_method,
      sale_date: sale.sale_date,
      items: sale.items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: Number(item.unit_price),
        subtotal: Number(item.subtotal),
      })),
      subtotal,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      total,
    };
  }
}
