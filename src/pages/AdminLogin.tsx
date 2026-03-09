import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { adminLogin, clearAdminError, resetAdminLoading } from '../store/adminAuthSlice';
import businessLogo from '../assets/New-log.png';
import { Shield, Lock } from 'lucide-react';
import { toast } from 'sonner';

const LOGIN_TIMEOUT_MS = 20000;

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state: any) => state.adminAuth);
  const loginTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/atg-admin');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    dispatch(resetAdminLoading());
    return () => {
      if (loginTimeoutRef.current) clearTimeout(loginTimeoutRef.current);
      dispatch(clearAdminError());
    };
  }, [dispatch]);

  useEffect(() => {
    if (!loading && loginTimeoutRef.current) {
      clearTimeout(loginTimeoutRef.current);
      loginTimeoutRef.current = null;
    }
  }, [loading]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) {
      dispatch(clearAdminError());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.username && formData.password) {
      if (loginTimeoutRef.current) clearTimeout(loginTimeoutRef.current);
      dispatch(adminLogin(formData) as any);
      loginTimeoutRef.current = setTimeout(() => {
        dispatch(resetAdminLoading());
        toast.warning(
          'This is taking longer than usual. Please check your connection and try again.',
          { duration: 6000 }
        );
        loginTimeoutRef.current = null;
      }, LOGIN_TIMEOUT_MS);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md shadow-xl border-2">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <img src={businessLogo} alt="Business Logo" className="h-16 w-auto" />
              <div className="absolute -top-2 -right-2 bg-blue-600 rounded-full p-1.5">
                <Shield className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-slate-900">Admin Portal</CardTitle>
          <CardDescription className="text-base">
            Sign in with your admin credentials to access the dashboard
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-semibold">
                Username
              </Label>
              <Input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your username"
                className="h-11"
                autoComplete="username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="h-11 pl-10"
                  autoComplete="current-password"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full h-11 text-base font-semibold bg-blue-600 hover:bg-blue-700" 
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In to Admin Portal'}
            </Button>
            <div className="text-center text-sm text-slate-500">
              <p>Restricted access - Admin only</p>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AdminLogin;

