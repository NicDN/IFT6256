let weatherData = [];
let particles = [];
let dayIndex = 0;
let tableLoaded = false;

// Wind variables for the current day
let dailyWindSpeed = 0;
let dailyWindDir = 0;

function setup() {
  createCanvas(800, 600);
  colorMode(HSB, 360, 100, 100);
  noStroke();

  loadJSON(
    "montreal_weather_2012.json",
    (data) => {
      weatherData = data;
      tableLoaded = true;
      setDailyWind(); // initialize wind for first day
      updateParticles();
    },
    (error) => console.error("Error loading JSON:", error),
  );
}

function draw() {
  if (!tableLoaded) {
    background(210, 30, 95);
    fill(0);
    textSize(24);
    textAlign(CENTER, CENTER);
    text("Loading weather data...", width / 2, height / 2);
    return;
  }

  let row = weatherData[dayIndex];
  let date = new Date(row.LOCAL_DATE);
  let dateString = date.toDateString();

  // Background gradient based on min/max temperature
  let minTemp = parseFloat(row.MIN_TEMPERATURE);
  let maxTemp = parseFloat(row.MAX_TEMPERATURE);
  let bgHue = map((minTemp + maxTemp) / 2, -30, 30, 200, 30);
  background(bgHue, 30, 95);

  // Display date
  fill(0);
  textSize(20);
  textAlign(LEFT, TOP);
  text(dateString, 10, 10);

  // Update particles once per second
  if (frameCount % 60 === 0) {
    dayIndex = (dayIndex + 1) % weatherData.length;
    setDailyWind(); // new wind for new day
    updateParticles();
  }

  for (let p of particles) {
    p.update();
    p.display();
  }
}

function setDailyWind() {
  // Random wind speed (pixels/frame) and direction (radians) per day
  dailyWindSpeed = random(0.5, 3);
  dailyWindDir = random(TWO_PI);
}

function updateParticles() {
  particles = [];
  let row = weatherData[dayIndex];

  let totalRain = parseFloat(row.TOTAL_RAIN);
  let totalSnow = parseFloat(row.TOTAL_SNOW);

  let rainParticles = map(totalRain, 0, 50, 0, 300);
  let snowParticles = map(totalSnow, 0, 50, 0, 200);

  for (let i = 0; i < rainParticles; i++) {
    particles.push(new Particle(random(width), random(height), "rain"));
  }
  for (let i = 0; i < snowParticles; i++) {
    particles.push(new Particle(random(width), random(height), "snow"));
  }
}

// Particle class
class Particle {
  constructor(x, y, type) {
    this.pos = createVector(x, y);
    this.type = type;

    if (this.type === "rain") {
      this.speed = random(3, 6);
      this.size = random(3, 5);
      this.color = color(200, 80, 100); // blue
    } else {
      this.speed = random(0.5, 2);
      this.size = random(5, 8);
      this.color = color(0, 0, 100); // white
    }
  }

  update() {
    // Apply daily wind
    let vx = cos(dailyWindDir) * dailyWindSpeed;
    let vy = sin(dailyWindDir) * dailyWindSpeed;

    if (this.type === "rain") {
      this.pos.y += this.speed + vy;
      this.pos.x += vx + random(-0.5, 0.5);
    } else {
      this.pos.y += this.speed * 0.5 + vy;
      this.pos.x += vx + random(-1, 1);
    }

    // Wrap edges
    if (this.pos.y > height) this.pos.y = 0;
    if (this.pos.y < 0) this.pos.y = height;
    if (this.pos.x > width) this.pos.x = 0;
    if (this.pos.x < 0) this.pos.x = width;
  }

  display() {
    fill(this.color);
    ellipse(this.pos.x, this.pos.y, this.size);
  }
}
