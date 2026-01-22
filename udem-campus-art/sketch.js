var w, h;
var cnv;

var NUM_CIRCLES = 160;
var circles = [];

var PALETTE = [
  [255, 255, 255], // white
  [0, 0, 0], // black
  [30, 90, 200], // blue
  [200, 40, 40], // red
  [40, 160, 90], // green
  [40, 200, 200], // turquoise
  [240, 140, 40], // orange
];

function setup() {
  w = 2000;
  h = 800;
  cnv = createCanvas(w, h);
  centerCanvas();
  colorMode(RGB, 255);
  noLoop();
}

function centerCanvas() {
  var x = (windowWidth - w) / 2;
  var y = (windowHeight - h) / 2;
  cnv.position(x, y);
}

function drawPaintInside(x, y, d) {
  var ctx = drawingContext;

  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, d / 2, 0, TWO_PI);
  ctx.clip();

  var numLayers = int(random(3, 5)); // 3–5 layers
  var layerMaxRadius = d / 2;

  var colors = shuffle([...PALETTE]);

  for (var layer = 0; layer < numLayers; layer++) {
    var layerRadius = layerMaxRadius * (1 - (layer / numLayers) * 0.6);

    var spacingFactor = map(layer, 0, numLayers - 1, 0.5, 1);
    var numDrops = int(random(60, 120) * spacingFactor);

    var base = colors[layer % colors.length];

    for (var i = 0; i < numDrops; i++) {
      var r = random(1, 1.5); // tiny 2–3 px diameter
      var angle = random(TWO_PI);

      var radius;

      if (layer == numLayers - 1) {
        // innermost layer → fill the disk
        radius = random(0, layerRadius - r);
      } else {
        // outer layers → ring-like
        radius = layerRadius + random(-layerRadius * 0.2, layerRadius * 0.2);
      }

      var px = x + cos(angle) * radius;
      var py = y + sin(angle) * radius;

      fill(
        constrain(base[0] + random(-20, 20), 0, 255),
        constrain(base[1] + random(-20, 20), 0, 255),
        constrain(base[2] + random(-20, 20), 0, 255),
        random(230, 255),
      );

      noStroke();
      circle(px, py, r * 2);
    }
  }

  ctx.restore();
}

function drawGlassCircle(x, y, d) {
  var clusters = [];
  var numClusters = int(random(1, 4)); // 1–3 clusters
  var maxTries = 100;

  for (var i = 0; i < numClusters; i++) {
    var tries = 0;
    while (tries < maxTries) {
      // cluster radius
      var clusterRadius = d * random(0.3, 0.6);

      // candidate position
      var angle = random(TWO_PI);
      var distFromCenter = random(0, d / 2 - clusterRadius);

      var clusterX = x + cos(angle) * distFromCenter;
      var clusterY = y + sin(angle) * distFromCenter;

      // check overlap with existing clusters
      var valid = true;
      for (var j = 0; j < clusters.length; j++) {
        var c = clusters[j];
        var distCenters = dist(clusterX, clusterY, c.x, c.y);
        if (distCenters < clusterRadius + c.r) {
          valid = false;
          break;
        }
      }

      if (valid) {
        clusters.push({ x: clusterX, y: clusterY, r: clusterRadius });
        break;
      }

      tries++;
    }
  }

  // draw each cluster
  for (var i = 0; i < clusters.length; i++) {
    var c = clusters[i];
    drawPaintInside(c.x, c.y, c.r);
  }

  // Glass overlay
  noStroke();
  fill(255, 255, 255, 60);
  circle(x, y, d);

  // inner glow
  fill(255, 255, 255, 35);
  circle(x, y, d * 0.85);

  // subtle outline
  noFill();
  stroke(255, 255, 255, 80);
  strokeWeight(1);
  circle(x, y, d);
}

function drawMetallicBorder() {
  let borderThickness = 15;

  // Outer metallic gradient effect
  for (let i = 0; i < borderThickness; i++) {
    let shade = map(i, 0, borderThickness - 1, 120, 200); // gray gradient
    stroke(shade);
    strokeWeight(1);
    noFill();
    rect(i / 2, i / 2, w - i, h - i);
  }
}

function draw() {
  background(157, 212, 114);

  noStroke();
  fill(255, 255, 255, 180);

  circles = [];

  for (var i = 0; i < NUM_CIRCLES; i++) {
    placeCircle();
  }

  for (var i = 0; i < circles.length; i++) {
    var c = circles[i];
    drawGlassCircle(c.x, c.y, c.d);
  }

  // Draw metallic border on top
  drawMetallicBorder();
}

function placeCircle() {
  var maxTries = 500;
  var tries = 0;

  while (tries < maxTries) {
    var d = random(10, 60);
    var x = random(d / 2, w - d / 2);
    var y = random(d / 2, h - d / 2);

    var valid = true;

    for (var i = 0; i < circles.length; i++) {
      var other = circles[i];
      var distCenters = dist(x, y, other.x, other.y);

      if (distCenters < d / 2 + other.d / 2) {
        valid = false;
        break;
      }
    }

    if (valid) {
      circles.push({ x: x, y: y, d: d });
      return;
    }

    tries++;
  }
}
