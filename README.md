# PV-Corr Project

A modern web application for managing and analyzing soil data across multiple project sites.

## Features

- 🏢 **Project Management**

  - Create and manage multiple projects
  - Organize projects into fields and zones
  - Track project locations and gate access points
  - Associate projects with companies and managers

- 📊 **Data Collection**

  - Record and analyze soil parameters
  - Support for multiple measurement standards (e.g., DIN 50929-3)
  - Automatic rating calculations based on standards
  - Historical data tracking

- 👥 **Contact Management**

  - Store company information
  - Manage people and their roles
  - Track addresses and contact details
  - Associate contacts with projects

- 🌍 **Location Tracking**

  - GPS coordinates for projects, fields, and zones
  - Support for multiple address formats across different countries
  - Interactive map integration
  - Gate location management

- 🎨 **Customization**
  - Multiple theme options (Tokyo Night, Ferra, Monokai, Nord)
  - Multi-language support (EN, DE, ES, FR, AR)
  - Customizable decimal separators
  - Optional hidden ID display

## Technology Stack

- **Frontend:**

  - React 18
  - TypeScript
  - Tailwind CSS
  - Lucide Icons
  - Vite

- **Backend:**
  - Supabase
  - PostgreSQL
  - Row Level Security
  - Real-time subscriptions

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
src/
├── components/     # React components
├── lib/           # Library configurations
├── services/      # API and data services
├── types/         # TypeScript type definitions
└── utils/         # Utility functions
```

## Database Schema

- **Projects:** Main project information
- **Fields:** Sub-divisions of projects
- **Zones:** Specific areas within fields
- **Datapoints:** Measurement data
- **Companies:** Company information
- **People:** Contact information
- **Places:** Address and location data
- **Parameters:** Measurement parameters
- **Standards:** Measurement standards

## Security

- Row Level Security (RLS) enabled on all tables
- User-based access control
- Secure authentication via Supabase
- Protected API endpoints

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with [Vite](https://vitejs.dev/)
- Icons by [Lucide](https://lucide.dev/)
- UI styled with [Tailwind CSS](https://tailwindcss.com/)
- Backend powered by [Supabase](https://supabase.com/)
