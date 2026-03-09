import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { signupUser, clearError } from '../store/authSlice';
import businessLogo from '../assets/New-log.png';
import { CheckCircleIcon } from 'lucide-react';

const Signup = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password_confirm: '',
  });

  const [passwordError, setPasswordError] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state: any) => state.auth);

  // Redirect after login
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Clear errors on unmount
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const COMMON_PASSWORDS = ["password", "12345678", "qwerty", "admin", "welcome"];

  const validatePassword = (password) => {
    const errors = [];

    if (password.length < 8) {
      errors.push("This password is too short. It must contain at least 8 characters.");
    }

    if (/^\d+$/.test(password)) {
      errors.push("This password is entirely numeric.");
    }

    if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
      errors.push("This password is too common.");
    }

    return errors;
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    // Clear errors on input change
    if (["password", "password_confirm", "email", "first_name", "last_name"].includes(e.target.name)) {
      setPasswordError("");
    }
    // Clear Redux error when user starts typing
    if (error) {
      dispatch(clearError());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");
    dispatch(clearError());

    // Email validation
    if (!validateEmail(formData.email)) {
      setPasswordError("Please enter a valid email address.");
      return;
    }

    // Password confirm check
    if (formData.password !== formData.password_confirm) {
      setPasswordError("Passwords do not match.");
      return;
    }

    // Password rules validation
    const passwordValidationErrors = validatePassword(formData.password);

    if (passwordValidationErrors.length > 0) {
      setPasswordError(passwordValidationErrors.join(" "));
      return;
    }

    // Submit to backend
    if (formData.first_name && formData.last_name && formData.email && formData.password) {
      dispatch(signupUser(formData) as any);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-4">
        {/* Benefits Info Card */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-green-900 mb-3">Get Started in 3 Steps:</h3>
            <ul className="space-y-2 text-sm text-green-800">
              <li className="flex items-start gap-2">
                <CheckCircleIcon className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>Create Account:</strong> Enter your details below</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircleIcon className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>Sign In:</strong> Use your credentials on the login page</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircleIcon className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>Access Toolbox:</strong> Start your tax preparation</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Main Signup Card */}
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <img src={businessLogo} alt="Business Logo" className="h-16 w-auto" />
            </div>
            <CardTitle className="text-2xl font-bold">Create Your Account</CardTitle>
            <CardDescription>Get started with your tax organizer in just a few minutes</CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {passwordError && (
                <Alert variant="destructive">
                  <AlertDescription>{passwordError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  name="first_name"
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="Enter your first name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  name="last_name"
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Enter your last name"
                />
              </div>

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
                  placeholder="Create a password (min 8 characters)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password_confirm">Confirm Password</Label>
                <Input
                  id="password_confirm"
                  name="password_confirm"
                  type="password"
                  required
                  value={formData.password_confirm}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-xs text-blue-900">
                  <strong>Password Requirements:</strong> At least 8 characters, not entirely numeric, and not a common password.
                </p>
              </div>

            </CardContent>

            <CardFooter className="flex flex-col space-y-3">
              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700" 
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Sign in here
                </Link>
              </p>
            </CardFooter>
          </form>

        </Card>
      </div>
    </div>
  );
};

export default Signup;
