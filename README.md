🍳 Share Recipe

A fullstack recipe-sharing application built with FastAPI (backend) and Next.js (frontend).
Features authentication, JWT tokens, saving & liking recipes, and commenting.

🔧 Tech Stack
	•	Backend: FastAPI, SQLAlchemy, Alembic, Redis
	•	Frontend: Next.js (React)
    •	Database: PostgreSQ
    •	Auth: JWT, Google OAuth
	•	Infra: Docker, Docker Compose


🚀 Getting Started


Backend
	1.	Create a virtual environment (recommended):

        cd share-recipe-frontend/backend
        python3 -m venv .venv
        source .venv/bin/activate   # macOS/Linux
        .venv\Scripts\activate      # Windows
        pip install -r requirements.txt

    2.	Set up environment variables:
        Create .env in backend/app/config/ with (examples):
            • DATABASE_URL=sqlite+aiosqlite:///./dev.db
            • SECRET_KEY=dev-secret
            • ALGORITHM=HS256
            • ACCESS_TOKEN_EXPIRE_MINUTES=30
            • REFRESH_TOKEN_EXPIRE_DAYS=7
            • SMTP_HOST=localhost (if email confirmations used)
            • ADMIN_USERNAME=admin
            • ADMIN_PASSWORD=admin
            • SESSION_SECRET=dev-session-secret
            • GOOGLE_CLIENT_ID=... (optional for OAuth)
            • GOOGLE_CLIENT_SECRET=...
    
     3.	Initialize the database:
        alembic revision --autogenerate -m "sync models"
        alembic upgrade head

     4.	Run the backend server:
        uvicorn app.main:app --reload
            • API base: http://localhost:8000
            • Static media is served under /media
            • Admin panel: http://localhost:8000/admin
    5. Docker
        docker-compose up --build

Admin panel (SQLAdmin)
    • Path: /admin
    • Auth: simple session auth. Credentials come from env vars ADMIN_USERNAME/ADMIN_PASSWORD
      (defaults admin/admin in development). SESSION_SECRET (or SECRET_KEY) is required for sessions.
    • Uses a dedicated synchronous SQLAlchemy engine under the hood to avoid async driver issues.

CORS (development)
    • Configured to allow http://localhost:3000 

Frontend
	1.	Install dependencies and start the dev server:
        cd ../
        npm install
        npm run dev
    2.	Open the app at: http://localhost:3000
	3.	Configure API base URL for frontend:
        # .env.local
        NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
    Restart the dev server after changes.

🧪 Tests

Run backend tests with pytest from the backend folder (ensures imports and settings are resolved):

    cd share-recipe-frontend/backend
    # Ensure required env vars are set. Example minimal local setup:
    export DATABASE_URL="sqlite+aiosqlite:///./test.db"
    export SECRET_KEY="test-secret"
    export ALGORITHM="HS256"
    # If email confirmation is enabled, also set SMTP/EMAIL vars, or tests will override as needed.
    pytest -v

Notes about tests
    • Tests use an async SQLite database per test and patch the app's session factory.
    • App startup/shutdown events are disabled during tests (to avoid external services like Redis).
    • Fixtures provide anonymous and authorized clients; add header X-Test-Auth: 1 to simulate auth where needed.
    • Full suite should pass: 19 tests.

✨ Features
	•	🔑 Auth: Sign up, sign in, JWT (access/refresh stored in localStorage).
	•	📌 Recipes:
	•	POST /api/recipes/create/ – create a recipe
	•	GET /api/recipes/list/ – list recipes (filters include ingredients, search; excludes own posts by default unless include_self=true)
	•	GET /api/recipes/my-recipes/ – my recipes
	•	GET /api/recipes/saved/ – saved recipes
	•	GET/PATCH/DELETE /api/recipes/recipe/{id}/ – manage a recipe
	•	❤️ Social:
	•	POST/DELETE /api/recipes/recipe/{id}/like/ – like/unlike
	•	POST/DELETE /api/recipes/recipe/{id}/save/ – save/unsave
	•	💬 Comments:
	•	GET/POST /api/recipes/recipe/{id}/comments/
	•	🖼 Uploads:
	•	POST /api/user/profile/photo/ – upload profile photo
	•	POST /api/recipes/recipe/{id}/image/ – upload recipe image
	•	🛠 Admin:
	•	SQLAdmin at /admin with model views (User, Recipe, Ingredient, Comment, Likes, Saves)
	•	⭐ Frontend:
	•	Saved recipes page: /recipes/saved
	•	Recipe detail page with comments
	•	Centralized API base URL (src/lib/config.js)

⸻

📝 Notes
	•	Virtual environment is recommended for backend development.
	•	Auth tokens are stored in localStorage.
	•	Uses Next.js App Router.
	•	Backend tested with pytest (all tests ✅).

⸻

📦 Recommended deployment:
	•	Frontend → Vercel
	•	Backend → any server/cloud provider for FastAPI