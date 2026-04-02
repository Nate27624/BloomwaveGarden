const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const overlayEl = document.getElementById("overlay");
const overlayTitleEl = document.getElementById("overlay-title");
const overlayTextEl = document.getElementById("overlay-text");
const homeScreenEl = document.getElementById("home-screen");
const leaderboardScreenEl = document.getElementById("leaderboard-screen");
const playBtn = document.getElementById("play-btn");
const leaderboardBtn = document.getElementById("leaderboard-btn");
const leaderboardBackBtn = document.getElementById("leaderboard-back-btn");
const leaderboardListEl = document.getElementById("leaderboard-list");
const menuCornerBtn = document.getElementById("menu-corner-btn");
const hudEl = document.querySelector(".hud");

const scoreEl = document.getElementById("score");
const calmEl = document.getElementById("calm");
const cratesEl = document.getElementById("crates");
const comboEl = document.getElementById("combo");
const phaseEl = document.getElementById("phase");
const statusEl = document.getElementById("status");

const audioBtn = document.getElementById("audio-btn");
const restartBtn = document.getElementById("restart-btn");

const BASE_WORLD_W = 320;
const BASE_WORLD_H = 180;
let VIEW_W = canvas.width;
let VIEW_H = canvas.height;
let WORLD_W = BASE_WORLD_W;
let WORLD_H = BASE_WORLD_H;

const MAX_BUDS = 34;
const MAX_PULSES = 18;
const MAX_PARTICLES = 320;
const MAX_BREAK_BURSTS = 24;
const MAX_LIGHTNING = 16;
const MAX_VIEW_PIXELS = 1_450_000;
const MIN_BURST_INTERVAL_MS = 240;
const BLOCKED_SPAM_PENALTY_MS = 180;
// Flower growth speed: >1 faster growth/spawn, <1 slower.
const FLOWER_GROWTH_RATE = 0.72;
const BLUE_FLOWER_RATIO = 0.2;
const PACKED_FIELD_RATIO = 0.95;
const PACKED_LIGHTNING_BONUS = 6;
const LEADERBOARD_STORAGE_KEY = "bloomwave_leaderboard_players_v2";
const LEGACY_LEADERBOARD_STORAGE_KEY = "bloomwave_leaderboard_v1";
const PLAYER_PROFILE_STORAGE_KEY = "bloomwave_player_profile_v1";
const MAX_LEADERBOARD_ENTRIES = 10;
const COMMUNITY_PLAYER_NAMES = [
  "Skylark",
  "MangoMoss",
  "CloudRoot",
  "SunFern",
  "RiverMint",
  "PoppyByte",
  "KiteSoil",
  "StarCompost",
  "WillowLoop",
  "BloomPilot",
  "NightSprout",
  "CloverArc",
  "SagePixel",
];

const world = document.createElement("canvas");
world.width = WORLD_W;
world.height = WORLD_H;
const wctx = world.getContext("2d");
wctx.imageSmoothingEnabled = false;

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const rand = (min, max) => Math.random() * (max - min) + min;
const lerp = (a, b, t) => a + (b - a) * t;

const palette = [
  { name: "Amber", color: "#f7be68", glow: "#ffe5a6", spirit: "spiritAmber", bloom: "bloomAmber" },
  { name: "Teal", color: "#5fd6ca", glow: "#b7f5ee", spirit: "spiritTeal", bloom: "bloomTeal" },
];

const spriteSources = {
  bed: "assets/sprites/bed.svg",
  sprout1: "assets/sprites/sprout-1.svg",
  sprout2: "assets/sprites/sprout-2.svg",
  bloomAmber: "assets/sprites/bloom-amber.svg",
  bloomTeal: "assets/sprites/bloom-teal.svg",
  flowerAmber: "assets/sprites/flower-amber.svg",
  flowerTeal: "assets/sprites/flower-teal.svg",
  flowerGold: "assets/sprites/flower-gold.svg",
  spiritAmber: "assets/sprites/spirit-amber.svg",
  spiritTeal: "assets/sprites/spirit-teal.svg",
};

const sprites = {};

const BED_TEMPLATE_SLOTS = [
  { x: 34, y: 38 }, { x: 56, y: 30 }, { x: 78, y: 41 }, { x: 102, y: 35 },
  { x: 126, y: 43 }, { x: 150, y: 33 }, { x: 174, y: 41 }, { x: 196, y: 34 },
  { x: 222, y: 42 }, { x: 246, y: 32 }, { x: 272, y: 41 }, { x: 294, y: 33 },
  { x: 30, y: 74 }, { x: 54, y: 66 }, { x: 80, y: 76 }, { x: 104, y: 68 },
  { x: 130, y: 75 }, { x: 156, y: 67 }, { x: 182, y: 76 }, { x: 208, y: 68 },
  { x: 232, y: 75 }, { x: 258, y: 66 }, { x: 286, y: 74 },
  { x: 34, y: 108 }, { x: 58, y: 98 }, { x: 86, y: 109 }, { x: 112, y: 99 },
  { x: 140, y: 109 }, { x: 166, y: 99 }, { x: 194, y: 108 }, { x: 220, y: 99 },
  { x: 248, y: 109 }, { x: 274, y: 98 },
  { x: 32, y: 142 }, { x: 58, y: 152 }, { x: 84, y: 141 }, { x: 110, y: 150 },
  { x: 138, y: 141 }, { x: 164, y: 152 }, { x: 192, y: 142 }, { x: 218, y: 150 },
  { x: 246, y: 141 }, { x: 272, y: 151 }, { x: 296, y: 142 },
];
let bedSlots = [];

const SLOT_TEMPLATE_MIN_X = 30;
const SLOT_TEMPLATE_MAX_X = 296;
const SLOT_TEMPLATE_MIN_Y = 30;
const SLOT_TEMPLATE_MAX_Y = 152;
const SLOT_TEMPLATE_W = SLOT_TEMPLATE_MAX_X - SLOT_TEMPLATE_MIN_X;
const SLOT_TEMPLATE_H = SLOT_TEMPLATE_MAX_Y - SLOT_TEMPLATE_MIN_Y;

const FARM_CLOUDS = [
  { x: 18, y: 20, speed: 1.4 },
  { x: 92, y: 14, speed: 1.1 },
  { x: 166, y: 24, speed: 1.55 },
  { x: 242, y: 18, speed: 1.3 },
  { x: 306, y: 28, speed: 1.05 },
];

function rebuildBedSlots() {
  const desiredFieldW = 156;
  const desiredFieldH = 116;
  const fieldW = clamp(Math.round(desiredFieldW), 98, Math.round(WORLD_W * 0.84));
  const fieldH = clamp(Math.round(desiredFieldH), 84, Math.round(WORLD_H * 0.74));
  const left = Math.round((WORLD_W - fieldW) * 0.5);
  const right = left + fieldW;
  const top = Math.round((WORLD_H - fieldH) * 0.48);
  const bottom = top + fieldH;
  const width = Math.max(24, right - left);
  const height = Math.max(24, bottom - top);

  bedSlots = BED_TEMPLATE_SLOTS.map((slot, index) => {
    const nx = (slot.x - SLOT_TEMPLATE_MIN_X) / SLOT_TEMPLATE_W;
    const ny = (slot.y - SLOT_TEMPLATE_MIN_Y) / SLOT_TEMPLATE_H;
    return {
      index,
      x: Math.round(lerp(left, left + width, nx)),
      y: Math.round(lerp(top, top + height, ny)),
    };
  });
}

function syncBudsToSlots() {
  const used = new Set();
  for (const bud of state.buds) {
    let slotIndex = Number.isInteger(bud.slotIndex) ? bud.slotIndex : -1;
    if (slotIndex < 0 || slotIndex >= bedSlots.length || used.has(slotIndex)) {
      slotIndex = bedSlots.findIndex((slot) => !used.has(slot.index));
      if (slotIndex < 0) {
        bud._prune = true;
        continue;
      }
      bud.slotIndex = slotIndex;
    }

    const slot = bedSlots[slotIndex];
    bud.x = slot.x;
    bud.y = slot.y;
    used.add(slotIndex);
  }

  state.buds = state.buds.filter((bud) => !bud._prune);
}

function resizeGameSurface() {
  const rect = canvas.getBoundingClientRect();
  const cssW = Math.max(1, rect.width || window.innerWidth || 1);
  const cssH = Math.max(1, rect.height || window.innerHeight || 1);
  let dpr = clamp(window.devicePixelRatio || 1, 1, 2);
  const shortCss = Math.max(1, Math.min(cssW, cssH));
  const worldShort = 180;
  const worldUnitsPerCss = worldShort / shortCss;

  let targetViewW = Math.max(1, Math.round(cssW * dpr));
  let targetViewH = Math.max(1, Math.round(cssH * dpr));
  const targetPixels = targetViewW * targetViewH;
  if (targetPixels > MAX_VIEW_PIXELS) {
    const scale = Math.sqrt(MAX_VIEW_PIXELS / targetPixels);
    dpr = Math.max(1, dpr * scale);
    targetViewW = Math.max(1, Math.round(cssW * dpr));
    targetViewH = Math.max(1, Math.round(cssH * dpr));
  }

  const targetWorldW = clamp(Math.round(cssW * worldUnitsPerCss), 120, 360);
  const targetWorldH = clamp(Math.round(cssH * worldUnitsPerCss), 120, 360);

  const viewChanged = targetViewW !== VIEW_W || targetViewH !== VIEW_H;
  const worldChanged = targetWorldW !== WORLD_W || targetWorldH !== WORLD_H;

  if (!viewChanged && !worldChanged) return;

  VIEW_W = targetViewW;
  VIEW_H = targetViewH;
  canvas.width = VIEW_W;
  canvas.height = VIEW_H;

  WORLD_W = targetWorldW;
  WORLD_H = targetWorldH;
  world.width = WORLD_W;
  world.height = WORLD_H;
  wctx.imageSmoothingEnabled = false;

  rebuildBedSlots();
  syncBudsToSlots();
  state.pointerX = clamp(state.pointerX, 0, WORLD_W);
  state.pointerY = clamp(state.pointerY, 0, WORLD_H);
  state.pointerTargetX = clamp(state.pointerTargetX, 0, WORLD_W);
  state.pointerTargetY = clamp(state.pointerTargetY, 0, WORLD_H);
}

