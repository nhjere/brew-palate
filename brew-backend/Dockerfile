# ---- Stage 1: Build the application ----
FROM maven:3.9.6-eclipse-temurin-21 AS build

# Set working directory inside the container
WORKDIR /app

# Copy your backend code into the container
COPY . .

# Run Maven to build the JAR file (skipping tests for speed)
RUN mvn clean package -DskipTests


# ---- Stage 2: Run the application ----
FROM eclipse-temurin:21-jre

# Set working directory in the runtime container
WORKDIR /app

# Copy the JAR file built in the previous stage
COPY --from=build /app/target/*.jar app.jar

# Expose port 8080 (Spring Boot default)
EXPOSE 8080

# Run the JAR when the container starts
ENTRYPOINT ["java", "-jar", "app.jar"]
