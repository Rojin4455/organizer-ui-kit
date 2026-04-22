import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { loginUser, logout, clearError, resetLoading } from '../store/authSlice';
import { CROSS_APP_LOGOUT_PARAM } from '../constants/crossAppAuth';
import { getPendingSsoRedirectUri } from '../constants/ssoRedirect';
import businessLogo from '../assets/New-log.png';
import { Checkbox } from '@/components/ui/checkbox';
import { InfoIcon, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const LOGIN_TIMEOUT_MS = 20000; // 20 seconds — then reset and show message

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUri = getPendingSsoRedirectUri(searchParams);
  const queryRedirectUri = searchParams.get('redirect_uri');
  const { loading, error, isAuthenticated, user, tokens } = useSelector((state: any) => state.auth);
  const loginTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const normalizeBaseUrl = (url?: string | null) => (url || '').trim().replace(/\/+$/, '');
  const app2Base = normalizeBaseUrl(import.meta.env.VITE_APP2_URL);
  // UI copy should reflect only the current URL param, not previously persisted SSO state.
  const isEstatePlannerFlow = !!queryRedirectUri && !!app2Base && queryRedirectUri.startsWith(app2Base);
 console.log(queryRedirectUri, redirectUri, app2Base, isEstatePlannerFlow);


  const authSearchQuery = searchParams.toString();

  useEffect(() => {
    if (searchParams.has(CROSS_APP_LOGOUT_PARAM)) {
      dispatch(logout());
      return;
    }

    if (!isAuthenticated) return;

    // PostAuthSsoRedirect (global) sends redirect_uri flows to /sso
    if (redirectUri && tokens?.access && tokens?.refresh) return;

    if (user?.onboard_required) {
      navigate('/onboard');
    } else {
      navigate('/');
    }
  }, [isAuthenticated, user, tokens, redirectUri, navigate, searchParams]);

  // Reset any stuck loading state from previous session (e.g. persisted before we fixed persist)
  useEffect(() => {
    dispatch(resetLoading());
    return () => {
      if (loginTimeoutRef.current) clearTimeout(loginTimeoutRef.current);
      dispatch(clearError());
    };
  }, [dispatch]);

  // Clear timeout when login finishes (success or error)
  useEffect(() => {
    if (!loading && loginTimeoutRef.current) {
      clearTimeout(loginTimeoutRef.current);
      loginTimeoutRef.current = null;
    }
  }, [loading]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (error) {
      dispatch(clearError());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.email && formData.password) {
      if (loginTimeoutRef.current) clearTimeout(loginTimeoutRef.current);
      dispatch(loginUser(formData) as any);
      loginTimeoutRef.current = setTimeout(() => {
        dispatch(resetLoading());
        toast.warning(
          'This is taking longer than usual. Please check your connection and try again.',
          { duration: 6000 }
        );
        loginTimeoutRef.current = null;
      }, LOGIN_TIMEOUT_MS);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-4">
        {/* Info Banner for New Users */}
        <Alert className="border-blue-200 bg-blue-50 text-blue-900">
          <InfoIcon className="h-4 w-4 text-blue-600" />
          <AlertDescription className="ml-2 text-blue-900">
            <span className="font-semibold">
              {isEstatePlannerFlow ? 'New to the Estate Planner?' : 'New to the Tax Toolbox?'}
            </span>{' '}
            You'll need to create an account first. No existing account?{' '}
            <Link
              to={authSearchQuery ? `/signup?${authSearchQuery}` : '/signup'}
              className="font-semibold underline hover:text-blue-700"
            >
              Sign up here →
            </Link>
          </AlertDescription>
        </Alert>

        {/* Main Login Card */}
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <img src={businessLogo} alt="Business Logo" className="h-16 w-auto" />
            </div>
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription>Sign in to your existing account</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rememberMe"
                    name="rememberMe"
                    // checked={formData.rememberMe}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, rememberMe: checked }))
                    }
                  />
                  <Label htmlFor="rememberMe" className="text-sm font-normal">
                    Remember me
                  </Label>
                </div>
                <Link
                  to={authSearchQuery ? `/forgot-password?${authSearchQuery}` : '/forgot-password'}
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-3">
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Don't have an account?{' '}
                <Link
                  to={authSearchQuery ? `/signup?${authSearchQuery}` : '/signup'}
                  className="text-primary hover:underline font-medium"
                >
                  Create one here
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>

        {/* Call-to-Action Card for New Users */}
        <Card className="border-2 border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <h3 className="font-semibold text-green-900">Ready to get started?</h3>
              <p className="text-sm text-green-800">
                Create your account in minutes to access your{' '}
                {isEstatePlannerFlow ? 'estate plan' : 'tax organizer'} and get started with your{' '}
                {isEstatePlannerFlow ? 'Estate Planning Questionnaire' : 'tax preparation'}.
              </p>
              <Link to={authSearchQuery ? `/signup?${authSearchQuery}` : '/signup'}>
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                  Create Account Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;