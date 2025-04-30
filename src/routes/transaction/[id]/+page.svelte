<!-- src/routes/transaction/[id]/+page.svelte -->
<script context="module" lang="ts">
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
  </script>
  
  <script lang="ts">
    import { goto } from '$app/navigation';
    import type { PageData } from './$types';
    import { postPayment } from '$lib/api';
  
    export let data: PageData;
    const { paymentMethods, transaction } = data;
  
    // Pre-selecciona el método actual
    let selectedPaymentMethod = transaction.payment_method_id;
    let amount: number = transaction.amount;
    let currency: string = transaction.currency;
    let loading = false;
    let errorMessage = '';
  
    async function handlePayment() {
      if (!selectedPaymentMethod) return;
      loading = true;
      errorMessage = '';
  
      try {
        const { url_payment, message } = await postPayment(fetch, {
          customer_id: transaction.customer_id,
          payment_method: selectedPaymentMethod,
          amount,
          currency,
          transaction_id: transaction.id
        });
        // navegar a la URL devuelta
        await goto(`/transaction/${transaction.id}/voucher`);
      } catch (e) {
        console.error('Payment error:', e);
        errorMessage = e instanceof Error ? e.message : 'Error procesando el pago.';
      } finally {
        loading = false;
      }
    }
  </script>
  
  <svelte:head>
    <title>Transaction #{transaction.id}</title>
  </svelte:head>
  
  <div class="container mt-5">
    <h2 class="mb-4">Transaction Details</h2>
  
    <div class="row">
      <div class="col-md-8">
        <div class="card">
          <div class="card-header">
            <h5 class="card-title mb-0">Transaction #{transaction.id}</h5>
          </div>
          <div class="card-body">
            <!-- Customer Information -->
            {#if transaction.customer}
              <div class="mb-4">
                <h6>Customer Information</h6>
                <div class="row">
                  <div class="col-md-6">
                    <p><strong>Name:</strong> {transaction.customer.name}</p>
                    <p><strong>Email:</strong> {transaction.customer.email}</p>
                  </div>
                  <div class="col-md-6">
                    <p><strong>Document Type:</strong> {transaction.customer.type_document}</p>
                    <p><strong>Document Number:</strong> {transaction.customer.number_document}</p>
                  </div>
                </div>
              </div>
            {/if}
  
            <!-- Payment Method Selection -->
            <div class="mb-4">
              <h6>Select Payment Method</h6>
              <div class="row">
                {#each paymentMethods as method}
                  <div class="col-md-4 mb-3">
                    <div class="form-check">
                      <input
                        class="form-check-input"
                        type="radio"
                        name="paymentMethod"
                        id={method.id}
                        value={method.name}
                        bind:group={selectedPaymentMethod}
                      />
                      <label class="form-check-label" for={method.id}>
                        {method.name}
                      </label>
                    </div>
                  </div>
                {/each}
              </div>
            </div>
  
            <!-- Payment Details -->
            <div class="mb-4">
              <h6>Payment Details</h6>
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label for="amount" class="form-label">Amount</label>
                    <input
                      id="amount"
                      type="number"
                      class="form-control"
                      bind:value={amount}
                    />
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label for="currency" class="form-label">Currency</label>
                    <input
                      id="currency"
                      type="text"
                      class="form-control"
                      bind:value={currency}
                    />
                  </div>
                </div>
              </div>
            </div>
  
            <!-- Fee and Total -->
            {#if transaction.fee != null && transaction.total != null}
              <div class="row">
                <div class="col-md-6">
                  <p><strong>Fee:</strong> {transaction.fee} {transaction.currency}</p>
                </div>
                <div class="col-md-6">
                  <p><strong>Total:</strong> {transaction.total} {transaction.currency}</p>
                </div>
              </div>
            {/if}
  
            <!-- Error Message -->
            {#if errorMessage}
              <div class="alert alert-danger mt-3">
                {errorMessage}
              </div>
            {/if}
  
            <!-- Submit Button -->
            <div class="mt-4">
              <button
                class="btn btn-primary"
                on:click={handlePayment}
                disabled={loading || !selectedPaymentMethod}
              >
                {#if loading}
                  <span class="spinner-border spinner-border-sm" role="status"></span>
                  Processing...
                {:else}
                  Process Payment
                {/if}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  