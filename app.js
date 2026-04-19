const saveKey = "chocolate-pringles-clicker-v4";
const accountKey = "chocolate-pringles-account-v1";
const oldSaveKeys = ["chocolate-pringles-clicker", "chocolate-pringles-clicker-v2", "chocolate-pringles-clicker-v3"];
const configuredApiBase = localStorage.getItem("chocolate-pringles-api") || "";
const apiBase = configuredApiBase || (location.protocol.startsWith("http") ? "" : "");
const canUseOnlineApi = Boolean(configuredApiBase || location.protocol.startsWith("http"));
const chocolateClicks = 1000;
const subRanksPerTier = 3;
const proRankPoints = 10000;
const proBoostStep = 10;

const colorTiers = [
  { name: "Bronze", icon: "B", boost: 5, required: 1000, color: "#a46f3d", dark: "#6f4727", chocolate: "#8a4a2f" },
  { name: "Silver", icon: "S", boost: 10, required: 2000, color: "#aeb8bc", dark: "#5b666b", chocolate: "#756057" },
  { name: "Gold", icon: "G", boost: 20, required: 3000, color: "#e0b340", dark: "#856014", chocolate: "#a8712d" },
  { name: "Platinum", icon: "P", boost: 30, required: 4000, color: "#91c9c6", dark: "#3e7471", chocolate: "#56645e" },
  { name: "Diamond", icon: "D", boost: 40, required: 5000, color: "#66d7ef", dark: "#1d788a", chocolate: "#426d7c" },
  { name: "Mythic", icon: "M", boost: 50, required: 6000, color: "#c87edf", dark: "#783b88", chocolate: "#743f68" },
  { name: "Exotic", icon: "E", boost: 60, required: 7000, color: "#f277a1", dark: "#a3325b", chocolate: "#9b3852" },
  { name: "Legendary", icon: "L", boost: 70, required: 8000, color: "#e63728", dark: "#8d1710", chocolate: "#b32217" },
  { name: "Masters", icon: "A", boost: 90, required: 9000, color: "#f27f23", dark: "#91450b", chocolate: "#c45b13" },
];

const proTier = {
  name: "Pro",
  icon: "PRO",
  color: "#58ff63",
  dark: "#116b21",
  chocolate: "#39ff14",
};

const compliments = [
  "crispy work",
  "legend snack energy",
  "nice crunch",
  "you are cooking",
  "elite clicking",
  "choco champion",
  "pringle power",
  "unstoppable",
  "green glow soon",
  "massive snack gains",
];

const pointsEl = document.querySelector("#points");
const rankNameEl = document.querySelector("#rankName");
const clickValueEl = document.querySelector("#clickValue");
const nextGoalEl = document.querySelector("#nextGoal");
const snackButton = document.querySelector("#snackButton");
const floatingPoints = document.querySelector("#floatingPoints");
const chocoStageLabel = document.querySelector("#chocoStageLabel");
const rankProgressLabel = document.querySelector("#rankProgressLabel");
const progressBar = document.querySelector("#progressBar");
const proBurst = document.querySelector("#proBurst");
const leftCompliment = document.querySelector("#leftCompliment");
const rightCompliment = document.querySelector("#rightCompliment");
const resetButton = document.querySelector("#resetButton");
const rankUnlock = document.querySelector("#rankUnlock");
const rankIcon = document.querySelector("#rankIcon");
const rankUnlockText = document.querySelector("#rankUnlockText");
const accountModal = document.querySelector("#accountModal");
const accountForm = document.querySelector("#accountForm");
const accountMessage = document.querySelector("#accountMessage");
const leaderboardList = document.querySelector("#leaderboardList");
const onlineStatus = document.querySelector("#onlineStatus");
const battlecardButton = document.querySelector("#battlecardButton");
const battlecardModal = document.querySelector("#battlecardModal");
const closeBattlecard = document.querySelector("#closeBattlecard");
const battlecardPreview = document.querySelector("#battlecardPreview");
const battlecardTitle = document.querySelector("#battlecardTitle");
const battlecardRank = document.querySelector("#battlecardRank");
const battlecardScore = document.querySelector("#battlecardScore");

