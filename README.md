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
#🎁 Available Power-Ups

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


