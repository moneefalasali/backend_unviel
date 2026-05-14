import { useState } from 'react';
import { Logo } from '../components/Logo';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useAuth } from '../contexts/AuthContext';

interface LoginProps {
  onNavigate: (page: string) => void;
}

export const Login = ({ onNavigate }: LoginProps) => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: signInError } = await signIn(email, password);

    setLoading(false);

    if (signInError) {
      setError(signInError.message);
    } else {
      onNavigate('dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-primary-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo size="large" />
        </div>

        <div className="bg-primary-dark rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-neutral-white mb-2 text-center">
            Welcome Back
          </h2>
          <p className="text-neutral-gray text-center mb-8">
            Log in to continue detecting AI content
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              placeholder="Enter your email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-2 border-primary-purple bg-primary-bg text-accent-gold focus:ring-2 focus:ring-accent-lavender cursor-pointer"
                />
                <span className="text-neutral-gray text-sm">Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => setError('Password reset coming soon!')}
                className="text-accent-gold hover:text-yellow-500 text-sm font-medium transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Logging in...' : 'Log In'}
            </Button>
          </form>

          <p className="text-neutral-gray text-center mt-6 text-sm">
            Don't have an account?{' '}
            <button
              onClick={() => onNavigate('signup')}
              className="text-accent-gold hover:text-yellow-500 font-medium transition-colors"
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
