# 👗 VELORA – AI-Powered Virtual Fashion Platform

> An AI-powered fashion platform that enables users to virtually try on clothing, organize their digital wardrobe, receive personalized fashion recommendations, and make smarter shopping decisions through an immersive and intelligent experience.

![React](https://img.shields.io/badge/React-Frontend-blue)
![Node.js](https://img.shields.io/badge/Node.js-Backend-green)
![Express](https://img.shields.io/badge/Express.js-API-black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?logo=postgresql&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Backend%20as%20a%20Service-3ECF8E?logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Frontend-Vercel-black?logo=vercel)
![Render](https://img.shields.io/badge/Backend-Render-46E3B7?logo=render)
![Status](https://img.shields.io/badge/Status-Live-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)

---

# 🌐 Live Deployment

### 🎨 Frontend (Vercel)

🔗 https://velora-kq5yjjmd9-het-pravin-visariyas-projects.vercel.app/

---

### ⚙️ Backend API (Render)

🔗 https://velora-h0r9.onrender.com

---

# 📖 Project Overview

VELORA is a full-stack AI-powered fashion platform built to redefine the online shopping experience by combining virtual fashion technology, intelligent recommendations, and wardrobe management into one seamless ecosystem.

Instead of relying only on product images and size charts, users can explore fashion more interactively by visualizing outfits, managing their personal wardrobe, and discovering styles tailored to their preferences.

The platform bridges the gap between customers and fashion brands by combining an intuitive frontend, scalable backend services, and a cloud-hosted PostgreSQL database through Supabase to deliver a seamless and personalized shopping experience.

---

# 🎯 Problem Statement

Online fashion shopping still faces several challenges:

- Customers cannot visualize how clothes might look on them.
- High return rates due to incorrect purchasing decisions.
- Difficulty managing purchased clothing.
- Lack of personalized recommendations.
- Time-consuming outfit selection.
- Fragmented shopping experiences across different brands.

These problems increase operational costs for brands while reducing customer satisfaction.

---

# 💡 Solution

VELORA addresses these challenges by creating an intelligent fashion ecosystem that combines AI, personalization, and modern web technologies.

The platform enables users to:

- Organize their digital wardrobe.
- Explore fashion collections.
- Receive AI-driven recommendations.
- Build outfits.
- Experience interactive shopping.
- Reduce uncertainty before purchasing.
- Make better fashion decisions.

---

# ✨ Key Features

## 👤 User Features

- User Authentication
- Secure Login & Registration
- Personal Dashboard
- Digital Wardrobe
- Outfit Management
- Fashion Discovery
- Wishlist
- Profile Management

---

## 🤖 AI Features

- Personalized Fashion Recommendations
- Intelligent Outfit Suggestions
- Style Matching
- Preference-Based Recommendations
- Smart Product Discovery
- AI-assisted Fashion Experience

---

## 🛍️ Shopping Features

- Product Browsing
- Product Details
- Category Filtering
- Search Functionality
- Wishlist
- Responsive Product Grid

---

## 🎨 UI / UX

- Modern Landing Page
- Fully Responsive
- Smooth Navigation
- Interactive Components
- Mobile Friendly
- Premium Design System
- Fast User Experience

---

# 🌍 Real-World Applications

VELORA can be adopted by:

- Fashion Brands
- Clothing Retailers
- E-commerce Platforms
- Fashion Startups
- Lifestyle Applications
- Personal Styling Services

The platform has the potential to improve customer engagement while reducing product returns through better purchase decisions.

---

# 🚀 Future Scope

The architecture has been designed to support future AI capabilities such as:

- AI Virtual Try-On
- Image-Based Outfit Generation
- Computer Vision Integration
- AR Clothing Preview
- Brand Marketplace
- Social Fashion Community
- AI Fashion Assistant
- Personalized Shopping Feed
- Voice-Based Fashion Search
- Smart Inventory Recommendations

---

# 🛠️ Technology Stack

## Frontend

- React.js
- JavaScript
- HTML5
- CSS3
- Tailwind CSS

---

## Backend

- Node.js
- Express.js

---

## Database

- PostgreSQL
- Supabase (Managed PostgreSQL)

---

## Backend Services

The application uses **Supabase** as its managed PostgreSQL platform, providing a secure and scalable cloud database for storing user information, product data, wardrobe details, authentication-related records, and application metadata.

### Services Used

- PostgreSQL Database
- Database Hosting
- Secure Cloud Infrastructure
- REST API Support
- Scalable Data Storage

## Deployment

- Vercel
- Render

---

## Development Tools

- Git
- GitHub
- VS Code
- npm

---

# 🏛️ System Architecture

```text
                User
                  │
                  ▼
        React Frontend (Vercel)
                  │
         REST API Requests
                  │
                  ▼
      Node.js + Express Backend
            (Hosted on Render)
                  │
                  ▼
     PostgreSQL Database (Supabase)
                  │
                  ▼
          Fashion & User Data

```

# 📂 Project Structure

```text
VELORA/

│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── context/
│   │   ├── services/
│   │   └── App.jsx
│
├── server/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── config/
│   ├── utils/
│   └── server.js
│
├── README.md
│
└── package.json
```

---

# ⚙️ Getting Started

## Clone the Repository

```bash
git clone https://github.com/het-visariya/VELORA.git
```

Move into the project

```bash
cd VELORA
```

---

## Install Frontend

```bash
cd client
npm install
```

Start Frontend

```bash
npm run dev
```

---

## Install Backend

```bash
cd ../server
npm install
```

Start Backend

```bash
npm run dev
```

---

## Environment Variables

Create a `.env` file inside the backend directory.

Example:

```env
DATABASE_URL=YOUR_SUPABASE_POSTGRES_CONNECTION_STRING

SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL

SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

JWT_SECRET=YOUR_SECRET_KEY

CLIENT_URL=http://localhost:5173
```

*(Add any additional environment variables required by your implementation.)*

---

# 📱 Responsive Design

The application is fully responsive and optimized for:

- ✅ Desktop
- ✅ Laptop
- ✅ Tablet
- ✅ Mobile

---

# 📈 Learning Outcomes

This project strengthened my knowledge of:

- Full Stack Development
- REST API Development
- Authentication Systems
- Responsive UI Development
- Modern React Architecture
- Backend API Design
- PostgreSQL Database Design
- Relational Database Modeling
- Supabase Integration
- Client-Server Communication
- Git Collaboration
- Cloud Deployment using Vercel & Render

---

# 🤝 Contributing

Contributions are welcome!

## Fork the repository

```bash
git fork https://github.com/het-visariya/VELORA.git
```

---

## Clone your fork

```bash
git clone https://github.com/<your-username>/VELORA.git
```

---

## Create a new branch

```bash
git checkout -b feature/your-feature
```

---

## Commit your changes

```bash
git commit -m "feat: add awesome feature"
```

---

## Push your branch

```bash
git push origin feature/your-feature
```

---

## Open a Pull Request

Describe:

- What you changed
- Why you changed it
- Screenshots (if UI changes)
- Testing performed

---

# 🚀 Deployment

### Frontend

Hosted on **Vercel**

🔗 https://velora-kq5yjjmd9-het-pravin-visariyas-projects.vercel.app/

---

### Backend

Hosted on **Render**

🔗 https://velora-h0r9.onrender.com

---

# 👨‍💻 Developed By

**Het Visariya**

Computer Engineering Student

Full Stack Developer • AI/ML Enthusiast • MERN Stack Developer

GitHub

https://github.com/het-visariya

LinkedIn

https://linkedin.com/in/het-visariya

---

# ⭐ Support

If you found this project useful or interesting, consider giving it a ⭐ on GitHub!

It helps showcase the project and motivates future improvements.
