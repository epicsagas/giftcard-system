# Gift Card System

A modern digital gift card issuance and management system built with Rust (backend) and Remix with TypeScript (frontend). This system allows users to create, send, accept, and use gift cards with QR code technology.

## Features

- Issue gift cards with custom amounts and expiration dates
- Recipients receive gift cards via phone number
- Recipients must accept gift cards before use
- QR code generation for payments at any location
- Real-time balance tracking
- Secure gift card management

## System Architecture

The system consists of two main components:

1. **Backend API (Rust/Actix-web)**: Handles all business logic, data storage, and API endpoints
2. **Frontend (Remix/TypeScript)**: Provides a user-friendly interface for managing gift cards

## Prerequisites

- Rust (latest stable version)
- Node.js (v16+)
- PostgreSQL database
- Yarn or npm

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/gift-card-system.git
cd gift-card-system
```

### 2. Backend Setup

#### Configure the Database

1. Create a PostgreSQL database:

```bash
createdb gift_card_db
```

2. Update the database configuration in `backend/.env` if needed:

```
DATABASE_URL=postgres://postgres:postgres@localhost:5432/gift_card_db
SERVER_PORT=8080
JWT_SECRET=your_jwt_secret_key_here
```

#### Install Rust Dependencies and Run Migrations

```bash
cd backend
cargo install sqlx-cli
sqlx database create
sqlx migrate run
cargo build
```

#### Start the Backend Server

```bash
cargo run
```

The API server will start on http://localhost:8080.

### 3. Frontend Setup

#### Install Dependencies

```bash
cd ../frontend
npm install
```

#### Configure Environment

Create a `.env` file in the frontend directory:

```
API_BASE_URL=http://localhost:8080
```

#### Start the Development Server

```bash
npm run dev
```

The frontend will start on http://localhost:3000.

## API Endpoints

The backend provides the following API endpoints:

- `POST /api/gift-cards` - Create a new gift card
- `GET /api/gift-cards/:id` - Get gift card details
- `POST /api/gift-cards/:id/accept` - Accept a gift card
- `GET /api/gift-cards/by-recipient/:phone` - Find gift cards by recipient
- `POST /api/transactions` - Create a new payment transaction

## Development Scripts

From the project root, you can run:

- `npm run setup` - Install all dependencies for backend and frontend
- `npm run dev` - Start both backend and frontend in development mode
- `npm run build` - Build both backend and frontend for production
- `npm run start` - Start both services in production mode

## Testing

### Backend Tests

```bash
cd backend
cargo test
```

### Frontend Tests

```bash
cd frontend
npm test
```

## Security Considerations

- All API endpoints for accepting and using gift cards require verification
- Gift card QR codes are uniquely generated and validated for each transaction
- Expired gift cards cannot be used
- All sensitive data is encrypted in the database

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Features

- Create digital gift cards with customizable amounts and expiration periods
- Send gift cards to recipients via phone number
- Accept gift cards via phone number verification
- Use gift cards at any payment location through QR code scanning
- Search for gift cards associated with a phone number
- Manage gift card statuses (active, expired, pending acceptance)
- Secure gift card storage and transaction processing

## System Requirements

### Backend
- Rust (1.70+)
- PostgreSQL (14+)
- Cargo

### Frontend
- Node.js (16+)
- npm or yarn

## Setup Instructions

### Clone the Repository

```bash
git clone https://github.com/your-username/gift-card-system.git
cd gift-card-system
```

### Backend Setup

1. Install Rust dependencies:

```bash
cd backend
cargo build
```

2. Set up PostgreSQL:

```bash
# Create a PostgreSQL database
createdb gift_card_db

# Apply migrations
cargo run --bin migrate
```

3. Configure environment variables:

The system uses environment variables from the `.env` file. A sample file is provided:

```
# Database Configuration
DATABASE_URL=postgres://postgres:postgres@localhost:5432/gift_card_db

# Server Configuration
HOST=127.0.0.1
PORT=8080

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=24h

