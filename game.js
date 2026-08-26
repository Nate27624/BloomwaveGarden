const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const overlayEl = document.getElementById("overlay");
const overlayTitleEl = document.getElementById("overlay-title");
const homeScreenEl = document.getElementById("home-screen");
const leaderboardScreenEl = document.getElementById("leaderboard-screen");
const premiumScreenEl = document.getElementById("premium-screen");
const settingsScreenEl = document.getElementById("settings-screen");
const playBtn = document.getElementById("play-btn");
const leaderboardBtn = document.getElementById("leaderboard-btn");
const customBgBtn = document.getElementById("custom-bg-btn");
const leaderboardBackBtn = document.getElementById("leaderboard-back-btn");
const premiumBackBtn = document.getElementById("premium-back-btn");
const settingsBackBtn = document.getElementById("settings-back-btn");
const unlockBackgroundsBtn = document.getElementById("unlock-backgrounds-btn");
const unlockLifetimeBtn = document.getElementById("unlock-lifetime-btn");
const lifetimePriceEl = document.getElementById("lifetime-price");
const restorePurchasesBtn = document.getElementById("restore-purchases-btn");
const premiumSelectionEl = document.getElementById("premium-selection");
const fundingNoteEl = document.getElementById("funding-note");
const postRunUnlockPromptEl = document.getElementById("post-run-unlock-prompt");
const postRunUnlockTextEl = document.getElementById("post-run-unlock-text");
const postRunUnlockBtn = document.getElementById("post-run-unlock-btn");
const postRunUnlockPriceEl = document.getElementById("post-run-unlock-price");
const postRunUnlockProgressFillEl = document.getElementById("post-run-unlock-progress-fill");
const backgroundPreviewModalEl = document.getElementById("background-preview-modal");
const backgroundPreviewTitleEl = document.getElementById("background-preview-title");
const backgroundPreviewCloseBtn = document.getElementById("background-preview-close-btn");
const backgroundPreviewCanvas = document.getElementById("background-preview-canvas");
const backgroundPreviewUseBtn = document.getElementById("background-preview-use-btn");
const backgroundPreviewBloomsEl = document.getElementById("background-preview-blooms");
const backgroundPreviewProgressEl = document.querySelector(".background-preview-progress");
const backgroundPreviewProgressFillEl = document.getElementById("background-preview-progress-fill");
const backgroundPreviewRemainingEl = document.getElementById("background-preview-remaining");
const backgroundPreviewAdBtn = document.getElementById("background-preview-ad-btn");
const backgroundPreviewPurchaseBtn = document.getElementById("background-preview-purchase-btn");
const backgroundTileEls = document.querySelectorAll("[data-backdrop]");
const leaderboardListEl = document.getElementById("leaderboard-list");
const leaderboardSearchEl = document.getElementById("leaderboard-search");
const shareScoreBtn = document.getElementById("share-score-btn");
const scoreboardRankEl = document.getElementById("scoreboard-rank");
const scoreboardNameEl = document.getElementById("scoreboard-name");
const scoreboardBloomsEl = document.getElementById("scoreboard-blooms");
const scoreboardCratesEl = document.getElementById("scoreboard-crates");
const scoreboardCrateGridEl = document.getElementById("scoreboard-crate-grid");
const menuCornerBtn = document.getElementById("menu-corner-btn");
const settingsCornerBtn = document.getElementById("settings-corner-btn");
const tapVolumeInput = document.getElementById("tap-volume-input");
const tapVolumeValueEl = document.getElementById("tap-volume-value");
const gameCenterVisibilityToggle = document.getElementById("game-center-visibility-toggle");
const colorBackdropBtn = document.getElementById("color-backdrop-btn");
const colorBackdropInput = document.getElementById("color-backdrop-input");
const stageWrapEl = document.querySelector(".stage-wrap");
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

const MAX_BUDS = 44;
const MAX_PULSES = 18;
const MAX_PARTICLES = 320;
const MAX_BREAK_BURSTS = 24;
const MAX_LIGHTNING = 64;
const MAX_VIEW_PIXELS = 1_450_000;
const MIN_BURST_INTERVAL_MS = 240;
const BLOCKED_SPAM_PENALTY_MS = 180;
const OPENING_ZAP_SPAWN_COOLDOWN_SEC = 0.5;
const LEADERBOARD_AUTOSAVE_INTERVAL_MS = 10000;
const LEADERBOARD_AUTOSAVE_BLOOM_STEP = 1000;
// Flower growth speed: >1 faster growth/spawn, <1 slower.
const FLOWER_GROWTH_RATE = 0.72;
const SCORE_COMBO_CAP = 100;
const BLUE_FLOWER_RATIO = 0.2;
const INITIAL_FIELD_FILL_RATIO = 0.8;
const PACKED_FIELD_RATIO = 0.95;
const PACKED_LIGHTNING_BONUS = 6;
const STARTING_PALETTE = 1;
const LEADERBOARD_STORAGE_KEY = "bloomwave_leaderboard_players_v2";
const LEGACY_LEADERBOARD_STORAGE_KEY = "bloomwave_leaderboard_v1";
const PLAYER_PROFILE_STORAGE_KEY = "bloomwave_player_profile_v1";
const PLAYER_TOTALS_STORAGE_KEY = "bloomwave_player_totals_v1";
const BACKDROP_STORAGE_KEY = "bloomwave_backdrop_v1";
const BACKDROP_COLOR_STORAGE_KEY = "bloomwave_backdrop_color_v1";
const BACKDROP_UNLOCKS_STORAGE_KEY = "bloomwave_backdrop_unlocks_v1";
const TEMP_BACKDROP_ACCESS_STORAGE_KEY = "bloomwave_backdrop_temp_access_v1";
const TEMP_USAGE_LOG_STORAGE_KEY = "bloomwave_usage_log_tmp_v1";
const FIRST_START_STORAGE_KEY = "bloomwave_first_start_seen_v1";
const DAILY_DEAL_STORAGE_KEY = "bloomwave_daily_background_deal_v1";
const GAME_SETTINGS_STORAGE_KEY = "bloomwave_game_settings_v1";
const DEFAULT_BACKDROP_COLOR = "#7c68d8";
const DEFAULT_GAME_SETTINGS = {
  tapEffectVolume: 1,
  showOnGameCenter: true,
};
const BACKDROP_IDS = ["classic", "twilight", "aurora", "ember", "color", "flag", "rose", "frost", "azure"];
const BASE_UNLOCKED_BACKDROP_IDS = ["classic"];
const FREE_BACKDROP_IDS = ["classic", "twilight", "aurora"];
const BACKDROP_PRICE_LABELS = Object.fromEntries(
  BACKDROP_IDS
    .filter((backdrop) => backdrop !== "classic")
    .map((backdrop) => [backdrop, FREE_BACKDROP_IDS.includes(backdrop) ? "$.50" : "$0.99"]),
);
const FUNDING_NOTE_DEFAULT = "Thank you for considering purchasing a background. These funds help us build more fun, simple games.";
const FUNDING_NOTE_LIFETIME_ACTIVE = "Thank you for your purchase! More maps are planned for development.";
const DAILY_DEAL_PRICE_LABEL = "$.50";
const REWARDED_BACKDROP_ACCESS_HOURS = 24;
const MIN_UNLOCK_PROGRESS_DISPLAY = 0.08;
const LIFETIME_PRODUCT_ID = "com.nate27624.bloomwavegarden.backgrounds.lifetime";
const BACKDROP_PRODUCT_IDS = {
  twilight: "com.nate27624.bloomwavegarden.background.citylight",
  aurora: "com.nate27624.bloomwavegarden.background.moonlitfalls",
  ember: "com.nate27624.bloomwavegarden.background.emberfield",
  color: "com.nate27624.bloomwavegarden.background.colorfield",
  flag: "com.nate27624.bloomwavegarden.background.americanflag",
  rose: "com.nate27624.bloomwavegarden.background.rosedunes",
  frost: "com.nate27624.bloomwavegarden.background.frostmeadow",
  azure: "com.nate27624.bloomwavegarden.background.azurereef",
};
const PRODUCT_BACKDROP_IDS = Object.fromEntries(
  Object.entries(BACKDROP_PRODUCT_IDS).map(([backdrop, productID]) => [productID, backdrop]),
);
const DEFAULT_ESTIMATED_BLOOMS_PER_MINUTE = 300;
const BACKDROP_UNLOCK_BLOOMS_PER_MINUTE = 10000;
const BACKDROP_UNLOCK_BLOOM_ROUNDING = 10000000;
const BACKDROP_UNLOCK_BLOOM_TARGETS = {
  twilight: 15000000,
  aurora: 75000000,
};
const FARMING_UNLOCK_HOURS = {
  classic: 0,
  twilight: 24,
  aurora: 120,
};
const BACKDROP_DISPLAY_NAMES = {
  classic: "Classic Farm",
  twilight: "Citylight Grove",
  aurora: "Moonlit Falls",
  ember: "Ember Field",
  color: "Color Field",
  flag: "American Flag",
  rose: "Rose Dunes",
  frost: "Frost Meadow",
  azure: "Azure Reef",
};
const BACKDROP_DESCRIPTIONS = {
  classic: "Sunny rows, soft grass, and the original farm view.",
  twilight: "Neon skyline, glowing windows, and a deep violet grove.",
  aurora: "Moonlit waterfalls, fireflies, and cool forest mist.",
  ember: "Grazing deer, warm grass, and a calm ember meadow.",
  color: "A clean field in your chosen color.",
  flag: "Flag of the United States.",
  rose: "Pink dunes, rose-tinted grass, and a soft desert glow.",
  frost: "Snowy fields, pale trees, and a quiet winter horizon.",
  azure: "Blue reef water and coral shapes.",
};
const BACKDROP_PREVIEW_CLASSES = {
  classic: "classic",
  twilight: "twilight",
  aurora: "falls",
  ember: "ember",
  color: "color",
  flag: "flag",
  rose: "rose",
  frost: "frost",
  azure: "azure",
};
const MAX_LEADERBOARD_ENTRIES = 10;
const NATIVE_LEADERBOARD_REQUEST_LIMIT = 25;
const SHOWCASE_LEADERBOARD_ENTRY = {
  id: "npc-crate-overlord",
  name: "Crate Overlord",
  totalBlooms: 10000,
  totalCrates: 10000,
  isNpc: true,
  isShowcase: true,
};
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
let wctx = world.getContext("2d");
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
let fieldLayoutScaleX = 1;
let fieldLayoutScaleY = 1;
let fieldBurstVisualScale = 1;

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
  const isPortrait = WORLD_H > WORLD_W * 1.08;
  const isLandscape = WORLD_W > WORLD_H * 1.08;
  const sideMargin = isLandscape ? 26 : 16;
  const topMargin = isLandscape ? 38 : (isPortrait ? 28 : 22);
  const bottomMargin = isPortrait ? 16 : 14;
  const expansionBlend = 1 / 3;
  const usableW = Math.max(98, WORLD_W - sideMargin * 2);
  const usableH = Math.max(84, WORLD_H - topMargin - bottomMargin);
  const originalFieldW = clamp(156, 98, Math.round(WORLD_W * 0.84));
  const originalFieldH = clamp(116, 84, Math.round(WORLD_H * 0.74));
  const expandedFieldW = isLandscape
    ? usableW
    : Math.min(usableW, Math.max(156, WORLD_W * 0.86));
  const expandedFieldH = isPortrait
    ? usableH
    : Math.min(usableH, Math.max(116, WORLD_H * 0.72));
  const fieldW = Math.round(lerp(originalFieldW, expandedFieldW, expansionBlend));
  const fieldH = Math.round(lerp(originalFieldH, expandedFieldH, expansionBlend));
  const left = Math.round((WORLD_W - fieldW) * 0.5);
  const originalTop = (WORLD_H - originalFieldH) * 0.48;
  const expandedTop = topMargin + (usableH - expandedFieldH) * (isPortrait ? 0.45 : 0.5);
  const top = Math.round(isLandscape
    ? Math.max(topMargin, lerp(originalTop, expandedTop, expansionBlend))
    : lerp(originalTop, expandedTop, expansionBlend));
  const width = Math.max(24, fieldW);
  const height = Math.max(24, fieldH);
  fieldLayoutScaleX = clamp(width / Math.max(1, originalFieldW), 0.85, 2.2);
  fieldLayoutScaleY = clamp(height / Math.max(1, originalFieldH), 0.85, 2.2);
  fieldBurstVisualScale = clamp(Math.sqrt(fieldLayoutScaleX * fieldLayoutScaleY), 0.9, 1.55);

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

function getLayoutAdjustedDistanceSq(dx, dy) {
  const adjustedX = dx / Math.max(0.1, fieldLayoutScaleX);
  const adjustedY = dy / Math.max(0.1, fieldLayoutScaleY);
  return (adjustedX * adjustedX) + (adjustedY * adjustedY);
}

function getFlowerBlockedRects() {
  return [];
}

function syncViewportCssVars() {
  const viewport = window.visualViewport;
  const width = Math.max(1, Math.round(viewport?.width || window.innerWidth || 1));
  const height = Math.max(1, Math.round(viewport?.height || window.innerHeight || 1));
  document.documentElement.style.setProperty("--app-width", `${width}px`);
  document.documentElement.style.setProperty("--app-height", `${height}px`);
}

function isSlotBlockedByUi(slot, blockedRects = getFlowerBlockedRects()) {
  const flowerRect = {
    left: slot.x - 12,
    right: slot.x + 12,
    top: slot.y - 22,
    bottom: slot.y + 8,
  };

  return blockedRects.some((rect) => (
    flowerRect.right >= rect.left
      && flowerRect.left <= rect.right
      && flowerRect.bottom >= rect.top
      && flowerRect.top <= rect.bottom
  ));
}

function syncBudsToSlots() {
  const used = new Set();
  const blockedRects = getFlowerBlockedRects();
  for (const bud of state.buds) {
    let slotIndex = Number.isInteger(bud.slotIndex) ? bud.slotIndex : -1;
    const slot = bedSlots[slotIndex];
    if (
      slotIndex < 0
        || slotIndex >= bedSlots.length
        || used.has(slotIndex)
        || !slot
        || isSlotBlockedByUi(slot, blockedRects)
    ) {
      const openSlot = bedSlots.find((candidate) => (
        !used.has(candidate.index) && !isSlotBlockedByUi(candidate, blockedRects)
      ));
      slotIndex = openSlot ? openSlot.index : -1;
      if (slotIndex < 0) {
        bud._prune = true;
        continue;
      }
      bud.slotIndex = slotIndex;
    }

    const availableSlot = bedSlots[slotIndex];
    bud.x = availableSlot.x;
    bud.y = availableSlot.y;
    used.add(slotIndex);
  }

  state.buds = state.buds.filter((bud) => !bud._prune);
}

function resizeGameSurface() {
  syncViewportCssVars();
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

  const targetWorldW = Math.max(120, Math.round(cssW * worldUnitsPerCss));
  const targetWorldH = Math.max(120, Math.round(cssH * worldUnitsPerCss));

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
  committedScore: 0,
  hype: 72,
  harvestProgress: 0,
  harvestGoal: 12,
  crates: 0,
  committedCrates: 0,
  combo: 0,
  bestCombo: 0,
  nextPalette: STARTING_PALETTE,
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
  openingZapAvailable: false,
  lastBurstAtMs: -Infinity,
  lastBlockedTapAtMs: -Infinity,
  stats: {
    amberHits: 0,
    tealHits: 0,
    frenzyCount: 0,
  },
  backdrop: "classic",
  backdropColor: DEFAULT_BACKDROP_COLOR,
  assetsReady: false,
  missingSprites: false,
};

function normalizeHexColor(color, fallback = DEFAULT_BACKDROP_COLOR) {
  if (typeof color !== "string") return fallback;
  const trimmed = color.trim();
  return /^#[0-9a-f]{6}$/i.test(trimmed) ? trimmed.toLowerCase() : fallback;
}

function hexToRgb(color) {
  const normalized = normalizeHexColor(color);
  return {
    r: parseInt(normalized.slice(1, 3), 16),
    g: parseInt(normalized.slice(3, 5), 16),
    b: parseInt(normalized.slice(5, 7), 16),
  };
}

function mixRgb(a, b, amount) {
  const p = clamp(amount, 0, 1);
  return {
    r: Math.round(a.r + (b.r - a.r) * p),
    g: Math.round(a.g + (b.g - a.g) * p),
    b: Math.round(a.b + (b.b - a.b) * p),
  };
}

