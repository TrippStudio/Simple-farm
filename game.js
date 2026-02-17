// ---------- DOM ----------
const gridEl = document.getElementById("grid");
const moneyEl = document.getElementById("money");
const totalEarnedEl = document.getElementById("totalEarned");
const waterEl = document.getElementById("water");
const activeSeedEl = document.getElementById("activeSeed");
const saveDotEl = document.getElementById("saveDot");

const moneyPerMinEl = document.getElementById("moneyPerMin");
const bestMoneyPerMinEl = document.getElementById("bestMoneyPerMin");

const toolPlantBtn = document.getElementById("toolPlant");
const toolWaterBtn = document.getElementById("toolWater");
const toolRemoveBtn = document.getElementById("toolRemove");
const toolRevertBtn = document.getElementById("toolRevert");
const toolOrchardBtn = document.getElementById("toolOrchard");

const upgradesEl = document.getElementById("upgrades");
const shopItemsEl = document.getElementById("shopItems");
const inventoryEl = document.getElementById("inventory");

// Market UI
const marketFeaturedEl = document.getElementById("marketFeatured");
const marketSlumpEl = document.getElementById("marketSlump");
const marketTimerEl = document.getElementById("marketTimer");
const snipeWindowEl = document.getElementById("snipeWindow");

// Orchard UI
const orchardCountEl = document.getElementById("orchardCount");
const orchardCostEl = document.getElementById("orchardCost");

// Season UI
const seasonTimerEl = document.getElementById("seasonTimer");
const seasonScoreEl = document.getElementById("seasonScore");

// Orders UI
const ordersEl = document.getElementById("orders");
const ordersTimerEl = document.getElementById("ordersTimer");
const ordersRerollBtn = document.getElementById("ordersReroll");

// Leaderboard UI
const leaderboardEl = document.getElementById("leaderboard");
const playerNameEl = document.getElementById("playerName");
const submitScoreBtn = document.getElementById("submitScore");
const resetCareerBtn = document.getElementById("resetCareer");

// ---------- CONSTANTS ----------
const SAVE_KEY = "tinyfarm_save_v12_leaderboard_orders_snipe";
const LB_KEY = "tinyfarm_leaderboard_local_v1";

const GRID_COLS = 5;
const GRID_ROWS = 5;
const GRID_SIZE = GRID_COLS * GRID_ROWS;

const WELL_INDEX = 12;

const BASE_MAX_WATER = 10;
const START_WATER = 5;
const SLOW_REGEN_MS = 12000;

const WATER_COST = 1;
const WATER_BOOST_MS = 2500;

const QUALITY_MULT = [1.0, 1.2, 1.4];
const MAX_WATERINGS_PER_PLANT = 2;

const STATS_WINDOW_MS = 60000;
const AUTOSAVE_MS = 8000;

const AUTO_HARVEST_MS = 1000;
const AUTO_PLANT_MS = 1000;
const AUTO_WATER_MS = 2000;

// MARKET
const MARKET = { intervalMs: 60000, featuredMult: 1.35, slumpMult: 0.85 };
const SNIPE_WINDOW_MS = 30000;
const SNIPE_MULT = 1.25;

// ORDERS
const ORDERS_INTERVAL_MS = 120000; // 2 minutes
const ORDERS_COUNT = 3;

// SEASON (weekly)
const SEASON_MS = 7 * 24 * 60 * 60 * 1000;

// ORCHARD COST
function orchardBuildCost(currentCount) {
  return 50 + currentCount * 30;
}

// ---------- PRODUCTS ----------
const CROPS = [
  { id: "turnip", name: "Turnip", emoji: "🥬", buy: 2,  growMs: 8000,  sell: 5,   unlockMoney: 0,   kind: "crop", marketEligible: true },
  { id: "carrot", name: "Carrot", emoji: "🥕", buy: 5,  growMs: 12000, sell: 12,  unlockMoney: 25,  kind: "crop", marketEligible: true },
  { id: "corn",   name: "Corn",   emoji: "🌽", buy: 9,  growMs: 16000, sell: 22,  unlockMoney: 75,  kind: "crop", marketEligible: true },

  { id: "tomato", name: "Tomato", emoji: "🍅", buy: 14, growMs: 22000, sell: 40, unlockMoney: 200, kind: "crop", marketEligible: true,
    trait: { type: "multiharvest", harvests: 2, regrowMs: 9000 }
  },
  { id: "blueberry", name: "Blueberry", emoji: "🫐", buy: 18, growMs: 26000, sell: 55, unlockMoney: 300, kind: "crop", marketEligible: true,
    trait: { type: "crit", chance: 0.20, mult: 2 }
  },
  { id: "pumpkin", name: "Pumpkin", emoji: "🎃", buy: 25, growMs: 40000, sell: 120, unlockMoney: 450, kind: "crop", marketEligible: true,
    qualityMult: [1.0, 1.25, 1.60]
  }
];

const TREES = [
  { id: "bananaTree", name: "Banana Tree", emoji: "🍌🌳", kind: "tree", buy: 12, unlockMoney: 60, firstGrowMs: 14000, regrowMs: 9000, sell: 14, marketEligible: true,
    role: "fast", qualityMult: [1.0, 1.18, 1.38]
  },
  { id: "appleTree", name: "Apple Tree", emoji: "🍎🌳", kind: "tree", buy: 22, unlockMoney: 220, firstGrowMs: 26000, regrowMs: 16000, sell: 30, marketEligible: true,
    role: "balanced", qualityMult: [1.0, 1.22, 1.50]
  },
  { id: "orangeTree", name: "Orange Tree", emoji: "🍊🌳", kind: "tree", buy: 32, unlockMoney: 360, firstGrowMs: 34000, regrowMs: 20000, sell: 48, marketEligible: true,
    role: "crit", trait: { type: "crit", chance: 0.15, mult: 2.5 }, qualityMult: [1.0, 1.22, 1.55]
  },
  { id: "coconutTree", name: "Coconut Tree", emoji: "🥥🌳", kind: "tree", buy: 45, unlockMoney: 520, firstGrowMs: 52000, regrowMs: 32000, sell: 110, marketEligible: true,
    role: "slowHigh", qualityMult: [1.0, 1.25, 1.60]
  }
];

const PRODUCTS = [...CROPS, ...TREES];
const PRODUCT_BY_ID = Object.fromEntries(PRODUCTS.map(p => [p.id, p]));

