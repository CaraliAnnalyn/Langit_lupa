const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
ctx.font = "12px 'Pixelify Sans'";
ctx.textAlign = "left";
ctx.imageSmoothingEnabled = false;

const confettiCanvas = document.getElementById("confettiCanvas");
const confettiCtx = confettiCanvas.getContext("2d");
let confettiParticles = [];

const particleCanvas = document.getElementById("particleCanvas");
const particleCtx = particleCanvas.getContext("2d");
let jumpParticles = [];

// Game constants
const PLAYER_FRAMES = 24;
const STONE_FRAMES = 16;
const SCALE = 1.5;
const SAFE_ZONE = {
  x: 40,
  y: 80,
  width: canvas.width - 80,
  height: canvas.height - 120,
};

// Physics constants
const GRAVITY = 0.6;
const JUMP_FORCE = -12;
const DOUBLE_JUMP_FORCE = -10;
const TERMINAL_VELOCITY = 15;
const GROUND_Y = 570;
const DASH_FORCE = 8;
const DASH_COOLDOWN = 120;

// Hitbox definitions
const PLAYER_BODY_HITBOX = { xOffset: 6, yOffset: 8, width: 12, height: 24 };
const STONE_HITBOX = { xOffset: 2, yOffset: 2, width: 76, height: 36 };

// Image preloading system
const player1Img = new Image();
const player2Img = new Image();
const stoneBlueImg = new Image();
const stoneRedImg = new Image();
const bgImg = new Image();

let imagesLoaded = 0;
const totalImages = 5;

function updateLoadingProgress() {
  const progress = (imagesLoaded / totalImages) * 100;
  const loadingBar = document.getElementById("loadingProgress");
  const loadingText = document.getElementById("loadingText");
  if (loadingBar) loadingBar.style.width = progress + "%";
  if (loadingText)
    loadingText.textContent = `Loading... ${Math.round(progress)}%`;

  if (imagesLoaded === totalImages) {
    setTimeout(() => {
      document.getElementById("loadingScreen").style.display = "none";
      document.getElementById("homeScreen").style.display = "flex";
    }, 500);
  }
}

player1Img.onload = () => {
  imagesLoaded++;
  updateLoadingProgress();
};
player1Img.onerror = () => {
  imagesLoaded++;
  updateLoadingProgress();
};
player1Img.src = "player1.png";

player2Img.onload = () => {
  imagesLoaded++;
  updateLoadingProgress();
};
player2Img.onerror = () => {
  imagesLoaded++;
  updateLoadingProgress();
};
player2Img.src = "player2.png";

stoneBlueImg.onload = () => {
  imagesLoaded++;
  updateLoadingProgress();
};
stoneBlueImg.onerror = () => {
  imagesLoaded++;
  updateLoadingProgress();
};
stoneBlueImg.src = "stone-blue.png";

stoneRedImg.onload = () => {
  imagesLoaded++;
  updateLoadingProgress();
};
stoneRedImg.onerror = () => {
  imagesLoaded++;
  updateLoadingProgress();
};
stoneRedImg.src = "stone-red.png";

bgImg.onload = () => {
  imagesLoaded++;
  updateLoadingProgress();
};
bgImg.onerror = () => {
  imagesLoaded++;
  updateLoadingProgress();
};
bgImg.src = "place.png";

// Game state
let players = [];
let gameRunning = false;
let paused = false;
let timeSurvived = 0;
let lastNames = [];
let lastColors = [];
let platformTimer = 0;
let platformInterval = 600;
let platformCountdown = platformInterval;
let platforms = [];
let powerUps = [];
let powerUpSpawnTimer = 0;
let POWERUP_SPAWN_INTERVAL = 300;
const scoreboard = document.getElementById("scoreboard");
const keys = {};

// Game modes
let currentGameMode = "classic";
const GAME_MODES = {
  classic: {
    name: "Classic",
    description:
      "Survive the longest. Avoid red platforms and tag your opponent!",
    winCondition: "longest_survival",
    timeLimit: null,
    scoreLimit: null,
  },
  timeAttack: {
    name: "Time Attack",
    description:
      "Survive for 60 seconds without getting tagged or touching lava!",
    winCondition: "survive_time",
    timeLimit: 3600,
    scoreLimit: null,
  },
  scoreRace: {
    name: "Score Race",
    description: "First to survive 30 seconds wins the race!",
    winCondition: "reach_score",
    timeLimit: null,
    scoreLimit: 1800,
  },
  survival: {
    name: "Survival",
    description: "How long can you survive? Platforms change faster!",
    winCondition: "endless_survival",
    timeLimit: null,
    scoreLimit: null,
    fastPlatforms: true,
  },
};

// Power-up types
const POWERUP_TYPES = {
  SPEED: {
    name: "Speed Boost",
    color: "#00ff00",
    duration: 300,
    effect: "speed",
    symbol: "⚡",
  },
  INVINCIBLE: {
    name: "Invincibility",
    color: "#ffd700",
    duration: 180,
    effect: "invincible",
    symbol: "★",
  },
  TRIPLE_JUMP: {
    name: "Triple Jump",
    color: "#9900ff",
    duration: 240,
    effect: "tripleJump",
    symbol: "↑",
  },
  SHIELD: {
    name: "Shield",
    color: "#00bfff",
    duration: 240,
    effect: "shield",
    symbol: "🛡",
  },
  SHRINK: {
    name: "Shrink",
    color: "#ff69b4",
    duration: 300,
    effect: "shrink",
    symbol: "↓",
  },
  PLATFORM_FREEZE: {
    name: "Platform Freeze",
    color: "#00ffff",
    duration: 360,
    effect: "platformFreeze",
    symbol: "❄",
  },
};

// Achievement System
const ACHIEVEMENTS = {
  FIRST_GAME: {
    id: "first_game",
    name: "First Steps",
    description: "Complete your first game",
    icon: "🎮",
    tier: "bronze",
  },
  SURVIVOR_30: {
    id: "survivor_30",
    name: "Survivor",
    description: "Survive 30 seconds in any mode",
    icon: "🏃",
    tier: "bronze",
  },
  SURVIVOR_60: {
    id: "survivor_60",
    name: "Veteran Survivor",
    description: "Survive 60 seconds",
    icon: "🦸",
    tier: "silver",
  },
  SURVIVOR_120: {
    id: "survivor_120",
    name: "Master Survivor",
    description: "Survive 120 seconds",
    icon: "👑",
    tier: "gold",
  },
  PLATFORM_DANCER: {
    id: "platform_dancer",
    name: "Platform Dancer",
    description: "Jump 50 times in one game",
    icon: "🕺",
    tier: "bronze",
  },
  DASH_MASTER: {
    id: "dash_master",
    name: "Dash Master",
    description: "Use dash 20 times successfully",
    icon: "⚡",
    tier: "silver",
  },
  TAG_CHAMPION: {
    id: "tag_champion",
    name: "Tag Champion",
    description: "Tag opponent 5 times in one game",
    icon: "🔥",
    tier: "gold",
  },
  UNTOUCHABLE: {
    id: "untouchable",
    name: "Untouchable",
    description: "Win without being tagged",
    icon: "🛡",
    tier: "silver",
  },
  SPEED_DEMON: {
    id: "speed_demon",
    name: "Speed Demon",
    description: "Collect 5 speed power-ups",
    icon: "💨",
    tier: "bronze",
  },
  SHIELD_EXPERT: {
    id: "shield_expert",
    name: "Shield Expert",
    description: "Collect 5 shield power-ups",
    icon: "🛡",
    tier: "bronze",
  },
  MODE_MASTER: {
    id: "mode_master",
    name: "Mode Master",
    description: "Win in all 4 game modes",
    icon: "🏆",
    tier: "platinum",
  },
  DEDICATION: {
    id: "dedication",
    name: "Dedication",
    description: "Play 50 total games",
    icon: "💪",
    tier: "gold",
  },
};

