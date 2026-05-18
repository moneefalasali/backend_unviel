import { useState } from 'react';
import { Logo } from '../components/Logo';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Checkbox } from '../components/Checkbox';
import { Button } from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

interface SignUpProps {
  onNavigate: (page: string) => void;
}

export const SignUp = ({ onNavigate }: SignUpProps) => {
  const { signUp } = useAuth();
  const { t } = useLanguage();
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
            {t('createYourAccount')}
          </h2>
          <p className="text-neutral-gray text-center mb-8">
            {t('joinToStart')}
          </p>

          <form autoComplete="on" onSubmit={handleSubmit} className="space-y-5">
            <Input
              id="signup-full-name"
              name="fullName"
              label={t('fullName')}
              type="text"
              placeholder={t('fullName')}
              autoComplete="name"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />

            <Input
              id="signup-email"
              name="email"
              label={t('emailAddress')}
              type="email"
              placeholder={t('emailAddress')}
              autoComplete="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />

            <Input
              id="signup-password"
              name="password"
              label={t('password')}
              type="password"
              placeholder={t('password')}
              autoComplete="new-password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />

            <Select
              id="signup-gender"
              name="gender"
              label={t('gender')}
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
              id="signup-age"
              name="age"
              label={t('age')}
              type="number"
              placeholder={t('age')}
              required
              min="13"
              max="120"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            />

            <div className="space-y-3 pt-2">
              <Checkbox
                label={t('agreeTerms')}
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
              />
              <Checkbox
                label={t('agreePrivacy')}
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
              {loading ? `${t('createAccount')}...` : t('createAccount')}
            </Button>
          </form>

          <p className="text-neutral-gray text-center mt-6 text-sm">
            {t('alreadyHaveAccount')}{' '}
            <button
              onClick={() => onNavigate('login')}
              className="text-accent-gold hover:text-yellow-500 font-medium transition-colors"
            >
              {t('login')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
