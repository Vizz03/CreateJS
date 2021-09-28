let stage,
  loader,
  flappy,
  jumpListener,
  pipeCreator,
  topPipe,
  bottomPipe,
  score,
  scoreTxt,
  endGameTxt,
  startGameTxt,
  grassCreator,
  initGrass;
let started;
let polygon;

const init = () => {
  stage = new createjs.StageGL("gameCanvas");

  createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCED;
  createjs.Ticker.framerate = 240;
  createjs.Ticker.addEventListener("tick", stage);

  const background = new createjs.Shape();
  background.graphics
    .beginLinearGradientFill(
      ["#2573BB", "#6CB8DA", "#567A32"],
      [0, 0.85, 1],
      0,
      0,
      0,
      480
    )
    .drawRect(0, 0, 320, 480);
  background.x = 0;
  background.y = 0;
  background.name = "background";
  background.cache(0, 0, 320, 480);

  stage.addChild(background);

  const manifest = [
    { src: "cloud.png", id: "cloud" },
    { src: "flappy.png", id: "flappy" },
    { src: "pipe.png", id: "pipe" },
    { src: "grass.png", id: "grass" },
  ];

  loader = new createjs.LoadQueue(true);
  loader.addEventListener("complete", handleComplete);
  loader.loadManifest(manifest, true, "./assets/");
};

const handleComplete = () => {
  started = false;
  createClouds();
  createFlappy();
  jumpListener = stage.on("stagemousedown", jumpFlappy);
  createjs.Ticker.addEventListener("tick", checkCollision);
  createScore();
  createStartGameTxt();
  grassInit();
};

const grassInit = () => {
  initGrass = new createjs.Bitmap(loader.getResult("grass"));
  initGrass.y = 320;
  initGrass.x = -30;
  initGrass.name = "initGrass";

  stage.addChild(initGrass);
};

const createClouds = () => {
  let clouds = [];
  for (let i = 0; i < 3; i++) {
    clouds.push(new createjs.Bitmap(loader.getResult("cloud")));
  }

  clouds[0].scaleX = 0.08;
  clouds[0].scaleY = 0.08;
  clouds[0].x = 10;
  clouds[0].y = 20;
  clouds[1].scaleX = 0.08;
  clouds[1].scaleY = 0.08;
  clouds[1].x = 180;
  clouds[1].y = 75;
  clouds[2].scaleX = 0.08;
  clouds[2].scaleY = 0.08;
  clouds[2].x = 70;
  clouds[2].y = 130;

  for (let i = 0; i < 3; i++) {
    let directionMultiplier = i % 2 == 0 ? -1 : 1;
    let originalX = clouds[i].x;
    createjs.Tween.get(clouds[i], { loop: true })
      .to(
        { x: clouds[i].x - 200 * directionMultiplier },
        2500,
        createjs.Ease.getPowInOut(1.5)
      )
      .to({ x: originalX }, 3000, createjs.Ease.getPowInOut(1.5));
    stage.addChild(clouds[i]);
  }
};

const createFlappy = () => {
  flappy = new createjs.Bitmap(loader.getResult("flappy"));
  flappy.regX = flappy.image.width / 2;
  flappy.regY = flappy.image.height / 2;
  flappy.x = stage.canvas.width / 2;
  flappy.y = stage.canvas.height / 2;
  stage.addChild(flappy);
};

const jumpFlappy = () => {
  if (!started) {
    startGame();
    stage.removeChild(startGameTxt, startGameTxtOutline);
    createjs.Tween.get(initGrass)
      .to({ x: 0 - stage.canvas.width }, 6500)
      .call(() => removeGrass(initGrass));
  }
  createjs.Tween.get(flappy, { override: true })
    .to(
      {
        y: flappy.y - 60,
        rotation: -10,
      },
      500,
      createjs.Ease.getPowOut(2)
    )
    .to(
      { y: stage.canvas.height + flappy.image.width / 2, rotation: 30 },
      1500,
      createjs.Ease.getPowIn(2)
    )
    .call(gameOver);
};

const pipeSize = (botPipe, topPipe) => {
  botPipe.scaleX = 0.35;
  botPipe.scaleY = 0.35;
  topPipe.scaleX = 0.35;
  topPipe.scaleY = 0.35;
};

const createPipes = () => {
  topPipe, bottomPipe;
  let position = Math.floor(Math.random() * 280 + 100);

  topPipe = new createjs.Bitmap(loader.getResult("pipe"));
  topPipe.y = position - 75;
  topPipe.x = stage.canvas.width + topPipe.image.width / 2;
  topPipe.rotation = 180;
  topPipe.skewY = 180;
  topPipe.name = "pipe";

  bottomPipe = new createjs.Bitmap(loader.getResult("pipe"));
  bottomPipe.y = position + 75;
  bottomPipe.x = stage.canvas.width + bottomPipe.image.width / 2;
  bottomPipe.name = "pipe";

  topPipe.regX = bottomPipe.regX = topPipe.image.width / 2;

  createjs.Tween.get(topPipe)
    .to({ x: 0 - topPipe.image.width }, 18000)
    .call(() => removePipe(topPipe))
    .addEventListener("change", updatePipe);

  createjs.Tween.get(bottomPipe)
    .to({ x: 0 - bottomPipe.image.width }, 18000)
    .call(() => removePipe(bottomPipe));

  let scoreIndex = stage.getChildIndex(scoreTxt);
  pipeSize(bottomPipe, topPipe);

  stage.addChildAt(bottomPipe, topPipe, scoreIndex);
};

