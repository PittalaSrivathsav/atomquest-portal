# ATOMQUEST — Goal Tracking Portal

ATOMQUEST is a premium full-stack goal tracking and productivity management platform inspired by modern SaaS products like Vercel, Linear, and Stripe.

The platform allows users to:
- Create and manage goals
- Track progress visually
- Submit quarterly check-ins
- View analytics dashboards
- Monitor audit logs and notifications
- Navigate quickly using a global command palette

---

## Live Demo

https://atomquest-portal-omega.vercel.app

---

## Features

### Dashboard System
- Goal management
- Progress tracking
- Quarterly check-ins
- Admin reports
- Audit logs
- Notifications system

### UI & Experience
- Premium SaaS-style interface
- Responsive layouts
- Animated charts and dashboards
- Smooth hover interactions
- Command Palette (`Ctrl/Cmd + K`)
- Dark mode support

### Analytics
- Interactive Recharts dashboards
- Donut and bar charts
- Gradient chart styling
- Premium tooltip system

### Backend & Authentication
- Firebase integration
- MongoDB Atlas database
- Secure environment configuration

---

## Tech Stack

### Frontend
- Next.js 15
- React
- TypeScript
- Tailwind CSS
- Framer Motion
- Recharts
- Shadcn UI

### Backend & Services
- MongoDB Atlas
- Firebase
- Firebase Admin SDK

### Deployment
- Vercel
- GitHub

---

## Installation

```bash
git clone https://github.com/PittalaSrivathsav/atomquest-portal.git
cd atomquest-portal
npm install
npm run dev
```

---

## Environment Variables

Create a `.env.local` file:

```env
MONGODB_URI=

NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
```

---

## Deployment

The project is deployed on Vercel.

---

## Author

Srivathsav Pittala

GitHub:
https://github.com/PittalaSrivathsav