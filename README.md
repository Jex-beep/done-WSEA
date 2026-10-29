# 🚗 M&J Quality Used Cars - Premium Blog System

This is the official blog and content management module for the **M&J Quality Used Cars** showroom platform. Built with a modern Angular frontend and a robust Node.js/MongoDB backend, this system allows for seamless management of automotive articles, maintenance guides, and company news.

---

## 🛠 Tech Stack

### Backend
* **Runtime:** Node.js / Express
* **Database:** MongoDB via Mongoose
* **Security:** Bcrypt (Password Hashing), CORS, Dotenv
* **Features:** RESTful API, Image Base64 handling, Category Filtering

### Frontend
* **Framework:** Angular 17+ (Standalone Components)
* **Editor:** Quill (via `ngx-quill`) for Rich Text Article creation
* **Styling:** Custom CSS3 with Premium Dark Mode Editor UI
* **SEO:** Dynamic Meta Tag injection for Google/Social visibility

---

## 🚀 Installation & Setup

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) and [MongoDB](https://www.mongodb.com/) installed.

### 2. Backend Configuration
Navigate to your server directory and install dependencies:
```bash
# Install Backend dependencies
npm install express mongoose cors dotenv bcrypt

# MongoDB Connection String
MONGODB_URI=mongodb+srv://mjqualitycars:mjqualitycars2026@cluster0.intur8m.mongodb.net/mj_quality_cars?retryWrites=true&w=majority

# Server Port
PORT=3000

# Install Frontend dependencies
npm install ngx-quill quill