const ACHIEVEMENT_KEY = "langitLupaAchievements";

function getAchievementProgress() {
  const data = localStorage.getItem(ACHIEVEMENT_KEY);
  return data
    ? JSON.parse(data)
    : {
        unlocked: [],
        stats: {
          gamesPlayed: 0,
          totalJumps: 0,
          totalDashes: 0,
          totalTags: 0,
          speedPowerups: 0,
          shieldPowerups: 0,
          maxSurvivalTime: 0,
          modesWon: [],
        },
      };
}

function saveAchievementProgress(progress) {
  localStorage.setItem(ACHIEVEMENT_KEY, JSON.stringify(progress));
}

function unlockAchievement(achievementId) {
  const progress = getAchievementProgress();
  if (!progress.unlocked.includes(achievementId)) {
    progress.unlocked.push(achievementId);
    saveAchievementProgress(progress);
    showAchievementNotification(achievementId);
    playAchievementSound();
  }
}

function checkAchievements(gameStats) {
  const progress = getAchievementProgress();

  // Update stats
  progress.stats.gamesPlayed++;
  progress.stats.totalJumps += gameStats.jumps || 0;
  progress.stats.totalDashes += gameStats.dashes || 0;
  progress.stats.totalTags += gameStats.tags || 0;
  progress.stats.speedPowerups += gameStats.speedPowerups || 0;
  progress.stats.shieldPowerups += gameStats.shieldPowerups || 0;
  progress.stats.maxSurvivalTime = Math.max(
    progress.stats.maxSurvivalTime,
    gameStats.survivalTime || 0,
  );

  if (gameStats.won && !progress.stats.modesWon.includes(gameStats.mode)) {
    progress.stats.modesWon.push(gameStats.mode);
  }

  saveAchievementProgress(progress);

  // Check achievements
  if (progress.stats.gamesPlayed >= 1) unlockAchievement("first_game");
  if (progress.stats.maxSurvivalTime >= 1800) unlockAchievement("survivor_30");
  if (progress.stats.maxSurvivalTime >= 3600) unlockAchievement("survivor_60");
  if (progress.stats.maxSurvivalTime >= 7200) unlockAchievement("survivor_120");
  if (gameStats.jumps >= 50) unlockAchievement("platform_dancer");
  if (gameStats.dashes >= 20) unlockAchievement("dash_master");
  if (gameStats.tags >= 5) unlockAchievement("tag_champion");
  if (gameStats.won && gameStats.neverTagged) unlockAchievement("untouchable");
  if (progress.stats.speedPowerups >= 5) unlockAchievement("speed_demon");
  if (progress.stats.shieldPowerups >= 5) unlockAchievement("shield_expert");
  if (progress.stats.modesWon.length >= 4) unlockAchievement("mode_master");
  if (progress.stats.gamesPlayed >= 50) unlockAchievement("dedication");
}

function showAchievementNotification(achievementId) {
  const achievement = Object.values(ACHIEVEMENTS).find(
    (a) => a.id === achievementId,
  );
  if (!achievement) return;

  const notification = document.getElementById("achievementNotification");
  const icon = document.getElementById("achievementIcon");
  const name = document.getElementById("achievementName");
  const desc = document.getElementById("achievementDesc");

  icon.textContent = achievement.icon;
  name.textContent = achievement.name;
  desc.textContent = achievement.description;

  notification.className = `achievement-notification show ${achievement.tier}`;

  setTimeout(() => {
    notification.className = "achievement-notification";
  }, 3000);
}

function showAchievements() {
  // Refresh achievements from localStorage on every view
  const progress = getAchievementProgress();
  const screen = document.getElementById("achievementsScreen");
  const grid = document.getElementById("achievementsGrid");

  // Use DocumentFragment for efficient DOM updates
  const fragment = document.createDocumentFragment();
  
  Object.values(ACHIEVEMENTS).forEach((achievement) => {
    const unlocked = progress.unlocked.includes(achievement.id);
    const badge = document.createElement('div');
    badge.className = `achievement-badge ${unlocked ? "unlocked" : "locked"} ${achievement.tier}`;
    badge.innerHTML = `
      <div class="badge-icon">${unlocked ? achievement.icon : "🔒"}</div>
      <div class="badge-name">${achievement.name}</div>
      <div class="badge-desc">${achievement.description}</div>
    `;
    fragment.appendChild(badge);
  });

  grid.innerHTML = '';
  grid.appendChild(fragment);
  screen.style.display = "flex";
}

function hideAchievements() {
  document.getElementById("achievementsScreen").style.display = "none";
}

// Sound system
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let soundEnabled = true;
let musicEnabled = false;
let musicGainNode = null;

// Settings
let gameSettings = {
  platformSpeed: "normal",
  powerupFrequency: "normal",
};

function loadSettings() {
  const saved = localStorage.getItem("langitLupaSettings");
  if (saved) {
    gameSettings = JSON.parse(saved);
  }
}

function saveSettings() {
  localStorage.setItem("langitLupaSettings", JSON.stringify(gameSettings));
}

loadSettings();

// Leaderboard
const LEADERBOARD_KEY = "langitLupaLeaderboard";
const MAX_LEADERBOARD_ENTRIES = 10;

function getLeaderboard() {
  const data = localStorage.getItem(LEADERBOARD_KEY);
  return data ? JSON.parse(data) : [];
}

function saveToLeaderboard(playerName, survivalTime) {
  const leaderboard = getLeaderboard();
  const modeName = GAME_MODES[currentGameMode]?.name || "Classic";

  const entry = {
    name: playerName,
    time: survivalTime,
    mode: modeName,
    date: new Date().toISOString(),
  };

  leaderboard.push(entry);
  leaderboard.sort((a, b) => b.time - a.time);
  const trimmed = leaderboard.slice(0, MAX_LEADERBOARD_ENTRIES);

  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(trimmed));
  return trimmed;
}

function clearLeaderboard() {
  localStorage.removeItem(LEADERBOARD_KEY);
}

