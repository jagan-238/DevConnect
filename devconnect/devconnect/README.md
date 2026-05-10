# DevConnect 💬

A real-time developer chat platform built with the MERN stack and Socket.io.

## Features

- 🔐 JWT Authentication with **refresh token rotation**
- 💬 Real-time messaging with **Socket.io**
- 🏠 Multiple chat rooms (create, join, browse)
- 📩 Direct messages between users
- ✍️ Typing indicators
- 🟢 Live online user presence
- 📱 Responsive dark UI (Tailwind CSS)
- 🔒 Modular Express middleware (auth, error handling, logging)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Real-time | Socket.io |
| Auth | JWT (Access + Refresh tokens) |
| Deployment | Vercel (client) + Render (server) |

## Project Structure

```
devconnect/
├── client/                  # React frontend
│   └── src/
│       ├── components/      # Reusable UI components
│       ├── context/         # AuthContext, SocketContext
│       ├── pages/           # LoginPage, RegisterPage, ChatPage
│       └── utils/           # Axios instance with interceptors
└── server/                  # Node.js backend
    ├── controllers/         # socketController.js
    ├── middleware/          # authMiddleware.js
    ├── models/              # User, Room, Message
    └── routes/              # auth, rooms, messages
```

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/devconnect.git
cd devconnect
```

### 2. Setup the Server
```bash
cd server
npm install
cp .env.example .env
# Fill in your MONGO_URI and JWT secrets in .env
npm run dev
```

### 3. Setup the Client
```bash
cd client
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Environment Variables

### Server `.env`
```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/devconnect
JWT_SECRET=your_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
CLIENT_URL=http://localhost:5173
```

## Deployment

- **Client** → Deploy `/client` to [Vercel](https://vercel.com)
- **Server** → Deploy `/server` to [Render](https://render.com)
- Set `VITE_SERVER_URL` in Vercel to your Render server URL

## Author

**Eragala Jagan Mohan Reddy**  
Full-Stack Developer | MERN Stack  
[LinkedIn](#) · [GitHub](#)