let nextBudId = 1;
let nextPulseId = 1;

const state = {
  running: false,
  time: 0,
  score: 0,
  hype: 72,
  harvestProgress: 0,
  harvestGoal: 12,
  crates: 0,
  combo: 0,
  bestCombo: 0,
  nextPalette: 0,
  frenzyTimer: 0,
  spawnTimer: 0,
  seasonTimer: rand(10, 15),
  pointerX: WORLD_W * 0.5,
  pointerY: WORLD_H * 0.5,
  pointerTargetX: WORLD_W * 0.5,
  pointerTargetY: WORLD_H * 0.5,
  buds: [],
  pulses: [],
  particles: [],
  breakBursts: [],
  lightning: [],
  statusTimer: 0,
  statusText: "Goal loading...",
  challenge: null,
  challengeCooldown: 0,
  lastBurstAtMs: -Infinity,
  lastBlockedTapAtMs: -Infinity,
  stats: {
    amberHits: 0,
    tealHits: 0,
    frenzyCount: 0,
  },
  assetsReady: false,
  missingSprites: false,
};

function readPlayerProfile() {
  try {
    const raw = localStorage.getItem(PLAYER_PROFILE_STORAGE_KEY);
    const fallbackId = `grower-${Math.random().toString(36).slice(2, 10)}`;
    let profile = {
      id: fallbackId,
      name: "You",
    };
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        const id = typeof parsed.id === "string" && parsed.id ? parsed.id : fallbackId;
        const name = typeof parsed.name === "string" && parsed.name.trim() ? parsed.name.trim() : "You";
        profile = { id, name };
      }
    }
    localStorage.setItem(PLAYER_PROFILE_STORAGE_KEY, JSON.stringify(profile));
    return profile;
  } catch {
    return {
      id: "grower-local",
      name: "You",
    };
  }
}

function normalizePlayerEntry(entry) {
  if (!entry || typeof entry !== "object") return null;
  const id = typeof entry.id === "string" && entry.id ? entry.id : "";
  if (!id) return null;

  return {
    id,
    name: typeof entry.name === "string" && entry.name.trim() ? entry.name.trim() : "Grower",
    totalBlooms: Math.max(0, Math.floor(Number(entry.totalBlooms ?? entry.totalScore) || 0)),
    totalCrates: Math.max(0, Math.floor(Number(entry.totalCrates) || 0)),
    isNpc: Boolean(entry.isNpc),
  };
}

function ensurePlayerEntry(entries, profile) {
  let found = entries.find((entry) => entry.id === profile.id);
  if (found) {
    found.name = profile.name;
    return found;
  }

  found = {
    id: profile.id,
    name: profile.name,
    totalBlooms: 0,
    totalCrates: 0,
    isNpc: false,
  };
  entries.push(found);
  return found;
}

function buildCommunityEntry(name, index) {
  const base = 180 + index * 92;
  return {
    id: `npc-${name.toLowerCase()}`,
    name,
    totalBlooms: Math.floor(base + rand(40, 220)),
    totalCrates: Math.floor(8 + index * 1.6 + rand(0, 10)),
    isNpc: true,
  };
}

function sortLeaderboard(entries) {
  entries.sort((a, b) => {
    if (b.totalBlooms !== a.totalBlooms) return b.totalBlooms - a.totalBlooms;
    if (b.totalCrates !== a.totalCrates) return b.totalCrates - a.totalCrates;
    return a.name.localeCompare(b.name);
  });
}

function readLegacyRunSummary(profile) {
  try {
    const raw = localStorage.getItem(LEGACY_LEADERBOARD_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    const validRuns = parsed
      .map((entry) => ({
        score: Math.max(0, Math.floor(Number(entry.score) || 0)),
        crates: Math.max(0, Math.floor(Number(entry.crates) || 0)),
      }))
      .filter((entry) => entry.score > 0 || entry.crates > 0);
    if (validRuns.length === 0) return null;

    const summary = {
      id: profile.id,
      name: profile.name,
      totalBlooms: 0,
      totalCrates: 0,
      isNpc: false,
    };
    for (const run of validRuns) {
      summary.totalBlooms += run.score;
      summary.totalCrates += run.crates;
    }
    return summary;
  } catch {
    return null;
  }
}

function seedCommunityPlayers(entries) {
  const existingNpcIds = new Set(entries.filter((entry) => entry.isNpc).map((entry) => entry.id));
  for (let i = 0; i < COMMUNITY_PLAYER_NAMES.length; i += 1) {
    const candidate = buildCommunityEntry(COMMUNITY_PLAYER_NAMES[i], i);
    if (!existingNpcIds.has(candidate.id)) {
      entries.push(candidate);
      existingNpcIds.add(candidate.id);
    }
  }
}

function readLeaderboard(profile) {
  try {
    const raw = localStorage.getItem(LEADERBOARD_STORAGE_KEY);
    let parsedEntries = [];
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        parsedEntries = parsed.map(normalizePlayerEntry).filter(Boolean);
      }
    }

    if (parsedEntries.length === 0) {
      const legacy = readLegacyRunSummary(profile);
      if (legacy) {
        parsedEntries.push(legacy);
      }
    }

    seedCommunityPlayers(parsedEntries);
    ensurePlayerEntry(parsedEntries, profile);
    sortLeaderboard(parsedEntries);
    return parsedEntries;
  } catch {
    const fallback = [];
    seedCommunityPlayers(fallback);
    ensurePlayerEntry(fallback, profile);
    sortLeaderboard(fallback);
    return fallback;
  }
}

function writeLeaderboard(entries) {
  try {
    localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Ignore storage write failures (private mode / quota / blocked storage).
  }
}

const localPlayerProfile = readPlayerProfile();
let leaderboardEntries = readLeaderboard(localPlayerProfile);

function nudgeCommunityPlayers() {
  for (const entry of leaderboardEntries) {
    if (!entry.isNpc) continue;

    if (Math.random() < 0.62) {
      const bloomGain = Math.floor(rand(7, 52));
      entry.totalBlooms += bloomGain;
      entry.totalCrates += Math.floor(bloomGain / 24);
    }
  }
}

function recordSessionToLeaderboard() {
  const blooms = Math.max(0, Math.floor(state.score));
  const crates = Math.max(0, Math.floor(state.crates));
  if (blooms <= 0 && crates <= 0) return;

  const localEntry = ensurePlayerEntry(leaderboardEntries, localPlayerProfile);
  localEntry.totalBlooms += blooms;
  localEntry.totalCrates += crates;
  localEntry.isNpc = false;

  nudgeCommunityPlayers();
  sortLeaderboard(leaderboardEntries);
  writeLeaderboard(leaderboardEntries);
  postNativeGameCenter("submitScore", { score: localEntry.totalBlooms });
}

function renderLeaderboard() {
  if (!leaderboardListEl) return;

  leaderboardListEl.innerHTML = "";
  const visibleEntries = [...leaderboardEntries];
  sortLeaderboard(visibleEntries);
  const topEntries = visibleEntries.slice(0, MAX_LEADERBOARD_ENTRIES);
  const localRank = visibleEntries.findIndex((entry) => entry.id === localPlayerProfile.id);
  const renderEntries = [...topEntries];
  if (localRank >= MAX_LEADERBOARD_ENTRIES) {
    renderEntries.push(visibleEntries[localRank]);
  }

  if (renderEntries.length === 0) {
    const item = document.createElement("li");
    item.className = "board-empty";
    item.textContent = "No growers ranked yet. Harvest blooms and crates to join.";
    leaderboardListEl.appendChild(item);
    return;
  }

  renderEntries.forEach((entry) => {
    const item = document.createElement("li");
    item.className = "board-row";
    const rank = visibleEntries.findIndex((candidate) => candidate.id === entry.id) + 1;
    const isLocal = entry.id === localPlayerProfile.id;
    if (isLocal) {
      item.classList.add("you");
    }
    const displayName = isLocal ? `${entry.name} (You)` : entry.name;

    const rankEl = document.createElement("span");
    rankEl.className = "rank";
    rankEl.textContent = `#${rank}`;

    const scoreValueEl = document.createElement("span");
    scoreValueEl.className = "score";
    scoreValueEl.textContent = `Blooms ${entry.totalBlooms}`;

    const metaEl = document.createElement("span");
    metaEl.className = "meta";
    metaEl.textContent = `${displayName} · Crates ${entry.totalCrates}`;

    item.append(rankEl, scoreValueEl, metaEl);
    leaderboardListEl.appendChild(item);
  });
}

