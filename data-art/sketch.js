// ==========================================================
// p5.js Data Art : vélo + météo Montréal 2025
// ==========================================================

// ----------------------------
// Variables globales
// ----------------------------
let bikeData = [];
let weatherData = [];
let currentHour = 0;
let hours = [];
let mapWidth = 800;
let mapHeight = 600;
let minLon, maxLon, minLat, maxLat;
let dataReady = false;

// ----------------------------
// Setup canvas et chargement JSON
// ----------------------------
function setup() {
  createCanvas(mapWidth, mapHeight);
  noStroke();
  frameRate(2); // 2 frames/sec = 2h/sec

  // Charger JSON vélo 2025
  loadJSON("data/processed/bike_data_hourly_by_counter_2025.json", (data) => {
    bikeData = data.map((d) => ({
      ...d,
      nb_passages: Number(d.nb_passages),
      longitude: Number(d.longitude),
      latitude: Number(d.latitude),
    }));
    attemptDataReady();
  });

  // Charger JSON météo 2025
  loadJSON("data/processed/weather_mtl_clean_2025.json", (data) => {
    weatherData = data.map((d) => ({
      ...d,
      temperature: Number(d.temperature),
    }));
    attemptDataReady();
  });
}

// ----------------------------
// Vérifier que les deux datasets sont chargés
// ----------------------------
function attemptDataReady() {
  if (!dataReady && bikeData.length > 0 && weatherData.length > 0) {
    dataReady = true;
    console.log("Toutes les données sont chargées !");

    // calcul min/max longitude/latitude pour projection
    let lons = bikeData.map((d) => d.longitude);
    let lats = bikeData.map((d) => d.latitude);
    minLon = Math.min(...lons);
    maxLon = Math.max(...lons);
    minLat = Math.min(...lats);
    maxLat = Math.max(...lats);

    // heures uniques pour l'animation
    hours = [...new Set(bikeData.map((d) => d.datetime))].sort();
  }
}

// ----------------------------
// Fonction draw (animation)
// ----------------------------
function draw() {
  if (!dataReady) {
    background(0);
    fill(255);
    textSize(32);
    textAlign(CENTER, CENTER);
    text("Chargement des données…", width / 2, height / 2);
    return;
  }

  background(0);

  if (currentHour >= hours.length) {
    noLoop();
    return;
  }

  let hourStr = hours[currentHour];

  // Gradient de fond selon température
  let tempRow = weatherData.find((d) => d.date_time_local === hourStr);
  let temp = tempRow ? tempRow.temperature : 0;
  drawTempGradient(temp);

  // Dessiner les compteurs pour cette heure
  bikeData.forEach((d) => {
    if (d.datetime !== hourStr) return;

    let x = map(d.longitude, minLon, maxLon, 50, mapWidth - 50);
    let y = map(d.latitude, minLat, maxLat, mapHeight - 50, 50);

    let sizeCircle = map(d.nb_passages, 0, 20, 5, 40);
    fill(255, 200, 0, 180);
    ellipse(x, y, sizeCircle);

    // Cercles concentriques
    noFill();
    stroke(255, 150, 0, 100);
    strokeWeight(2);
    ellipse(x, y, sizeCircle + 10);
    ellipse(x, y, sizeCircle + 20);
    noStroke();
  });

  // Texte info
  fill(255);
  textSize(18);
  textAlign(RIGHT, TOP);
  text(`Heure: ${hourStr} | Temp: ${temp}°C`, width - 20, 20);

  currentHour++;
}

// ----------------------------
// Gradient selon température
// ----------------------------
function drawTempGradient(temp) {
  let t = map(temp, -10, 35, 0, 1);
  let c = lerpColor(color(0, 100, 255), color(255, 50, 0), t);

  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let col = lerpColor(color(0, 0, 0), c, inter);
    stroke(col);
    line(0, y, width, y);
  }
}
