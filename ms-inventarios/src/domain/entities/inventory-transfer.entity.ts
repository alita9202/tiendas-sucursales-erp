import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, OneToMany } from 'typeorm';
import { InventoryTransferItem } from './inventory-transfer-item.entity';

export enum TransferStatus {
  PENDING = 'PENDING',
  IN_TRANSIT = 'IN_TRANSIT',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity('inventory_transfers')
@Index(['source_branch_id'])
@Index(['destination_branch_id'])
@Index(['status'])
@Index(['transfer_date'])
export class InventoryTransfer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'source_branch_id', type: 'uuid' })
  source_branch_id: string;

  @Column({ name: 'destination_branch_id', type: 'uuid' })
  destination_branch_id: string;

  @Column({
    type: 'enum',
    enum: TransferStatus,
    default: TransferStatus.PENDING,
  })
  status: TransferStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'transfer_date', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  transfer_date: Date;

  @Column({ name: 'completed_date', type: 'timestamp', nullable: true })
  completed_date: Date;

  @OneToMany(() => InventoryTransferItem, (item) => item.transfer)
  items: InventoryTransferItem[];

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
