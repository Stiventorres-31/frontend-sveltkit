// src/lib/api.ts
import { PUBLIC_API_BASE_URL } from '$env/static/public';

//
// Wrapper genérico
//
interface ApiResponse<T> {
  success: boolean;
  code: number;
  message: string;
  result: T;
}

//
// Formatos “raw”
//
interface RawPaymentMethod {
  id: number;
  name: string;
  config: { fee: number };
  created_at: string;
  updated_at: string;
}

interface RawTransaction {
  id: number;
  customer_id: number;
  payment_method_id: number;
  amount: string;
  currency: string;
  fee: string | null;
  total: string | null;
  status: string;
  metadata: { raw_data: Record<string, any> };
  created_at: string;
  updated_at: string;
  customer?: {
    id: number;
    type_document: string;
    number_document: string;
    name: string;
    email: string;
    preferences: { raw_data: Record<string, any> };
    created_at: string | null;
    updated_at: string | null;
  };
}

interface RawGeneratePayment {
  transaction_id: number;
  url_payment: string;
}

//
// Tipos “limpios” que consumirán tus páginas
//
export interface PaymentMethod {
  id: string;
  name: string;
}

export interface Customer {
  name: string;
  email: string;
  type_document: string;
  number_document: string;
}

export interface Transaction {
  id: string;
  customer_id: string;
  payment_method_id: string;
  amount: number;
  currency: string;
  fee?: number;
  total?: number;
  status: string;
  customer?: Customer;
}

export interface PaymentResult {
  transaction_id: string;
  url_payment: string;
  message: string;
}

//
// Helpers HTTP genéricos
//
async function apiGet<T>(
  fetcher: typeof fetch,
  path: string,
  params?: Record<string, string>
): Promise<T> {
  const url = new URL(`${PUBLIC_API_BASE_URL}${path}`);
  params && Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetcher(url.toString());
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`GET ${url.pathname} → ${res.status}: ${txt}`);
  }
  return (await res.json()) as T;
}

async function apiPost<T>(
  fetcher: typeof fetch,
  path: string,
  body: unknown
): Promise<T> {
  const res = await fetcher(`${PUBLIC_API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`POST ${path} → ${res.status}: ${txt}`);
  }
  return (await res.json()) as T;
}

//
// Funciones específicas adaptadas a tus formatos
//
export async function fetchPaymentMethods(fetcher: typeof fetch): Promise<PaymentMethod[]> {
  const wrapper = await apiGet<
    ApiResponse<{
      paymentMethods: RawPaymentMethod[] | { data: RawPaymentMethod[] };
    }>
  >(fetcher, `/getPaymentsMethods`);

  // soporta array directo o paginado { data: [...] }
  const raw = wrapper.result.paymentMethods;
  const list = Array.isArray(raw) ? raw : raw.data;

  return list.map((m) => ({
    id: String(m.id),
    name: m.name
  }));
}

export async function fetchTransaction(fetcher: typeof fetch, id: string): Promise<Transaction> {
  const wrapper = await apiGet<ApiResponse<{ transactions: RawTransaction }>>(
    fetcher,
    `/getTransaction`,
    { id }
  );
  const raw = wrapper.result.transactions;
  return {
    id: String(raw.id),
    customer_id: String(raw.customer_id),
    payment_method_id: String(raw.payment_method_id),
    amount: Number(raw.amount),
    currency: raw.currency,
    fee: raw.fee !== null ? Number(raw.fee) : undefined,
    total: raw.total !== null ? Number(raw.total) : undefined,
    status: raw.status,
    customer:
      raw.customer && {
        name: raw.customer.name,
        email: raw.customer.email,
        type_document: raw.customer.type_document,
        number_document: raw.customer.number_document
      }
  };
}

export async function postPayment(
  fetcher: typeof fetch,
  payload: {
    customer_id: string;
    payment_method: string;
    amount: number;
    currency: string;
    transaction_id: string;
  }
): Promise<PaymentResult> {
  const wrapper = await apiPost<ApiResponse<RawGeneratePayment>>(
    fetcher,
    `/generatePayment`,
    payload
  );
  return {
    transaction_id: String(wrapper.result.transaction_id),
    url_payment: wrapper.result.url_payment,
    message: wrapper.message
  };
}
