import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { MovementType } from './inventory-stock.entity';

@Entity('inventory_movements')
@Index(['branch_id'])
@Index(['product_id'])
@Index(['movement_type'])
@Index(['movement_date'])
export class InventoryMovement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'branch_id', type: 'uuid' })
  branch_id: string;

  @Column({ name: 'product_id', type: 'uuid' })
  product_id: string;

  @Column({
    type: 'enum',
    enum: MovementType,
  })
  movement_type: MovementType;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unit_cost: number;

  @Column({ type: 'text', nullable: true })
  reference: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'movement_date', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  movement_date: Date;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
