<!-- src/routes/transaction/[id]/voucher/+page.svelte -->
<script lang="ts">
    import type { PageData } from './$types';
    export let data: PageData;
    const { transaction } = data;
  
    // misma función de badge que tenías
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
    <title>Payment Voucher #{transaction.id}</title>
  </svelte:head>
  
  <div class="container mt-5">
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
                <p>
                  <strong>Document:</strong>
                  {transaction.customer?.type_document} - {transaction.customer?.number_document}
                </p>
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
  </div>
  
  <style>
    @media print {
      .btn {
        display: none !important;
      }
    }
  </style>
  