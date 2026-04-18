# 💬 SyncChat – Frontend

A modern, real-time chat application built with the **MERN stack**. This repository contains the **frontend** codebase for SyncChat — a feature-rich messaging platform with instant messaging, group chats, file sharing, and more.

---

## 🔗 Links

* 🚀 **Live Demo:**
  https://chat-app-frontend-gules-one.vercel.app/

* 🐙 **GitHub Repository:**
  https://github.com/MuhammadShoaib20/Chat-App-Frontend

* 🖥️ **Backend API:**
  https://chat-app-backend-production-13f7.up.railway.app/api

---

## 🚀 Features

* ⚡ **Real-time messaging** (Socket.io)
  → Instant delivery, typing indicators, read receipts

* 👥 **Group chats**
  → Create groups, manage members, assign admins

* 📁 **File sharing**
  → Upload images/files with preview support

* 🔐 **Authentication**
  → JWT-based auth with protected routes

* 🌙 **Dark mode**
  → Light/Dark theme with `localStorage` persistence

* 😀 **Emoji picker**
  → Full emoji support with reactions

* ✏️ **Message actions**
  → Edit, delete, copy messages

* 🚫 **Block/Unblock users**
  → Control who can message you

* 📱 **Responsive design**
  → Works on mobile, tablet, desktop

* 🔔 **Offline support (optional)**
  → Service worker + push notifications

---

## 🛠️ Tech Stack

| Technology       | Purpose                 |
| ---------------- | ----------------------- |
| React 18         | UI Library              |
| Vite             | Build Tool              |
| Tailwind CSS     | Styling                 |
| React Router v7  | Routing                 |
| Socket.io-client | Real-time Communication |
| Axios            | API Requests            |
| React Hot Toast  | Notifications           |
| Emoji Mart       | Emoji Picker            |
| React Window     | Virtualization          |
| Date-fns         | Date Formatting         |

---

## 📦 Prerequisites

* Node.js **v18+**
* npm or yarn

---

## 🔧 Installation & Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/MuhammadShoaib20/Chat-App-Frontend.git
cd Chat-App-Frontend
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Setup Environment Variables

Create a `.env` file in root:

```env
VITE_API_URL=https://chat-app-backend-production-13f7.up.railway.app
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key
```

> Replace `VITE_API_URL` with your backend URL.

---

### 4️⃣ Run Development Server

```bash
npm run dev
```

👉 Open: http://localhost:5173

---

## 📁 Project Structure

```
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── chat/
│   │   ├── layout/
│   │   └── ErrorBoundary.jsx
│   ├── context/
│   ├── hooks/
│   ├── pages/
│   ├── services/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```

---

## 📜 Available Scripts

| Command         | Description              |
| --------------- | ------------------------ |
| npm run dev     | Start development server |
| npm run build   | Build for production     |
| npm run preview | Preview production build |
| npm run lint    | Run ESLint               |

---

## 🌐 Deployment (Vercel)

### Steps:

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variable:
   `VITE_API_URL` → your backend URL
4. Click **Deploy**

⚠️ **Important:**
Make sure backend allows your frontend domain (**CORS configured**).

---

## 🔐 Environment Variables

| Variable              | Description            | Required |
| --------------------- | ---------------------- | -------- |
| VITE_API_URL          | Backend API Base URL   | ✅ Yes    |
| VITE_VAPID_PUBLIC_KEY | Push Notifications Key | ❌ No     |

---

## 🤝 Contributing

Contributions are welcome!

* Open an issue
* Submit a pull request
* Discuss major changes first

---

## 📄 License

Licensed under the **MIT License**.

---

<div align="center">

❤️ Built with passion by
**Muhammad Shoaib**

</div>
