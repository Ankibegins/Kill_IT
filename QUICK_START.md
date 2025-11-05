# Quick Start Guide 🚀

## ✅ Dependencies Installed!

All required packages are now installed in your virtual environment.

## Run the Server

**Make sure you're in the backend directory with venv activated:**

```powershell
cd backend
uvicorn main:app --reload
```

## Before Running - Check Environment Variables

Make sure you have a `.env` file in the `backend` directory:

```env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=ankiplan
SECRET_KEY=your-secret-key-change-in-production-minimum-32-characters
```

If you don't have one, create it from `env.example`.

## Expected Output

When you run the server, you should see:

```
✅ Connected to MongoDB: ankiplan
✅ Task reset scheduler started
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

## Test the Server

Open your browser:
- API: http://localhost:8000
- Docs: http://localhost:8000/docs

Or use curl:
```bash
curl http://localhost:8000/
```

## Troubleshooting

### If MongoDB connection fails:
- Make sure MongoDB is running
- Check your `MONGODB_URL` in `.env`

### If still getting import errors:
- Make sure venv is activated: `(venv) PS C:\Users\ankit\codes\killit\backend>`
- If not, activate: `..\venv\Scripts\Activate.ps1`