// ---------- UPGRADES ----------
const UPGRADE_DEFS = [
  { id: "autoHarvest", name: "Auto-Harvest I", emoji: "🤖", type: "toggle", cost: 60,  unlockEarned: 40,  desc: "Harvest ready plants every 1s." },
  { id: "autoPlant",   name: "Auto-Plant I",   emoji: "🚜", type: "toggle", cost: 90,  unlockEarned: 80,  desc: "Plant empty tiles every 1s using active selection." },
  { id: "autoWater",   name: "Auto-Water I",   emoji: "💦", type: "toggle", cost: 120, unlockEarned: 120, desc: "Water growing plants (1x) every 2s if you have water." },

  { id: "tank", name: "Bigger Tank", emoji: "🪣", type: "level", maxLevel: 4, unlockEarned: 120, baseCost: 80, costMult: 1.6,
    desc: (lvl) => `Max water +${lvl * 5}. (Next: +${(lvl + 1) * 5})`
  },
  { id: "fertilizer", name: "Fertilizer", emoji: "🌱", type: "level", maxLevel: 6, unlockEarned: 200, baseCost: 120, costMult: 1.7,
    desc: (lvl) => {
      const cur = Math.round(growSpeedBonus(lvl) * 100);
      const nxt = Math.round(growSpeedBonus(lvl + 1) * 100);
      return `Plants grow ${cur}% faster. (Next: ${nxt}% faster)`;
    }
  },
  { id: "market", name: "Market Cart", emoji: "💰", type: "level", maxLevel: 8, unlockEarned: 260, baseCost: 140, costMult: 1.65,
    desc: (lvl) => {
      const cur = Math.round((sellMult(lvl) - 1) * 100);
      const nxt = Math.round((sellMult(lvl + 1) - 1) * 100);
      return `Sell value +${cur}%. (Next: +${nxt}%)`;
    }
  },
  { id: "seedSaver", name: "Seed Saver", emoji: "🎒", type: "level", maxLevel: 5, unlockEarned: 320, baseCost: 160, costMult: 1.8,
    desc: (lvl) => {
      const cur = Math.round(seedSaveChance(lvl) * 100);
      const nxt = Math.round(seedSaveChance(lvl + 1) * 100);
      return `${cur}% chance to not consume a seed (crops only). (Next: ${nxt}%)`;
    }
  },

  // Orchard upgrades
  { id: "pruners", name: "Pruners", emoji: "✂️", type: "level", maxLevel: 8, unlockEarned: 240, baseCost: 160, costMult: 1.55,
    desc: (lvl) => {
      const cur = Math.round((1 - treeTimeMultiplier(lvl)) * 100);
      const nxt = Math.round((1 - treeTimeMultiplier(lvl + 1)) * 100);
      return `Trees grow/regrow ${cur}% faster. (Next: ${nxt}% faster)`;
    }
  },
  { id: "irrigation", name: "Orchard Irrigation", emoji: "🚿", type: "level", maxLevel: 2, unlockEarned: 300, baseCost: 220, costMult: 2.0,
    desc: (lvl) => (lvl <= 0) ? `Orchards: 0 free watering. (Next: 1)` : (lvl === 1) ? `Orchards: 1 free watering. (Next: 2)` : `Orchards: 2 free waterings.`
  },
  { id: "grafting", name: "Grafting", emoji: "🧬", type: "level", maxLevel: 5, unlockEarned: 360, baseCost: 260, costMult: 1.7,
    desc: (lvl) => {
      const cur = Math.round(treeDoubleChance(lvl) * 100);
      const nxt = Math.round(treeDoubleChance(lvl + 1) * 100);
      return `Trees: ${cur}% chance to double payout. (Next: ${nxt}%)`;
    }
  }
];

// ---------- STATE ----------
let money = 0;
let totalEarned = 0;
let water = START_WATER;

let activeItemId = "turnip";
let tool = "plant"; // plant | water | removeTree | revertOrchard | buildOrchard

let unlockedCrops = Object.fromEntries(CROPS.map(s => [s.id, s.unlockMoney === 0]));
unlockedCrops.turnip = true;

let ownedUpgrades = { autoHarvest: false, autoPlant: false, autoWater: false };
let upgradeLevels = {
  tank: 0, fertilizer: 0, market: 0, seedSaver: 0,
  pruners: 0, irrigation: 0, grafting: 0
};

let inventory = Object.fromEntries(PRODUCTS.map(p => [p.id, 0]));
inventory.turnip = 5;

// stats
let earningsLog = [];
let bestMoneyPerMin = 0;

// automation timers
let lastAutoHarvest = 0;
let lastAutoPlant = 0;
let lastAutoWater = 0;

// market state
let marketState = {
  featuredId: null,
  slumpId: null,
  nextFlipAt: Date.now() + MARKET.intervalMs,
  snipeUntil: 0
};

// season state
let season = {
  id: "",            // string id
  endsAt: Date.now() + SEASON_MS,
  startTotalEarned: 0
};

// orders state
let ordersState = {
  nextRefreshAt: Date.now() + ORDERS_INTERVAL_MS,
  orders: [] // [{id, title, req: {productId: qty}, progress: {productId: harvestedCount}, reward}]
};

// ---------- PLOTS ----------
const plots = Array.from({ length: GRID_SIZE }, (_, i) => ({
  kind: i === WELL_INDEX ? "well" : "soil",
  isOrchard: false,

  state: i === WELL_INDEX ? "well" : "empty",
  plantedAt: 0,
  growMs: 0,

  productId: null,
  waterings: 0,

  harvestsLeft: 0,
  regrowMs: 0
}));

// ---------- UTIL ----------
function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }

function pulseSaveDot() {
  if (!saveDotEl) return;
  saveDotEl.classList.add("saving");
  setTimeout(() => saveDotEl.classList.remove("saving"), 180);
}

function formatTime(ms) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

function formatHMS(ms) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const hh = String(Math.floor(s / 3600)).padStart(2, "0");
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

