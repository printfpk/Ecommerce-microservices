# Ecommerce Microservices

A full-featured ecommerce backend built with a microservices architecture. Each service is a standalone Node.js/Express application connected to MongoDB, communicating via REST APIs and RabbitMQ message queues.

## Services

| Service | Port | Description |
|---------|------|-------------|
| [Auth](#auth-service) | 3000 | User registration, login, JWT sessions, address management |
| [Product](#product-service) | 3001 | Product catalog, image uploads, seller management |
| [Cart](#cart-service) | 3002 | Shopping cart with per-user item tracking |
| [Orders](#orders-service) | 3003 | Order creation and lifecycle management |
| [Payment](#payment-service) | 3004 | Payment processing via Razorpay |
| [AI Buddy](#ai-buddy-service) | 3005 | AI assistant for product search and cart management |

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js v5
- **Database:** MongoDB (Mongoose)
- **Authentication:** JWT + bcryptjs
- **Caching / Sessions:** Redis (ioredis)
- **Message Broker:** RabbitMQ (amqplib)
- **Image Storage:** ImageKit
- **Payments:** Razorpay
- **AI / LLM:** LangChain with Groq (primary) and OpenAI (fallback)
- **Real-time:** Socket.io
- **Package Manager:** pnpm
- **Testing:** Jest + Supertest + mongodb-memory-server

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- pnpm
- MongoDB instance (local or Atlas)
- Redis instance
- RabbitMQ instance
- Accounts / API keys for ImageKit, Razorpay, Groq, and/or OpenAI (for the respective services)

### Running a service

Each service is independent. Navigate to the service directory, install dependencies, configure the environment, and start the server.

```bash
cd auth          # or product | cart | orders | payment | ai-buddy
pnpm install
cp .env.example .env   # fill in the required values
pnpm dev
```

### Running tests

```bash
cd auth          # or product | cart | orders
pnpm test
```

---

## Service Details

### Auth Service

Handles user identity: registration, login, logout, JWT-based session management, and address book.

**Environment variables**

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign JWT tokens |
| `REDIS_URL` | Redis connection URL |

**Endpoints** (`/api/auth`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/register` | — | Register a new user |
| POST | `/login` | — | Login and receive a JWT cookie |
| GET | `/me` | ✅ | Get the current user's profile |
| GET | `/logout` | — | Clear the auth cookie |
| GET | `/users/me/addresses` | ✅ | List saved addresses |
| POST | `/users/me/addresses` | ✅ | Add a new address |
| DELETE | `/users/me/addresses/:addressId` | ✅ | Remove an address |

---

### Product Service

Manages the product catalog. Supports image uploads (up to 5 per product) via ImageKit and uses RabbitMQ to publish events consumed by other services.

**Environment variables**

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Shared JWT secret (for auth middleware) |
| `IMAGEKIT_PUBLIC_KEY` | ImageKit public key |
| `IMAGEKIT_PRIVATE_KEY` | ImageKit private key |
| `IMAGEKIT_URL_ENDPOINT` | ImageKit URL endpoint |
| `RABBIT_URL` | RabbitMQ connection URL |

**Endpoints** (`/api/products`)

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| POST | `/` | admin, seller | Create a new product (multipart/form-data, up to 5 images) |
| GET | `/` | — | List all products |
| GET | `/seller` | seller | List products owned by the authenticated seller |
| GET | `/:id` | — | Get a single product |
| PATCH | `/:id` | seller | Update a product |
| DELETE | `/:id` | seller | Delete a product |

---

### Cart Service

Maintains a shopping cart per user. Only users with the `user` role can interact with the cart.

**Environment variables**

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Shared JWT secret |

**Endpoints** (`/api/cart`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | ✅ user | Retrieve the current user's cart |
| POST | `/items` | ✅ user | Add an item to the cart |
| PATCH | `/items/:productId` | ✅ user | Update item quantity |

---

### Orders Service

Creates and tracks orders. Communicates with other services as needed.

**Environment variables**

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Shared JWT secret |

**Endpoints** (`/api/orders`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/` | ✅ user | Place a new order |

---

### Payment Service

Integrates with Razorpay to create and verify payments linked to orders.

**Environment variables**

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Shared JWT secret |
| `RAZORPAY_KEY_ID` | Razorpay key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay key secret |

**Endpoints** (`/api/payments`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/create/:orderId` | ✅ user | Initiate a Razorpay payment for an order |
| POST | `/verify` | ✅ user | Verify a completed payment |

---

### AI Buddy Service

An AI-powered shopping assistant backed by a LangGraph agent. Uses Groq (free tier, primary) with automatic fallback to OpenAI. Communicates with clients over Socket.io for real-time chat. The agent can search products and add items to the cart on behalf of the user.

**Environment variables**

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Shared JWT secret |
| `GROQ_API_KEY` | Groq API key (primary LLM) |
| `OPENAI_API_KEY` | OpenAI API key (fallback LLM) |

**Socket.io events**

| Event | Direction | Description |
|-------|-----------|-------------|
| `chat` | client → server | Send a message to the AI assistant |
| `response` | server → client | Receive the AI reply |

---

## Project Structure

```
Ecommerce-microservices/
├── auth/          # Authentication & user management service
├── product/       # Product catalog service
├── cart/          # Shopping cart service
├── orders/        # Order management service
├── payment/       # Payment processing service
└── ai-buddy/      # AI shopping assistant service
```

Each service follows a consistent internal layout:

```
<service>/
├── server.js          # Entry point – connects DB and starts HTTP server
├── src/
│   ├── app.js         # Express app setup (routes, middleware)
│   ├── controllers/   # Route handler logic
│   ├── models/        # Mongoose schemas
│   ├── routes/        # Express routers
│   ├── middlewares/   # Auth, validation, etc.
│   └── db/            # Database connection helper
└── tests/             # Jest test suites
```
