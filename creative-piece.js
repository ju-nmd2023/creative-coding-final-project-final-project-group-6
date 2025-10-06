// ---- VIDEO + OBJECT DETECTION ----
let video;
let objectDetector;
let objects = [];

// --- FLOW FIELD + AGENTS ---
const fieldSize = 5;
const maxCols = Math.ceil(innerWidth / fieldSize);
const maxRows = Math.ceil(innerHeight / fieldSize);
const divider = 10;
let field;
let agents = [];

// --- PARTICLES ----
let particles = [];

// --- RECTANGLES ----
let rectangles = [];

// --- PRESSING SOUND ---
let player;
let squareSound;

// --- AMBIENCE SOUND ----
let ambience;
let ambienceStart = false;

// --- FUNCTION SETUP ----
function setup() {
  createCanvas(innerWidth, innerHeight);

  ambience = new Tone.Player("Childhood_Ambience.mp3").toDestination();

  objectDetector = ml5.objectDetector("cocossd", {}, modelLoaded);
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  video.elt.addEventListener("loadeddata", () => {
    objectDetector.detect(video, gotDetection);
  });

  video.hide();

  field = generateField();
  generateAgents();
}

// ---- CLASS AGENT -----
class Agent {
  constructor(x, y, maxSpeed, maxForce) {
    this.position = createVector(x, y);
    this.lastPosition = createVector(x, y);
    this.acceleration = createVector(0, 0);
    this.velocity = createVector(0, 0);
    this.maxSpeed = maxSpeed;
    this.maxForce = maxForce;
  }

  follow(desiredDirection) {
    desiredDirection = desiredDirection.copy();
    desiredDirection.mult(this.maxSpeed);
    let steer = p5.Vector.sub(desiredDirection, this.velocity);
    steer.limit(this.maxForce);
    this.applyForce(steer);
  }

  applyForce(force) {
    this.acceleration.add(force);
  }

  update() {
    this.lastPosition = this.position.copy();
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.position.add(this.velocity);
    this.acceleration.mult(0.2);
  }

  checkBorders() {
    if (this.position.x < 0) {
      this.position.x = innerWidth;
      this.lastPosition.x = innerWidth;
    } else if (this.position.x > innerWidth) {
      this.position.x = 0;
      this.lastPosition.x = 0;
    }
    if (this.position.y < 0) {
      this.position.y = innerHeight;
      this.lastPosition.y = innerHeight;
    } else if (this.position.y > innerHeight) {
      this.position.y = 0;
      this.lastPosition.y = 0;
    }
  }

  // Code borrowed from a website - BEGIN
  //Source: random. (n.d.). https://p5js.org/reference/p5/random/
  draw() {
    let numbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

    let randomNumber = random(numbers);

    if (millis() > 10000) {
      fill(158, 145, 173);
    } else {
      fill(68, 49, 95);
    }
    text(randomNumber, this.lastPosition.x - 1, this.lastPosition.y);
  }
  // Code borrowed from a website - END
}

// ------ CLASS PARTICLES ------
class Particle {
  constructor(x, y) {
    this.position = createVector(x, y);
    const a = Math.random() * Math.PI * 2;
    const v = 0.2 + Math.random();
    this.velocity = createVector(Math.cos(a) * v, Math.sin(a) * v);
    this.lifespan = 100000 + Math.random() * 100;
    this.size = 70;
    this.direction = random(["left", "right"]);
  }

  update() {
    this.lifespan--;
    this.velocity.mult(0.9);
    this.position.add(this.velocity);
  }

  draw() {
    push();
    translate(this.position.x, this.position.y);

    noStroke();

    let r = map(this.position.x, 0, width, 255, 50);
    let g = map(this.position.y, 0, height, 50, 255);
    let b = map(this.position.x + this.position.y, 0, width + height, 200, 50);

    let variation = noise(this.position.x * 0.01, this.position.y * 0.01) * 150;

    fill(r, g, b + variation, 150);
    ellipse(0, 0, this.size, this.size);

    if (this.direction === "right") {
      arc(0, 0, this.size, -HALF_PI, HALF_PI, PIE);
    } else {
      arc(0, 0, this.size, this.size, HALF_PI, 1.5 * PI, PIE);
    }

    pop();
  }

