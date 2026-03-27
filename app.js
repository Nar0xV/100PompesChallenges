
// ============================================================
// app.js — Logique principale
// ============================================================

// –– LocalStorage helpers ––
const STORAGE_KEY = "pushup_challenge_v1";

function loadData() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// –– Utilitaires dates ––
function getToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function dateKey(dayNumber) {
  const d = new Date(CHALLENGE_START);
  d.setDate(d.getDate() + dayNumber - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getCurrentChallengeDay() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(CHALLENGE_START);
  start.setHours(0, 0, 0, 0);
  const diff = Math.floor((today - start) / 86400000) + 1;
  if (diff < 1) return null; // Pas encore commencé
  if (diff > CHALLENGE_DAYS) return CHALLENGE_DAYS + 1; // Terminé
  return diff;
}

function formatDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
}

// –– Timer ––
let timerInterval = null;
let timerSeconds = 0;
let timerRunning = false;
let todaySessionTime = 0;

function formatTime(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function startTimer() {
  if (timerRunning) {
    // Pause
    clearInterval(timerInterval);
    timerRunning = false;
    document.getElementById("btnStart").textContent = "▶ REPRENDRE";
  } else {
    timerRunning = true;
    document.getElementById("btnStart").textContent = "⏸ PAUSE";
    timerInterval = setInterval(() => {
      timerSeconds++;
      document.getElementById("timerDisplay").textContent = formatTime(timerSeconds);
    }, 1000);
  }
}

function resetTimer() {
  clearInterval(timerInterval);
  timerRunning = false;
  timerSeconds = 0;
  document.getElementById("timerDisplay").textContent = "00:00";
  document.getElementById("btnStart").textContent = "▶ DÉMARRER";
}

// –– Séries (checkboxes) ––
let checkedSeries = new Set();

function buildSeriesGrid(disabled) {
  const grid = document.getElementById("seriesGrid");
  grid.innerHTML = "";
  checkedSeries = new Set();

  PROGRAM.forEach((serie) => {
    const card = document.createElement("div");
    card.className = "serie-card";
    card.dataset.id = serie.id;
    card.innerHTML = `
      <div class="serie-emoji">${serie.emoji}</div>
      <div class="serie-info">
        <div class="serie-name">${serie.name}</div>
        <div class="serie-desc">${serie.description}</div>
        <div class="serie-muscles">${serie.muscles.map((m) => `<span>${m}</span>`).join("")}</div>
      </div>
      <div class="serie-reps">${serie.reps}<span>reps</span></div>
      <button class="serie-check ${disabled ? "disabled" : ""}" data-id="${serie.id}" ${disabled ? "disabled" : ""}>
        ${disabled ? "✓" : ""}
      </button>
    `;

    if (disabled) {
      card.classList.add("done");
    } else {
      card.querySelector(".serie-check").addEventListener("click", () => toggleSerie(serie.id, card));
    }
    grid.appendChild(card);
  });
  updateCompleteBtn();
}

function toggleSerie(id, card) {
  if (checkedSeries.has(id)) {
    checkedSeries.delete(id);
    card.classList.remove("checked");
    card.querySelector(".serie-check").textContent = "";
  } else {
    checkedSeries.add(id);
    card.classList.add("checked");
    card.querySelector(".serie-check").textContent = "✓";
  }
  updateCompleteBtn();
}

function updateCompleteBtn() {
  const btn = document.getElementById("btnComplete");
  const allDone = checkedSeries.size === PROGRAM.length;
  btn.disabled = !allDone;
  document.querySelector(".complete-note").textContent = allDone
    ? "Prêt à valider ! 💪"
    : `${checkedSeries.size}/${PROGRAM.length} séries cochées`;
}

// –– Valider la séance ––
function completeSession() {
  const data = loadData();
  const today = getToday();
  const day = getCurrentChallengeDay();
  if (!day || day > CHALLENGE_DAYS) return;

  if (!data.sessions) data.sessions = {};
  data.sessions[today] = {
    day,
    completed: true,
    time: timerSeconds,
    date: today,
  };

  saveData(data);
  clearInterval(timerInterval);
  timerRunning = false;
  todaySessionTime = timerSeconds;
  
  // Bouton reset (activé seulement si séance validée)
document.getElementById("btnCancel").onclick = function() {
  if(confirm("Reprendre la séance d'aujourd'hui ?")) {
    localStorage.removeItem("pushup_challenge_v1");
    location.reload();
  }
};


  renderAll();
}

// –– Render global ––
function renderAll() {
  const data = loadData();
  const day = getCurrentChallengeDay();
  const today = getToday();
  const sessions = data.sessions || {};

  // Header day counter
  const dayEl = document.getElementById("currentDay");
  if (!day) {
    dayEl.textContent = "–";
  } else if (day > CHALLENGE_DAYS) {
    dayEl.textContent = "✓";
  } else {
    dayEl.textContent = day;
  }

  // Total complétées
  const totalDone = Object.values(sessions).filter((s) => s.completed).length;
  document.getElementById("totalDone").textContent = totalDone;

  // Streak
  let streak = 0;
  for (let d = (day || 1) - 1; d >= 1; d--) {
    const key = dateKey(d);
    if (sessions[key]?.completed) {
      streak++;
    } else {
      break;
    }
  }
  document.getElementById("streakCount").textContent = streak;
  const pct = Math.min(100, (streak / 7) * 100);
  document.getElementById("streakFill").style.width = pct + "%";

  // Date du jour
  document.getElementById("todayDate").textContent =
    day && day <= CHALLENGE_DAYS ? formatDate(today) : "";

  // Séries
  const todayDone = sessions[today]?.completed;
  buildSeriesGrid(todayDone);

  if (todayDone) {
    document.getElementById("timerDisplay").textContent = formatTime(sessions[today].time || 0);
    document.getElementById("btnStart").disabled = true;
    document.getElementById("btnReset").disabled = true;
    document.getElementById("btnComplete").textContent = "✓ SÉANCE VALIDÉE !";
    document.getElementById("btnComplete").disabled = true;
    document.querySelector(".complete-note").textContent = `Temps : ${formatTime(sessions[today].time || 0)} — Bravo ! 🏆`;
   document.getElementById("btnCancel").disabled = true;
   document.getElementById("btnCancel").classList.remove("hidden");
} else {
  // Bouton reset désactivé
  document.getElementById("btnCancel").disabled

  }

  // Calendrier
  renderCalendar(sessions, day);

  // Graphique
  renderChart(sessions);
}

// –– Calendrier ––
function renderCalendar(sessions, currentDay) {
  const grid = document.getElementById("calendarGrid");
  grid.innerHTML = "";

  for (let d = 1; d <= CHALLENGE_DAYS; d++) {
    const key = dateKey(d);
    const session = sessions[key];
    const isPast = currentDay && d < currentDay;
    const isToday = currentDay && d === currentDay;
    const isFuture = !currentDay || d > currentDay;

    const cell = document.createElement("div");
    cell.className = "cal-cell";

    if (session?.completed) {
      cell.classList.add("cal-done");
      cell.innerHTML = `<span class="cal-day">${d}</span><span class="cal-status">✓</span>`;
    } else if (isPast) {
      cell.classList.add("cal-missed");
      cell.innerHTML = `<span class="cal-day">${d}</span><span class="cal-status">✗</span>`;
    } else if (isToday) {
      cell.classList.add("cal-today");
      cell.innerHTML = `<span class="cal-day">${d}</span><span class="cal-status">◉</span>`;
    } else {
      cell.classList.add("cal-future");
      cell.innerHTML = `<span class="cal-day">${d}</span>`;
    }

    // Tooltip temps
    if (session?.time) {
      cell.title = `Jour ${d} — ${formatTime(session.time)}`;
    }

    grid.appendChild(cell);
  }
}

// –– Graphique simple ––
function renderChart(sessions) {
  const canvas = document.getElementById("timeChart");
  const ctx = canvas.getContext("2d");
  const emptyEl = document.getElementById("chartEmpty");

  const entries = Object.values(sessions)
    .filter((s) => s.completed && s.time > 0)
    .sort((a, b) => a.day - b.day);

  if (entries.length === 0) {
    canvas.style.display = "none";
    emptyEl.style.display = "block";
    return;
  }

  canvas.style.display = "block";
  emptyEl.style.display = "none";

  // Resize
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = 220 * dpr;
  canvas.style.width = rect.width + "px";
  canvas.style.height = "220px";
  ctx.scale(dpr, dpr);

  const W = rect.width;
  const H = 220;
  const PAD = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const times = entries.map((e) => e.time);
  const minT = Math.min(...times);
  const maxT = Math.max(...times);
  const rangeT = maxT - minT || 60;

  ctx.clearRect(0, 0, W, H);

  // Grille
  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = PAD.top + (chartH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(PAD.left, y);
    ctx.lineTo(PAD.left + chartW, y);
    ctx.stroke();

    const t = maxT - (rangeT / 4) * i;
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.font = `500 10px 'DM Mono', monospace`;
    ctx.textAlign = "right";
    ctx.fillText(formatTime(Math.round(t)), PAD.left - 6, y + 4);
  }

  // Points & ligne
  const points = entries.map((e, i) => {
    const x = PAD.left + (entries.length === 1 ? chartW / 2 : (i / (entries.length - 1)) * chartW);
    const y = PAD.top + chartH - ((e.time - minT) / rangeT) * chartH;
    return { x, y, entry: e };
  });

  // Remplissage sous la courbe
  const grad = ctx.createLinearGradient(0, PAD.top, 0, PAD.top + chartH);
  grad.addColorStop(0, "rgba(255, 75, 43, 0.35)");
  grad.addColorStop(1, "rgba(255, 75, 43, 0)");

  ctx.beginPath();
  ctx.moveTo(points[0].x, PAD.top + chartH);
  points.forEach((p) => ctx.lineTo(p.x, p.y));
  ctx.lineTo(points[points.length - 1].x, PAD.top + chartH);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Ligne
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  points.forEach((p) => ctx.lineTo(p.x, p.y));
  ctx.strokeStyle = "#FF4B2B";
  ctx.lineWidth = 2.5;
  ctx.lineJoin = "round";
  ctx.stroke();

  // Points
  points.forEach((p) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = "#FF4B2B";
    ctx.fill();
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Label jour
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = `500 10px 'DM Mono', monospace`;
    ctx.textAlign = "center";
    ctx.fillText(`J${p.entry.day}`, p.x, PAD.top + chartH + 18);
  });
}

// –– Init ––
document.getElementById("btnStart").addEventListener("click", startTimer);
document.getElementById("btnReset").addEventListener("click", resetTimer);
document.getElementById("btnComplete").addEventListener("click", () => {
  if (confirm("Valider la séance du jour ? Cette action est définitive.")) {
    completeSession();
  }
});

window.addEventListener("resize", () => {
  const data = loadData();
  renderChart(data.sessions || {});
});

renderAll();