# QR Code Configuration
QR_CODE_BASE_URL=http://localhost:8080/api/payments
```

4. Run the backend server:

```bash
cargo run
```

The backend server will start at `http://localhost:8080`.

### Frontend Setup

1. Install frontend dependencies:

```bash
cd frontend
npm install
```

2. Configure environment variables:

Create a `.env` file in the frontend directory:

```
API_BASE_URL=http://localhost:8080/api
```

3. Run the frontend development server:

```bash
npm run dev
```

The frontend application will be available at `http://localhost:3000`.

## API Documentation

### Gift Card Endpoints

#### Create Gift Card
- **URL**: `/api/gift-cards`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "issuer_name": "John Doe",
    "recipient_name": "Jane Smith",
    "recipient_phone": "1234567890",
    "balance": 5000, // in cents
    "expiration_days": 90
  }
  ```
- **Response**:
  ```json
  {
    "status": "success",
    "data": {
      "id": "uuid",
      "issuer_name": "John Doe",
      "recipient_name": "Jane Smith",
      "recipient_phone": "1234567890",
      "balance": 5000,
      "initial_balance": 5000,
      "expiration_date": "2023-12-31T23:59:59Z",
      "is_accepted": false,
      "is_active": true,
      "created_at": "2023-10-01T12:00:00Z"
    }
  }
  ```

#### Get Gift Card
- **URL**: `/api/gift-cards/:id`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "status": "success",
    "data": {
      "id": "uuid",
      "issuer_name": "John Doe",
      "recipient_name": "Jane Smith",
      "recipient_phone": "1234567890",
      "balance": 5000,
      "initial_balance": 5000,
      "expiration_date": "2023-12-31T23:59:59Z",
      "is_accepted": false,
      "is_active": true,
      "qr_code": "base64_string_or_url",
      "created_at": "2023-10-01T12:00:00Z"
    }
  }
  ```

#### Accept Gift Card
- **URL**: `/api/gift-cards/:id/accept`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "gift_card_id": "uuid",
    "recipient_phone": "1234567890"
  }
  ```
- **Response**:
  ```json
  {
    "status": "success",
    "data": {
      "id": "uuid",
      "is_accepted": true,
      "qr_code": "base64_string_or_url"
    }
  }
  ```

#### Search Gift Cards by Recipient
- **URL**: `/api/gift-cards/by-recipient/:phone`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "status": "success",
    "data": [
      {
        "id": "uuid",
        "issuer_name": "John Doe",
        "recipient_name": "Jane Smith",
        "recipient_phone": "1234567890",
        "balance": 5000,
        "initial_balance": 5000,
        "expiration_date": "2023-12-31T23:59:59Z",
        "is_accepted": true,
        "is_active": true,
        "created_at": "2023-10-01T12:00:00Z"
      }
    ]
  }
  ```

#### Process Payment
- **URL**: `/api/payments`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "gift_card_id": "uuid",
    "amount": 1000 // in cents
  }
  ```
- **Response**:
  ```json
  {
    "status": "success",
    "data": {
      "transaction_id": "uuid",
      "gift_card_id": "uuid",
      "amount": 1000,
      "remaining_balance": 4000,
      "transaction_date": "2023-10-10T15:30:00Z"
    }
  }
  ```

## Usage Guide

### Creating a Gift Card

1. Navigate to `/gift-cards/new`
2. Fill in the issuer's information
3. Enter the recipient's name and phone number
4. Set the gift card amount and expiration period
5. Submit the form

### Finding Gift Cards

1. Navigate to `/gift-cards/search`
2. Enter the phone number associated with the gift cards
3. View all gift cards linked to that phone number

### Accepting a Gift Card

1. Open the gift card details page
2. Click "Accept Gift Card"
3. Enter the recipient's phone number for verification
4. Once accepted, the gift card is ready to use

### Using a Gift Card

1. Open the accepted gift card
2. Present the QR code to the merchant
3. The merchant scans the QR code and enters the payment amount
4. The gift card balance is updated automatically

## License

MIT