function showHomeScreen() {
  if (!overlayEl) return;
  overlayEl.classList.remove("hidden");
  overlayEl.classList.add("menu-open");
  homeScreenEl?.classList.remove("screen-hidden");
  leaderboardScreenEl?.classList.add("screen-hidden");
  setGameUiVisible(false);
  overlayTitleEl.textContent = "Bloomwave Garden";
  overlayTextEl.textContent = "Pixel farm vibes. Tap blooms, chain zaps, harvest crates.";
}

function showLeaderboardScreen() {
  if (!overlayEl) return;
  renderLeaderboard();
  overlayEl.classList.remove("hidden");
  overlayEl.classList.add("menu-open");
  homeScreenEl?.classList.add("screen-hidden");
  leaderboardScreenEl?.classList.remove("screen-hidden");
  setGameUiVisible(false);
}

function hideMenuOverlay() {
  if (!overlayEl) return;
  overlayEl.classList.add("hidden");
  overlayEl.classList.remove("menu-open");
  setGameUiVisible(true);
}

function setGameUiVisible(visible) {
  const targets = [hudEl, statusEl, menuCornerBtn];
  for (const target of targets) {
    if (!target) continue;
    target.classList.toggle("is-hidden", !visible);
  }
}

function openMenuFromGame() {
  if (state.score > 0 || state.crates > 0) {
    recordSessionToLeaderboard();
  }
  softReset(true);
}

class LofiEngine {
  constructor() {
    this.context = null;
    this.master = null;
    this.compressor = null;
    this.activeVoices = 0;
    this.maxVoices = 14;
    this.started = false;
    this.muted = true;
    this.didPreviewTone = false;
    this.nativeAudioOnly = Boolean(window.__BLOOM_NATIVE_AUDIO_ONLY);
    this.lastDefaultToneAt = -Infinity;
    this.defaultToneCooldown = 0.08;
    this.unlockSample = null;
    this.unlockSampleLoading = null;
  }

  ensureGraph() {
    if (this.nativeAudioOnly) return true;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return false;

    if (this.context && this.master) return true;

    this.context = new AudioContext();
    this.master = this.context.createGain();
    this.compressor = this.context.createDynamicsCompressor();

    this.master.gain.value = 0.0001;

    this.compressor.threshold.setValueAtTime(-20, this.context.currentTime);
    this.compressor.knee.setValueAtTime(20, this.context.currentTime);
    this.compressor.ratio.setValueAtTime(3.5, this.context.currentTime);
    this.compressor.attack.setValueAtTime(0.003, this.context.currentTime);
    this.compressor.release.setValueAtTime(0.24, this.context.currentTime);

    this.master.connect(this.compressor);
    this.compressor.connect(this.context.destination);
    this.primeUnlockSample();
    return true;
  }

  primeUnlockSample() {
    if (this.nativeAudioOnly) return;
    if (!this.context || this.unlockSample || this.unlockSampleLoading) return;

    this.unlockSampleLoading = fetch("assets/audio/unlock-tone.wav")
      .then((res) => (res.ok ? res.arrayBuffer() : Promise.reject(new Error("sample fetch failed"))))
      .then((buf) => this.context.decodeAudioData(buf))
      .then((decoded) => {
        this.unlockSample = decoded;
      })
      .catch(() => {
        this.unlockSample = null;
      })
      .finally(() => {
        this.unlockSampleLoading = null;
      });
  }

  playUnlockTone() {
    if (this.nativeAudioOnly) return false;
    if (!this.context || !this.master) return false;
    if (this.context.state !== "running") return false;

    const now = this.context.currentTime;
    if (this.unlockSample) {
      const source = this.context.createBufferSource();
      const gain = this.context.createGain();
      source.buffer = this.unlockSample;
      gain.gain.setValueAtTime(0.34, now);
      source.connect(gain);
      gain.connect(this.master);
      source.start(now);
      this.lastDefaultToneAt = now;
      return true;
    }

    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    const filter = this.context.createBiquadFilter();

    osc.type = "square";
    osc.frequency.setValueAtTime(660, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1500, now);
    filter.Q.setValueAtTime(0.9, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.22, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    osc.start(now);
    osc.stop(now + 0.2);
    this.lastDefaultToneAt = now;
    return true;
  }

  playDefaultTone(force = false) {
    if (this.nativeAudioOnly) return false;
    if (!this.context || !this.master) return false;
    if (this.context.state !== "running") return false;

    const now = this.context.currentTime;
    if (!force && (now - this.lastDefaultToneAt) < this.defaultToneCooldown) {
      return false;
    }

    return this.playUnlockTone();
  }

  actionTone({
    which = 0,
    xNorm = 0.5,
    hitCount = 0,
    regularCount = 0,
    goldCount = 0,
    arcCount = 0,
    zapCount = 0,
    expandedZaps = 0,
    frenzy = false,
    miss = false,
    blocked = false,
  } = {}) {
    if (!this.canPlay()) return false;
    return this.playDefaultTone();
  }

  primeOnGesture() {
    if (!this.ensureGraph()) return false;

    if (this.nativeAudioOnly) {
      this.started = true;
      if (this.muted) {
        this.setMuted(false);
      }
      return true;
    }

    if (this.context.state !== "running") {
      void this.context.resume();
    }

    if (this.muted) {
      this.setMuted(false);
    }

    if (!this.didPreviewTone) {
      this.didPreviewTone = this.playUnlockTone();
    }

    return true;
  }

  async ensureStarted() {
    if (!this.ensureGraph()) {
      if (audioBtn) audioBtn.textContent = "Lofi Unsupported";
      return false;
    }

    if (this.nativeAudioOnly) {
      this.started = true;
      return true;
    }

    if (this.context.state !== "running") {
      try {
        await this.context.resume();
      } catch {
        return false;
      }
    }

    if (this.context.state !== "running") return false;

    this.started = true;

    if (!this.didPreviewTone) {
      this.didPreviewTone = this.playUnlockTone();
    }

    return true;
  }

  canPlay() {
    if (this.nativeAudioOnly) return false;
    if (!this.context || !this.master) return false;
    if (this.context.state !== "running") {
      void this.context.resume();
      return false;
    }
    this.primeUnlockSample();
    return true;
  }

  setMuted(nextMuted) {
    this.muted = nextMuted;
    if (!this.master || !this.context) return;

    const now = this.context.currentTime;
    const target = this.muted ? 0.0001 : 0.38;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setTargetAtTime(target, now, 0.2);

    if (audioBtn) {
      audioBtn.textContent = this.muted ? "Enable Lofi" : "Mute Lofi";
      audioBtn.classList.toggle("secondary", !this.muted);
    }
  }

  toggleMuted() {
    this.setMuted(!this.muted);
  }

  playVoice(freq, duration, type, gainLevel, cutoff) {
    if (!this.context || !this.master) return false;
    if (this.activeVoices >= this.maxVoices) return false;

    const now = this.context.currentTime;
    const osc = this.context.createOscillator();
    const filter = this.context.createBiquadFilter();
    const gain = this.context.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(cutoff, now);

    const attack = Math.min(0.03, Math.max(0.012, duration * 0.2));
    const release = Math.min(0.16, Math.max(0.06, duration * 0.75));
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(gainLevel, now + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration + release);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);

    this.activeVoices += 1;
    let cleaned = false;
    osc.onended = () => {
      if (cleaned) return;
      cleaned = true;
      this.activeVoices = Math.max(0, this.activeVoices - 1);
    };

    osc.start(now);
    osc.stop(now + duration + release + 0.03);
    return true;
  }

  pulseTone(which, xNorm, frenzy) {
    if (!this.canPlay()) return;
    this.playDefaultTone();
  }

  hitTone(which, combo) {
    if (!this.canPlay()) return;
    this.playDefaultTone();
  }

  sparkTone() {
    if (!this.canPlay()) return;
    this.playDefaultTone();
  }

  frenzyTone() {
    if (!this.canPlay()) return;
    this.playDefaultTone();
  }

  harvestTone(which, regularCount, goldCount = 0, arcCount = 0, frenzy = false) {
    if (!this.canPlay()) return;

    const total = regularCount + goldCount + arcCount;
    if (total <= 0) return;
    this.playDefaultTone();
  }
}

const lofi = new LofiEngine();
let didRunAudioUnlockPing = false;

function postNativeAudio(event, payload = {}) {
  const webAudioState = lofi.context ? lofi.context.state : "no-context";
  const shouldBridge = lofi.nativeAudioOnly || webAudioState !== "running" || event === "gesture";
  if (!shouldBridge) return;

  const handler = window.webkit && window.webkit.messageHandlers
    ? window.webkit.messageHandlers.nativeAudio
    : null;

  if (!handler) return;

  try {
    handler.postMessage({
      event,
      webAudioState,
      nativeAudioOnly: Boolean(lofi.nativeAudioOnly),
      ...payload,
    });
  } catch {
    // no-op
  }
}

function postNativeGameCenter(event, payload = {}) {
  const handler = window.webkit && window.webkit.messageHandlers
    ? window.webkit.messageHandlers.nativeGameCenter
    : null;

  if (!handler) return false;

  try {
    handler.postMessage({
      event,
      ...payload,
    });
    return true;
  } catch {
    return false;
  }
}

function setStatus(text, seconds = 1.6) {
  state.statusText = text;
  state.statusTimer = seconds;
  statusEl.textContent = text;
}

function setPassiveStatus() {
  if (state.challenge) {
    statusEl.textContent = `Goal: ${state.challenge.text} (${state.challenge.progress}/${state.challenge.target})`;
  } else {
    statusEl.textContent = "New goal incoming...";
  }
}

