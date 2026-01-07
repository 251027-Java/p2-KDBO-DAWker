# --- STAGE 1: Build the Application ---
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Copy only the pom.xml first to cache dependencies (saves time on rebuilds)
COPY pom.xml .
RUN mvn dependency:go-offline

# Copy the source code and build the JAR
COPY src ./src
RUN mvn clean package -DskipTests

# --- STAGE 2: Run the Application ---
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Install curl for healthcheck
RUN apk add --no-cache curl

# Copy the JAR from the build stage
# Note: Ensure the 'target' folder name matches your build output
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

# Run with optimized memory settings for container environments
ENTRYPOINT ["java", "-jar", "app.jar"]