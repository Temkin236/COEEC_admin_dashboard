# COEEC Admin CMS Dashboard

Production-ready Admin Dashboard CMS for the College of Electrical Engineering and Computing (COEEC) at Adama Science and Technology University.

## Features

- ✅ Role-based access control (Admin, Editor, Coordinator)
- ✅ Content approval workflow (Draft → Pending → Approved/Rejected)
- ✅ Multilingual support (English, Afaan Oromo, Amharic)
- ✅ Complete CRUD operations for all modules
- ✅ Staff profile management with CV uploads
- ✅ Research and publications management
- ✅ Student and alumni tracking
- ✅ Download center for documents
- ✅ Contact form and feedback management
- ✅ Analytics dashboard with charts
- ✅ Activity logging and audit trails
- ✅ Responsive design with Ant Design
- ✅ JWT authentication with refresh tokens

## Tech Stack

- **Frontend**: React 18 + Vite
- **State Management**: Redux Toolkit
- **Routing**: React Router DOM v6
- **UI Library**: Ant Design 5.x (Primary)
- **Styling**: Tailwind CSS (utility classes only)
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Date Handling**: Day.js

## Getting Started

### Prerequisites

- Node.js >= 18.x
- npm or yarn

### Installation

\`\`\`bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Update .env with your API URL
\`\`\`

### Development

\`\`\`bash
# Start development server
npm run dev

# Server will run on http://localhost:3000
\`\`\`

### Build

\`\`\`bash
# Create production build
npm run build

# Preview production build
npm run preview
\`\`\`

### Testing

\`\`\`bash
# Run unit tests
npm test

# Run E2E tests
npm run test:e2e
\`\`\`

## Demo Credentials

### Admin User
- Email: admin@astu.edu.et
- Password: Admin@2025

### Editor User
- Email: editor@astu.edu.et
- Password: Editor@2025

### Coordinator User
- Email: coordinator@astu.edu.et
- Password: Coordinator@2025

## Project Structure

\`\`\`
src/
├── components/          # Reusable components
│   ├── common/         # Common UI components
│   └── forms/          # Form components
├── layouts/            # Layout components
├── pages/              # Page components
│   ├── auth/          # Authentication pages
│   ├── dashboard/     # Dashboard pages
│   ├── content/       # Content management
│   ├── staff/         # Staff management
│   ├── research/      # Research management
│   └── ...
├── store/              # Redux store
│   ├── slices/        # Redux slices
│   └── index.js       # Store configuration
├── services/           # API services
├── utils/              # Utility functions
├── App.jsx            # Root component
└── main.jsx           # Entry point
\`\`\`

## API Endpoints

See `API_CONTRACT.md` for complete API documentation.

## Database Schema

See `DATABASE_SCHEMA.md` for database structure and relationships.

## Deployment

### Vercel (Recommended)

\`\`\`bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
\`\`\`

### Docker

\`\`\`bash
# Build image
docker build -t coeec-admin .

# Run container
docker run -p 3000:3000 coeec-admin
\`\`\`

## License

© 2025 Adama Science and Technology University. All rights reserved.

## Theme and Responsiveness

- Theme tokens are set in `src/main.tsx` with Ant Design `ConfigProvider`. The palette matches the COEEC site:
	- `colorPrimary: #163b6b` (deep navy)
	- `colorInfo: #1a73e8`, `colorSuccess: #3fb477`, `colorWarning: #f7b500`, `colorError: #e53935`
	- `colorBgLayout: #f7f9fc`, `borderRadius: 8`
- Component overrides include `Layout` (white header/sider) and `Menu` selected background/color.
- Replace deprecated props:
	- `Statistic` uses `styles.content` instead of `valueStyle`.
	- For Cards, prefer `variant` over `bordered` when customizing appearance.
- Layout responsiveness:
	- `DashboardLayout.jsx` sets `Sider` `breakpoint="lg"` and `collapsedWidth={64}`; header/content paddings are responsive (`px-4 md:px-6`, `m-3 md:m-6`).
- Tailwind is used for spacing only; avoid global resets that conflict with AntD.
