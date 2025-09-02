import React, { useState } from "react";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import { AlertTriangle, Eye, Play, TestTube, Zap } from "lucide-react";
import { useAnomalies } from "../hooks/useApi";
import { useToast } from "../components/Toast";
import { apiService } from "../services/api";

const Anomalies = () => {
  const { data: anomalies, loading, error, refetch } = useAnomalies();
  const toast = useToast();
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState(null);

  const handleResolveAnomaly = async (id) => {
    try {
      await apiService.resolveAnomaly(id);
      toast.success('Anomaly resolved successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to resolve anomaly');
    }
  };

  const runTestScenario = async (scenario) => {
    setIsTesting(true);
    setTestResults(null);
    
    try {
      let result;
      
      switch(scenario) {
        case 'low_stock':
          result = await testLowStockScenario();
          break;
        case 'theft':
          result = await testTheftScenario();
          break;
        case 'shrinkage':
          result = await testShrinkageScenario();
          break;
        case 'unauthorized':
          result = await testUnauthorizedAccessScenario();
          break;
        case 'general':
          result = await apiService.triggerAnomalyDetection();
          break;
        case 'theft_focused':
          result = await apiService.post('/ai/detect-theft');
          break;
        default:
          throw new Error('Unknown test scenario');
      }
      
      setTestResults(result);
      toast.success(`Test scenario "${scenario}" completed`);
      refetch(); // Refresh anomalies list
    } catch (error) {
      toast.error(`Test failed: ${error.message}`);
      console.error('Test error:', error);
    } finally {
      setIsTesting(false);
    }
  };

  // Test scenario implementations
  const testLowStockScenario = async () => {
    // Create a test product
    const product = await apiService.createProduct({
      name: 'Test Product - Low Stock',
      category: 'Test',
      quantity: 5,
      minimumStock: 10,
      price: 29.99,
      currency: 'USD'
    });
    
    // Trigger detection
    const result = await apiService.triggerAnomalyDetection();
    
    return {
      ...result,
      testProductId: product._id,
      scenario: 'Low Stock Detection'
    };
  };

  const testTheftScenario = async () => {
    // Create a test product
    const product = await apiService.createProduct({
      name: 'Test Product - Theft Scenario',
      category: 'Test',
      quantity: 100,
      minimumStock: 10,
      price: 99.99,
      currency: 'USD'
    });
    
    // Create some legitimate transactions
    await apiService.updateStock(product._id, {
      quantity: 10,
      type: 'sale',
      reason: 'Test customer purchase'
    });
    
    // Simulate theft by directly reducing stock
    await apiService.updateProduct(product._id, {
      quantity: 85 // Should be 90 if only the sale occurred
    });
    
    // Trigger theft detection
    const result = await apiService.post('/ai/detect-theft');
    
    return {
      ...result,
      testProductId: product._id,
      scenario: 'Theft Detection'
    };
  };

  const testShrinkageScenario = async () => {
    // Create a test product
    const product = await apiService.createProduct({
      name: 'Test Product - Shrinkage',
      category: 'Test',
      quantity: 200,
      minimumStock: 10,
      price: 49.99,
      currency: 'USD'
    });
    
    // Create multiple small transactions
    for (let i = 0; i < 8; i++) {
      await apiService.updateStock(product._id, {
        quantity: 2,
        type: 'sale',
        reason: 'Test customer purchase'
      });
      
      // Simulate small unexplained losses
      if (i % 2 === 0) {
        const currentProduct = await apiService.getProduct(product._id);
        await apiService.updateProduct(product._id, {
          quantity: currentProduct.quantity - 1
        });
      }
    }
    
    // Trigger detection
    const result = await apiService.triggerAnomalyDetection();
    
    return {
      ...result,
      testProductId: product._id,
      scenario: 'Shrinkage Detection'
    };
  };

  const testUnauthorizedAccessScenario = async () => {
    // Create a test product
    const product = await apiService.createProduct({
      name: 'Test Product - Unauthorized Access',
      category: 'Test',
      quantity: 50,
      minimumStock: 5,
      price: 79.99,
      currency: 'USD'
    });
    
    // Simulate multiple transactions by the same user
    // Note: This would require backend support for user simulation
    // For now, we'll just trigger the detection
    const result = await apiService.post('/ai/detect-theft');
    
    return {
      ...result,
      testProductId: product._id,
      scenario: 'Unauthorized Access Detection'
    };
  };

  const cleanupTestProducts = async () => {
    try {
      const products = await apiService.getProducts();
      const testProducts = products.filter(p => p.name.includes('Test Product -'));
      
      for (const product of testProducts) {
        try {
          await apiService.deleteProduct(product._id);
        } catch (e) {
          console.warn(`Could not delete product ${product._id}:`, e.message);
        }
      }
      
      toast.success(`Cleaned up ${testProducts.length} test products`);
      refetch();
    } catch (error) {
      toast.error('Cleanup failed: ' + error.message);
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;

  return (
    <div className="p-4">
      <div className="mb-4">
        <h2 className="h3 fw-bold text-body mb-1">AI Anomaly Detection</h2>
        <p className="text-muted">Review detected irregularities in your inventory</p>
      </div>

      {/* Test Controls Section */}
      <div className="card mb-4">
        <div className="card-header bg-light">
          <h3 className="h5 mb-0 d-flex align-items-center">
            <TestTube size={20} className="me-2" />
            Test Scenarios
          </h3>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-8">
              <p className="text-muted mb-3">
                Run test scenarios to validate the anomaly detection system
              </p>
              
              <div className="d-flex flex-wrap gap-2 mb-3">
                <button 
                  onClick={() => runTestScenario('low_stock')}
                  disabled={isTesting}
                  className="btn btn-outline-primary btn-sm d-flex align-items-center"
                >
                  <Play size={14} className="me-1" />
                  Low Stock Test
                </button>
                
                <button 
                  onClick={() => runTestScenario('theft')}
                  disabled={isTesting}
                  className="btn btn-outline-danger btn-sm d-flex align-items-center"
                >
                  <Play size={14} className="me-1" />
                  Theft Test
                </button>
                
                <button 
                  onClick={() => runTestScenario('shrinkage')}
                  disabled={isTesting}
                  className="btn btn-outline-warning btn-sm d-flex align-items-center"
                >
                  <Play size={14} className="me-1" />
                  Shrinkage Test
                </button>
                
                <button 
                  onClick={() => runTestScenario('unauthorized')}
                  disabled={isTesting}
                  className="btn btn-outline-info btn-sm d-flex align-items-center"
                >
                  <Play size={14} className="me-1" />
                  Access Test
                </button>
                
                <button 
                  onClick={() => runTestScenario('general')}
                  disabled={isTesting}
                  className="btn btn-outline-secondary btn-sm d-flex align-items-center"
                >
                  <Zap size={14} className="me-1" />
                  General Detection
                </button>
              </div>
            </div>
            
            <div className="col-md-4">
              <div className="d-flex justify-content-end">
                <button 
                  onClick={cleanupTestProducts}
                  className="btn btn-outline-dark btn-sm"
                >
                  Cleanup Test Products
                </button>
              </div>
            </div>
          </div>
          
          {isTesting && (
            <div className="alert alert-info d-flex align-items-center">
              <div className="spinner-border spinner-border-sm me-2" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              Running test scenario...
            </div>
          )}
          
          {testResults && (
            <div className="alert alert-success mt-3">
              <h6 className="alert-heading">Test Results</h6>
              <p className="mb-1">
                <strong>Scenario:</strong> {testResults.scenario}
              </p>
              <p className="mb-1">
                <strong>Anomalies Detected:</strong> {testResults.anomaliesDetected || testResults.totalAnomaliesDetected}
              </p>
              <p className="mb-1">
                <strong>Alerts Generated:</strong> {testResults.alertsGenerated}
              </p>
              {testResults.testProductId && (
                <p className="mb-0">
                  <strong>Test Product ID:</strong> {testResults.testProductId}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Anomalies List */}
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
                    {anomaly.metadata && (
                      <div className="mb-2">
                        <details className="small">
                          <summary>Details</summary>
                          <pre className="mt-2 p-2 bg-light rounded">
                            {JSON.stringify(anomaly.metadata, null, 2)}
                          </pre>
                        </details>
                      </div>
                    )}
                    <p className="small text-muted mb-0">
                      Detected: {new Date(anomaly.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!anomaly.resolved && (
                    <div className="d-flex gap-2">
                      {/* <button className="btn btn-sm btn-outline-primary d-flex align-items-center">
                        <Eye size={14} className="me-1" />
                        Investigate
                      </button> */}
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

export default Anomalies;