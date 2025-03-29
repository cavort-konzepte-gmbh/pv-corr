import React from 'react';
import { Theme } from '../../types/theme';
import { Zap, BaselineIcon as PipelineIcon, Train, Cylinder, Radio, ShieldAlert } from 'lucide-react';
import { Button } from '../ui/button';

interface LandingPageProps {
  currentTheme: Theme;
  onContinue: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ currentTheme, onContinue }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 landing-page">
      <div className="w-[80vw] text-center">
        <h1 className="text-4xl font-bold mb-12 text-primary">PV-Corr Project Management</h1>

        <p className="text-xl mb-16 max-w-2xl mx-auto ">
          Comprehensive soil analysis and corrosion assessment platform for managing multiple project sites with advanced data collection
          and analysis capabilities.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-16">
          <div className="p-6 rounded-lg  bg-opacity-90 border-theme">
            <div className="flex justify-center mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                <Zap size={24} />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-primary">Transformer Station</h3>
            <p>High-voltage power distribution and transformation facilities</p>
          </div>

          <div className="p-6 rounded-lg  bg-opacity-90 border-theme">
            <div className="flex justify-center mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                <PipelineIcon size={24} />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-primary">Pipelines</h3>
            <p>Underground and surface pipeline infrastructure networks</p>
          </div>

          <div className="p-6 rounded-lg  bg-opacity-90 border-theme">
            <div className="flex justify-center mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                <Train size={24} />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-primary">Railroad Tracks</h3>
            <p>Rail infrastructure and track maintenance systems</p>
          </div>

          <div className="p-6 rounded-lg  bg-opacity-90 border-theme">
            <div className="flex justify-center mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                <Cylinder size={24} />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-primary">Tank or Pumping Stations</h3>
            <p>Storage and distribution facilities for liquids and gases</p>
          </div>

          <div className="p-6 rounded-lg  bg-opacity-90 border-theme">
            <div className="flex justify-center mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                <Radio size={24} />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-primary">High-voltage Power Lines</h3>
            <p>Electrical transmission and distribution networks</p>
          </div>

          <div className="p-6 rounded-lg  bg-opacity-90 border-theme">
            <div className="flex justify-center mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                <ShieldAlert size={24} />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-primary">Protected Areas</h3>
            <p>Environmentally sensitive and restricted access zones</p>
          </div>
        </div>

        <Button onClick={onContinue} className="px-8 py-3 rounded-lg font-medium text-lg transition-all hover:translate-y-[-2px] ">
          Continue to Login
        </Button>
      </div>
    </div>
  );
};

export default LandingPage;
