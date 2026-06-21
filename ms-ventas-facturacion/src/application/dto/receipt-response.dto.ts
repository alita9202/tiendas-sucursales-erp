export class ReceiptItemDto {
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export class ReceiptResponseDto {
  receipt_number: string;
  sale_id: string;
  branch_id: string;
  customer_id: string;
  payment_method: string;
  sale_date: Date;
  items: ReceiptItemDto[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
}
