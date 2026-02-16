let maxDepth = 0;
let maxAllowedDepth = 9;
let angleVariation;
let finished = false;
let growthInterval = 20; // controls growth speed

function setup() {
  createCanvas(800, 800);
  angleMode(RADIANS);
  frameRate(30);
  restartTree();
}

function draw() {
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
  stroke(120 + depth * 12, 180 - depth * 10, 255 - depth * 18, 200);

  strokeWeight(map(length, 0, 160, 1, 7));

  line(0, 0, 0, -length);
  translate(0, -length);

  if (depth < maxDepth) {
    push();
    rotate(angleVariation);
    drawBranch(length * 0.72, depth + 1);
    pop();

    push();
    rotate(-angleVariation);
    drawBranch(length * 0.72, depth + 1);
    pop();
  } else {
    noStroke();
    fill(255, 220, 255, 180);
    circle(0, 0, 6);
  }
}

function restartTree() {
  background(10, 15, 25);
  maxDepth = 0;
  finished = false;
  angleVariation = random(PI / 6, PI / 3);
}
