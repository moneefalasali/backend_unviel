import { Logo } from '../components/Logo';
import { Button } from '../components/Button';
import { FileText, Image, Video, Music, Shield, Users, Zap } from 'lucide-react';

interface LandingProps {
  onNavigate: (page: string) => void;
}

export const Landing = ({ onNavigate }: LandingProps) => {
  return (
    <div className="min-h-screen bg-primary-bg">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <header className="flex items-center justify-between mb-20">
          <Logo size="medium" />
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => onNavigate('login')}>
              Log In
            </Button>
            <Button onClick={() => onNavigate('signup')}>
              Get Started
            </Button>
          </div>
        </header>

        <section className="grid lg:grid-cols-2 gap-12 items-center mb-32">
          <div>
            <h1 className="text-5xl lg:text-6xl font-bold text-neutral-white mb-6 leading-tight">
              AI Content Analyzer
            </h1>
            <p className="text-xl text-neutral-gray mb-8 leading-relaxed">
              Analyze digital content across text, images, audio, and video.
              Unveil uses advanced pattern analysis to confirm AI assistance with confidence,
              helping you understand the origins of content you encounter online.
            </p>
            <Button
              onClick={() => onNavigate('signup')}
              className="text-lg px-8 py-4"
            >
              Start Analyzing
            </Button>
          </div>

          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-primary-dark p-6 rounded-xl border-2 border-primary-purple/30 hover:border-accent-lavender transition-all">
                <FileText className="text-accent-gold mb-3" size={32} />
                <h3 className="text-neutral-white font-semibold mb-2">Text</h3>
                <p className="text-neutral-gray text-sm">Analyze writing patterns and linguistic markers</p>
              </div>
              <div className="bg-primary-dark p-6 rounded-xl border-2 border-primary-purple/30 hover:border-accent-lavender transition-all mt-8">
                <Image className="text-accent-gold mb-3" size={32} />
                <h3 className="text-neutral-white font-semibold mb-2">Image</h3>
                <p className="text-neutral-gray text-sm">Analyze visual patterns and metadata</p>
              </div>
              <div className="bg-primary-dark p-6 rounded-xl border-2 border-primary-purple/30 hover:border-accent-lavender transition-all">
                <Video className="text-accent-gold mb-3" size={32} />
                <h3 className="text-neutral-white font-semibold mb-2">Video</h3>
                <p className="text-neutral-gray text-sm">Analyze temporal patterns and artifacts</p>
              </div>
              <div className="bg-primary-dark p-6 rounded-xl border-2 border-primary-purple/30 hover:border-accent-lavender transition-all mt-8">
                <Music className="text-accent-gold mb-3" size={32} />
                <h3 className="text-neutral-white font-semibold mb-2">Audio</h3>
                <p className="text-neutral-gray text-sm">Analyze speech patterns and frequency markers</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-primary-dark rounded-3xl p-12 mb-32">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-neutral-white mb-4">
              Why Unveil?
            </h2>
            <p className="text-xl text-neutral-gray max-w-2xl mx-auto">
              In a world where AI-assisted content is increasingly prevalent,
              Unveil helps you analyze patterns and confirm AI involvement in digital media.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-bg w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="text-accent-gold" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-neutral-white mb-3">
                Trust & Safety
              </h3>
              <p className="text-neutral-gray">
                Protect yourself from misinformation and deceptive content.
                Build confidence in the digital media you consume and share.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-bg w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="text-accent-gold" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-neutral-white mb-3">
                Pattern Analysis
              </h3>
              <p className="text-neutral-gray">
                Our algorithms analyze subtle patterns and provide confirmed results
                with detailed explanations and confidence levels.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-bg w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-accent-gold" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-neutral-white mb-3">
                For Everyone
              </h3>
              <p className="text-neutral-gray">
                Whether you're a student, journalist, researcher, or concerned citizen,
                Unveil makes content analysis accessible to all.
              </p>
            </div>
          </div>
        </section>

        <section className="text-center py-16">
          <h2 className="text-4xl font-bold text-neutral-white mb-6">
            Ready to Analyze Content?
          </h2>
          <p className="text-xl text-neutral-gray mb-8 max-w-2xl mx-auto">
            Join thousands of users who trust Unveil to verify their digital content.
          </p>
          <Button
            onClick={() => onNavigate('signup')}
            className="text-lg px-8 py-4"
          >
            Get Started Free
          </Button>
        </section>

        <footer className="border-t border-primary-purple/30 mt-16 pt-8 text-center">
          <p className="text-neutral-gray text-sm">
            &copy; 2024 Unveil. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
};