function showLeaderboard() {
  const leaderboard = getLeaderboard();
  const leaderboardScreen = document.getElementById("leaderboardScreen");
  const leaderboardList = document.getElementById("leaderboardList");

  if (leaderboard.length === 0) {
    leaderboardList.innerHTML =
      '<p style="text-align: center; color: #999; margin-top: 40px;">No high scores yet. Play to set a record!</p>';
  } else {
    // Use DocumentFragment for optimized DOM updates
    const fragment = document.createDocumentFragment();
    const container = document.createElement('div');
    container.className = 'leaderboard-entries';
    
    leaderboard.forEach((entry, index) => {
      const medal =
        index === 0
          ? "🥇"
          : index === 1
            ? "🥈"
            : index === 2
              ? "🥉"
              : `${index + 1}.`;
      const timeFormatted = (entry.time / 60).toFixed(1);
      const dateObj = new Date(entry.date);
      const dateStr = dateObj.toLocaleDateString();
      const modeBadge = entry.mode
        ? `<span class="mode-badge">${entry.mode}</span>`
        : "";

      const entryDiv = document.createElement('div');
      entryDiv.className = `leaderboard-entry ${index < 3 ? "top-three" : ""}`;
      entryDiv.innerHTML = `
        <span class="entry-rank">${medal}</span>
        <span class="entry-name">${entry.name} ${modeBadge}</span>
        <span class="entry-time">${timeFormatted}s</span>
        <span class="entry-date">${dateStr}</span>
      `;
      container.appendChild(entryDiv);
    });
    
    fragment.appendChild(container);
    leaderboardList.innerHTML = '';
    leaderboardList.appendChild(fragment);
  }

  leaderboardScreen.style.display = "flex";
}

function hideLeaderboard() {
  document.getElementById("leaderboardScreen").style.display = "none";
}

// =======================================
// Navigation Functions
// =======================================
function backToHome() {
  document.getElementById("modeScreen").style.display = "none";
  document.getElementById("homeScreen").style.display = "flex";
}

function backToModeSelect() {
  document.getElementById("nameScreen").style.display = "none";
  document.getElementById("modeScreen").style.display = "flex";
}

function goHomeFromGameOver() {
  document.getElementById("gameOverScreen").style.display = "none";
  document.getElementById("homeScreen").style.display = "flex";
  scoreboard.style.display = "none";
  const homeBtn = document.getElementById("homeBtn");
  if (homeBtn) homeBtn.style.display = "none";
}

function exitToHome() {
  if (!gameRunning) return;
  
  const confirmed = confirm("Are you sure you want to exit? Your game progress will be lost.");
  if (confirmed) {
    gameRunning = false;
    paused = false;
    
    // Hide game UI
    document.getElementById("pauseBtn").style.display = "none";
    scoreboard.style.display = "none";
    const homeBtn = document.getElementById("homeBtn");
    if (homeBtn) homeBtn.style.display = "none";
    const instructionsPanel = document.querySelector(".instructions-panel");
    if (instructionsPanel) instructionsPanel.style.display = "none";
    particleCanvas.style.display = "none";
    updateControlsVisibility();
    
    // Show home screen
    document.getElementById("homeScreen").style.display = "flex";
  }
}
// =======================================

function showSettings() {
  document.getElementById("homeScreen").style.display = "none";
  document.getElementById("settingsScreen").style.display = "flex";

  document.getElementById("soundToggle").checked = soundEnabled;
  document.getElementById("musicToggle").checked = musicEnabled;
  document.getElementById("platformSpeed").value = gameSettings.platformSpeed;
  document.getElementById("powerupFrequency").value =
    gameSettings.powerupFrequency;
}

function hideSettings() {
  document.getElementById("settingsScreen").style.display = "none";
  document.getElementById("homeScreen").style.display = "flex";
  saveSettings();
}

function toggleSound() {
  soundEnabled = document.getElementById("soundToggle").checked;
}

function toggleMusic() {
  musicEnabled = document.getElementById("musicToggle").checked;
  if (musicEnabled) {
    startBackgroundMusic();
  } else {
    stopBackgroundMusic();
  }
}

function updatePlatformSpeed() {
  gameSettings.platformSpeed = document.getElementById("platformSpeed").value;
}

function updatePowerupFrequency() {
  gameSettings.powerupFrequency =
    document.getElementById("powerupFrequency").value;
}

function startBackgroundMusic() {
  if (!musicEnabled || musicGainNode) return;

  musicGainNode = audioContext.createGain();
  musicGainNode.gain.value = 0.05;
  musicGainNode.connect(audioContext.destination);

  const notes = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25];
  const melody = [0, 2, 4, 2, 0, 2, 4, 2, 4, 5, 6, 4, 5, 6];
  let noteIndex = 0;

  function playNextNote() {
    if (!musicEnabled) return;

    const osc = audioContext.createOscillator();
    osc.type = "sine";
    osc.frequency.value = notes[melody[noteIndex % melody.length]];

    const noteGain = audioContext.createGain();
    noteGain.gain.setValueAtTime(0.03, audioContext.currentTime);
    noteGain.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime + 0.4,
    );

    osc.connect(noteGain);
    noteGain.connect(musicGainNode);

    osc.start(audioContext.currentTime);
    osc.stop(audioContext.currentTime + 0.4);

    noteIndex++;
    setTimeout(playNextNote, 400);
  }

  playNextNote();
}

function stopBackgroundMusic() {
  if (musicGainNode) {
    musicGainNode.disconnect();
    musicGainNode = null;
  }
}

function playSound(frequency, duration, type = "sine", volume = 0.3) {
  if (!soundEnabled) return;

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = frequency;
  oscillator.type = type;

  gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(
    0.01,
    audioContext.currentTime + duration,
  );

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
}

function playJumpSound(isDoubleJump = false) {
  if (isDoubleJump) {
    playSound(600, 0.1, "square", 0.2);
    setTimeout(() => playSound(800, 0.1, "square", 0.15), 50);
  } else {
    playSound(400, 0.15, "sine", 0.2);
  }
}

function playLandSound() {
  playSound(200, 0.08, "sine", 0.15);
}

function playDashSound() {
  playSound(300, 0.1, "sawtooth", 0.2);
  setTimeout(() => playSound(500, 0.05, "sawtooth", 0.15), 40);
}

function playTagSound() {
  playSound(800, 0.1, "triangle", 0.25);
  setTimeout(() => playSound(600, 0.1, "triangle", 0.2), 80);
  setTimeout(() => playSound(900, 0.15, "triangle", 0.25), 150);
}

function playGameOverSound() {
  playSound(400, 0.15, "sine", 0.2);
  setTimeout(() => playSound(350, 0.15, "sine", 0.2), 100);
  setTimeout(() => playSound(300, 0.3, "sine", 0.25), 200);
}

function playPowerUpSound() {
  for (let i = 0; i < 4; i++) {
    setTimeout(() => playSound(400 + i * 200, 0.1, "triangle", 0.2), i * 50);
  }
}

function playAchievementSound() {
  for (let i = 0; i < 3; i++) {
    setTimeout(() => playSound(500 + i * 150, 0.15, "triangle", 0.25), i * 100);
  }
}

