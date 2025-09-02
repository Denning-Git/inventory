import React from "react";
import { 
  Package, 
  AlertTriangle,
  DollarSign,
  Bell,
  RefreshCw
} from 'lucide-react';
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import { apiService } from "../services/api";
import { useProducts, useAnomalies, useDashboardAnalytics } from '../hooks/useApi';
import { useToast } from "../components/Toast";
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
    <div className="p-4">
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
                  <h3 className="card-title fw-bold mb-0">FRW {analytics?.totalValue?.toLocaleString() || 0}</h3>
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
                      <p className="small text-muted mb-0">FRW {category.totalValue.toLocaleString()}</p>
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

export default Dashboard