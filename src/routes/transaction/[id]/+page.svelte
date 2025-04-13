<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import axios from 'axios';
    import { error } from '@sveltejs/kit';

    let paymentMethods: any[] = [];
    let selectedPaymentMethod: string = '';
    let transaction: any | null = null;
    let loading = false;
    let amount = 0;
    let currency = 'USD';

    onMount(async () => {
        try {
            const paymentMethodsResponse = await axios.get('http://127.0.0.1:8000/api/getPaymentsMethods');
            paymentMethods = paymentMethodsResponse.data;

            const transactionId = $page.params.id;
            const transactionResponse = await axios.get(`http://127.0.0.1:8000/api/getTransaction`, { params: { id: transactionId } });
            transaction = transactionResponse.data;
            
            if (transaction) {
                amount = transaction.amount;
                currency = transaction.currency;
            }
        } catch (e) {
            console.error('Error fetching data:', e);
            throw error(500, 'Error fetching data');
        }
    });

    async function handlePayment() {
        if (!transaction || !selectedPaymentMethod) return;

        try {
            loading = true;
            const paymentData: any = {
                customer_id: transaction.customer_id,
                payment_method: selectedPaymentMethod,
                amount: amount,
                currency: currency,
                transaction_id: $page.params.id
            };

            const response = await axios.post('http://127.0.0.1:8000/api/generatePayment', paymentData);
            
            if (response.data.status === 'success') {
                // Redirect to voucher page
                window.location.href = `/transaction/${$page.params.id}/voucher`;
            }
        } catch (e) {
            console.error('Error processing payment:', e);
            alert('Error processing payment. Please try again.');
        } finally {
            loading = false;
        }
    }
</script>

<svelte:head>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</svelte:head>

<div class="container mt-5">
    <h2 class="mb-4">Transaction Details</h2>

    {#if transaction}
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
                                                id={method.name}
                                                value={method.name}
                                                bind:group={selectedPaymentMethod}
                                            >
                                            <label class="form-check-label" for={method.name}>
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
                                            type="number" 
                                            class="form-control" 
                                            id="amount"
                                            bind:value={amount}
                                        >
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="currency" class="form-label">Currency</label>
                                        <input 
                                            type="text" 
                                            class="form-control" 
                                            id="currency"
                                            bind:value={currency}
                                        >
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Fee and Total -->
                        {#if transaction.fee !== null && transaction.total !== null}
                            <div class="row">
                                <div class="col-md-6">
                                    <p><strong>Fee:</strong> {transaction.fee} {transaction.currency}</p>
                                </div>
                                <div class="col-md-6">
                                    <p><strong>Total:</strong> {transaction.total} {transaction.currency}</p>
                                </div>
                            </div>
                        {/if}

                        <!-- Submit Button -->
                        <div class="mt-4">
                            <button 
                                class="btn btn-primary"
                                on:click={handlePayment}
                                disabled={loading || !selectedPaymentMethod}
                            >
                                {loading ? 'Processing...' : 'Process Payment'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    {:else if loading}
        <div class="text-center">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    {/if}
</div>
