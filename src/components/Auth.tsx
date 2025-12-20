import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const AuthPage: React.FC = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isLoginView) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        });
        if (data.user && data.user.identities && data.user.identities.length === 0) {
          setError('User already registered. Please sign in.');
          return;
        }
        if (error) throw error;
        setMessage('Check your email for the confirmation link!');
      }
    } catch (error: unknown) {
      if (error && typeof error === 'object' && ('message' in error)) {
        // The error object from Supabase might have error_description
        const description = 'error_description' in error ? String(error.error_description) : null;
        const message = String(error.message);
        setError(description || message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-zinc-950 p-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <img src="/logo.jpg" alt="InvoicyCRM Logo" className="w-24 h-24 rounded-3xl shadow-lg" />
          </div>
          <h1 className="text-3xl font-bold text-primary-600 dark:text-primary-400">InvoicyCRM</h1>
          <p className="text-slate-500 dark:text-zinc-400 mt-2">
            The complete CRM for freelance invoicing, client management, and scheduling.
          </p>
          <p className="text-slate-400 dark:text-zinc-500 text-sm mt-1 mb-4">
            {isLoginView ? 'Welcome back! Please sign in.' : 'Create your account to get started.'}
          </p>
        </div>

        {/* Google Login Section */}
        <div className="mb-6">
          <button
            onClick={async () => {
              setLoading(true);
              try {
                const { error } = await supabase.auth.signInWithOAuth({
                  provider: 'google',
                  options: {
                    redirectTo: window.location.origin,
                    // Note: No extra scopes needed for basic login (name/email)
                    queryParams: {
                      access_type: 'offline',
                      prompt: 'consent',
                    },
                  },
                });
                if (error) throw error;
              } catch (err: any) {
                setError(err.message);
                setLoading(false);
              }
            }}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 p-3 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-slate-700 dark:text-zinc-200 font-medium hover:bg-slate-50 dark:hover:bg-zinc-700 transition-all shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 4.69c1.61 0 3.09.56 4.23 1.64l3.18-3.18C16.98 1.16 14.6 0 12 0 7.7 0 3.99 2.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-zinc-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-zinc-900 text-slate-500 dark:text-zinc-500">Or continue with email</span>
          </div>
        </div>

        <div className="flex border border-slate-200 dark:border-zinc-700 rounded-lg p-1 mb-6">
          <button
            onClick={() => {
              setIsLoginView(true);
              setMessage(null);
              setError(null);
            }}
            className={`w-1/2 p-2 rounded-md font-semibold transition-colors ${isLoginView ? 'bg-primary-500 text-white shadow' : 'text-slate-500 dark:text-zinc-400'}`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setIsLoginView(false);
              setMessage(null);
              setError(null);
            }}
            className={`w-1/2 p-2 rounded-md font-semibold transition-colors ${!isLoginView ? 'bg-primary-500 text-white shadow' : 'text-slate-500 dark:text-zinc-400'}`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={async (e) => {
          e.preventDefault();
          // Reset Password Flow
          if (email && isLoginView && !password) {
            setLoading(true);
            setError(null);
            try {
              const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/#/update-password`,
              });
              if (error) throw error;
              setMessage('Password reset email sent! Check your inbox.');
            } catch (err: any) {
              setError(err.message);
            } finally {
              setLoading(false);
            }
            return;
          }
          handleAuthAction(e);
        }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-zinc-300 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 border rounded-lg bg-slate-50 dark:bg-zinc-800 border-slate-300 dark:border-zinc-700 focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-zinc-300 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={isLoginView && !message} // Not required if just sending reset email, but UI might be tricky.
              // Actually, let's keep it clean.
              className="w-full p-3 border rounded-lg bg-slate-50 dark:bg-zinc-800 border-slate-300 dark:border-zinc-700 focus:ring-2 focus:ring-primary-500"
            />
            {isLoginView && (
              <div className="text-right mt-1">
                <button
                  type="button"
                  onClick={async () => {
                    if (!email) {
                      setError("Please enter your email address first.");
                      return;
                    }
                    setLoading(true);
                    setError(null);
                    setMessage(null);
                    try {
                      const { error } = await supabase.auth.resetPasswordForEmail(email, {
                        redirectTo: `${window.location.origin}/#/settings`, // Direct them to settings to change it after login, or dedicated page
                      });
                      if (error) throw error;
                      setMessage('Password reset link sent! Check your email.');
                    } catch (err: any) {
                      setError(err.message);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                >
                  Forgot Password?
                </button>
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 bg-primary-600 text-white font-semibold rounded-lg shadow-md hover:bg-primary-700 transition-colors disabled:bg-primary-300"
          >
            {loading ? 'Processing...' : isLoginView ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        {error && <p className="mt-4 text-center text-sm text-red-500">{error}</p>}
        {message && <p className="mt-4 text-center text-sm text-green-500">{message}</p>}

        <div className="mt-8 text-center border-t border-slate-100 dark:border-zinc-800 pt-4 flex justify-center gap-4">
          <a href="/#/privacy" className="text-xs text-slate-400 hover:text-primary-500 transition-colors">Privacy Policy</a>
          <a href="/#/terms" className="text-xs text-slate-400 hover:text-primary-500 transition-colors">Terms of Service</a>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
