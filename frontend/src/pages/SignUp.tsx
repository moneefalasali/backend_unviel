import { useState } from 'react';
import { Logo } from '../components/Logo';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Checkbox } from '../components/Checkbox';
import { Button } from '../components/Button';
import { useAuth } from '../contexts/AuthContext';

interface SignUpProps {
  onNavigate: (page: string) => void;
}

export const SignUp = ({ onNavigate }: SignUpProps) => {
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    gender: '',
    age: '',
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!termsAccepted || !privacyAccepted) {
      setError('Please accept the Terms of Service and Privacy Policy');
      return;
    }

    setLoading(true);

    const { error: signUpError } = await signUp(
      formData.email,
      formData.password,
      formData.fullName,
      formData.gender,
      parseInt(formData.age)
    );

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
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
            Create Your Account
          </h2>
          <p className="text-neutral-gray text-center mb-8">
            Join Unveil to start detecting AI-generated content
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Full Name"
              type="text"
              placeholder="Enter your full name"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="Enter your email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />

            <Input
              label="Password"
              type="password"
              placeholder="Create a strong password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />

            <Select
              label="Gender"
              required
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              options={[
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
                { value: 'non-binary', label: 'Non-binary' },
                { value: 'prefer-not-to-say', label: 'Prefer not to say' },
              ]}
            />

            <Input
              label="Age"
              type="number"
              placeholder="Enter your age"
              required
              min="13"
              max="120"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            />

            <div className="space-y-3 pt-2">
              <Checkbox
                label="I agree to the Terms of Service"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
              />
              <Checkbox
                label="I agree to the Privacy Policy"
                checked={privacyAccepted}
                onChange={(e) => setPrivacyAccepted(e.target.checked)}
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <p className="text-neutral-gray text-center mt-6 text-sm">
            Already have an account?{' '}
            <button
              onClick={() => onNavigate('login')}
              className="text-accent-gold hover:text-yellow-500 font-medium transition-colors"
            >
              Log In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
