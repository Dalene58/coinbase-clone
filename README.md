[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/fcRde9Vj)
# Coinbase Clone - React & Tailwind CSS Assignment

## 📋 Overview

In this assignment, you will build a full clone of the [Coinbase](https://www.coinbase.com/) website using **React.js** and **Tailwind CSS**. This project will help you practice component-based architecture, client-side routing, responsive design, and modern CSS utilities.

---

## 🚀 Getting Started

After accepting this assignment, follow these steps:

### 1. Clone Your Repository

```bash
git clone <your-repository-url>
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

---

### Technical Requirements

- [ ] Use **React Router** for client-side navigation
- [ ] Use **functional components** with React hooks
- [ ] Create **reusable components** (Button, Card, CryptoRow, etc.)
- [ ] Use **Tailwind CSS** for all styling (no external CSS frameworks)
- [ ] Implement **responsive design** (mobile, tablet, desktop)
- [ ] Use **React state management** (useState, useContext, or similar)
- [ ] Follow **proper file structure** and naming conventions
- [ ] Write **clean, readable code** with appropriate comments

---

## 📁 Project Structure

```
src/
├── assets/                 # Images, icons, and other static files
├── components/             # Reusable React components
│   ├── common/             # Shared components
│   ├── layout/
│   │   └── AppLayout.jsx
│   └── crypto/
│       ├── FeaturedGuideCard.jsx
│       └── LearningPathCard.jsx
├── pages/                  # Route page components
│   ├── Home.jsx
│   ├── Explore.jsx
│   ├── AssetDetail.jsx
│   ├── Learn.jsx
│   ├── LearnGuideDetail.jsx
│   ├── LearnPathDetail.jsx
│   ├── SignIn.jsx
│   ├── SignUp.jsx
│   └── LoadingScreen.jsx
├── data/                   # Shared data and API services
│   ├── coingecko.js
│   └── learnContent.js
├── hooks/                  # Custom hooks (optional)
├── App.jsx                 # Main application routing
├── App.css                 # Global styles (if needed)
├── main.jsx                # Application entry point
└── index.css               # Tailwind CSS imports
```

---

## 🎨 Design Reference

Visit [coinbase.com](https://www.coinbase.com/) 

- Overall layout and structure across all pages
- Consistent color scheme and typography
- Navigation flow between pages
- Responsive behavior on all screen sizes
- User interface patterns and interactions

---

## 💡 Helpful Resources

- [React Documentation](https://react.dev/)
- [React Router Documentation](https://reactrouter.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vite Documentation](https://vitejs.dev/)
- [Heroicons](https://heroicons.com/) - Free SVG icons
- [reacticons](https://react-icons.github.io/react-icons/) - Free SVG icons

---

## 🌐 Data Source

This project is frontend-only and fetches market data directly from the public **CoinCap API**.

Optional environment setting:

```dotenv
VITE_CRYPTO_API_BASE_URL=https://api.coincap.io/v2
```

Auth flows in the sign in/sign up screens are stored locally in browser `localStorage` for demo purposes.
