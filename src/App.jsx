import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  Plus, 
  Search,
  DollarSign,
  Eye,
  Edit,
  Bell,
  BarChart3,
  Settings,
  LogOut,
  Loader,
  RefreshCw
} from 'lucide-react';
import { ToastProvider, useToast } from './components/Toast';
import { useProducts, useAnomalies, useDashboardAnalytics } from './hooks/useApi';
import { apiService } from './services/api';
import Loading from './components/Loading';


// Error Component
const ErrorMessage = ({ message, onRetry }) => (
  <div className="d-flex flex-column align-items-center justify-content-center p-5 text-center">
    <AlertTriangle className="text-danger mb-3" size={48} />
    <h3 className="h5 fw-semibold text-body mb-2">Something went wrong</h3>
    <p className="text-muted mb-4">{message}</p>
    {onRetry && ( 
      <button
        onClick={onRetry}
        className="btn btn-primary d-flex align-items-center"
      >
        <RefreshCw size={16} className="me-2" />
        Try Again
      </button>
    )}
  </div>
);

const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'anomalies', label: 'Anomalies', icon: AlertTriangle },
    { id: 'reports', label: 'Reports', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="bg-dark text-white vh-100 position-fixed" style={{ width: '250px', zIndex: 1000 }}>
      <div className="p-3">
        <div className="d-flex align-items-center mb-4 p-2">
          <Package size={24} className="me-2 text-primary" />
          <h1 className="h5 fw-bold mb-0">InvenTrack AI</h1>
        </div>
        
        <nav className="nav flex-column">
          {menuItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`btn btn-link text-start text-decoration-none d-flex align-items-center p-2 mb-1 rounded ${
                  activeTab === item.id 
                    ? 'btn-primary text-white' 
                    : 'text-light hover-dark'
                }`}
                style={{ backgroundColor: activeTab === item.id ? '#0d6efd' : 'transparent' }}
              >
                <Icon size={18} className="me-2" />
                {item.label}
              </button>
            );
          })}
        </nav>
        
        <div className="mt-auto pt-4">
          <button className="btn btn-link text-start text-decoration-none d-flex align-items-center p-2 mb-1 rounded text-light w-100">
            <LogOut size={18} className="me-2" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { data: analytics, loading, error, refetch } = useDashboardAnalytics();
  const { data: anomalies } = useAnomalies({ resolved: false });
  const toast = useToast();

  const handleTriggerDetection = async () => {
    try {
      toast.info('Running AI anomaly detection...');
      const result = await apiService.triggerAnomalyDetection();
      toast.success(`Detection complete: ${result.anomaliesDetected} anomalies found`);
      refetch();
    } catch (error) {
      toast.error('Failed to run anomaly detection');
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;

  return (
    <div className="p-4" style={{ marginLeft: '250px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h3 fw-bold text-body mb-1">Dashboard</h2>
          <p className="text-muted mb-0">Overview of your inventory management system</p>
        </div>
        <button
          onClick={handleTriggerDetection}
          className="btn btn-purple text-white d-flex align-items-center"
        >
          <RefreshCw size={16} className="me-2" />
          Run AI Detection
        </button>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-6 col-lg-3 mb-3">
          <div className="card border-start border-primary border-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted small mb-1">Total Products</p>
                  <h3 className="card-title fw-bold mb-0">{analytics?.totalProducts || 0}</h3>
                </div>
                <Package size={24} className="text-primary" />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3 mb-3">
          <div className="card border-start border-warning border-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted small mb-1">Low Stock Items</p>
                  <h3 className="card-title fw-bold mb-0">{analytics?.lowStockCount || 0}</h3>
                </div>
                <AlertTriangle size={24} className="text-warning" />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3 mb-3">
          <div className="card border-start border-success border-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted small mb-1">Total Value</p>
                  <h3 className="card-title fw-bold mb-0">FRW{analytics?.totalValue?.toLocaleString() || 0}</h3>
                </div>
                <DollarSign size={24} className="text-success" />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3 mb-3">
          <div className="card border-start border-danger border-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted small mb-1">Critical Alerts</p>
                  <h3 className="card-title fw-bold mb-0">{analytics?.criticalAnomalies || 0}</h3>
                </div>
                <Bell size={24} className="text-danger" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Anomalies */}
      <div className="card mb-4">
        <div className="card-header bg-white d-flex align-items-center">
          <AlertTriangle size={20} className="me-2 text-warning" />
          <h3 className="h5 fw-semibold mb-0">Recent Anomalies</h3>
        </div>
        <div className="card-body">
          <div className="row">
            {anomalies.slice(0, 3).map(anomaly => (
              <div key={anomaly._id} className="col-12 mb-3">
                <div className={`p-3 rounded border-start border-4 ${
                  anomaly.severity === 'critical' ? 'border-danger bg-danger bg-opacity-10' :
                  anomaly.severity === 'high' ? 'border-danger bg-danger bg-opacity-10' :
                  anomaly.severity === 'medium' ? 'border-warning bg-warning bg-opacity-10' :
                  'border-primary bg-primary bg-opacity-10'
                }`}>
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <p className="fw-medium mb-1 text-body">{anomaly.type.replace('_', ' ').toUpperCase()}</p>
                      <p className="small text-muted mb-1">{anomaly.productId?.name}</p>
                      <p className="small text-body mb-1">{anomaly.description}</p>
                    </div>
                    <span className="small text-muted">
                      {new Date(anomaly.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {anomalies.length === 0 && (
              <div className="col-12 text-center py-3">
                <p className="text-muted mb-0">No anomalies detected</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category Stats */}
      {analytics?.categoryStats && (
        <div className="card">
          <div className="card-header bg-white">
            <h3 className="h5 fw-semibold mb-0">Category Distribution</h3>
          </div>
          <div className="card-body">
            <div className="row">
              {analytics.categoryStats.map(category => (
                <div key={category._id} className="col-md-6 col-lg-4 mb-3">
                  <div className="card border">
                    <div className="card-body">
                      <h4 className="h6 fw-medium text-body mb-1">{category._id}</h4>
                      <p className="small text-muted mb-1">{category.count} products</p>
                      <p className="small text-muted mb-0">FRW{category.totalValue.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

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
  
  const { data: products, loading, error, refetch } = useProducts({
    search: searchTerm
  });
  const toast = useToast();

  const handleAddProduct = async (e) => {
    e.preventDefault();
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

  const handleStockUpdate = async (id, change) => {
    try {
      await apiService.updateStock(id, {
        quantity: Math.abs(change),
        type: change > 0 ? 'restock' : 'sale',
        reason: change > 0 ? 'Manual restock' : 'Manual sale'
      });
      
      toast.success(`Stock ${change > 0 ? 'increased' : 'decreased'} successfully`);
      refetch();
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
    <div className="p-4" style={{ marginLeft: '250px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h3 fw-bold text-body mb-1">Inventory Management</h2>
          <p className="text-muted mb-0">Manage your store inventory</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
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
                      FRW{product.price}
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
                        <button className="btn btn-sm btn-outline-primary">
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
              <form onSubmit={handleAddProduct}>
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
                    Add Product
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

const Anomalies = () => {
  const { data: anomalies, loading, error, refetch } = useAnomalies();
  const toast = useToast();

  const handleResolveAnomaly = async (id) => {
    try {
      await apiService.resolveAnomaly(id);
      toast.success('Anomaly resolved successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to resolve anomaly');
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;

  return (
    <div className="p-4" style={{ marginLeft: '250px' }}>
      <div className="mb-4">
        <h2 className="h3 fw-bold text-body mb-1">AI Anomaly Detection</h2>
        <p className="text-muted">Review detected irregularities in your inventory</p>
      </div>

      <div className="row">
        {anomalies.map(anomaly => (
          <div key={anomaly._id} className="col-12 mb-3">
            <div className={`card border-start border-5 ${
              anomaly.severity === 'critical' ? 'border-danger' :
              anomaly.severity === 'high' ? 'border-danger' :
              anomaly.severity === 'medium' ? 'border-warning' :
              'border-primary'
            }`}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center mb-2">
                      <AlertTriangle size={18} className={`me-2 ${
                        anomaly.severity === 'critical' ? 'text-danger' :
                        anomaly.severity === 'high' ? 'text-danger' :
                        anomaly.severity === 'medium' ? 'text-warning' :
                        'text-primary'
                      }`} />
                      <h5 className="card-title mb-0 me-2">
                        {anomaly.type.replace('_', ' ').toUpperCase()}
                      </h5>
                      <span className={`badge ${
                        anomaly.severity === 'critical' ? 'bg-danger' :
                        anomaly.severity === 'high' ? 'bg-danger' :
                        anomaly.severity === 'medium' ? 'bg-warning' :
                        'bg-primary'
                      }`}>
                        {anomaly.severity}
                      </span>
                      {anomaly.aiConfidence && (
                        <span className="small text-muted ms-2">
                          {Math.round(anomaly.aiConfidence * 100)}% confidence
                        </span>
                      )}
                    </div>
                    <p className="small text-muted mb-1">
                      Product: {anomaly.productId?.name || 'Unknown'}
                    </p>
                    <p className="card-text mb-2">{anomaly.description}</p>
                    <p className="small text-muted mb-0">
                      Detected: {new Date(anomaly.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!anomaly.resolved && (
                    <div className="d-flex gap-2">
                      <button className="btn btn-sm btn-outline-primary d-flex align-items-center">
                        <Eye size={14} className="me-1" />
                        Investigate
                      </button>
                      <button 
                        onClick={() => handleResolveAnomaly(anomaly._id)}
                        className="btn btn-sm btn-outline-success"
                      >
                        ✓ Resolve
                      </button>
                    </div>
                  )}
                  {anomaly.resolved && (
                    <span className="badge bg-success">
                      ✓ Resolved
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {anomalies.length === 0 && (
          <div className="col-12">
            <div className="card text-center py-5">
              <AlertTriangle size={48} className="text-muted mx-auto mb-3" />
              <h3 className="h5 text-body mb-2">No anomalies detected</h3>
              <p className="text-muted mb-0">Your inventory is running smoothly!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Reports = () => (
  <div className="p-4" style={{ marginLeft: '250px' }}>
    <div className="mb-4">
      <h2 className="h3 fw-bold text-body mb-1">Reports & Analytics</h2>
      <p className="text-muted">Comprehensive insights into your inventory performance</p>
    </div>
    
    <div className="row">
      <div className="col-lg-6 mb-4">
        <div className="card">
          <div className="card-header bg-white">
            <h3 className="h5 fw-semibold mb-0">Inventory Value Trend</h3>
          </div>
          <div className="card-body">
            <div className="bg-light rounded d-flex align-items-center justify-content-center" style={{ height: '250px' }}>
              <p className="text-muted mb-0">Chart visualization would go here</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="col-lg-6 mb-4">
        <div className="card">
          <div className="card-header bg-white">
            <h3 className="h5 fw-semibold mb-0">Stock Movement</h3>
          </div>
          <div className="card-body">
            <div className="bg-light rounded d-flex align-items-center justify-content-center" style={{ height: '250px' }}>
              <p className="text-muted mb-0">Stock movement chart would go here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const SettingsPage = () => (
  <div className="p-4" style={{ marginLeft: '250px' }}>
    <div className="mb-4">
      <h2 className="h3 fw-bold text-body mb-1">Settings</h2>
      <p className="text-muted">Configure your inventory management system</p>
    </div>
    
    <div className="row">
      <div className="col-lg-6 mb-4">
        <div className="card">
          <div className="card-header bg-white">
            <h3 className="h5 fw-semibold mb-0">Alert Thresholds</h3>
          </div>
          <div className="card-body">
            <div className="mb-3">
              <label className="form-label">Low Stock Alert</label>
              <input type="number" defaultValue="20" className="form-control" />
            </div>
            <div className="mb-3">
              <label className="form-label">Expiry Warning (days)</label>
              <input type="number" defaultValue="30" className="form-control" />
            </div>
            <button className="btn btn-primary">
              Save Settings
            </button>
          </div>
        </div>
      </div>
      
      <div className="col-lg-6 mb-4">
        <div className="card">
          <div className="card-header bg-white">
            <h3 className="h5 fw-semibold mb-0">Store Information</h3>
          </div>
          <div className="card-body">
            <div className="mb-3">
              <label className="form-label">Store Name</label>
              <input type="text" defaultValue="Kigali Retail Store" className="form-control" />
            </div>
            <div className="mb-3">
              <label className="form-label">Location</label>
              <input type="text" defaultValue="Kigali, Rwanda" className="form-control" />
            </div>
            <button className="btn btn-primary">
              Update Information
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const AppContent = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'inventory': return <Inventory />;
      case 'anomalies': return <Anomalies />;
      case 'reports': return <Reports />;
      case 'settings': return <SettingsPage />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="bg-light min-vh-100">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      {renderContent()}
    </div>
  );
};

const App = () => (
  <ToastProvider>
    <AppContent />
  </ToastProvider>
);

export default App;