// Input handling
document.addEventListener("keydown", (e) => {
  keys[e.code] = true;

  if (
    !gameRunning &&
    document.getElementById("gameOverScreen").style.display === "flex"
  ) {
    if (e.code === "KeyR") replayGame();
    if (e.code === "KeyN") newPlayer();
  }
  if (e.code === "KeyP" && gameRunning) togglePause();
  if (e.code === "KeyE" && gameRunning) {
    const winner =
      players[0].survived > players[1].survived ? players[0] : players[1];
    gameOver("Game ended by players.", winner.name);
  }
});

document.addEventListener("keyup", (e) => (keys[e.code] = false));

  // Button controls
  function addButtonListeners(btn, controlKey) {
    if (!btn) return;

    btn.addEventListener("touchstart", (e) => {
      e.preventDefault();
      touchControls[controlKey] = true;
      btn.classList.add("active");
    });

    btn.addEventListener("touchend", (e) => {
      e.preventDefault();
      touchControls[controlKey] = false;
      btn.classList.remove("active");
    });

    btn.addEventListener("touchcancel", (e) => {
      e.preventDefault();
      touchControls[controlKey] = false;
      btn.classList.remove("active");
    });
  }

  addButtonListeners(jumpBtn, "jump");
  addButtonListeners(dashLeftBtn, "dashLeft");
  addButtonListeners(dashRightBtn, "dashRight");
}

// Show/hide mobile controls
function updateControlsVisibility() {
  const mobileControls = document.getElementById("mobileControls");
  if (mobileControls) {
    mobileControls.style.display = gameRunning && isMobile ? "block" : "none";
  }
}

// Helper functions
function getPlayerBodyRect(p) {
  return {
    x: p.x + PLAYER_BODY_HITBOX.xOffset * SCALE,
    y: p.y + PLAYER_BODY_HITBOX.yOffset * SCALE,
    w: PLAYER_BODY_HITBOX.width * SCALE,
    h: PLAYER_BODY_HITBOX.height * SCALE,
  };
}

function getPlayerFeet(p) {
  const bodyRect = getPlayerBodyRect(p);
  return {
    x: bodyRect.x,
    y: bodyRect.y + bodyRect.h,
    w: bodyRect.w,
    centerX: bodyRect.x + bodyRect.w / 2,
  };
}

function getStoneRect(pl) {
  return {
    x: pl.x + STONE_HITBOX.xOffset * SCALE,
    y: pl.y + STONE_HITBOX.yOffset * SCALE,
    w: STONE_HITBOX.width * SCALE,
    h: STONE_HITBOX.height * SCALE,
  };
}

function rectCollision(a, b) {
  return (
    a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
  );
}

function randomizePlatforms() {
  platforms = [];

  const heightLevels = [
    SAFE_ZONE.y + 60,
    SAFE_ZONE.y + 150,
    SAFE_ZONE.y + 250,
    SAFE_ZONE.y + 350,
    SAFE_ZONE.y + 450,
  ];

  for (let i = 0; i < 8; i++) {
    let newPlat = null,
      safe = false,
      attempts = 0;

    while (!safe && attempts < 100) {
      const heightLevel =
        heightLevels[Math.floor(Math.random() * heightLevels.length)];
      const randType = Math.random();
      const platformType =
        randType < 0.1 ? "moving" : randType < 0.15 ? "disappearing" : "static";

      newPlat = {
        x: SAFE_ZONE.x + Math.floor(Math.random() * (SAFE_ZONE.width - 80)),
        y: heightLevel + (Math.random() * 40 - 20),
        w: 80,
        h: 40,
        safe: Math.random() < 0.6,
        frame: Math.floor(Math.random() * STONE_FRAMES),
        type: platformType,
        moveSpeed: platformType === "moving" ? 1 + Math.random() : 0,
        moveDirection: Math.random() < 0.5 ? 1 : -1,
        initialX: 0,
        visible: true,
        disappearTimer: 0,
        disappearCycle: 180,
      };

      newPlat.initialX = newPlat.x;

      safe = platforms.every(
        (pl) =>
          Math.abs(pl.x - newPlat.x) > 70 || Math.abs(pl.y - newPlat.y) > 60,
      );
      attempts++;
    }

    if (newPlat) platforms.push(newPlat);
  }

  const safeCount = platforms.filter((p) => p.safe).length;
  if (safeCount < 2) {
    platforms.slice(0, 2).forEach((p) => (p.safe = true));
  }
}

function spawnPowerUp() {
  const safePlatforms = platforms.filter((p) => p.safe);
  if (safePlatforms.length === 0) return;

  const platform =
    safePlatforms[Math.floor(Math.random() * safePlatforms.length)];
  const types = Object.values(POWERUP_TYPES);
  const type = types[Math.floor(Math.random() * types.length)];

  powerUps.push({
    x: platform.x + platform.w / 2,
    y: platform.y + 10,
    type: type,
    radius: 12,
    collected: false,
    pulsePhase: 0,
  });
}

function applyPowerUp(player, powerUp) {
  const effect = powerUp.type.effect;
  player.powerUps[effect] = powerUp.type.duration;

  if (effect === "tripleJump") {
    player.maxJumps = 3;
    player.jumpsRemaining = Math.min(player.jumpsRemaining + 1, 3);
  } else if (effect === "speed") {
    player.speedMultiplier = 1.5;
    player.gameStats.speedPowerups = (player.gameStats.speedPowerups || 0) + 1;
  } else if (effect === "shrink") {
    player.sizeMultiplier = 0.7;
  } else if (effect === "platformFreeze") {
    platformTimer = 0;
  } else if (effect === "shield") {
    player.gameStats.shieldPowerups =
      (player.gameStats.shieldPowerups || 0) + 1;
  }

  playPowerUpSound();
}

function updatePlayerPowerUps(player) {
  Object.keys(player.powerUps).forEach((effect) => {
    player.powerUps[effect]--;

    if (player.powerUps[effect] <= 0) {
      delete player.powerUps[effect];

      if (effect === "tripleJump") {
        player.maxJumps = 2;
        player.jumpsRemaining = Math.min(player.jumpsRemaining, 2);
      } else if (effect === "speed") {
        player.speedMultiplier = 1;
      } else if (effect === "shrink") {
        player.sizeMultiplier = 1;
      }
    }
  });
}

function createJumpParticles(x, y, isDoubleJump = false) {
  const particleCount = isDoubleJump ? 12 : 8;
  const hueBase = isDoubleJump ? 280 : 180;

  for (let i = 0; i < particleCount; i++) {
    jumpParticles.push({
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * (isDoubleJump ? 6 : 4),
      vy: Math.random() * (isDoubleJump ? 3 : 2) + 1,
      life: isDoubleJump ? 40 : 30,
      maxLife: isDoubleJump ? 40 : 30,
      color: `hsl(${Math.random() * 60 + hueBase}, 70%, 60%)`,
    });
  }
}

function createDashParticles(x, y, direction) {
  for (let i = 0; i < 15; i++) {
    jumpParticles.push({
      x: x,
      y: y + Math.random() * 20 - 10,
      vx: -direction * (Math.random() * 3 + 2),
      vy: (Math.random() - 0.5) * 2,
      life: 25,
      maxLife: 25,
      color: `hsl(${Math.random() * 60 + 30}, 100%, 60%)`,
    });
  }
}

