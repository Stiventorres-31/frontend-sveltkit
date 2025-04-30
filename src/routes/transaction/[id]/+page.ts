// src/routes/transaction/[id]/+page.ts
import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';
import { fetchPaymentMethods, fetchTransaction } from '$lib/api';

export const load: PageLoad = async ({ fetch, params }) => {
  try {
    const [paymentMethods, transaction] = await Promise.all([
      fetchPaymentMethods(fetch),
      fetchTransaction(fetch, params.id)
    ]);
    return { paymentMethods, transaction };
  } catch (e) {
    console.error('Load error:', e);
    throw error(500, 'No se pudo cargar la transacción');
  }
};
