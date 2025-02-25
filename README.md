Blog Platform
=============

Public URL: https://shunya-133n.onrender.com/

Overview
--------

This is a full-stack blog platform built with **Next.js with Tailwind (CSS)**, **Node.js**, **MongoDB**, and **Redis**. The platform allows users to create, edit, and delete blog posts, comment on posts, and manage their accounts with authentication and authorization.

Tech Stack
----------

*   **Frontend:** Next.js, Tailwind CSS
    
*   **Backend:** Node.js, Express, MongoDB, Redis, Supabase (for images)
    
*   **Authentication:** JSON Web Tokens
    
*   **Hosting:** Render (512MB RAM, 0.1 CPU)
    

Features
--------

### 1\. Landing Page – View All Blog Entries

*   Displays a list of all blog posts in chronological order (newest first).
    
*   Shows the post title, summary, and date posted.
    
*   Includes pagination to navigate between pages.

  ### 2\. Blog Post – Detail View

*   Displays the blog title, content, image.
    
*   Displays added comments.
    
*   Logged in user can add comments.

### 2\. Signup/Login

*   Users can sign up and log in.
    
*   After logging in, users are redirected to the landing page.
    
*   Logged-in users see their name and an account dropdown instead of login/signup options.
    

### 3\. Commenting Without Logging In

*   Users must log in before they can comment on a blog post.

*   Logged in users can update or delete their comments.
    

### 4\. Create a Blog Entry (For Logged-in Users)

*   Users can create a blog post with a title, content, and an optional image.
    
*   Input validation ensures required fields are filled.
    

### 5\. View My Submissions (For Logged-in Users)

*   Users can view all blog posts they have submitted from their account dropdown menu.
    

### 6\. Sign Out (For Logged-in Users)

*   Users can log out from the account dropdown menu.
    
*   Logging out redirects users to the landing page and removes their session.
    

### 7\. Edit or Delete My Posts (For Logged-in Users)

*   Users can edit or delete their own blog posts.
    
*   Edits update the blog post, and deletions remove it permanently.
    

### 8\. Pagination (For All Users)

*   Users can navigate between pages of blog posts using Next/Previous buttons.
    

Installation
------------

### Backend Setup


1. Clone the repository:
 ```sh
git clone <repository_url>
cd backend
```
2. Install dependencies:
 ```sh
npm install
```
3. Set up the .env file:
 ```sh
PORT=<PORT>
MONGO_URI=<your_mongodb_connection_string>
JWT_SECRET=<your_secret_key>
REDIS_URL=<your_redis_url>
SUPABASE_URL=<your_supabase_url>
SUPABASE_ANON_KEY=<your_supabase_anon_key>
```
4. Start the backend server:
 ```sh
npm run dev
``` 

### Frontend Setup

1. Navigate to the frontend directory:
```sh
cd frontend
```
2. Install dependencies:
```sh
npm install
```
3. Set in .env.local
```sh
NEXT_PUBLIC_API_URL=<your_backend_api_url>
```
4. Start the Next.js development server:
```sh
npm run dev
```

API Routes
----------

### **Auth Routes** (/api/auth)

```sh
*   POST /signup - Register a new user.
    
*   POST /login - Authenticate a user.
    
*   POST /logout - Log out the user.
```

### **Blog Routes** (/api/posts)

```sh
*   GET / - Fetch all blog posts.
    
*   POST / - Create a new blog post (requires authentication).

*   POST /my-submissions - View all your submitted blogs (requires authentication).

*   GET /:postId - Get a single blog post by ID.
    
*   PUT /:postId - Edit a blog post (requires authentication).
    
*   DELETE /:postId - Delete a blog post (requires authentication).
```
    

### **Comment Routes** (/api/posts/:postId/comments)

```sh
*   GET / - Fetch all comments on a post.
    
*   POST / - Add a comment to a post (requires authentication).

*   PUT /:commentId - Edit a comment (requires authentication).

*   DELETE /:commentId - Delete a comment (requires authentication).

```
    

Deployment
----------

*   **Frontend & Backend Hosting:** Render
    
*   **Database:** MongoDB Atlas, Supabase (for images)
    
*   **Cache:** Upstash Redis
    

Security Measures
-----------------

*   JWT-based authentication for secure API access.
    
*   Input validation using express-validator.
    
*   Protected routes to prevent unauthorized access.
    

Testing
-------

*   Unit tests are implemented for backend controllers and frontend landing page using **Jest**.
 ```sh   
npm run test
```
    

License
-------

This project is licensed under the MIT License.
