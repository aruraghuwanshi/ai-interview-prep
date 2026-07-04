"use strict";

const STORAGE_KEY = "ai-interview-prep-progress-v1";
const TAB_KEY = "ai-interview-prep-active-tab";
const VALID_TABS = ["anthropic", "openai"];

const PLAN = [
  {
    week: "Wk 1",
    title: "Thread-safe LRU cache + TTL",
    build: "LRU (Java) → port core to Python",
    reading: "DDIA Ch.3; Python threading/asyncio primer",
    tasks: [
      "Implement LRU with O(1) get/put (hashmap + doubly linked list)",
      "Add TTL / expiry and background eviction",
      "Make it thread-safe; reason about lock granularity",
      "Port the core to Python; compare ergonomics",
    ],
  },
  {
    week: "Wk 2",
    title: "In-memory database (4 gates)",
    build: "The canonical escalating-gate problem",
    reading: "DDIA Ch.7 (transactions)",
    tasks: [
      "Gate 1: get / set / delete",
      "Gate 2: TTL + expiry scan",
      "Gate 3: scan / filter by prefix + value",
      "Gate 4: transactions (begin / commit / rollback) + WAL",
    ],
  },
  {
    week: "Wk 3",
    title: "Distributed rate limiter",
    build: "Fixed → sliding → token bucket → distributed",
    reading: "Alex Xu 'Rate Limiter'; DDIA Ch.5 (replication)",
    tasks: [
      "Fixed-window and sliding-window counters",
      "Token-bucket + leaky-bucket with refill math",
      "Make it distributed (atomic counter semantics)",
      "Handle clock skew, bursts, and back-pressure",
    ],
  },
  {
    week: "Wk 4",
    title: "Webhook / task-delivery service",
    build: "OpenAI take-home shape: reliable delivery",
    reading: "DDIA Ch.8–9; Hello Interview webhook / job-scheduler",
    tasks: [
      "At-least-once delivery with retries + exponential backoff",
      "Dead-letter queue for poison messages",
      "Idempotency keys + delivery schema/design",
      "Tests + README documenting trade-offs",
    ],
  },
  {
    week: "Wk 5–6",
    title: "Continuous-batching inference simulator",
    build: "Build a toy of the LLM-serving design round",
    reading: "vLLM / PagedAttention paper; Anyscale batching blog",
    tasks: [
      "Request queue + continuous (iteration-level) batching",
      "KV-cache memory accounting; prefill vs decode phases",
      "Token streaming via SSE; client reconnect / resume",
      "Measure GPU utilization + p95 latency under variable load",
    ],
  },
  {
    week: "Wk 7",
    title: "Usage metering + per-org quotas & values",
    build: "AI-platform design + Anthropic values prep",
    reading: "Alex Xu 'Metrics & Monitoring'; Anthropic RSP + Core Views",
    tasks: [
      "Token counting, per-org quotas, billing aggregation",
      "Per-org rate limits without noisy-neighbor degradation",
      "Draft mission/values stories from real incident work",
      "Rehearse hard follow-ups ('when were you wrong?')",
    ],
  },
  {
    week: "Wk 8",
    title: "Mock loops + design narratives",
    build: "Integrate; convert builds into design stories",
    reading: "Anthropic candidate guidance; OpenAI Charter",
    tasks: [
      "AI-off timed mock: 2 coding gates + 1 design",
      "Turn each project into a numbers-first design narrative",
      "Values / behavioral mock with relentless follow-ups",
      "Optional: dry-run the OpenAI 48h take-home",
    ],
  },
];

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch (_) {
    return {};
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let state = loadState();

function taskId(weekIndex, taskIndex) {
  return `w${weekIndex}-t${taskIndex}`;
}

function totalTasks() {
  return PLAN.reduce((sum, wk) => sum + wk.tasks.length, 0);
}

function completedTasks() {
  return Object.values(state).filter(Boolean).length;
}

function setRing(ring, pct) {
  const fg = ring.querySelector(".ring-fg");
  const r = fg.r.baseVal.value;
  const circumference = 2 * Math.PI * r;
  fg.style.strokeDasharray = String(circumference);
  fg.style.strokeDashoffset = String(circumference * (1 - pct));
}

function updateProgress() {
  const total = totalTasks();
  const done = completedTasks();
  const pct = total ? done / total : 0;
  const pctText = `${Math.round(pct * 100)}%`;

  document.querySelectorAll(".ring").forEach((ring) => setRing(ring, pct));

  const navPct = document.getElementById("navPct");
  const heroPct = document.getElementById("heroPct");
  const planPct = document.getElementById("planPct");
  const planCount = document.getElementById("planCount");
  if (navPct) navPct.textContent = pctText;
  if (heroPct) heroPct.textContent = pctText;
  if (planPct) planPct.textContent = pctText;
  if (planCount) planCount.textContent = `${done} / ${total} tasks`;

  document.querySelectorAll(".week").forEach((weekEl) => {
    const boxes = weekEl.querySelectorAll("input[type=checkbox]");
    const allDone = boxes.length > 0 && [...boxes].every((b) => b.checked);
    weekEl.classList.toggle("done", allDone);
  });
}

function renderPlan() {
  const container = document.getElementById("planContainer");
  if (!container) return;

  PLAN.forEach((wk, wi) => {
    const card = document.createElement("article");
    card.className = "week";

    const header = document.createElement("div");
    header.className = "week-top";
    header.innerHTML = `<span class="week-badge">${wk.week}</span><h4>${wk.title}</h4>`;
    card.appendChild(header);

    const meta = document.createElement("p");
    meta.className = "week-meta";
    meta.innerHTML = `<b>Build:</b> ${wk.build}<br/><b>Read:</b> ${wk.reading}`;
    card.appendChild(meta);

    const list = document.createElement("ul");
    list.className = "tasks";
    wk.tasks.forEach((task, ti) => {
      const id = taskId(wi, ti);
      const li = document.createElement("li");
      li.className = "task" + (state[id] ? " checked" : "");

      const box = document.createElement("input");
      box.type = "checkbox";
      box.checked = Boolean(state[id]);
      box.addEventListener("change", () => {
        state[id] = box.checked;
        saveState(state);
        li.classList.toggle("checked", box.checked);
        updateProgress();
      });

      const label = document.createElement("span");
      label.textContent = task;

      li.appendChild(box);
      li.appendChild(label);
      list.appendChild(li);
    });

    card.appendChild(list);
    container.appendChild(card);
  });
}

function wireReset() {
  const btn = document.getElementById("resetBtn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    if (!confirm("Reset all progress on this device?")) return;
    state = {};
    saveState(state);
    document.querySelectorAll(".task input[type=checkbox]").forEach((b) => (b.checked = false));
    document.querySelectorAll(".task").forEach((t) => t.classList.remove("checked"));
    updateProgress();
  });
}