function stage() {
  return 1 + Math.floor(state.score / 80);
}

function getFieldOccupancy() {
  return state.buds.length / MAX_BUDS;
}

function getRegularFlowerCounts() {
  let amber = 0;
  let teal = 0;

  for (const bud of state.buds) {
    if (bud.type === 0) amber += 1;
    else if (bud.type === 1) teal += 1;
  }

  return {
    amber,
    teal,
    total: amber + teal,
  };
}

function pickRegularFlowerType() {
  const counts = getRegularFlowerCounts();
  if (counts.total === 0) {
    return Math.random() < BLUE_FLOWER_RATIO ? 1 : 0;
  }

  const currentBlueRatio = counts.teal / counts.total;
  if (currentBlueRatio > BLUE_FLOWER_RATIO) {
    const overflow = currentBlueRatio - BLUE_FLOWER_RATIO;
    const blueChance = clamp(BLUE_FLOWER_RATIO - overflow * 0.7, 0.04, BLUE_FLOWER_RATIO);
    return Math.random() < blueChance ? 1 : 0;
  }

  const deficit = BLUE_FLOWER_RATIO - currentBlueRatio;
  const blueChance = clamp(BLUE_FLOWER_RATIO + deficit * 0.6, BLUE_FLOWER_RATIO, 0.62);
  return Math.random() < blueChance ? 1 : 0;
}

function syncHud() {
  scoreEl.textContent = String(state.score);
  calmEl.textContent = `${state.harvestProgress}/${state.harvestGoal}`;
  cratesEl.textContent = String(state.crates);
  if (comboEl) comboEl.textContent = String(state.combo);
  if (phaseEl) phaseEl.textContent = palette[state.nextPalette].name;
}

function makeChallenge() {
  const s = stage();
  const options = [
    {
      id: "streak",
      text: `Hit streak x${6 + Math.min(6, s)}`,
      target: 6 + Math.min(6, s),
      reward: 18 + s * 2,
    },
    {
      id: "amber",
      text: `Amber hits ${8 + s}`,
      target: 8 + s,
      reward: 16 + s * 2,
    },
    {
      id: "teal",
      text: `Teal hits ${8 + s}`,
      target: 8 + s,
      reward: 16 + s * 2,
    },
    {
      id: "frenzy",
      text: "Trigger frenzy",
      target: 1,
      reward: 24 + s * 2,
    },
  ];

  const pick = options[Math.floor(Math.random() * options.length)];
  state.challenge = {
    ...pick,
    progress: 0,
  };
}

function completeChallenge() {
  if (!state.challenge) return;

  const reward = state.challenge.reward;
  state.score += reward;
  state.hype = clamp(state.hype + 12, 0, 100);
  setStatus(`Goal complete +${reward}.`, 1.8);
  state.challenge = null;
  state.challengeCooldown = 1.4;
  syncHud();
}

function addHarvest(units) {
  state.harvestProgress += units;
  while (state.harvestProgress >= state.harvestGoal) {
    state.harvestProgress -= state.harvestGoal;
    state.crates += 1;
    state.score += 22;
    state.hype = clamp(state.hype + 8, 0, 100);
    state.harvestGoal = Math.min(28, state.harvestGoal + 1);
    setStatus(`Harvest crate packed x${state.crates}.`, 1.4);
  }
}

function updateChallengeFromHit(which, frenzyTriggered) {
  if (!state.challenge) return;

  if (state.challenge.id === "amber" && which === 0) {
    state.challenge.progress += 1;
  }
  if (state.challenge.id === "teal" && which === 1) {
    state.challenge.progress += 1;
  }
  if (state.challenge.id === "frenzy" && frenzyTriggered) {
    state.challenge.progress = state.challenge.target;
  }

  if (state.challenge.progress >= state.challenge.target) {
    completeChallenge();
  }
}

function syncStreakChallenge() {
  if (!state.challenge) return;
  if (state.challenge.id !== "streak") return;

  state.challenge.progress = Math.min(state.combo, state.challenge.target);
  if (state.challenge.progress >= state.challenge.target) {
    completeChallenge();
  }
}

function buildBeds() {
  state.buds = [];
  const initialFillChance = clamp(0.22 * FLOWER_GROWTH_RATE, 0.06, 0.7);
  for (const slot of bedSlots) {
    if (Math.random() < initialFillChance) {
      state.buds.push({
        id: nextBudId,
        slotIndex: slot.index,
        x: slot.x,
        y: slot.y,
        type: pickRegularFlowerType(),
        flash: 0,
        wobble: 0,
        petalPhase: rand(0, Math.PI * 2),
      });
      nextBudId += 1;
    }
  }
}

function softReset(showOverlay = true) {
  state.running = false;
  state.time = 0;
  state.score = 0;
  state.hype = 72;
  state.harvestProgress = 0;
  state.harvestGoal = 12;
  state.crates = 0;
  state.combo = 0;
  state.bestCombo = 0;
  state.nextPalette = 0;
  state.frenzyTimer = 0;
  state.spawnTimer = 0.48;
  state.seasonTimer = rand(10, 15);
  state.pointerX = WORLD_W * 0.5;
  state.pointerY = WORLD_H * 0.5;
  state.pointerTargetX = WORLD_W * 0.5;
  state.pointerTargetY = WORLD_H * 0.5;
  state.pulses = [];
  state.particles = [];
  state.breakBursts = [];
  state.lightning = [];
  state.statusTimer = 0;
  state.statusText = "Goal loading...";
  state.challenge = null;
  state.challengeCooldown = 0;
  state.lastBurstAtMs = -Infinity;
  state.lastBlockedTapAtMs = -Infinity;
  state.stats.amberHits = 0;
  state.stats.tealHits = 0;
  state.stats.frenzyCount = 0;

  buildBeds();
  makeChallenge();
  syncHud();
  setPassiveStatus();

  if (showOverlay) {
    showHomeScreen();
  }
}

function startSession() {
  if (state.score > 0 || state.crates > 0) {
    recordSessionToLeaderboard();
  }

  softReset(false);
  state.running = true;
  hideMenuOverlay();
  setStatus("Session live. Burst clusters to stack combo.", 1.9);
}

function findOpenSlot() {
  const occupied = new Set(state.buds.map((b) => b.slotIndex));
  const shuffled = [...bedSlots].sort(() => Math.random() - 0.5);
  for (const slot of shuffled) {
    if (!occupied.has(slot.index)) return slot;
  }
  return null;
}

function spawnBud() {
  if (state.buds.length >= MAX_BUDS) return;

  const slot = findOpenSlot();
  if (!slot) return;

  const s = stage();
  const goldChance = clamp(0.05 + s * 0.01, 0.05, 0.15);
  const type = Math.random() < goldChance ? 2 : pickRegularFlowerType();
  state.buds.push({
    id: nextBudId,
    slotIndex: slot.index,
    x: slot.x,
    y: slot.y,
    type,
    flash: 0,
    wobble: 0,
    petalPhase: rand(0, Math.PI * 2),
  });

  nextBudId += 1;
}

function spawnParticles(x, y, color, count = 10, spread = 1.8) {
  if (state.particles.length >= MAX_PARTICLES) return;

  const allowed = Math.min(count, MAX_PARTICLES - state.particles.length);
  for (let i = 0; i < allowed; i += 1) {
    state.particles.push({
      x,
      y,
      vx: rand(-spread, spread),
      vy: rand(-spread, spread),
      life: rand(12, 28),
      color,
      size: Math.random() < 0.72 ? 1 : 2,
    });
  }
}

function spawnBreakBurst(x, y, color, power = 1) {
  spawnParticles(x, y, color, Math.round(12 * power), 2 * power);
  if (state.breakBursts.length >= MAX_BREAK_BURSTS) {
    state.breakBursts.shift();
  }
  state.breakBursts.push({
    x,
    y,
    life: 0.34 + power * 0.06,
    maxLife: 0.34 + power * 0.06,
    color,
    power,
  });
}

function spawnLightning(x1, y1, x2, y2, color) {
  if (state.lightning.length >= MAX_LIGHTNING) {
    state.lightning.shift();
  }
  state.lightning.push({
    x1,
    y1,
    x2,
    y2,
    color,
    life: 0.16,
    maxLife: 0.16,
    phase: rand(0, Math.PI * 2),
  });
}

