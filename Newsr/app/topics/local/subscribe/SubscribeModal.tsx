'use client';

import { useState, useEffect } from 'react';
import { X, Check, User, Mail, Lock, ArrowLeft, Loader } from 'lucide-react';

// Mock auth implementation
const mockAuth = {
  user: null as { id: string; email: string } | null,
  isAuthenticated: false,
  login: async (email: string, password: string) => {
    // In a real implementation, this would call an API
    console.log('Mock login with:', email, password);
    return Promise.resolve();
  },
  register: async (userData: { email: string, password: string, name: string }) => {
    // In a real implementation, this would call an API
    console.log('Mock register with:', userData);
    return Promise.resolve();
  }
};

interface SubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  cityName: string;
  stateName: string;
  cityCode: string;
}

type ModalStep = 'subscribe' | 'signin' | 'signup' | 'success';

export default function SubscribeModal({ 
  isOpen, 
  onClose, 
  cityName, 
  stateName,
  cityCode 
}: SubscribeModalProps) {
  const [step, setStep] = useState<ModalStep>('subscribe');
  const [frequencies, setFrequencies] = useState<string[]>(['daily']);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isCurrentlySubscribed, setIsCurrentlySubscribed] = useState(false);
  const [checkingSubscription, setCheckingSubscription] = useState(false);
  
  // Use the mock auth implementation
  const { user, isAuthenticated, login, register } = mockAuth;
  
  // Check if user is already subscribed
  useEffect(() => {
    if (!isOpen || !isAuthenticated || !cityCode) return;
    
    async function checkSubscriptionStatus() {
      setCheckingSubscription(true);
      try {
        const response = await fetch(`/api/subscription-status?cityCode=${cityCode}`);
        if (response.ok) {
          const data = await response.json();
          if (data.isSubscribed) {
            setIsCurrentlySubscribed(true);
            setFrequencies(data.frequencies || ['daily']);
          } else {
            setIsCurrentlySubscribed(false);
          }
        }
      } catch (err) {
        console.error('Error checking subscription status:', err);
      } finally {
        setCheckingSubscription(false);
      }
    }
    
    checkSubscriptionStatus();
  }, [isOpen, isAuthenticated, cityCode]);
  
  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (isAuthenticated) {
        setStep('subscribe');
      }
    }
  }, [isOpen, isAuthenticated]);
  
  if (!isOpen) return null;
  
  const handleFrequencyToggle = (frequency: string) => {
    if (frequencies.includes(frequency)) {
      setFrequencies(frequencies.filter(f => f !== frequency));
    } else {
      setFrequencies([...frequencies, frequency]);
    }
  };
  
  // Direct subscription for authenticated users
  const handleDirectSubscribe = async () => {
    if (frequencies.length === 0) {
      setError('Please select at least one delivery frequency');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);

    try {
      // Get session from auth context
      let authData = {};
      
      if (user?.email) {
        authData = {
          userId: user.id,
          email: user.email
        };
      }
      
      // Log the data being sent to verify cityCode is included
      console.log('Sending subscription data:', {
        frequency: frequencies[0],
        cityCode, // Make sure this has a value
        auth: authData
      });
      
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', 
        body: JSON.stringify({
          frequency: frequencies[0],
          cityCode: cityCode, // Explicitly use the prop
          delivery_email: true,
          delivery_push: false,
          auth: authData
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Subscription failed');
      }

      setStep('success');
      
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to subscribe. Please try again later.');
      console.error('Subscription error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle authentication and subscription
  const handleAuthAndSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (frequencies.length === 0) {
      setError('Please select at least one delivery frequency');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);

    try {
      // Use auth context for authentication
      if (step === 'signin') {
        await login(email, password);
      } else if (step === 'signup') {
        await register({ email, password, name });
      }

      // Then subscribe
      const subscribeResponse = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          frequencies,
          cityCode,
        }),
      });

      if (!subscribeResponse.ok) {
        const data = await subscribeResponse.json();
        throw new Error(data.message || 'Subscription failed');
      }

      setStep('success');
      
      // After 3 seconds of showing success, close the modal
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to process your request. Please try again later.');
      console.error('Auth and subscription error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render subscription options screen
  const renderSubscriptionOptions = () => (
    <>
      <h2 className="text-2xl font-bold mb-4">Subscribe to {cityName} Updates</h2>
      <p className="text-gray-600 mb-6">
        Get the latest news and updates for {cityName}, {stateName} delivered to your inbox.
      </p>
      
      {checkingSubscription ? (
        <div className="flex items-center justify-center py-4">
          <Loader className="w-6 h-6 text-blue-600 animate-spin" />
          <span className="ml-2">Checking subscription status...</span>
        </div>
      ) : (
        <>
          {isCurrentlySubscribed && (
            <div className="p-3 bg-green-50 border-l-4 border-green-500 text-green-700 mb-6">
              <div className="flex">
                <Check className="w-5 h-5 mr-2" />
                <span>You're already subscribed to {cityName} updates.</span>
              </div>
            </div>
          )}
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">How often would you like updates?</label>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="daily"
                  checked={frequencies.includes('daily')}
                  onChange={() => handleFrequencyToggle('daily')}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="daily" className="ml-2 block text-sm">
                  Daily Digest
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="weekly"
                  checked={frequencies.includes('weekly')}
                  onChange={() => handleFrequencyToggle('weekly')}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="weekly" className="ml-2 block text-sm">
                  Weekly Roundup (Fridays)
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="breaking"
                  checked={frequencies.includes('breaking')}
                  onChange={() => handleFrequencyToggle('breaking')}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="breaking" className="ml-2 block text-sm">
                  Breaking News Alerts
                </label>
              </div>
            </div>
          </div>
          
          {error && (
            <div className="mb-4 p-3 border-l-4 border-red-500 bg-red-50 text-red-700">
              {error}
            </div>
          )}
          
          {isAuthenticated ? (
            <button
              onClick={handleDirectSubscribe}
              disabled={isSubmitting}
              className="w-full px-4 py-2 border-2 border-black bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              {isSubmitting ? 'Subscribing...' : isCurrentlySubscribed ? 'Update Subscription' : 'Subscribe Now'}
            </button>
          ) : (
            <div className="space-y-4">
              <button
                onClick={() => setStep('signin')}
                className="w-full px-4 py-2 border-2 border-black bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Sign In to Subscribe
              </button>
              <button
                onClick={() => setStep('signup')}
                className="w-full px-4 py-2 border-2 border-black bg-black text-white hover:bg-gray-800 transition-colors"
              >
                Create Account & Subscribe
              </button>
            </div>
          )}
        </>
      )}
    </>
  );

  // Render sign in form
  const renderSignInForm = () => (
    <>
      <div className="mb-4">
        <button
          onClick={() => setStep('subscribe')}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back
        </button>
      </div>
      
      <h2 className="text-2xl font-bold mb-4">Sign In</h2>
      <p className="text-gray-600 mb-6">
        Sign in to subscribe to {cityName}, {stateName} updates.
      </p>
      
      <form onSubmit={handleAuthAndSubscribe} className="space-y-4">
        <div className="mb-6">
          <label htmlFor="signin-email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail size={18} className="text-gray-500" />
            </div>
            <input
              type="email"
              id="signin-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 p-2 border-2 border-black"
              placeholder="your.email@example.com"
              required
            />
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="signin-password" className="block text-sm font-medium mb-1">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock size={18} className="text-gray-500" />
            </div>
            <input
              type="password"
              id="signin-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 p-2 border-2 border-black"
              placeholder="Enter your password"
              required
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 border-l-4 border-red-500 bg-red-50 text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-4 py-2 border-2 border-black bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:bg-gray-400"
        >
          {isSubmitting ? 'Signing In...' : 'Sign In & Subscribe'}
        </button>
      </form>
    </>
  );

  // Render sign up form
  const renderSignUpForm = () => (
    <>
      <div className="mb-4">
        <button
          onClick={() => setStep('subscribe')}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back
        </button>
      </div>
      
      <h2 className="text-2xl font-bold mb-4">Create Account</h2>
      <p className="text-gray-600 mb-6">
        Create an account to subscribe to {cityName}, {stateName} updates.
      </p>
      
      <form onSubmit={handleAuthAndSubscribe} className="space-y-4">
        <div className="mb-6">
          <label htmlFor="signup-name" className="block text-sm font-medium mb-1">
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User size={18} className="text-gray-500" />
            </div>
            <input
              type="text"
              id="signup-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-10 p-2 border-2 border-black"
              placeholder="Your full name"
              required
            />
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="signup-email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail size={18} className="text-gray-500" />
            </div>
            <input
              type="email"
              id="signup-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 p-2 border-2 border-black"
              placeholder="your.email@example.com"
              required
            />
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="signup-password" className="block text-sm font-medium mb-1">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock size={18} className="text-gray-500" />
            </div>
            <input
              type="password"
              id="signup-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 p-2 border-2 border-black"
              placeholder="Create a password"
              required
              minLength={8}
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 border-l-4 border-red-500 bg-red-50 text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-4 py-2 border-2 border-black bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:bg-gray-400"
        >
          {isSubmitting ? 'Creating Account...' : 'Create Account & Subscribe'}
        </button>
      </form>
    </>
  );

  // Render success message
  const renderSuccess = () => (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
        <Check className="h-8 w-8" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
      <p className="text-gray-700">
        You've successfully subscribed to {cityName}, {stateName} updates.
      </p>
    </div>
  );

  // Render the content based on the step
  const renderContent = () => {
    switch (step) {
      case 'subscribe':
        return renderSubscriptionOptions();
      case 'signin':
        return renderSignInForm();
      case 'signup':
        return renderSignUpForm();
      case 'success':
        return renderSuccess();
      default:
        return renderSubscriptionOptions();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>
        
        {renderContent()}
      </div>
    </div>
  );
}