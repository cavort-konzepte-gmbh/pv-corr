import DashboardLayout from './components/DashboardLayout'
import { AuthProvider } from './components/auth/AuthProvider'
import { Theme, THEMES } from './types/theme'
import { Language } from './types/language'

// Use ferra as default theme
const defaultTheme = THEMES.find((theme) => theme.id === 'ferra') || THEMES[0]

// Use English as default language
const currentLanguage: Language = 'en'

function App() {
  return (
    <AuthProvider currentTheme={defaultTheme} currentLanguage={currentLanguage}>
      <DashboardLayout />
    </AuthProvider>
  )
}

export default App