function runPackedLightningExpansion(which, nowFrenzy, removeIds, chainPoints) {
  const occupancy = getFieldOccupancy();
  if (occupancy < PACKED_FIELD_RATIO || chainPoints.length === 0) {
    return 0;
  }

  const remaining = state.buds.filter(
    (bud) => bud.type !== 2 && bud.type !== which && !removeIds.has(bud.id),
  );
  if (remaining.length === 0) return 0;

  const packedStrength = clamp((occupancy - PACKED_FIELD_RATIO) / (1 - PACKED_FIELD_RATIO), 0, 1);
  let budget = PACKED_LIGHTNING_BONUS + Math.floor(packedStrength * 4);
  budget = Math.min(budget, remaining.length);

  let expandedZaps = 0;

  while (budget > 0 && remaining.length > 0) {
    let bestBudIndex = -1;
    let bestPointIndex = -1;
    let bestDistSq = Infinity;

    for (let i = 0; i < remaining.length; i += 1) {
      const bud = remaining[i];
      const targetY = bud.y - 4;

      for (let j = 0; j < chainPoints.length; j += 1) {
        const point = chainPoints[j];
        const dx = bud.x - point.x;
        const dy = targetY - point.y;
        const distSq = (dx * dx) + (dy * dy);
        if (distSq < bestDistSq) {
          bestDistSq = distSq;
          bestBudIndex = i;
          bestPointIndex = j;
        }
      }
    }

    if (bestBudIndex < 0 || bestPointIndex < 0) break;

    const target = remaining.splice(bestBudIndex, 1)[0];
    const from = chainPoints[bestPointIndex];
    const targetPoint = { x: target.x, y: target.y - 4 };

    removeIds.add(target.id);
    chainPoints.push(targetPoint);

    state.combo += 1;
    state.bestCombo = Math.max(state.bestCombo, state.combo);
    state.score += nowFrenzy ? 12 : 8;
    addHarvest(1);
    state.hype = clamp(state.hype + 1.9, 0, 100);

    if (which === 0) state.stats.amberHits += 1;
    else state.stats.tealHits += 1;

    updateChallengeFromHit(which, false);
    spawnLightning(from.x, from.y, targetPoint.x, targetPoint.y, palette[which].glow);
    spawnBreakBurst(target.x, target.y - 5, palette[which].glow, 1.12);

    expandedZaps += 1;
    budget -= 1;
  }

  return expandedZaps;
}

function addPulse(x, y, which, power = 1, alpha = 1) {
  if (state.pulses.length >= MAX_PULSES) {
    state.pulses.shift();
  }

  state.pulses.push({
    id: nextPulseId,
    x,
    y,
    which,
    r: 2,
    maxR: 30 + power * 10,
    life: 0.42 + power * 0.1,
    alpha,
  });

  nextPulseId += 1;
}

function triggerFrenzy() {
  state.frenzyTimer = Math.max(state.frenzyTimer, 6.6);
  state.stats.frenzyCount += 1;
  state.hype = clamp(state.hype + 16, 0, 100);
  setStatus("Frenzy active x2 points.", 1.3);
}

function resolveTapBurst(x, y) {
  const which = state.nextPalette;
  const nowFrenzy = state.frenzyTimer > 0;
  const radius = nowFrenzy ? 36 : 32;
  const tapXNorm = x / WORLD_W;

  addPulse(x, y, which, nowFrenzy ? 1.3 : 1, 1);

  state.nextPalette = state.nextPalette === 0 ? 1 : 0;
  if (phaseEl) phaseEl.textContent = palette[state.nextPalette].name;

  let directHits = 0;
  let offColorInBurst = 0;
  let colorCoreHits = 0;
  let hitCount = 0;
  let harvestRegular = 0;
  let harvestGold = 0;
  let harvestArc = 0;

  const matched = [];
  const offColor = [];

  for (const bud of state.buds) {
    const dx = bud.x - x;
    const dy = (bud.y - 3) - y;
    const dist = Math.hypot(dx, dy);

    if (dist > radius) continue;

    if (bud.type === 2 || bud.type === which) {
      matched.push({ bud, dist });
    } else {
      offColor.push({ bud, dist });
    }
  }

  const removeIds = new Set();
  const arcChainPoints = [{ x, y }];

  for (const item of matched) {
    const { bud } = item;
    removeIds.add(bud.id);
    directHits += 1;

    if (bud.type === 2) {
      const points = nowFrenzy ? 38 : 22;
      state.score += points;
      addHarvest(2);
      harvestGold += 1;
      triggerFrenzy();
      spawnBreakBurst(bud.x, bud.y - 5, "#ffd875", 1.4);
      updateChallengeFromHit(which, true);
      continue;
    }

    colorCoreHits += 1;
    state.combo += 1;
    state.bestCombo = Math.max(state.bestCombo, state.combo);

    const base = 4 + Math.floor(state.combo * 0.4);
    const points = nowFrenzy ? base * 2 : base;
    state.score += points;
    addHarvest(1);
    harvestRegular += 1;
    hitCount += 1;
    state.hype = clamp(state.hype + 2.8, 0, 100);

    if (which === 0) state.stats.amberHits += 1;
    else state.stats.tealHits += 1;

    updateChallengeFromHit(which, false);
    spawnBreakBurst(bud.x, bud.y - 5, palette[which].glow, 1.05);

    if (state.combo % 7 === 0) {
      setStatus(`Combo x${state.combo}.`, 1.1);
    }
  }

  offColorInBurst = offColor.length;
  const zapCount = Math.min(Math.floor(colorCoreHits / 2), offColor.length);
  if (zapCount > 0) {
    offColor.sort((a, b) => a.dist - b.dist);

    for (let i = 0; i < zapCount; i += 1) {
      const target = offColor[i].bud;
      removeIds.add(target.id);

      state.combo += 1;
      state.bestCombo = Math.max(state.bestCombo, state.combo);
      state.score += nowFrenzy ? 10 : 6;
      addHarvest(1);
      harvestArc += 1;
      hitCount += 1;
      state.hype = clamp(state.hype + 1.6, 0, 100);

      if (which === 0) state.stats.amberHits += 1;
      else state.stats.tealHits += 1;

      updateChallengeFromHit(which, false);
      const arcPoint = { x: target.x, y: target.y - 4 };
      spawnLightning(x, y, arcPoint.x, arcPoint.y, palette[which].glow);
      arcChainPoints.push(arcPoint);
      spawnBreakBurst(target.x, target.y - 5, palette[which].glow, 0.9);
    }
  }

  let expandedZaps = 0;
  if (colorCoreHits >= 2) {
    expandedZaps = runPackedLightningExpansion(which, nowFrenzy, removeIds, arcChainPoints);
    harvestArc += expandedZaps;
    hitCount += expandedZaps;
  }

  if (zapCount > 0 || expandedZaps > 0) {
    if (expandedZaps > 0) {
      setStatus(`Arc zap x${zapCount} + storm x${expandedZaps}.`, 1.15);
    } else {
      setStatus(`Arc zap x${zapCount}.`, 1.05);
    }
  }

  if (offColorInBurst > 0 && zapCount === 0) {
    for (const item of offColor) {
      item.bud.wobble = 0.48;
      item.bud.flash = 0.55;
    }

    state.combo = Math.max(0, state.combo - 1);
    state.hype = clamp(state.hype - 1.8, 0, 100);
    setStatus("Need 2 same-color hits to arc off-color.", 1.2);
  }

  state.buds = state.buds.filter((bud) => !removeIds.has(bud.id));

  if (directHits === 0 && offColorInBurst === 0) {
    state.combo = Math.max(0, state.combo - 1);
    state.hype = clamp(state.hype - 2.4, 0, 100);
    setStatus("Whiff. Aim for a cluster.", 1.05);
  }

  const blocked = offColorInBurst > 0 && zapCount === 0;
  const miss = directHits === 0 && offColorInBurst === 0;
  const audioFrenzy = nowFrenzy || harvestGold > 0;
  lofi.actionTone({
    which,
    xNorm: tapXNorm,
    hitCount,
    regularCount: harvestRegular,
    goldCount: harvestGold,
    arcCount: harvestArc,
    zapCount,
    expandedZaps,
    frenzy: audioFrenzy,
    miss,
    blocked,
  });
  postNativeAudio("action", {
    which,
    xNorm: tapXNorm,
    combo: state.combo,
    hitCount,
    regularCount: harvestRegular,
    goldCount: harvestGold,
    arcCount: harvestArc,
    zapCount,
    expandedZaps,
    frenzy: audioFrenzy,
    miss,
    blocked,
  });

  if (directHits >= 4) {
    addPulse(x + rand(-5, 5), y + rand(-5, 5), which, 0.75, 0.65);
    if (Math.random() < 0.34) {
      spawnBud();
    }
  }

  syncStreakChallenge();
  syncHud();
}

function updateSpawn(dtSec) {
  const growthRate = clamp(FLOWER_GROWTH_RATE, 0.25, 3.0);
  const s = stage();
  const occupancy = getFieldOccupancy();
  const baseIntensity = (state.combo * 0.018) + (s * 0.058);
  const intensity = clamp(baseIntensity * growthRate, 0, 0.9);
  const occupancyBrake = clamp(1 - (occupancy * 0.62), 0.22, 1);

  state.spawnTimer -= dtSec;
  if (state.spawnTimer <= 0) {
    if (Math.random() < occupancyBrake) {
      spawnBud();
    }

    if (Math.random() < intensity * occupancyBrake * 0.62) {
      spawnBud();
    }

    const lowFieldBoost = occupancy < 0.55 ? (0.34 + intensity * 0.25) : 0;
    if (lowFieldBoost > 0 && Math.random() < lowFieldBoost) {
      spawnBud();
    }

    const occupancyDelay = 1 + (occupancy * 1.05);
    const base = clamp((0.98 - intensity) / growthRate, 0.3, 2.2);
    const jitter = clamp((0.44 / growthRate) * (0.8 + occupancy * 0.5), 0.12, 1.4);
    state.spawnTimer = rand(base * occupancyDelay, (base * occupancyDelay) + jitter);
  }
}

function updateBuds(dtSec) {
  for (const bud of state.buds) {
    bud.flash = Math.max(0, bud.flash - dtSec * 2.4);
    bud.wobble = Math.max(0, bud.wobble - dtSec * 3.1);
  }
}

function updatePulses(dtSec) {
  const alive = [];
  for (const pulse of state.pulses) {
    pulse.r += 120 * dtSec;
    pulse.life -= dtSec;
    if (pulse.life > 0 && pulse.r <= pulse.maxR) {
      alive.push(pulse);
    }
  }
  state.pulses = alive;
}