function updateAndDrawParticles() {
  particleCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);

  jumpParticles = jumpParticles.filter((p) => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.2;
    p.life--;

    const alpha = p.life / p.maxLife;
    particleCtx.fillStyle = p.color
      .replace(")", `, ${alpha})`)
      .replace("hsl", "hsla");
    particleCtx.beginPath();
    particleCtx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    particleCtx.fill();

    return p.life > 0;
  });
}

function createConfetti() {
  confettiParticles = [];
  for (let i = 0; i < 100; i++) {
    confettiParticles.push({
      x: Math.random() * confettiCanvas.width,
      y: (Math.random() * confettiCanvas.height) / 2 - 50,
      r: Math.random() * 6 + 2,
      d: Math.random() * 10 + 5,
      color: `hsl(${Math.random() * 360}, 100%, 50%)`,
      tilt: Math.random() * 10 - 5,
      tiltAngleIncrement: Math.random() * 0.07 + 0.05,
    });
  }
}

function drawConfetti() {
  confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  confettiParticles.forEach((p) => {
    confettiCtx.beginPath();
    confettiCtx.lineWidth = p.r;
    confettiCtx.strokeStyle = p.color;
    confettiCtx.moveTo(p.x + p.tilt + p.r / 2, p.y);
    confettiCtx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
    confettiCtx.stroke();

    p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
    p.x += Math.sin(p.d);
    p.tiltAngleIncrement += 0.01;
    p.tilt = Math.sin(p.tiltAngleIncrement) * 10;

    if (p.y > confettiCanvas.height) p.y = -10;
  });
}

function animateConfetti(duration = 2000) {
  confettiCanvas.style.display = "block";
  createConfetti();
  const start = performance.now();

  function loop(time) {
    drawConfetti();
    if (time - start < duration) {
      requestAnimationFrame(loop);
    } else {
      confettiCanvas.style.display = "none";
    }
  }
  requestAnimationFrame(loop);
}

function showTagNotice(name) {
  const notice = document.getElementById("taggerNotice");
  notice.textContent = `🔥 TAGGER: ${name} 🔥`;
  notice.style.display = "block";
  animateConfetti(1500);
  setTimeout(() => {
    notice.style.display = "none";
  }, 2000);
}

function showModeSelect() {
  document.getElementById("homeScreen").style.display = "none";
  document.getElementById("modeScreen").style.display = "flex";

  const modeOptions = document.querySelectorAll(".mode-option");
  modeOptions.forEach((option) => {
    option.onclick = () => {
      currentGameMode = option.dataset.mode;
      modeOptions.forEach((opt) => opt.classList.remove("selected"));
      option.classList.add("selected");
      setTimeout(() => {
        document.getElementById("modeScreen").style.display = "none";
        document.getElementById("nameScreen").style.display = "flex";
      }, 300);
    };
  });
}

function startCountdown() {
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  const overlay = document.getElementById("countdownOverlay");
  const randomTagger = Math.random() < 0.5 ? 0 : 1;

  players = [
    {
      name: document.getElementById("player1Name").value || "Player 1",
      color: document.getElementById("player1Color").value,
      x: 120,
      y: GROUND_Y,
      vx: 0,
      vy: 0,
      isTaya: randomTagger === 0,
      frame: 0,
      survived: 0,
      onGround: true,
      jumping: false,
      jumpsRemaining: 2,
      dashCooldown: 0,
      facingRight: true,
      powerUps: {},
      maxJumps: 2,
      speedMultiplier: 1,
      sizeMultiplier: 1,
      wasTagged: false,
      gameStats: {
        jumps: 0,
        dashes: 0,
        tags: 0,
        speedPowerups: 0,
        shieldPowerups: 0,
      },
    },
    {
      name: document.getElementById("player2Name").value || "Player 2",
      color: document.getElementById("player2Color").value,
      x: 260,
      y: GROUND_Y,
      vx: 0,
      vy: 0,
      isTaya: randomTagger === 1,
      frame: 0,
      survived: 0,
      onGround: true,
      jumping: false,
      jumpsRemaining: 2,
      dashCooldown: 0,
      facingRight: true,
      powerUps: {},
      maxJumps: 2,
      speedMultiplier: 1,
      sizeMultiplier: 1,
      wasTagged: false,
      gameStats: {
        jumps: 0,
        dashes: 0,
        tags: 0,
        speedPowerups: 0,
        shieldPowerups: 0,
      },
    },
  ];

  lastNames = [players[0].name, players[1].name];
  lastColors = [players[0].color, players[1].color];
  showTagNotice(players[randomTagger].name);

  document.getElementById("nameScreen").style.display = "none";

  setTimeout(() => {
    let count = 3;
    overlay.textContent = count;
    overlay.style.display = "flex";

    const interval = setInterval(() => {
      count--;
      if (count === 0) {
        overlay.textContent = "Go!";
      } else if (count < 0) {
        overlay.style.display = "none";
        clearInterval(interval);
        startGame();
      } else {
        overlay.textContent = count;
      }
    }, 1000);
  }, 2000);
}

function startGame() {
  timeSurvived = 0;
  platformTimer = 0;

  const mode = GAME_MODES[currentGameMode];
  let baseInterval = mode.fastPlatforms ? 300 : 600;

  if (gameSettings.platformSpeed === "slow") baseInterval = 600;
  else if (gameSettings.platformSpeed === "fast") baseInterval = 300;

  platformInterval = baseInterval;
  platformCountdown = platformInterval;

  if (gameSettings.powerupFrequency === "rare") {
    POWERUP_SPAWN_INTERVAL = 600;
  } else if (gameSettings.powerupFrequency === "common") {
    POWERUP_SPAWN_INTERVAL = 180;
  } else {
    POWERUP_SPAWN_INTERVAL = 300;
  }

  powerUps = [];
  powerUpSpawnTimer = 0;
  randomizePlatforms();

  document.getElementById("pauseBtn").style.display = "block";
  scoreboard.style.display = "block";
  particleCanvas.style.display = "block";
  const homeBtn = document.getElementById("homeBtn");
  if (homeBtn) homeBtn.style.display = "block";
  document.querySelector(".instructions-panel").style.display = "block";

  paused = false;
  gameRunning = true;

  setupTouchControls();
  updateControlsVisibility();

  requestAnimationFrame(gameLoop);
}