let state = loadState();
let account = loadAccount();
let currentRankName = getRankInfo().rankName;
let wasPro = getRankInfo().isPro;
let lastSyncPoints = 0;

function loadState() {
  const saved = localStorage.getItem(saveKey);
  if (!saved) {
    oldSaveKeys.forEach((key) => localStorage.removeItem(key));
    return { points: 0, clicks: 0, rankPoints: 0 };
  }

  try {
    const parsed = JSON.parse(saved);
    return {
      points: Number(parsed.points) || 0,
      clicks: Number(parsed.clicks) || 0,
      rankPoints: Number(parsed.rankPoints) || 0,
    };
  } catch {
    return { points: 0, clicks: 0, rankPoints: 0 };
  }
}

function saveState() {
  localStorage.setItem(saveKey, JSON.stringify(state));
}

function loadAccount() {
  const saved = localStorage.getItem(accountKey);
  if (!saved) return null;

  try {
    return JSON.parse(saved);
  } catch {
    return null;
  }
}

function saveAccount(nextAccount) {
  account = nextAccount;
  localStorage.setItem(accountKey, JSON.stringify(account));
}

function getChocolateStage() {
  return Math.min(10, Math.floor(state.clicks / 100));
}

function getCoverAmount() {
  if (state.clicks >= chocolateClicks) return 100;
  return getChocolateStage() * 10;
}

function getRankInfo() {
  if (state.clicks < chocolateClicks) {
    return {
      rankName: "No Rank",
      tierName: "No Rank",
      tierLevel: 0,
      icon: "C",
      boost: 1,
      color: "#a46f3d",
      dark: "#6f4727",
      chocolate: "#8a4a2f",
      isPro: false,
      progress: (state.clicks / chocolateClicks) * 100,
      nextText: `${chocolateClicks - state.clicks} clicks until ranks unlock`,
    };
  }

  const rankedPoints = Math.max(0, state.rankPoints);
  const proStartPoints = colorTiers.reduce((total, tier) => total + tier.required, 0);

  if (rankedPoints >= proStartPoints) {
    const proPoints = rankedPoints - proStartPoints;
    const proNumber = Math.floor(proPoints / proRankPoints) + 1;
    const boost = proBoostStep;
    const nextPro = (proNumber * proRankPoints) - proPoints;

    return {
      rankName: `Pro ${proNumber}`,
      tierName: "Pro",
      tierLevel: colorTiers.length + proNumber,
      icon: proTier.icon,
      boost,
      color: proTier.color,
      dark: proTier.dark,
      chocolate: proTier.chocolate,
      isPro: true,
      progress: (proPoints % proRankPoints) / proRankPoints * 100,
      nextText: `${nextPro.toLocaleString()} points to Pro ${proNumber + 1}`,
      pointsToNext: Math.max(1, Math.ceil(nextPro)),
    };
  }

  let tierIndex = 0;
  let pointsBeforeTier = 0;
  for (let index = 0; index < colorTiers.length; index += 1) {
    const tierCost = colorTiers[index].required;
    if (rankedPoints < pointsBeforeTier + tierCost) {
      tierIndex = index;
      break;
    }
    pointsBeforeTier += tierCost;
  }

  const tier = colorTiers[tierIndex];
  const pointsInsideTier = rankedPoints - pointsBeforeTier;
  const subRankCost = tier.required / subRanksPerTier;
  const rankNumber = Math.min(
    subRanksPerTier,
    Math.floor(pointsInsideTier / subRankCost) + 1
  );
  const nextTier = colorTiers[tierIndex + 1];
  const nextRankPoints = Math.min(
    tier.required,
    Math.ceil((pointsInsideTier + 1) / subRankCost) * subRankCost
  );
  const pointsToNext = Math.max(1, Math.ceil(nextRankPoints - pointsInsideTier));
  const nextRankNumber = rankNumber < 3 ? rankNumber + 1 : 1;
  const nextRankName = rankNumber < 3 ? `${tier.name} ${nextRankNumber}` : `${nextTier ? nextTier.name : "Pro"} ${nextRankNumber}`;

  return {
    rankName: `${tier.name} ${rankNumber}`,
    tierName: tier.name,
    tierLevel: tierIndex + 1,
    icon: tier.icon,
    boost: tier.boost,
    color: tier.color,
    dark: tier.dark,
    chocolate: tier.chocolate,
    isPro: false,
    progress: (pointsInsideTier / tier.required) * 100,
    nextText: `${pointsToNext.toLocaleString()} points to ${nextRankName}`,
    pointsToNext,
  };
}

