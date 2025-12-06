# 🔗 LinkMe: Talk and Tune In Together

![MERN Stack](https://img.shields.io/badge/MERN-Full%20Stack-blue)
![Socket.io](https://img.shields.io/badge/Socket.io-Real--Time-010101)
![Status](https://img.shields.io/badge/Status-Active-success)

**LinkMe** is a full-stack real-time messaging application designed to bridge the gap between communication and shared experiences. Unlike traditional chat apps, LinkMe introduces a **"Watch Together"** engine that allows users to watch YouTube videos in perfect synchronization while chatting.

---

## 🚀 Key Features

### 🎥 "Watch Together" (The USP)
- **Synchronized Playback:** When you press play, pause, or seek, your friend's player updates instantly.
- **Millisecond Latency:** Powered by **Socket.io** to ensure a lag-free shared viewing experience.
- **YouTube Integration:** Seamlessly search and play videos within the chat interface.

### 💬 Real-Time Communication
- **Instant Messaging:** Low-latency text delivery using WebSockets.
- **File Sharing:** Securely share images and documents (<10MB).
- **Live Status:** Real-time "Online" and "Last Seen" indicators.

### 🛡️ Secure & Social
- **Friend System:** Search users by unique username, send requests, and manage your friend list.
- **Privacy First:** Chat access is restricted to accepted friends only.
- **Authentication:** Secure login with JWT (JSON Web Tokens) and HTTP-Only cookies.
- **Password Recovery:** OTP-based email verification for forgotten passwords.

---

## 🛠️ Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React.js | Component-based UI with Hooks |
| **Backend** | Node.js & Express | RESTful API & Socket Server |
| **Database** | MongoDB | NoSQL Document Store |
| **Real-Time** | Socket.io | Bidirectional Event-Based Communication |
| **Styling** | CSS3 | Responsive Design |
| **Media** | YouTube Data API | Video Embedding & Control |

---


<img width="1869" height="977" alt="Screenshot 2025-11-30 111707" src="https://github.com/user-attachments/assets/2c013e49-c558-4a1e-ad15-4554cb9fd97b" />
<img width="1887" height="941" alt="Screenshot 2025-11-30 111824" src="https://github.com/user-attachments/assets/2bd786a3-4ea7-4846-87d8-af4d9bb4a3eb" />
<img width="1893" height="928" alt="Screenshot 2025-11-30 111742" src="https://github.com/user-attachments/assets/bf537466-50d4-4fc1-90eb-89099f66c07c" />
<img width="1912" height="987" alt="Screenshot 2025-11-30 112504" src="https://github.com/user-attachments/assets/431c3678-6767-4c77-b056-39e8bfe94a75" />
<img width="382" height="291" alt="Screenshot 2025-11-30 113324" src="https://github.com/user-attachments/assets/09c8433e-0210-43a2-a520-2e9d4876af4a" />
<img width="386" height="638" alt="Screenshot 2025-11-30 113204" src="https://github.com/user-attachments/assets/74ecb30a-24d1-4789-bbcf-93da67674d36" />

| **Login Page** | **Chat Interface** | **Watch Together** |
|:---:|:---:|:---:|
| ![Login](path/to/login-image.png) | ![Chat](path/to/chat-image.png) | ![Watch](path/to/watch-image.png) |

---

## ⚙️ Installation & Setup

Follow these steps to run the project locally.

### 1. Clone the Repository
```bash
#================================================
git clone [https://github.com/YOUR_USERNAME/LinkMe.git](https://github.com/YOUR_USERNAME/LinkMe.git)
cd LinkMe
cd server
#================================================
.env setup 
PORT=8080
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET_KEY=your_secret_key
FRONTEND_URL=http://localhost:5173
#==================================================
npm install
npm run dev
#frontend set up
#==================================================
cd ..
cd client
npm install
npm run dev
