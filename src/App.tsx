import React from 'react';
import ProjectExplorer from './components/ProjectExplorer';
import { AuthProvider } from './components/auth/AuthProvider';
import { Theme } from './types/theme';

// Use the default theme for now
const currentTheme: Theme = {
  id: 'tokyo-night',
  name: 'Tokyo Night',
  colors: {
    background: '#1a1b26',
    surface: '#24283b',
    border: '#2f354a',
    text: {
      primary: '#c0caf5',
      secondary: '#7982a9',
      accent: '#c0caf5'
    },
    accent: {
      primary: '#7aa2f7',
      hover: '#5d87e5'
    }
  }
};

function App() {
  return (
    <AuthProvider currentTheme={currentTheme}>
      <ProjectExplorer />
    </AuthProvider>
  );
}

export default App;
