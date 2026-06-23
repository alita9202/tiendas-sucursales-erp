import { Sale, CreateSalePayload, ReceiptResponse } from '../types';

const BASE_URL = '/api/sales';

export async function getSales(): Promise<Sale[]> {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error('Failed to fetch sales');
  return res.json();
}

export async function getSaleById(id: string): Promise<Sale> {
  const res = await fetch(`${BASE_URL}/${id}`);
  if (!res.ok) throw new Error('Sale not found');
  return res.json();
}

export async function getSalesByBranch(branchId: string): Promise<Sale[]> {
  const res = await fetch(`${BASE_URL}/branch/${branchId}`);
  if (!res.ok) throw new Error('Failed to fetch sales by branch');
  return res.json();
}

export async function createSale(payload: CreateSalePayload): Promise<Sale> {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    const errorMessage = errorData?.detail || errorData?.message || 'Failed to create sale';
    throw new Error(errorMessage);
  }
  return res.json();
}

export async function getReceipt(id: string): Promise<ReceiptResponse> {
  const res = await fetch(`${BASE_URL}/${id}/receipt`);
  if (!res.ok) throw new Error('Failed to fetch receipt');
  return res.json();
}
