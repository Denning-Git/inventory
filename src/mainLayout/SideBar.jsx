import React from "react";
import { 
  Package, 
  AlertTriangle, 
  TrendingUp,
  BarChart3,
  Settings,
  LogOut,
  Activity
} from 'lucide-react';
import { Link } from "react-router-dom";
import { Image } from "react-bootstrap";
import siteLogo from '../assets/logo.png'
import { useAuthStore } from "../store/authStore";

const Sidebar = ({ activeTab, setActiveTab }) => {
  const {logout,hasAnyRole} = useAuthStore()
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, path:'/' },
    { id: 'inventory', label: 'Inventory', icon: Package, path:'inventory' },
    { id: 'anomalies', label: 'Anomalies', icon: AlertTriangle, path:'anomalies',accesseble:['admin'] },
    { id: 'reports', label: 'Reports', icon: TrendingUp, path:'reports',accesseble:['admin'] },
    { id: 'transactions', label: 'Transactions', icon: Activity, path:'transactions' }
  ];

  return (
    <div className="bg-dark text-white vh-100 position-fixed sidebar" style={{ width: '250px', zIndex: 1000 }}>
      <div className="p-3">
        <div className="d-flex align-items-center mb-4 p-2 gap-2">
          <img src={siteLogo} className="site-logo"/>
          <h1 className="h5 fw-bold mb-0">ShringGuard</h1>
        </div>
        
        <nav className="nav flex-column">
          {menuItems.map(item => {
            const Icon = item.icon;
            if (!item?.accesseble || (item?.accesseble && hasAnyRole(item.accesseble)))
            return (
              <Link key={item.id}
              className={`btn btn-link text-start text-decoration-none d-flex align-items-center p-2 mb-1 rounded ${
                activeTab === item.id 
                ? 'btn-primary text-white'
                : 'text-light hover-dark'
                }`}
                style={{ backgroundColor: activeTab === item.id ? '#0d6efd' : 'transparent' }}
               to={item.path}>
                <Icon size={18} className="me-2" />
                {item.label}
                </Link>
            );
          })}
        </nav>
        
        <div className="mt-auto pt-4">
          <button onClick={logout} className="btn btn-link text-start text-decoration-none d-flex align-items-center p-2 mb-1 rounded text-light w-100">
            <LogOut size={18} className="me-2" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};
export default Sidebar








