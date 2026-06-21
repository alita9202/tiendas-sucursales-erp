// ─── Domain Entities ──────────────────────────────────────────────────────────

export interface Product {
  id: string;
  name: string;
  description: string;
  category: 'Electrónica' | 'Accesorios' | 'Hogar' | 'Supermercado';
  price: number;
  stock: number;
  maxStock: number;
  image: string;
  thumbnail: string;
  serial?: string;
  expiration?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Transaction {
  id: string;
  client: string;
  company: string;
  branch: string;
  amount: number;
  method: 'Efectivo' | 'Tarjeta' | 'QR' | 'Crédito' | 'Transferencia' | 'Tigo Money';
  status: 'Completado' | 'Pendiente' | 'Fallido';
  date: string;
}

export interface ArchivalLog {
  id: string;
  type: 'recepcion' | 'despacho' | 'auditoria' | 'venta' | 'pago' | 'rrhh';
  message: string;
  details: string;
  amount?: number;
  date: string;
}

// ─── Multi-Company / Multi-Branch ─────────────────────────────────────────────

export interface Company {
  id: string;
  name: string;
  nit: string;
  address: string;
  phone: string;
  email: string;
}

export interface Branch {
  id: string;
  name: string;
  companyId: string;
  address: string;
  phone: string;
  manager: string;
}

// ─── Human Resources ──────────────────────────────────────────────────────────

export type EmployeeStatus = 'active' | 'inactive' | 'on_leave';

export interface Employee {
  id: string;
  name: string;
  ci: string;
  role: string;
  department: string;
  salary: number;
  branch: string;
  company: string;
  hireDate: string;
  status: EmployeeStatus;
  phone?: string;
  email?: string;
}

// ─── Accounting: AP & AR ──────────────────────────────────────────────────────

export type AccountType = 'payable' | 'receivable';
export type AccountStatus = 'paid' | 'pending' | 'overdue';

export interface AccountItem {
  id: string;
  type: AccountType;
  entityName: string;
  description: string;
  amount: number;
  dueDate: string;
  status: AccountStatus;
  paidDate?: string;
  company: string;
  branch: string;
}

// ─── Electronic Invoicing (SIN Bolivia) ───────────────────────────────────────

export type InvoiceStatus = 'Válida' | 'Anulada';

export interface ElectronicInvoice {
  id: string;
  cuf: string;
  nitEmisor: string;
  nitCliente: string;
  razonSocial: string;
  amount: number;
  taxAmount: number;
  date: string;
  status: InvoiceStatus;
  company: string;
  branch: string;
  items?: string[];
}

// ─── Payment Gateway ──────────────────────────────────────────────────────────

export type PaymentMethodGateway =
  | 'QR Simple'
  | 'Tigo Money'
  | 'Visa/Mastercard'
  | 'Efectivo'
  | 'Transferencia Bancaria';

export type PaymentDirection = 'incoming' | 'outgoing';

export interface GatewayPayment {
  id: string;
  method: PaymentMethodGateway;
  direction: PaymentDirection;
  amount: number;
  reference: string;
  entityName: string;
  status: 'Aprobado' | 'Rechazado' | 'Pendiente';
  date: string;
  company: string;
  branch: string;
}

// ─── Sales (ms-ventas-facturacion) ────────────────────────────────────────────

export interface SaleItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export type SaleStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';

export interface Sale {
  id: string;
  branch_id: string;
  customer_id: string | null;
  receipt_number: string;
  payment_method: string;
  total_amount: number;
  status: SaleStatus;
  sale_date: string;
  items: SaleItem[];
  created_at: string;
  updated_at: string;
}

export interface CreateSaleItemPayload {
  product_id: string;
  quantity: number;
  unit_price: number;
}

export interface CreateSalePayload {
  branch_id: string;
  customer_id?: string;
  receipt_number: string;
  payment_method: string;
  items: CreateSaleItemPayload[];
}

export interface ReceiptItemDto {
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface ReceiptResponse {
  receipt_number: string;
  sale_id: string;
  branch_id: string;
  customer_id: string;
  payment_method: string;
  sale_date: string;
  items: ReceiptItemDto[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
}
