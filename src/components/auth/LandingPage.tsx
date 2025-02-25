import React from 'react';
import { Theme } from '../../types/theme';
import { Shield, Database, Users, BarChart } from 'lucide-react';

interface LandingPageProps {
  currentTheme: Theme;
  onContinue: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ currentTheme, onContinue }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-theme">
      <div className="max-w-4xl w-full text-center">
        <h1 className="text-4xl font-bold mb-12 text-primary">
          PV-Corr Project Management
        </h1>
        
        <p className="text-xl mb-16 max-w-2xl mx-auto text-secondary">
          Comprehensive soil analysis and corrosion assessment platform for managing multiple project sites with advanced data collection and analysis capabilities.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="p-6 rounded-lg bg-surface">
            <div className="flex justify-center mb-4">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${currentTheme.colors.accent.primary}20` }}
              >
                <Shield className="text-accent-primary" size={24} />
              </div>
            </div>
            <h3 className="text-lg font-medium mb-2 text-primary">
              Secure Access
            </h3>
            <p className="text-secondary">
              Role-based access control and data encryption for project security
            </p>
          </div>

          <div className="p-6 rounded-lg bg-surface">
            <div className="flex justify-center mb-4">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${currentTheme.colors.accent.primary}20` }}
              >
                <Database className="text-accent-primary" size={24} />
              </div>
            </div>
            <h3 className="text-lg font-medium mb-2 text-primary">
              Data Management
            </h3>
            <p className="text-secondary">
              Centralized storage for all project data and measurements
            </p>
          </div>

          <div className="p-6 rounded-lg bg-surface">
            <div className="flex justify-center mb-4">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${currentTheme.colors.accent.primary}20` }}
              >
                <Users className="text-accent-primary" size={24} />
              </div>
            </div>
            <h3 className="text-lg font-medium mb-2 text-primary">
              Team Collaboration
            </h3>
            <p className="text-secondary">
              Multi-user access and real-time project updates
            </p>
          </div>

          <div className="p-6 rounded-lg bg-surface">
            <div className="flex justify-center mb-4">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${currentTheme.colors.accent.primary}20` }}
              >
                <BarChart className="text-accent-primary" size={24} />
              </div>
            </div>
            <h3 className="text-lg font-medium mb-2 text-primary">
              Analysis Tools
            </h3>
            <p className="text-secondary">
              Advanced soil analysis and corrosion assessment tools
            </p>
          </div>
        </div>

        <button
          onClick={onContinue}
          className="px-8 py-3 rounded-lg font-medium text-lg transition-all hover:translate-y-[-2px] text-white bg-accent-primary"          
        >
          Continue to Login
        </button>
      </div>
    </div>
  );
};

export default LandingPage;