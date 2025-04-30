import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';
import { fetchTransaction } from '$lib/api';

export const load: PageLoad = async ({ fetch, params }) => {
  try {
    // reutilizamos la misma función que trae la transacción
    const transaction = await fetchTransaction(fetch, params.id);
    return { transaction };
  } catch (e) {
    console.error('Load error in voucher:', e);
    throw error(500, 'Error cargando la transacción para voucher');
  }
};