  isDead() {
    return this.lifespan <= 0;
  }
}

// ---- FUNCTIOS FOR GENERATIONS -----
function generateField() {
  let field = [];
  noiseSeed(Math.random() * 100);
  for (let x = 0; x < maxCols; x++) {
    field.push([]);
    for (let y = 0; y < maxRows; y++) {
      const value = noise(x / divider, y / divider) * Math.PI * 2;
      field[x].push(p5.Vector.fromAngle(value));
    }
  }
  return field;
}

function generateAgents() {
  for (let i = 0; i < 1530; i++) {
    let agent = new Agent(
      Math.random() * innerWidth,
      Math.random() * innerHeight,
      10,
      5
    );
    agents.push(agent);
  }
}

function generateParticles(x, y) {
  for (let i = 0; i < 1; i++) {
    const px = x + random(-10, 10);
    const py = y + random(-10, 10);
    const particle = new Particle(px, py);
    particles.push(particle);
  }
}

// ---- FUNCTIONS FOR SOUND + RECTANGLES -----
function keyPressed() {
  Tone.start();
  if (key === " ") {
    const newRect = {
      x: random(width),
      y: random(height),
      w: 80,
      h: 80,
      color: random([color(254, 58, 150, 120), color(255, 200, 0, 120)]),
    };
    rectangles.push(newRect);
  }

  if (!squareSound) {
    squareSound = new Tone.Player("drum.mp3").toDestination();

    Tone.loaded().then(() => {
      squareSound.start();
    });
  } else {
    squareSound.stop();
    squareSound.start();
  }
}

function mouseClicked() {
  Tone.start();
  for (let p of particles) {
    p.direction = random(["left", "right"]);
  }
  generateParticles(mouseX, mouseY);

  if (!player) {
    player = new Tone.Player("Clink.mp3").toDestination();
    const distortion = new Tone.Distortion(0.2).toDestination();
    const filter = new Tone.Filter(400, "lowpass").toDestination();
    player.connect(distortion);
    player.connect(filter);
    Tone.loaded().then(() => {
      player.start();
    });
  } else {
    player.stop();
    player.start();
  }
}

// -- FUNCTION FOR CAMERA DETECTION ----
function gotDetection(err, results) {
  console.log(results);
  objects = results;
  objectDetector.detect(video, gotDetection);
}

// ---- FUNCTION DRAW -----
function draw() {
  if (millis() > 10000) {
    background(68, 49, 95);
  } else {
    background(158, 145, 173);
  }

  // / Code borrowed from a website - BEGIN
  //Source: ChatGPT (2025) https://chatgpt.com/share/68d3e3be-f730-800a-8a18-dfeaedc7692a
  let personDetected = objects.some(
    (obj) => obj.label === "person" && obj.confidence > 0.6
  );

  if (personDetected) {
    if (!ambienceStart) {
      Tone.start().then(() => {
        ambience.start();
      });
      ambienceStart = true;
    }
    // Code borrowed from a website - END

    for (let agent of agents) {
      const x = Math.floor(agent.position.x / fieldSize);
      const y = Math.floor(agent.position.y / fieldSize);
      const desiredDirection = field[x][y];
      agent.follow(desiredDirection);
      agent.update();
      agent.checkBorders();
      agent.draw();
    }

    for (let r of rectangles) {
      fill(r.color);
      noStroke();
      rect(r.x, r.y, r.w, r.h);
    }

    for (let particle of particles) {
      particle.update();
      particle.draw();

      if (particle.isDead()) {
        particles.splice(particles.indexOf(particle), 1);
      }
    }
  } else {
    image(video, 0, 0, 640, 480);

    for (let obj of objects) {
      if (obj.confidence > 0.6) {
        push();
        noFill();
        strokeWeight(1);
        stroke(119, 53, 120);
        rect(obj.x, obj.y, obj.width, obj.height);
        pop();
        push();
        noStroke();
        fill(255);
        textSize(30);
        text(obj.label, obj.x, obj.y);
        pop();
      }
    }
  }
}

// --- FUNCTION FOR LOADING ---
function modelLoaded() {
  console.log("Model Loaded!");
}