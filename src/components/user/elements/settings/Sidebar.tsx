import React from 'react';
import { Theme } from '../../../../types/theme';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  currentTheme: Theme;
}

const menuItems = [
  { id: 'general', label: 'General' },
  { id: 'theme', label: 'Theme' },
  { id: 'places', label: 'Places' },
  { id: 'companies', label: 'Companies' },
  { id: 'people', label: 'People' },
  { id: 'projects', label: 'Projects' },
  { id: 'datapoints', label: 'Datapoints' }
];

const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  currentTheme
}) => {
  return (
    <div className="w-64 border-r h-screen overflow-auto border-theme bg-surface">
      <div>
        {menuItems.map(item => (
          <div
            key={item.id}
            className="flex items-center h-7 px-2 cursor-pointer hover:bg-opacity-10 group text-primary"
            style={{
              backgroundColor: currentView === item.id ? currentTheme.colors.background : 'transparent'
            }}
            onClick={() => onViewChange(item.id)}
          >
            <span className="ml-1 font-mono text-xs truncate">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;