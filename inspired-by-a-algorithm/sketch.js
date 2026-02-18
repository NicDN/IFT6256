let maxDepth = 0;
let maxAllowedDepth;
let angleVariation;
let finished = false;
let growthInterval = 25; // growth speed

function setup() {
  createCanvas(1000, 1000);
  angleMode(RADIANS);
  frameRate(30);
  colorMode(HSB, 360, 100, 100, 1);
  restartSnowflake();
}

function draw() {
  background(210, 40, 15); // dark icy blue

  translate(width / 2, height / 2);

  // Draw 6 symmetrical arms
  for (let i = 0; i < 6; i++) {
    push();
    rotate((TWO_PI / 6) * i);
    drawArm(220, 0);
    pop();
  }

  // Growth logic
  if (!finished) {
    if (frameCount % growthInterval === 0) {
      maxDepth++;
    }

    if (maxDepth > maxAllowedDepth) {
      finished = true;

      setTimeout(() => {
        restartSnowflake();
      }, 5000);
    }
  }
}

function drawArm(length, depth) {
  if (depth < maxDepth) {
    // Crystal-like coloring
    let hue = 190 + depth * 4;
    let brightness = map(depth, 0, maxAllowedDepth, 70, 100);
    stroke(hue, 25, brightness, 0.9);

    strokeWeight(map(length, 0, 220, 1, 5));
    line(0, 0, 0, -length);
    translate(0, -length);

    // Side branches (crystal growth)
    push();
    rotate(angleVariation);
    drawArm(length * 0.6, depth + 1);
    pop();

    push();
    rotate(-angleVariation);
    drawArm(length * 0.6, depth + 1);
    pop();
  } else {
    // Sparkling crystal tip
    noStroke();

    let sparkle = 6 + sin(frameCount * 0.25 + depth) * 2;

    fill(200, 15, 100, 0.9);
    circle(0, 0, sparkle);

    fill(200, 10, 100, 0.3);
    circle(0, 0, sparkle * 2);
  }
}

function restartSnowflake() {
  maxDepth = 0;
  finished = false;

  // Randomized crystal complexity
  maxAllowedDepth = floor(random(4, 7));

  // Randomized branching angle
  angleVariation = random(PI / 8, PI / 5);
}