function prettyDate(ts) {
  const d = new Date(ts);
  return d.toLocaleString(undefined, { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

// ---------- EFFECTS ----------
function maxWater() { return BASE_MAX_WATER + (upgradeLevels.tank * 5); }

function growSpeedBonus(lvl) { return 1 - Math.pow(0.90, Math.max(0, lvl)); }
function growTimeMultiplier() {
  const faster = growSpeedBonus(upgradeLevels.fertilizer);
  return Math.max(0.35, 1 - faster);
}
function treeTimeMultiplier(prunerLevel) {
  const mult = 1 - (0.06 * Math.max(0, prunerLevel));
  return Math.max(0.45, mult);
}
function adjustedGrowMsForProduct(prod, baseMs) {
  const fert = growTimeMultiplier();
  if (prod.kind === "tree") return Math.round(baseMs * fert * treeTimeMultiplier(upgradeLevels.pruners));
  return Math.round(baseMs * fert);
}

function sellMult(lvl) { return 1 + 0.10 * Math.max(0, lvl); }
function globalSellMultiplier() { return sellMult(upgradeLevels.market); }
function seedSaveChance(lvl) { return Math.min(0.50, 0.10 * Math.max(0, lvl)); }

function treeDoubleChance(lvl) { return Math.min(0.30, 0.06 * Math.max(0, lvl)); }

function orchardCount() {
  let c = 0;
  for (const p of plots) if (p.kind === "soil" && p.isOrchard) c++;
  return c;
}
function nextOrchardCost() { return orchardBuildCost(orchardCount()); }

function isProductUnlocked(p) {
  if (p.kind === "crop") return !!unlockedCrops[p.id];
  return totalEarned >= (p.unlockMoney ?? 0);
}

function qualityMultiplierForProduct(prod, waterings) {
  const m = prod.qualityMult || QUALITY_MULT;
  return m[clamp(waterings, 0, 2)] ?? 1.0;
}

// ---------- MARKET ----------
function eligibleMarketProductIds() {
  const ids = [];
  for (const p of PRODUCTS) {
    if (p.marketEligible === false) continue;
    if (isProductUnlocked(p)) ids.push(p.id);
  }
  return ids;
}

function chooseMarketPair() {
  const ids = eligibleMarketProductIds();
  if (ids.length === 0) { marketState.featuredId = null; marketState.slumpId = null; return; }

  const pick = () => ids[Math.floor(Math.random() * ids.length)];
  const featured = pick();
  let slump = null;
  if (ids.length >= 2) do { slump = pick(); } while (slump === featured);

  marketState.featuredId = featured;
  marketState.slumpId = slump;
}

function advanceMarketTo(now) {
  if (!marketState.nextFlipAt || !Number.isFinite(marketState.nextFlipAt)) {
    marketState.nextFlipAt = now + MARKET.intervalMs;
  }
  if (!marketState.featuredId) chooseMarketPair();

  let cycles = 0;
  while (now >= marketState.nextFlipAt && cycles < 500) {
    // market flip -> open snipe window
    chooseMarketPair();
    marketState.snipeUntil = now + SNIPE_WINDOW_MS;

    marketState.nextFlipAt += MARKET.intervalMs;
    cycles++;
  }
}

function marketMultiplierForProduct(productId) {
  if (!productId) return 1;
  if (productId === marketState.featuredId) return MARKET.featuredMult;
  if (productId === marketState.slumpId) return MARKET.slumpMult;
  return 1;
}

function snipeMultiplierForHarvest(productId) {
  const now = Date.now();
  if (now <= (marketState.snipeUntil || 0) && productId === marketState.featuredId) return SNIPE_MULT;
  return 1;
}

function renderMarketUI() {
  const featured = marketState.featuredId ? PRODUCT_BY_ID[marketState.featuredId] : null;
  const slump = marketState.slumpId ? PRODUCT_BY_ID[marketState.slumpId] : null;

  if (marketFeaturedEl) {
    marketFeaturedEl.textContent = featured
      ? `🔥 ${featured.emoji} ${featured.name} +${Math.round((MARKET.featuredMult - 1) * 100)}%`
      : "🔥 —";
  }

  if (marketSlumpEl) {
    marketSlumpEl.textContent = slump
      ? `🥶 ${slump.emoji} ${slump.name} ${Math.round((MARKET.slumpMult - 1) * 100)}%`
      : "🥶 —";
  }

  if (marketTimerEl) marketTimerEl.textContent = formatTime(marketState.nextFlipAt - Date.now());

  const left = (marketState.snipeUntil || 0) - Date.now();
  if (snipeWindowEl) {
    if (left > 0) {
      snipeWindowEl.classList.remove("hidden");
      snipeWindowEl.textContent = `⚡ Snipe x${SNIPE_MULT.toFixed(2)}: ${formatTime(left)}`;
    } else {
      snipeWindowEl.classList.add("hidden");
    }
  }
}

// ---------- SEASON ----------
function seasonIdFromEndsAt(endsAt) {
  return `S-${endsAt}`;
}

function ensureSeason(now) {
  if (!season.endsAt || !Number.isFinite(season.endsAt)) {
    season.endsAt = now + SEASON_MS;
  }

  if (!season.id) season.id = seasonIdFromEndsAt(season.endsAt);

  // roll season if ended
  if (now >= season.endsAt) {
    // new season starts now
    season.startTotalEarned = totalEarned;
    season.endsAt = now + SEASON_MS;
    season.id = seasonIdFromEndsAt(season.endsAt);

    // when season rolls, refresh orders too (nice “new week” feel)
    ordersState.nextRefreshAt = now + ORDERS_INTERVAL_MS;
    ordersState.orders = [];
    generateOrders();
    saveGame();
  }
}

function currentSeasonScore() {
  return Math.max(0, totalEarned - (season.startTotalEarned ?? 0));
}

function renderSeasonUI() {
  if (seasonTimerEl) seasonTimerEl.textContent = formatHMS(season.endsAt - Date.now());
  if (seasonScoreEl) seasonScoreEl.textContent = String(currentSeasonScore());
}

// ---------- ORDERS ----------
function unlockedIdsForOrders() {
  // only include products that are actually harvestable (all crops+trees)
  const ids = [];
  for (const p of PRODUCTS) {
    if (!isProductUnlocked(p)) continue;
    ids.push(p.id);
  }
  // always allow turnip even at start
  if (!ids.includes("turnip")) ids.push("turnip");
  return ids;
}

function randomOrderReq() {
  const ids = unlockedIdsForOrders();
  const pick = () => ids[Math.floor(Math.random() * ids.length)];

  // make 1–2 item orders (keeps it readable)
  const slots = Math.random() < 0.65 ? 1 : 2;
  const req = {};
  const used = new Set();

  for (let i = 0; i < slots; i++) {
    let id = pick();
    let tries = 0;
    while (used.has(id) && tries++ < 10) id = pick();
    used.add(id);

    const prod = PRODUCT_BY_ID[id];
    const base = prod.kind === "tree" ? 6 : 10;
    const qty = base + Math.floor(Math.random() * base); // 6–11 trees, 10–19 crops
    req[id] = qty;
  }

  return req;
}

function computeOrderReward(req) {
  // reward based on baseline sell * qty with a nice bonus
  let sum = 0;
  for (const [id, qty] of Object.entries(req)) {
    const p = PRODUCT_BY_ID[id];
    if (!p) continue;
    sum += p.sell * qty;
  }
  // add bonus (orders should feel good)
  const bonus = 1.25 + Math.min(0.35, currentSeasonScore() / 5000) * 0.15; // mild scaling
  return Math.max(20, Math.round(sum * bonus));
}

function generateOrders() {
  if (!ordersState.orders || ordersState.orders.length === 0) {
    ordersState.orders = [];
  }
  while (ordersState.orders.length < ORDERS_COUNT) {
    const req = randomOrderReq();
    const reward = computeOrderReward(req);
    const id = `O-${Date.now()}-${Math.floor(Math.random() * 99999)}`;

    const title = Object.keys(req).length === 1
      ? `Delivery: ${PRODUCT_BY_ID[Object.keys(req)[0]]?.name ?? "Goods"}`
      : `Mixed Delivery`;

    ordersState.orders.push({
      id,
      title,
      req,
      progress: Object.fromEntries(Object.keys(req).map(k => [k, 0])),
      reward,
      claimed: false
    });
  }
}

function refreshOrdersIfNeeded(now) {
  if (!ordersState.nextRefreshAt || !Number.isFinite(ordersState.nextRefreshAt)) {
    ordersState.nextRefreshAt = now + ORDERS_INTERVAL_MS;
  }
  if (!ordersState.orders) ordersState.orders = [];

  if (now >= ordersState.nextRefreshAt) {
    // hard refresh: new set
    ordersState.orders = [];
    generateOrders();
    ordersState.nextRefreshAt = now + ORDERS_INTERVAL_MS;
    dirtyCards = true;
    saveGame();
  }

  // ensure we have orders
  if (ordersState.orders.length < ORDERS_COUNT) {
    generateOrders();
    dirtyCards = true;
  }
}

function orderIsComplete(o) {
  for (const [id, qty] of Object.entries(o.req)) {
    if ((o.progress[id] ?? 0) < qty) return false;
  }
  return true;
}

function onHarvestForOrders(productId) {
  // increment progress for any order needing this product
  let changed = false;
  for (const o of ordersState.orders) {
    if (o.claimed) continue;
    if (!o.req[productId]) continue;
    const need = o.req[productId];
    const cur = o.progress[productId] ?? 0;
    if (cur < need) {
      o.progress[productId] = cur + 1;
      changed = true;
    }
  }
  if (changed) {
    dirtyCards = true;
  }
}

function renderOrders() {
  if (!ordersEl) return;
  ordersEl.innerHTML = "";

  const left = ordersState.nextRefreshAt - Date.now();
  if (ordersTimerEl) ordersTimerEl.textContent = formatTime(left);

  for (const o of ordersState.orders) {
    const card = document.createElement("div");
    card.className = "card";

    const reqLines = Object.entries(o.req).map(([id, qty]) => {
      const prod = PRODUCT_BY_ID[id];
      const cur = clamp(o.progress[id] ?? 0, 0, qty);
      return `<div class="small">${prod?.emoji ?? "📦"} ${prod?.name ?? id}: <span class="mono">${cur}/${qty}</span></div>`;
    }).join("");

    const complete = orderIsComplete(o);
    const claimed = !!o.claimed;

    card.innerHTML = `
      <div class="card-top">
        <strong>📜 ${o.title}</strong>
        <span class="badge">${claimed ? "Claimed" : complete ? "Ready" : `Reward: $${o.reward}`}</span>
      </div>
      ${reqLines}
    `;

    const btn = document.createElement("button");
    btn.className = complete && !claimed ? "btn" : "btn secondary";
    btn.textContent = claimed ? "Done" : complete ? "Claim" : "In Progress";
    btn.disabled = claimed || !complete;

    btn.addEventListener("click", () => {
      if (o.claimed || !orderIsComplete(o)) return;
      o.claimed = true;
      addMoney(o.reward);
      saveGame();
      dirtyCards = true;
      flushUI();
    });

    card.appendChild(btn);
    ordersEl.appendChild(card);
  }
}

// ---------- LEADERBOARD ----------
function loadLeaderboard() {
  try {
    const raw = localStorage.getItem(LB_KEY);
    const data = raw ? JSON.parse(raw) : [];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function saveLeaderboard(entries) {
  localStorage.setItem(LB_KEY, JSON.stringify(entries));
}

function submitSeasonScore(name) {
  const score = currentSeasonScore();
  if (!name || !name.trim()) name = "Player";
  name = name.trim().slice(0, 16);

  const entries = loadLeaderboard();
  entries.push({
    name,
    score,
    seasonId: season.id,
    ts: Date.now()
  });

  // Keep best 50
  entries.sort((a, b) => (b.score - a.score) || (b.ts - a.ts));
  saveLeaderboard(entries.slice(0, 50));
}

function renderLeaderboard() {
  if (!leaderboardEl) return;

  const entries = loadLeaderboard().slice(0, 10);

  leaderboardEl.innerHTML = "";
  const head = document.createElement("div");
  head.className = "lb-row lb-head";
  head.innerHTML = `<div>#</div><div>Name</div><div class="lb-score">Score</div><div class="lb-date">When</div>`;
  leaderboardEl.appendChild(head);

  if (entries.length === 0) {
    const row = document.createElement("div");
    row.className = "lb-row";
    row.innerHTML = `<div class="lb-rank">—</div><div class="lb-name">No scores yet</div><div class="lb-score">—</div><div class="lb-date">—</div>`;
    leaderboardEl.appendChild(row);
    return;
  }

  entries.forEach((e, idx) => {
    const row = document.createElement("div");
    row.className = "lb-row";
    row.innerHTML = `
      <div class="lb-rank">${idx + 1}</div>
      <div class="lb-name">${e.name}</div>
      <div class="lb-score mono">${e.score}</div>
      <div class="lb-date">${prettyDate(e.ts)}</div>
    `;
    leaderboardEl.appendChild(row);
  });
}

// ---------- STATS ----------
function logEarning(amount) { earningsLog.push({ t: Date.now(), a: amount }); }
function renderStats() {
  const now = Date.now();
  earningsLog = earningsLog.filter(e => now - e.t <= STATS_WINDOW_MS);
  const sum = earningsLog.reduce((acc, e) => acc + e.a, 0);
  const perMin = Math.round(sum);
  if (moneyPerMinEl) moneyPerMinEl.textContent = perMin;
  if (perMin > bestMoneyPerMin) bestMoneyPerMin = perMin;
  if (bestMoneyPerMinEl) bestMoneyPerMinEl.textContent = bestMoneyPerMin;
}

// ---------- UNLOCKS ----------
function updateUnlocks() {
  for (const c of CROPS) if (!unlockedCrops[c.id] && totalEarned >= c.unlockMoney) unlockedCrops[c.id] = true;
  unlockedCrops.turnip = true;

  const p = PRODUCT_BY_ID[activeItemId];
  if (p?.kind === "crop" && !unlockedCrops[p.id]) activeItemId = "turnip";

  // Market and orders depend on unlocks
  advanceMarketTo(Date.now());
  refreshOrdersIfNeeded(Date.now());
}

// ---------- RENDER ----------
function renderHUD() {
  if (moneyEl) moneyEl.textContent = money;
  if (totalEarnedEl) totalEarnedEl.textContent = totalEarned;
  if (waterEl) waterEl.textContent = water;

  const p = PRODUCT_BY_ID[activeItemId];
  if (activeSeedEl) activeSeedEl.textContent = p ? p.name : "Turnip";

  const oc = orchardCount();
  if (orchardCountEl) orchardCountEl.textContent = oc;
  if (orchardCostEl) orchardCostEl.textContent = String(nextOrchardCost());
  if (toolOrchardBtn) toolOrchardBtn.textContent = `🏡 Build Orchard ($${nextOrchardCost()})`;

  renderSeasonUI();
}

function plotEmoji(p) {
  if (p.kind === "well") return "🪣";
  if (p.state === "empty") return p.isOrchard ? "🟩" : "🟫";
  if (p.state === "growing") return "🌱";
  const prod = PRODUCT_BY_ID[p.productId];
  return prod?.emoji ?? "🌿";
}

function plotClass(p) {
  if (p.kind === "well") return "state-well";
  const orchard = p.isOrchard;

  if (p.state === "empty") return orchard ? "orchard-tile orchard-empty" : "state-empty";
  if (p.state === "growing") {
    if (p.waterings >= 2) return orchard ? "orchard-tile orchard-watered2" : "state-watered2";
    if (p.waterings >= 1) return orchard ? "orchard-tile orchard-watered1" : "state-watered1";
    return orchard ? "orchard-tile orchard-growing" : "state-growing";
  }
  return orchard ? "orchard-tile orchard-ready" : "state-ready";
}

let gridCells = [];
function buildGridOnce() {
  gridEl.innerHTML = "";
  gridCells = [];
  for (let i = 0; i < plots.length; i++) {
    const div = document.createElement("div");
    div.className = "plot";
    div.dataset.i = String(i);
    gridEl.appendChild(div);
    gridCells.push(div);
  }
}

function renderGridFast() {
  for (let i = 0; i < plots.length; i++) {
    const p = plots[i];
    const cell = gridCells[i];
    cell.className = `plot ${plotClass(p)}`;
    cell.textContent = plotEmoji(p);
  }
}

function upgradeCost(def, level) {
  if (def.type === "toggle") return def.cost;
  return Math.round(def.baseCost * Math.pow(def.costMult, Math.max(0, level)));
}

function renderUpgrades() {
  upgradesEl.innerHTML = "";
  for (const def of UPGRADE_DEFS) {
    if (totalEarned < def.unlockEarned) continue;

    const card = document.createElement("div");
    card.className = "card";

    if (def.type === "toggle") {
      const owned = !!ownedUpgrades[def.id];
      card.innerHTML = `
        <div class="card-top">
          <strong>${def.emoji} ${def.name}</strong>
          <span class="badge">${owned ? "Owned" : `Cost: ${def.cost}`}</span>
        </div>
        <div class="small">${def.desc}</div>
      `;

      const btn = document.createElement("button");
      btn.className = owned ? "btn secondary" : "btn";
      btn.textContent = owned ? "Purchased" : "Buy";
      btn.disabled = owned || money < def.cost;

      btn.addEventListener("click", () => {
        if (ownedUpgrades[def.id]) return;
        if (money < def.cost) return;
        money -= def.cost;
        ownedUpgrades[def.id] = true;
        dirtyHUD = true;
        dirtyCards = true;
        saveGame();
        flushUI();
      });

      card.appendChild(btn);
    } else {
      const lvl = upgradeLevels[def.id] ?? 0;
      const maxLvl = def.maxLevel ?? 1;
      const atMax = lvl >= maxLvl;
      const cost = upgradeCost(def, lvl);

      const badgeText = atMax ? `Max Lv ${maxLvl}` : `Lv ${lvl}/${maxLvl} • Cost: ${cost}`;

      card.innerHTML = `
        <div class="card-top">
          <strong>${def.emoji} ${def.name}</strong>
          <span class="badge">${badgeText}</span>
        </div>
        <div class="small">${def.desc(lvl)}</div>
      `;

      const btn = document.createElement("button");
      btn.className = atMax ? "btn secondary" : "btn";
      btn.textContent = atMax ? "Maxed" : "Upgrade";
      btn.disabled = atMax || money < cost;

      btn.addEventListener("click", () => {
        if (atMax) return;
        if (money < cost) return;

        money -= cost;
        upgradeLevels[def.id] = lvl + 1;
        water = Math.min(water, maxWater());

        dirtyHUD = true;
        dirtyCards = true;
        dirtyGrid = true;
        saveGame();
        flushUI();
      });

      card.appendChild(btn);
    }

    upgradesEl.appendChild(card);
  }

  if (!upgradesEl.children.length) {
    const empty = document.createElement("div");
    empty.className = "small";
    empty.textContent = "No upgrades unlocked yet — keep earning!";
    upgradesEl.appendChild(empty);
  }
}

function productTraitLine(p) {
  if (p.kind === "tree") return "Tree: orchard-only • harvest forever";
  const t = p.trait;
  if (!t) return "";
  if (t.type === "multiharvest") return "Trait: 2x Harvest";
  if (t.type === "crit") return `Trait: ${Math.round(t.chance * 100)}% Crit`;
  return "";
}

function renderShop() {
  shopItemsEl.innerHTML = "";
  for (const p of PRODUCTS) {
    const unlocked = isProductUnlocked(p);
    const badgeText = unlocked ? `Buy: ${p.buy}` : `Locked @ $${p.unlockMoney} earned`;
    const extra = productTraitLine(p);
    const extraLine = extra ? `<div class="small">${extra}</div>` : "";

    const timeText =
      p.kind === "tree"
        ? `First: ${Math.round(p.firstGrowMs / 1000)}s • Regrow: ${Math.round(p.regrowMs / 1000)}s • Harvest: +${p.sell}`
        : `Grow: ${Math.round(p.growMs / 1000)}s • Harvest: +${p.sell}`;

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="card-top">
        <strong>${p.emoji} ${p.name}</strong>
        <span class="badge">${badgeText}</span>
      </div>
      <div class="small">${p.kind === "tree" ? "Type: Tree" : "Type: Crop"} • ${timeText}</div>
      ${extraLine}
    `;

    const btn = document.createElement("button");
    btn.className = "btn";
    btn.textContent = "Buy 1";
    btn.disabled = !unlocked || money < p.buy;

    btn.addEventListener("click", () => {
      if (!isProductUnlocked(p)) return;
      if (money < p.buy) return;
      money -= p.buy;
      inventory[p.id] = (inventory[p.id] ?? 0) + 1;
      dirtyCards = true;
      dirtyHUD = true;
      saveGame();
      flushUI();
    });

    card.appendChild(btn);
    shopItemsEl.appendChild(card);
  }
}

function renderInventory() {
  inventoryEl.innerHTML = "";
  for (const p of PRODUCTS) {
    if (!isProductUnlocked(p)) continue;

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="card-top">
        <strong>${p.emoji} ${p.name}</strong>
        <span class="badge">x${inventory[p.id] ?? 0}</span>
      </div>
      <div class="small">${productTraitLine(p) || " "}</div>
    `;

    const btn = document.createElement("button");
    const selected = p.id === activeItemId;
    btn.className = selected ? "btn secondary" : "btn";
    btn.textContent = selected ? "Selected" : "Select";
    btn.disabled = selected;

    btn.addEventListener("click", () => {
      activeItemId = p.id;
      dirtyHUD = true;
      dirtyCards = true;
      saveGame();
      flushUI();
    });

    card.appendChild(btn);
    inventoryEl.appendChild(card);
  }
}

// ---------- DIRTY FLAGS ----------
let dirtyHUD = true;
let dirtyGrid = true;
let dirtyCards = true;
let dirtyStats = true;

function flushUI() {
  if (dirtyHUD) { renderHUD(); dirtyHUD = false; }
  if (dirtyStats) { renderStats(); dirtyStats = false; }
  if (dirtyGrid) { renderGridFast(); dirtyGrid = false; }
  if (dirtyCards) {
    renderOrders();
    renderUpgrades();
    renderShop();
    renderInventory();
    renderLeaderboard();
    dirtyCards = false;
  }
  renderMarketUI();
}

// ---------- GAME LOGIC ----------
function addMoney(amount) {
  money += amount;
  totalEarned += amount;
  logEarning(amount);

  // season/roll checks
  ensureSeason(Date.now());

  updateUnlocks();
  dirtyHUD = true;
  dirtyStats = true;
  dirtyCards = true;
}

function canPlantOnTile(prod, plot) {
  if (plot.kind !== "soil") return false;
  if (plot.state !== "empty") return false;
  if (prod.kind === "tree") return plot.isOrchard === true;
  return plot.isOrchard === false;
}

function applyWaterBoost(plot, free = false) {
  if (plot.waterings >= MAX_WATERINGS_PER_PLANT) return false;

  if (!free) {
    if (water < WATER_COST) return false;
    water -= WATER_COST;
  }

  plot.waterings += 1;

  const elapsed = Date.now() - plot.plantedAt;
  const remaining = plot.growMs - elapsed;
  plot.growMs = elapsed + Math.max(800, remaining - WATER_BOOST_MS);

  dirtyHUD = true;
  dirtyGrid = true;
  return true;
}

function plant(plot) {
  const prod = PRODUCT_BY_ID[activeItemId];
  if (!prod) return false;
  if ((inventory[activeItemId] ?? 0) <= 0) return false;
  if (!canPlantOnTile(prod, plot)) return false;

  // consume: crops can use Seed Saver; trees always consume sapling
  if (prod.kind === "crop") {
    const saveChance = seedSaveChance(upgradeLevels.seedSaver);
    const consumesSeed = Math.random() >= saveChance;
    if (consumesSeed) inventory[activeItemId] -= 1;
  } else {
    inventory[activeItemId] -= 1;
  }

  plot.productId = activeItemId;
  plot.waterings = 0;

  plot.state = "growing";
  plot.plantedAt = Date.now();

  if (prod.kind === "tree") {
    plot.growMs = adjustedGrowMsForProduct(prod, prod.firstGrowMs);
    plot.regrowMs = adjustedGrowMsForProduct(prod, prod.regrowMs);
    plot.harvestsLeft = 0;
  } else {
    plot.growMs = adjustedGrowMsForProduct(prod, prod.growMs);
    if (prod.trait?.type === "multiharvest") {
      plot.harvestsLeft = prod.trait.harvests ?? 2;
      plot.regrowMs = adjustedGrowMsForProduct(prod, prod.trait.regrowMs ?? 8000);
    } else {
      plot.harvestsLeft = 1;
      plot.regrowMs = 0;
    }
  }

  dirtyHUD = true;
  dirtyGrid = true;
  dirtyCards = true;
  return true;
}

function adjustedGrowMsForProduct(prod, baseMs) {
  return adjustedGrowMsForProduct_impl(prod, baseMs);
}
function adjustedGrowMsForProduct_impl(prod, baseMs) {
  return adjustedGrowMsForProductCore(prod, baseMs);
}
function adjustedGrowMsForProductCore(prod, baseMs) {
  return adjustedGrowMsForProductFinal(prod, baseMs);
}
function adjustedGrowMsForProductFinal(prod, baseMs) {
  // inline to keep earlier helper names stable in saves
  const fert = growTimeMultiplier();
  if (prod.kind === "tree") return Math.round(baseMs * fert * treeTimeMultiplier(upgradeLevels.pruners));
  return Math.round(baseMs * fert);
}

function waterPlant(plot) {
  if (plot.kind !== "soil") return false;
  if (plot.state !== "growing") return false;
  return applyWaterBoost(plot, false);
}

function harvest(plot) {
  const prod = PRODUCT_BY_ID[plot.productId];
  if (!prod) return false;

  // orders progress counts “harvests” (regardless of payout)
  onHarvestForOrders(prod.id);

  let payout = Math.round(prod.sell * qualityMultiplierForProduct(prod, plot.waterings));
  payout = Math.round(payout * globalSellMultiplier());
  payout = Math.round(payout * marketMultiplierForProduct(prod.id));
  payout = Math.round(payout * snipeMultiplierForHarvest(prod.id));

  // crit
  if (prod.trait?.type === "crit") {
    const chance = prod.trait.chance ?? 0.15;
    const mult = prod.trait.mult ?? 2;
    if (Math.random() < chance) payout = Math.round(payout * mult);
  }

  // grafting
  if (prod.kind === "tree") {
    if (Math.random() < treeDoubleChance(upgradeLevels.grafting)) payout *= 2;
  }

  addMoney(payout);

  if (prod.kind === "tree") {
    plot.state = "growing";
    plot.plantedAt = Date.now();
    plot.growMs = plot.regrowMs || adjustedGrowMsForProductFinal(prod, prod.regrowMs);
    plot.waterings = 0;
    dirtyGrid = true;
    return true;
  }

  if (prod.trait?.type === "multiharvest") {
    plot.harvestsLeft = Math.max(0, (plot.harvestsLeft || 0) - 1);
    if (plot.harvestsLeft > 0) {
      plot.state = "growing";
      plot.plantedAt = Date.now();
      plot.growMs = plot.regrowMs || adjustedGrowMsForProductFinal(prod, 9000);
      plot.waterings = 0;
      dirtyGrid = true;
      return true;
    }
  }

  plot.state = "empty";
  plot.productId = null;
  plot.waterings = 0;
  plot.plantedAt = 0;
  plot.growMs = 0;
  plot.harvestsLeft = 0;
  plot.regrowMs = 0;

  dirtyGrid = true;
  return true;
}

// Free tools
function removeTree(plot) {
  if (plot.kind !== "soil") return false;
  if (!plot.productId) return false;
  const prod = PRODUCT_BY_ID[plot.productId];
  if (!prod || prod.kind !== "tree") return false;

  plot.state = "empty";
  plot.productId = null;
  plot.waterings = 0;
  plot.plantedAt = 0;
  plot.growMs = 0;
  plot.harvestsLeft = 0;
  plot.regrowMs = 0;

  dirtyGrid = true;
  dirtyCards = true;
  return true;
}

function revertOrchard(plot) {
  if (plot.kind !== "soil") return false;
  if (!plot.isOrchard) return false;
  if (plot.state !== "empty") return false;

  plot.isOrchard = false;
  dirtyGrid = true;
  dirtyHUD = true;
  return true;
}

function buildOrchard(plot) {
  if (plot.kind !== "soil") return false;
  if (plot.isOrchard) return false;
  if (plot.state !== "empty") return false;

  const cost = nextOrchardCost();
  if (money < cost) return false;

  money -= cost;
  plot.isOrchard = true;

  dirtyHUD = true;
  dirtyGrid = true;
  dirtyCards = true;
  return true;
}

// ---------- INPUT ----------
function setTool(next) {
  tool = next;
  toolPlantBtn.classList.toggle("active", tool === "plant");
  toolWaterBtn.classList.toggle("active", tool === "water");
  toolRemoveBtn.classList.toggle("active", tool === "removeTree");
  toolRevertBtn.classList.toggle("active", tool === "revertOrchard");
  toolOrchardBtn.classList.toggle("active", tool === "buildOrchard");
  saveGame();
  flushUI();
}

toolPlantBtn.addEventListener("click", () => setTool("plant"));
toolWaterBtn.addEventListener("click", () => setTool("water"));
toolRemoveBtn.addEventListener("click", () => setTool("removeTree"));
toolRevertBtn.addEventListener("click", () => setTool("revertOrchard"));
toolOrchardBtn.addEventListener("click", () => setTool("buildOrchard"));

gridEl.addEventListener("click", (e) => {
  const cell = e.target.closest(".plot");
  if (!cell) return;
  const i = Number(cell.dataset.i);
  if (!Number.isFinite(i)) return;

  const plot = plots[i];
  let changed = false;

  if (plot.kind === "well") {
    water = maxWater();
    dirtyHUD = true;
    changed = true;
  } else if (tool === "plant") {
    if (plot.state === "empty") changed = plant(plot);
    else if (plot.state === "ready") changed = harvest(plot);
  } else if (tool === "water") {
    changed = waterPlant(plot);
  } else if (tool === "removeTree") {
    changed = removeTree(plot);
  } else if (tool === "revertOrchard") {
    changed = revertOrchard(plot);
  } else if (tool === "buildOrchard") {
    changed = buildOrchard(plot);
  }

  if (changed) {
    saveGame();
    flushUI();
  }
});

// Leaderboard actions
submitScoreBtn?.addEventListener("click", () => {
  submitSeasonScore(playerNameEl?.value || "Player");
  dirtyCards = true;
  saveGame();
  flushUI();
});

resetCareerBtn?.addEventListener("click", () => {
  // wipe both save + leaderboard
  localStorage.removeItem(SAVE_KEY);
  localStorage.removeItem(LB_KEY);
  location.reload();
});

// Orders reroll (free)
ordersRerollBtn?.addEventListener("click", () => {
  ordersState.orders = [];
  generateOrders();
  ordersState.nextRefreshAt = Date.now() + ORDERS_INTERVAL_MS;
  dirtyCards = true;
  saveGame();
  flushUI();
});

// ---------- ORCHARD IRRIGATION ----------
function applyIrrigation() {
  const lvl = upgradeLevels.irrigation ?? 0;
  if (lvl <= 0) return false;

  let any = false;
  for (const p of plots) {
    if (p.kind !== "soil") continue;
    if (!p.isOrchard) continue;
    if (p.state !== "growing") continue;
    if (!p.productId) continue;

    const prod = PRODUCT_BY_ID[p.productId];
    if (!prod || prod.kind !== "tree") continue;

    while (p.waterings < Math.min(MAX_WATERINGS_PER_PLANT, lvl)) {
      if (!applyWaterBoost(p, true)) break;
      any = true;
    }
  }
  return any;
}

// ---------- TICK ----------
function tick() {
  const now = Date.now();

  ensureSeason(now);
  refreshOrdersIfNeeded(now);

  // market advance (may open snipe window)
  const beforeFeatured = marketState.featuredId;
  advanceMarketTo(now);
  if (beforeFeatured !== marketState.featuredId) dirtyCards = true;

  let gridChanged = false;
  let econChanged = false;

  // irrigation (free)
  if (applyIrrigation()) {
    gridChanged = true;
    econChanged = true;
  }

  // growth -> ready
  for (const plot of plots) {
    if (plot.kind === "soil" && plot.state === "growing") {
      if (now - plot.plantedAt >= plot.growMs) {
        plot.state = "ready";
        gridChanged = true;
      }
    }
  }

  // auto-harvest
  if (ownedUpgrades.autoHarvest && now - lastAutoHarvest >= AUTO_HARVEST_MS) {
    lastAutoHarvest = now;
    for (const p of plots) {
      if (p.kind === "soil" && p.state === "ready") {
        harvest(p);
        gridChanged = true;
        econChanged = true;
      }
    }
  }

  // auto-plant
  if (ownedUpgrades.autoPlant && now - lastAutoPlant >= AUTO_PLANT_MS) {
    lastAutoPlant = now;
    const prod = PRODUCT_BY_ID[activeItemId];
    if (prod && (inventory[activeItemId] ?? 0) > 0) {
      for (const p of plots) {
        if (p.kind === "soil" && p.state === "empty") {
          if ((inventory[activeItemId] ?? 0) <= 0) break;
          if (!canPlantOnTile(prod, p)) continue;
          plant(p);
          gridChanged = true;
          econChanged = true;
        }
      }
    }
  }

  // auto-water (uses your water)
  if (ownedUpgrades.autoWater && now - lastAutoWater >= AUTO_WATER_MS) {
    lastAutoWater = now;
    for (const p of plots) {
      if (water < WATER_COST) break;
      if (p.kind === "soil" && p.state === "growing" && p.waterings < 1) {
        applyWaterBoost(p, false);
        gridChanged = true;
        econChanged = true;
      }
    }
  }

  if (gridChanged) dirtyGrid = true;

  if (econChanged) {
    dirtyHUD = true;
    dirtyCards = true;
    dirtyStats = true;
    saveGame();
  }

  if (dirtyGrid || dirtyHUD || dirtyCards || dirtyStats) flushUI();
}
setInterval(tick, 200);

// UI timers
setInterval(() => {
  renderMarketUI();
  renderSeasonUI();
  if (ordersTimerEl) ordersTimerEl.textContent = formatTime(ordersState.nextRefreshAt - Date.now());
}, 250);

// water regen
if (SLOW_REGEN_MS) {
  setInterval(() => {
    if (water < maxWater()) {
      water += 1;
      dirtyHUD = true;
      flushUI();
    }
  }, SLOW_REGEN_MS);
}

// ---------- SAVE / LOAD ----------
function saveGame() {
  const data = {
    v: 12,
    money, totalEarned, water,
    activeItemId, tool,
    inventory, unlockedCrops,
    ownedUpgrades, upgradeLevels,
    bestMoneyPerMin,
    marketState,
    season,
    ordersState,
    plots: plots.map(p => ({
      kind: p.kind,
      isOrchard: p.isOrchard,
      state: p.state,
      plantedAt: p.plantedAt,
      growMs: p.growMs,
      productId: p.productId,
      waterings: p.waterings,
      harvestsLeft: p.harvestsLeft,
      regrowMs: p.regrowMs
    })),
    savedAt: Date.now()
  };

  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  pulseSaveDot();
}

function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return;

  const data = JSON.parse(raw);

  money = data.money ?? 0;
  totalEarned = data.totalEarned ?? 0;
  water = data.water ?? START_WATER;

  activeItemId = data.activeItemId ?? "turnip";
  tool = data.tool ?? "plant";

  const inv = data.inventory ?? {};
  for (const p of PRODUCTS) inventory[p.id] = Number.isFinite(inv[p.id]) ? inv[p.id] : (inventory[p.id] ?? 0);

  unlockedCrops = data.unlockedCrops ?? unlockedCrops;
  ownedUpgrades = data.ownedUpgrades ?? ownedUpgrades;
  upgradeLevels = { ...upgradeLevels, ...(data.upgradeLevels ?? {}) };
  bestMoneyPerMin = data.bestMoneyPerMin ?? 0;

  if (data.marketState && typeof data.marketState === "object") {
    marketState = {
      featuredId: data.marketState.featuredId ?? null,
      slumpId: data.marketState.slumpId ?? null,
      nextFlipAt: data.marketState.nextFlipAt ?? (Date.now() + MARKET.intervalMs),
      snipeUntil: data.marketState.snipeUntil ?? 0
    };
  }

  if (data.season && typeof data.season === "object") {
    season = {
      id: data.season.id ?? "",
      endsAt: data.season.endsAt ?? (Date.now() + SEASON_MS),
      startTotalEarned: data.season.startTotalEarned ?? totalEarned
    };
  } else {
    season = { id: "", endsAt: Date.now() + SEASON_MS, startTotalEarned: totalEarned };
  }

  if (data.ordersState && typeof data.ordersState === "object") {
    ordersState = {
      nextRefreshAt: data.ordersState.nextRefreshAt ?? (Date.now() + ORDERS_INTERVAL_MS),
      orders: Array.isArray(data.ordersState.orders) ? data.ordersState.orders : []
    };
  }

  if (Array.isArray(data.plots) && data.plots.length === plots.length) {
    for (let i = 0; i < plots.length; i++) {
      if (plots[i].kind === "well") continue;
      Object.assign(plots[i], data.plots[i]);

      if (plots[i].productId && !PRODUCT_BY_ID[plots[i].productId]) {
        plots[i].state = "empty";
        plots[i].productId = null;
        plots[i].waterings = 0;
        plots[i].plantedAt = 0;
        plots[i].growMs = 0;
        plots[i].harvestsLeft = 0;
        plots[i].regrowMs = 0;
      }
    }
  }

  const now = Date.now();

  // offline growth
  if (data.savedAt) {
    for (const p of plots) {
      if (p.kind === "soil" && p.state === "growing") {
        if (now - p.plantedAt >= p.growMs) p.state = "ready";
      }
    }
  }

  // re-ensure systems
  ensureSeason(now);
  refreshOrdersIfNeeded(now);
  advanceMarketTo(now);

  water = Math.min(water, maxWater());

  toolPlantBtn.classList.toggle("active", tool === "plant");
  toolWaterBtn.classList.toggle("active", tool === "water");
  toolRemoveBtn.classList.toggle("active", tool === "removeTree");
  toolRevertBtn.classList.toggle("active", tool === "revertOrchard");
  toolOrchardBtn.classList.toggle("active", tool === "buildOrchard");
}

// autosave
setInterval(() => saveGame(), AUTOSAVE_MS);
window.addEventListener("beforeunload", () => saveGame());

// ---------- START ----------
loadGame();

// default player name suggestion
try {
  const storedName = localStorage.getItem("tinyfarm_player_name");
  if (playerNameEl) {
    if (storedName) playerNameEl.value = storedName;
    playerNameEl.addEventListener("input", () => {
      localStorage.setItem("tinyfarm_player_name", playerNameEl.value);
    });
  }
} catch {}

buildGridOnce();
dirtyHUD = dirtyGrid = dirtyCards = dirtyStats = true;
flushUI();
