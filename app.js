/* GoldFit - App Logic */

// ===== Helpers =====
const $ = (id) => document.getElementById(id);

// ===== State =====
const state = {
  lang: "ar",
  theme: "dark",
  section: null,
  profile: {
    heightCm: null,
    weightKg: null,
    age: null,
    level: "beginner",
    injury: "none",
    activity: "low",
    bmi: null
  },
  prefs: {
    goal: null,
    duration: 20,
    days: 4,
    mode: "timer",
    impact: "auto",
    target: "full_body",
    type: "mix",
    equipment: "none"
  },
  exercises: [],
  weekPlan: [],
  todayIndex: 0,
  player: {
    workout: [],
    idx: 0,
    timer: null,
    running: false,
    remaining: 0
  }
};

// ===== Screens =====
const screens = [
  "screen-home",
  "screen-profile",
  "screen-goal",
  "screen-target",
  "screen-plan",
  "screen-player",
  "screen-library"
];

function showScreen(id) {
  screens.forEach(s => $(s).classList.add("hidden"));
  $(id).classList.remove("hidden");
}

// ===== Theme & Language =====
function setTheme(t) {
  state.theme = t;
  document.body.setAttribute("data-theme", t === "light" ? "light" : "dark");
  $("themeBtn").textContent = t === "light" ? "☀️" : "🌙";
}

function toggleLang() {
  state.lang = state.lang === "ar" ? "en" : "ar";
  document.documentElement.lang = state.lang;
  document.documentElement.dir = state.lang === "ar" ? "rtl" : "ltr";
  $("langBtn").textContent = state.lang.toUpperCase();
}

// ===== BMI =====
function calcBMI() {
  const h = Number($("heightCm").value);
  const w = Number($("weightKg").value);
  if (!h || !w) return null;
  const bmi = w / ((h / 100) ** 2);
  return Math.round(bmi * 10) / 10;
}

function updateBMI() {
  const bmi = calcBMI();
  state.profile.bmi = bmi;
  $("bmiText").textContent = bmi ? bmi : "—";
}

// ===== Section =====
function selectSection(sec) {
  state.section = sec;
  showScreen("screen-profile");
}

// ===== Goals =====
function selectGoal(goal) {
  state.prefs.goal = goal;
  $("goalChosenText").textContent = goal;
}

// ===== Data =====
async function loadExercises() {
  const res = await fetch("data/exercises.json");
  state.exercises = await res.json();
}

// ===== Plan Generation =====
function generatePlan() {
  const filtered = state.exercises.filter(ex =>
    ex.goals.includes(state.prefs.goal)
  );

  const days = Number(state.prefs.days);
  state.weekPlan = [];

  for (let i = 0; i < days; i++) {
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    state.weekPlan.push({
      day: i + 1,
      session: shuffled.slice(0, 5)
    });
  }

  renderPlan();
  showScreen("screen-plan");
}

function renderPlan() {
  const list = $("weekList");
  list.innerHTML = "";

  state.weekPlan.forEach((d, idx) => {
    const div = document.createElement("div");
    div.className = "weekCard";
    div.innerHTML = `
      <div class="weekDay">اليوم ${d.day}</div>
      <button class="smallBtn" data-idx="${idx}">ابدأ</button>
    `;
    div.querySelector("button").onclick = () => startWorkout(idx);
    list.appendChild(div);
  });
}

// ===== Workout Player =====
function startWorkout(dayIdx) {
  state.todayIndex = dayIdx;
  state.player.workout = state.weekPlan[dayIdx].session;
  state.player.idx = 0;
  showScreen("screen-player");
  loadExercise();
}

function loadExercise() {
  const ex = state.player.workout[state.player.idx];
  if (!ex) {
    showScreen("screen-plan");
    return;
  }

  $("playerExerciseName").textContent =
    state.lang === "ar" ? ex.name_ar : ex.name_en;
  $("playerMeta").textContent = ex.targets.join(", ");
  $("playerIllu").src = ex.illustration;

  if (state.prefs.mode === "timer") {
    state.player.remaining = ex.defaults.work_sec || 30;
    $("counter").textContent = state.player.remaining;
    $("counterHint").textContent = "Timer";
  } else {
    $("counter").textContent = `${ex.defaults.reps}x${ex.defaults.sets}`;
    $("counterHint").textContent = "Reps";
  }

  $("tipsText").textContent =
    state.lang === "ar" ? ex.tips_ar : ex.tips_en;
}

function startTimer() {
  if (state.player.running) return;
  state.player.running = true;

  state.player.timer = setInterval(() => {
    state.player.remaining--;
    $("counter").textContent = state.player.remaining;

    if (state.player.remaining === 3) beepThree();
    if (state.player.remaining <= 0) {
      stopTimer();
      nextExercise();
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(state.player.timer);
  state.player.running = false;
}

function nextExercise() {
  state.player.idx++;
  loadExercise();
}

// ===== Sounds (no mp3) =====
function beep(freq = 800, ms = 120) {
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.value = freq;
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  setTimeout(() => {
    osc.stop();
    ctx.close();
  }, ms);
}

function beepThree() {
  beep(700, 80);
  setTimeout(() => beep(700, 80), 120);
  setTimeout(() => beep(700, 80), 240);
}

// ===== Events =====
function wireUI() {
  $("langBtn").onclick = toggleLang;
  $("themeBtn").onclick = () =>
    setTheme(state.theme === "dark" ? "light" : "dark");

  $("btnMen").onclick = () => selectSection("men");
  $("btnWomen").onclick = () => selectSection("women");

  $("heightCm").oninput = updateBMI;
  $("weightKg").oninput = updateBMI;

  $("goGoalBtn").onclick = () => showScreen("screen-goal");

  document.querySelectorAll(".goal").forEach(b =>
    b.onclick = () => selectGoal(b.dataset.goal)
  );

  $("goTargetBtn").onclick = () => showScreen("screen-target");
  $("generateBtn").onclick = generatePlan;

  $("playBtn").onclick = startTimer;
  $("nextBtn").onclick = nextExercise;
  $("stopBtn").onclick = stopTimer;

  $("libraryBtn").onclick = () => showScreen("screen-library");
  $("backPlan").onclick = () => showScreen("screen-plan");
}

// ===== Init =====
(async function init() {
  await loadExercises();
  setTheme("dark");
  wireUI();
  showScreen("screen-home");
})();
