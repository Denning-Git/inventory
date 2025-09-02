import React, { useState, useEffect } from "react";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Download,
  Calendar,
  Filter 
} from "lucide-react";
import { apiService } from "../services/api";
import { useToast } from "../components/Toast";

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportsData, setReportsData] = useState(null);
  const [timeRange, setTimeRange] = useState('30'); // days
  const toast = useToast();

  useEffect(() => {
    fetchReportsData();
  }, [timeRange]);

  const fetchReportsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [dashboardData, theftData, transactions] = await Promise.all([
        apiService.getDashboardAnalytics(),
        apiService.getTheftAnalytics({ days: timeRange }),
        apiService.getTransactions({ limit: 1000 })
      ]);
      
      setReportsData({
        dashboard: dashboardData,
        theft: theftData,
        transactions: transactions
      });
    } catch (err) {
      setError(err.message || 'Failed to load reports data');
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const generateCSV = () => {
    if (!reportsData) return;
    
    // Create CSV content
    let csvContent = "Inventory Reports\n\n";
    
    // Summary section
    csvContent += "SUMMARY\n";
    csvContent += `Total Products,${reportsData?.dashboard?.totalProducts}\n`;
    csvContent += `Total Inventory Value,${reportsData?.dashboard?.totalValue.toFixed(2)}\n`;
    csvContent += `Low Stock Items,${reportsData?.dashboard?.lowStockCount}\n`;
    csvContent += `Critical Anomalies,${reportsData?.dashboard?.criticalAnomalies}\n\n`;
    
    // Theft analytics
    csvContent += "THEFT ANALYTICS\n";
    csvContent += `Total Incidents,${reportsData?.theft?.totalIncidents}\n`;
    csvContent += `Resolved Incidents,${reportsData?.theft?.resolvedIncidents}\n`;
    csvContent += `Estimated Loss,${reportsData?.theft?.estimatedLoss.toFixed(2)}\n\n`;
    
    // Category breakdown
    csvContent += "CATEGORY BREAKDOWN\n";
    csvContent += "Category,Count,Total Value\n";
    reportsData?.dashboard?.categoryStats.forEach(cat => {
      csvContent += `${cat._id || 'Uncategorized'},${cat.count},${cat.totalValue.toFixed(2)}\n`;
    });
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inventory-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Report downloaded successfully');
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} onRetry={fetchReportsData} />;
  if (!reportsData) return null;

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h3 fw-bold text-body mb-1">Reports & Analytics</h2>
          <p className="text-muted">Comprehensive insights into your inventory performance</p>
        </div>
        <div className="d-flex gap-2">
          <select 
            className="form-select form-select-sm"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            style={{ width: 'auto' }}
          >
            <option value="1">Last 1 day</option>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
          <button 
            onClick={generateCSV}
            className="btn btn-outline-primary btn-sm d-flex align-items-center"
          >
            <Download size={16} className="me-1" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row mb-4">
        <div className="col-md-3 col-6 mb-3">
          <div className="card border-0 bg-primary bg-opacity-10">
            <div className="card-body text-center">
              <div className="text-primary mb-2">
                <BarChart3 size={24} />
              </div>
              <h3 className="h4 fw-bold text-primary">{reportsData?.dashboard?.totalProducts}</h3>
              <p className="text-muted mb-0">Total Products</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 col-6 mb-3">
          <div className="card border-0 bg-success bg-opacity-10">
            <div className="card-body text-center">
              <div className="text-success mb-2">
                <TrendingUp size={24} />
              </div>
              <h3 className="h4 fw-bold text-success">
                ${reportsData?.dashboard?.totalValue.toFixed(2)}
              </h3>
              <p className="text-muted mb-0">Total Value</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 col-6 mb-3">
          <div className="card border-0 bg-warning bg-opacity-10">
            <div className="card-body text-center">
              <div className="text-warning mb-2">
                <Filter size={24} />
              </div>
              <h3 className="h4 fw-bold text-warning">{reportsData?.dashboard?.lowStockCount}</h3>
              <p className="text-muted mb-0">Low Stock Items</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 col-6 mb-3">
          <div className="card border-0 bg-danger bg-opacity-10">
            <div className="card-body text-center">
              <div className="text-danger mb-2">
                <Calendar size={24} />
              </div>
              <h3 className="h4 fw-bold text-danger">{reportsData?.dashboard?.criticalAnomalies}</h3>
              <p className="text-muted mb-0">Critical Issues</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="row">
        <div className="col-lg-6 mb-4">
          <div className="card">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h3 className="h5 fw-semibold mb-0">Inventory Value by Category</h3>
              <PieChart size={18} className="text-muted" />
            </div>
            <div className="card-body">
              <div style={{ height: '250px' }}>
                {reportsData?.dashboard?.categoryStats.length > 0 ? (
                  <div className="row g-3">
                    {reportsData?.dashboard?.categoryStats.map((category, index) => (
                      <div key={index} className="col-12">
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="fw-medium">{category._id || 'Uncategorized'}</span>
                          <span className="text-muted">
                            ${category.totalValue.toFixed(2)}
                          </span>
                        </div>
                        <div className="progress mb-2" style={{ height: '8px' }}>
                          <div
                            className="progress-bar"
                            role="progressbar"
                            style={{ 
                              width: `${(category.totalValue / reportsData?.dashboard?.totalValue) * 100}%`,
                              backgroundColor: `hsl(${index * 45}, 70%, 50%)`
                            }}
                          ></div>
                        </div>
                        <div className="d-flex justify-content-between small text-muted">
                          <span>{category.count} items</span>
                          <span>
                            {((category.totalValue / reportsData?.dashboard?.totalValue) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted py-5">
                    No category data available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-lg-6 mb-4">
          <div className="card">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h3 className="h5 fw-semibold mb-0">Theft & Security Overview</h3>
              <Filter size={18} className="text-muted" />
            </div>
            <div className="card-body">
              <div style={{ height: '250px' }}>
                {reportsData?.theft?.totalIncidents > 0 ? (
                  <div className="row g-3">
                    <div className="col-12">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="fw-medium">Total Incidents</span>
                        <span className="badge bg-primary">{reportsData?.theft?.totalIncidents}</span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="fw-medium">Resolved</span>
                        <span className="badge bg-success">{reportsData?.theft?.resolvedIncidents}</span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="fw-medium">Active</span>
                        <span className="badge bg-warning">{reportsData?.theft?.activeIncidents}</span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="fw-medium">Estimated Loss</span>
                        <span className="badge bg-danger">
                          ${reportsData?.theft?.estimatedLoss.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    
                    {reportsData?.theft?.highRiskProducts.length > 0 && (
                      <div className="col-12">
                        <h6 className="fw-semibold mb-2">High-Risk Products</h6>
                        {reportsData?.theft?.highRiskProducts.slice(0, 3).map((product, index) => (
                          <div key={index} className="d-flex justify-content-between align-items-center mb-1">
                            <small>{product.productName}</small>
                            <small className="text-muted">{product.incidentCount} incidents</small>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-muted py-5">
                    No security incidents detected
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header bg-white">
              <h3 className="h5 fw-semibold mb-0">Recent Stock Movements</h3>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Type</th>
                      <th>Quantity</th>
                      <th>Previous</th>
                      <th>New</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportsData?.transactions?.slice(0, 10).map((transaction) => (
                      <tr key={transaction._id}>
                        <td>{transaction.productId?.name || 'Unknown'}</td>
                        <td>
                          <span className={`badge ${
                            transaction.type === 'sale' ? 'bg-success' :
                            transaction.type === 'restock' ? 'bg-primary' :
                            'bg-secondary'
                          }`}>
                            {transaction.type}
                          </span>
                        </td>
                        <td className={
                          transaction.type === 'sale' ? 'text-danger' : 'text-success'
                        }>
                          {transaction.type === 'sale' ? '-' : '+'}{Math.abs(transaction.quantity)}
                        </td>
                        <td>{transaction.previousQuantity}</td>
                        <td>
                          <strong>{transaction.newQuantity}</strong>
                        </td>
                        <td>
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {reportsData?.transactions?.length === 0 && (
                <div className="text-center text-muted py-3">
                  No recent transactions
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Analytics Section */}
      <div className="row mt-4">
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header bg-white">
              <h3 className="h5 fw-semibold mb-0">Stock Health Overview</h3>
            </div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col-4">
                  <div className="border-end">
                    <h4 className="fw-bold text-success">{reportsData?.dashboard?.totalProducts - reportsData?.dashboard?.lowStockCount}</h4>
                    <small className="text-muted">Healthy Items</small>
                  </div>
                </div>
                <div className="col-4">
                  <div className="border-end">
                    <h4 className="fw-bold text-warning">{reportsData?.dashboard?.lowStockCount}</h4>
                    <small className="text-muted">Low Stock</small>
                  </div>
                </div>
                <div className="col-4">
                  <div>
                    <h4 className="fw-bold text-danger">{reportsData?.dashboard?.criticalAnomalies}</h4>
                    <small className="text-muted">Critical</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header bg-white">
              <h3 className="h5 fw-semibold mb-0">Transaction Summary</h3>
            </div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col-3">
                  <div className="border-end">
                    <h4 className="fw-bold text-primary">
                      {reportsData?.transactions?.filter(t => t.type === 'restock').length}
                    </h4>
                    <small className="text-muted">Restocks</small>
                  </div>
                </div>
                <div className="col-3">
                  <div className="border-end">
                    <h4 className="fw-bold text-success">
                      {reportsData?.transactions?.filter(t => t.type === 'sale').length}
                    </h4>
                    <small className="text-muted">Sales</small>
                  </div>
                </div>
                <div className="col-3">
                  <div className="border-end">
                    <h4 className="fw-bold text-info">
                      {reportsData?.transactions?.filter(t => t.type === 'purchase').length}
                    </h4>
                    <small className="text-muted">Purchases</small>
                  </div>
                </div>
                <div className="col-3">
                  <div>
                    <h4 className="fw-bold text-secondary">
                      {reportsData?.transactions?.filter(t => t.type === 'adjustment').length}
                    </h4>
                    <small className="text-muted">Adjustments</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;