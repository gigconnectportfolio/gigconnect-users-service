# Users Service (4-users-service)

The Users Service manages user profile data and user-centric domain operations (buyer/seller profiles, settings, avatars/banners, etc.). It exposes REST APIs consumed via the API Gateway, persists data in MongoDB, consumes and emits events on RabbitMQ, and integrates with Elasticsearch for centralized logging. Optional Elastic APM can be enabled for deep tracing.

---

## Responsibilities
- CRUD for user profiles and related resources
- Authenticate incoming requests (JWT verification) from the Gateway
- Consume domain events from RabbitMQ (buyer/seller creation, reviews fanout, seed data)
- Publish user-related events as needed
- Centralized error handling and logging to Elasticsearch

## Architecture & Dependencies
- Runtime: Node.js 18+, TypeScript
- Framework: Express
- Database: MongoDB
- Messaging: RabbitMQ
- Caching/coordination: Redis (used by service logic/queues where needed)
- Media: Cloudinary for images
- Observability: Elasticsearch + optional Elastic APM

## Ports
- HTTP: 4003

## Environment Variables
Defined in `src/config.ts`:
- NODE_ENV: `development` | `production` | `test`
- API_GATEWAY_URL: Allowed CORS origin from Gateway
- JWT_TOKEN: JWT verification secret used in request middleware
- GATEWAY_JWT_TOKEN: JWT used for service-to-service auth (if applicable)
- SECRET_KEY_ONE, SECRET_KEY_TWO: Crypto/session secrets
- DATABASE_URL: MongoDB connection string (e.g., `mongodb://localhost:27017/gigconnect_users`)
- ELASTIC_SEARCH_URL: Elasticsearch HTTP endpoint for logs
- RABBITMQ_ENDPOINT: AMQP URL (e.g., `amqp://gigconnect:Qwerty123@localhost:5672`)
- REDIS_HOST: Redis connection URL (e.g., `redis://localhost:6379`)
- CLOUD_NAME, CLOUD_API_KEY, CLOUD_API_SECRET: Cloudinary credentials
- ENABLE_APM: `1` to enable Elastic APM
- ELASTIC_APM_SERVER_URL, ELASTIC_APM_SECRET_TOKEN: APM settings

## Message Flows (RabbitMQ)
Consumers initialized in `src/server.ts` via `user.consumer.ts`:
- `consumeBuyerDirectMessage`
- `consumeSellerDirectMessage`
- `consumeReviewFanoutMessages`
- `consumeSeedGigDirectMessages`

Queue/exchange names are defined in the consumer/connection code; ensure the corresponding exchanges/queues are created by the publishers or at bootstrap.

## NPM Scripts
- dev: `nodemon`
- build: `tsc` + `tsc-alias`
- start: PM2 cluster run of compiled build
- test: Jest
- lint/format: eslint + prettier

## Running Locally

### Prerequisites
- MongoDB (see `volumes/docker-compose.yaml`)
- RabbitMQ
- Elasticsearch (optional but recommended)

### Docker Compose (infra)
```
docker compose -f volumes/docker-compose.yaml up -d mongo rabbitmq elasticsearch kibana apm-server
```

### Configure .env
```
NODE_ENV=development
API_GATEWAY_URL=http://localhost:4000
JWT_TOKEN=supersecretjwt
GATEWAY_JWT_TOKEN=gateway-users-token
SECRET_KEY_ONE=secret-one
SECRET_KEY_TWO=secret-two
DATABASE_URL=mongodb://localhost:27017/gigconnect_users
ELASTIC_SEARCH_URL=http://elastic:admin1234@localhost:9200
RABBITMQ_ENDPOINT=amqp://gigconnect:Qwerty123@localhost:5672
REDIS_HOST=redis://localhost:6379
CLOUD_NAME=
CLOUD_API_KEY=
CLOUD_API_SECRET=
ENABLE_APM=0
ELASTIC_APM_SERVER_URL=http://localhost:8200
ELASTIC_APM_SECRET_TOKEN=
```

### Start
- Dev: `npm run dev`
- Prod: `npm run build && npm run start`

## Security
- CORS restricted to `API_GATEWAY_URL`
- Helmet & HPP enabled
- JWT verification in request middleware
- Secrets managed in a secret store for production (Kubernetes Secrets / Vault)

## Observability
- Logs to Elasticsearch via `@kariru-k/gigconnect-shared` logger
- Elastic APM optional (`ENABLE_APM=1`)

## Troubleshooting
- 401/403: verify `JWT_TOKEN` and that requests carry `Authorization: Bearer <token>`
- Mongo connection errors: verify `DATABASE_URL` and container health
- Queue consumers idle: verify `RABBITMQ_ENDPOINT` and that publishers send to correct exchange/routing keys
- Missing logs: verify `ELASTIC_SEARCH_URL`
