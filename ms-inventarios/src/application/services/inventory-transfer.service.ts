
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { EventEmitter } from 'events';
import { InventoryTransferRepository } from '../../infrastructure/repositories/inventory-transfer.repository';
// Conectamos el repositorio que maneja las existencias reales en Postgres
import { InventoryStockRepository } from '../../infrastructure/repositories/inventory-stock.repository';
import { CreateInventoryTransferDto } from '../dto/create-inventory-transfer.dto';
import { UpdateInventoryTransferDto } from '../dto/update-inventory-transfer.dto';
import { TransferStatus } from '../../domain/entities/inventory-transfer.entity';

if (!(global as any).sysEventEmitter) {
  (global as any).sysEventEmitter = new EventEmitter();
}

const sysEventEmitter = new EventEmitter();

@Injectable()
export class InventoryTransferService {
  constructor(
    private readonly repository: InventoryTransferRepository,
    // NUEVA INYECCIÓN: El puente directo hacia la tabla de stock físico
    private readonly inventoryStockRepository: InventoryStockRepository,
    
  ) {}

  async create(createDto: CreateInventoryTransferDto): Promise<any> {
    const { items, ...transferData } = createDto;

    // Validación: Impedir transferencia a la misma sucursal
    if (transferData.source_branch_id === transferData.destination_branch_id) {
      throw new BadRequestException('La sucursal de origen y destino no pueden ser la misma.');
    }

    // 1. Guardamos el registro maestro en la base de datos PostgreSQL
    const nuevaTransferencia = await this.repository.create(createDto as any);

    // DISPARADOR NATIVO ASÍNCRONO
    sysEventEmitter.emit('inventory.transfer.created', {
      transfer_id: nuevaTransferencia.id,
      source_branch_id: transferData.source_branch_id,
      destination_branch_id: transferData.destination_branch_id,
      timestamp: new Date()
    });

    return nuevaTransferencia;
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

  // NUEVO: Método inteligente que descuenta stock al pasar a COMPLETED
  async updateStatus(id: string, status: TransferStatus): Promise<any> {
    const transfer = await this.repository.findById(id);
    if (!transfer) {
      throw new NotFoundException('Transfer not found');
    }
    
    const updateData: any = { status };
    
    if (status === TransferStatus.COMPLETED) {
      updateData.completed_date = new Date();

      // Recuperamos los ítems asociados a esta transferencia
      const items = transfer.items || [];
      
      for (const item of items) {
        // A. Descontar stock de la sucursal de origen
        const stockOrigen: any = await this.inventoryStockRepository.findByBranchAndProduct(
          transfer.source_branch_id,
          item.product_id
        );

        if (!stockOrigen || stockOrigen.quantity < item.quantity) {
          throw new BadRequestException(
            `No se puede completar la transferencia. Stock insuficiente para el producto ${item.product_id} en origen.`
          );
        }

        await this.inventoryStockRepository.update(stockOrigen.id, {
          quantity: stockOrigen.quantity - item.quantity
        });

        // B. Incrementar stock en la sucursal de destino
        const stockDestino: any = await this.inventoryStockRepository.findByBranchAndProduct(
          transfer.destination_branch_id,
          item.product_id
        );

        if (stockDestino) {
          await this.inventoryStockRepository.update(stockDestino.id, {
            quantity: stockDestino.quantity + item.quantity
          });
        } else {
          // Si el producto llega por primera vez a esa sucursal, creamos el registro
          await this.inventoryStockRepository.create({
            branch_id: transfer.destination_branch_id,
            product_id: item.product_id,
            quantity: item.quantity,
            is_active: true
          });
        }
      }
      // DISPARADOR NATIVO ASÍNCRONO
      sysEventEmitter.emit('inventory.transfer.completed', {
        transfer_id: id
      });
    }
    return await this.repository.update(id, updateData);
  }
}
