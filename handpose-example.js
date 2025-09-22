let video;
let handpose;
let predictions = [];

function preload() {
  handpose = ml5.handPose(modelLoaded);
}

function setup() {
  createCanvas(innerWidth, innerHeight);
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  handpose.detectStart(video, getHandsData);
}

function getHandsData(results) {
  predictions = results;
}

function draw() {
  background(255, 255, 255);
  image(video, 0, 0, 640, 480);

  for (let hand of predictions) {
    const keypoints = hand.keypoints;
    for (let keypoint of keypoints) {
      push();
      noStroke();
      fill(0, 255, 0);
      ellipse(keypoint.x, keypoint.y, 10);
      pop();
    }
  }
}

function modelLoaded() {
  console.log("Model Loaded!");
}
