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

DAWker is a web-based Digital Audio Workstation (DAW) application designed for guitarists who want to share their setups with each other. It provides real-time audio processing, preset management, and a community platform for sharing and discovering guitar amp configurations.

We sought to create a way for guitarists or just audio enthusiasts to not only have easy access to a free DAW, but we wanted to build a community around it using the social media feature, users can interact, share their progress, their DAWs and enjoy a community of like-minded individuals.

### Functionality

**Core Features:**

1. **Real-Time Audio Processing**
   - Browser-based guitar amp simulation using native Web Audio API
   - Support for RNBO (Max/MSP) audio patches for advanced effects
   - Real-time audio input processing from microphones or audio interfaces
   - Low-latency audio processing for live performance

2. **Preset Management**
   - Create and save custom DAW configurations (presets)
   - Organize presets with multiple configurations per DAW
   - Component-based signal chain system (amps, pedals, cabinets, effects)
   - Save and load complete DAW states with all settings

3. **Audio Component System**
   - Modular component architecture (Input Gain, Distortion, EQ, Reverb, etc.)
   - Configurable parameters for each component
   - Support for multiple technologies (Native Web Audio API, RNBO, Tone.js)
   - Chain multiple effects together in custom configurations

4. **User Accounts & Authentication**
   - User registration and login system
   - User profiles with personal preset collections
   - Secure session management

5. **Search & Discovery**
   - Search all public DAW presets
   - Filter presets by user (view only your own or all)
   - View detailed preset information including component chains
   - Browse community-created presets

6. **Community Features**
   - Forums for discussions (conversations, collaborations, help)
   - Create and respond to forum posts
   - Rating system for presets (1-5 stars)
   - Comments and feedback on presets
   - View ratings and comments on any preset

7. **Preset Sharing**
   - Public presets visible to all users
   - Private presets for personal use
   - Share configurations with the community

### User Stories

- As a **guitarist**, I want to **create and save custom amp presets** so that I can **quickly recall my favorite tones for different songs or performances**

- As a **musician**, I want to **process my guitar in real-time through the browser** so that I can **practice and perform without expensive hardware**

- As a **user**, I want to **search for presets created by other users** so that I can **discover new tones and learn from the community**

- As a **guitarist**, I want to **chain multiple effects together (distortion, EQ, reverb)** so that I can **create complex signal chains like a physical pedalboard**

- As a **user**, I want to **rate and comment on presets** so that I can **provide feedback and help others find quality configurations**

- As a **musician**, I want to **save my DAW state with all settings** so that I can **resume my work exactly where I left off**

- As a **community member**, I want to **participate in forums** so that I can **ask questions, share tips, and collaborate with other musicians**

- As a **user**, I want to **view detailed information about presets** so that I can **understand the component chain and settings before loading them**

- As a **guitarist**, I want to **adjust real-time audio parameters** so that I can **fine-tune my tone while playing**

- As a **user**, I want to **organize my presets into multiple configurations** so that I can **have different setups for different musical styles or projects**

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
