var w, h;
var cnv;

var NUM_CIRCLES = 130;
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

function drawPaintInside(x, y, d, colorLayers = null) {
  var ctx = drawingContext;
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, d / 2, 0, TWO_PI);
  ctx.clip(); // Clip a circle area

  let numLayers;

  // If a palette is passed, use it
  if (colorLayers) {
    numLayers = colorLayers.length;
  } else {
    numLayers = int(random(3, 5)); // random layers
    colorLayers = shuffle([...PALETTE]).slice(0, numLayers);
  }

  var layerMaxRadius = d / 2;

  // loop through layers
  for (var layer = 0; layer < numLayers; layer++) {
    var layerRadius = layerMaxRadius * (1 - (layer / numLayers) * 0.6); // shrink radius per layer

    // More drops for inner layers
    var spacingFactor = map(layer, 0, numLayers - 1, 0.5, 1);
    var numDrops = int(random(60, 120) * spacingFactor);

    var base = colorLayers[layer];

    // Draw drops for this layer
    for (var i = 0; i < numDrops; i++) {
      var r = random(1, 1.5);
      var angle = random(TWO_PI);

      var radius;
      if (layer == numLayers - 1) {
        radius = random(0, layerRadius - r);
      } else {
        radius = layerRadius + random(-layerRadius * 0.2, layerRadius * 0.2);
      }

      var px = x + cos(angle) * radius;
      var py = y + sin(angle) * radius;

      // Sets color of a droplet
      // Random(-20,20) to add some variation
      // constrain to keep in 0-255 range
      // random alpha for layering effect
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
  return colorLayers;
}
// One cluster -> one pating of colours
// One glass -> multiple clusters with shared colours
function drawGlassCircle(x, y, d) {
  var clusters = [];
  var numClusters = int(random(1, 4)); // TODO: Here are randomized 1–3 clusters
  var maxTries = 100;

  // Precompute cluster radius, (generates radius of each cluster)
  // Size relative to glass circle diameter
  var clusterRadii = [];
  for (var i = 0; i < numClusters; i++) {
    var maxR = (d / 2) * (0.5 - i * 0.12);
    var minR = (d / 2) * 0.2;
    clusterRadii.push(random(minR, maxR) * 2); // 2 is a scaling factor
  }

  // Generate a shared color layers
  var numLayers = int(random(3, 5)); // TODO: Random layers of colours
  var sharedPalette = shuffle([...PALETTE]).slice(0, numLayers);

  for (var i = 0; i < numClusters; i++) {
    var clusterRadius = min(clusterRadii[i], d / 2 - 2);

    var placed = false;
    var tries = 0;

    // Placing the clusters
    while (!placed && tries < maxTries) {
      var angle = random(TWO_PI);
      var distFromCenter = random(0, d / 2 - clusterRadius);
      var clusterX = x + cos(angle) * distFromCenter;
      var clusterY = y + sin(angle) * distFromCenter;

      var valid = true;
      for (var j = 0; j < clusters.length; j++) {
        var c = clusters[j];
        if (dist(clusterX, clusterY, c.x, c.y) < clusterRadius + c.r) {
          valid = false;
          break;
        }
      }

      if (valid) {
        clusters.push({ x: clusterX, y: clusterY, r: clusterRadius });
        placed = true;
      } else if (i === numClusters - 1 && tries === maxTries - 1) {
        clusterRadius *= 0.7;
        tries = 0;
      }

      tries++;
    }
  }

  // Draw clusters using the shared palette
  for (var i = 0; i < clusters.length; i++) {
    var c = clusters[i];
    drawPaintInside(c.x, c.y, c.r, sharedPalette);
  }

  // glass overlay
  noStroke();
  fill(255, 255, 255, 60);
  circle(x, y, d);

  // glass inner glow
  fill(255, 255, 255, 35);
  circle(x, y, d * 0.85);

  // glass outline
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

// ******** ENTRY DRAW POINT ********
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

  drawMetallicBorder();
}

function placeCircle() {
  var maxTries = 500; // tries 500 times to place a circle
  var tries = 0;

  while (tries < maxTries) {
    var d = random(10, 60); // TODO: Random diameter of circles between 10 and 60
    var x = random(d / 2, w - d / 2);
    var y = random(d / 2, h - d / 2);

    var valid = true;

    // Check for overlaps with existing circles
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
