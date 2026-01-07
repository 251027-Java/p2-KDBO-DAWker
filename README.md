# Project Name

## Table of Contents
- [Setup Instructions](#setup-instructions)
- [Purpose of Project](#purpose-of-project)
- [Developer Documentation](#developer-documentation)
- [Frontend Documentation](#frontend-documentation)

---

## Setup Instructions

### Prerequisites

Before running the application, ensure you have Docker Desktop installed.

### Docker Compose Setup

#### Step 1: Start All Services

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

#### Step 2: Verify Services Are Running

Once the containers are up, you should see:
- **Database**: Running on `localhost:5432`
- **Backend API**: Running on `http://localhost:8080`
- **Frontend**: Running on `http://localhost:5173`
- **Kafka**: Running on `localhost:9092`

#### Step 3: Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

#### Additional Docker Commands

**Stop all services:**
```bash
docker-compose down
```

**Stop and remove volumes (clean slate):**
```bash
docker-compose down -v
```

**View logs:**
```bash
# All services
docker-compose logs -f

# Specific service
docker logs dawker-backend -f
docker logs dawker-frontend -f
docker logs dawker-db -f
```

**Rebuild after code changes:**
```bash
docker-compose up --build
```

### Environment Variables

The following environment variables are configured in `docker-compose.yml`:

**Database (PostgreSQL):**
- `POSTGRES_USER`: user
- `POSTGRES_PASSWORD`: password
- `POSTGRES_DB`: dawker_db

**Backend (Spring Boot):**
- `SPRING_DATASOURCE_URL`: jdbc:postgresql://db:5432/dawker_db
- `SPRING_DATASOURCE_USERNAME`: user
- `SPRING_DATASOURCE_PASSWORD`: password
- `SPRING_KAFKA_BOOTSTRAP_SERVERS`: kafka:29092

**Frontend (React):**
- `REACT_APP_API_URL`: http://localhost:8080/

### Troubleshooting

**Port Already in Use:**
```bash
# Stop all containers
docker-compose down

# Or stop specific service
docker stop dawker-backend
```

**Database Connection Issues:**
1. Check that the `db` service is healthy: `docker ps`
2. Verify the database is ready: `docker logs dawker-db`
3. Check `application.properties` matches docker-compose environment variables

**Frontend Can't Reach Backend:**
- The frontend is configured to call `http://localhost:8080/api`
- Check the `REACT_APP_API_URL` environment variable in `docker-compose.yml`
- Ensure backend service is healthy before frontend starts

---

## Purpose of Project

### Functionality

### User Stories

- As a _____, I want to _____ so that I can _____
- As a _____, I want to _____ so that I can _____
- As a _____, I want to _____ so that I can _____

---

## Developer Documentation

### Backend

#### Services

##### Service 1

**Endpoints:**

- `GET /endpoint` - Description
- `POST /endpoint` - Description
- `PUT /endpoint` - Description
- `DELETE /endpoint` - Description

##### Service 2

**Endpoints:**

- `GET /endpoint` - Description
- `POST /endpoint` - Description
- `PUT /endpoint` - Description
- `DELETE /endpoint` - Description

#### API Documentation

[Spring API Documentation](#) - Link to generated API docs (if applicable)

#### Packages

```
com.example.project
├── controller
├── service
├── repository
├── model
└── config
```

#### Database

**Database Type:** PostgreSQL

**Connection Details:**

**Schema:**

```sql
-- Table descriptions
```

**ERD:**

[Link to ERD diagram or embed image]

---

## Frontend Documentation

### Libraries

#### Tailwind CSS

**Purpose:**

**Configuration:**

#### Blueprint

**Purpose:**

**Usage:**

### React

**Version:**

**Key Components:**

```
src/
├── components/
├── pages/
├── services/
├── utils/
└── styles/
```

**Routing:**

**State Management:**

---

## Additional Resources

### Wireframes

[Link to wireframes or embed images]

### Architecture Diagram

[Link to architecture diagram or embed image]
