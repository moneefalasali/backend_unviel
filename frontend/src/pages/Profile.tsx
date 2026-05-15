import { useState, useEffect } from 'react';
import { ArrowLeft, User, Mail, Calendar, Save } from 'lucide-react';
import { Logo } from '../components/Logo';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Button } from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { updateUserProfile } from '../lib/api';

interface ProfileProps {
  onNavigate: (page: string) => void;
}

export const Profile = ({ onNavigate }: ProfileProps) => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    gender: '',
    age: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.full_name,
        gender: profile.gender || '',
        age: profile.age !== null && profile.age !== undefined ? profile.age.toString() : '',
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await updateUserProfile({
        full_name: formData.fullName,
        gender: formData.gender,
        age: parseInt(formData.age),
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-bg">
      <nav className="bg-primary-dark border-b border-primary-purple/30">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => onNavigate('dashboard')}
                className="text-neutral-gray hover:text-neutral-white transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <Logo size="small" />
            </div>
            <div className="flex items-center gap-3 text-neutral-white">
              <User size={24} className="text-accent-gold" />
              <span className="font-semibold">Profile</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-neutral-white mb-3">
            Edit Profile
          </h1>
          <p className="text-xl text-neutral-gray">
            Update your personal information
          </p>
        </div>

        <Card className="p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-purple to-accent-lavender flex items-center justify-center">
              <User className="text-neutral-white" size={40} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-neutral-white">
                {profile?.full_name || 'User'}
              </h2>
              <p className="text-neutral-gray flex items-center gap-2">
                <Mail size={16} />
                {user?.email}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Full Name"
              type="text"
              placeholder="Enter your full name"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />

            <div className="grid md:grid-cols-2 gap-5">
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
            </div>

            <div className="bg-primary-bg rounded-lg p-4 flex items-center gap-3">
              <Calendar className="text-accent-gold" size={20} />
              <div>
                <p className="text-neutral-gray text-sm">
                  Member since
                </p>
                <p className="text-neutral-white font-medium">
                  {profile ? new Date(profile.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }) : 'N/A'}
                </p>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-500/10 border border-green-500 text-green-400 px-4 py-3 rounded-lg text-sm">
                Profile updated successfully!
              </div>
            )}

            <Button type="submit" fullWidth disabled={loading}>
              <Save className="mr-2" size={18} />
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};
