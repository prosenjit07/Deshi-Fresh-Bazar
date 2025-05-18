# FreshBazar

FreshBazar is a modern e-commerce platform built with Next.js and Node.js, designed to provide a seamless shopping experience for fresh produce and groceries.

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 14 (React)
- **Language**: TypeScript
- **State Management**: React Context API
- **Styling**: Tailwind CSS
- **Asset Management**: Built-in Next.js asset handling
- **API Integration**: Axios/Fetch API

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (assumed based on typical Node.js stack)
- **Authentication**: JWT (JSON Web Tokens)
- **API Documentation**: Swagger/OpenAPI

## 📁 Project Structure
freshbazar/
├── src/ # Frontend source code
│ ├── app/ # Next.js app directory (pages and routing)
│ ├── components/ # Reusable React components
│ ├── contexts/ # React Context providers
│ ├── lib/ # Utility functions and shared logic
│ └── assets/ # Static assets (images, fonts, etc.)
│
└── backend/ # Backend source code
├── src/ # Backend source files
├── package.json # Backend dependencies
└── node_modules/ # Backend node modules

## 🛠️ Databse Schema

![supabase-schema-jftgaryiaxgadhuwiiys](https://github.com/user-attachments/assets/22cea62c-ccf3-434a-adb9-f55f0a415324)


## 🛠️ Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB (if using MongoDB as database)
- Git

## 🚀 Getting Started

### Frontend Setup

1. Navigate to the project root:
   ```bash
   cd freshbazar
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   # Add other environment variables as needed
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env` file in the backend directory:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   # Add other environment variables as needed
   ```

4. Start the backend server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## 🔧 Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

### Backend
- `npm run dev` - Start development server with nodemon
- `npm run start` - Start production server
- `npm run test` - Run tests
- `npm run lint` - Run ESLint

## 📚 API Documentation

The API documentation is available at `/api-docs` when running the backend server. It provides detailed information about all available endpoints, request/response formats, and authentication requirements.

## 🔐 Authentication

The application uses JWT (JSON Web Tokens) for authentication. Protected routes require a valid JWT token in the Authorization header:
