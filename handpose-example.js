let handpose;
let video;
let hands = [];

function preload() {
  handpose = ml5.handPose();
}
function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  handpose.detectStart(video, getHandsData);
}

function draw() {
  image(video, 0, 0, innerWidth, height);

  //if (hands.length > 0) {
  //let indexFinger = hands[0].index_finger_tip;
  //let thumb = hands[0].thumb_tip;

  //fill(120, 148, 19);
  //ellipse(indexFinger.x, indexFinger.y, 20);
  //ellipse(thumb.x, thumb.y, 20);

  for (let hand of hands) {
    let indexFinger = hand.index_finger_tip;
    let thumb = hand.thumb_tip;

    let centerX = (indexFinger.x + thumb.x) / 2;
    let centerY = (indexFinger.y + thumb.y) / 2;

    let distance = dist(indexFinger.x, indexFinger.y, thumb.x, thumb.y);

    nostroke();
    fill(0, 0, 255);
    ellipse(centerX, centerY, distance);
  }
}

function getHandsData(results) {
  hands = results;
}
