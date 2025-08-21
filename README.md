# Enzo Monitor — Full-stack (Postgres + Prisma + React + Extension)

This repository is a ready-to-deploy full-stack monitoring and time-tracking app designed to integrate with your Enzo Timesheet site.
It uses:
- Backend: Node.js + Express + Prisma ORM (Postgres)
- Frontend: React (Vite)
- Chrome Extension: optional active-tab reporter

## Quick start (local)

1. Install Postgres (or use Docker). Create a database and copy the connection URL.
2. Backend:
   - `cd server`
   - `npm install`
   - Set env `DATABASE_URL` (Postgres) and `JWT_SECRET`
   - Run Prisma migrate & generate:
     - `npx prisma migrate dev --name init`
     - `node prisma/seed.js`  (creates default admin: admin / 741852)
   - `npm run dev` or `node index.js`
3. Frontend:
   - `cd frontend`
   - `npm install`
   - Create `.env` with `VITE_API_URL=http://localhost:4000`
   - `npm run dev`
4. Extension:
   - Load `extension/` as unpacked extension in Chrome (chrome://extensions)

## Deployment
- Backend: Deploy `server/` to Render or Heroku. Set `DATABASE_URL` and `JWT_SECRET`.
- Frontend: Deploy `frontend/` to Vercel. Set `VITE_API_URL` to your backend URL.
- Extension: update popup default API and instruct agents to install and paste their token & shiftId.

## Default Admin
- email: `admin`
- password: `741852`

## Notes
- Obtain explicit consent from agents before monitoring.
- Screenshots & keystroke logging are intentionally not included due to privacy/legal reasons.
- You can integrate the frontend UI into your existing `enzotimesheet.vercel.app` pages by copying relevant React components or embedding the monitor page.

