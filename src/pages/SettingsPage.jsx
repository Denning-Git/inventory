import React, { useState } from "react";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import { 
  Save, 
  Bell, 
  Shield, 
  Database, 
  Palette,
  User,
  RefreshCw,
  Trash2,
  Download,
  Upload
} from "lucide-react";
import { useToast } from "../components/Toast";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();

  // Mock user settings - in a real app, these would come from your backend
  const [settings, setSettings] = useState({
    general: {
      companyName: "My Inventory Store",
      currency: "USD",
      dateFormat: "MM/DD/YYYY",
      timezone: "America/New_York",
      lowStockThreshold: 10,
      enableExpiryAlerts: true
    },
    notifications: {
      emailNotifications: true,
      lowStockAlerts: true,
      expiryAlerts: true,
      theftAlerts: true,
      dailySummary: false,
      weeklyReport: true
    },
    appearance: {
      theme: "light",
      compactMode: false,
      showImages: true,
      itemsPerPage: 25
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 60,
      passwordExpiry: 90,
      loginAlerts: true
    }
  });

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handleSaveSettings = async (category) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you would save to your backend here
      // await apiService.updateSettings(settings[category]);
      
      toast.success(`${category.charAt(0).toUpperCase() + category.slice(1)} settings saved successfully`);
    } catch (err) {
      setError(err.message || 'Failed to save settings');
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    setLoading(true);
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create a mock export file
      const exportData = JSON.stringify(settings, null, 2);
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `inventory-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Settings exported successfully');
    } catch (err) {
      setError(err.message || 'Failed to export data');
      toast.error('Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  const handleImportData = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const fileContent = await file.text();
      const importedSettings = JSON.parse(fileContent);
      
      // Validate the imported settings structure
      if (importedSettings.general && importedSettings.notifications) {
        setSettings(importedSettings);
        toast.success('Settings imported successfully');
      } else {
        throw new Error('Invalid settings file format');
      }
    } catch (err) {
      setError(err.message || 'Failed to import data');
      toast.error('Failed to import data');
    } finally {
      setLoading(false);
      event.target.value = ''; // Reset file input
    }
  };

  const handleResetSettings = () => {
    if (window.confirm('Are you sure you want to reset all settings to default? This action cannot be undone.')) {
      // Reset to default settings
      setSettings({
        general: {
          companyName: "My Inventory Store",
          currency: "USD",
          dateFormat: "MM/DD/YYYY",
          timezone: "America/New_York",
          lowStockThreshold: 10,
          enableExpiryAlerts: true
        },
        notifications: {
          emailNotifications: true,
          lowStockAlerts: true,
          expiryAlerts: true,
          theftAlerts: true,
          dailySummary: false,
          weeklyReport: true
        },
        appearance: {
          theme: "light",
          compactMode: false,
          showImages: true,
          itemsPerPage: 25
        },
        security: {
          twoFactorAuth: false,
          sessionTimeout: 60,
          passwordExpiry: 90,
          loginAlerts: true
        }
      });
      toast.success('Settings reset to default');
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} onRetry={() => setError(null)} />;

  return (
    <div className="p-4">
      <div className="mb-4">
        <h2 className="h3 fw-bold text-body mb-1">Settings</h2>
        <p className="text-muted">Manage your inventory system preferences and configuration</p>
      </div>

      <div className="row">
        {/* Sidebar Navigation */}
        <div className="col-lg-3 mb-4">
          <div className="card">
            <div className="card-body p-0">
              <div className="list-group list-group-flush">
                <button
                  className={`list-group-item list-group-item-action d-flex align-items-center ${activeTab === 'general' ? 'active' : ''}`}
                  onClick={() => setActiveTab('general')}
                >
                  <User size={18} className="me-2" />
                  General
                </button>
                <button
                  className={`list-group-item list-group-item-action d-flex align-items-center ${activeTab === 'notifications' ? 'active' : ''}`}
                  onClick={() => setActiveTab('notifications')}
                >
                  <Bell size={18} className="me-2" />
                  Notifications
                </button>
                <button
                  className={`list-group-item list-group-item-action d-flex align-items-center ${activeTab === 'appearance' ? 'active' : ''}`}
                  onClick={() => setActiveTab('appearance')}
                >
                  <Palette size={18} className="me-2" />
                  Appearance
                </button>
                <button
                  className={`list-group-item list-group-item-action d-flex align-items-center ${activeTab === 'security' ? 'active' : ''}`}
                  onClick={() => setActiveTab('security')}
                >
                  <Shield size={18} className="me-2" />
                  Security
                </button>
                <button
                  className={`list-group-item list-group-item-action d-flex align-items-center ${activeTab === 'data' ? 'active' : ''}`}
                  onClick={() => setActiveTab('data')}
                >
                  <Database size={18} className="me-2" />
                  Data Management
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="col-lg-9">
          <div className="card">
            <div className="card-body">
              {/* General Settings */}
              {activeTab === 'general' && (
                <div>
                  <h3 className="h5 fw-semibold mb-4">General Settings</h3>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Company Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={settings.general.companyName}
                        onChange={(e) => handleSettingChange('general', 'companyName', e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Currency</label>
                      <select
                        className="form-select"
                        value={settings.general.currency}
                        onChange={(e) => handleSettingChange('general', 'currency', e.target.value)}
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="JPY">JPY (¥)</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Date Format</label>
                      <select
                        className="form-select"
                        value={settings.general.dateFormat}
                        onChange={(e) => handleSettingChange('general', 'dateFormat', e.target.value)}
                      >
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Timezone</label>
                      <select
                        className="form-select"
                        value={settings.general.timezone}
                        onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
                      >
                        <option value="America/New_York">Eastern Time (ET)</option>
                        <option value="America/Chicago">Central Time (CT)</option>
                        <option value="America/Denver">Mountain Time (MT)</option>
                        <option value="America/Los_Angeles">Pacific Time (PT)</option>
                        <option value="UTC">UTC</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Low Stock Threshold</label>
                      <input
                        type="number"
                        className="form-control"
                        min="1"
                        value={settings.general.lowStockThreshold}
                        onChange={(e) => handleSettingChange('general', 'lowStockThreshold', parseInt(e.target.value))}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Expiry Alerts</label>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={settings.general.enableExpiryAlerts}
                          onChange={(e) => handleSettingChange('general', 'enableExpiryAlerts', e.target.checked)}
                        />
                        <label className="form-check-label">
                          Enable expiry date alerts
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => handleSaveSettings('general')}
                      className="btn btn-primary d-flex align-items-center"
                      disabled={loading}
                    >
                      <Save size={16} className="me-1" />
                      Save General Settings
                    </button>
                  </div>
                </div>
              )}

              {/* Notification Settings */}
              {activeTab === 'notifications' && (
                <div>
                  <h3 className="h5 fw-semibold mb-4">Notification Settings</h3>
                  <div className="row g-3">
                    <div className="col-12">
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={settings.notifications.emailNotifications}
                          onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
                        />
                        <label className="form-check-label fw-medium">
                          Enable Email Notifications
                        </label>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={settings.notifications.lowStockAlerts}
                          onChange={(e) => handleSettingChange('notifications', 'lowStockAlerts', e.target.checked)}
                          disabled={!settings.notifications.emailNotifications}
                        />
                        <label className="form-check-label">
                          Low Stock Alerts
                        </label>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={settings.notifications.expiryAlerts}
                          onChange={(e) => handleSettingChange('notifications', 'expiryAlerts', e.target.checked)}
                          disabled={!settings.notifications.emailNotifications}
                        />
                        <label className="form-check-label">
                          Expiry Date Alerts
                        </label>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={settings.notifications.theftAlerts}
                          onChange={(e) => handleSettingChange('notifications', 'theftAlerts', e.target.checked)}
                          disabled={!settings.notifications.emailNotifications}
                        />
                        <label className="form-check-label">
                          Theft Detection Alerts
                        </label>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={settings.notifications.dailySummary}
                          onChange={(e) => handleSettingChange('notifications', 'dailySummary', e.target.checked)}
                          disabled={!settings.notifications.emailNotifications}
                        />
                        <label className="form-check-label">
                          Daily Summary Report
                        </label>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={settings.notifications.weeklyReport}
                          onChange={(e) => handleSettingChange('notifications', 'weeklyReport', e.target.checked)}
                          disabled={!settings.notifications.emailNotifications}
                        />
                        <label className="form-check-label">
                          Weekly Analytics Report
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => handleSaveSettings('notifications')}
                      className="btn btn-primary d-flex align-items-center"
                      disabled={loading}
                    >
                      <Save size={16} className="me-1" />
                      Save Notification Settings
                    </button>
                  </div>
                </div>
              )}

              {/* Appearance Settings */}
              {activeTab === 'appearance' && (
                <div>
                  <h3 className="h5 fw-semibold mb-4">Appearance Settings</h3>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Theme</label>
                      <select
                        className="form-select"
                        value={settings.appearance.theme}
                        onChange={(e) => handleSettingChange('appearance', 'theme', e.target.value)}
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="auto">Auto (System)</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Items Per Page</label>
                      <select
                        className="form-select"
                        value={settings.appearance.itemsPerPage}
                        onChange={(e) => handleSettingChange('appearance', 'itemsPerPage', parseInt(e.target.value))}
                      >
                        <option value="10">10 items</option>
                        <option value="25">25 items</option>
                        <option value="50">50 items</option>
                        <option value="100">100 items</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={settings.appearance.compactMode}
                          onChange={(e) => handleSettingChange('appearance', 'compactMode', e.target.checked)}
                        />
                        <label className="form-check-label">
                          Compact Mode (Dense layout)
                        </label>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={settings.appearance.showImages}
                          onChange={(e) => handleSettingChange('appearance', 'showImages', e.target.checked)}
                        />
                        <label className="form-check-label">
                          Show Product Images
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => handleSaveSettings('appearance')}
                      className="btn btn-primary d-flex align-items-center"
                      disabled={loading}
                    >
                      <Save size={16} className="me-1" />
                      Save Appearance Settings
                    </button>
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <div>
                  <h3 className="h5 fw-semibold mb-4">Security Settings</h3>
                  <div className="row g-3">
                    <div className="col-12">
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={settings.security.twoFactorAuth}
                          onChange={(e) => handleSettingChange('security', 'twoFactorAuth', e.target.checked)}
                        />
                        <label className="form-check-label fw-medium">
                          Enable Two-Factor Authentication
                        </label>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Session Timeout (minutes)</label>
                      <select
                        className="form-select"
                        value={settings.security.sessionTimeout}
                        onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                      >
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="60">60 minutes</option>
                        <option value="120">2 hours</option>
                        <option value="0">Never timeout</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Password Expiry (days)</label>
                      <select
                        className="form-select"
                        value={settings.security.passwordExpiry}
                        onChange={(e) => handleSettingChange('security', 'passwordExpiry', parseInt(e.target.value))}
                      >
                        <option value="30">30 days</option>
                        <option value="60">60 days</option>
                        <option value="90">90 days</option>
                        <option value="180">180 days</option>
                        <option value="0">Never expire</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={settings.security.loginAlerts}
                          onChange={(e) => handleSettingChange('security', 'loginAlerts', e.target.checked)}
                        />
                        <label className="form-check-label">
                          Send email alerts for new logins
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => handleSaveSettings('security')}
                      className="btn btn-primary d-flex align-items-center"
                      disabled={loading}
                    >
                      <Save size={16} className="me-1" />
                      Save Security Settings
                    </button>
                  </div>
                </div>
              )}

              {/* Data Management Settings */}
              {activeTab === 'data' && (
                <div>
                  <h3 className="h5 fw-semibold mb-4">Data Management</h3>
                  <div className="row g-4">
                    <div className="col-md-6">
                      <div className="card">
                        <div className="card-body text-center">
                          <Download size={32} className="text-primary mb-3" />
                          <h5 className="card-title">Export Settings</h5>
                          <p className="card-text text-muted">
                            Download your current settings as a JSON file for backup or transfer.
                          </p>
                          <button
                            onClick={handleExportData}
                            className="btn btn-outline-primary"
                            disabled={loading}
                          >
                            Export Settings
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="card">
                        <div className="card-body text-center">
                          <Upload size={32} className="text-success mb-3" />
                          <h5 className="card-title">Import Settings</h5>
                          <p className="card-text text-muted">
                            Upload a JSON file to restore your settings from a previous backup.
                          </p>
                          <input
                            type="file"
                            id="importFile"
                            accept=".json"
                            onChange={handleImportData}
                            className="d-none"
                          />
                          <label htmlFor="importFile" className="btn btn-outline-success">
                            Import Settings
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="card border-danger">
                        <div className="card-body text-center">
                          <Trash2 size={32} className="text-danger mb-3" />
                          <h5 className="card-title text-danger">Reset Settings</h5>
                          <p className="card-text text-muted">
                            Reset all settings to their default values. This action cannot be undone.
                          </p>
                          <button
                            onClick={handleResetSettings}
                            className="btn btn-outline-danger"
                            disabled={loading}
                          >
                            Reset to Defaults
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;