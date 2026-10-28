# StayNest Frontend

StayNest is a hotel discovery and booking web application. This repository
contains its React frontend, built with Vite. Users can browse hotels, view
room options, check availability, and manage bookings. Administrators can
manage hotels, room types, and booking statuses.

## Features

- Search hotels by city and sort by rating, price, or name.
- View hotel details, photo galleries, and room types.
- Check room availability and estimate booking totals by date.
- Register, sign in, and manage personal bookings.
- Admin dashboard for hotel, room type, and booking management.
- Protected customer and administrator routes.

## Requirements

- Node.js and npm.
- The StayNest API server running at `http://localhost:5000`.

Vite proxies requests to `/api` and `/images` to the API server on port 5000.
The backend is not included in this frontend directory.

## Getting started

From the `frontend` directory:

```sh
npm install
npm run dev
```

Open the local URL printed by Vite (by default, `http://localhost:5173`).
Keep the API server running while using features that load or update data.

## Available commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Create a production build in `dist/`. |
| `npm run preview` | Preview the production build locally. |
| `npm run lint` | Run ESLint across the frontend. |

## Application routes

| Route | Description | Access |
| --- | --- | --- |
| `/` | Search and browse hotels. | Public |
| `/hotels/:slug` | View a hotel's details and rooms, then start a booking. | Public |
| `/login` | Sign in to an account. | Public |
| `/register` | Create an account. | Public |
| `/bookings` | View and cancel eligible personal bookings. | Signed-in users |
| `/admin` | Manage hotels, room types, and bookings. | Administrators |

## Project structure

```text
src/
  components/       Shared UI, navigation, booking modal, and admin tabs
  context/          Authentication context and hook
  lib/              API client, formatting, and navigation helpers
  pages/            Route-level screens
  App.jsx           Application routes
  main.jsx          React entry point and providers
```

## API and authentication

The Axios client in `src/lib/api.js` sends requests to `/api`. When a user is
signed in, it attaches the saved authentication token to API requests. A
`401 Unauthorized` response clears the saved session and sends the browser to
the login page.

The API is expected to provide the hotel, room, authentication, booking, and
admin endpoints used by the screens. The Vite development proxy is configured
in `vite.config.js`; update it if the backend runs on a different address.
