import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum MovementType {
  IN = 'IN',
  OUT = 'OUT',
  TRANSFER = 'TRANSFER',
  ADJUSTMENT = 'ADJUSTMENT',
}

@Entity('inventory_stock')
@Index(['branch_id', 'product_id'], { unique: true })
@Index(['branch_id'])
@Index(['product_id'])
export class InventoryStock {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'branch_id', type: 'uuid' })
  branch_id: string;

  @Column({ name: 'product_id', type: 'uuid' })
  product_id: string;

  @Column({ type: 'int', default: 0 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  unit_cost: number;

  @Column({ type: 'timestamp', nullable: true })
  last_restock_date: Date;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
