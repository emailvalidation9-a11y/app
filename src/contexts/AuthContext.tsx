import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '@/services/api';

interface User {
  id: string;
  name: string;
  email: string;
  credits: number;
  total_validations: number;
  plan: {
    name: string;
    credits_limit: number;
    renewal_date?: string;
  };
  role: string;
  email_verified: boolean;
  razorpay?: {
    subscriptionId?: string;
    status?: string;
  };
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for stored token and validate it
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.data.user);
    } catch (error) {
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await api.post('/auth/login', { email, password });

      const { token, user } = response.data.data;
      localStorage.setItem('token', token);
      setUser(user);

      // If email not verified, redirect to verify page
      if (!user.email_verified) {
        toast.info('Please verify your email to continue.');
        setTimeout(() => {
          navigate('/verify-email');
        }, 100);
        return;
      }

      toast.success('Login successful!');
      // Small delay to ensure state is updated before navigation
      setTimeout(() => {
        navigate('/dashboard');
      }, 100);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Login failed';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await api.post('/auth/register', { name, email, password });

      const { token, user } = response.data.data;
      localStorage.setItem('token', token);
      setUser(user);

      toast.success('Registration successful! Please check your email to verify.');
      // Navigate to verify-email page instead of dashboard
      setTimeout(() => {
        navigate('/verify-email');
      }, 100);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Registration failed';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.info('Logged out successfully');
    navigate('/login');
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