function update() {
  timeSurvived++;

  // Check win conditions
  const mode = GAME_MODES[currentGameMode];

  if (mode.timeLimit && timeSurvived >= mode.timeLimit) {
    const notTaya = players.find((p) => !p.isTaya);
    if (notTaya) {
      gameOver(`Time's up! ${notTaya.name} survived!`, notTaya.name, true);
      return;
    }
  }

  if (mode.scoreLimit) {
    const reachedScore = players.find(
      (p) => !p.isTaya && p.survived >= mode.scoreLimit,
    );
    if (reachedScore) {
      gameOver(
        `${reachedScore.name} reached the target!`,
        reachedScore.name,
        true,
      );
      return;
    }
  }

  players.forEach((p, idx) => {
    if (!p.isTaya) p.survived++;

    // Handle input based on player index and mobile controls
    let moveLeft = false,
      moveRight = false,
      jump = false,
      dashLeft = false,
      dashRight = false;

    if (idx === 0) {
      if (isMobile && touchControls.joystick.active) {
        moveLeft = touchControls.joystick.currentX < -0.3;
        moveRight = touchControls.joystick.currentX > 0.3;
        jump = touchControls.jump;
        dashLeft = touchControls.dashLeft;
        dashRight = touchControls.dashRight;
        touchControls.jump = false;
        touchControls.dashLeft = false;
        touchControls.dashRight = false;
      } else {
        moveLeft = keys["KeyA"] || keys["ArrowLeft"];
        moveRight = keys["KeyD"] || keys["ArrowRight"];
        jump = keys["KeyW"] || keys["Space"] || keys["ArrowUp"];
        dashLeft = keys["KeyQ"] || keys["Comma"];
        dashRight = keys["KeyE"] || keys["Period"];
      }
    } else {
      if (isMobile && !touchControls.joystick.active) {
        // Player 2 uses keyboard on mobile if available
        moveLeft = keys["ArrowLeft"];
        moveRight = keys["ArrowRight"];
        jump = keys["ArrowUp"];
        dashLeft = keys["Comma"];
        dashRight = keys["Period"];
      } else {
        moveLeft = keys["ArrowLeft"];
        moveRight = keys["ArrowRight"];
        jump = keys["ArrowUp"] || keys["ShiftRight"];
        dashLeft = keys["Comma"];
        dashRight = keys["Period"];
      }
    }

    // Horizontal movement
    const moveSpeed = 3 * p.speedMultiplier;
    if (moveLeft) {
      p.vx = -moveSpeed;
      p.facingRight = false;
    } else if (moveRight) {
      p.vx = moveSpeed;
      p.facingRight = true;
    } else {
      p.vx = 0;
    }

    p.x += p.vx;

    // Dash
    if (p.dashCooldown > 0) p.dashCooldown--;

    if ((dashLeft || dashRight) && p.dashCooldown === 0) {
      const dashDir = dashLeft ? -1 : 1;
      p.vx = DASH_FORCE * dashDir * p.speedMultiplier;
      p.x += p.vx * 2;
      p.dashCooldown = DASH_COOLDOWN;
      createDashParticles(p.x + 12, p.y + 16, dashDir);
      playDashSound();
      p.gameStats.dashes++;
    }

    // Jumping
    if (jump && !p.jumping && p.jumpsRemaining > 0) {
      const isDoubleJump = p.jumpsRemaining < p.maxJumps;
      p.vy = isDoubleJump ? DOUBLE_JUMP_FORCE : JUMP_FORCE;
      p.jumping = true;
      p.jumpsRemaining--;
      createJumpParticles(p.x + 12, p.y + 32, isDoubleJump);
      playJumpSound(isDoubleJump);
      p.gameStats.jumps++;
    }

    if (!jump) p.jumping = false;

    // Gravity
    p.vy += GRAVITY;
    if (p.vy > TERMINAL_VELOCITY) p.vy = TERMINAL_VELOCITY;
    p.y += p.vy;

    // Ground collision
    const wasInAir = !p.onGround;
    p.onGround = false;

    if (p.y >= GROUND_Y) {
      p.y = GROUND_Y;
      p.vy = 0;
      p.onGround = true;
      p.jumpsRemaining = p.maxJumps;
      if (wasInAir) playLandSound();
    }

    // Platform collisions
    platforms.forEach((platform) => {
      if (platform.type === "disappearing" && !platform.visible) return;

      const stoneRect = getStoneRect(platform);
      const feet = getPlayerFeet(p);

      const feetRect = { x: feet.x, y: feet.y - 5, w: feet.w, h: 5 };

      if (rectCollision(feetRect, stoneRect) && p.vy >= 0) {
        if (platform.safe) {
          p.y = stoneRect.y - 32 * SCALE + PLAYER_BODY_HITBOX.yOffset * SCALE;
          p.vy = 0;
          p.onGround = true;
          p.jumpsRemaining = p.maxJumps;
          if (wasInAir) playLandSound();
        } else {
          const isProtected = p.powerUps.invincible || p.powerUps.shield;
          if (!isProtected) {
            gameOver(
              `${p.name} touched lava!`,
              players.find((other) => other !== p).name,
            );
          } else if (p.powerUps.shield) {
            delete p.powerUps.shield;
            createJumpParticles(p.x + 12, p.y + 16, true);
          }
        }
      }
    });

    // Animation
    if (p.vx !== 0) p.frame = (p.frame + 0.2) % PLAYER_FRAMES;

    // Power-ups
    updatePlayerPowerUps(p);
  });

  // Player collision (tagging)
  if (
    Math.abs(players[0].x - players[1].x) < 20 &&
    Math.abs(players[0].y - players[1].y) < 30
  ) {
    const taya = players.find((p) => p.isTaya);
    const other = players.find((p) => !p.isTaya);

    if (taya && other && !other.powerUps.invincible) {
      taya.isTaya = false;
      other.isTaya = true;
      other.wasTagged = true;
      taya.gameStats.tags++;
      showTagNotice(other.name);
      playTagSound();
    }
  }

  // Power-up collection
  powerUps.forEach((powerUp) => {
    if (powerUp.collected) return;

    players.forEach((p) => {
      const bodyRect = getPlayerBodyRect(p);
      const dist = Math.sqrt(
        Math.pow(powerUp.x - (bodyRect.x + bodyRect.w / 2), 2) +
          Math.pow(powerUp.y - (bodyRect.y + bodyRect.h / 2), 2),
      );

      if (dist < powerUp.radius + 15) {
        powerUp.collected = true;
        applyPowerUp(p, powerUp);
      }
    });
  });

  powerUps = powerUps.filter((p) => !p.collected);

  powerUpSpawnTimer++;
  if (powerUpSpawnTimer >= POWERUP_SPAWN_INTERVAL) {
    spawnPowerUp();
    powerUpSpawnTimer = 0;
  }

  // Keep players in safe zone
  players.forEach((p) => {
    const rect = getPlayerBodyRect(p);
    if (rect.x < SAFE_ZONE.x)
      p.x = SAFE_ZONE.x - PLAYER_BODY_HITBOX.xOffset * SCALE;
    if (rect.x + rect.w > SAFE_ZONE.x + SAFE_ZONE.width) {
      p.x =
        SAFE_ZONE.x +
        SAFE_ZONE.width -
        rect.w -
        PLAYER_BODY_HITBOX.xOffset * SCALE;
    }
    if (rect.y < SAFE_ZONE.y)
      p.y = SAFE_ZONE.y - PLAYER_BODY_HITBOX.yOffset * SCALE;
  });

  // Platform updates
  const platformFrozen = players.some((p) => p.powerUps.platformFreeze > 0);

  if (!platformFrozen) {
    platformTimer++;
    if (platformTimer >= platformInterval) {
      randomizePlatforms();
      platformTimer = 0;
      platformCountdown = platformInterval;
    } else {
      platformCountdown = platformInterval - platformTimer;
    }
  }

  platforms.forEach((pl) => {
    if (pl.type === "moving") {
      pl.x += pl.moveSpeed * pl.moveDirection;

      if (pl.x < SAFE_ZONE.x || pl.x + pl.w > SAFE_ZONE.x + SAFE_ZONE.width) {
        pl.moveDirection *= -1;
      }
    }

    if (pl.type === "disappearing") {
      pl.disappearTimer++;
      if (pl.disappearTimer >= pl.disappearCycle) {
        pl.visible = !pl.visible;
        pl.disappearTimer = 0;
      }
    }
  });

  updateAndDrawParticles();
}

