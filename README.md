# Vanshi - Forest Carbon Asset Marketplace

A MERN stack application for community forest carbon asset management and verification.

## Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- [MongoDB](https://www.mongodb.com/try/download/community) (Running on localhost:27017)

## Getting Started

### 1. Clone/Download the repository
```bash
git clone <repository-url>
cd Vanshi
```

### 2. Backend Setup
1. Open a terminal in the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create/Verify `.env` file:
   Ensure you have a `.env` file in the `backend` directory with:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/vanshi
   JWT_SECRET=vanshi_platinum_secret_2024
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Open a new terminal in the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend application:
   ```bash
   npm run dev
   ```

## Default Credentials
- **Admin**: `admin@gmail.com` / `admin123`
- **Port**: Frontend usually runs on `http://localhost:5173/`
