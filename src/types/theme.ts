export interface ThemeColors {
  background: string;
  surface: string;
  border: string;
  text: {
    primary: string;
    secondary: string;
    accent: string;
  };
  accent: {
    primary: string;
    hover: string;
  };
}

export interface Theme {
  id: string;
  name: string;
  colors: ThemeColors;
}

export type ThemeId = 'tokyo-night' | 'ferra' | 'monokai' | 'nord' | 'dracula';

export const THEMES: Theme[] = [
  {
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
  },
  {
    id: 'ferra',
    name: 'Ferra',
    colors: {
      background: '#1f1d20',
      surface: '#2b292d',
      border: '#3d363b',
      text: {
        primary: '#e6e6f0',
        secondary: '#9c8a90',
        accent: '#ffa07a'
      },
      accent: {
        primary: '#e06b75',
        hover: '#f5d76e'
      }
    }
  },
  {
    id: 'monokai',
    name: 'Monokai',
    colors: {
      background: '#1e1f1c',
      surface: '#272822',
      border: '#3e3f3a',
      text: {
        primary: '#f8f8f2',
        secondary: '#c2bfa3',
        accent: '#e6db74'
      },
      accent: {
        primary: '#a6e22e',
        hover: '#8fbb2c'
      }
    }
  },
  {
    id: 'nord',
    name: 'Nord',
    colors: {
      background: '#242933',
      surface: '#2e3440',
      border: '#3b4252',
      text: {
        primary: '#eceff4',
        secondary: '#9db4d0',
        accent: '#88c0d0'
      },
      accent: {
        primary: '#5e81ac',
        hover: '#4c6a92'
      }
    }
  },
  {
    id: 'dracula',
    name: 'Dracula',
    colors: {
      background: '#282A36',
      surface: '#44475A',
      border: '#6272A4',
      text: {
        primary: '#F8F8F2',
        secondary: '#6272A4',
        accent: '#8BE9FD'
      },
      accent: {
        primary: '#BD93F9',
        hover: '#FF79C6'
      }
    }
  }
]
