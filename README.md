# School Administration System

## Prerequisites

- **Node.js**: v24.11.1
- **Docker** & **Docker Compose**
- **Postman** (for API testing)

## Getting Started

1. Clone the repository and navigate to the project directory:
   ```bash
   cd typescript
   ```

2. Build and start the application:
   ```bash
   docker-compose up --build -d
   ```

3. Run the test suite:
   ```bash
   docker-compose exec application npm test
   ```

## API Documentation

Import the Postman collection to explore and test the available endpoints:

1. Open Postman
2. Click **Import**
3. Select `school-administration-system.postman_collection.json` from the project root