function gameOver(msg, winnerName = null, won = false) {
  gameRunning = false;
  document.getElementById("pauseBtn").style.display = "none";
  const homeBtn = document.getElementById("homeBtn");
  if (homeBtn) homeBtn.style.display = "none";
  document.querySelector(".instructions-panel").style.display = "none";
  particleCanvas.style.display = "none";
  updateControlsVisibility();
  playGameOverSound();

  // Track achievements
  if (winnerName) {
    const winner = players.find((p) => p.name === winnerName);
    if (winner) {
      saveToLeaderboard(winnerName, winner.survived);

      const gameStats = {
        survivalTime: winner.survived,
        mode: currentGameMode,
        won: won,
        neverTagged: !winner.wasTagged,
        jumps: winner.gameStats.jumps,
        dashes: winner.gameStats.dashes,
        tags: winner.gameStats.tags,
        speedPowerups: winner.gameStats.speedPowerups,
        shieldPowerups: winner.gameStats.shieldPowerups,
      };

      checkAchievements(gameStats);
    }
  }

  let html = `<p style="font-size: 16px; line-height: 1.6;">${msg}</p>`;
  if (winnerName) {
    html += `<p style="font-size: 22px; color: #ffd700; font-weight: 700; margin: 15px 0;">🏆 Winner: ${winnerName} 🏆</p>`;
  }

  html += '<div class="final-stats">';
  players.forEach((p) => {
    html += `<p><b>${p.name}:</b> ${(p.survived / 60).toFixed(1)}s survived</p>`;
  });
  html += "</div>";

  document.getElementById("gameOverMessage").innerHTML = html;
  document.getElementById("gameOverScreen").style.display = "flex";
}

if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.beginPath();
    this.moveTo(x + r, y);
    this.arcTo(x + w, y, x + w, y + h, r);
    this.arcTo(x + w, y + h, x, y + h, r);
    this.arcTo(x, y + h, x, y, r);
    this.arcTo(x, y, x + w, y, r);
    this.closePath();
    return this;
  };
}

function drawPlayer(p, img) {
  const frameW = img.width / PLAYER_FRAMES;
  const frameH = img.height;
  const baseDrawW = frameW * SCALE;
  const baseDrawH = frameH * SCALE;

  const sizeMultiplier = p.sizeMultiplier || 1;
  const drawW = baseDrawW * sizeMultiplier;
  const drawH = baseDrawH * sizeMultiplier;

  const offsetX = (baseDrawW - drawW) / 2;
  const offsetY = baseDrawH - drawH;

  // Draw shadow if image loaded
  if (img.complete && img.naturalWidth > 0) {
    ctx.drawImage(
      img,
      Math.floor(p.frame) * frameW,
      0,
      frameW,
      frameH,
      p.x + offsetX,
      p.y + offsetY,
      drawW,
      drawH,
    );

    if (p.color) {
      ctx.save();
      ctx.globalCompositeOperation = "source-atop";
      ctx.fillStyle = p.color + "80";
      ctx.fillRect(p.x + offsetX, p.y + offsetY, drawW, drawH);
      ctx.restore();
    }
  } else {
    // Fallback rectangle
    ctx.fillStyle = p.color || "#ff6b6b";
    ctx.fillRect(p.x + offsetX, p.y + offsetY, drawW, drawH);
  }
}

