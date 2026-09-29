# BlogSphere - Full-Stack Blog Platform with Comments

BlogSphere is a modern, full-stack blogging platform built with React, Node.js, Express, MongoDB, and Mongoose. It features JWT-based user authentication, full CRUD capabilities for blog posts and comments, role-based authorization (users can edit/delete only their own content), and a sleek, responsive user interface.

---

## Features

- **User Authentication & Authorization**:
  - Secure user registration and login with bcryptjs password hashing.
  - JWT (JSON Web Token) authentication stored safely on client.
  - Session restoration on refresh.
  - Protected routes on frontend and backend.
  - Ownership authorization: Users can edit/delete ONLY their own posts and comments (HTTP 403 enforcement).

- **Blog Posts (CRUD)**:
  - **View Posts**: Homepage card grid with live title/content search filter, author details, and formatted publication dates.
  - **Single Post Detail**: Full article view with author metadata and comments section.
  - **Create Post**: Rich post creation form with loading, error, and success state handling.
  - **Edit Post**: Author-only post modification pre-filled with existing data.
  - **Delete Post**: Author-only post removal with custom modal confirmation dialog and cascading deletion of post comments.

- **Comments System**:
  - Authenticated users can add comments to any blog post.
  - View real-time comment list with author initials avatar and timestamp.
  - Authors can delete their own comments.

- **Polished UI / UX**:
  - Modern design system with CSS variables, Plus Jakarta Sans typography, sleek card hover effects, micro-animations, and glassmorphism navbar.
  - Responsive layouts optimized for Desktop, Tablet, and Mobile.

---

## Tech Stack

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router DOM (v6)
- **HTTP Client**: Axios (with custom request interceptor for JWT authorization)
- **Icons**: Lucide React
- **Styling**: Vanilla CSS (Modern CSS variables, Flexbox & Grid)

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB & Mongoose ORM (with automatic MongoMemoryServer fallback for hassle-free local execution)
- **Auth**: JWT (`jsonwebtoken`) & `bcryptjs`
- **Security & Utilities**: `cors`, `dotenv`

---

## Project Structure

```text
blog-platform/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CommentForm.jsx
│   │   │   ├── CommentList.jsx
│   │   │   ├── ErrorMessage.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── PostCard.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── CreatePostPage.jsx
│   │   │   ├── EditPostPage.jsx
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   └── SinglePostPage.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── commentController.js
│   │   └── postController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── errorMiddleware.js
│   ├── models/
│   │   ├── Comment.js
│   │   ├── Post.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── commentRoutes.js
│   │   └── postRoutes.js
│   ├── .env
│   ├── .env.example
│   └── server.js
│
├── package.json
├── .gitignore
└── README.md
```

---

## Requirements

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- *(Optional)* **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017/blogsphere`) or MongoDB Atlas URI. *If MongoDB is not running locally, the server automatically starts an in-memory MongoDB server for instant testing!*

---

## Installation

### 1. Install All Dependencies

From the project root directory, run:

```bash
npm run install:all
```

Or install separately:

```bash
# Install Server Dependencies
cd server
npm install

# Install Client Dependencies
cd ../client
npm install
```

---

## Environment Variables

Create a `.env` file in the `server` directory (a `.env.example` file is provided):

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/blogsphere
JWT_SECRET=your_jwt_secret_key_here
```

### MongoDB Atlas Setup (Optional)
To use MongoDB Atlas in cloud:
1. Create a cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a Database User with read/write permissions.
3. Whitelist your IP address in Network Access.
4. Copy the connection string and paste it into `server/.env` as `MONGO_URI`.

---

## API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Register a new user | No |
| `POST` | `/api/auth/login` | Log in user & return JWT token | No |
| `GET` | `/api/auth/me` | Get current logged-in user profile | Yes |

### Blog Posts (`/api/posts`)
| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | --- |
| `GET` | `/api/posts` | Fetch all blog posts (sorted by date) | No |
| `GET` | `/api/posts/:id` | Fetch single post by ID | No |
| `POST` | `/api/posts` | Create a new blog post | Yes |
| `PUT` | `/api/posts/:id` | Update a blog post | Yes (Author only) |
| `DELETE` | `/api/posts/:id` | Delete a blog post & its comments | Yes (Author only) |

### Comments (`/api/posts/:postId/comments` & `/api/comments`)
| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | --- |
| `GET` | `/api/posts/:postId/comments` | Get all comments for a post | No |
| `POST` | `/api/posts/:postId/comments` | Add a comment to a post | Yes |
| `DELETE` | `/api/comments/:id` | Delete a comment | Yes (Author only) |

---

## Authentication

Authentication is handled using JSON Web Tokens (JWT):
1. Upon successful login or registration, the backend generates a JWT signed with `JWT_SECRET`.
2. The client saves the token in `localStorage`.
3. The Axios API service (`client/src/services/api.js`) automatically attaches `Authorization: Bearer <token>` to protected HTTP requests.
4. The server's `protect` middleware verifies the token and attaches `req.user` to the request object.

---

## How to Run

### Method 1: Running Server and Client Concurrently

Open two terminal windows from the root directory:

**Terminal 1 (Backend Server):**
```bash
npm run dev:server
```
*(Backend runs on `http://localhost:5000`)*

**Terminal 2 (Frontend Client):**
```bash
npm run dev:client
```
*(Frontend runs on `http://localhost:3000` with API proxy configured)*

### Method 2: Separate Directory Commands

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

---

## Screenshots

*(Place screenshots of Homepage, Post Detail, Create Post, and Mobile view here)*

- **Homepage & Feed**: `![Homepage](screenshots/homepage.png)`
- **Single Post & Comments**: `![Post Detail](screenshots/post-detail.png)`
- **Create / Edit Post**: `![Create Post](screenshots/create-post.png)`

---

## License

MIT License - feel free to use for learning or personal projects!