function initMermaid() {
  if (!window.mermaid) return;
  window.mermaid.initialize({
    startOnLoad: true,
    theme: "dark",
    securityLevel: "loose",
    flowchart: { curve: "basis", htmlLabels: true },
    themeVariables: {
      primaryColor: "#171b25",
      primaryBorderColor: "#8b5cff",
      primaryTextColor: "#e7eaf2",
      lineColor: "#6b7488",
      fontFamily: "Inter, sans-serif",
    },
  });
}

const LEETCODE = [
  {
    group: "Design &amp; OOP",
    chip: "core for both",
    items: [
      { n: "LRU Cache", slug: "lru-cache", d: "M" },
      { n: "LFU Cache", slug: "lfu-cache", d: "H" },
      { n: "Time Based Key-Value Store", slug: "time-based-key-value-store", d: "M" },
      { n: "Insert Delete GetRandom O(1)", slug: "insert-delete-getrandom-o1", d: "M" },
      { n: "Design HashMap", slug: "design-hashmap", d: "E" },
      { n: "Design In-Memory File System", slug: "design-in-memory-file-system", d: "H" },
      { n: "Design Search Autocomplete", slug: "design-search-autocomplete-system", d: "H" },
      { n: "Design Twitter", slug: "design-twitter", d: "M" },
      { n: "Design Hit Counter", slug: "design-hit-counter", d: "M" },
      { n: "Logger Rate Limiter", slug: "logger-rate-limiter", d: "E" },
      { n: "Min Stack", slug: "min-stack", d: "M" },
      { n: "Design Underground System", slug: "design-underground-system", d: "M" },
    ],
  },
  {
    group: "Concurrency &amp; threading",
    chip: "Anthropic favorite",
    items: [
      { n: "Print in Order", slug: "print-in-order", d: "E" },
      { n: "Print FooBar Alternately", slug: "print-foobar-alternately", d: "M" },
      { n: "Building H2O", slug: "building-h2o", d: "M" },
      { n: "Fizz Buzz Multithreaded", slug: "fizz-buzz-multithreaded", d: "M" },
      { n: "The Dining Philosophers", slug: "the-dining-philosophers", d: "M" },
      { n: "Web Crawler Multithreaded", slug: "web-crawler-multithreaded", d: "M" },
    ],
  },
  {
    group: "Graphs, topo &amp; trees",
    items: [
      { n: "Number of Islands", slug: "number-of-islands", d: "M" },
      { n: "Course Schedule", slug: "course-schedule", d: "M" },
      { n: "Course Schedule II", slug: "course-schedule-ii", d: "M" },
      { n: "Alien Dictionary", slug: "alien-dictionary", d: "H" },
      { n: "Parallel Courses", slug: "parallel-courses", d: "M" },
      { n: "Serialize/Deserialize Binary Tree", slug: "serialize-and-deserialize-binary-tree", d: "H" },
      { n: "Encode and Decode Strings", slug: "encode-and-decode-strings", d: "M" },
    ],
  },
  {
    group: "Parsing &amp; practical utilities",
    items: [
      { n: "Simplify Path (cd command)", slug: "simplify-path", d: "M" },
      { n: "Text Justification", slug: "text-justification", d: "H" },
      { n: "Basic Calculator", slug: "basic-calculator", d: "H" },
      { n: "Basic Calculator II", slug: "basic-calculator-ii", d: "M" },
      { n: "Exclusive Time of Functions", slug: "exclusive-time-of-functions", d: "M" },
      { n: "Flatten Nested List Iterator", slug: "flatten-nested-list-iterator", d: "M" },
      { n: "RLE Iterator", slug: "rle-iterator", d: "M" },
      { n: "Design Compressed String Iterator", slug: "design-compressed-string-iterator", d: "E" },
    ],
  },
];

