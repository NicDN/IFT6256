let maxDepth = 0;
let maxAllowedDepth; // RANDOMIZED
let angleVariation;
let finished = false;
let growthInterval = 25; // GROWTH SPEED

function setup() {
  createCanvas(1000, 1000);
  angleMode(RADIANS);
  frameRate(30);
  colorMode(HSB, 360, 100, 100, 1); //HSB for depth based color
  restartTree();
}

function draw() {
  background(10, 15, 25);
  translate(width / 2, height);

  drawBranch(200, 0);

  if (!finished) {
    if (frameCount % growthInterval === 0) {
      maxDepth++;
    }

    if (maxDepth > maxAllowedDepth) {
      finished = true;

      setTimeout(() => {
        restartTree();
      }, 5000);
    }
  }
}

function drawBranch(length, depth) {
  if (depth < maxDepth) {
    // Depth based color branches
    let branchHue = map(depth, 0, maxAllowedDepth, 30, 150); // brown to green
    let branchSat = map(depth, 0, maxAllowedDepth, 80, 70); // saturation decrease
    let branchBright = map(depth, 0, maxAllowedDepth, 50, 90); // tips are brighter
    stroke(branchHue, branchSat, branchBright, 0.8);

    strokeWeight(map(length, 0, 160, 1, 7));
    line(0, 0, 0, -length);
    translate(0, -length);

    // right branch
    push();
    rotate(angleVariation);
    drawBranch(length * 0.72, depth + 1);
    pop();

    // left branch
    push();
    rotate(-angleVariation);
    drawBranch(length * 0.72, depth + 1);
    pop();
  } else {
    // Leaf pulse based on depth
    let pulse = sin(frameCount * 0.15 + depth * 3) * 4;

    noStroke();

    // Pink leaves with (random hue and size)
    let leafHue =
      map(depth, 0, maxAllowedDepth, 300, 330) +
      random(-5, 5) + // RANDOM hue offset
      map(sin(frameCount * 0.05 + depth), -1, 1, -5, 5);
    let leafSize = 8 + pulse + random(-2, 2); // RANDOM size variation
    fill(leafHue, 70, 100, 0.6);
    circle(0, 0, leafSize);

    // Outer glow for leaves
    fill(leafHue, 40, 100, 0.2);
    circle(0, 0, 16 + pulse * 2 + random(-2, 2));
  }
}

function restartTree() {
  maxDepth = 0;
  finished = false;

  // Randomize max depth between 7 and 12
  maxAllowedDepth = floor(random(7, 10));

  // Randomize branch angle
  angleVariation = random(PI / 6, PI / 3);
}
