# TVET SRC Nomination App

A secure, mobile-first digital platform designed to streamline the nomination process for TVET Student Representative Council (SRC) elections.

## Features

- **Digital Nomination Forms**: Submit nomination forms digitally
- **Identity Verification**: Secure authentication via Student Number + OTP
- **Supporter Invitation**: Invite supporters via QR code or direct link
- **Admin Dashboard**: Review and export nomination records securely
- **Mobile Responsive**: Works on all devices
- **POPIA Compliant**: Ensures secure data handling

## Technical Stack

- **Frontend**:
  - Vite + React + TypeScript
  - TailwindCSS 3.4.3
  - shadcn UI components
  - React Router DOM
  - React Hook Form with Zod validation

- **Database**:
  - Dexie.js (IndexedDB wrapper for client-side storage)

## Getting Started

### Prerequisites

- Node.js (recommended v18+)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/TirlaP/tvet-src-app.git
cd tvet-src-app
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Build for production
```bash
npm run build
```

## Deployment

This application is configured for deployment on Netlify. The deployment is handled via the following files:

- `netlify.toml`: Configuration file for Netlify deployment
- `build.sh`: Build script that can be used locally (Netlify uses `npm run build` directly)

### Deploying to Netlify

1. Push the code to your GitHub repository
2. Connect your repository to Netlify
3. Configure the build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Deploy!

Netlify will automatically handle routing for the SPA with the redirects configured in the `netlify.toml` file.

## Project Structure

- `/src/components`: Reusable UI components
- `/src/pages`: Page components
- `/src/contexts`: React contexts
- `/src/hooks`: Custom React hooks
- `/src/lib`: Utility functions and services
- `/src/db`: Database configuration (Dexie.js)
- `/src/types`: TypeScript type definitions

## User Flows

### Nominee Flow
1. Login with student credentials
2. Complete the multi-step nomination form
3. Submit documents (student card, selfie)
4. Generate QR code/link for supporters
5. Share with supporters

### Supporter Flow
1. Access via QR code or link
2. Login with student credentials
3. Submit supporting information
4. Verify identity

### Admin Flow
1. Login to admin dashboard
2. Review nominations
3. Approve or reject nominations
4. Export data as needed

## Security & Compliance

- Data is stored securely using client-side IndexedDB
- Consent is required from all participants
- All actions are audited
- POPIA compliant data handling

## Development

This project was developed according to the Product Requirements Document (PRD) for TVET SRC Elections.

## License

This project is proprietary and confidential.
