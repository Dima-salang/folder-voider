let lines = [];
let blackHole;

function setup() {
  createCanvas(400, 545);
  frameRate(60);

  // Create initial lines at random positions along the edges
  for (let i = 0; i < 100; i++) {
    lines.push(createRandomLine());
  }

  // Create a black hole in the center
  blackHole = new BlackHole(width / 2, height / 2);
}

function draw() {
  background(255);

  // Display and update each line
  for (let i = 0; i < lines.length; i++) {
    lines[i].display();
    lines[i].update();
  }

  // Remove lines that are too close to the center
  lines = lines.filter(line => line.position.dist(blackHole.position) > 5);

  // Create new lines at random positions along the edges occasionally
  if (frameCount % 1 === 0) {
    lines.push(createRandomLine());
  }

  // Display the black hole
  blackHole.display();
}

function createRandomLine() {
  let x, y;

  // Randomly select one of the four edges
  let edge = floor(random(4));

  // Determine random position along the selected edge
  if (edge === 0) {
    // Top edge
    x = random(width);
    y = 0;
  } else if (edge === 1) {
    // Right edge
    x = width;
    y = random(height);
  } else if (edge === 2) {
    // Bottom edge
    x = random(width);
    y = height;
  } else {
    // Left edge
    x = 0;
    y = random(height);
  }

  // Return a new Line object
  return new Line(x, y);
}

class Line {
  constructor(x, y) {
    this.position = createVector(x, y);
  }

  update() {
    // Apply a force towards the center of the canvas (simulating the black hole)
    let force = createVector(blackHole.position.x, blackHole.position.y).sub(this.position);
    force.setMag(0.5);
    this.position.add(force);
  }

  display() {
    // Display the line
    stroke(0);
    strokeWeight(2);
    point(this.position.x, this.position.y);
  }
}

class BlackHole {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.radius = 20;
  }

  display() {
    // Display the black hole
    noStroke();
    fill(0);
    ellipse(this.position.x, this.position.y, this.radius * 2, this.radius * 2);
  }
}
