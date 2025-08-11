# 🚀 FullStack Smart Polling Platform

A modern, full-stack polling application built with **NestJS** (backend) and **React TypeScript** (frontend), featuring real-time updates, conditional logic, and comprehensive authentication.

## ✨ Features

### 🎯 Core Functionality
- **Create Smart Polls** with multiple question types (single choice, multiple choice, text)
- **Conditional Logic** - Show/hide questions based on previous answers
- **Real-time Results** via WebSocket connections
- **Anonymous & Authenticated** responses
- **Poll Management** - Create, edit, delete, and activate/deactivate polls

### 🔐 Authentication & Security
- **JWT-based Authentication** with secure token management
- **User Registration & Login**
- **Protected Routes** for authenticated features
- **CORS Configuration** for secure frontend-backend communication

### 📊 Advanced Features
- **Live Poll Results** with automatic updates
- **Response Analytics** with total response counts
- **Export Capabilities** for poll data
- **Responsive Design** for mobile and desktop

## 🛠 Tech Stack

### Backend
- **NestJS** - Progressive Node.js framework
- **TypeORM** - Object-Relational Mapping
- **PostgreSQL** - Production database
- **Socket.io** - Real-time WebSocket communication
- **JWT** - JSON Web Token authentication
- **bcryptjs** - Password hashing

### Frontend
- **React 18** with TypeScript
- **Vite** - Fast build tool
- **TanStack Query** - Server state management
- **shadcn/ui** - Modern UI components
- **Tailwind CSS** - Utility-first styling
- **Socket.io Client** - Real-time updates

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- pnpm (recommended) or npm

### 1. Clone the Repository
```bash
git clone https://github.com/Mina-Sayed/FullStack_Smart-Polling-Platform.git
cd FullStack_Smart-Polling-Platform
```

### 2. Backend Setup
```bash
cd backend
pnpm install

# Create environment file
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
pnpm run migration:run

# Start development server
pnpm run start:dev
```

### 3. Frontend Setup
```bash
cd frontend
pnpm install

# Start development server
pnpm run dev
```

### 4. Access the Application
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000/api

## 📁 Project Structure

```
├── backend/                 # NestJS Backend
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── polls/          # Polls management
│   │   ├── questions/      # Questions entities
│   │   ├── answers/        # Answer submission
│   │   ├── users/          # User management
│   │   ├── websockets/     # Real-time features
│   │   └── migrations/     # Database migrations
│   └── package.json
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── lib/            # Utilities & API client
│   │   ├── contexts/       # React contexts
│   │   └── hooks/          # Custom hooks
│   └── package.json
└── README.md
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Polls Management
- `GET /api/polls` - Get all polls
- `POST /api/polls` - Create new poll (auth required)
- `GET /api/polls/:id` - Get poll by ID
- `GET /api/polls/:id/results` - Get poll results
- `PATCH /api/polls/:id` - Update poll (auth required)
- `DELETE /api/polls/:id` - Delete poll (auth required)

### Answer Submission
- `POST /api/polls/:pollId/answers` - Submit authenticated response
- `POST /api/polls/:pollId/answers/anonymous` - Submit anonymous response

## 🔧 Environment Variables

### Backend (.env)
```env
# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=polling_app

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3001
```

## 🎯 Key Features Walkthrough

### 1. Creating Smart Polls
- Navigate to "Create Poll"
- Add questions with different types
- Set up conditional logic for dynamic surveys
- Configure anonymous access and expiration

### 2. Conditional Logic
```typescript
// Example: Show question 2 only if question 1 answer is "Yes"
{
  dependsOnQuestionId: "question-1-id",
  expectedAnswer: "Yes",
  operator: "equals"
}
```

### 3. Real-time Results
- Results update automatically as responses come in
- WebSocket connection provides instant updates
- No page refresh needed

## 🏗 Deployment

### Backend Deployment (Railway/Heroku)
1. Set up PostgreSQL database
2. Configure environment variables
3. Deploy backend with auto-migrations
4. Update CORS settings for production frontend URL

### Frontend Deployment (Vercel/Netlify)
1. Build the frontend: `pnpm run build`
2. Deploy the `dist` folder
3. Update API base URL for production

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Mina Sayed**
- GitHub: [@Mina-Sayed](https://github.com/Mina-Sayed)
- Email: minasayed290@gmail.com

## � Acknowledgments

- NestJS team for the amazing framework
- React team for the powerful frontend library
- shadcn/ui for beautiful UI components
- The open-source community for inspiration and tools

---

⭐ **Star this repository if you found it helpful!**
