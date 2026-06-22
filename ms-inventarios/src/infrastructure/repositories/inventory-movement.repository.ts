import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { InventoryMovement } from '../../domain/entities/inventory-movement.entity';

@Injectable()
export class InventoryMovementRepository {
  constructor(
    @InjectRepository(InventoryMovement)
    private readonly repository: Repository<InventoryMovement>,
  ) {}

  // =========================================================================
  // NUEVO MÉTODO: Buscar movimientos de tipo venta ingresados el día de hoy
  // =========================================================================
  async findTodaySales(): Promise<InventoryMovement[]> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    return await this.repository.find({
      where: {
        // Usamos 'movement_type' en lugar de 'type' para respetar su estructura
        movement_type: 'SALE' as any, 
        // Usamos 'movement_date' en lugar de 'created_at' según sus campos
        movement_date: Between(startOfDay, endOfDay)
      },
      order: { movement_date: 'DESC' }
    });
  }

  // =========================================================================
  // MÉTODOS ORIGINALES DE TU EQUIPO (Mantenidos intactos para no romper nada)
  // =========================================================================

  async create(movement: Partial<InventoryMovement>): Promise<InventoryMovement> {
    const newMovement = this.repository.create(movement);
    return await this.repository.save(newMovement);
  }

  async findAll(): Promise<InventoryMovement[]> {
    return await this.repository.find();
  }

  async findById(id: string): Promise<InventoryMovement | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async findByBranch(branchId: string): Promise<InventoryMovement[]> {
    return await this.repository.find({ where: { branch_id: branchId } });
  }

  async findByProduct(productId: string): Promise<InventoryMovement[]> {
    return await this.repository.find({ where: { product_id: productId } });
  }

  async findByBranchAndProduct(branchId: string, productId: string): Promise<InventoryMovement[]> {
    return await this.repository.find({ 
      where: { branch_id: branchId, product_id: productId },
      order: { movement_date: 'DESC' }
    });
  }

  async findByMovementType(movementType: string): Promise<InventoryMovement[]> {
    return await this.repository.find({ where: { movement_type: movementType as any } });
  }

  async update(id: string, movement: Partial<InventoryMovement>): Promise<InventoryMovement | null> {
    await this.repository.update(id, movement);
    return await this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }
}
