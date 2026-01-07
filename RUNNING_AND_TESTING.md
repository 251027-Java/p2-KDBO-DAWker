# Running and Testing the DAW State Application

## Prerequisites

Before running the application, ensure you have the following installed:

1. **Docker Desktop** (or Docker Engine + Docker Compose)
   - Download from: https://www.docker.com/products/docker-desktop
   - Make sure Docker is running before proceeding

2. **No additional dependencies needed** - Everything runs in Docker containers!

## Quick Start

### Step 1: Start All Services with Docker Compose

From the project root directory, run:

```bash
docker-compose up --build
```

This command will:
- Build the backend (Spring Boot) Docker image
- Build the frontend (React/Vite) Docker image
- Start PostgreSQL database
- Start Kafka and Zookeeper
- Start all services in the correct order (with health checks)

**Note:** The first time you run this, it may take several minutes to:
- Download base Docker images
- Build the backend (Maven dependencies)
- Build the frontend (npm dependencies)

### Step 2: Verify Services Are Running

Once the containers are up, you should see:
- **Database**: Running on `localhost:5432`
- **Backend API**: Running on `http://localhost:8080`
- **Frontend**: Running on `http://localhost:3000`
- **Kafka**: Running on `localhost:9092`

### Step 3: Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## Testing DAW State Saving and Updating

### Important Note About Update Functionality

⚠️ **Current Issue**: The frontend has an `updateDaw` method that calls `PUT /api/{dawId}`, but this endpoint doesn't exist in the backend. The backend only has `POST /save/Daw` which handles both creating and updating DAWs.

### How DAW State Works

1. **Saving DAW State**:
   - Frontend endpoint: `POST /api/save/Daw`
   - The `saveDaw` method in `DawService.java` handles both create and update
   - If a `dawId` is provided in the DTO, it will update the existing DAW
   - If no `dawId` (or null), it creates a new DAW

2. **Loading DAW State**:
   - Frontend endpoint: `GET /api/search/daw?dawId={id}`
   - Retrieves full DAW with all configs, components, and settings

### Testing Steps

#### 1. Test Saving a New DAW State

1. Open the browser console (F12)
2. Navigate to the DAW interface in the app
3. Configure your DAW settings (amps, pedals, etc.)
4. Click "Save Preset" or trigger the save action
5. Check the console logs - you should see:
   ```
   SAVE DAW - Sending to backend
   SAVE DAW - Received from backend
   ```
6. Verify in the database or by reloading the DAW

#### 2. Test Updating an Existing DAW State

**Option A: Use the Save Endpoint (Current Implementation)**
- The `saveDaw` method in the backend accepts a DTO with an existing `dawId`
- When you call `POST /api/save/Daw` with an existing ID, it updates the DAW
- Check the frontend code in `NativeAmpDemo.tsx` - the `handleUpdateDaw` function uses this

**Option B: Fix the Update Endpoint (Recommended)**
- The frontend `updateDaw` in `dawAPI.ts` tries to call `PUT /api/{dawId}` which doesn't exist
- You would need to add a PUT endpoint in `dawController.java` to properly support updates

#### 3. Verify Data Persistence

1. Save a DAW state
2. Note the `dawId` from the response
3. Reload the page or restart the containers
4. Load the DAW using the `dawId`
5. Verify all settings are preserved

### Checking Backend Logs

To see backend logs and verify DAW operations:

```bash
docker logs dawker-backend -f
```

You should see:
- Database connection messages
- API request logs
- DAW save/update operations

### Checking Database

To inspect the database directly:

```bash
# Connect to PostgreSQL container
docker exec -it dawker-db psql -U user -d dawker_db

# Then run SQL queries:
SELECT * FROM daw_entity;
SELECT * FROM config_entity;
SELECT * FROM component_entity;
```

## Troubleshooting

### Port Already in Use

If you get port conflicts:
```bash
# Stop all containers
docker-compose down

# Or stop specific service
docker stop dawker-backend
```

### Database Connection Issues

If the backend can't connect to the database:
1. Check that the `db` service is healthy: `docker ps`
2. Verify the database is ready: `docker logs dawker-db`
3. Check `application.properties` matches docker-compose environment variables

### Frontend Can't Reach Backend

The frontend is configured to call `http://localhost:8080/api` (see `dawAPI.ts`).
- In Docker, the frontend container should use `http://backend:8080/api` or the service name
- Check the `REACT_APP_API_URL` environment variable in `docker-compose.yml`

### Rebuilding After Code Changes

If you make code changes:
```bash
# Rebuild and restart
docker-compose up --build

# Or rebuild specific service
docker-compose build backend
docker-compose up backend
```

## Development Mode (Without Docker)

If you want to run services individually for development:

### Backend (Spring Boot)
```bash
cd backend/dawker/dawker
./mvnw spring-boot:run
```
**Note:** You'll need PostgreSQL running (use Docker for just the DB: `docker-compose up db`)

### Frontend (React/Vite)
```bash
cd frontend/DragnDrop
npm install --legacy-peer-deps
npm run dev
```
This will run on `http://localhost:5173` (Vite default port)

## API Endpoints for DAW State

- `GET /api/search/daw?dawId={id}` - Get DAW by ID
- `GET /api/search/users?userId={id}` - Get all DAWs for a user
- `GET /api/search/allDaws` - Get all DAWs
- `POST /api/save/Daw` - Save/Update DAW (handles both create and update)
- `POST /api/create/daw?userId={id}&dawName={name}` - Create empty DAW

## Next Steps for Proper Update Support

To properly support the update functionality that the frontend expects:

1. Add a `updateDaw` method in `DawService.java`
2. Add a `@PutMapping("/{dawId}")` endpoint in `dawController.java`
3. Or modify the frontend `updateDaw` to use `POST /api/save/Daw` with the existing ID