function updateParticles(dt) {
  const frame = dt / 16.666;
  for (const p of state.particles) {
    p.x += p.vx * frame;
    p.y += p.vy * frame;
    p.vy += 0.016 * frame;
    p.life -= 1 * frame;
  }
  state.particles = state.particles.filter((p) => p.life > 0);
}

function updateEffects(dtSec) {
  for (const burst of state.breakBursts) {
    burst.life -= dtSec;
  }
  state.breakBursts = state.breakBursts.filter((burst) => burst.life > 0);

  for (const bolt of state.lightning) {
    bolt.life -= dtSec;
  }
  state.lightning = state.lightning.filter((bolt) => bolt.life > 0);
}

function shiftGardenMood() {
  const regularBuds = state.buds.filter((bud) => bud.type !== 2);
  if (regularBuds.length === 0) {
    setStatus("Garden breeze passed through.", 1.1);
    return;
  }

  const amber = regularBuds.filter((bud) => bud.type === 0);
  const teal = regularBuds.filter((bud) => bud.type === 1);
  const targetBlue = Math.round(regularBuds.length * BLUE_FLOWER_RATIO);

  let fromPool = [];
  let nextType = 0;

  if (teal.length > targetBlue) {
    fromPool = teal;
    nextType = 0;
  } else if (teal.length < targetBlue) {
    fromPool = amber;
    nextType = 1;
  }

  const swing = Math.max(1, Math.floor(regularBuds.length * 0.16));
  const needed = Math.abs(teal.length - targetBlue);
  const swaps = Math.min(swing, needed, fromPool.length);

  if (swaps > 0) {
    const shuffled = [...fromPool].sort(() => Math.random() - 0.5);
    for (let i = 0; i < swaps; i += 1) {
      const bud = shuffled[i];
      bud.type = nextType;
      bud.flash = Math.max(bud.flash, 0.4);
      bud.wobble = Math.max(bud.wobble, 0.2);
    }
    if (nextType === 0) {
      setStatus("Warm drift calmed blue blooms.", 1.25);
    } else {
      setStatus("Cool mist stirred new blue blooms.", 1.25);
    }
    return;
  }

  setStatus("Garden mood held steady.", 1.1);
}

function updateChallenge(dtSec) {
  if (!state.challenge) {
    state.challengeCooldown -= dtSec;
    if (state.challengeCooldown <= 0) {
      makeChallenge();
    }
  }

  syncStreakChallenge();
}

function update(dt) {
  const dtSec = dt / 1000;
  state.time += dtSec;

  state.pointerX += (state.pointerTargetX - state.pointerX) * 0.25;
  state.pointerY += (state.pointerTargetY - state.pointerY) * 0.25;

  if (state.statusTimer > 0) {
    state.statusTimer -= dtSec;
    if (state.statusTimer <= 0) {
      setPassiveStatus();
    }
  } else {
    setPassiveStatus();
  }

  if (!state.running) {
    updatePulses(dtSec);
    updateParticles(dt);
    updateEffects(dtSec);
    return;
  }

  if (state.frenzyTimer > 0) {
    state.frenzyTimer -= dtSec;
    if (state.frenzyTimer <= 0) {
      setStatus("Frenzy ended.", 1);
    }
  }

  updateSpawn(dtSec);
  updateBuds(dtSec);
  updatePulses(dtSec);
  updateParticles(dt);
  updateEffects(dtSec);
  updateChallenge(dtSec);

  state.seasonTimer -= dtSec;
  if (state.seasonTimer <= 0) {
    shiftGardenMood();
    state.seasonTimer = rand(10, 15);
  }

  syncHud();
}

function drawSprite(name, x, y, size = 16, alpha = 1) {
  const img = sprites[name];
  if (!img) return false;

  const px = Math.round(x);
  const py = Math.round(y);

  if (alpha >= 0.995) {
    wctx.drawImage(img, px, py, size, size);
    return true;
  }

  wctx.save();
  wctx.globalAlpha = alpha;
  wctx.drawImage(img, px, py, size, size);
  wctx.restore();
  return true;
}

function drawPixelCloud(x, y, dark, light, scale = 1) {
  const s = Math.max(1, scale);
  wctx.fillStyle = dark;
  wctx.fillRect(Math.round(x), Math.round(y), Math.round(18 * s), Math.round(6 * s));
  wctx.fillRect(Math.round(x + 3 * s), Math.round(y - 3 * s), Math.round(12 * s), Math.round(4 * s));
  wctx.fillRect(Math.round(x + 1 * s), Math.round(y + 2 * s), Math.round(16 * s), Math.round(4 * s));

  wctx.fillStyle = light;
  wctx.fillRect(Math.round(x + 3 * s), Math.round(y), Math.round(10 * s), Math.round(2 * s));
  wctx.fillRect(Math.round(x + 5 * s), Math.round(y - 2 * s), Math.round(6 * s), Math.round(2 * s));
}

function drawWindmill(x, y, t, color, scale = 1) {
  const s = Math.max(1, scale);
  wctx.fillStyle = "#5e6f7c";
  wctx.fillRect(x, y + Math.round(6 * s), Math.round(2 * s), Math.round(10 * s));
  wctx.fillRect(x - Math.round(1 * s), y + Math.round(14 * s), Math.round(4 * s), Math.round(2 * s));

  const hubX = x;
  const hubY = y + Math.round(5 * s);
  wctx.fillStyle = "#d8e4ec";
  wctx.fillRect(hubX - Math.round(1 * s), hubY - Math.round(1 * s), Math.round(3 * s), Math.round(3 * s));

  const bladeLen = Math.round(4 * s);
  for (let i = 0; i < 4; i += 1) {
    const a = t * 0.9 + i * (Math.PI / 2);
    const bx = hubX + Math.round(Math.cos(a) * bladeLen);
    const by = hubY + Math.round(Math.sin(a) * bladeLen);
    wctx.fillStyle = color;
    wctx.fillRect(bx - Math.round(1 * s), by - Math.round(1 * s), Math.round(2 * s), Math.round(2 * s));
  }
}

