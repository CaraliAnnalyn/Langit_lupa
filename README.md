# 🌤️ Langit–Lupa | A Filipino Tag Game

**Langit–Lupa** is a modern web-based remake of the traditional Filipino children's game *Langit Lupa*.  
Players jump across platforms, avoid lava, and try to tag each other while staying safe on elevated surfaces — just like the original playground classic, now brought to life with JavaScript, HTML5 Canvas, and Node.js Express.

---

## 🎮 Game Overview

> “Langit–Lupa” is a traditional Filipino game of tag where players are **safe** from being tagged if they stand on an elevated surface (“**Langit**” or heaven),  
> while the player who is “it” remains on the ground (“**Lupa**” or earth).

This web version combines **nostalgia** with **modern design**, featuring pixel-style graphics, smooth animations, and support for both keyboard and mobile controls.

---

## ✨ Features

- 🕹️ **Local multiplayer** (keyboard or touch)
- 🎨 **Custom player names and colors**
- 🔥 **Dynamic platforms** — safe (blue) or dangerous (red)
- ⚡ **Power-ups:** Triple Jump, Speed, Shrink, Shield, Platform Freeze
- 🎮 **4 Game Modes:** Classic, Time Attack, Score Race, Survival
- 🏆 **Leaderboard & Achievements system**
- 🎵 **Sound and music toggle**
- 📱 **Mobile touch controls**
- ⚙️ **Node.js Express server for hosting**

---

## 🧠 Game Rules

- **Blue platforms** = Safe (*Langit*)  
- **Red platforms** = Lava (*Lupa*) — touching them means you’re out!  
- **Tag the other player** to make them “Taya” (It).  
- **Survive** as platforms switch every few seconds.  
- **Last player standing wins!**

---
## 🎁 Available Power-Ups

| Power-Up              | Symbol | Effect           | Duration (frames) | Description                                                                     |
| --------------------- | ------ | ---------------- | ----------------- | ------------------------------------------------------------------------------- |
| **Speed Boost**     | ⚡      | `speed`          | 300               | Increases player movement speed by 1.8× for faster dodging or chasing.          |
| **Invincibility**   | ★      | `invincible`     | 180               | Player becomes immune to damage and cannot be tagged.                           |
| **Triple Jump**     | ↑      | `tripleJump`     | 240               | Allows the player to jump up to three times consecutively.                      |
| **Shield**         | 🛡     | `shield`         | 240               | Absorbs one hit or tag without losing.                                          |
| **Shrink**          | ↓      | `shrink`         | 300               | Reduces player size to 60% for easier dodging and fitting through tight spaces. |
| **Platform Freeze** | ❄      | `platformFreeze` | 360               | Temporarily freezes all moving platforms, making navigation easier.             |

---

## 🧭 Controls

### Player 1
| Action | Key |
|--------|-----|
| Move | W / A / S / D |
| Jump | Space |
| Dash Left / Right | Q / E |

### Player 2
| Action | Key |
|--------|-----|
| Move | Arrow Keys |
| Jump | Shift |
| Dash Left / Right | , / . |

### Mobile Controls
- On-screen **joystick** for movement  
- **↑** for jump, **← →** for dash  

---

## ⚙️ Settings Menu

- ✅ **Toggle** Sound Effects and Music  
- ⚡ **Adjust** Platform Speed (Slow / Normal / Fast)  
- 🎁 **Set** Power-up Frequency (Rare / Normal / Common)

---

## 🏁 How to Play

1. Launch the game (`index.html`) in your browser.  
2. Click **Play Game** from the home screen.  
3. Choose your **Game Mode**.  
4. Enter player names and pick your colors.  
5. Tap **Start Game** and wait for the countdown!  
6. Survive, jump, and tag — may the best player win!

---

## 🛠️ Installation / Setup

### Option 1 — Local Play
Absolutely ✅ Here’s the **complete, polished “Option 1 — Local Play”** section for your `README.md` — fully written out with clear steps and brief explanations for each command.

You can copy and paste this directly under your **Installation / Setup** heading:

---

### 🖥️ Option 1 — Local Play

Follow these steps to run *Langit–Lupa* locally on your computer:

1. **Clone or download this repository:**

   ```bash
   git clone https://github.com/CaraliAnnalyn/Langit_lupa.git
   ```

   > This copies the project files from GitHub to your local machine.

2. **Navigate to the project directory:**

   ```bash
   cd Langit_lupa
   ```

   > This ensures all following commands are run inside the project folder.

3. **Install required dependencies:**

   ```bash
   npm install
   ```

   > This installs the necessary Node.js packages, including **Express**, which is used to run the game server.

4. **Start the local game server:**

   ```bash
   node server.js
   ```

   > This will start your local server and display logs like:

   ```
   🎮 Langit-Lupa game server running on http://0.0.0.0:5000
   📱 Mobile controls enabled for touch devices
   🏆 Achievement system ready
   ⚡ Performance optimized for 60 FPS
   ```

5. **Open your browser and play the game:**

   ```
   http://localhost:5000
   ```

   > Once the server is running, you can open this link in your browser to start playing.

---

✅ **Tip:**
If you want to stop the server, press **Ctrl + C** in your terminal.

---

Would you like me to follow this up with the **“Option 2 — Online Deployment”** section next (for hosting on Render, Vercel, or Replit)?
