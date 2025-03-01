import DashboardLayout from './components/DashboardLayout';
import { AuthProvider } from './components/auth/AuthProvider';
import { Theme } from './types/theme';
import { Language } from './types/language';

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

// Use English as default language
const currentLanguage: Language = 'en';

function App() {
  return (
    <AuthProvider currentTheme={currentTheme} currentLanguage={currentLanguage}>
      <DashboardLayout />
    </AuthProvider>
  );
}

export default App;
