# Project 2 Requirements

- Project presentation on 1/7/2026
- This will be a team project, each team needs to present their own work!
- You will self-organize into four teams.
- This project will be a full stack application (db, API, SPA ui), in MSA, deployed to the AWS cloud
- The api/backend should consist of more than one service.
- Your presentation sould include a demonstration of the running application
- Your presentation shoudl be between 15-25 minutes, at 35 you're getting cut off!

### Your project must fulfill all requirements from P1:

- SPA must...
    - Must include routing to at least two separate pages/views.
    - Must include HTTP requests to your API.
    - Must include at least 5 different components.
    - Must demonstrate two-way binding.

- Your backend must expose a RESTful API.
    - Your backend must use Spring Data JPA for database interactions.
    - Your backend must demonstate separating concerns through application layers.
    - Your backend must feature at least two custom classes.
    - Your backend must feature verbose exception handling to prevent unexpected crashing.
    - Your backend API must include at least 50% overall line coverage with Junit testing (use Mockito to test the serivce layer).
    - Your backend API must include some flavor of Authentication and Authorization.

- Your database must be a PostgreSQL instance running in a Docker container.
    - Must be in 3NF.
    - Must have at least 5 tables.
    - Must have at least 1 Many to Many relationship.

- Your project must be kept in a Git repository that is part of the cohort Organization.
    - Your repo should demonstrate best practices with branching (no commits directly to main!)
    - Your repo should include a README.md that details how to start and run your full stack app.
        - You should include a Description file
        - Describe the app
        - include the user stories that your project fulfills (as a ____ I want to_____ so that I can____ )
        - include a wireframe for the frontend
        - include the ERD for your database
        - include endpoint documentation for your API

- Your Team...
    - Should implement some kind of project board to track work and progress over the duration of the project
    - Should hold a regular stand up meeting (even when working remotely!) to keep team members in sync.
    - Should have a represetative (they do need to be a team "lead", but they can) to report on the project progress.

- Your project must be containerized (with docker)
- Service images should be pushed to Docker Hub
- Your project should be able to start with a docker compose for local development
- Your project should deploy to a Kubernetes cluster running in AWS
- Your project should be tested and deployed automatically with a PR or push to your repository (through Jenkins)
- Your application should include a Eureka Server
- Your application should include a Kafka instance
- Your application should either manage traffic through K8s or a Spring Gateway

- Your application should include log generation across all levels when appropriate

## Starter Code Conditions 

If you want to continue with an existing P1...  
OR  
You use a P0 that was turned into a P1  
You CAN - BUT, it can't be a P1 that ANYONE on your team contribiuted to.

If you use a P0 that was not turned into a P1...  
OR  
If you start a new project...  
the requirements for P2 are modified:

- Your project does not need to deploy to a Kubernetes cluster running in AWS
- Your project should be tested automatically with a PR or push to your repository (through Jenkins)