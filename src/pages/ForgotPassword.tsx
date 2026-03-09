import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiService } from '../services/api';
import businessLogo from '../assets/New-log.png';

const ForgotPassword = () => {
  const [step, setStep] = useState<'request' | 'submit'>('request');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [formData, setFormData] = useState({
    otp: '',
    new_password: '',
    confirm_password: '',
  });

  const navigate = useNavigate();

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await apiService.requestOTP(email);
      setSuccess('OTP has been sent to your email address.');
      setStep('submit');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (formData.new_password !== formData.confirm_password) {
      setError("Passwords don't match.");
      return;
    }

    if (formData.new_password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    try {
      await apiService.submitOTP(
        email,
        formData.otp,
        formData.new_password,
        formData.confirm_password
      );
      setSuccess('Password has been reset successfully. Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please check your OTP and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src={businessLogo} alt="Business Logo" className="h-16 w-auto" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {step === 'request' ? 'Forgot Password' : 'Reset Password'}
          </CardTitle>
          <CardDescription>
            {step === 'request'
              ? 'Enter your email address and we\'ll send you an OTP to reset your password.'
              : 'Enter the OTP sent to your email and your new password.'}
          </CardDescription>
        </CardHeader>

        {step === 'request' ? (
          <form onSubmit={handleRequestOTP}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert className="bg-green-50 border-green-200">
                  <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Remember your password?{' '}
                <Link to="/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        ) : (
          <form onSubmit={handleSubmitOTP}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert className="bg-green-50 border-green-200">
                  <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="email-display">Email</Label>
                <Input
                  id="email-display"
                  type="email"
                  value={email}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="otp">OTP</Label>
                <Input
                  id="otp"
                  name="otp"
                  type="text"
                  required
                  maxLength={6}
                  value={formData.otp}
                  onChange={(e) => {
                    // Only allow numbers
                    const value = e.target.value.replace(/\D/g, '');
                    setFormData({ ...formData, otp: value });
                  }}
                  placeholder="Enter 6-digit OTP"
                  className="text-center text-2xl tracking-widest"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new_password">New Password</Label>
                <Input
                  id="new_password"
                  name="new_password"
                  type="password"
                  required
                  value={formData.new_password}
                  onChange={handleChange}
                  placeholder="Enter your new password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirm Password</Label>
                <Input
                  id="confirm_password"
                  name="confirm_password"
                  type="password"
                  required
                  value={formData.confirm_password}
                  onChange={handleChange}
                  placeholder="Confirm your new password"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </Button>
              <div className="flex flex-col items-center space-y-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setStep('request');
                    setError(null);
                    setSuccess(null);
                    setFormData({ otp: '', new_password: '', confirm_password: '' });
                  }}
                  disabled={loading}
                >
                  Back to Request OTP
                </Button>
                <p className="text-sm text-muted-foreground text-center">
                  Remember your password?{' '}
                  <Link to="/login" className="text-primary hover:underline">
                    Sign in
                  </Link>
                </p>
              </div>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
};

export default ForgotPassword;

