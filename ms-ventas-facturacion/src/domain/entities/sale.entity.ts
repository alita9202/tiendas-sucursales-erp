import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { SaleItem } from './sale-item.entity';

export enum SaleStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity('sales')
export class Sale {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'branch_id', type: 'uuid' })
  branch_id: string;

  @Column({ name: 'customer_id', type: 'uuid', nullable: true })
  customer_id: string;

  @Column({ name: 'customer_name', type: 'varchar', length: 200, nullable: true })
  customer_name: string;

  @Column({ name: 'customer_nit', type: 'varchar', length: 50, nullable: true })
  customer_nit: string;

  @Column({ name: 'receipt_number', type: 'varchar', length: 100, unique: true })
  receipt_number: string;

  @Column({ name: 'payment_method', type: 'varchar', length: 50 })
  payment_method: string;

  @Column({ name: 'total_amount', type: 'decimal', precision: 12, scale: 2 })
  total_amount: number;

  @Column({ type: 'varchar', length: 50, default: SaleStatus.COMPLETED })
  status: SaleStatus;

  @Column({ name: 'sale_date', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  sale_date: Date;

  @OneToMany(() => SaleItem, (item) => item.sale, { cascade: true })
  items: SaleItem[];

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
