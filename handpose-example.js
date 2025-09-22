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
}

function gotDetection(err, results) {
  console.log(results);
  objects = results;
  objectDetector.detect(video, gotDetection);
}

function draw() {
  background(255, 255, 255);
  image(video, 0, 0, 640, 480);

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
      fill(255, 255, 255);
      textSize(30);
      text(obj.label, obj.x, obj.y);
      pop();
    }
  }
}

function modelLoaded() {
  console.log("Model Loaded!");
}