function drawBackground() {
  const t = state.time;
  const unit = clamp(Math.min(WORLD_W, WORLD_H) / 180, 0.85, 1.25);
  const px = (value) => Math.max(1, Math.round(value * unit));
  const wind = Math.sin(t * 0.3) * 0.8;
  const skyBands = ["#5f9ed2", "#73aedb", "#87bde3", "#9dcae9", "#b4d8ef", "#cde8f6"];
  const skyBandH = Math.max(px(14), Math.ceil(WORLD_H / skyBands.length));

  for (let i = 0; i < skyBands.length; i += 1) {
    wctx.fillStyle = skyBands[i];
    wctx.fillRect(0, i * skyBandH, WORLD_W, skyBandH + 1);
  }

  const sunX = WORLD_W * 0.82 + Math.sin(t * 0.08) * px(2.2);
  const sunY = WORLD_H * 0.12 + Math.cos(t * 0.07) * px(1.4);
  const sunCore = px(12);
  const sunRay = px(16);
  const sunGlow = px(20);
  wctx.fillStyle = "#ffeaa9";
  wctx.fillRect(Math.round(sunX - sunCore / 2), Math.round(sunY - sunCore / 2), sunCore, sunCore);
  wctx.fillStyle = "#ffd278";
  wctx.fillRect(Math.round(sunX - sunRay / 2), Math.round(sunY - 1), sunRay, 2);
  wctx.fillRect(Math.round(sunX - 1), Math.round(sunY - sunRay / 2), 2, sunRay);
  wctx.fillStyle = "rgba(255, 228, 153, 0.28)";
  wctx.fillRect(Math.round(sunX - sunGlow / 2), Math.round(sunY - sunGlow / 2), sunGlow, sunGlow);

  for (const cloud of FARM_CLOUDS) {
    const cloudX = (cloud.x / BASE_WORLD_W) * WORLD_W;
    const cx = ((cloudX + t * cloud.speed * unit) % (WORLD_W + px(40))) - px(20);
    const cy = (cloud.y / BASE_WORLD_H) * WORLD_H + Math.sin(t * 0.22 + cloud.x) * px(1.4);
    drawPixelCloud(cx, cy, "#eff8ff", "#ffffff", unit);
  }

  for (let x = 0; x < WORLD_W; x += px(2)) {
    const nx = x / Math.max(1, WORLD_W);
    const y = (WORLD_H * 0.36) + Math.sin(nx * WORLD_W * 0.045 + t * 0.07) * px(4) + Math.sin(nx * WORLD_W * 0.16) * px(3);
    wctx.fillStyle = "#7f97ad";
    wctx.fillRect(x, Math.round(y), px(2), Math.max(px(24), Math.round(WORLD_H * 0.26)));
  }
  for (let x = 0; x < WORLD_W; x += px(2)) {
    const nx = x / Math.max(1, WORLD_W);
    const y = (WORLD_H * 0.44) + Math.sin(nx * WORLD_W * 0.06 + 1.1 + t * 0.09) * px(4) + Math.sin(nx * WORLD_W * 0.11 + 1.9) * px(2);
    wctx.fillStyle = "#63886f";
    wctx.fillRect(x, Math.round(y), px(2), Math.max(px(18), Math.round(WORLD_H * 0.23)));
  }
  for (let x = 0; x < WORLD_W; x += px(4)) {
    const nx = x / Math.max(1, WORLD_W);
    const y = (WORLD_H * 0.51) + Math.sin(nx * WORLD_W * 0.09 + 0.8) * px(2);
    wctx.fillStyle = "#476f56";
    wctx.fillRect(x, Math.round(y), px(3), Math.max(px(10), Math.round(WORLD_H * 0.12)));
  }

  const barnX = Math.round(WORLD_W * 0.78);
  const barnY = Math.round(WORLD_H * 0.49);
  wctx.fillStyle = "#ae5959";
  wctx.fillRect(barnX, barnY, px(28), px(20));
  wctx.fillStyle = "#8f3e3e";
  wctx.fillRect(barnX - px(4), barnY - px(6), px(36), px(8));
  wctx.fillStyle = "#f4e7cf";
  wctx.fillRect(barnX + px(11), barnY + px(6), px(6), px(14));
  wctx.fillRect(barnX + px(4), barnY + px(4), px(4), px(4));
  wctx.fillRect(barnX + px(20), barnY + px(4), px(4), px(4));
  wctx.fillStyle = "#d2bf9a";
  wctx.fillRect(barnX + px(33), barnY + px(2), px(7), px(18));
  wctx.fillStyle = "#bba57f";
  wctx.fillRect(barnX + px(31), barnY - px(2), px(11), px(5));

  drawWindmill(Math.round(WORLD_W * 0.7), Math.round(WORLD_H * 0.48), t, "#f1f7ff", unit);

  const fieldStartY = Math.round(WORLD_H * 0.62);
  const pathStartY = Math.round(WORLD_H * 0.67);
  wctx.fillStyle = "#4d7f53";
  wctx.fillRect(0, fieldStartY, WORLD_W, WORLD_H - fieldStartY);
  for (let y = fieldStartY; y < WORLD_H; y += px(4)) {
    wctx.fillStyle = y % (px(8)) === 0 ? "#578c5e" : "#507f56";
    wctx.fillRect(0, y, WORLD_W, px(2));
  }

  wctx.fillStyle = "#87664a";
  for (let y = pathStartY; y < WORLD_H; y += 1) {
    const p = (y - pathStartY) / Math.max(1, WORLD_H - pathStartY);
    const center = WORLD_W * 0.5 + Math.sin(p * 3.6 + t * 0.25) * px(10);
    const half = px(6) + p * px(28);
    wctx.fillRect(Math.round(center - half), y, Math.round(half * 2), 1);
  }

  for (let x = px(4); x < WORLD_W; x += px(12)) {
    wctx.fillStyle = "#d8c3a0";
    wctx.fillRect(x, fieldStartY - px(1), px(2), px(9));
  }
  wctx.fillStyle = "#ccb08a";
  wctx.fillRect(0, fieldStartY + px(2), WORLD_W, 1);
  wctx.fillRect(0, fieldStartY + px(5), WORLD_W, 1);

  for (let row = pathStartY + px(6); row <= WORLD_H - px(8); row += px(10)) {
    for (let x = px(8); x < WORLD_W; x += px(10)) {
      const nx = x / Math.max(1, WORLD_W);
      const sway = (Math.sin(t * 2.2 + nx * 14 + row) > 0 ? 1 : 0) + Math.round(wind * 0.2);
      wctx.fillStyle = "#7cc891";
      wctx.fillRect(x + sway, row, 1, 3);
      wctx.fillStyle = "#5eaa78";
      wctx.fillRect(x - 1 + sway, row + 1, 1, 1);
      wctx.fillRect(x + 1 + sway, row + 1, 1, 1);
    }
  }

  wctx.fillStyle = "rgba(19, 34, 26, 0.15)";
  wctx.fillRect(0, Math.round(WORLD_H * 0.16), WORLD_W, Math.round(WORLD_H * 0.73));
  wctx.fillStyle = "rgba(252, 246, 230, 0.045)";
  wctx.fillRect(0, Math.round(WORLD_H * 0.6), WORLD_W, px(16));

  for (let y = 0; y < WORLD_H; y += px(8)) {
    for (let x = 0; x < WORLD_W; x += px(8)) {
      if ((x + y + Math.floor(t * 10)) % 16 === 0) {
        wctx.fillStyle = "rgba(255,255,255,0.028)";
        wctx.fillRect(x, y, 2, 2);
      }
    }
  }
}

function drawBeds() {
  for (const slot of bedSlots) {
    if (!drawSprite("bed", slot.x - 8, slot.y - 8, 16)) {
      wctx.fillStyle = "#6a4b30";
      wctx.fillRect(slot.x - 6, slot.y + 1, 12, 4);
      wctx.fillStyle = "#3f2d1f";
      wctx.fillRect(slot.x - 4, slot.y, 8, 2);
    }
  }

  for (const bud of state.buds) {
    const wobble = bud.wobble > 0 ? Math.sin(state.time * 24) * bud.wobble * 1.3 : 0;
    const bob = Math.sin(state.time * 4.8 + bud.petalPhase) * 0.8;
    const x = bud.x + wobble;
    const y = bud.y - 5 + bob;

    let spriteName = "flowerAmber";
    let glowColor = palette[0].glow;
    if (bud.type === 1) {
      spriteName = "flowerTeal";
      glowColor = palette[1].glow;
    } else if (bud.type === 2) {
      spriteName = "flowerGold";
      glowColor = "#ffe89b";
    }

    wctx.fillStyle = "rgba(20, 30, 22, 0.34)";
    wctx.fillRect(Math.round(x - 5), Math.round(y - 4), 10, 8);
    wctx.fillStyle = "rgba(36, 28, 18, 0.32)";
    wctx.fillRect(Math.round(x - 4), Math.round(y + 4), 8, 2);

    const auraAlpha = 0.18 + (Math.sin(state.time * 6 + bud.petalPhase) + 1) * 0.05;
    wctx.globalAlpha = clamp(auraAlpha, 0.08, 0.35);
    wctx.fillStyle = glowColor;
    wctx.fillRect(Math.round(x - 6), Math.round(y - 6), 12, 10);
    wctx.globalAlpha = 1;

    const drew = drawSprite(spriteName, x - 8, y - 9, 16);
    if (!drew) {
      wctx.fillStyle = bud.type === 2 ? "#ffd875" : palette[bud.type].color;
      wctx.fillRect(Math.round(x - 2), Math.round(y - 2), 4, 4);
      wctx.fillStyle = bud.type === 2 ? "#fff4c8" : palette[bud.type].glow;
      wctx.fillRect(Math.round(x - 1), Math.round(y - 1), 2, 2);
    }
    wctx.globalAlpha = 1;

    if (bud.flash > 0) {
      wctx.fillStyle = `rgba(255,255,255,${clamp(bud.flash * 0.35, 0, 0.35)})`;
      wctx.fillRect(Math.round(x - 6), Math.round(y - 5), 12, 10);
    }
  }
}

function drawPulses() {
  for (const pulse of state.pulses) {
    const p = palette[pulse.which];
    const alpha = clamp((pulse.life / 0.6) * pulse.alpha, 0, 1);

    wctx.strokeStyle = p.color;
    wctx.globalAlpha = alpha * 0.9;
    wctx.lineWidth = 1;
    wctx.beginPath();
    wctx.arc(Math.round(pulse.x), Math.round(pulse.y), Math.round(pulse.r), 0, Math.PI * 2);
    wctx.stroke();

    wctx.strokeStyle = p.glow;
    wctx.globalAlpha = alpha * 0.5;
    wctx.beginPath();
    wctx.arc(Math.round(pulse.x), Math.round(pulse.y), Math.round(pulse.r + 2), 0, Math.PI * 2);
    wctx.stroke();

    wctx.globalAlpha = 1;
  }
}

function drawBreakBursts() {
  for (const burst of state.breakBursts) {
    const alpha = clamp(burst.life / burst.maxLife, 0, 1);
    const radius = 4 + (1 - alpha) * (10 * burst.power);

    wctx.globalAlpha = alpha * 0.65;
    wctx.strokeStyle = burst.color;
    wctx.lineWidth = 1;
    wctx.beginPath();
    wctx.arc(Math.round(burst.x), Math.round(burst.y), Math.round(radius), 0, Math.PI * 2);
    wctx.stroke();

    wctx.globalAlpha = alpha * 0.45;
    wctx.strokeStyle = "#fff7e0";
    wctx.beginPath();
    wctx.arc(Math.round(burst.x), Math.round(burst.y), Math.round(radius + 2), 0, Math.PI * 2);
    wctx.stroke();

    wctx.globalAlpha = 1;
  }
}

function drawLightning() {
  for (const bolt of state.lightning) {
    const alpha = clamp(bolt.life / bolt.maxLife, 0, 1);
    const segments = 5;
    const dx = bolt.x2 - bolt.x1;
    const dy = bolt.y2 - bolt.y1;

    wctx.globalAlpha = alpha * 0.92;
    wctx.strokeStyle = bolt.color;
    wctx.lineWidth = 1;
    wctx.beginPath();
    wctx.moveTo(Math.round(bolt.x1), Math.round(bolt.y1));

    for (let i = 1; i < segments; i += 1) {
      const t = i / segments;
      const px = bolt.x1 + dx * t;
      const py = bolt.y1 + dy * t;
      const normalX = -dy;
      const normalY = dx;
      const normalLen = Math.hypot(normalX, normalY) || 1;
      const jitterBase = Math.sin(state.time * 36 + bolt.phase + i * 1.7) * 2.4;
      const jx = (normalX / normalLen) * jitterBase;
      const jy = (normalY / normalLen) * jitterBase;
      wctx.lineTo(Math.round(px + jx), Math.round(py + jy));
    }

    wctx.lineTo(Math.round(bolt.x2), Math.round(bolt.y2));
    wctx.stroke();

    wctx.globalAlpha = alpha * 0.5;
    wctx.strokeStyle = "#fff9d9";
    wctx.stroke();
    wctx.globalAlpha = 1;
  }
}

