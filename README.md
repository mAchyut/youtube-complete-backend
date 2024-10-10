# YouTube Complete Backend

This project is a complete backend solution replicating the core features of YouTube. It provides APIs for managing users, videos, comments, subscriptions, playlists, and more.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
  - [User Management](#user-management)
  - [Video Management](#video-management)
  - [Comments](#comments)
  - [Subscriptions](#subscriptions)
  - [Playlists](#playlists)
  - [Likes](#likes)
  - [Dashboard](#dashboard)
- [Error Handling](#error-handling)
- [Security](#security)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## Overview
This backend application is designed to handle various functionalities of YouTube, including user authentication, video uploads, comments, likes, and subscriptions. Built with modern technologies, it ensures scalability and performance for handling media content and social interactions.

## Features
- User authentication (registration, login, logout)
- Video uploads and management
- Commenting on videos
- Subscription management
- Playlist creation and management
- Like and dislike functionalities for videos, comments, and tweets
- Dashboard statistics

## Tech Stack
- **Backend**: Node.js, Express
- **Database**: MongoDB, Mongoose
- **File Storage**: AWS S3 for video and image storage
- **Authentication**: JWT for secure access
- **Others**: Multer for file uploads, Aggregation pipelines for analytics

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- AWS account for S3 storage

### Steps
1. **Clone the repository**:
    ```bash
    git clone https://github.com/your-repo/youtube-backend-clone.git
    ```
2. **Navigate to the project directory**:
    ```bash
    cd youtube-backend-clone
    ```
3. **Install dependencies**:
    ```bash
    npm install
    ```
4. **Set up environment variables**:
    Create a `.env` file in the root directory and populate it as follows:

    ```
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    AWS_ACCESS_KEY_ID=your_aws_access_key
    AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
    AWS_BUCKET_NAME=your_s3_bucket_name
    ```

5. **Start the development server**:
    ```bash
    npm run dev
    ```

## Environment Variables
| Variable                  | Description                             |
|---------------------------|-----------------------------------------|
| `PORT`                    | Port number for the server              |
| `MONGO_URI`               | MongoDB connection string               |
| `JWT_SECRET`              | Secret key for JWT                      |
| `AWS_ACCESS_KEY_ID`       | AWS access key for S3 storage           |
| `AWS_SECRET_ACCESS_KEY`    | AWS secret access key                  |
| `AWS_BUCKET_NAME`         | Name of the S3 bucket for videos        |

## API Endpoints

### User Management
- **POST /api/v1/users/register**: Register a new user.
- **POST /api/v1/users/login**: Log in an existing user.
- **POST /api/v1/users/logout**: Log out the current user.
- **POST /api/v1/users/refresh-token**: Refresh access token.
- **PATCH /api/v1/users/account**: Update user account details.

### Video Management
- **POST /api/v1/video/video-upload**: Upload a video.
- **GET /api/v1/video/all-videos**: Retrieve all videos.
- **GET /api/v1/video/:videoId**: Get details of a specific video.
- **PATCH /api/v1/video/update-details/:videoId**: Update video details.
- **GET /api/v1/video/delete-video/:videoId**: Delete a video.

### Comments
- **POST /api/v1/video/comment/:videoId**: Add a comment to a video.
- **PATCH /api/v1/video/comment/:commentId/update**: Update a specific comment.
- **GET /api/v1/video/comment/:commentId**: Get a specific comment.

### Subscriptions
- **POST /api/v1/channel/subscribe/:channelId**: Subscribe to a channel.
- **POST /api/v1/channel/:subscriberId/subscribed-to**: Get subscribed channels.

### Playlists
- **POST /api/v1/playlist/create-playlist**: Create a new playlist.
- **GET /api/v1/playlist/:userId/playlists**: Get user playlists.
- **GET /api/v1/playlist/:playlistId**: Get details of a specific playlist.
- **GET /api/v1/playlist/:playlistId/add-video/:videoId**: Add a video to a playlist.
- **GET /api/v1/playlist/:playlistId/remove-video/:videoId**: Remove a video from a playlist.

### Likes
- **POST /api/v1/video/:videoId/like**: Like or dislike a video.
- **POST /api/v1/comment/:commentId/like**: Like or dislike a comment.

### Dashboard
- **POST /api/v1/dashboard/stats**: Get channel statistics.
- **POST /api/v1/dashboard/channel/all-videos**: Get all videos uploaded by the channel.

## Error Handling
Custom error handling middleware returns meaningful error messages with appropriate status codes for various scenarios (e.g., 400, 404, 500).

## Security
- **JWT Authentication**: Protects routes to ensure only authenticated users can access certain resources.
- **Password Hashing**: bcrypt is used for secure password storage.
- **AWS S3**: Securely stores video files.

## Testing
Testing for API endpoints is implemented using **Jest** and **Supertest** to ensure expected functionality.

### Running Tests
```bash
npm test
```

## Contributing
1. Fork the project.
2. Create a new branch (`git checkout -b feature-branch`).
3. Commit your changes (`git commit -m 'Add feature'`).
4. Push to the branch (`git push origin feature-branch`).
5. Open a Pull Request.

## License
This project is licensed under the MIT License.
