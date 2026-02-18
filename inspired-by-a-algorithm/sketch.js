let maxDepth = 0;
let maxAllowedDepth;
let finished = false;
let growthInterval = 25; // Every 25 frames we will be increasing the depth of the snowflake arms

let arms = [];
let armCount = 6;

function setup() {
  createCanvas(1500, 1500);
  angleMode(RADIANS);
  frameRate(30);
  colorMode(HSB, 360, 100, 100, 1);
  restartSnowflake();
}

// Ran every frame
function draw() {
  background(210, 40, 15); // Redraws background every frame

  translate(width / 2, height / 2); // Center snowflake

  // Draw each arm
  for (let i = 0; i < armCount; i++) {
    push();
    // Example, if armCount=6, rotate 60 degrees for each arm
    rotate((TWO_PI / armCount) * i); // Rotate evenly for each arm
    drawArm(arms[i].baseLength, 0, arms[i]);
    pop();
  }

  if (!finished) {
    if (frameCount % growthInterval === 0) {
      maxDepth++;
    }

    if (maxDepth > maxAllowedDepth) {
      finished = true;
      setTimeout(() => restartSnowflake(), 5000);
    }
  }
}

function drawArm(length, depth, settings) {
  // Stop condition
  if (depth < maxDepth) {
    let hue = settings.hueBase + depth * settings.hueShift;
    let brightness = map(depth, 0, maxAllowedDepth, 70, 100);

    stroke(hue, 25, brightness, 0.9);
    strokeWeight(map(length, 0, 220, 1, 5));

    // Draw main arm
    line(0, 0, 0, -length);
    translate(0, -length);

    // Right branch
    push();
    rotate(settings.angle);
    drawArm(length * settings.scale, depth + 1, settings);
    pop();

    // Right branch
    push();
    rotate(-settings.angle);
    drawArm(length * settings.scale, depth + 1, settings);
    pop();
  } else {
    // When recursive stops
    noStroke();

    let sparkle = 6 + sin(frameCount * 0.25 + depth) * 2;

    fill(settings.hueBase, 15, 100, 0.9);
    circle(0, 0, sparkle);

    fill(settings.hueBase, 10, 100, 0.3);
    circle(0, 0, sparkle * 2);
  }
}

function restartSnowflake() {
  maxDepth = 0;
  finished = false;

  maxAllowedDepth = floor(random(4, 7));

  arms = [];

  // Random parameters per arm
  for (let i = 0; i < armCount; i++) {
    arms.push({
      angle: random(PI / 10, PI / 4),
      scale: random(0.55, 0.7),
      hueBase: random(180, 210),
      hueShift: random(2, 6),
      baseLength: random(180, 240),
    });
  }
}
