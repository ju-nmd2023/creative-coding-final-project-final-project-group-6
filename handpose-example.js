let video;
let objectDetector;
let objects = [];

function setup() {
  createCanvas(innerWidth, innerHeight);
  objectDetector = ml5.objectDetector("cocossd", {}, modelLoaded);
  // objectDetector = ml5.objectDetector("yolo", {}, modelLoaded);
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

    fill(113, 219, 103);
    text(randomNumber, this.lastPosition.x - 1, this.lastPosition.y);
  }
  // Code borrowed from a website - END
}

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
  for (let i = 0; i < 130; i++) {
    let agent = new Agent(
      Math.random() * innerWidth,
      Math.random() * innerHeight,
      18,
      5
    );
    agents.push(agent);
  }
}

const fieldSize = 5000;
const maxCols = Math.ceil(innerWidth / fieldSize);
const maxRows = Math.ceil(innerHeight / fieldSize);
const divider = 20;
let field;
let agents = [];

function gotDetection(err, results) {
  console.log(results);
  objects = results;
  objectDetector.detect(video, gotDetection);
}

function draw() {
  background(255);

  let personDetected = objects.some(
    (obj) => obj.label === "person" && obj.confidence > 0.6
  );

  // / Code borrowed from a website - BEGIN
  //Source: ChatGPT (2025) https://chatgpt.com/share/68d3e3be-f730-800a-8a18-dfeaedc7692a
  if (personDetected) {
    for (let agent of agents) {
      const x = Math.floor(agent.position.x / fieldSize);
      const y = Math.floor(agent.position.y / fieldSize);
      const desiredDirection = field[x][y];
      agent.follow(desiredDirection);
      agent.update();
      agent.checkBorders();
      agent.draw();
    }
  } else {
    image(video, 0, 0, 640, 480);

    // Code borrowed from a website - END

    for (let obj of objects) {
      if (obj.confidence > 0.6) {
        push();
        noFill();
        strokeWeight(2);
        stroke(0, 255, 0);
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

function modelLoaded() {
  console.log("Model Loaded!");
}
