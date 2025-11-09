# AnkiPlan Frontend

React + Tailwind CSS frontend for the AnkiPlan task management and gamification platform.

## Setup Instructions

### 1. Install Dependencies

```bash
cd ankiplan_frontend
npm install
```

### 2. Start Development Server

```bash
npm start
```

The app will open at `http://localhost:3000`

### 3. Backend Connection

Make sure your backend is running on `http://127.0.0.1:8000`. 

If your backend is running on a different URL, update the `baseURL` in `src/services/api.js`:

```javascript
const API = axios.create({
  baseURL: "http://your-backend-url:port",
  // ...
});
```

## Features

- **Authentication**: Login and signup with JWT token management
- **Dashboard**: View priority tasks and daily motivation
- **Tasks**: Create, view, complete, and delete tasks
- **Leaderboard**: View all-time and group leaderboards
- **AI Coach**: Get personalized motivation and task suggestions

## Project Structure

```
ankiplan_frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── TaskCard.jsx
│   │   └── MotivationCard.jsx
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Tasks.jsx
│   │   ├── Leaderboard.jsx
│   │   ├── AiCoach.jsx
│   │   └── Login.jsx
│   ├── services/
│   │   └── api.js
│   ├── App.jsx
│   ├── index.js
│   └── index.css
├── package.json
├── tailwind.config.js
└── postcss.config.js
```

## API Integration

All API calls are made through `src/services/api.js` which:
- Automatically includes JWT tokens in request headers
- Handles 401 errors by redirecting to login
- Provides functions for all backend endpoints

## Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App (irreversible)