function updateGame() {
  const rank = getRankInfo();
  const stage = getChocolateStage();
  const nextChocolate = Math.ceil((state.clicks + 1) / 100) * 100;

  pointsEl.textContent = Math.floor(state.points).toLocaleString();
  rankNameEl.textContent = rank.rankName;
  clickValueEl.textContent = `+${rank.boost}`;
  chocoStageLabel.textContent =
    state.clicks < chocolateClicks ? `Chocolate stage ${stage} / 10` : "Fully chocolate";
  rankProgressLabel.textContent = rank.nextText;
  nextGoalEl.textContent =
    state.clicks < chocolateClicks
      ? `${nextChocolate - state.clicks} clicks to more chocolate. Ranks start when it is fully covered.`
      : `${rank.tierName} boost: ${rank.boost} points per click.`;
  progressBar.style.width = `${rank.progress}%`;
  updateBattlecard(rank);

  document.body.classList.toggle("is-pro", rank.isPro);
  document.documentElement.style.setProperty("--cover", `${getCoverAmount()}%`);
  document.documentElement.style.setProperty("--rank", rank.color);
  document.documentElement.style.setProperty("--rank-dark", rank.dark);
  document.documentElement.style.setProperty("--choco", rank.chocolate);

  if (rank.rankName !== currentRankName && rank.rankName !== "No Rank") {
    showRankUnlock(rank);
  }

  if (!wasPro && rank.isPro) {
    triggerProBurst("PRO MODE");
  }

  currentRankName = rank.rankName;
  wasPro = rank.isPro;
}

function showPointPop(amount) {
  const pop = document.createElement("span");
  pop.className = "pop";
  pop.textContent = `+${amount}`;
  pop.style.setProperty("--x", `${Math.random() * 140 - 70}px`);
  pop.style.setProperty("--y", `${Math.random() * 50 - 25}px`);
  floatingPoints.append(pop);
  window.setTimeout(() => pop.remove(), 700);
}

function triggerPetCompliment() {
  const compliment = compliments[Math.floor(Math.random() * compliments.length)];
  const target = Math.random() > 0.5 ? leftCompliment : rightCompliment;
  target.textContent = compliment;
  target.parentElement.classList.remove("is-peeking");
  window.requestAnimationFrame(() => {
    target.parentElement.classList.add("is-peeking");
  });
}

function triggerProBurst(text) {
  proBurst.textContent = text;
  proBurst.classList.remove("is-active");
  window.requestAnimationFrame(() => {
    proBurst.classList.add("is-active");
  });
}

function showRankUnlock(rank) {
  rankIcon.textContent = rank.icon;
  rankUnlockText.textContent = `${rank.rankName} unlocked`;
  rankUnlock.className = "rank-unlock";
  rankUnlock.classList.add(`tier-${Math.min(rank.tierLevel, 10)}`, "is-active");
  window.setTimeout(() => {
    rankUnlock.classList.remove("is-active");
  }, 1500);
}

function updateBattlecard(rank = getRankInfo()) {
  const name = account ? account.name : "Player";
  const favoriteColor = account ? account.favoriteColor : "#8a4a2f";
  battlecardPreview.style.setProperty("--favorite-choco", favoriteColor);
  battlecardTitle.textContent = name;
  battlecardRank.textContent = rank.rankName;
  battlecardScore.textContent = `${Math.floor(state.points).toLocaleString()} points`;
}

