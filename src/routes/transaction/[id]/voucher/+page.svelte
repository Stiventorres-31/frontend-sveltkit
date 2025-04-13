<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import axios from 'axios';
    import { error } from '@sveltejs/kit';

    let transaction: any | null = null;
    let loading = false;

    onMount(async () => {
        try {
            loading = true;
            const transactionId = $page.params.id;
            const response = await axios.get(`http://127.0.0.1:8000/api/getTransaction`, { params: { id: transactionId } });
            transaction = response.data;
        } catch (e) {
            console.error('Error fetching transaction:', e);
            throw error(500, 'Error fetching transaction');
        } finally {
            loading = false;
        }
    });

    function getStatusBadgeClass(status: string): string {
        switch (status.toLowerCase()) {
            case 'success':
            case 'completed':
                return 'bg-success';
            case 'pending':
                return 'bg-warning';
            case 'failed':
            case 'error':
                return 'bg-danger';
            default:
                return 'bg-secondary';
        }
    }
</script>

<svelte:head>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</svelte:head>

<div class="container mt-5">
    {#if loading}
        <div class="text-center">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    {:else if transaction}
        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header bg-primary text-white">
                        <h4 class="mb-0">Payment Voucher</h4>
                    </div>
                    <div class="card-body">
                        <div class="text-center mb-4">
                            <h5>Transaction #{transaction.id}</h5>
                            <span class="badge {getStatusBadgeClass(transaction.status)}">
                                {transaction.status}
                            </span>
                        </div>

                        <div class="row mb-4">
                            <div class="col-md-6">
                                <h6 class="text-muted">Customer Information</h6>
                                <p><strong>Name:</strong> {transaction.customer?.name}</p>
                                <p><strong>Email:</strong> {transaction.customer?.email}</p>
                                <p><strong>Document:</strong> {transaction.customer?.type_document} - {transaction.customer?.number_document}</p>
                            </div>
                            <div class="col-md-6">
                                <h6 class="text-muted">Payment Details</h6>
                                <p><strong>Amount:</strong> {transaction.amount} {transaction.currency}</p>
                                <p><strong>Fee:</strong> {transaction.fee} {transaction.currency}</p>
                                <p><strong>Total:</strong> {transaction.total} {transaction.currency}</p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    {:else}
        <div class="alert alert-danger">
            Transaction not found
        </div>
    {/if}
</div>

<style>
    @media print {
        .btn {
            display: none !important;
        }
    }
</style>
