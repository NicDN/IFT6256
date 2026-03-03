let rawLines;
let rows = [];      // {year, months[12]}
let segments = [];  // flattened: {year, yearIndex, monthIndex, anomaly}

let minA = Infinity, maxA = -Infinity;

let revealCount = 0;
let lastStepMs = 0;
let intervalMs = 200; // 1 second per month segment
let paused = false;

const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function preload() {
  rawLines = loadStrings("data/dataset.csv");
}

function setup() {
  createCanvas(900, 900);
  angleMode(RADIANS);
  colorMode(HSB, 360, 100, 100, 1);

  parseGistempLikeTable(rawLines);
  buildSegments();

  if (segments.length === 0) throw new Error("No segments built. Check parsing.");
  lastStepMs = millis();
}

function draw() {
  background(225, 25, 7);

  // advance reveal counter at a fixed interval
  if (!paused) {
    const now = millis();
    if (now - lastStepMs >= intervalMs) {
      const steps = floor((now - lastStepMs) / intervalMs);
      revealCount = min(revealCount + steps, segments.length);
      lastStepMs += steps * intervalMs;
    }
  }

  translate(width / 2, height / 2);

  // layout
  const nYears = rows.length;
  const outerR = min(width, height) * 0.46;
  const innerR = 22;
  const ringStep = (outerR - innerR) / max(1, nYears);

  const segAngle = TWO_PI / 12;
  const maxAbs = max(abs(minA), abs(maxA));

  // draw only up to revealCount
  noFill();
  strokeCap(SQUARE);

  for (let i = 0; i < revealCount; i++) {
    const s = segments[i];
    const a = s.anomaly;

    // Still “counts” as a month, but if missing (***) then draw nothing
    if (!isFinite(a)) continue;

    const rBase = innerR + s.yearIndex * ringStep;

    // month angle (Jan at top)
    const t0 = -HALF_PI + s.monthIndex * segAngle;
    const t1 = t0 + segAngle;

    // color: cold -> blue, warm -> red
    const hue = map(a, minA, maxA, 210, 0);

    // radius bulge: warm outward, cold inward
    const rOffset = map(a, minA, maxA, -ringStep * 0.9, ringStep * 0.9);
    const r = rBase + rOffset;

    // thickness: magnitude (distance from 0)
    const w = map(abs(a), 0, maxAbs, 0.5, ringStep * 1.25);

    // fade older years slightly (based on yearIndex)
    const alpha = map(s.yearIndex, 0, nYears - 1, 0.18, 1.0);

    stroke(hue, 85, 95, alpha);
    strokeWeight(w);
    arc(0, 0, 2 * r, 2 * r, t0, t1);
  }

  // overlay UI (not rotated)
  push();
  resetMatrix();
  drawUI();
  pop();
}

function keyPressed() {
  if (key === " " ) paused = !paused;
  if (key === "r" || key === "R") { revealCount = 0; lastStepMs = millis(); }
  if (key === "+" || key === "=") intervalMs = max(50, intervalMs - 100);  // faster
  if (key === "-" || key === "_") intervalMs = min(5000, intervalMs + 100); // slower
}

// ---------------- Parsing ----------------

function parseGistempLikeTable(lines) {
  rows = [];
  minA = Infinity; maxA = -Infinity;

  for (let i = 0; i < lines.length; i++) {
    const line = (lines[i] || "").trim();
    if (!line) continue;
    if (line.startsWith("Land-Ocean:")) continue;
    if (line.startsWith("Year")) continue;

    // handles comma CSV OR whitespace table
    const tok = line.split(/[,\s]+/).filter(Boolean);
    if (tok.length < 13) continue;

    const year = parseInt(tok[0], 10);
    if (!isFinite(year)) continue;

    const months = new Array(12).fill(NaN);
    for (let m = 0; m < 12; m++) {
      const s = tok[1 + m];
      if (!s || s === "***") {
        months[m] = NaN;
      } else {
        const v = parseFloat(s);
        months[m] = v;
        if (isFinite(v)) {
          minA = min(minA, v);
          maxA = max(maxA, v);
        }
      }
    }

    rows.push({ year, months });
  }

  rows.sort((a, b) => a.year - b.year);
}

function buildSegments() {
  segments = [];
  for (let yi = 0; yi < rows.length; yi++) {
    for (let mi = 0; mi < 12; mi++) {
      segments.push({
        year: rows[yi].year,
        yearIndex: yi,
        monthIndex: mi,
        anomaly: rows[yi].months[mi]
      });
    }
  }
}

// ---------------- UI ----------------

function drawUI() {
  // current segment info
  let label = "Building…";
  if (revealCount > 0) {
    const s = segments[min(revealCount - 1, segments.length - 1)];
    const val = isFinite(s.anomaly) ? nf(s.anomaly, 1, 2) : "missing";
    label = `${s.year} ${monthNames[s.monthIndex]}   anomaly: ${val}°C`;
  }
  const done = (revealCount >= segments.length);

  noStroke();
  fill(0, 0, 100, 0.85);
  textSize(14);
  textAlign(LEFT, TOP);
  text("Climate Clock (reveals 1 month segment at a time)", 16, 14);

  textSize(12);
  fill(0, 0, 100, 0.75);
  text(label, 16, 36);
  text(`segments: ${revealCount} / ${segments.length}   speed: ${intervalMs}ms   (space=pause, r=reset, +/- speed)`, 16, 54);

  if (done) {
    fill(0, 0, 100, 0.9);
    textSize(12);
    text("Complete.", 16, 74);
  }
}