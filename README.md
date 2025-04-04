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
  - Dexie.js (IndexedDB wrapper)
  - Can be migrated to SQLite or other databases

## Getting Started

### Prerequisites

- Node.js (recommended v18+)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/tvet-src-app.git
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

## Project Structure

- `/src/components`: Reusable UI components
- `/src/pages`: Page components
- `/src/contexts`: React contexts
- `/src/hooks`: Custom React hooks
- `/src/lib`: Utility functions and services
- `/src/db`: Database configuration
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

- Data is stored securely
- Consent is required from all participants
- All actions are audited
- POPIA compliant data handling

## Development

This project was developed according to the Product Requirements Document (PRD) for TVET SRC Elections.

## License

This project is proprietary and confidential.
