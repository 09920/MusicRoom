# 🎶 MusicRoom

A real-time collaborative website where you and your friends listen to music together in sync in private rooms.

---

## ✨ Features Completed

- [x] **Stage 1: Real-Time Synced Playback & Room Management**
  - Instant room creation with shareable link (`/?room=id`) and optional 4-digit PIN.
  - YouTube IFrame API integration with Play, Pause, and Scrubber Seek synchronization.
  - Precise late-joiner calculation (friends joining late start at the exact current second).
  - 10-second sync heartbeat pulse to eliminate device drift.
  - "Tap to Join" modal to bypass mobile browser autoplay restrictions.
  - Playlist import (YouTube links, Spotify links, and 1-click presets) with Up Next Queue.

- [x] **Stage 2: In-Room Song Search & Instant Queueing**
  - Live debounced search for any song or artist.
  - Search results preview with thumbnails, channel names, and clean titles.
  - **Play Now** (switches whole room immediately) & **Add to Queue** (appends to upcoming tracks).
  - 24-hour server-side caching to preserve YouTube API quota.
  - Zero-setup public search fallback (works even without Google Cloud API key).

- [x] **Stage 3: Auto Mode (Radio)**
  - Automatically picks continuous music when the queue runs out so playback never stops.
  - Language-locked: picks from **Hindi**, **English**, or **Other Languages** based on room choice.
  - 50-song memory buffer to prevent repeating recent songs.
  - Synchronized Radio toggle in player controls.

- [x] **Stage 4: In-Room Live Chat & Mobile Experience**
  - Real-time in-room text chat with message timestamps and host badges.
  - Quick emoji reactions (`🔥`, `💃`, `❤️`, `🎶`, `🙌`).
  - Mobile-first dark theme with clean tabbed sidebar (Chat & Listeners list).

---

## 💻 Running Locally

### Step 1: Install Dependencies (already done)
```bash
# In the root folder:
npm run server   # Starts Express + Socket.IO backend on port 3000
npm run client   # Starts Vite + React frontend on port 5173
```
*(Tip: In development, restart the server terminal with `Ctrl + C` and `npm run server` whenever backend files are modified).*

---

## 📱 Testing with Friends on Mobile (Right Now!)

### Option A: Same Wi-Fi (No tools required)
1. Find your computer's local IP address (in PowerShell, run `ipconfig`, look for `IPv4 Address`, e.g. `192.168.1.15`).
2. Make sure your phone is connected to the same Wi-Fi.
3. On your phone's browser (preferably **Brave Browser** for an ad-free sync experience), open:
   `http://192.168.1.15:5173`
4. Join your room and listen together!

### Option B: Free ngrok (Public Link from anywhere)
1. In a new terminal, run:
   ```bash
   npx ngrok http 3000
   ```
2. ngrok will give you a temporary public URL like `https://abc123.ngrok-free.app`.
3. Send that link to your friends on WhatsApp!

---

## 🌐 Deploying Online to Render (Free, 24/7)

Render provides free hosting with full WebSocket (Socket.IO) support.

### 1. Push to GitHub
Create a GitHub repository and push your `MusicRoom` workspace:
```bash
git init
git add .
git commit -m "Complete MusicRoom with Sync, Search, Auto Mode and Chat"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/MusicRoom.git
git push -u origin main
```

### 2. Set Up on Render.com
1. Go to [render.com](https://render.com) and log in with GitHub.
2. Click **New +** $\rightarrow$ **Web Service**.
3. Select your `MusicRoom` repository.
4. Fill in the settings:
   * **Runtime:** Node
   * **Build Command:** `npm install && npm run build`
   * **Start Command:** `npm start`
   * **Instance Type:** Free
5. *(Optional)* Under **Environment Variables**, you can add:
   * `YOUTUBE_API_KEY` (if you have an official Google Cloud key, though our public fallback works out-of-the-box!)
6. Click **Create Web Service**.
7. In ~2 minutes, Render will provide a permanent URL like `https://musicroom-xyz.onrender.com`. Share it with your friends!