function rgbString(color, alpha = 1) {
  return alpha >= 1
    ? `rgb(${color.r}, ${color.g}, ${color.b})`
    : `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
}

function readBackdropPreference() {
  try {
    const stored = localStorage.getItem(BACKDROP_STORAGE_KEY);
    return BACKDROP_IDS.includes(stored) ? stored : "classic";
  } catch {
    return "classic";
  }
}

function readBackdropColorPreference() {
  try {
    return normalizeHexColor(localStorage.getItem(BACKDROP_COLOR_STORAGE_KEY));
  } catch {
    return DEFAULT_BACKDROP_COLOR;
  }
}

function readBackdropUnlocks() {
  try {
    const parsed = JSON.parse(localStorage.getItem(BACKDROP_UNLOCKS_STORAGE_KEY) || "{}");
    const unlocked = Array.isArray(parsed.unlocked)
      ? parsed.unlocked.filter((backdrop) => BACKDROP_IDS.includes(backdrop))
      : [];
    return {
      lifetime: Boolean(parsed.lifetime),
      unlocked: [...new Set(unlocked)],
    };
  } catch {
    return { lifetime: false, unlocked: [] };
  }
}

function writeBackdropUnlocks(unlocks) {
  try {
    localStorage.setItem(BACKDROP_UNLOCKS_STORAGE_KEY, JSON.stringify(unlocks));
  } catch {
    // Ignore storage write failures.
  }
}

function readTemporaryBackdropAccess() {
  try {
    const parsed = JSON.parse(localStorage.getItem(TEMP_BACKDROP_ACCESS_STORAGE_KEY) || "{}");
    return Object.fromEntries(
      Object.entries(parsed)
        .filter(([backdrop, expiresAt]) => BACKDROP_IDS.includes(backdrop) && Number(expiresAt) > Date.now()),
    );
  } catch {
    return {};
  }
}

function writeTemporaryBackdropAccess(access) {
  try {
    localStorage.setItem(TEMP_BACKDROP_ACCESS_STORAGE_KEY, JSON.stringify(access));
  } catch {
    // Ignore storage write failures.
  }
}

function getTemporaryBackdropExpiresAt(backdrop) {
  const expiresAt = Number(temporaryBackdropAccess[backdrop]) || 0;
  return expiresAt > Date.now() ? expiresAt : 0;
}

function hasTemporaryBackdropAccess(backdrop) {
  return getTemporaryBackdropExpiresAt(backdrop) > 0;
}

function grantTemporaryBackdropAccess(backdrop, hours = REWARDED_BACKDROP_ACCESS_HOURS) {
  if (!BACKDROP_IDS.includes(backdrop) || backdrop === "classic") return;
  temporaryBackdropAccess = {
    ...readTemporaryBackdropAccess(),
    [backdrop]: Date.now() + hours * 60 * 60 * 1000,
  };
  writeTemporaryBackdropAccess(temporaryBackdropAccess);
  selectedLockedBackdrop = null;
  state.backdrop = backdrop;
  writeBackdropPreference(backdrop);
  hideBackgroundPreview();
  startSession();
  syncBackdropTiles();
}

function writeBackdropPreference(backdrop) {
  try {
    localStorage.setItem(BACKDROP_STORAGE_KEY, backdrop);
  } catch {
    // Ignore storage write failures.
  }
}

function writeBackdropColorPreference(color) {
  try {
    localStorage.setItem(BACKDROP_COLOR_STORAGE_KEY, color);
  } catch {
    // Ignore storage write failures.
  }
}

function syncColorControls() {
  const color = normalizeHexColor(state.backdropColor);
  document.documentElement.style.setProperty("--selected-backdrop-color", color);
  if (colorBackdropInput) colorBackdropInput.value = color;
  const isActive = state.backdrop === "color" && overlayEl?.classList.contains("hidden");
  colorBackdropBtn?.classList.toggle("is-hidden", !isActive);
}

function getDailyDealDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function pickDailyDealBackdrop(dateKey = getDailyDealDateKey()) {
  const candidates = BACKDROP_IDS.filter((backdrop) => (
    backdrop !== "classic" && BACKDROP_PRODUCT_IDS[backdrop]
  ));
  if (candidates.length === 0) return "";

  let hash = 0;
  for (let i = 0; i < dateKey.length; i += 1) {
    hash = ((hash * 31) + dateKey.charCodeAt(i)) >>> 0;
  }
  return candidates[hash % candidates.length] || "";
}

function getDailyDealBackdrop() {
  try {
    const dateKey = getDailyDealDateKey();
    const parsed = JSON.parse(localStorage.getItem(DAILY_DEAL_STORAGE_KEY) || "{}");
    if (parsed?.dateKey === dateKey && BACKDROP_IDS.includes(parsed.backdrop)) {
      return parsed.backdrop;
    }

    const backdrop = pickDailyDealBackdrop(dateKey);
    localStorage.setItem(DAILY_DEAL_STORAGE_KEY, JSON.stringify({ dateKey, backdrop }));
    return backdrop;
  } catch {
    return pickDailyDealBackdrop();
  }
}

function isDailyDealBackdrop(backdrop) {
  return backdrop === getDailyDealBackdrop();
}

function getBackdropPriceLabel(backdrop) {
  if (isDailyDealBackdrop(backdrop) && !isBackdropUnlocked(backdrop)) return DAILY_DEAL_PRICE_LABEL;
  const productID = BACKDROP_PRODUCT_IDS[backdrop];
  return (productID && nativeProductPrices[productID]) || BACKDROP_PRICE_LABELS[backdrop] || "$0.99";
}

function getLifetimePriceLabel() {
  return nativeProductPrices[LIFETIME_PRODUCT_ID] || "$4.99";
}

function syncBackdropTiles() {
  const previewBackdrop = selectedLockedBackdrop || state.backdrop;
  temporaryBackdropAccess = readTemporaryBackdropAccess();
  for (const tile of backgroundTileEls) {
    const backdrop = tile.dataset.backdrop;
    if (!BACKDROP_IDS.includes(backdrop)) continue;
    const selected = backdrop === previewBackdrop;
    const free = isBackdropFree(backdrop);
    const unlocked = isBackdropUnlocked(backdrop);
    const tempAccess = hasTemporaryBackdropAccess(backdrop);
    const usable = unlocked || tempAccess;
    const dailyDeal = isDailyDealBackdrop(backdrop) && !unlocked && !tempAccess;
    tile.classList.toggle("is-selected", selected);
    tile.classList.toggle("is-free", free);
    tile.classList.toggle("is-locked", !usable);
    tile.classList.toggle("has-temp-access", tempAccess && !unlocked);
    tile.classList.toggle("is-daily-deal", dailyDeal);
    tile.setAttribute("aria-pressed", selected ? "true" : "false");
    tile.setAttribute("aria-label", `${BACKDROP_DISPLAY_NAMES[backdrop] || "Background"} ${usable ? "available" : "locked"}`);
    tile.dataset.price = dailyDeal ? `Deal ${getBackdropPriceLabel(backdrop)}` : getBackdropBadge(backdrop, unlocked, tempAccess);
    tile.dataset.deal = "";
    tile.querySelector("span")?.setAttribute("data-deal", "");
  }

  if (unlockBackgroundsBtn) {
    unlockBackgroundsBtn.disabled = true;
    unlockBackgroundsBtn.classList.add("is-hidden");
    unlockBackgroundsBtn.dataset.backdrop = "";
  }

  if (unlockLifetimeBtn) {
    if (lifetimePriceEl) {
      lifetimePriceEl.textContent = getLifetimePriceLabel();
    } else {
      unlockLifetimeBtn.textContent = `Lifetime Pass ${getLifetimePriceLabel()} (best value)`;
    }
    unlockLifetimeBtn.disabled = backdropUnlocks.lifetime;
    unlockLifetimeBtn.classList.toggle("is-hidden", backdropUnlocks.lifetime);
  }

  if (restorePurchasesBtn) {
    restorePurchasesBtn.classList.toggle("is-hidden", !hasNativePurchaseBridge() || backdropUnlocks.lifetime);
  }

  if (fundingNoteEl) {
    fundingNoteEl.textContent = backdropUnlocks.lifetime ? FUNDING_NOTE_LIFETIME_ACTIVE : FUNDING_NOTE_DEFAULT;
  }

  syncColorControls();
}

function selectBackdrop(backdrop) {
  if (!BACKDROP_IDS.includes(backdrop)) return;
  if (!isBackdropUsable(backdrop)) {
    selectedLockedBackdrop = backdrop;
    syncBackdropTiles();
    return;
  }
  selectedLockedBackdrop = null;
  state.backdrop = backdrop;
  writeBackdropPreference(backdrop);
  syncBackdropTiles();
}

function renderBackdropToCanvas(targetCanvas, backdrop) {
  if (!targetCanvas) return;
  const previewCtx = targetCanvas.getContext("2d");
  if (!previewCtx) return;

  const previousCtx = wctx;
  const previousWorldW = WORLD_W;
  const previousWorldH = WORLD_H;
  const previousBackdrop = state.backdrop;
  const previousTime = state.time;

  try {
    WORLD_W = BASE_WORLD_W;
    WORLD_H = BASE_WORLD_H;
    state.backdrop = backdrop;
    state.time = Math.max(previousTime, performance.now() / 1000);
    wctx = previewCtx;
    previewCtx.imageSmoothingEnabled = false;
    previewCtx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
    drawBackground();
    drawBackdropActors();
  } catch (error) {
    console.warn("[Bloomwave] Background preview failed", error);
  } finally {
    wctx = previousCtx;
    WORLD_W = previousWorldW;
    WORLD_H = previousWorldH;
    state.backdrop = previousBackdrop;
    state.time = previousTime;
  }
}

function renderBackgroundPreview(backdrop) {
  renderBackdropToCanvas(backgroundPreviewCanvas, backdrop);
}

function getBackdropUnlockLine(backdrop, unlocked, stats = getTemporaryUsageStats()) {
  if (unlocked) return "Unlocked";
  const progress = getBackdropUnlockProgress(backdrop, stats);
  if (progress.targetBlooms <= 0) return "Premium Background";
  return "";
}

function showBackgroundPreview(backdrop) {
  if (!BACKDROP_IDS.includes(backdrop) || !backgroundPreviewModalEl) return;
  temporaryBackdropAccess = readTemporaryBackdropAccess();
  const tempAccess = hasTemporaryBackdropAccess(backdrop);
  const usable = isBackdropUsable(backdrop);
  selectedLockedBackdrop = usable ? null : backdrop;
  const stats = getTemporaryUsageStats();
  const unlocked = isBackdropUnlocked(backdrop);
  const name = BACKDROP_DISPLAY_NAMES[backdrop] || "Background";
  const price = getBackdropPriceLabel(backdrop);
  const progress = getBackdropUnlockProgress(backdrop, stats);
  const hasBloomUnlock = progress.targetBlooms > 0;
  const remainingBlooms = Math.max(0, Math.ceil(progress.targetBlooms - stats.totalBlooms));

  if (backgroundPreviewTitleEl) backgroundPreviewTitleEl.textContent = name;
  if (backgroundPreviewUseBtn) {
    backgroundPreviewUseBtn.textContent = "Use Background";
    backgroundPreviewUseBtn.disabled = !usable;
    backgroundPreviewUseBtn.classList.toggle("is-hidden", !usable);
    backgroundPreviewUseBtn.dataset.backdrop = backdrop;
  }
  if (backgroundPreviewBloomsEl) {
    backgroundPreviewBloomsEl.textContent = BACKDROP_DESCRIPTIONS[backdrop] || "";
  }
  if (backgroundPreviewProgressFillEl) {
    backgroundPreviewProgressFillEl.style.width = formatUnlockProgressWidth(progress.progress);
  }
  if (backgroundPreviewProgressEl) {
    backgroundPreviewProgressEl.classList.toggle("is-hidden", !hasBloomUnlock);
  }
  if (backgroundPreviewRemainingEl) {
    const tempExpiresAt = getTemporaryBackdropExpiresAt(backdrop);
    backgroundPreviewRemainingEl.textContent = unlocked
      ? "Unlocked"
      : tempAccess && tempExpiresAt
        ? `Equipped for ${formatTemporaryAccessRemaining(tempExpiresAt)}`
        : hasBloomUnlock
          ? `${formatLargeNumber(remainingBlooms)} Blooms left`
          : "";
    backgroundPreviewRemainingEl.classList.toggle("is-hidden", !backgroundPreviewRemainingEl.textContent);
  }
  if (backgroundPreviewAdBtn) {
    const canWatchAd = backdrop !== "classic" && !unlocked && !tempAccess;
    backgroundPreviewAdBtn.textContent = tempAccess && !unlocked
      ? `Equipped ${formatTemporaryAccessRemaining(getTemporaryBackdropExpiresAt(backdrop))}`
      : `Watch Ad: 24h Access`;
    backgroundPreviewAdBtn.disabled = !canWatchAd;
    backgroundPreviewAdBtn.classList.toggle("is-hidden", backdrop === "classic" || unlocked);
    backgroundPreviewAdBtn.dataset.backdrop = canWatchAd ? backdrop : "";
  }
  if (backgroundPreviewPurchaseBtn) {
    const canPurchase = backdrop !== "classic" && Boolean(BACKDROP_PRICE_LABELS[backdrop]) && !unlocked;
    backgroundPreviewPurchaseBtn.textContent = `Unlock Forever ${price}`;
    backgroundPreviewPurchaseBtn.disabled = !canPurchase;
    backgroundPreviewPurchaseBtn.classList.toggle("is-hidden", !canPurchase);
    backgroundPreviewPurchaseBtn.dataset.backdrop = canPurchase ? backdrop : "";
  }

  renderBackgroundPreview(backdrop);
  syncBackdropTiles();
  backgroundPreviewModalEl.classList.remove("screen-hidden");
}

function hideBackgroundPreview() {
  backgroundPreviewModalEl?.classList.add("screen-hidden");
}

function closeBackgroundPreviewToOverview() {
  selectedLockedBackdrop = null;
  hideBackgroundPreview();
  showPremiumScreen();
  syncBackdropTiles();
}

function setBackdropColor(color) {
  state.backdropColor = normalizeHexColor(color);
  writeBackdropColorPreference(state.backdropColor);
  syncColorControls();
}

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
    isNative: Boolean(entry.isNative),
    nativeRank: Math.max(0, Math.floor(Number(entry.nativeRank ?? entry.rank) || 0)),
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

function hasNativeGameCenterBridge() {
  return Boolean(window.webkit?.messageHandlers?.nativeGameCenter);
}

function shouldUseDemoLeaderboardRows() {
  return !hasNativeGameCenterBridge();
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
  const showcaseEntry = entries.find((entry) => entry.id === SHOWCASE_LEADERBOARD_ENTRY.id);
  if (showcaseEntry) {
    Object.assign(showcaseEntry, SHOWCASE_LEADERBOARD_ENTRY);
  } else {
    entries.push({ ...SHOWCASE_LEADERBOARD_ENTRY });
  }

  const existingNpcIds = new Set(entries.filter((entry) => entry.isNpc).map((entry) => entry.id));
  for (let i = 0; i < COMMUNITY_PLAYER_NAMES.length; i += 1) {
    const candidate = buildCommunityEntry(COMMUNITY_PLAYER_NAMES[i], i);
    if (!existingNpcIds.has(candidate.id)) {
      entries.push(candidate);
      existingNpcIds.add(candidate.id);
    }
  }
}

function readLeaderboard(profile, options = {}) {
  try {
    const includeDemoRows = options.includeDemoRows ?? shouldUseDemoLeaderboardRows();
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

    if (includeDemoRows) {
      seedCommunityPlayers(parsedEntries);
    } else {
      parsedEntries = parsedEntries.filter((entry) => !entry.isNpc);
    }
    ensurePlayerEntry(parsedEntries, profile);
    sortLeaderboard(parsedEntries);
    return parsedEntries;
  } catch {
    const fallback = [];
    if (options.includeDemoRows ?? shouldUseDemoLeaderboardRows()) {
      seedCommunityPlayers(fallback);
    }
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

function normalizePlayerTotals(totals = {}) {
  return {
    blooms: Math.max(0, Math.floor(Number(totals.blooms ?? totals.totalBlooms) || 0)),
    crates: Math.max(0, Math.floor(Number(totals.crates ?? totals.totalCrates) || 0)),
  };
}

function readPlayerTotals() {
  try {
    return normalizePlayerTotals(JSON.parse(localStorage.getItem(PLAYER_TOTALS_STORAGE_KEY) || "{}"));
  } catch {
    return { blooms: 0, crates: 0 };
  }
}

function writePlayerTotals(totals) {
  try {
    localStorage.setItem(PLAYER_TOTALS_STORAGE_KEY, JSON.stringify(normalizePlayerTotals(totals)));
  } catch {
    // Ignore storage write failures (private mode / quota / blocked storage).
  }
}

function normalizeGameSettings(settings = {}) {
  const tapEffectVolume = Number(settings.tapEffectVolume);
  return {
    tapEffectVolume: Number.isFinite(tapEffectVolume) ? clamp(tapEffectVolume, 0, 1) : DEFAULT_GAME_SETTINGS.tapEffectVolume,
    showOnGameCenter: settings.showOnGameCenter !== false,
  };
}

function readGameSettings() {
  try {
    const parsed = JSON.parse(localStorage.getItem(GAME_SETTINGS_STORAGE_KEY) || "{}");
    return normalizeGameSettings({
      ...DEFAULT_GAME_SETTINGS,
      ...parsed,
    });
  } catch {
    return { ...DEFAULT_GAME_SETTINGS };
  }
}

function writeGameSettings(settings) {
  try {
    localStorage.setItem(GAME_SETTINGS_STORAGE_KEY, JSON.stringify(normalizeGameSettings(settings)));
  } catch {
    // Ignore storage write failures (private mode / quota / blocked storage).
  }
}

function syncSettingsControls() {
  const volumePercent = Math.round(appSettings.tapEffectVolume * 100);
  if (tapVolumeInput) tapVolumeInput.value = String(volumePercent);
  if (tapVolumeValueEl) tapVolumeValueEl.textContent = `${volumePercent}%`;
  if (gameCenterVisibilityToggle) {
    gameCenterVisibilityToggle.checked = appSettings.showOnGameCenter;
  }
}

function applyAudioSettings() {
  if (typeof lofi !== "undefined" && lofi?.setEffectVolume) {
    lofi.setEffectVolume(appSettings.tapEffectVolume);
  }
  postNativeAudio("settings", {
    effectVolume: appSettings.tapEffectVolume,
  });
}

function updateGameSettings(nextSettings = {}) {
  appSettings = normalizeGameSettings({
    ...appSettings,
    ...nextSettings,
  });
  writeGameSettings(appSettings);
  syncSettingsControls();
  applyAudioSettings();
  renderLeaderboard();
}

function shouldShowOnGameCenter() {
  return appSettings.showOnGameCenter !== false;
}

function shouldDisplayLocalLeaderboardEntry() {
  return shouldShowOnGameCenter();
}

function getUncommittedSessionProgress() {
  return {
    blooms: Math.max(0, Math.floor(state.score) - Math.max(0, Math.floor(state.committedScore) || 0)),
    crates: Math.max(0, Math.floor(state.crates) - Math.max(0, Math.floor(state.committedCrates) || 0)),
  };
}

function getDisplayedAccountProgress() {
  const progress = getUncommittedSessionProgress();
  return {
    blooms: playerTotals.blooms + progress.blooms,
    crates: playerTotals.crates + progress.crates,
  };
}

function mergePlayerTotals(nextTotals) {
  const normalized = normalizePlayerTotals(nextTotals);
  const merged = {
    blooms: Math.max(playerTotals.blooms, normalized.blooms),
    crates: Math.max(playerTotals.crates, normalized.crates),
  };
  if (merged.blooms === playerTotals.blooms && merged.crates === playerTotals.crates) return false;
  playerTotals = merged;
  writePlayerTotals(playerTotals);
  syncHud();
  return true;
}

function syncPlayerTotalsFromLocalLeaderboard(entries = leaderboardEntries) {
  const localEntry = entries.find((entry) => entry.id === localPlayerProfile.id);
  if (!localEntry) return false;
  return mergePlayerTotals({
    blooms: localEntry.totalBlooms,
    crates: localEntry.totalCrates,
  });
}

function maybeSubmitStoredTotalsToNative(nativeBlooms = 0) {
  if (!hasNativeGameCenterBridge()) return;
  if (!shouldShowOnGameCenter()) return;
  if (playerTotals.blooms <= 0 || playerTotals.blooms <= nativeBlooms) return;
  postNativeGameCenter("submitScore", {
    score: playerTotals.blooms,
    crates: playerTotals.crates,
  });
}

const localPlayerProfile = readPlayerProfile();
let appSettings = readGameSettings();
let leaderboardEntries = readLeaderboard(localPlayerProfile);
let selectedScoreboardEntryId = localPlayerProfile.id;
let leaderboardSearchQuery = "";
let usingNativeLeaderboard = false;
let nativeLeaderboardRequested = false;
let nativeLocalPlayerID = "";
let nativeLocalPlayerName = "";
let nativeProductsRequested = false;
let nativeEntitlementsRequested = false;
let nativeProductPrices = {};
let pendingPurchaseProductID = "";
let pendingRewardedBackdrop = "";
let playerTotals = readPlayerTotals();
let shareResumeGuardUntilMs = 0;
let backdropUnlocks = readBackdropUnlocks();
let temporaryBackdropAccess = readTemporaryBackdropAccess();
let selectedLockedBackdrop = null;
let activeUsageSessionStartedAtMs = null;
let activeUsageSessionId = null;
let lastLeaderboardAutoSaveAtMs = 0;
let lastLeaderboardAutoSaveBlooms = 0;
syncPlayerTotalsFromLocalLeaderboard(leaderboardEntries);

function readTemporaryUsageLog() {
  try {
    const parsed = JSON.parse(localStorage.getItem(TEMP_USAGE_LOG_STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeTemporaryUsageLog(entries) {
  try {
    localStorage.setItem(TEMP_USAGE_LOG_STORAGE_KEY, JSON.stringify(entries.slice(-80)));
  } catch {
    // Ignore storage write failures (private mode / quota / blocked storage).
  }
}

function shouldSkipMenuForFirstStart() {
  try {
    if (localStorage.getItem(FIRST_START_STORAGE_KEY) === "1") return false;
    localStorage.setItem(FIRST_START_STORAGE_KEY, "1");
    return true;
  } catch {
    return false;
  }
}

function beginUsageSession() {
  activeUsageSessionStartedAtMs = performance.now();
  activeUsageSessionId = `tmp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function recordTemporaryUsageSession(reason = "session-end") {
  if (!activeUsageSessionStartedAtMs) return null;

  const durationSec = Math.max(0, Math.round(((performance.now() - activeUsageSessionStartedAtMs) / 1000) * 10) / 10);
  const blooms = Math.max(0, Math.floor(state.score));
  const crates = Math.max(0, Math.floor(state.crates));
  if (durationSec < 1 && blooms <= 0 && crates <= 0) {
    activeUsageSessionStartedAtMs = null;
    activeUsageSessionId = null;
    return null;
  }

  const entry = {
    id: activeUsageSessionId || `tmp-${Date.now().toString(36)}`,
    endedAt: new Date().toISOString(),
    reason,
    durationSec,
    blooms,
    crates,
    bloomsPerMinute: durationSec > 0 ? Math.round((blooms / (durationSec / 60)) * 10) / 10 : blooms,
    backdrop: state.backdrop,
  };

  const log = readTemporaryUsageLog();
  log.push(entry);
  writeTemporaryUsageLog(log);
  console.info("[Bloomwave temporary usage]", entry);
  activeUsageSessionStartedAtMs = null;
  activeUsageSessionId = null;
  return entry;
}

function finishActiveSession(reason = "session-end") {
  const hadActiveUsageSession = Boolean(activeUsageSessionStartedAtMs);
  recordTemporaryUsageSession(reason);
  syncBackdropTiles();
  const progress = getUncommittedSessionProgress();
  if (hadActiveUsageSession && (progress.blooms > 0 || progress.crates > 0)) {
    recordSessionToLeaderboard();
  }
}

function getTemporaryUsageStats() {
  const log = readTemporaryUsageLog();
  let totalDurationSec = 0;
  let totalBlooms = 0;
  let totalCrates = 0;

  for (const entry of log) {
    totalDurationSec += Math.max(0, Number(entry.durationSec) || 0);
    totalBlooms += Math.max(0, Number(entry.blooms) || 0);
    totalCrates += Math.max(0, Number(entry.crates) || 0);
  }

  if (activeUsageSessionStartedAtMs) {
    totalDurationSec += Math.max(0, (performance.now() - activeUsageSessionStartedAtMs) / 1000);
    totalBlooms += Math.max(0, Math.floor(state.score));
    totalCrates += Math.max(0, Math.floor(state.crates));
  }

  const displayedProgress = getDisplayedAccountProgress();
  totalBlooms = Math.max(totalBlooms, displayedProgress.blooms);
  totalCrates = Math.max(totalCrates, displayedProgress.crates);

  const hasMeasuredRate = totalDurationSec >= 60 && totalBlooms > 0;
  const bloomsPerMinute = hasMeasuredRate
    ? Math.round((totalBlooms / (totalDurationSec / 60)) * 10) / 10
    : DEFAULT_ESTIMATED_BLOOMS_PER_MINUTE;

  return {
    sessions: log.length,
    totalDurationSec,
    totalBlooms,
    totalCrates,
    bloomsPerMinute,
    hasMeasuredRate,
  };
}

function getBackdropUnlockProgress(backdrop, stats = getTemporaryUsageStats()) {
  const configuredHours = FARMING_UNLOCK_HOURS[backdrop] ?? 0;
  const rawTargetBlooms = configuredHours * 60 * BACKDROP_UNLOCK_BLOOMS_PER_MINUTE;
  const targetBlooms = BACKDROP_UNLOCK_BLOOM_TARGETS[backdrop] ?? (configuredHours > 0
    ? Math.round(rawTargetBlooms / BACKDROP_UNLOCK_BLOOM_ROUNDING) * BACKDROP_UNLOCK_BLOOM_ROUNDING
    : 0);
  const targetHours = targetBlooms > 0 ? targetBlooms / BACKDROP_UNLOCK_BLOOMS_PER_MINUTE / 60 : 0;
  const targetDurationSec = targetHours * 60 * 60;
  const progress = targetBlooms > 0 ? clamp(stats.totalBlooms / targetBlooms, 0, 1) : 1;
  const hasFarmingUnlock = targetBlooms > 0 || BASE_UNLOCKED_BACKDROP_IDS.includes(backdrop);

  return {
    targetHours,
    targetDurationSec,
    targetBlooms,
    progress,
    unlockedByFarming: hasFarmingUnlock && (targetBlooms <= 0 || stats.totalBlooms >= targetBlooms),
  };
}

function formatUnlockTime(hours) {
  if (hours <= 0) return "now";
  if (hours < 24) return `${hours} hr`;
  const days = hours / 24;
  return Number.isInteger(days) ? `${days} days` : `${Math.round(days * 10) / 10} days`;
}

function formatTemporaryAccessRemaining(expiresAt) {
  const remainingMs = Math.max(0, expiresAt - Date.now());
  const remainingHours = Math.ceil(remainingMs / (60 * 60 * 1000));
  if (remainingHours <= 1) return "<1h";
  if (remainingHours < 24) return `${remainingHours}h`;
  return `${Math.ceil(remainingHours / 24)}d`;
}

function getDisplayUnlockProgress(progress) {
  if (progress <= 0) return 0;
  if (progress >= 1) return 1;
  return Math.max(progress, MIN_UNLOCK_PROGRESS_DISPLAY);
}

function formatUnlockProgressWidth(progress) {
  return `${Math.round(getDisplayUnlockProgress(progress) * 100)}%`;
}

function formatLargeNumber(value) {
  return Math.max(0, Math.round(value)).toLocaleString();
}

function formatCompactNumber(value) {
  const rounded = Math.max(0, Math.round(value));
  if (rounded >= 1000000) {
    const millions = rounded / 1000000;
    return `${Number.isInteger(millions) ? millions : Math.round(millions * 10) / 10}M`;
  }
  if (rounded >= 1000) {
    const thousands = rounded / 1000;
    return `${Number.isInteger(thousands) ? thousands : Math.round(thousands * 10) / 10}K`;
  }
  return `${rounded}`;
}

function formatShortBloomTarget(value) {
  if (value <= 0) return "FREE";
  if (value >= 1000000) {
    const millions = value / 1000000;
    return `${Number.isInteger(millions) ? millions : Math.round(millions * 10) / 10}M`;
  }
  if (value >= 1000) {
    const thousands = value / 1000;
    return `${Number.isInteger(thousands) ? thousands : Math.round(thousands * 10) / 10}K`;
  }
  return `${Math.round(value)}`;
}

function getNextBackdropUnlockCandidate(stats = getTemporaryUsageStats()) {
  if (backdropUnlocks.lifetime) return null;

  const candidates = BACKDROP_IDS
    .filter((backdrop) => backdrop !== "classic")
    .map((backdrop) => {
      const progress = getBackdropUnlockProgress(backdrop, stats);
      const unlocked = BASE_UNLOCKED_BACKDROP_IDS.includes(backdrop)
        || backdropUnlocks.unlocked.includes(backdrop)
        || progress.unlockedByFarming;
      if (unlocked || progress.targetBlooms <= 0) return null;
      return {
        backdrop,
        progress,
        remainingBlooms: Math.max(0, Math.ceil(progress.targetBlooms - stats.totalBlooms)),
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.remainingBlooms - b.remainingBlooms);

  return candidates[0] || null;
}

function getBackdropBadge(backdrop, unlocked, tempAccess = false) {
  if (backdropUnlocks.lifetime) return "";
  if (BASE_UNLOCKED_BACKDROP_IDS.includes(backdrop)) return "";
  if (unlocked) return "";
  if (tempAccess) return "";
  if (isBackdropFree(backdrop)) return formatShortBloomTarget(getBackdropUnlockProgress(backdrop).targetBlooms);
  return getBackdropPriceLabel(backdrop);
}

function syncPostRunUnlockPrompt() {
  if (!postRunUnlockPromptEl || !postRunUnlockTextEl) return;
  const displayedBlooms = Math.max(0, Math.floor(getDisplayedAccountProgress().blooms));
  const stats = getTemporaryUsageStats();
  const candidate = getNextBackdropUnlockCandidate(stats);

  if (displayedBlooms <= 0 || !candidate) {
    postRunUnlockPromptEl.classList.add("screen-hidden");
    if (postRunUnlockBtn) {
      postRunUnlockBtn.dataset.backdrop = "";
      const labelEl = postRunUnlockBtn.querySelector("span");
      if (labelEl) labelEl.textContent = "View";
    }
    if (postRunUnlockPriceEl) postRunUnlockPriceEl.textContent = "";
    if (postRunUnlockProgressFillEl) postRunUnlockProgressFillEl.style.width = "0%";
    return;
  }

  const name = BACKDROP_DISPLAY_NAMES[candidate.backdrop] || "a background";
  const tempAccess = hasTemporaryBackdropAccess(candidate.backdrop);
  postRunUnlockTextEl.textContent = `${name}: ${formatLargeNumber(displayedBlooms)} / ${formatCompactNumber(candidate.progress.targetBlooms)} Blooms`;
  if (postRunUnlockBtn) {
    postRunUnlockBtn.dataset.backdrop = candidate.backdrop;
    const labelEl = postRunUnlockBtn.querySelector("span");
    if (labelEl) labelEl.textContent = tempAccess ? "Equip" : "View";
  }
  if (postRunUnlockPriceEl) postRunUnlockPriceEl.textContent = tempAccess ? "" : `Watch ad for ${REWARDED_BACKDROP_ACCESS_HOURS}h access`;
  if (postRunUnlockProgressFillEl) {
    postRunUnlockProgressFillEl.style.width = formatUnlockProgressWidth(candidate.progress.progress);
  }
  postRunUnlockPromptEl.classList.remove("screen-hidden");
}

function buildBackdropSelectionText(backdrop, unlocked, stats = getTemporaryUsageStats()) {
  const name = BACKDROP_DISPLAY_NAMES[backdrop] || "Selected";
  const progress = getBackdropUnlockProgress(backdrop, stats);
  if (progress.targetBlooms <= 0 && !unlocked) {
    return BACKDROP_DESCRIPTIONS[backdrop] || `${name} preview.`;
  }
  const targetText = progress.targetHours > 0
    ? `about ${formatUnlockTime(progress.targetHours)} of farming (${formatLargeNumber(progress.targetBlooms)} Blooms at ${formatLargeNumber(BACKDROP_UNLOCK_BLOOMS_PER_MINUTE)} Blooms/min)`
    : "immediately";

  if (unlocked) {
    return `${name} selected. Farming average: ${stats.bloomsPerMinute} Blooms/min.`;
  }

  const earnedBlooms = formatLargeNumber(stats.totalBlooms);
  const percent = Math.round(progress.progress * 100);
  const unlockType = isBackdropFree(backdrop) ? "Free farming unlock." : "Purchase optional, or unlock by farming.";
  return `${name} preview. ${unlockType} Target: ${targetText}. Progress: ${earnedBlooms}/${formatLargeNumber(progress.targetBlooms)} Blooms (${percent}%).`;
}

window.bloomwaveUsageLog = {
  read: readTemporaryUsageLog,
  clear: () => writeTemporaryUsageLog([]),
  stats: getTemporaryUsageStats,
};

function isBackdropFree(backdrop) {
  return FREE_BACKDROP_IDS.includes(backdrop);
}

function isBackdropUnlocked(backdrop) {
  return BASE_UNLOCKED_BACKDROP_IDS.includes(backdrop)
    || backdropUnlocks.lifetime
    || backdropUnlocks.unlocked.includes(backdrop)
    || getBackdropUnlockProgress(backdrop).unlockedByFarming;
}

function isBackdropUsable(backdrop) {
  return isBackdropUnlocked(backdrop) || hasTemporaryBackdropAccess(backdrop);
}

function unlockBackdrop(backdrop) {
  if (!BACKDROP_PRICE_LABELS[backdrop]) return;
  if (!backdropUnlocks.unlocked.includes(backdrop)) {
    backdropUnlocks.unlocked.push(backdrop);
    writeBackdropUnlocks(backdropUnlocks);
  }
}

function unlockLifetimeBackgrounds() {
  backdropUnlocks = {
    lifetime: true,
    unlocked: BACKDROP_IDS.filter((backdrop) => backdrop !== "classic"),
  };
  writeBackdropUnlocks(backdropUnlocks);
}

function nudgeCommunityPlayers(entries = leaderboardEntries) {
  if (!shouldUseDemoLeaderboardRows()) return;

  for (const entry of entries) {
    if (!entry.isNpc) continue;
    if (entry.isShowcase) continue;

    if (Math.random() < 0.62) {
      const bloomGain = Math.floor(rand(7, 52));
      entry.totalBlooms += bloomGain;
      entry.totalCrates += Math.floor(bloomGain / 24);
    }
  }
}

function recordSessionToLeaderboard(options = {}) {
  const refreshNative = options.refreshNative ?? true;
  const progress = getUncommittedSessionProgress();
  const blooms = progress.blooms;
  const crates = progress.crates;
  if (blooms <= 0 && crates <= 0) return;

  const localEntries = readLeaderboard(localPlayerProfile, {
    includeDemoRows: shouldUseDemoLeaderboardRows(),
  });
  const localEntry = ensurePlayerEntry(localEntries, localPlayerProfile);
  localEntry.totalBlooms = Math.max(localEntry.totalBlooms, playerTotals.blooms) + blooms;
  localEntry.totalCrates = Math.max(localEntry.totalCrates, playerTotals.crates) + crates;
  localEntry.isNpc = false;
  state.committedScore = Math.min(Math.max(0, Math.floor(state.score)), state.committedScore + blooms);
  state.committedCrates = Math.min(Math.max(0, Math.floor(state.crates)), state.committedCrates + crates);
  playerTotals = {
    blooms: localEntry.totalBlooms,
    crates: localEntry.totalCrates,
  };
  writePlayerTotals(playerTotals);

  nudgeCommunityPlayers(localEntries);
  sortLeaderboard(localEntries);
  writeLeaderboard(localEntries);
  if (!usingNativeLeaderboard) {
    leaderboardEntries = localEntries;
  }
  if (shouldShowOnGameCenter()) {
    postNativeGameCenter("submitScore", { score: localEntry.totalBlooms, crates: localEntry.totalCrates });
  }
  if (usingNativeLeaderboard && refreshNative && shouldShowOnGameCenter()) {
    nativeLeaderboardRequested = false;
    requestNativeLeaderboard();
  }
  syncHud();
}

function autosaveLeaderboardProgress(nowMs = performance.now()) {
  if (!activeUsageSessionStartedAtMs) return;
  const progress = getUncommittedSessionProgress();
  if (progress.blooms <= 0 && progress.crates <= 0) return;

  const bloomsSinceAutosave = Math.max(0, Math.floor(state.score) - lastLeaderboardAutoSaveBlooms);
  const intervalReady = nowMs - lastLeaderboardAutoSaveAtMs >= LEADERBOARD_AUTOSAVE_INTERVAL_MS;
  const bloomStepReady = bloomsSinceAutosave >= LEADERBOARD_AUTOSAVE_BLOOM_STEP;
  if (!intervalReady && !bloomStepReady) return;

  recordSessionToLeaderboard({ refreshNative: false });
  lastLeaderboardAutoSaveAtMs = nowMs;
  lastLeaderboardAutoSaveBlooms = Math.max(0, Math.floor(state.score));
}

function normalizeNativeLeaderboardEntry(entry) {
  const source = entry && typeof entry === "object" ? entry : {};
  const normalized = normalizePlayerEntry({
    ...source,
    id: source.id || source.playerID,
    totalCrates: source.totalCrates ?? source.crates ?? source.context,
    isNative: true,
    nativeRank: source.rank,
  });
  if (!normalized) return null;
  normalized.isNpc = false;
  normalized.isNative = true;
  return normalized;
}

function receiveNativeLeaderboard(payload = {}) {
  nativeLeaderboardRequested = false;
  nativeLocalPlayerID = typeof payload.localPlayerID === "string" ? payload.localPlayerID : "";
  nativeLocalPlayerName = typeof payload.localPlayerName === "string" ? payload.localPlayerName.trim() : nativeLocalPlayerName;
  const localEntryIds = new Set([localPlayerProfile.id, nativeLocalPlayerID].filter(Boolean));
  const nativeEntries = Array.isArray(payload.entries)
    ? payload.entries.map(normalizeNativeLeaderboardEntry).filter(Boolean)
      .filter((entry) => shouldShowOnGameCenter() || !localEntryIds.has(entry.id))
    : [];

  if (nativeEntries.length === 0) {
    usingNativeLeaderboard = hasNativeGameCenterBridge();
    leaderboardEntries = readLeaderboard(localPlayerProfile, {
      includeDemoRows: shouldUseDemoLeaderboardRows(),
    });
    syncPlayerTotalsFromLocalLeaderboard(leaderboardEntries);
    maybeSubmitStoredTotalsToNative(0);
    renderLeaderboard();
    return;
  }

  usingNativeLeaderboard = true;
  leaderboardEntries = nativeEntries;
  let nativeLocalBlooms = 0;
  if (nativeLocalPlayerID && shouldShowOnGameCenter()) {
    const localEntry = leaderboardEntries.find((entry) => entry.id === nativeLocalPlayerID);
    if (localEntry) {
      selectedScoreboardEntryId = localEntry.id;
      nativeLocalBlooms = Math.max(0, Math.floor(localEntry.totalBlooms) || 0);
      mergePlayerTotals({
        blooms: localEntry.totalBlooms,
        crates: localEntry.totalCrates,
      });
    }
  }
  maybeSubmitStoredTotalsToNative(nativeLocalBlooms);
  sortLeaderboard(leaderboardEntries);
  renderLeaderboard();
}

window.bloomwaveNativeGameCenter = {
  receiveLeaderboard: receiveNativeLeaderboard,
};

function requestNativeLeaderboard() {
  if (nativeLeaderboardRequested) return;
  nativeLeaderboardRequested = postNativeGameCenter("loadLeaderboard", {
    limit: NATIVE_LEADERBOARD_REQUEST_LIMIT,
    showLocalPlayer: shouldShowOnGameCenter(),
  });
}

function getCurrentSessionLeaderboardProgress() {
  return getUncommittedSessionProgress();
}

function stripLocalMarker(name) {
  return String(name || "").replace(/\s*\(you\)\s*$/i, "").trim();
}

function isPlaceholderLocalName(name) {
  const normalized = stripLocalMarker(name).toLowerCase();
  return !normalized || normalized === "you" || normalized === "grower";
}

function getLocalLeaderboardName(entry) {
  const entryName = stripLocalMarker(entry?.name);
  if (!isPlaceholderLocalName(entryName)) return entryName;

  const nativeName = stripLocalMarker(nativeLocalPlayerName);
  if (!isPlaceholderLocalName(nativeName)) return nativeName;

  const profileName = stripLocalMarker(localPlayerProfile.name);
  if (!isPlaceholderLocalName(profileName)) return profileName;

  return "Player";
}

function formatLeaderboardDisplayName(entry, isLocal) {
  if (!isLocal) return stripLocalMarker(entry?.name) || "Grower";
  return `${getLocalLeaderboardName(entry)} (You)`;
}

function buildDisplayLeaderboardEntries() {
  const localEntryIds = new Set([localPlayerProfile.id, nativeLocalPlayerID].filter(Boolean));
  const displayEntries = leaderboardEntries
    .filter((entry) => shouldUseDemoLeaderboardRows() || !entry.isNpc)
    .filter((entry) => shouldDisplayLocalLeaderboardEntry() || !localEntryIds.has(entry.id))
    .map((entry) => ({ ...entry }));

  if (!shouldDisplayLocalLeaderboardEntry()) {
    sortLeaderboard(displayEntries);
    return displayEntries;
  }

  const localEntryID = nativeLocalPlayerID || localPlayerProfile.id;
  let localEntry = displayEntries.find((entry) => entry.id === localEntryID)
    || displayEntries.find((entry) => entry.id === localPlayerProfile.id);

  if (!localEntry) {
    localEntry = {
      id: localEntryID,
      name: localPlayerProfile.name,
      totalBlooms: 0,
      totalCrates: 0,
      isNpc: false,
      isNative: usingNativeLeaderboard,
    };
    displayEntries.push(localEntry);
  }

  localEntry.name = getLocalLeaderboardName(localEntry);
  localEntry.isNpc = false;
  const currentProgress = getCurrentSessionLeaderboardProgress();
  localEntry.totalBlooms = Math.max(0, Math.floor(localEntry.totalBlooms) || 0, playerTotals.blooms) + currentProgress.blooms;
  localEntry.totalCrates = Math.max(0, Math.floor(localEntry.totalCrates) || 0, playerTotals.crates) + currentProgress.crates;
  sortLeaderboard(displayEntries);
  return displayEntries;
}

function renderScoreVisualizer(entry, rank) {
  if (!scoreboardCrateGridEl) return;

  const fallbackEntry = {
    id: nativeLocalPlayerID || localPlayerProfile.id,
    name: localPlayerProfile.name,
    totalBlooms: 0,
    totalCrates: 0,
  };
  const selected = entry || fallbackEntry;
  const blooms = Math.max(0, Math.floor(selected.totalBlooms) || 0);
  const crates = Math.max(0, Math.floor(selected.totalCrates) || 0);

  if (scoreboardRankEl) scoreboardRankEl.textContent = rank > 0 ? `#${rank}` : "#--";
  if (scoreboardNameEl) {
    const isLocal = selected.id === localPlayerProfile.id || selected.id === nativeLocalPlayerID;
    scoreboardNameEl.textContent = formatLeaderboardDisplayName(selected, isLocal);
  }
  if (scoreboardBloomsEl) scoreboardBloomsEl.textContent = formatLargeNumber(blooms);
  if (scoreboardCratesEl) scoreboardCratesEl.textContent = formatLargeNumber(crates);

  scoreboardCrateGridEl.innerHTML = "";
  const crateFragment = document.createDocumentFragment();
  for (let i = 0; i < crates; i += 1) {
    const crate = document.createElement("span");
    crate.className = i % 5 === 0 ? "pixel-crate is-bright" : "pixel-crate";
    crateFragment.appendChild(crate);
  }
  scoreboardCrateGridEl.appendChild(crateFragment);
}

function renderLeaderboard() {
  if (!leaderboardListEl) return;

  leaderboardListEl.innerHTML = "";
  const visibleEntries = buildDisplayLeaderboardEntries();
  sortLeaderboard(visibleEntries);
  const normalizedQuery = leaderboardSearchQuery.trim().toLowerCase();
  const matchingEntries = normalizedQuery
    ? visibleEntries.filter((entry) => entry.name.toLowerCase().includes(normalizedQuery))
    : visibleEntries;
  const topEntries = matchingEntries.slice(0, MAX_LEADERBOARD_ENTRIES);
  const localEntryIds = shouldDisplayLocalLeaderboardEntry()
    ? new Set([localPlayerProfile.id, nativeLocalPlayerID].filter(Boolean))
    : new Set();
  const localRank = visibleEntries.findIndex((entry) => localEntryIds.has(entry.id));
  const selectedEntry = matchingEntries.find((entry) => entry.id === selectedScoreboardEntryId)
    || matchingEntries.find((entry) => localEntryIds.has(entry.id))
    || topEntries[0]
    || null;
  if (selectedEntry) selectedScoreboardEntryId = selectedEntry.id;
  const renderEntries = [...topEntries];
  const localMatchesSearch = localRank >= 0
    && (!normalizedQuery || visibleEntries[localRank].name.toLowerCase().includes(normalizedQuery));
  if (localMatchesSearch && !renderEntries.some((entry) => localEntryIds.has(entry.id)) && localRank >= MAX_LEADERBOARD_ENTRIES) {
    renderEntries.push(visibleEntries[localRank]);
  }

  if (renderEntries.length === 0) {
    const item = document.createElement("li");
    item.className = "board-empty";
    item.textContent = normalizedQuery ? "No matching usernames." : "No growers ranked yet. Harvest blooms and crates to join.";
    leaderboardListEl.appendChild(item);
    renderScoreVisualizer(null, 0);
    return;
  }

  renderEntries.forEach((entry) => {
    const item = document.createElement("li");
    item.className = "board-row";
    item.tabIndex = 0;
    item.setAttribute("role", "button");
    const rank = entry.nativeRank || visibleEntries.findIndex((candidate) => candidate.id === entry.id) + 1;
    const isLocal = localEntryIds.has(entry.id);
    if (isLocal) {
      item.classList.add("you");
    }
    if (entry.id === selectedScoreboardEntryId) {
      item.classList.add("is-selected");
    }
    const displayName = formatLeaderboardDisplayName(entry, isLocal);

    const rankEl = document.createElement("span");
    rankEl.className = "rank";
    rankEl.textContent = `#${rank}`;

    const playerEl = document.createElement("span");
    playerEl.className = "player";

    const nameEl = document.createElement("span");
    nameEl.className = "name";
    nameEl.textContent = displayName;

    const metaEl = document.createElement("span");
    metaEl.className = "meta";
    metaEl.textContent = `${formatLargeNumber(entry.totalCrates)} crates`;

    playerEl.append(nameEl, metaEl);

    const scoreValueEl = document.createElement("span");
    scoreValueEl.className = "score";

    const scoreNumberEl = document.createElement("span");
    scoreNumberEl.className = "score-number";
    scoreNumberEl.textContent = formatLargeNumber(entry.totalBlooms);

    const scoreLabelEl = document.createElement("span");
    scoreLabelEl.className = "score-label";
    scoreLabelEl.textContent = "blooms";

    scoreValueEl.append(scoreNumberEl, scoreLabelEl);

    item.append(rankEl, playerEl, scoreValueEl);
    item.addEventListener("click", safeUiAction("leaderboard row select", () => {
      selectedScoreboardEntryId = entry.id;
      renderLeaderboard();
    }));
    item.addEventListener("keydown", safeUiAction("leaderboard row keyboard select", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      selectedScoreboardEntryId = entry.id;
      renderLeaderboard();
    }));
    leaderboardListEl.appendChild(item);
  });

  const selectedRank = selectedEntry
    ? selectedEntry.nativeRank || visibleEntries.findIndex((entry) => entry.id === selectedEntry.id) + 1
    : 0;
  renderScoreVisualizer(selectedEntry, selectedRank);
}

function getLocalLeaderboardEntry() {
  const localEntryID = nativeLocalPlayerID || localPlayerProfile.id;
  const displayEntries = leaderboardEntries.map((entry) => ({ ...entry }));
  if (nativeLocalPlayerID) {
    const nativeLocalEntry = displayEntries.find((entry) => entry.id === nativeLocalPlayerID);
    if (nativeLocalEntry) {
      nativeLocalEntry.name = getLocalLeaderboardName(nativeLocalEntry);
      const progress = getCurrentSessionLeaderboardProgress();
      nativeLocalEntry.totalBlooms = Math.max(0, Math.floor(nativeLocalEntry.totalBlooms) || 0, playerTotals.blooms) + progress.blooms;
      nativeLocalEntry.totalCrates = Math.max(0, Math.floor(nativeLocalEntry.totalCrates) || 0, playerTotals.crates) + progress.crates;
      return nativeLocalEntry;
    }
  }
  const localEntry = displayEntries.find((entry) => entry.id === localPlayerProfile.id) || {
    id: localEntryID,
    name: localPlayerProfile.name,
    totalBlooms: 0,
    totalCrates: 0,
    isNpc: false,
  };
  const progress = getCurrentSessionLeaderboardProgress();
  localEntry.name = getLocalLeaderboardName(localEntry);
  localEntry.totalBlooms = Math.max(0, Math.floor(localEntry.totalBlooms) || 0, playerTotals.blooms) + progress.blooms;
  localEntry.totalCrates = Math.max(0, Math.floor(localEntry.totalCrates) || 0, playerTotals.crates) + progress.crates;
  return localEntry;
}

function buildScoreShareText() {
  const localEntry = getLocalLeaderboardEntry();
  const blooms = Math.max(0, Math.floor(localEntry.totalBlooms) || 0);
  const crates = Math.max(0, Math.floor(localEntry.totalCrates) || 0);
  return `I just stacked ${blooms} Blooms and ${crates} Crates in Bloomwave Garden. Think you can beat me?`;
}

function postNativeShare(event, payload = {}) {
  const handler = window.webkit && window.webkit.messageHandlers
    ? window.webkit.messageHandlers.nativeShare
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

function guardShareResume(ms = 900) {
  shareResumeGuardUntilMs = Math.max(shareResumeGuardUntilMs, performance.now() + ms);
}

function isShareResumeGuardActive() {
  return performance.now() < shareResumeGuardUntilMs;
}

function closestElement(target, selector) {
  return target && typeof target.closest === "function" ? target.closest(selector) : null;
}

function safeUiAction(label, action) {
  return function safeUiActionHandler(...args) {
    try {
      const result = action.apply(this, args);
      if (result && typeof result.catch === "function") {
        result.catch((error) => {
          console.warn(`[Bloomwave] ${label} failed`, error);
        });
      }
      return result;
    } catch (error) {
      console.warn(`[Bloomwave] ${label} failed`, error);
      return undefined;
    }
  };
}

async function shareScore() {
  const text = buildScoreShareText();
  guardShareResume(1400);
  if (postNativeShare("sms", { text })) return;

  const shareData = {
    title: "Bloomwave Garden",
    text,
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
      return;
    } catch (error) {
      if (error && error.name === "AbortError") return;
    }
  }

  if (window.webkit?.messageHandlers) return;

  try {
    window.open(`sms:&body=${encodeURIComponent(text)}`, "_self");
  } catch (error) {
    console.warn("[Bloomwave] SMS share failed", error);
  }
}

function showHomeScreen() {
  if (!overlayEl) return;
  overlayEl.classList.remove("hidden");
  overlayEl.classList.add("menu-open");
  homeScreenEl?.classList.remove("screen-hidden");
  leaderboardScreenEl?.classList.add("screen-hidden");
  premiumScreenEl?.classList.add("screen-hidden");
  settingsScreenEl?.classList.add("screen-hidden");
  setGameUiVisible(false);
  if (overlayTitleEl) overlayTitleEl.textContent = "Bloomwave Garden";
  syncPostRunUnlockPrompt();
  syncColorControls();
}

function showLeaderboardScreen() {
  if (!overlayEl) return;
  renderLeaderboard();
  requestNativeLeaderboard();
  overlayEl.classList.remove("hidden");
  overlayEl.classList.add("menu-open");
  homeScreenEl?.classList.add("screen-hidden");
  leaderboardScreenEl?.classList.remove("screen-hidden");
  premiumScreenEl?.classList.add("screen-hidden");
  settingsScreenEl?.classList.add("screen-hidden");
  setGameUiVisible(false);
  syncPostRunUnlockPrompt();
  syncColorControls();
}

function showPremiumScreen() {
  if (!overlayEl) return;
  requestNativeProducts();
  overlayEl.classList.remove("hidden");
  overlayEl.classList.add("menu-open");
  homeScreenEl?.classList.add("screen-hidden");
  leaderboardScreenEl?.classList.add("screen-hidden");
  premiumScreenEl?.classList.remove("screen-hidden");
  settingsScreenEl?.classList.add("screen-hidden");
  setGameUiVisible(false);
  syncBackdropTiles();
  syncColorControls();
}

function showSettingsScreen() {
  if (!overlayEl) return;
  overlayEl.classList.remove("hidden");
  overlayEl.classList.add("menu-open");
  homeScreenEl?.classList.add("screen-hidden");
  leaderboardScreenEl?.classList.add("screen-hidden");
  premiumScreenEl?.classList.add("screen-hidden");
  settingsScreenEl?.classList.remove("screen-hidden");
  setGameUiVisible(false);
  syncSettingsControls();
  syncColorControls();
}

function hideMenuOverlay() {
  if (!overlayEl) return;
  overlayEl.classList.add("hidden");
  overlayEl.classList.remove("menu-open");
  setGameUiVisible(true);
  syncColorControls();
}

function setGameUiVisible(visible) {
  stageWrapEl?.classList.toggle("is-game-live", visible);
  const targets = [hudEl, statusEl, menuCornerBtn, settingsCornerBtn].filter(Boolean);
  for (const target of targets) {
    target.classList.toggle("is-hidden", !visible);
  }
}

function openMenuFromGame() {
  state.running = false;
  showHomeScreen();
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
    this.effectVolume = 1;
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
    if (this.effectVolume <= 0) return false;

    const now = this.context.currentTime;
    if (this.unlockSample) {
      const source = this.context.createBufferSource();
      const gain = this.context.createGain();
      source.buffer = this.unlockSample;
      gain.gain.setValueAtTime(0.34 * this.effectVolume, now);
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
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, 0.22 * this.effectVolume), now + 0.012);
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
    if (this.effectVolume <= 0) return false;
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

  setEffectVolume(volume) {
    const nextVolume = Number(volume);
    this.effectVolume = Number.isFinite(nextVolume) ? clamp(nextVolume, 0, 1) : 1;
  }

  toggleMuted() {
    this.setMuted(!this.muted);
  }

  playVoice(freq, duration, type, gainLevel, cutoff) {
    if (!this.context || !this.master) return false;
    if (this.activeVoices >= this.maxVoices) return false;
    if (this.effectVolume <= 0) return false;

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
    const scaledGainLevel = Math.max(0.0001, gainLevel * this.effectVolume);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(scaledGainLevel, now + attack);
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
lofi.setEffectVolume(appSettings.tapEffectVolume);
let didRunAudioUnlockPing = false;

function postNativeAudio(event, payload = {}) {
  const webAudioState = lofi.context ? lofi.context.state : "no-context";
  const shouldBridge = lofi.nativeAudioOnly || webAudioState !== "running" || event === "gesture" || event === "settings";
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
      effectVolume: appSettings.tapEffectVolume,
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

function hasNativePurchaseBridge() {
  return Boolean(window.webkit?.messageHandlers?.nativePurchase);
}

function postNativePurchase(event, payload = {}) {
  const handler = window.webkit && window.webkit.messageHandlers
    ? window.webkit.messageHandlers.nativePurchase
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

function hasNativeAdBridge() {
  return Boolean(window.webkit?.messageHandlers?.nativeRewardedAd);
}

function postNativeAd(event, payload = {}) {
  const handler = window.webkit && window.webkit.messageHandlers
    ? window.webkit.messageHandlers.nativeRewardedAd
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

function receiveNativeAdResult(payload = {}) {
  const status = typeof payload.status === "string" ? payload.status : "";
  const backdrop = typeof payload.backdrop === "string" ? payload.backdrop : pendingRewardedBackdrop;
  pendingRewardedBackdrop = "";
  if (status !== "rewarded" || !BACKDROP_IDS.includes(backdrop)) {
    if (backgroundPreviewAdBtn) backgroundPreviewAdBtn.textContent = "Ad Unavailable";
    return;
  }
  grantTemporaryBackdropAccess(backdrop, REWARDED_BACKDROP_ACCESS_HOURS);
}

window.bloomwaveNativeAds = {
  receiveReward: receiveNativeAdResult,
};

function requestNativeProducts() {
  if (nativeProductsRequested || !hasNativePurchaseBridge()) return;
  nativeProductsRequested = postNativePurchase("loadProducts", {
    productIDs: [LIFETIME_PRODUCT_ID, ...Object.values(BACKDROP_PRODUCT_IDS)],
  });
}

function requestNativeEntitlements() {
  if (nativeEntitlementsRequested || !hasNativePurchaseBridge()) return;
  nativeEntitlementsRequested = postNativePurchase("loadEntitlements", {});
}

function applyOwnedProductIDs(productIDs = []) {
  let changed = false;
  for (const productID of productIDs) {
    if (productID === LIFETIME_PRODUCT_ID) {
      unlockLifetimeBackgrounds();
      changed = true;
      continue;
    }

    const backdrop = PRODUCT_BACKDROP_IDS[productID];
    if (!backdrop) continue;
    const before = isBackdropUnlocked(backdrop);
    unlockBackdrop(backdrop);
    changed = changed || !before;
  }
  if (changed) syncBackdropTiles();
}

function receiveNativePurchaseProducts(payload = {}) {
  nativeProductsRequested = false;
  const prices = {};
  const products = Array.isArray(payload.products) ? payload.products : [];
  for (const product of products) {
    if (!product || typeof product !== "object") continue;
    const id = typeof product.id === "string" ? product.id : "";
    const price = typeof product.displayPrice === "string" ? product.displayPrice : "";
    if (id && price) prices[id] = price;
  }
  nativeProductPrices = {
    ...nativeProductPrices,
    ...prices,
  };
  applyOwnedProductIDs(Array.isArray(payload.ownedProductIDs) ? payload.ownedProductIDs : []);
  syncBackdropTiles();
}

function receiveNativePurchaseResult(payload = {}) {
  const status = typeof payload.status === "string" ? payload.status : "";
  const productID = typeof payload.productID === "string" ? payload.productID : pendingPurchaseProductID;
  pendingPurchaseProductID = "";
  const ownedProductIDs = Array.isArray(payload.ownedProductIDs) ? payload.ownedProductIDs : [];
  if (status === "success" || status === "restored") {
    applyOwnedProductIDs(ownedProductIDs.length > 0 ? ownedProductIDs : [productID]);
    const backdrop = PRODUCT_BACKDROP_IDS[productID];
    if (backdrop && isBackdropUnlocked(backdrop)) {
      selectBackdrop(backdrop);
      hideBackgroundPreview();
    }
    syncBackdropTiles();
    return;
  }

  if (status === "unavailable" && backgroundPreviewPurchaseBtn) {
    backgroundPreviewPurchaseBtn.textContent = "Unavailable";
  }
  syncBackdropTiles();
}

window.bloomwaveNativePurchases = {
  receiveProducts: receiveNativePurchaseProducts,
  receivePurchase: receiveNativePurchaseResult,
  receiveRestore: receiveNativePurchaseResult,
};

function purchaseProduct(productID, fallbackUnlock) {
  if (!productID) return false;
  if (hasNativePurchaseBridge()) {
    pendingPurchaseProductID = productID;
    postNativePurchase("purchase", { productID });
    return true;
  }
  fallbackUnlock();
  return true;
}

function purchaseBackdrop(backdrop) {
  if (!BACKDROP_IDS.includes(backdrop) || isBackdropUnlocked(backdrop)) return;
  const productID = BACKDROP_PRODUCT_IDS[backdrop];
  purchaseProduct(productID, () => {
    unlockBackdrop(backdrop);
    selectBackdrop(backdrop);
  });
}

function purchaseLifetimePass() {
  if (backdropUnlocks.lifetime) return;
  purchaseProduct(LIFETIME_PRODUCT_ID, () => {
    unlockLifetimeBackgrounds();
    syncBackdropTiles();
  });
}

function watchAdForBackdrop(backdrop) {
  if (!BACKDROP_IDS.includes(backdrop) || backdrop === "classic" || isBackdropUnlocked(backdrop)) return;
  pendingRewardedBackdrop = backdrop;
  if (backgroundPreviewAdBtn) {
    backgroundPreviewAdBtn.textContent = "Loading Ad...";
    backgroundPreviewAdBtn.disabled = true;
  }
  if (hasNativeAdBridge() && postNativeAd("showRewardedBackdropAd", {
    backdrop,
    hours: REWARDED_BACKDROP_ACCESS_HOURS,
  })) {
    return;
  }
  grantTemporaryBackdropAccess(backdrop, REWARDED_BACKDROP_ACCESS_HOURS);
}

function setStatus(text, seconds = 1.6) {
  state.statusText = text;
  state.statusTimer = seconds;
  if (statusEl) statusEl.textContent = text;
}

function setPassiveStatus() {
  if (!statusEl) return;

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
  const displayedProgress = getDisplayedAccountProgress();
  if (scoreEl) scoreEl.textContent = formatLargeNumber(displayedProgress.blooms);
  if (calmEl) calmEl.textContent = `${state.harvestProgress}/${state.harvestGoal}`;
  if (cratesEl) cratesEl.textContent = formatLargeNumber(displayedProgress.crates);
  if (comboEl) comboEl.textContent = String(state.combo);
  if (phaseEl) phaseEl.textContent = palette[state.nextPalette]?.name || "";
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

function makeBud(slot, type = pickRegularFlowerType()) {
  return {
    id: nextBudId,
    slotIndex: slot.index,
    x: slot.x,
    y: slot.y,
    type,
    flash: 0,
    wobble: 0,
    petalPhase: rand(0, Math.PI * 2),
  };
}

function buildBeds() {
  state.buds = [];
  const blockedRects = getFlowerBlockedRects();
  const openSlots = bedSlots.filter((slot) => !isSlotBlockedByUi(slot, blockedRects));
  const targetCount = Math.min(MAX_BUDS, Math.max(1, Math.round(openSlots.length * INITIAL_FIELD_FILL_RATIO)));
  const shuffled = [...openSlots].sort(() => Math.random() - 0.5);

  for (let i = 0; i < targetCount; i += 1) {
    const slot = shuffled[i];
    if (!slot) break;
    state.buds.push(makeBud(slot));
    nextBudId += 1;
  }
}

function softReset(showOverlay = true) {
  state.running = false;
  state.time = 0;
  state.score = 0;
  state.committedScore = 0;
  state.hype = 72;
  state.harvestProgress = 0;
  state.harvestGoal = 12;
  state.crates = 0;
  state.committedCrates = 0;
  state.combo = 0;
  state.bestCombo = 0;
  state.nextPalette = STARTING_PALETTE;
  state.frenzyTimer = 0;
  state.spawnTimer = 0;
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
  state.openingZapAvailable = true;
  state.lastBurstAtMs = -Infinity;
  state.lastBlockedTapAtMs = -Infinity;
  state.stats.amberHits = 0;
  state.stats.tealHits = 0;
  state.stats.frenzyCount = 0;
  lastLeaderboardAutoSaveAtMs = performance.now();
  lastLeaderboardAutoSaveBlooms = 0;

  buildBeds();
  makeChallenge();
  syncHud();
  setPassiveStatus();

  if (showOverlay) {
    showHomeScreen();
  }
}

function startSession() {
  hideMenuOverlay();
  if (state.buds.length === 0 && state.score === 0 && state.crates === 0) {
    softReset(false);
  }
  state.running = true;
  if (!activeUsageSessionStartedAtMs) {
    beginUsageSession();
    lastLeaderboardAutoSaveAtMs = performance.now();
    lastLeaderboardAutoSaveBlooms = Math.max(0, Math.floor(state.score));
  }
  setStatus("Session live. Burst clusters to stack combo.", 1.9);
}

function findOpenSlot() {
  const occupied = new Set(state.buds.map((b) => b.slotIndex));
  const blockedRects = getFlowerBlockedRects();
  const shuffled = [...bedSlots].sort(() => Math.random() - 0.5);
  for (const slot of shuffled) {
    if (!occupied.has(slot.index) && !isSlotBlockedByUi(slot, blockedRects)) return slot;
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
  state.buds.push(makeBud(slot, type));
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
        const distSq = getLayoutAdjustedDistanceSq(dx, dy);
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

function runOpeningFullBoardZap(x, y) {
  if (!state.openingZapAvailable || state.buds.length === 0) return false;

  state.openingZapAvailable = false;
  const which = state.nextPalette;
  const nowFrenzy = state.frenzyTimer > 0;
  const targets = [...state.buds];
  let regularCount = 0;
  let goldCount = 0;
  let hitCount = 0;
  let previousPoint = { x, y };

  addPulse(x, y, which, 1.8, 1);
  state.nextPalette = state.nextPalette === 0 ? 1 : 0;
  if (phaseEl) phaseEl.textContent = palette[state.nextPalette]?.name || "";

  for (const bud of targets) {
    const targetPoint = { x: bud.x, y: bud.y - 4 };
    spawnLightning(previousPoint.x, previousPoint.y, targetPoint.x, targetPoint.y, palette[which].glow);
    previousPoint = targetPoint;
    spawnBreakBurst(bud.x, bud.y - 5, bud.type === 2 ? "#ffd875" : palette[bud.type].glow, bud.type === 2 ? 1.4 : 1.05);

    if (bud.type === 2) {
      state.score += nowFrenzy ? 38 : 22;
      addHarvest(2);
      goldCount += 1;
      triggerFrenzy();
      updateChallengeFromHit(which, true);
    } else {
      state.combo += 1;
      state.bestCombo = Math.max(state.bestCombo, state.combo);
      const scoringCombo = Math.min(state.combo, SCORE_COMBO_CAP);
      const base = 4 + Math.floor(scoringCombo * 0.4);
      state.score += nowFrenzy ? base * 2 : base;
      addHarvest(1);
      regularCount += 1;

      if (bud.type === 0) state.stats.amberHits += 1;
      else state.stats.tealHits += 1;
      updateChallengeFromHit(bud.type, false);
    }

    hitCount += 1;
  }

  state.buds = [];
  state.hype = 100;
  state.spawnTimer = OPENING_ZAP_SPAWN_COOLDOWN_SEC;
  syncStreakChallenge();
  syncHud();
  setStatus(`Opening storm x${targets.length}.`, 1.4);

  lofi.actionTone({
    which,
    xNorm: x / Math.max(1, WORLD_W),
    hitCount,
    regularCount,
    goldCount,
    arcCount: hitCount,
    zapCount: 0,
    expandedZaps: hitCount,
    frenzy: nowFrenzy || goldCount > 0,
    miss: false,
    blocked: false,
  });
  postNativeAudio("action", {
    which,
    xNorm: x / Math.max(1, WORLD_W),
    combo: state.combo,
    hitCount,
    regularCount,
    goldCount,
    arcCount: hitCount,
    zapCount: 0,
    expandedZaps: hitCount,
    frenzy: nowFrenzy || goldCount > 0,
    miss: false,
    blocked: false,
  });

  return true;
}

function resolveTapBurst(x, y) {
  const which = state.nextPalette;
  const nowFrenzy = state.frenzyTimer > 0;
  const radius = nowFrenzy ? 36 : 32;
  const tapXNorm = x / WORLD_W;

  addPulse(x, y, which, (nowFrenzy ? 1.3 : 1) * fieldBurstVisualScale, 1);

  state.nextPalette = state.nextPalette === 0 ? 1 : 0;
  if (phaseEl) phaseEl.textContent = palette[state.nextPalette]?.name || "";

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
    const rawDx = bud.x - x;
    const rawDy = (bud.y - 3) - y;
    const dist = Math.sqrt(getLayoutAdjustedDistanceSq(rawDx, rawDy));

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

    const scoringCombo = Math.min(state.combo, SCORE_COMBO_CAP);
    const base = 4 + Math.floor(scoringCombo * 0.4);
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
  autosaveLeaderboardProgress();
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

function drawBackdropSky(colors) {
  const bandH = Math.ceil(WORLD_H / colors.length);
  for (let i = 0; i < colors.length; i += 1) {
    wctx.fillStyle = colors[i];
    wctx.fillRect(0, i * bandH, WORLD_W, bandH + 1);
  }
}

function drawPixelStar(x, y, color, size = 1) {
  const s = Math.max(1, Math.round(size));
  wctx.fillStyle = color;
  wctx.fillRect(Math.round(x), Math.round(y), s, s);
  if (s > 1) {
    wctx.fillRect(Math.round(x - s), Math.round(y), s, s);
    wctx.fillRect(Math.round(x + s), Math.round(y), s, s);
    wctx.fillRect(Math.round(x), Math.round(y - s), s, s);
    wctx.fillRect(Math.round(x), Math.round(y + s), s, s);
  }
}

function drawPixelDiamond(cx, cy, radius, color, shine) {
  const r = Math.max(2, Math.round(radius));
  wctx.fillStyle = color;
  for (let y = -r; y <= r; y += 1) {
    const half = r - Math.abs(y);
    wctx.fillRect(Math.round(cx - half), Math.round(cy + y), Math.max(1, half * 2), 1);
  }
  wctx.fillStyle = shine;
  wctx.fillRect(Math.round(cx - 1), Math.round(cy - r + 2), 2, Math.max(2, Math.round(r * 0.8)));
}

function drawPixelDeer(x, y, unit, phase, dir = 1, scale = 1, grazeAmount = 0, alpha = 1) {
  const s = unit * scale;
  const sizePx = (value) => Math.max(1, Math.round(value * s));
  const offsetPx = (value) => Math.round(value * s);
  const graze = clamp(grazeAmount, 0, 1);
  const bodyBob = Math.sin(phase * 1.1) * s * (0.75 - graze * 0.5);
  const baseX = Math.round(x);
  const baseY = Math.round(y + bodyBob);
  const facing = dir >= 0 ? 1 : -1;
  const rect = (dx, dy, w, h, color) => {
    const mirroredX = facing > 0 ? dx : -dx - w;
    if (color) wctx.fillStyle = color;
    wctx.fillRect(baseX + offsetPx(mirroredX), baseY + offsetPx(dy), sizePx(w), sizePx(h));
  };

  wctx.save();
  wctx.globalAlpha = alpha;

  wctx.fillStyle = "rgba(35, 24, 13, 0.24)";
  wctx.fillRect(baseX - sizePx(13), baseY + offsetPx(2), sizePx(26), sizePx(2));

  const walkA = Math.sin(phase * 2.7);
  const walkB = Math.sin(phase * 2.7 + Math.PI);
  const legSwing = 1 - graze;
  const rearLift = Math.round(Math.max(0, walkA) * legSwing);
  const frontLift = Math.round(Math.max(0, walkB) * legSwing);
  const headDip = Math.round(graze * 12 + Math.sin(phase * 1.4) * graze * 2);
  const headY = -19 + headDip;
  const neckY = -17 + Math.round(graze * 8);
  const tailFlick = Math.sin(phase * 3.8) > 0.72 ? -1 : 0;
  const earFlick = Math.sin(phase * 2.2 + 1.4) > 0.75 ? -1 : 0;

  rect(-10, -5, 2, 7 - rearLift, "#4b2a1b");
  rect(-5, -5, 2, 8 + rearLift, "#6a3c25");
  rect(2, -5, 2, 8 - frontLift, "#6a3c25");
  rect(7, -5, 2, 7 + frontLift, "#4b2a1b");
  rect(-10, 2 - rearLift, 2, 1, "#281913");
  rect(-5, 3 + rearLift, 2, 1, "#281913");
  rect(2, 3 - frontLift, 2, 1, "#281913");
  rect(7, 2 + frontLift, 2, 1, "#281913");

  rect(-13, -12, 5, 6, "#6a3b24");
  rect(-10, -15, 15, 4, "#8a5130");
  rect(-11, -13, 21, 7, "#724126");
  rect(4, -14, 6, 5, "#8a5130");
  rect(8, neckY, 4, 8, "#724126");
  rect(11, headY, 8, 5, "#8a5130");
  rect(17, headY + 2, 3, 2, "#c28a56");

  rect(-7, -15, 8, 1, "#c28a56");
  rect(-3, -10, 1, 1, "#d7a66f");
  rect(2, -11, 1, 1, "#d7a66f");

  rect(-15, -14 + tailFlick, 3, 2, "#ead0a8");
  rect(12, headY - 2 + earFlick, 2, 2, "#a96b3c");
  rect(16, headY - 2, 2, 2, "#a96b3c");
  rect(18, headY + 3, 2, 1, "#ead0a8");

  rect(17, headY + 1, 1, 1, "#2b1a13");
  if (graze < 0.55) {
    rect(13, -24, 1, 5, "#d6b680");
    rect(16, -24, 1, 5, "#d6b680");
    rect(12, -24, 2, 1, "#d6b680");
    rect(16, -25, 2, 1, "#d6b680");
  }

  wctx.restore();
}

function drawPixelSwirl(cx, cy, radius, phase, colors, unit) {
  const px = (value) => Math.max(1, Math.round(value * unit));
  const steps = 20;
  for (let i = 0; i < steps; i += 1) {
    const p = i / steps;
    const angle = phase + p * Math.PI * 3.2;
    const r = radius * p;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r * 0.54;
    const color = colors[i % colors.length];
    wctx.globalAlpha = 0.18 + p * 0.38;
    wctx.fillStyle = color;
    wctx.fillRect(Math.round(x), Math.round(y), px(i % 4 === 0 ? 3 : 2), px(1));
  }
  wctx.globalAlpha = 1;
}

function drawTwilightCity(t, unit) {
  const px = (value) => Math.max(1, Math.round(value * unit));
  const baseY = Math.round(WORLD_H * 0.6);
  const buildings = [
    { x: 0.04, w: 10, h: 23 }, { x: 0.09, w: 14, h: 15 }, { x: 0.16, w: 11, h: 28 },
    { x: 0.22, w: 18, h: 19 }, { x: 0.31, w: 12, h: 32 }, { x: 0.38, w: 16, h: 21 },
    { x: 0.48, w: 10, h: 26 }, { x: 0.55, w: 18, h: 17 }, { x: 0.65, w: 13, h: 30 },
    { x: 0.73, w: 20, h: 20 }, { x: 0.84, w: 12, h: 25 }, { x: 0.91, w: 15, h: 18 },
  ];

  wctx.fillStyle = "rgba(17, 20, 38, 0.34)";
  wctx.fillRect(0, baseY - px(34), WORLD_W, px(39));

  for (let i = 0; i < buildings.length; i += 1) {
    const building = buildings[i];
    const x = Math.round(WORLD_W * building.x);
    const w = px(building.w);
    const h = px(building.h + Math.sin(t * 0.16 + i) * 1.2);
    const y = baseY - h;
    wctx.fillStyle = i % 3 === 0 ? "#16172c" : "#1d2038";
    wctx.fillRect(x, y, w, h);
    wctx.fillStyle = "#0d1022";
    wctx.fillRect(x, y, w, px(2));

    if (i % 4 === 0) {
      wctx.fillStyle = "#2f3560";
      wctx.fillRect(x + Math.round(w * 0.45), y - px(5), px(2), px(5));
      wctx.fillStyle = "#fff0a8";
      wctx.fillRect(x + Math.round(w * 0.45), y - px(6), px(2), px(1));
    }

    for (let wy = y + px(4); wy < baseY - px(3); wy += px(6)) {
      for (let wx = x + px(2); wx < x + w - px(2); wx += px(5)) {
        const lit = Math.sin(t * 0.9 + i * 2.1 + wx * 0.07 + wy * 0.11) > -0.08;
        if (!lit) continue;
        wctx.fillStyle = i % 2 === 0 ? "#ffd768" : "#9ef1e6";
        wctx.fillRect(wx, wy, px(2), px(2));
      }
    }
  }

  wctx.fillStyle = "rgba(118, 226, 218, 0.18)";
  wctx.fillRect(0, baseY + px(1), WORLD_W, px(2));
}

function drawPremiumField(t, unit, colors, options = {}) {
  const px = (value) => Math.max(1, Math.round(value * unit));
  const fieldStartY = Math.round(WORLD_H * (options.fieldStartRatio ?? 0.61));
  const pathStartY = Math.round(WORLD_H * (options.pathStartRatio ?? 0.69));
  const pathMinHalf = px(options.pathMinHalf ?? 5);
  const pathMaxHalf = px(options.pathMaxHalf ?? 30);
  const grassStep = px(options.grassStep ?? 9);
  const isSavannah = options.grassStyle === "savannah";
  const pathStyle = options.pathStyle ?? "path";
  const pathHorizonY = Math.min(pathStartY, Math.max(fieldStartY, Math.round(WORLD_H * (options.pathHorizonRatio ?? 0.57))));
  const getPathMetrics = (y) => {
    if (pathStyle === "none" || y < pathHorizonY) return null;
    const p = (y - pathHorizonY) / Math.max(1, WORLD_H - pathHorizonY);
    const ease = p * p * (3 - 2 * p);
    return {
      p,
      center: WORLD_W * 0.5 + Math.sin(p * 3.9 + t * 0.17) * px(8),
      half: pathMinHalf + ease * pathMaxHalf,
    };
  };

  wctx.fillStyle = colors.field;
  wctx.fillRect(0, fieldStartY, WORLD_W, WORLD_H - fieldStartY);
  for (let y = fieldStartY; y < WORLD_H; y += px(5)) {
    wctx.fillStyle = (y / px(5)) % 2 === 0 ? colors.fieldStripeA : colors.fieldStripeB;
    wctx.fillRect(0, y, WORLD_W, px(2));
  }

  if (pathStyle === "path") {
    for (let y = pathHorizonY; y < WORLD_H; y += 1) {
      const path = getPathMetrics(y);
      const { p, center, half } = path;
      const topFeather = clamp((y - pathHorizonY) / Math.max(1, pathStartY - pathHorizonY + px(5)), 0, 1);
      if (topFeather < 1 && y % px(2) !== 0) continue;
      wctx.globalAlpha = topFeather < 1 ? 0.32 + topFeather * 0.68 : 1;
      wctx.fillStyle = colors.pathEdge ?? colors.path;
      wctx.fillRect(Math.round(center - half - px(2)), y, Math.round((half + px(2)) * 2), 1);
      wctx.fillStyle = colors.path;
      wctx.fillRect(Math.round(center - half), y, Math.round(half * 2), 1);
      wctx.globalAlpha = 1;
      if (p > 0.18 && p < 0.88 && y % px(7) === 0) {
        wctx.fillStyle = colors.pathHighlight ?? colors.path;
        wctx.fillRect(Math.round(center - half * 0.35), y, Math.max(1, Math.round(half * 0.7)), 1);
      }
    }
  } else if (pathStyle === "water") {
    for (let y = pathHorizonY; y < WORLD_H; y += 1) {
      const path = getPathMetrics(y);
      const { p, center, half } = path;
      const streamHalf = Math.max(px(3), half * 0.42);
      const ripple = Math.sin(y * 0.18 + t * 1.2) * px(1);
      wctx.fillStyle = colors.waterEdge ?? "#223d4a";
      wctx.fillRect(Math.round(center - streamHalf - px(1) + ripple), y, Math.round((streamHalf + px(1)) * 2), 1);
      wctx.fillStyle = p > 0.55 ? colors.waterDeep ?? "#285f72" : colors.water ?? "#6cb8c5";
      wctx.fillRect(Math.round(center - streamHalf + ripple), y, Math.round(streamHalf * 2), 1);
      if (y % px(8) === 0) {
        wctx.fillStyle = colors.waterHighlight ?? "#d7fbff";
        wctx.fillRect(Math.round(center - streamHalf * 0.25 + ripple), y, Math.max(1, Math.round(streamHalf * 0.55)), 1);
      }
    }
  } else if (pathStyle === "stones") {
    for (let y = pathHorizonY + px(5); y < WORLD_H - px(2); y += px(14)) {
      const path = getPathMetrics(y);
      const stoneW = Math.max(px(7), Math.round(path.half * 0.55));
      const stoneH = px(4 + (y / px(14)) % 2);
      const offset = Math.sin(y * 0.13 + t * 0.08) * px(7);
      wctx.fillStyle = colors.stoneShadow ?? "#92a0a6";
      wctx.fillRect(Math.round(path.center - stoneW * 0.5 + offset), y + px(1), stoneW, stoneH);
      wctx.fillStyle = colors.stone ?? "#dfe8ec";
      wctx.fillRect(Math.round(path.center - stoneW * 0.5 + offset), y, stoneW, stoneH - px(1));
      wctx.fillStyle = colors.stoneHighlight ?? "#ffffff";
      wctx.fillRect(Math.round(path.center - stoneW * 0.25 + offset), y, Math.max(1, Math.round(stoneW * 0.35)), 1);
    }
  } else if (pathStyle === "deerTracks") {
    for (let y = pathHorizonY + px(4); y < WORLD_H; y += px(9)) {
      const path = getPathMetrics(y);
      const trackOffset = Math.max(px(4), Math.round(path.half * 0.36));
      const trackW = Math.max(px(2), Math.round(path.half * 0.12));
      wctx.globalAlpha = 0.42;
      wctx.fillStyle = colors.trackShadow ?? "#6f5839";
      wctx.fillRect(Math.round(path.center - trackOffset), y, trackW, px(2));
      wctx.fillRect(Math.round(path.center + trackOffset - trackW), y + px(3), trackW, px(2));
      wctx.globalAlpha = 1;
    }
  } else if (pathStyle === "duneRidges") {
    for (let y = fieldStartY + px(9); y < WORLD_H; y += px(12)) {
      const shift = Math.round(Math.sin(y * 0.07 + t * 0.12) * px(8));
      for (let x = -px(16); x < WORLD_W + px(16); x += px(22)) {
        wctx.fillStyle = colors.ridgeShadow ?? "#7a4f62";
        wctx.fillRect(x + shift, y + px(2), px(16), px(1));
        wctx.fillStyle = colors.ridgeHighlight ?? "#ffd3e5";
        wctx.fillRect(x + shift + px(2), y, px(12), px(1));
      }
    }
  } else if (pathStyle === "reefShelf") {
    for (let y = fieldStartY + px(8); y < WORLD_H; y += px(13)) {
      const shift = Math.round(Math.sin(y * 0.05 + t * 0.2) * px(6));
      wctx.globalAlpha = 0.58;
      wctx.fillStyle = colors.sandShelf ?? "#5ba6a4";
      wctx.fillRect(shift, y, WORLD_W, px(2));
      wctx.fillStyle = colors.coralShelf ?? "#c981a9";
      for (let x = px(8); x < WORLD_W; x += px(35)) {
        wctx.fillRect(x + shift, y - px(2), px(5), px(3));
      }
      wctx.globalAlpha = 1;
    }
  }

  for (let row = fieldStartY + px(isSavannah ? 7 : 5); row <= WORLD_H - px(7); row += grassStep) {
    for (let x = px(6); x < WORLD_W; x += px(isSavannah ? 7 : 9)) {
      const p = (row - fieldStartY) / Math.max(1, WORLD_H - fieldStartY);
      const scatter = Math.sin(x * 12.9898 + row * 78.233);
      if (isSavannah && scatter < -0.28) continue;
      const drift = isSavannah ? Math.round(Math.sin(x * 0.37 + row * 0.19) * px(2)) : 0;
      const sway = Math.sin(t * (isSavannah ? 1.25 : 2.1) + x * 0.09 + row * 0.05) > 0 ? 1 : 0;
      const bladeX = x + drift + sway;
      const path = getPathMetrics(row);
      if ((pathStyle === "path" || pathStyle === "water") && path && Math.abs(bladeX - path.center) <= path.half + px(4)) continue;
      const height = isSavannah ? Math.max(2, Math.round(px(2) + p * px(5))) : 3;
      wctx.fillStyle = colors.sproutA;
      wctx.fillRect(bladeX, row - height + 2, 1, height);
      wctx.fillStyle = colors.sproutB;
      wctx.fillRect(bladeX - 1, row, 1, Math.max(1, Math.round(height * 0.45)));
      if (!isSavannah || scatter > 0.2) {
        wctx.fillRect(bladeX + 1, row, 1, Math.max(1, Math.round(height * 0.45)));
      }
      if (isSavannah && (x + row) % px(21) === 0) {
        wctx.fillStyle = colors.grassBloom ?? colors.sproutA;
        wctx.fillRect(bladeX, row - height, 1, 1);
      }
    }
  }
}

function drawMoonlitFireflies(t, unit) {
  const px = (value) => Math.max(1, Math.round(value * unit));
  const fireflies = [
    { x: 0.34, y: 0.62, drift: 0.8, phase: 0.4 },
    { x: 0.67, y: 0.7, drift: 1.1, phase: 2.8 },
  ];

  wctx.save();
  for (const fly of fireflies) {
    const pulse = (Math.sin(t * 2.4 + fly.phase) + 1) * 0.5;
    const wing = Math.sin(t * 8 + fly.phase) > 0 ? 1 : -1;
    const x = Math.round(WORLD_W * fly.x + Math.sin(t * 0.55 * fly.drift + fly.phase) * px(12));
    const y = Math.round(WORLD_H * fly.y + Math.cos(t * 0.42 * fly.drift + fly.phase) * px(8));
    const halo = px(4 + pulse * 2);

    wctx.globalAlpha = 0.16 + pulse * 0.14;
    wctx.fillStyle = "#f4e9a3";
    wctx.fillRect(x - halo, y - px(1), halo * 2, px(2));
    wctx.fillRect(x - px(1), y - halo, px(2), halo * 2);
    wctx.globalAlpha = 0.36 + pulse * 0.3;
    wctx.fillStyle = "#ffe681";
    wctx.fillRect(x - px(2), y - px(2), px(4), px(4));
    wctx.globalAlpha = 0.85;
    wctx.fillStyle = "#fff7bf";
    wctx.fillRect(x, y, px(1), px(1));
    wctx.globalAlpha = 0.42;
    wctx.fillStyle = "#c8fff4";
    wctx.fillRect(x - px(3), y + wing, px(2), px(1));
    wctx.fillRect(x + px(2), y - wing, px(2), px(1));
  }
  wctx.restore();
}

function drawColorBackdrop(t, unit) {
  const px = (value) => Math.max(1, Math.round(value * unit));
  const base = hexToRgb(state.backdropColor);
  const white = { r: 255, g: 255, b: 255 };
  const night = { r: 18, g: 22, b: 32 };
  const earth = { r: 88, g: 74, b: 48 };
  const field = mixRgb(base, { r: 54, g: 87, b: 56 }, 0.58);
  const fieldDark = mixRgb(field, night, 0.18);

  const skyBands = [
    mixRgb(base, white, 0.42),
    mixRgb(base, white, 0.26),
    base,
    mixRgb(base, night, 0.18),
    mixRgb(base, night, 0.34),
  ];
  const skyBandH = Math.max(px(12), Math.ceil(WORLD_H * 0.58 / skyBands.length));
  for (let i = 0; i < skyBands.length; i += 1) {
    wctx.fillStyle = rgbString(skyBands[i]);
    wctx.fillRect(0, i * skyBandH, WORLD_W, skyBandH + 1);
  }

  for (let x = 0; x < WORLD_W; x += px(3)) {
    const y = WORLD_H * 0.45 + Math.sin(x * 0.055 + t * 0.08) * px(4);
    wctx.fillStyle = rgbString(mixRgb(base, night, 0.42));
    wctx.fillRect(x, Math.round(y), px(3), Math.max(px(18), Math.round(WORLD_H * 0.2)));
  }

  const sunX = Math.round(WORLD_W * 0.78 + Math.sin(t * 0.1) * px(2));
  const sunY = Math.round(WORLD_H * 0.18 + Math.cos(t * 0.08) * px(1));
  wctx.fillStyle = rgbString(mixRgb(base, white, 0.74), 0.42);
  wctx.fillRect(sunX - px(14), sunY - px(14), px(28), px(28));
  wctx.fillStyle = rgbString(mixRgb(base, white, 0.86));
  wctx.fillRect(sunX - px(7), sunY - px(7), px(14), px(14));

  const fieldStartY = Math.round(WORLD_H * 0.58);
  wctx.fillStyle = rgbString(field);
  wctx.fillRect(0, fieldStartY, WORLD_W, WORLD_H - fieldStartY);
  for (let y = fieldStartY; y < WORLD_H; y += px(6)) {
    wctx.fillStyle = rgbString((y / px(6)) % 2 === 0 ? mixRgb(field, white, 0.08) : fieldDark);
    wctx.fillRect(0, y, WORLD_W, px(3));
  }

  for (let y = fieldStartY + px(12); y < WORLD_H; y += px(9)) {
    const p = (y - fieldStartY) / Math.max(1, WORLD_H - fieldStartY);
    for (let x = px(6); x < WORLD_W; x += px(11)) {
      const sway = Math.sin(t * 1.6 + x * 0.12 + y * 0.08) > 0 ? 1 : 0;
      wctx.fillStyle = rgbString(mixRgb(field, white, 0.22));
      wctx.fillRect(x + sway, y - Math.round(px(2 + p * 3)), px(1), Math.round(px(2 + p * 3)));
      wctx.fillStyle = rgbString(mixRgb(field, night, 0.22));
      wctx.fillRect(x - px(1) + sway, y, px(1), px(2));
    }
  }

  for (let row = Math.round(WORLD_H * 0.66); row < WORLD_H; row += px(13)) {
    const shift = Math.round(Math.sin(row * 0.05 + t * 0.18) * px(7));
    for (let x = -px(14); x < WORLD_W + px(14); x += px(24)) {
      wctx.fillStyle = rgbString(mixRgb(base, earth, 0.56), 0.44);
      wctx.fillRect(x + shift, row + px(2), px(17), px(1));
      wctx.fillStyle = rgbString(mixRgb(base, white, 0.44), 0.72);
      wctx.fillRect(x + shift + px(2), row, px(11), px(1));
    }
  }
}

function drawFlagBackdrop(t, unit) {
  const px = (value) => Math.max(1, Math.round(value * unit));
  const stripeCount = 13;
  const stripeH = Math.ceil(WORLD_H / stripeCount);
  const waveStep = px(4);

  for (let y = 0; y < WORLD_H; y += 1) {
    for (let x = -waveStep; x < WORLD_W + waveStep; x += waveStep) {
      const waveY = Math.sin(x * 0.028 + t * 0.72) * px(1.7)
        + Math.sin(x * 0.06 - t * 0.42) * px(0.8);
      const stripeIndex = Math.floor(clamp(y + waveY, 0, WORLD_H - 1) / stripeH);
      wctx.fillStyle = stripeIndex % 2 === 0 ? "#b22234" : "#f7f2e8";
      wctx.fillRect(x, y, waveStep, 1);
    }
  }

  for (let x = 0; x < WORLD_W; x += waveStep) {
    const fold = Math.sin(x * 0.055 + t * 1.15);
    if (Math.abs(fold) < 0.42) continue;
    wctx.globalAlpha = 0.035 + Math.abs(fold) * 0.045;
    wctx.fillStyle = fold > 0 ? "#ffffff" : "#07182a";
    wctx.fillRect(x, 0, waveStep, WORLD_H);
  }
  wctx.globalAlpha = 1;

  const cantonW = Math.round(WORLD_W * 0.42);
  const cantonH = stripeH * 7;
  for (let y = 0; y < cantonH; y += 1) {
    const edgeWave = Math.round(Math.sin(y * 0.07 + t * 0.62) * px(1.2));
    wctx.fillStyle = y % px(12) < px(6) ? "#1f3f84" : "#233f7a";
    wctx.fillRect(edgeWave - px(4), y, cantonW + px(5), 1);
  }
  for (let row = 0; row < 9; row += 1) {
    const starCount = row % 2 === 0 ? 6 : 5;
    const rowInset = row % 2 === 0 ? 0 : 0.5;
    for (let col = 0; col < starCount; col += 1) {
      const starY = Math.round(px(5) + row * ((cantonH - px(10)) / 8));
      const starWave = Math.round(Math.sin(starY * 0.07 + t * 0.62) * px(1.2));
      const spacing = (cantonW - px(16)) / 5.5;
      const x = Math.round(starWave + px(8) + (col + rowInset) * spacing);
      drawPixelStar(x, starY, "#fff7df", 1);
    }
  }

  wctx.fillStyle = "rgba(24, 33, 45, 0.18)";
  wctx.fillRect(0, 0, WORLD_W, WORLD_H);

  const lowerStartY = Math.round(WORLD_H * 0.58);
  wctx.fillStyle = "rgba(16, 25, 39, 0.22)";
  wctx.fillRect(0, lowerStartY, WORLD_W, WORLD_H - lowerStartY);
  for (let y = lowerStartY; y < WORLD_H; y += px(10)) {
    wctx.fillStyle = y % px(20) === 0 ? "rgba(255, 247, 223, 0.2)" : "rgba(31, 63, 132, 0.16)";
    wctx.fillRect(0, y, WORLD_W, px(2));
  }
}

function drawRoseBackdrop(t, unit) {
  const px = (value) => Math.max(1, Math.round(value * unit));
  drawBackdropSky(["#ffe1ee", "#ffc7dc", "#f7a9ca", "#e989b5", "#c96898", "#8a5672"]);

  const sunX = Math.round(WORLD_W * 0.77 + Math.sin(t * 0.08) * px(2));
  const sunY = Math.round(WORLD_H * 0.19);
  wctx.fillStyle = "rgba(255, 227, 171, 0.36)";
  wctx.fillRect(sunX - px(18), sunY - px(16), px(36), px(32));
  wctx.fillStyle = "#ffe3ab";
  wctx.fillRect(sunX - px(9), sunY - px(8), px(18), px(16));

  const duneBands = [
    { y: 0.42, amp: 5, step: 4, color: "#c45b91" },
    { y: 0.5, amp: 7, step: 5, color: "#d9789d" },
    { y: 0.58, amp: 6, step: 6, color: "#b66676" },
  ];
  for (const band of duneBands) {
    for (let x = -px(8); x < WORLD_W + px(8); x += px(band.step)) {
      const y = WORLD_H * band.y + Math.sin(x * 0.035 + t * 0.045 + band.y * 7) * px(band.amp);
      wctx.fillStyle = band.color;
      wctx.fillRect(x, Math.round(y), px(band.step), WORLD_H - Math.round(y));
    }
  }

  for (let i = 0; i < 28; i += 1) {
    const x = (i * 29 + Math.floor(t * 8) + Math.sin(t * 0.8 + i) * px(7)) % WORLD_W;
    const y = px(14) + ((i * 17 + Math.floor(t * 5)) % Math.round(WORLD_H * 0.58));
    const flip = Math.sin(t * 2.4 + i) > 0;
    wctx.globalAlpha = 0.34 + (i % 4) * 0.08;
    wctx.fillStyle = i % 3 === 0 ? "#fff0f7" : "#ff96c3";
    wctx.fillRect(Math.round(x), Math.round(y), px(flip ? 3 : 2), px(flip ? 1 : 2));
    wctx.globalAlpha = 1;
  }

  for (let i = 0; i < 5; i += 1) {
    const x = Math.round(WORLD_W * (0.08 + i * 0.2));
    const y = Math.round(WORLD_H * (0.55 + (i % 2) * 0.03));
    wctx.fillStyle = "#7b4a58";
    wctx.fillRect(x, y - px(10), px(2), px(12));
    wctx.fillStyle = i % 2 === 0 ? "#f6a8c7" : "#d9789d";
    wctx.fillRect(x - px(5), y - px(14), px(12), px(6));
    wctx.fillStyle = "#fff0f7";
    wctx.fillRect(x - px(2), y - px(15), px(4), px(2));
  }

  drawPremiumField(t, unit, {
    field: "#8a5a6f",
    fieldStripeA: "#9e6a80",
    fieldStripeB: "#74465f",
    path: "#c58a6f",
    pathEdge: "#87534d",
    pathHighlight: "#f2b58f",
    sproutA: "#e7a0be",
    sproutB: "#8f5a7f",
    grassBloom: "#ffd3e5",
    ridgeShadow: "#75475d",
    ridgeHighlight: "#ffd3e5",
  }, {
    fieldStartRatio: 0.6,
    pathStyle: "duneRidges",
    grassStep: 8,
    grassStyle: "savannah",
  });
}

function drawFrostBackdrop(t, unit) {
  const px = (value) => Math.max(1, Math.round(value * unit));
  drawBackdropSky(["#d7eaff", "#e5f1ff", "#f4f8ff", "#fffaf1", "#e7eef4", "#c9dae4"]);

  const sunX = Math.round(WORLD_W * 0.68);
  const sunY = Math.round(WORLD_H * 0.18 + Math.sin(t * 0.07) * px(1));
  wctx.fillStyle = "rgba(255, 250, 241, 0.48)";
  wctx.fillRect(sunX - px(16), sunY - px(14), px(32), px(28));
  wctx.fillStyle = "#fffaf1";
  wctx.fillRect(sunX - px(7), sunY - px(7), px(14), px(14));

  const mountainBase = Math.round(WORLD_H * 0.62);
  for (let x = -px(8); x < WORLD_W + px(8); x += px(5)) {
    const peak = WORLD_H * 0.35 + Math.abs(Math.sin(x * 0.025 + 1.4)) * px(22);
    wctx.fillStyle = "#b8cbd6";
    wctx.fillRect(x, Math.round(peak), px(5), mountainBase - Math.round(peak));
    wctx.fillStyle = "#f8fbff";
    wctx.fillRect(x, Math.round(peak), px(3), Math.max(px(5), Math.round((mountainBase - peak) * 0.28)));
  }

  for (let x = px(8); x < WORLD_W; x += px(22)) {
    const y = Math.round(WORLD_H * 0.58 + Math.sin(x * 0.07) * px(3));
    wctx.fillStyle = "#7c97a3";
    wctx.fillRect(x, y - px(18), px(3), px(20));
    wctx.fillStyle = x % px(44) === 0 ? "#dce8ed" : "#edf6f8";
    wctx.fillRect(x - px(7), y - px(17), px(17), px(5));
    wctx.fillRect(x - px(5), y - px(23), px(13), px(5));
    wctx.fillStyle = "#9db5bf";
    wctx.fillRect(x - px(6), y - px(12), px(14), px(3));
  }

  for (let i = 0; i < 42; i += 1) {
    const x = (i * 19 + Math.floor(t * 4) + Math.sin(t * 0.5 + i) * px(4)) % WORLD_W;
    const y = (i * 13 + Math.floor(t * 9)) % Math.round(WORLD_H * 0.82);
    wctx.globalAlpha = 0.38 + (i % 3) * 0.12;
    wctx.fillStyle = i % 5 === 0 ? "#ffffff" : "#d8edf7";
    wctx.fillRect(Math.round(x), Math.round(y), px(i % 7 === 0 ? 2 : 1), px(1));
    wctx.globalAlpha = 1;
  }

  drawPremiumField(t, unit, {
    field: "#d9e4e9",
    fieldStripeA: "#eef5f7",
    fieldStripeB: "#c2d4dc",
    path: "#aab6bc",
    pathEdge: "#849aa6",
    pathHighlight: "#f8fbff",
    sproutA: "#8bb7bf",
    sproutB: "#668d92",
    grassBloom: "#ffffff",
    stone: "#edf6f8",
    stoneShadow: "#9db5bf",
    stoneHighlight: "#ffffff",
  }, {
    fieldStartRatio: 0.59,
    pathStyle: "stones",
    pathStartRatio: 0.64,
    pathMinHalf: 5,
    pathMaxHalf: 22,
    grassStep: 9,
  });
}

function drawAzureBackdrop(t, unit) {
  const px = (value) => Math.max(1, Math.round(value * unit));
  drawBackdropSky(["#063665", "#074f84", "#0872a0", "#0a98b8", "#31b6c9", "#88d8db"]);

  for (let i = 0; i < 6; i += 1) {
    const x = Math.round(WORLD_W * (0.1 + i * 0.16) + Math.sin(t * 0.15 + i) * px(5));
    wctx.globalAlpha = 0.2;
    wctx.fillStyle = "#c7fbff";
    wctx.fillRect(x, 0, px(5 + i), Math.round(WORLD_H * 0.58));
    wctx.globalAlpha = 1;
  }

  for (let y = Math.round(WORLD_H * 0.18); y < WORLD_H * 0.62; y += px(12)) {
    const shift = Math.round(Math.sin(t * 0.38 + y * 0.05) * px(7));
    wctx.fillStyle = y % px(24) === 0 ? "rgba(173, 245, 255, 0.38)" : "rgba(38, 143, 176, 0.3)";
    wctx.fillRect(shift, y, WORLD_W, px(2));
  }

  for (let i = 0; i < 9; i += 1) {
    const dir = i % 2 === 0 ? 1 : -1;
    const speed = 4 + (i % 3);
    const x = ((t * speed * dir + i * 43) % (WORLD_W + px(28)) + WORLD_W + px(28)) % (WORLD_W + px(28)) - px(14);
    const y = Math.round(WORLD_H * (0.25 + (i % 5) * 0.07) + Math.sin(t * 1.2 + i) * px(3));
    const fishX = dir > 0 ? x : WORLD_W - x;
    wctx.fillStyle = i % 3 === 0 ? "#ffd069" : i % 3 === 1 ? "#ff8a7c" : "#adefff";
    wctx.fillRect(Math.round(fishX), y, px(6), px(3));
    wctx.fillRect(Math.round(fishX - dir * px(2)), y + px(1), px(2), px(1));
    wctx.fillStyle = "#07395b";
    wctx.fillRect(Math.round(fishX + dir * px(4)), y + px(1), px(1), px(1));
  }

  const reefY = Math.round(WORLD_H * 0.57);
  for (let x = px(7); x < WORLD_W; x += px(27)) {
    const h = px(10 + (x / px(27)) % 4);
    wctx.fillStyle = x % px(54) === 0 ? "#a66f9f" : "#53649a";
    wctx.fillRect(x, reefY - h, px(3), h);
    wctx.fillRect(x - px(3), reefY - Math.round(h * 0.65), px(3), px(2));
    wctx.fillRect(x + px(3), reefY - Math.round(h * 0.45), px(3), px(2));
    wctx.fillStyle = "#315f72";
    wctx.fillRect(x + px(9), reefY - px(6), px(6), px(6));
    wctx.fillRect(x + px(8), reefY - px(8), px(2), px(2));
  }

  for (let i = 0; i < 24; i += 1) {
    const x = (i * 31 + Math.sin(t * 0.35 + i) * px(5) + WORLD_W) % WORLD_W;
    const y = Math.round(WORLD_H * 0.56 - ((t * 8 + i * 13) % Math.round(WORLD_H * 0.5)));
    wctx.globalAlpha = 0.32 + (i % 3) * 0.1;
    wctx.fillStyle = "#c7fbff";
    wctx.fillRect(Math.round(x), y, px(i % 5 === 0 ? 2 : 1), px(i % 5 === 0 ? 2 : 1));
    wctx.globalAlpha = 1;
  }

  drawPremiumField(t, unit, {
    field: "#1a5b73",
    fieldStripeA: "#20748a",
    fieldStripeB: "#144e66",
    sproutA: "#6f8792",
    sproutB: "#3d6570",
    grassBloom: "#b98db1",
    sandShelf: "#3f8f99",
    coralShelf: "#c981a9",
  }, {
    fieldStartRatio: 0.61,
    pathStyle: "reefShelf",
    grassStep: 8,
  });
}

function drawTwilightBackdrop(t, unit) {
  const px = (value) => Math.max(1, Math.round(value * unit));
  drawBackdropSky(["#111527", "#171b35", "#212145", "#302652", "#473468", "#665080"]);

  const moonX = Math.round(WORLD_W * 0.78 + Math.sin(t * 0.11) * px(2));
  const moonY = Math.round(WORLD_H * 0.16 + Math.cos(t * 0.09) * px(1));
  wctx.fillStyle = "#fff0b8";
  wctx.fillRect(moonX - px(7), moonY - px(7), px(14), px(14));
  wctx.fillStyle = "#665080";
  wctx.fillRect(moonX - px(1), moonY - px(7), px(7), px(14));

  drawPixelSwirl(WORLD_W * 0.26, WORLD_H * 0.19, px(22), t * 0.12, ["#fff2c8", "#76e2da", "#8b70bd"], unit);
  drawPixelSwirl(WORLD_W * 0.54, WORLD_H * 0.29, px(16), -t * 0.1 + 1.7, ["#9eddda", "#fff0b8", "#5b4f94"], unit);

  for (let i = 0; i < 42; i += 1) {
    const x = (i * 47 + Math.floor(t * 3)) % WORLD_W;
    const y = (i * 19) % Math.round(WORLD_H * 0.42);
    const pulse = Math.sin(t * 2.4 + i) > 0.25;
    drawPixelStar(x, y + px(4), pulse ? "#fff2c8" : "#9eddda", i % 9 === 0 ? 2 : 1);
  }

  for (let x = -px(20); x < WORLD_W + px(20); x += px(8)) {
    const y = WORLD_H * 0.43 + Math.sin(x * 0.05 + t * 0.08) * px(5);
    wctx.fillStyle = "#26284b";
    wctx.fillRect(x, Math.round(y), px(8), Math.max(px(28), Math.round(WORLD_H * 0.25)));
    wctx.fillStyle = "#1b253b";
    wctx.fillRect(x + px(3), Math.round(y - px(9)), px(3), px(9));
  }

  drawTwilightCity(t, unit);

  for (let i = 0; i < 18; i += 1) {
    const x = (i * 31 + Math.sin(t * 0.7 + i) * px(4) + WORLD_W) % WORLD_W;
    const y = WORLD_H * 0.48 + ((i * 13) % Math.round(WORLD_H * 0.35));
    wctx.fillStyle = i % 2 === 0 ? "#ffd768" : "#76e2da";
    wctx.globalAlpha = 0.45 + Math.sin(t * 3 + i) * 0.22;
    wctx.fillRect(Math.round(x), Math.round(y), px(2), px(2));
    wctx.globalAlpha = 1;
  }

  drawPremiumField(t, unit, {
    field: "#244f43",
    fieldStripeA: "#2c6553",
    fieldStripeB: "#21473b",
    sproutA: "#77d28f",
    sproutB: "#52a66d",
    ridgeShadow: "#193a32",
    ridgeHighlight: "#76e2da",
  }, {
    pathStyle: "duneRidges",
    grassStep: 9,
  });
}

function drawMoonlitFallsBackdrop(t, unit) {
  const px = (value) => Math.max(1, Math.round(value * unit));
  drawBackdropSky(["#162235", "#1d3045", "#284356", "#385866", "#4e6e6b", "#6f8273"]);

  const moonX = Math.round(WORLD_W * 0.74);
  const moonY = Math.round(WORLD_H * 0.18 + Math.sin(t * 0.08) * px(1));
  wctx.fillStyle = "#f3ead2";
  wctx.fillRect(moonX - px(8), moonY - px(8), px(16), px(16));
  wctx.fillStyle = "rgba(243, 234, 210, 0.24)";
  wctx.fillRect(moonX - px(15), moonY - px(14), px(30), px(28));

  for (let i = 0; i < 24; i += 1) {
    const x = (i * 37 + Math.floor(t * 1.5)) % WORLD_W;
    const y = px(8) + ((i * 17) % Math.round(WORLD_H * 0.3));
    drawPixelStar(x, y, i % 5 === 0 ? "#d7fbff" : "#f3ead2", i % 8 === 0 ? 2 : 1);
  }

  for (let x = -px(8); x < WORLD_W + px(8); x += px(4)) {
    const y = WORLD_H * 0.42 + Math.sin(x * 0.045 + t * 0.04) * px(5);
    wctx.fillStyle = "#213147";
    wctx.fillRect(x, Math.round(y), px(4), Math.max(px(32), Math.round(WORLD_H * 0.3)));
  }
  for (let x = 0; x < WORLD_W; x += px(6)) {
    const y = WORLD_H * 0.51 + Math.sin(x * 0.055 + 1.4) * px(4);
    wctx.fillStyle = "#2b3c4e";
    wctx.fillRect(x, Math.round(y), px(6), Math.max(px(20), Math.round(WORLD_H * 0.2)));
  }

  const fallsX = Math.round(WORLD_W * 0.48);
  const fallsTop = Math.round(WORLD_H * 0.38);
  const fallsBottom = Math.round(WORLD_H * 0.66);
  wctx.fillStyle = "#d7fbff";
  wctx.fillRect(fallsX - px(8), fallsTop, px(15), fallsBottom - fallsTop);
  wctx.fillStyle = "#8dd0dc";
  wctx.fillRect(fallsX + px(2), fallsTop, px(6), fallsBottom - fallsTop);
  for (let y = fallsTop; y < fallsBottom; y += px(6)) {
    const drift = Math.round(Math.sin(t * 1.1 + y) * px(2));
    wctx.fillStyle = "rgba(255, 255, 255, 0.62)";
    wctx.fillRect(fallsX - px(6) + drift, y, px(4), px(2));
    wctx.fillStyle = "rgba(122, 207, 219, 0.58)";
    wctx.fillRect(fallsX + px(5) - drift, y + px(3), px(3), px(2));
  }

  const poolY = Math.round(WORLD_H * 0.64);
  wctx.fillStyle = "#254c59";
  wctx.fillRect(0, poolY, WORLD_W, WORLD_H - poolY);
  for (let y = poolY; y < WORLD_H; y += px(7)) {
    const shift = Math.round(Math.sin(t * 0.55 + y * 0.07) * px(5));
    wctx.fillStyle = y % px(14) === 0 ? "#356a70" : "#2a5862";
    wctx.fillRect(shift, y, WORLD_W, px(2));
  }

  for (let i = 0; i < 10; i += 1) {
    const x = Math.round((i * 31 + Math.sin(t * 0.17 + i) * px(3) + WORLD_W) % WORLD_W);
    const y = Math.round(poolY + px(8) + ((i * 11) % Math.max(px(8), WORLD_H - poolY - px(16))));
    wctx.fillStyle = "#718475";
    wctx.fillRect(x - px(5), y - px(2), px(10), px(4));
    wctx.fillStyle = "#d7fbff";
    wctx.fillRect(x - px(1), y - px(1), px(2), px(1));
  }

  for (let i = 0; i < 5; i += 1) {
    const x = Math.round(WORLD_W * (0.14 + i * 0.18));
    const y = Math.round(WORLD_H * 0.58 + Math.sin(i) * px(3));
    wctx.fillStyle = "#5d5141";
    wctx.fillRect(x - px(7), y, px(14), px(4));
    wctx.fillStyle = "#9a7e59";
    wctx.fillRect(x - px(5), y - px(2), px(10), px(2));
  }

  for (let i = 0; i < 6; i += 1) {
    const x = Math.round(WORLD_W * (0.1 + i * 0.16));
    const y = Math.round(WORLD_H * 0.55 + (i % 2) * px(4));
    wctx.fillStyle = "#3b2b23";
    wctx.fillRect(x, y, px(2), px(9));
    wctx.fillStyle = "#ffd27e";
    wctx.fillRect(x - px(2), y - px(4), px(6), px(5));
    wctx.fillStyle = "rgba(255, 210, 126, 0.24)";
    wctx.fillRect(x - px(5), y - px(6), px(12), px(9));
  }

  drawPremiumField(t, unit, {
    field: "#456853",
    fieldStripeA: "#5a8061",
    fieldStripeB: "#385844",
    sproutA: "#b4d98d",
    sproutB: "#789f68",
    water: "#6fb7c1",
    waterDeep: "#285f72",
    waterEdge: "#203c45",
    waterHighlight: "#d7fbff",
  }, {
    pathStyle: "water",
    pathStartRatio: 0.62,
    pathMinHalf: 3,
    pathMaxHalf: 18,
  });
  drawMoonlitFireflies(t, unit);
}

function drawEmberBackdrop(t, unit) {
  const px = (value) => Math.max(1, Math.round(value * unit));
  drawBackdropSky(["#2b1724", "#4b2030", "#783039", "#a94638", "#cf6940", "#f0a95d"]);

  const sunX = Math.round(WORLD_W * 0.82);
  const sunY = Math.round(WORLD_H * 0.22 + Math.sin(t * 0.12) * px(2));
  wctx.fillStyle = "#ffd181";
  wctx.fillRect(sunX - px(10), sunY - px(8), px(20), px(16));
  wctx.fillStyle = "rgba(255, 112, 68, 0.36)";
  wctx.fillRect(sunX - px(17), sunY - px(14), px(34), px(28));

  for (let x = -px(12); x < WORLD_W + px(12); x += px(4)) {
    const ridge = WORLD_H * 0.42 + Math.sin(x * 0.05 + t * 0.05) * px(7);
    wctx.fillStyle = "#401f2c";
    wctx.fillRect(x, Math.round(ridge), px(4), Math.max(px(28), Math.round(WORLD_H * 0.3)));
  }
  for (let x = 0; x < WORLD_W; x += px(18)) {
    const flameY = WORLD_H * 0.57 + Math.sin(t * 1.4 + x) * px(2);
    wctx.fillStyle = "#ffc36a";
    wctx.fillRect(x, Math.round(flameY), px(2), px(5));
    wctx.fillStyle = "#ff724d";
    wctx.fillRect(x + px(2), Math.round(flameY + px(2)), px(2), px(3));
  }

  for (let i = 0; i < 26; i += 1) {
    const x = (i * 23 + Math.floor(t * 10)) % WORLD_W;
    const y = (i * 17 + Math.floor(t * 7)) % Math.round(WORLD_H * 0.62);
    wctx.fillStyle = i % 3 === 0 ? "#ffe08e" : "#ff7d54";
    wctx.globalAlpha = 0.22 + (i % 4) * 0.08;
    wctx.fillRect(x, y, px(1), px(1 + (i % 2)));
    wctx.globalAlpha = 1;
  }

  drawPremiumField(t, unit, {
    field: "#8f834a",
    fieldStripeA: "#9d9053",
    fieldStripeB: "#7d7643",
    sproutA: "#c8b35e",
    sproutB: "#6f7542",
    grassBloom: "#e7ca72",
    trackShadow: "#75603a",
  }, {
    fieldStartRatio: 0.56,
    pathStyle: "deerTracks",
    pathStartRatio: 0.555,
    pathMinHalf: 0.6,
    pathMaxHalf: 34,
    grassStep: 7,
    grassStyle: "savannah",
  });
}

function drawBackdropActors() {
  if (state.backdrop !== "ember") return;

  const t = state.time;
  const unit = clamp(Math.min(WORLD_W, WORLD_H) / 180, 0.85, 1.25);
  const px = (value) => Math.max(1, Math.round(value * unit));
  const deerSpecs = [
    { lane: 0.69, offset: 0.58, speed: 2.4, dir: -1, scale: 0.88, grazePhase: 1.9, alpha: 0.82 },
    { lane: 0.82, offset: 0.2, speed: 2.1, dir: 1, scale: 0.84, grazePhase: 5.6, alpha: 0.78 },
  ];

  for (let i = 0; i < deerSpecs.length; i += 1) {
    const deer = deerSpecs[i];
    const margin = px(34 + deer.scale * 10);
    const loop = WORLD_W + margin * 2;
    const rawTravel = (t * deer.speed + WORLD_W * deer.offset) % loop;
    const x = deer.dir > 0 ? rawTravel - margin : WORLD_W + margin - rawTravel;
    const y = WORLD_H * deer.lane
      + Math.sin(t * 0.17 + i * 1.3) * px(2)
      + Math.sin((x / Math.max(1, WORLD_W)) * Math.PI * 2) * px(3);
    const grazeWave = (Math.sin(t * 0.42 + deer.grazePhase) + 1) * 0.5;
    const grazeAmount = clamp((grazeWave - 0.48) * 3.2, 0, 1);
    const gaitPhase = t * (0.9 + deer.speed * 0.12) + i * 1.8;
    const edgeFade = clamp(Math.min((x + margin) / margin, (WORLD_W + margin - x) / margin), 0, 1);
    drawPixelDeer(x, y, unit, gaitPhase, deer.dir, deer.scale, grazeAmount, deer.alpha * edgeFade);
  }
}

function drawBackground() {
  const t = state.time;
  const unit = clamp(Math.min(WORLD_W, WORLD_H) / 180, 0.85, 1.25);
  if (state.backdrop === "twilight") {
    drawTwilightBackdrop(t, unit);
    return;
  }
  if (state.backdrop === "aurora") {
    drawMoonlitFallsBackdrop(t, unit);
    return;
  }
  if (state.backdrop === "ember") {
    drawEmberBackdrop(t, unit);
    return;
  }
  if (state.backdrop === "color") {
    drawColorBackdrop(t, unit);
    return;
  }
  if (state.backdrop === "flag") {
    drawFlagBackdrop(t, unit);
    return;
  }
  if (state.backdrop === "rose") {
    drawRoseBackdrop(t, unit);
    return;
  }
  if (state.backdrop === "frost") {
    drawFrostBackdrop(t, unit);
    return;
  }
  if (state.backdrop === "azure") {
    drawAzureBackdrop(t, unit);
    return;
  }

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
  const blockedRects = getFlowerBlockedRects();
  for (const slot of bedSlots) {
    if (isSlotBlockedByUi(slot, blockedRects)) continue;
    if (!drawSprite("bed", slot.x - 8, slot.y - 8, 16)) {
      wctx.fillStyle = "#6a4b30";
      wctx.fillRect(slot.x - 6, slot.y + 1, 12, 4);
      wctx.fillStyle = "#3f2d1f";
      wctx.fillRect(slot.x - 4, slot.y, 8, 2);
    }
  }

  drawBackdropActors();

  for (const bud of state.buds) {
    if (isSlotBlockedByUi(bud, blockedRects)) continue;
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
let loopErrorCount = 0;
function scheduleGameLoop() {
  try {
    const scheduleFrame = window.requestAnimationFrame || ((callback) => setTimeout(() => callback(performance.now()), 33));
    scheduleFrame.call(window, loop);
  } catch (error) {
    console.warn("[Bloomwave] Frame scheduling failed", error);
    setTimeout(() => loop(performance.now()), 33);
  }
}

function loop(now) {
  try {
    const dt = Math.min(33, now - prevTime);
    prevTime = now;

    update(dt);
    render();
    loopErrorCount = 0;
  } catch (error) {
    loopErrorCount += 1;
    console.warn("[Bloomwave] Game loop failed", error);
    if (loopErrorCount >= 3) {
      state.running = false;
      setStatus("Recovered from a display hiccup.", 1.5);
      loopErrorCount = 0;
    }
  }

  scheduleGameLoop();
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
  if (runOpeningFullBoardZap(x, y)) return true;
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

let resizeFrame = 0;
function handleViewportResize() {
  if (resizeFrame) return;
  resizeFrame = requestAnimationFrame(() => {
    resizeFrame = 0;
    resizeGameSurface();
  });
}

function settleViewportResize() {
  handleViewportResize();
  setTimeout(handleViewportResize, 80);
  setTimeout(handleViewportResize, 240);
}

canvas.addEventListener("pointerdown", safeUiAction("pointer down", handlePointerDown));
canvas.addEventListener("pointermove", safeUiAction("pointer move", handlePointerMove));
window.addEventListener("touchend", safeUiAction("audio nudge", nudgeAudio), { passive: true });
window.addEventListener("focus", safeUiAction("focus restore", () => {
  if (shareResumeGuardUntilMs) guardShareResume(500);
  if (lofi.started) nudgeAudio();
}));
document.addEventListener("visibilitychange", safeUiAction("visibility restore", () => {
  if (!document.hidden) {
    if (shareResumeGuardUntilMs) guardShareResume(500);
    if (lofi.started) nudgeAudio();
  }
}));
window.addEventListener("pageshow", safeUiAction("page show", () => {
  if (shareResumeGuardUntilMs) guardShareResume(500);
}));
window.addEventListener("pagehide", safeUiAction("page hide", () => {
  if (activeUsageSessionStartedAtMs) {
    finishActiveSession("pagehide");
  }
}));
window.addEventListener("resize", safeUiAction("viewport resize", handleViewportResize));
window.addEventListener("orientationchange", safeUiAction("orientation resize", settleViewportResize));
if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", safeUiAction("visual viewport resize", handleViewportResize));
}

window.addEventListener("keydown", safeUiAction("keyboard action", (event) => {
  if (["Space", "ArrowUp", "KeyW"].includes(event.code)) {
    event.preventDefault();
    if (!state.running) return;
    lofi.primeOnGesture();
    if (!lofi.started || lofi.muted) {
      void startAudioMaybe();
    }
    tryBurstAt(state.pointerX, state.pointerY, performance.now());
  }
}));

if (audioBtn) {
  audioBtn.addEventListener("click", safeUiAction("audio button", async () => {
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
  }));
}

if (restartBtn) {
  restartBtn.addEventListener("click", safeUiAction("restart", () => {
    startSession();
  }));
}

function startFromMenuGesture() {
  lofi.primeOnGesture();
  void startAudioMaybe();
  startSession();
}

if (playBtn) {
  playBtn.addEventListener("click", safeUiAction("play", () => {
    startFromMenuGesture();
  }));
}

if (overlayEl) {
  overlayEl.addEventListener("click", safeUiAction("overlay click", (event) => {
    if (closestElement(event.target, ".menu-panel, .background-preview-modal")) return;
    startFromMenuGesture();
  }));
}

if (leaderboardBtn) {
  leaderboardBtn.addEventListener("click", safeUiAction("leaderboard open", () => {
    showLeaderboardScreen();
  }));
}

if (leaderboardSearchEl) {
  leaderboardSearchEl.addEventListener("input", safeUiAction("leaderboard search", () => {
    leaderboardSearchQuery = leaderboardSearchEl.value;
    renderLeaderboard();
  }));
}

if (shareScoreBtn) {
  shareScoreBtn.addEventListener("click", safeUiAction("share score", (event) => {
    event.preventDefault();
    event.stopPropagation();
    void shareScore();
  }));
}

if (customBgBtn) {
  customBgBtn.addEventListener("click", safeUiAction("custom backgrounds", () => {
    showPremiumScreen();
  }));
}

if (postRunUnlockBtn) {
  postRunUnlockBtn.addEventListener("click", safeUiAction("post-run unlock", (event) => {
    event.preventDefault();
    event.stopPropagation();
    const backdrop = postRunUnlockBtn.dataset.backdrop;
    if (backdrop && BACKDROP_IDS.includes(backdrop) && isBackdropUsable(backdrop)) {
      selectBackdrop(backdrop);
      startSession();
      return;
    }
    showPremiumScreen();
    if (backdrop && BACKDROP_IDS.includes(backdrop) && !isBackdropUnlocked(backdrop)) {
      showBackgroundPreview(backdrop);
    }
  }));
}

if (leaderboardBackBtn) {
  leaderboardBackBtn.addEventListener("click", safeUiAction("leaderboard back", () => {
    showHomeScreen();
  }));
}

if (premiumBackBtn) {
  premiumBackBtn.addEventListener("click", safeUiAction("backgrounds back", () => {
    showHomeScreen();
  }));
}

if (unlockBackgroundsBtn) {
  unlockBackgroundsBtn.addEventListener("click", safeUiAction("background unlock", () => {
    const backdrop = unlockBackgroundsBtn.dataset.backdrop || selectedLockedBackdrop;
    if (!backdrop || isBackdropUnlocked(backdrop)) {
      syncBackdropTiles();
      return;
    }

    purchaseBackdrop(backdrop);
  }));
}

if (unlockLifetimeBtn) {
  unlockLifetimeBtn.addEventListener("click", safeUiAction("lifetime unlock", () => {
    purchaseLifetimePass();
  }));
}

if (restorePurchasesBtn) {
  restorePurchasesBtn.addEventListener("click", safeUiAction("restore purchases", () => {
    if (!hasNativePurchaseBridge()) return;
    postNativePurchase("restore", {});
  }));
}

for (const tile of backgroundTileEls) {
  tile.addEventListener("click", safeUiAction("background tile", () => {
    if (isShareResumeGuardActive()) return;
    const backdrop = tile.dataset.backdrop;
    if (!BACKDROP_IDS.includes(backdrop)) return;
    if (isBackdropUsable(backdrop)) {
      selectBackdrop(backdrop);
      hideBackgroundPreview();
      return;
    }
    showBackgroundPreview(backdrop);
  }));
}

if (backgroundPreviewCloseBtn) {
  backgroundPreviewCloseBtn.addEventListener("click", safeUiAction("preview close", (event) => {
    event.preventDefault();
    event.stopPropagation();
    closeBackgroundPreviewToOverview();
  }));
}

if (backgroundPreviewModalEl) {
  backgroundPreviewModalEl.addEventListener("click", safeUiAction("preview backdrop", (event) => {
    if (event.target !== backgroundPreviewModalEl) return;
    event.preventDefault();
    event.stopPropagation();
    closeBackgroundPreviewToOverview();
  }));
}

if (backgroundPreviewUseBtn) {
  backgroundPreviewUseBtn.addEventListener("click", safeUiAction("preview use", () => {
    const backdrop = backgroundPreviewUseBtn.dataset.backdrop;
    if (!BACKDROP_IDS.includes(backdrop) || !isBackdropUsable(backdrop)) return;
    selectBackdrop(backdrop);
    hideBackgroundPreview();
  }));
}

if (backgroundPreviewAdBtn) {
  backgroundPreviewAdBtn.addEventListener("click", safeUiAction("preview watch ad", () => {
    const backdrop = backgroundPreviewAdBtn.dataset.backdrop;
    if (!BACKDROP_IDS.includes(backdrop) || isBackdropUnlocked(backdrop)) return;
    watchAdForBackdrop(backdrop);
  }));
}

if (backgroundPreviewPurchaseBtn) {
  backgroundPreviewPurchaseBtn.addEventListener("click", safeUiAction("preview purchase", () => {
    const backdrop = backgroundPreviewPurchaseBtn.dataset.backdrop;
    if (!BACKDROP_IDS.includes(backdrop) || isBackdropUnlocked(backdrop)) return;
    purchaseBackdrop(backdrop);
  }));
}

if (colorBackdropBtn && colorBackdropInput) {
  colorBackdropBtn.addEventListener("click", safeUiAction("color picker open", (event) => {
    event.preventDefault();
    event.stopPropagation();
    colorBackdropInput.click();
  }));
}

if (colorBackdropInput) {
  colorBackdropInput.addEventListener("input", safeUiAction("color input", () => {
    setBackdropColor(colorBackdropInput.value);
  }));
  colorBackdropInput.addEventListener("change", safeUiAction("color change", () => {
    setBackdropColor(colorBackdropInput.value);
  }));
}

if (menuCornerBtn) {
  menuCornerBtn.addEventListener("click", safeUiAction("menu open", (event) => {
    event.preventDefault();
    event.stopPropagation();
    openMenuFromGame();
  }));
}

function initializeGame() {
  try {
    resizeGameSurface();
    if (bedSlots.length === 0) {
      rebuildBedSlots();
    }
    state.backdrop = readBackdropPreference();
    if (!isBackdropUsable(state.backdrop)) {
      state.backdrop = "classic";
      writeBackdropPreference(state.backdrop);
    }
    state.backdropColor = readBackdropColorPreference();
    requestNativeLeaderboard();
    requestNativeProducts();
    requestNativeEntitlements();
    syncBackdropTiles();
    if (shouldSkipMenuForFirstStart()) {
      startSession();
    } else {
      softReset(true);
    }
    loadSprites();
  } catch (error) {
    console.warn("[Bloomwave] Game initialization recovered", error);
    state.backdrop = "classic";
    state.backdropColor = DEFAULT_BACKDROP_COLOR;
    try {
      softReset(true);
      showHomeScreen();
    } catch (fallbackError) {
      console.warn("[Bloomwave] Game initialization fallback failed", fallbackError);
    }
  } finally {
    scheduleGameLoop();
  }
}

initializeGame();