function renderLeetcode() {
  const container = document.getElementById("lcContainer");
  if (!container) return;

  LEETCODE.forEach((groupData) => {
    const card = document.createElement("div");
    card.className = "qcat card";

    const heading = document.createElement("h4");
    heading.innerHTML = groupData.chip
      ? `${groupData.group} <span class="chip">${groupData.chip}</span>`
      : groupData.group;
    card.appendChild(heading);

    const list = document.createElement("ul");
    list.className = "lc-list";
    groupData.items.forEach((problem) => {
      const item = document.createElement("li");

      const link = document.createElement("a");
      link.href = `https://leetcode.com/problems/${problem.slug}/`;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = problem.n;

      const badge = document.createElement("span");
      badge.className = `lc-badge lc-${problem.d}`;
      badge.textContent = problem.d;

      item.appendChild(badge);
      item.appendChild(link);
      list.appendChild(item);
    });

    card.appendChild(list);
    container.appendChild(card);
  });
}

function setTab(name) {
  if (!VALID_TABS.includes(name)) return;
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    const on = btn.dataset.tab === name;
    btn.classList.toggle("active", on);
    btn.setAttribute("aria-selected", on ? "true" : "false");
  });
  document.querySelectorAll(".tab-panel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === `panel-${name}`);
  });
  try {
    localStorage.setItem(TAB_KEY, name);
  } catch (_) {
    /* ignore storage errors */
  }
}

function initialTab() {
  const hash = location.hash.replace("#", "");
  if (VALID_TABS.includes(hash)) return hash;
  try {
    const saved = localStorage.getItem(TAB_KEY);
    if (VALID_TABS.includes(saved)) return saved;
  } catch (_) {
    /* ignore storage errors */
  }
  return "anthropic";
}

function wireTabs() {
  document.querySelectorAll("[data-tab]").forEach((el) => {
    el.addEventListener("click", () => setTab(el.dataset.tab));
  });
  setTab(initialTab());
}

document.addEventListener("DOMContentLoaded", () => {
  renderPlan();
  renderLeetcode();
  wireReset();
  wireTabs();
  updateProgress();
  initMermaid();
});