function drawStone(pl, img) {
  if (img.complete && img.naturalWidth > 0) {
    const frameW = img.width / 4;
    const frameH = img.height / 4;
    const fx = pl.frame % 4;
    const fy = Math.floor(pl.frame / 4);
    ctx.drawImage(
      img,
      fx * frameW,
      fy * frameH,
      frameW,
      frameH,
      pl.x,
      pl.y,
      pl.w,
      pl.h,
    );
  } else {
    // Fallback rectangle
    ctx.fillStyle = pl.safe ? "#3498db" : "#e74c3c";
    ctx.fillRect(pl.x, pl.y, pl.w, pl.h);
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (bgImg.complete && bgImg.naturalWidth > 0) {
    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = "#87ceeb";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Draw platforms
  platforms.forEach((pl) => {
    if (pl.type === "disappearing" && !pl.visible) {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
      ctx.lineWidth = 2;
      ctx.strokeRect(pl.x, pl.y, pl.w, pl.h);
      return;
    }

    if (pl.type === "disappearing") {
      const fadeProgress = pl.disappearTimer / pl.disappearCycle;
      ctx.globalAlpha = pl.visible
        ? 1 - fadeProgress * 0.3
        : fadeProgress * 0.3;
    }

    drawStone(pl, pl.safe ? stoneBlueImg : stoneRedImg);
    ctx.globalAlpha = 1;

    if (pl.type === "moving") {
      ctx.fillStyle = "rgba(255, 255, 0, 0.5)";
      const arrowX = pl.x + pl.w / 2;
      const arrowY = pl.y - 8;
      ctx.font = "12px Arial";
      ctx.textAlign = "center";
      ctx.fillText(pl.moveDirection > 0 ? "→" : "←", arrowX, arrowY);
    }
  });

  // Draw power-ups
  powerUps.forEach((powerUp) => {
    powerUp.pulsePhase += 0.1;
    const pulse = Math.sin(powerUp.pulsePhase) * 0.3 + 1;
    const radius = powerUp.radius * pulse;

    const gradient = ctx.createRadialGradient(
      powerUp.x,
      powerUp.y,
      0,
      powerUp.x,
      powerUp.y,
      radius * 1.5,
    );
    gradient.addColorStop(0, powerUp.type.color);
    gradient.addColorStop(0.5, powerUp.type.color + "80");
    gradient.addColorStop(1, "transparent");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(powerUp.x, powerUp.y, radius * 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = powerUp.type.color;
    ctx.beginPath();
    ctx.arc(powerUp.x, powerUp.y, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#000";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(powerUp.type.symbol || "?", powerUp.x, powerUp.y);
  });

// --- Platform Countdown Bar ---
  const barX = SAFE_ZONE.x;
  const barY = SAFE_ZONE.y - 20;
  const barWidth = SAFE_ZONE.width;
  const barHeight = 12;
  const radius = 6;
  const remaining = Math.max(0, platformCountdown / platformInterval);

  const gradient = ctx.createLinearGradient(barX, barY, barX + barWidth, barY);
  gradient.addColorStop(0, "red");
  gradient.addColorStop(0.5, "yellow");
  gradient.addColorStop(1, "green");

  ctx.fillStyle = "#333";
  ctx.beginPath();
  ctx.roundRect(barX, barY, barWidth, barHeight, radius);
  ctx.fill();

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.roundRect(barX, barY, barWidth * remaining, barHeight, radius);
  ctx.fill();

  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(barX, barY, barWidth, barHeight, radius);
  ctx.stroke();

  // Draw players with effects
  players.forEach((p, idx) => {
    const centerX = p.x + 18;
    const centerY = p.y + 24;
    const baseRadius = 25;

    if (p.powerUps.invincible) {
      const shieldPulse = Math.sin(Date.now() / 100) * 0.2 + 0.8;
      ctx.strokeStyle = `rgba(255, 215, 0, ${shieldPulse})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (p.powerUps.shield) {
      const shieldPulse = Math.sin(Date.now() / 80) * 0.2 + 0.8;
      ctx.strokeStyle = `rgba(0, 191, 255, ${shieldPulse})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius + 3, 0, Math.PI * 2);
      ctx.stroke();

      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + Date.now() / 500;
        const x1 = centerX + Math.cos(angle) * (baseRadius - 2);
        const y1 = centerY + Math.sin(angle) * (baseRadius - 2);
        const x2 = centerX + Math.cos(angle) * (baseRadius + 5);
        const y2 = centerY + Math.sin(angle) * (baseRadius + 5);
        ctx.strokeStyle = `rgba(0, 191, 255, ${shieldPulse})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    }

    if (p.powerUps.speed) {
      ctx.strokeStyle = "rgba(0, 255, 0, 0.5)";
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(p.x - 5 - i * 3, p.y + 10 + i * 5);
        ctx.lineTo(p.x - 10 - i * 3, p.y + 15 + i * 5);
        ctx.stroke();
      }
    }

    drawPlayer(p, idx === 0 ? player1Img : player2Img);
  });

  // Draw player info
  ctx.font = "bold 12px 'Pixelify Sans'";
  ctx.textAlign = "left";
  players.forEach((p) => {
    ctx.fillStyle = p.isTaya ? "#ff4444" : "#4444ff";
    ctx.fillText(p.name, p.x, p.y - 8);

    if (p.dashCooldown > 0) {
      const cooldownPercent = p.dashCooldown / DASH_COOLDOWN;
      ctx.fillStyle = "rgba(255, 165, 0, 0.7)";
      ctx.fillRect(p.x, p.y - 4, 24 * SCALE * (1 - cooldownPercent), 2);
    }

    for (let i = 0; i < p.jumpsRemaining; i++) {
      ctx.fillStyle = i < 2 ? "#00ff00" : "#9900ff";
      ctx.beginPath();
      ctx.arc(p.x + 2 + i * 6, p.y - 22, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // Update scoreboard
  const mode = GAME_MODES[currentGameMode];
  let html = `<b>📊 ${mode.name} Mode</b><br><small>Press E to end game</small><br><br>`;

  if (mode.timeLimit) {
    const timeLeft = Math.max(0, mode.timeLimit - timeSurvived);
    html += `⏱️ Time Left: <b>${(timeLeft / 60).toFixed(1)}s</b><br><br>`;
  } else if (mode.scoreLimit) {
    html += `🏁 Target: <b>${(mode.scoreLimit / 60).toFixed(1)}s</b><br><br>`;
  }

  players.forEach((p) => {
    html += `${p.name}: <b>${(p.survived / 60).toFixed(1)}s</b> ${p.isTaya ? '<span style="color:#ff6b6b;">(Taya)</span>' : ""}<br>`;
  });
  const winner = players.reduce((a, b) => (a.survived > b.survived ? a : b));
  html += `<br><b style="color:#ffd700;">🏆 Leader: ${winner.name}</b>`;
  scoreboard.innerHTML = html;
}

function gameLoop() {
  if (!gameRunning || paused) return;
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

function replayGame() {
  const randomTagger = Math.random() < 0.5 ? 0 : 1;
  players = [
    {
      name: lastNames[0],
      color: lastColors[0],
      x: 120,
      y: GROUND_Y,
      vx: 0,
      vy: 0,
      isTaya: randomTagger === 0,
      frame: 0,
      survived: 0,
      onGround: true,
      jumping: false,
      jumpsRemaining: 2,
      dashCooldown: 0,
      facingRight: true,
      powerUps: {},
      maxJumps: 2,
      speedMultiplier: 1,
      sizeMultiplier: 1,
      wasTagged: false,
      gameStats: {
        jumps: 0,
        dashes: 0,
        tags: 0,
        speedPowerups: 0,
        shieldPowerups: 0,
      },
    },
    {
      name: lastNames[1],
      color: lastColors[1],
      x: 260,
      y: GROUND_Y,
      vx: 0,
      vy: 0,
      isTaya: randomTagger === 1,
      frame: 0,
      survived: 0,
      onGround: true,
      jumping: false,
      jumpsRemaining: 2,
      dashCooldown: 0,
      facingRight: true,
      powerUps: {},
      maxJumps: 2,
      speedMultiplier: 1,
      sizeMultiplier: 1,
      wasTagged: false,
      gameStats: {
        jumps: 0,
        dashes: 0,
        tags: 0,
        speedPowerups: 0,
        shieldPowerups: 0,
      },
    },
  ];

  timeSurvived = 0;
  platformTimer = 0;

  const mode = GAME_MODES[currentGameMode];
  let baseInterval = mode.fastPlatforms ? 300 : 600;

  if (gameSettings.platformSpeed === "slow") baseInterval = 600;
  else if (gameSettings.platformSpeed === "fast") baseInterval = 300;

  platformInterval = baseInterval;
  platformCountdown = platformInterval;

  if (gameSettings.powerupFrequency === "rare") {
    POWERUP_SPAWN_INTERVAL = 600;
  } else if (gameSettings.powerupFrequency === "common") {
    POWERUP_SPAWN_INTERVAL = 180;
  } else {
    POWERUP_SPAWN_INTERVAL = 300;
  }

  powerUps = [];
  powerUpSpawnTimer = 0;
  randomizePlatforms();

  document.getElementById("pauseBtn").style.display = "block";
  document.getElementById("gameOverScreen").style.display = "none";
  scoreboard.style.display = "block";
  particleCanvas.style.display = "block";
  document.querySelector(".instructions-panel").style.display = "block";
  paused = false;
  gameRunning = true;

  updateControlsVisibility();

  requestAnimationFrame(gameLoop);
}

function newPlayer() {
  document.getElementById("gameOverScreen").style.display = "none";
  showModeSelect();
}

function togglePause() {
  paused = !paused;
  document.getElementById("pauseBtn").textContent = paused
    ? "▶ Resume (P)"
    : "⏸ Pause (P)";
  if (!paused && gameRunning) requestAnimationFrame(gameLoop);
}

// Initialize
window.addEventListener("resize", () => {
  isMobile = window.innerWidth <= 768;
  updateControlsVisibility();
});
