// p5.js Climate Clock for NASA GISTEMP-style whitespace table
// 1 ring per year, 12 arcs per ring (Jan..Dec)
// Color: cold->blue, hot->red
// Missing values: "***" are skipped

let rawLines;
let rows = []; // { year, months:[12] }
let minA = Infinity, maxA = -Infinity;

let rot = 0;
let showLabels = true;


function preload() {
  rawLines = loadStrings("data/dataset.csv"); // your downloaded file
}

function setup() {
  createCanvas(900, 900);
  angleMode(RADIANS);
  colorMode(HSB, 360, 100, 100, 1);

  parseGistempLikeTable(rawLines);

  if (rows.length === 0) {
    throw new Error("Parsed 0 rows. Check file path and that year lines look like: 1880 -.19 -.25 ...");
  }

  // Fallback if min/max didn't compute for some reason
  if (!isFinite(minA) || !isFinite(maxA) || minA === maxA) {
    minA = -1; maxA = 2;
  }
}

function draw() {
  background(225, 25, 7);

  translate(width / 2, height / 2);
  rot += 0.0018;
  rotate(rot);

  const nYears = rows.length;
  const outerR = min(width, height) * 0.46;
  const innerR = 22;
  const ringStep = (outerR - innerR) / max(1, nYears);

  const seg = TWO_PI / 12;
  const maxAbs = max(abs(minA), abs(maxA));

  noFill();
  strokeCap(SQUARE);

  for (let i = 0; i < nYears; i++) {
    const yearRow = rows[i];

    // older years slightly dimmer
    const alpha = map(i, 0, nYears - 1, 0.18, 1.0);

    const rBase = innerR + i * ringStep;

    for (let m = 0; m < 12; m++) {
      const a = yearRow.months[m];
      if (!isFinite(a)) continue;

      // Jan at top, clockwise
      const t0 = -HALF_PI + m * seg;
      const t1 = t0 + seg;

      // hue mapping: blue (cold) -> red (hot)
      const hue = map(a, minA, maxA, 210, 0);

      // bulge radius by anomaly
      const rOffset = map(a, minA, maxA, -ringStep * 0.9, ringStep * 0.9);
      const r = rBase + rOffset;

      // thickness by magnitude
      const w = map(abs(a), 0, maxAbs, 0.5, ringStep * 1.25);

      stroke(hue, 85, 95, alpha);
      strokeWeight(w);
      arc(0, 0, 2 * r, 2 * r, t0, t1);
    }
  }

  if (showLabels) {
    push();
    rotate(-rot); // keep labels upright
    drawMonthTicks(outerR + 10);
    drawLegend(-width * 0.47, -height * 0.46);
    pop();
  }
}

function keyPressed() {
  if (key === "l" || key === "L") showLabels = !showLabels;
}

// ---------- parsing ----------

function parseGistempLikeTable(lines) {
  rows = [];
  minA = Infinity; maxA = -Infinity;

  for (let i = 0; i < lines.length; i++) {
    const line = (lines[i] || "").trim();
    if (!line) continue;

    // skip headers (handles both "Year Jan..." and "Year,Jan,...")
    if (line.startsWith("Land-Ocean:")) continue;
    if (line.startsWith("Year")) continue;

    // IMPORTANT: split by comma or whitespace
    const tok = line.split(/[,\s]+/).filter(Boolean);

    // needs Year + 12 months
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
  console.log("Parsed years:", rows.length, "from", rows[0]?.year, "to", rows.at(-1)?.year);
}

// ---------- labels ----------

function drawMonthTicks(r) {
  const months = ["J","F","M","A","M","J","J","A","S","O","N","D"];
  textAlign(CENTER, CENTER);
  textSize(12);

  for (let m = 0; m < 12; m++) {
    const a = -HALF_PI + m * (TWO_PI / 12);

    stroke(0, 0, 92, 0.22);
    strokeWeight(1);
    line(cos(a) * (r - 6), sin(a) * (r - 6), cos(a) * (r + 6), sin(a) * (r + 6));

    noStroke();
    fill(0, 0, 92, 0.75);
    text(months[m], cos(a) * (r + 22), sin(a) * (r + 22));
  }
}

function drawLegend(x, y) {
  push();
  translate(x, y);

  noStroke();
  fill(0, 0, 92, 0.85);
  textAlign(LEFT, TOP);
  textSize(12);
  text("Climate Clock — monthly temperature anomaly", 0, 0);

  textSize(11);
  fill(0, 0, 92, 0.7);
  text("Blue=cooler  Red=warmer   (Press L to toggle labels)", 0, 18);

  // gradient bar
  const w = 170, h = 10;
  for (let i = 0; i < w; i++) {
    const t = i / (w - 1);
    const v = lerp(minA, maxA, t);
    const hue = map(v, minA, maxA, 210, 0);
    stroke(hue, 85, 95, 1);
    line(i, 42, i, 42 + h);
  }

  noStroke();
  fill(0, 0, 92, 0.7);
  text(nf(minA, 1, 2), 0, 56);
  textAlign(RIGHT, TOP);
  text(nf(maxA, 1, 2), w, 56);

  pop();
}