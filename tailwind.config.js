/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ['class'],
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
  	extend: {
  		colors: {
  			surface: 'var(--surface)',
  			primary: {
				// --primary variable used by shadcn
  				DEFAULT: 'var(--text-primary)',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
				// --secondary variable used by shadcn
  				DEFAULT: 'var(--text-secondary)',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			accent: {
  				DEFAULT: 'var(--text-accent)',
  				primary: 'var(--accent-primary)',
  				hover: 'var(--accent-hover)',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
			// --background variable used by shadcn
  			background: 'var(--background)',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			destructive: {
				// --destructive variable used by shadcn
  				DEFAULT: 'var(--accent-primary)',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'var(--border)',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderWidth: {
  			theme: '1px'
  		},
  		borderColor: {
  			theme: 'var(--border)'
  		},
  		backgroundColor: {
  			theme: 'var(--background)',
  			border: 'var(--border)'
  		},
  		boxShadow: {
  			theme: '0 2px 4px var(--border)'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
