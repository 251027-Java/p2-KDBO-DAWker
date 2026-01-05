# `docker init` to get bunch of these files

# Build stage
FROM eclipse-temurin:25-noble AS build
WORKDIR /app

COPY ./ ./
RUN ./mvnw dependency:go-offline
RUN ./mvnw package -DskipTests

# Run stage
FROM eclipse-temurin:25-jre-alpine AS run
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8761
ENTRYPOINT ["java", "-jar", "app.jar"]