const removePipe = (pipe) => {
  stage.removeChild(pipe);
};

const updatePipe = (e) => {
  let pipeUpdate = e.target.target;
  if (pipeUpdate.x - pipeUpdate.regX + 920 < flappy.x - flappy.regX) {
    e.target.removeEventListener("change", updatePipe);
    incrementScore();
  }
};

const createGrass = () => {
  let grass;

  grass = new createjs.Bitmap(loader.getResult("grass"));
  grass.y = 320;
  grass.x = stage.canvas.width;
  grass.name = "grass";

  createjs.Tween.get(grass, { loop: true })
    .to({ x: 0 - stage.canvas.width }, 8000)
    .call(() => removeGrass(grass));

  stage.addChild(grass);
};

const removeGrass = (grass) => {
  stage.removeChild(grass);
};

const incrementScore = () => {
  score++;
  scoreTxt.text = scoreTxtOutline.text = score;
  scoreTxt.updateCache();
  scoreTxtOutline.updateCache();
};

const createScore = () => {
  score = 0;
  scoreTxt = new createjs.Text(score, "bold 40px Arial", "#6B8E23");
  scoreTxt.textAlign = "center";
  scoreTxt.textBaseline = "middle";
  scoreTxt.x = 40;
  scoreTxt.y = 40;
  let bounds = scoreTxt.getBounds();
  scoreTxt.cache(
    -40,
    -40,
    bounds.width * 3 + Math.abs(bounds.x),
    bounds.height + Math.abs(bounds.y)
  );

  scoreTxtOutline = scoreTxt.clone();
  scoreTxtOutline.color = "#000000";
  scoreTxtOutline.outline = 1.5;

  bounds = scoreTxtOutline.getBounds();
  scoreTxtOutline.cache(
    -40,
    -40,
    bounds.width * 3 + Math.abs(bounds.x),
    bounds.height + Math.abs(bounds.y)
  );

  stage.addChild(scoreTxt, scoreTxtOutline);
};

const createStartGameTxt = () => {
  startGameTxt = new createjs.Text(
    "Start tapping to play!",
    "bold 30px Arial",
    "#FFFFFF"
  );
  startGameTxt.textAlign = "center";
  startGameTxt.textBaseline = "middle";
  startGameTxt.x = 163;
  startGameTxt.y = 120;

  let bounds = startGameTxt.getBounds();
  startGameTxt.cache(
    -165,
    -15,
    bounds.width * 3 + Math.abs(bounds.x),
    bounds.height + Math.abs(bounds.y)
  );

  startGameTxtOutline = startGameTxt.clone();
  startGameTxtOutline.color = "#000000";
  startGameTxtOutline.outline = 1.5;

  bounds = startGameTxtOutline.getBounds();
  startGameTxtOutline.cache(
    -165,
    -15,
    bounds.width * 3 + Math.abs(bounds.x),
    bounds.height + Math.abs(bounds.y)
  );

  stage.addChild(startGameTxt, startGameTxtOutline);
};

const startGame = () => {
  started = true;
  createPipes();
  createGrass();
  pipeCreator = setInterval(createPipes, 2000);
  grassCreator = setInterval(createGrass, 1500);
};

const checkCollision = () => {
  let leftX = flappy.x - flappy.regX + 5;
  let leftY = flappy.y - flappy.regY + 5;
  let points = [
    new createjs.Point(leftX, leftY),
    new createjs.Point(leftX + flappy.image.width - 10, leftY),
    new createjs.Point(leftX, leftY + flappy.image.height - 10),
    new createjs.Point(
      leftX + flappy.image.width - 10,
      leftY + flappy.image.height - 10
    ),
  ];

  for (let i = 0; i < points.length; i++) {
    let objects = stage.getObjectsUnderPoint(points[i].x, points[i].y);
    if (objects.filter((object) => object.name === "pipe").length > 0) {
      gameOver();
      return;
    }
  }
};

const createGameOverTxt = (scoreTxt) => {
  endGameTxt = new createjs.Text(
    `Game over\nYour score is ${scoreTxt}`,
    "bold 40px Arial",
    "#1E90FF"
  );
  endGameTxt.textAlign = "center";
  endGameTxt.textBaseline = "middle";
  endGameTxt.x = 163;
  endGameTxt.y = 120;

  let bounds = endGameTxt.getBounds();
  endGameTxt.cache(
    -165,
    -18,
    bounds.width * 3 + Math.abs(bounds.x),
    bounds.height + Math.abs(bounds.y)
  );

  endGameTxtOutline = endGameTxt.clone();
  endGameTxtOutline.color = "#000000";
  endGameTxtOutline.outline = 2.5;

  bounds = endGameTxtOutline.getBounds();
  endGameTxtOutline.cache(
    -165,
    -18,
    bounds.width * 3 + Math.abs(bounds.x),
    bounds.height + Math.abs(bounds.y)
  );

  stage.addChild(endGameTxt, endGameTxtOutline);
};

const gameOver = () => {
  createGameOverTxt(score);
  createjs.Tween.removeAllTweens();
  stage.off("stagemousedown", jumpListener);
  clearInterval(pipeCreator);
  clearInterval(grassCreator);
  createjs.Ticker.removeEventListener("tick", checkCollision);
  setTimeout(() => {
    stage.on("stagemousedown", resetGame, null, true);
  }, 1000);
};

const resetGame = () => {
  let childrenToRemove = stage.children.filter(
    (child) => child.name !== "background"
  );
  for (let i = 0; i < childrenToRemove.length; i++) {
    stage.removeChild(childrenToRemove[i]);
  }
  handleComplete();
};