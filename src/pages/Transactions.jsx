import React, { useState } from "react";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import { Plus, Search, Filter, Calendar, RefreshCw } from "lucide-react";
import { useToast } from "../components/Toast";
import { apiService } from "../services/api";
import { useTransactions } from "../hooks/useTransactions";
import { useProducts } from "../hooks/useApi";

const Transactions = () => {
  const { data: transactions, loading, error, refetch } = useTransactions({ limit: 100 });
  const { data: products } = useProducts();
  const toast = useToast();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    productId: '',
    startDate: '',
    endDate: '',
    search: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New transaction form state
  const [newTransaction, setNewTransaction] = useState({
    productId: '',
    type: 'sale',
    quantity: '',
    reason: ''
  });

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTransaction(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateTransaction = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!newTransaction.productId || !newTransaction.quantity) {
        throw new Error('Please fill in all required fields');
      }

      await apiService.updateStock(
        newTransaction.productId, 
        {
          quantity: parseInt(newTransaction.quantity),
          type: newTransaction.type,
          reason: newTransaction.reason
        }
      );

      toast.success('Transaction created successfully');
      setShowCreateModal(false);
      setNewTransaction({
        productId: '',
        type: 'sale',
        quantity: '',
        reason: ''
      });
      refetch();
    } catch (error) {
      toast.error(error.message || 'Failed to create transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (filters.type && transaction.type !== filters.type) return false;
    if (filters.productId && transaction?.productId?._id !== filters.productId) return false;
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const matchesProduct = transaction.productId.name.toLowerCase().includes(searchTerm);
      const matchesReason = transaction.reason?.toLowerCase().includes(searchTerm);
      if (!matchesProduct && !matchesReason) return false;
    }
    if (filters.startDate || filters.endDate) {
      const transactionDate = new Date(transaction.createdAt);
      if (filters.startDate && transactionDate < new Date(filters.startDate)) return false;
      if (filters.endDate && transactionDate > new Date(filters.endDate + 'T23:59:59')) return false;
    }
    return true;
  });

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'sale': return '📉';
      case 'expiry': return '📉';
      case 'damage': return '📉';
      case 'restock': return '📈';
      case 'purchase': return '🛒';
      case 'adjustment': return '⚖️';
      default: return '📋';
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'sale': return 'success';
      case 'restock': return 'primary';
      case 'purchase': return 'info';
      case 'adjustment': return 'warning';
      case 'expiry': return 'warning';
      case 'damage': return 'warning';
      default: return 'secondary';
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h3 fw-bold text-body mb-1">Inventory Transactions</h2>
          <p className="text-muted">Manage and review all inventory movements</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary d-flex align-items-center"
        >
          <Plus size={16} className="me-1" />
          New Transaction
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-header bg-light">
          <h3 className="h5 mb-0 d-flex align-items-center">
            <Filter size={18} className="me-2" />
            Filters
          </h3>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label">Transaction Type</label>
              <select 
                className="form-select"
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <option value="">All Types</option>
                <option value="sale">Sale</option>
                <option value="restock">Restock</option>
                <option value="purchase">Purchase</option>
                <option value="adjustment">Adjustment</option>
                <option value="expiry">Expiry</option>
                <option value="damage">Damage</option>
              </select>
            </div>
            
            <div className="col-md-3">
              <label className="form-label">Product</label>
              <select 
                className="form-select"
                value={filters.productId}
                onChange={(e) => handleFilterChange('productId', e.target.value)}
              >
                <option value="">All Products</option>
                {products?.map(product => (
                  <option key={product._id} value={product._id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="col-md-3">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                className="form-control"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>
            
            <div className="col-md-3">
              <label className="form-label">End Date</label>
              <input
                type="date"
                className="form-control"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>
            
            <div className="col-md-6">
              <label className="form-label">Search</label>
              <div className="input-group">
                <span className="input-group-text">
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by product or reason..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
            </div>
            
            <div className="col-md-6 d-flex align-items-end">
              <button
                onClick={() => setFilters({
                  type: '',
                  productId: '',
                  startDate: '',
                  endDate: '',
                  search: ''
                })}
                className="btn btn-outline-secondary"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="card">
        <div className="card-header bg-light d-flex justify-content-between align-items-center">
          <h3 className="h5 mb-0">Recent Transactions</h3>
          <span className="badge bg-primary">
            {filteredTransactions.length} transactions
          </span>
        </div>
        <div className="card-body p-0">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">No transactions found</p>
              {Object.values(filters).some(filter => filter) && (
                <button
                  onClick={() => setFilters({
                    type: '',
                    productId: '',
                    startDate: '',
                    endDate: '',
                    search: ''
                  })}
                  className="btn btn-sm btn-outline-primary mt-2"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Previous Stock</th>
                    <th>New Stock</th>
                    <th>Reason</th>
                    <th>Date</th>
                    <th>User</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map(transaction => (
                    <tr key={transaction._id}>
                      <td>
                        <span className={`badge bg-${getTransactionColor(transaction.type)}`}>
                          {getTransactionIcon(transaction.type)} {transaction.type}
                        </span>
                      </td>
                      <td>
                        {transaction.productId?.name || 'Unknown Product'}
                      </td>
                      <td className={(transaction.type ==='sale' ||transaction.type ==='expiry'||transaction.type === 'damage') ? 'text-danger' : 'text-success'}>
                        { (transaction.type ==='sale' ||transaction.type ==='expiry'||transaction.type === 'damage')  ? '-' : '+'}{Math.abs(transaction.quantity)}
                      </td>
                      <td>{transaction.previousQuantity}</td>
                      <td>
                        <strong>{transaction.newQuantity}</strong>
                      </td>
                      <td>{transaction.reason || '-'}</td>
                      <td>
                        {new Date(transaction.createdAt).toLocaleDateString()}
                        <br />
                        <small className="text-muted">
                          {new Date(transaction.createdAt).toLocaleTimeString()}
                        </small>
                      </td>
                      <td>
                        <small className="text-muted">
                          {transaction.userId || 'System'}
                        </small>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Transaction Modal */}
      {showCreateModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create New Transaction</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowCreateModal(false)}
                  disabled={isSubmitting}
                ></button>
              </div>
              <form onSubmit={handleCreateTransaction}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Product *</label>
                      <select
                        name="productId"
                        className="form-select"
                        value={newTransaction.productId}
                        onChange={handleInputChange}
                        required
                        disabled={isSubmitting}
                      >
                        <option value="">Select a product</option>
                        {products?.map(product => (
                          <option key={product._id} value={product._id}>
                            {product.name} (Current: {product.quantity} units)
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="col-md-6">
                      <label className="form-label">Transaction Type *</label>
                      <select
                        name="type"
                        className="form-select"
                        value={newTransaction.type}
                        onChange={handleInputChange}
                        required
                        disabled={isSubmitting}
                      >
                        <option value="sale">Sale (Reduce stock)</option>
                        <option value="restock">Restock (Increase stock)</option>
                        <option value="purchase">Purchase (Increase stock)</option>
                        <option value="adjustment">Adjustment (Manual change)</option>
                        <option value="expiry">Expired</option>
                        <option value="damage">Damage</option>
                      </select>
                    </div>
                    
                    <div className="col-md-6">
                      <label className="form-label">Quantity *</label>
                      <input
                        type="number"
                        name="quantity"
                        className="form-control"
                        min="1"
                        value={newTransaction.quantity}
                        onChange={handleInputChange}
                        required
                        disabled={isSubmitting}
                        placeholder="Enter quantity"
                      />
                    </div>
                    
                    <div className="col-12">
                      <label className="form-label">Reason</label>
                      <textarea
                        name="reason"
                        className="form-control"
                        rows="3"
                        value={newTransaction.reason}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                        placeholder="Optional: Enter reason for this transaction"
                      ></textarea>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowCreateModal(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Processing...' : 'Create Transaction'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;