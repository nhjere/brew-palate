# ---- Stage 1: Build Spring Boot App ----
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# ---- Stage 2: Run the Spring Boot JAR ----
FROM eclipse-temurin:21-jre
WORKDIR /app

# Use `find` to copy the built jar reliably
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
