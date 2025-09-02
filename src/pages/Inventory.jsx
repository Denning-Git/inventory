import React, { useState } from 'react';
import { 
  Plus, 
  Search,
  Edit,
} from 'lucide-react';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { useProducts } from '../hooks/useApi';
import { useToast } from '../components/Toast';
import { apiService } from '../services/api';

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    quantity: '',
    price: '',
    expiryDate: '',
    minimumStock: '10'
  });
  const [action,setAction]=useState('new')
  
  const { data: products, loading, error, refetch } = useProducts({
    search: searchTerm
  });
  const toast = useToast();

  const handleAddProduct = async () => {
    // e.preventDefault();
    try {
      await apiService.createProduct({
        ...newProduct,
        quantity: parseInt(newProduct.quantity),
        price: parseFloat(newProduct.price),
        minimumStock: parseInt(newProduct.minimumStock)
      });
      
      toast.success('Product added successfully');
      setNewProduct({ name: '', category: '', quantity: '', price: '', expiryDate: '', minimumStock: '10' });
      setShowAddModal(false);
      refetch();
    } catch (error) {
      toast.error('Failed to add product');
    }
  };

  const handleStockUpdate = async (id) => {
    const { _id, ...rest } = newProduct;
    try {
      await apiService.updateProduct(id, {
        ...rest,
        quantity: parseInt(newProduct.quantity),
        price: parseFloat(newProduct.price),
        minimumStock: parseInt(newProduct.minimumStock)
      });
      toast.success(`Stock Changed successfully`);
      setNewProduct({ name: '', category: '', quantity: '', price: '', expiryDate: '', minimumStock: '10' });
      setShowAddModal(false);
      refetch();

      await apiService.triggerTheftDetection()
     await apiService.triggerAnomalyDetection()
     await apiService.getTheftAnalytics()


    } catch (error) {
      toast.error('Failed to update stock');
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h3 fw-bold text-body mb-1">Inventory Management</h2>
          <p className="text-muted mb-0">Manage your store inventory</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setNewProduct({ name: '', category: '', quantity: '', price: '', expiryDate: '', minimumStock: '10' })
            setShowAddModal(true)
          }}
          className="btn btn-primary d-flex align-items-center"
        >
          <Plus size={16} className="me-2" />
          Add Product
        </button>
      </div>

      {/* Search Bar */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="input-group">
            <span className="input-group-text">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search products by name or category..."
              className="form-control"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="card">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th className="px-4">Product</th>
                  <th className="px-4">Category</th>
                  <th className="px-4">Quantity</th>
                  <th className="px-4">Price</th>
                  <th className="px-4">Expiry Date</th>
                  <th className="px-4">Last Updated</th>
                  <th className="px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product._id}>
                    <td className="px-4 align-middle">
                      <div className="fw-medium text-body">{product.name}</div>
                    </td>
                    <td className="px-4 align-middle">
                      <span className="badge bg-primary">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-4 align-middle">
                      <span className={`fw-medium ${
                        product.quantity <= product.minimumStock 
                          ? product.quantity === 0 ? 'text-danger' : 'text-warning'
                          : 'text-success'
                      }`}>
                        {product.quantity}
                      </span>
                    </td>
                    <td className="px-4 align-middle">
                      FRW {product.price}
                    </td>
                    <td className="px-4 align-middle">
                      {product.expiryDate 
                        ? new Date(product.expiryDate).toLocaleDateString()
                        : 'N/A'
                      }
                    </td>
                    <td className="px-4 align-middle">
                      {new Date(product.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 align-middle">
                      <div className="d-flex gap-2">
                        <button
                          onClick={() => handleStockUpdate(product._id, -1)}
                          className="btn btn-sm btn-outline-danger"
                          disabled={product.quantity === 0}
                        >
                          -1
                        </button>
                        <button
                          onClick={() => handleStockUpdate(product._id, 1)}
                          className="btn btn-sm btn-outline-success"
                        >
                          +1
                        </button>
                        <button onClick={(e) => {
                          e.stopPropagation();
                          setNewProduct(product)
                          setShowAddModal(true)}
                          } className="btn btn-sm btn-outline-primary">
                          <Edit size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Product</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
              </div>
              <form 
               onSubmit={(e) => {
                e.preventDefault(); // stop page refresh
                if (newProduct?._id) {
                  handleStockUpdate(newProduct._id);
                } else {
                  handleAddProduct();
                }
              }}

                >
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Product Name</label>
                    <input
                      type="text"
                      required
                      className="form-control"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Category</label>
                    <input
                      type="text"
                      required
                      className="form-control"
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Quantity</label>
                    <input
                      type="number"
                      required
                      min="0"
                      className="form-control"
                      value={newProduct.quantity}
                      onChange={(e) => setNewProduct({...newProduct, quantity: e.target.value})}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Price (FRW)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      className="form-control"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Minimum Stock Level</label>
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      value={newProduct.minimumStock}
                      onChange={(e) => setNewProduct({...newProduct, minimumStock: e.target.value})}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Expiry Date (Optional)</label>
                    <input
                      type="date"
                      className="form-control"
                      value={newProduct.expiryDate}
                      onChange={(e) => setNewProduct({...newProduct, expiryDate: e.target.value})}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Product
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


export default Inventory