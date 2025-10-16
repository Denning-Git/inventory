// src/store/authStore.js
import { create } from 'zustand';
import { apiService } from '../services/api';
export const useAuthStore = create((set, get) => ({
  user: null,
  isLoggedIn: false,
  userRole:null,
  loading:true,
  quotation:null,
  showMenuLabel:true,

  changeShowMenuLabel: () => {
    const currentState = get().showMenuLabel;
    set({ showMenuLabel: !currentState });
  },

  
  logout: () => {
    localStorage.removeItem('token');
    set({ isLoggedIn: false, user: null, });
  },
  hasAnyRole: (roles) => {
    const { user } = get();
    return roles.includes(user?.role);
  },
  login: async (userData) => {
  try {
    const response = await apiService.sendData('/auth/login',userData);
    
    if (response.token) {
      // console.log(response?.token)
       await localStorage.setItem('token', response.token);
      set({
          user: response.user,
          isLoggedIn: true,
          userRole:response.user.role
        });

      // await get().checkAuth();
      return {
        status:false
      };
    } else {
      set({ isLoggedIn: false, user: null,userRole:null });
      return {
        role:null,
        status:false
      };
    }
  } catch (error) {
    console.log(error);
    set({ isLoggedIn: false, user: null });
    return {
        role:null,
        status:false
      };
  }
},

  checkAuth: async () => {
    try {
      const response = await apiService.getData('/user/profile');
      // console.log('response',response)
      if (response.user) {
        set({
          user: response.user,
          isLoggedIn: true,
          userRole:response.user.role
        });
      } else {
        localStorage.removeItem('token');
        set({ isLoggedIn: false, user: null,userRole:null, });
      }
    } catch (error) {
      console.error('Failed to auto-login:', error);
      localStorage.removeItem('token');
      set({ isLoggedIn: false, user: null });
    }
  },

  
  initialize: async () => {

    const token = await localStorage.getItem('token');
    
    if (!token) {
      set({ isLoggedIn: false, user: null,loading: false });
      return;
    }
    await get().checkAuth();
    set({ loading: false });
    }

    
}));