import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { InventoryTransfer } from './inventory-transfer.entity';

@Entity('inventory_transfer_items')
@Index(['transfer_id'])
@Index(['product_id'])
export class InventoryTransferItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'transfer_id', type: 'uuid' })
  transfer_id: string;

  @Column({ name: 'product_id', type: 'uuid' })
  product_id: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unit_cost: number;

  @ManyToOne(() => InventoryTransfer, (transfer) => transfer.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'transfer_id' })
  transfer: InventoryTransfer;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