function drawPointerSpirit() {
  const frenzy = state.frenzyTimer > 0;
  const bob = Math.sin(state.time * 6.6) * 1.2;
  const name = palette[state.nextPalette].spirit;

  const drew = drawSprite(name, state.pointerX - 8, state.pointerY - 10 + bob, 16);
  if (!drew) {
    wctx.fillStyle = palette[state.nextPalette].color;
    wctx.fillRect(Math.round(state.pointerX - 4), Math.round(state.pointerY - 6 + bob), 8, 8);
  }

  wctx.strokeStyle = palette[state.nextPalette].glow;
  wctx.globalAlpha = frenzy ? 0.7 : 0.45;
  wctx.beginPath();
  wctx.arc(Math.round(state.pointerX), Math.round(state.pointerY + bob), frenzy ? 14 : 11, 0, Math.PI * 2);
  wctx.stroke();
  wctx.globalAlpha = 1;
}

function drawParticles() {
  for (const p of state.particles) {
    wctx.globalAlpha = clamp(p.life / 28, 0, 1);
    wctx.fillStyle = p.color;
    wctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
    wctx.globalAlpha = 1;
  }
}

function drawFrenzyOverlay() {
  if (state.frenzyTimer <= 0) return;
  const alpha = clamp((state.frenzyTimer / 6.6) * 0.12, 0, 0.12);
  wctx.fillStyle = `rgba(255, 236, 175, ${alpha})`;
  wctx.fillRect(0, 0, WORLD_W, WORLD_H);
}

function drawAssetStatus() {
  if (state.assetsReady && !state.missingSprites) return;

  wctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  wctx.fillRect(6, 6, 230, 14);
  wctx.fillStyle = "#f7f2e8";
  wctx.font = "8px monospace";
  const text = state.assetsReady
    ? "Sprite fallback active (drop files in assets/sprites)"
    : "Loading sprite kit...";
  wctx.fillText(text, 10, 16);
}

function render() {
  drawBackground();
  drawBeds();
  drawPulses();
  drawLightning();
  drawBreakBursts();
  drawPointerSpirit();
  drawParticles();
  drawFrenzyOverlay();
  drawAssetStatus();

  ctx.clearRect(0, 0, VIEW_W, VIEW_H);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(world, 0, 0, VIEW_W, VIEW_H);
}

let prevTime = performance.now();
function loop(now) {
  const dt = Math.min(33, now - prevTime);
  prevTime = now;

  update(dt);
  render();

  requestAnimationFrame(loop);
}

async function loadSprite(name, src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      sprites[name] = img;
      resolve(true);
    };
    img.onerror = () => {
      sprites[name] = null;
      resolve(false);
    };
    img.src = src;
  });
}

async function loadSprites() {
  const entries = Object.entries(spriteSources);
  const results = await Promise.all(entries.map(([name, src]) => loadSprite(name, src)));
  state.assetsReady = true;
  state.missingSprites = results.some((ok) => !ok);

  if (state.missingSprites) {
    setStatus("Some sprite files are missing. Using fallback blocks.", 2.2);
  }
}

async function startAudioMaybe(forcePing = false) {
  if (lofi.started && !lofi.muted && !forcePing) {
    return true;
  }

  const ok = await lofi.ensureStarted();
  if (!ok) {
    const stateLabel = lofi.context ? lofi.context.state : "no-context";
    setStatus(`Audio blocked (${stateLabel}). Tap game area, then Enable Lofi.`, 2.8);
    return false;
  }

  if (lofi.started && lofi.muted) {
    lofi.setMuted(false);
  }

  if (!lofi.muted && (forcePing || !didRunAudioUnlockPing)) {
    let pinged = lofi.playUnlockTone();
    if (!pinged && lofi.nativeAudioOnly) {
      postNativeAudio("unlock");
      didRunAudioUnlockPing = true;
      pinged = true;
    } else if (pinged) {
      postNativeAudio("unlock");
      didRunAudioUnlockPing = true;
    }
    if (pinged) {
      setStatus("Lofi enabled. You should hear a test ping.", 1.4);
    } else {
      const stateLabel = lofi.context ? lofi.context.state : "no-context";
      setStatus(`Lofi enabled but context is ${stateLabel}.`, 1.6);
    }
  }

  return true;
}

function canvasToWorld(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const nx = clamp((clientX - rect.left) / rect.width, 0, 1);
  const ny = clamp((clientY - rect.top) / rect.height, 0, 1);
  return { x: nx * WORLD_W, y: ny * WORLD_H };
}

function updatePointerFromClient(clientX, clientY) {
  const point = canvasToWorld(clientX, clientY);
  state.pointerTargetX = point.x;
  state.pointerTargetY = point.y;
}

function handleTap(clientX, clientY) {
  lofi.primeOnGesture();
  if (!lofi.started || lofi.muted) {
    void startAudioMaybe();
  }

  updatePointerFromClient(clientX, clientY);

  if (!state.running) {
    return;
  }

  tryBurstAt(state.pointerTargetX, state.pointerTargetY, performance.now());
}

function tryBurstAt(x, y, nowMs = performance.now()) {
  const elapsed = nowMs - state.lastBurstAtMs;
  if (elapsed < MIN_BURST_INTERVAL_MS) {
    if (nowMs - state.lastBlockedTapAtMs >= BLOCKED_SPAM_PENALTY_MS) {
      state.lastBlockedTapAtMs = nowMs;
      state.combo = Math.max(0, state.combo - 1);
      state.hype = clamp(state.hype - 1.6, 0, 100);
      setStatus("Too fast. Pace your bursts.", 0.9);
      syncHud();
    }
    return false;
  }

  state.lastBurstAtMs = nowMs;
  resolveTapBurst(x, y);
  return true;
}

function handlePointerDown(event) {
  event.preventDefault();
  postNativeAudio("gesture");
  handleTap(event.clientX, event.clientY);
}

function handlePointerMove(event) {
  updatePointerFromClient(event.clientX, event.clientY);
}

let lastAudioNudgeAt = -Infinity;
function nudgeAudio() {
  const now = performance.now();
  if (now - lastAudioNudgeAt < 220) return;
  lastAudioNudgeAt = now;
  if (lofi.started && !lofi.muted) return;
  lofi.primeOnGesture();
  void startAudioMaybe();
}

function handleViewportResize() {
  resizeGameSurface();
}

canvas.addEventListener("pointerdown", handlePointerDown);
canvas.addEventListener("pointermove", handlePointerMove);
window.addEventListener("touchend", nudgeAudio, { passive: true });
window.addEventListener("focus", () => {
  if (lofi.started) nudgeAudio();
});
document.addEventListener("visibilitychange", () => {
  if (!document.hidden && lofi.started) nudgeAudio();
});
window.addEventListener("resize", handleViewportResize);
window.addEventListener("orientationchange", () => {
  setTimeout(handleViewportResize, 80);
});
if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", handleViewportResize);
}

window.addEventListener("keydown", (event) => {
  if (["Space", "ArrowUp", "KeyW"].includes(event.code)) {
    event.preventDefault();
    if (!state.running) return;
    lofi.primeOnGesture();
    if (!lofi.started || lofi.muted) {
      void startAudioMaybe();
    }
    tryBurstAt(state.pointerX, state.pointerY, performance.now());
  }
});

if (audioBtn) {
  audioBtn.addEventListener("click", async () => {
    lofi.primeOnGesture();
    const ok = await lofi.ensureStarted();
    if (!ok) {
      const stateLabel = lofi.context ? lofi.context.state : "no-context";
      setStatus(`Audio start failed (${stateLabel}). Tap game area, then press Enable Lofi.`, 2.8);
      return;
    }

    lofi.toggleMuted();
    if (!lofi.muted) {
      const pinged = lofi.playUnlockTone() || didRunAudioUnlockPing;
      if (pinged) {
        postNativeAudio("unlock");
        didRunAudioUnlockPing = true;
      }
      setStatus(pinged ? "Lofi enabled. Test ping played." : "Lofi enabled.", 1.4);
    } else {
      setStatus("Lofi muted.", 1.1);
    }
  });
}

if (restartBtn) {
  restartBtn.addEventListener("click", () => {
    startSession();
  });
}

if (playBtn) {
  playBtn.addEventListener("click", () => {
    lofi.primeOnGesture();
    void startAudioMaybe();
    startSession();
  });
}

if (leaderboardBtn) {
  leaderboardBtn.addEventListener("click", () => {
    const openedNative = postNativeGameCenter("showLeaderboard");
    if (!openedNative) {
      showLeaderboardScreen();
    }
  });
}

if (leaderboardBackBtn) {
  leaderboardBackBtn.addEventListener("click", () => {
    showHomeScreen();
  });
}

if (menuCornerBtn) {
  menuCornerBtn.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    openMenuFromGame();
  });
}

resizeGameSurface();
if (bedSlots.length === 0) {
  rebuildBedSlots();
}
softReset(true);
loadSprites();
requestAnimationFrame(loop);
