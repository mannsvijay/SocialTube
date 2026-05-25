<<<<<<< HEAD
# Video Hosting Backend API
=======
# SocialTube - Video Hosting Backend API
>>>>>>> 6b09c6335e7f5bd00649448c9dfca0484fcfb494

A production-ready backend system for a YouTube-like video hosting platform built with modern JavaScript technologies and best practices.

**Architecture Diagram:** [View System Model](https://app.eraser.io/workspace/YtPqZ1VogxGy1jzIDkzj?origin=share)

## 📋 Table of Contents

<<<<<<< HEAD
- [Overview](#overview)
=======
- [Overview](#Overview)
>>>>>>> 6b09c6335e7f5bd00649448c9dfca0484fcfb494
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Features](#api-features)
- [What You'll Learn](#what-youll-learn)

<<<<<<< HEAD
## 🎯 Overview

This is a comprehensive backend project demonstrating enterprise-level practices for building scalable APIs. It implements a complete video hosting platform with user authentication, video management, social interaction features, and more.

## 🛠️ Tech Stack
=======
## Overview

This is a comprehensive backend project demonstrating enterprise-level practices for building scalable APIs. It implements a complete video hosting platform with user authentication, video management, social interaction features, and more.

## Tech Stack
>>>>>>> 6b09c6335e7f5bd00649448c9dfca0484fcfb494

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens) & Bcrypt
- **Token Management:** Access Tokens & Refresh Tokens
- **File Upload:** Cloudinary Integration
- **Middleware:** Custom auth & multer file handling

<<<<<<< HEAD
## ✨ Features
=======
##  Features
>>>>>>> 6b09c6335e7f5bd00649448c9dfca0484fcfb494

### User Management
- User registration and login
- Secure password hashing with bcrypt
- JWT-based authentication
- Access token & refresh token flow
- User profile management

### Video Management
- Video upload and storage via Cloudinary
- Video metadata management
- Video deletion and updates
- Video visibility control

### Social Features
- **Comments:** Create, read, update, delete comments on videos
- **Likes:** Like/unlike videos and comments
- **Playlists:** Create and manage custom playlists
- **Subscriptions:** Subscribe/unsubscribe to channels
- **Tweets:** Share tweets/status updates

### Dashboard & Analytics
- User dashboard with statistics
- Health check endpoints
- API monitoring capabilities

<<<<<<< HEAD
## 📁 Project Structure
=======
##  Project Structure
>>>>>>> 6b09c6335e7f5bd00649448c9dfca0484fcfb494

```
src/
├── controllers/        # Business logic for each feature
├── models/            # Database schemas (Mongoose)
├── routes/            # API endpoint definitions
├── middlewares/       # Authentication, file upload handlers
├── db/                # Database connection
├── utils/             # Helper functions, error handling
└── app.js             # Express app configuration
```

<<<<<<< HEAD
## 🚀 Getting Started
=======
## Getting Started
>>>>>>> 6b09c6335e7f5bd00649448c9dfca0484fcfb494

### Prerequisites
- Node.js (v14 or higher)
- MongoDB instance
- Cloudinary account (for image/video storage)

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
# Create a .env file with necessary configurations

# Start the server
npm start
```

<<<<<<< HEAD
## 🔌 API Features
=======
##  API Features
>>>>>>> 6b09c6335e7f5bd00649448c9dfca0484fcfb494

The API includes comprehensive endpoints for:
- User authentication
- Video CRUD operations
- Comment management
- Like/Unlike functionality
- Playlist operations
- Subscription management
- Social tweets
- Dashboard metrics

<<<<<<< HEAD
## 📚 What You'll Learn
=======
##  What You'll Learn
>>>>>>> 6b09c6335e7f5bd00649448c9dfca0484fcfb494

From this project, you'll gain practical knowledge of:
- Building RESTful APIs with Express.js
- Database design with MongoDB & Mongoose
- JWT authentication patterns
- Token refresh mechanisms
- Error handling and API responses
- File upload integration
- Middleware implementation
- Best practices for production-ready code
- Complete CRUD operations
- Social feature implementation

---

This project represents enterprise-level backend development patterns and is ideal for understanding full-stack video platform architecture.