function renderLeaderboard(entries = []) {
  leaderboardList.innerHTML = "";
  const fallback = account
    ? [{ name: account.name, rank: getRankInfo().rankName, points: state.points, favoriteColor: account.favoriteColor }]
    : [];
  const list = entries.length ? entries : fallback;

  if (!list.length) {
    const item = document.createElement("li");
    item.textContent = "Create an account to appear here.";
    leaderboardList.append(item);
    return;
  }

  list.slice(0, 10).forEach((entry, index) => {
    const item = document.createElement("li");
    const name = document.createElement("span");
    const rank = document.createElement("strong");
    const points = document.createElement("em");
    item.style.setProperty("--favorite-choco", entry.favoriteColor || "#8a4a2f");
    name.textContent = `${index + 1}. ${entry.name}`;
    rank.textContent = entry.rank;
    points.textContent = Math.floor(entry.points).toLocaleString();
    item.append(name, rank, points);
    leaderboardList.append(item);
  });
}

async function apiRequest(path, body) {
  if (!canUseOnlineApi) return null;

  const response = await fetch(`${apiBase}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error("Online request failed");
  }

  return response.json();
}

async function syncScore(force = false) {
  if (!account) return;
  renderLeaderboard();

  if (!apiBase || (!force && state.points - lastSyncPoints < 100)) return;

  try {
    const rank = getRankInfo();
    const result = await apiRequest("/api/score", {
      token: account.token,
      name: account.name,
      favoriteColor: account.favoriteColor,
      points: Math.floor(state.points),
      rank: rank.rankName,
    });
    lastSyncPoints = state.points;
    onlineStatus.textContent = "Online";
    renderLeaderboard(result.leaderboard || []);
  } catch {
    onlineStatus.textContent = "Local";
  }
}

snackButton.addEventListener("click", () => {
  const rank = getRankInfo();
  state.clicks += 1;
  state.points += rank.boost;
  if (state.clicks > chocolateClicks) {
    state.rankPoints += rank.boost;
  }
  saveState();

  snackButton.classList.remove("is-bouncing", "is-pro-click");
  window.requestAnimationFrame(() => {
    snackButton.classList.add("is-bouncing");
    if (rank.isPro) {
      snackButton.classList.add("is-pro-click");
      triggerProBurst("RADIOACTIVE CRUNCH");
    }
  });

  if (state.clicks % 20 === 0 || Math.random() < 0.08) {
    triggerPetCompliment();
  }

  showPointPop(rank.boost);
  updateGame();
  syncScore();
});

snackButton.addEventListener("animationend", () => {
  snackButton.classList.remove("is-bouncing", "is-pro-click");
});

resetButton.addEventListener("click", () => {
  state = { points: 0, clicks: 0, rankPoints: 0 };
  saveState();
  currentRankName = "No Rank";
  wasPro = false;
  triggerPetCompliment();
  updateGame();
  syncScore(true);
});

accountForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(accountForm);
  const nextAccount = {
    name: String(formData.get("playerName")).trim(),
    favoriteColor: String(formData.get("favoriteColor")),
    token: crypto.randomUUID(),
  };

  try {
    const result = await apiRequest("/api/register", {
      ...nextAccount,
      password: String(formData.get("password")),
    });
    if (result && result.token) {
      nextAccount.token = result.token;
      onlineStatus.textContent = "Online";
    }
  } catch {
    accountMessage.textContent = "Saved locally. Connect a hosted server later for worldwide leaderboard.";
  }

  saveAccount(nextAccount);
  accountModal.classList.add("is-hidden");
  updateGame();
  syncScore(true);
});

battlecardButton.addEventListener("click", () => {
  updateBattlecard();
  battlecardModal.classList.remove("is-hidden");
});

closeBattlecard.addEventListener("click", () => {
  battlecardModal.classList.add("is-hidden");
});

if (account) {
  accountModal.classList.add("is-hidden");
}

updateGame();
renderLeaderboard();
syncScore(true);
