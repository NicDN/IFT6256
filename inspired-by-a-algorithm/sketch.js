let maxDepth = 0;
let maxAllowedDepth = 9;
let angleVariation;
let finished = false;
let growthInterval = 20; // controls growth speed

function setup() {
  createCanvas(800, 800);
  angleMode(RADIANS);
  frameRate(30);
  colorMode(HSB, 360, 100, 100, 1); // Use HSB for depth-based color
  restartTree();
}

function draw() {
  background(10, 15, 25); // clear each frame for smooth bloom animation
  translate(width / 2, height);

  drawBranch(160, 0);

  if (!finished) {
    if (frameCount % growthInterval === 0) {
      maxDepth++;
    }

    if (maxDepth > maxAllowedDepth) {
      finished = true;

      setTimeout(() => {
        restartTree();
      }, 4000);
    }
  }
}

function drawBranch(length, depth) {
  if (depth < maxDepth) {
    // Depth-based color for branches
    let branchHue = map(depth, 0, maxAllowedDepth, 30, 150); // brown → green
    let branchSat = map(depth, 0, maxAllowedDepth, 80, 70); // slight saturation decrease
    let branchBright = map(depth, 0, maxAllowedDepth, 50, 90); // brighter tips
    stroke(branchHue, branchSat, branchBright, 0.8);

    strokeWeight(map(length, 0, 160, 1, 7));
    line(0, 0, 0, -length);
    translate(0, -length);

    // recursive branches
    push();
    rotate(angleVariation);
    drawBranch(length * 0.72, depth + 1);
    pop();

    push();
    rotate(-angleVariation);
    drawBranch(length * 0.72, depth + 1);
    pop();
  } else {
    // bloom leaves
    let pulse = sin(frameCount * 0.15 + depth * 3) * 4;

    noStroke();

    // Pinkish bloom leaves with random hue and size (solution 4)
    let leafHue =
      map(depth, 0, maxAllowedDepth, 300, 330) +
      random(-5, 5) + // small random hue offset
      map(sin(frameCount * 0.05 + depth), -1, 1, -5, 5);
    let leafSize = 8 + pulse + random(-2, 2); // random size variation
    fill(leafHue, 70, 100, 0.6);
    circle(0, 0, leafSize);

    // subtle outer glow with slight size randomness
    fill(leafHue, 40, 100, 0.2);
    circle(0, 0, 16 + pulse * 2 + random(-2, 2));
  }
}

function restartTree() {
  maxDepth = 0;
  finished = false;
  angleVariation = random(PI / 6, PI / 3);
}
