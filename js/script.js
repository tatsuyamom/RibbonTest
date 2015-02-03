var ctx;

var WIDTH = 1280;
var HEIGHT = 640;

var mouseX;
var mouseY;

var debug = true;

//****************
// Ball
//****************

var Ball= function(){
    this.x;
    this.y;
    this.vx;
		this.vy;
    this.solid;
		this.radius;

    this.subradius;
    this.orbitA_x;
    this.orbitA_y;
    this.orbitB_x;
    this.orbitB_y;
    this.orbitRadius;
    this.initOrbitRot;
    this.angleA;
    this.angleB;
    this.radianA;
    this.radianB;

}
Ball.prototype.init = function(x,y,r) {
  this.x = x;
  this.y = y;
  this.vx = 0;
  this.vy = 0;
  this.radius = 10;
  this.solid = false;

  this.subradius = 2;
  this.orbitA_x = 0;
  this.orbitA_y = 0;
  this.orbitB_x = 0;
  this.orbitB_y = 0;
  this.orbitRadius = 12;
  this.angleA = r;
  this.angleB = r+180;
  this.radianA = 0;
  this.radianB = 0;
};

Ball.prototype.update = function() {
  // 回転(値はラジアンで指定するため変換を行う)
  this.angleA = (this.angleA + 1) % 360;
  this.radianA = this.angleA/180*Math.PI;

  this.orbitA_x = this.x + this.orbitRadius * Math.cos(this.radianA);
  this.orbitA_y = this.y + this.orbitRadius * Math.sin(this.radianA);

  this.angleB = (this.angleB + 1) % 360;
  this.radianB = this.angleB/180*Math.PI;

  this.orbitB_x = this.x + this.orbitRadius * Math.cos(this.radianB);
  this.orbitB_y = this.y + this.orbitRadius * Math.sin(this.radianB);
}
Ball.prototype.render = function() {
  //円を描く
  ctx.beginPath();
	ctx.fillStyle = "#3399FF";
	ctx.arc(this.x,this.y,this.radius,0,Math.PI*2.0,true);
	ctx.fill();
  ctx.closePath();

  ctx.beginPath();
	ctx.fillStyle = "#FF7777";
	ctx.arc(this.orbitA_x,this.orbitA_y,this.subradius,0,Math.PI*2.0,true);
  ctx.arc(this.orbitB_x,this.orbitB_y,this.subradius,0,Math.PI*2.0,true);
	ctx.fill();
  ctx.closePath();

};



//****************
// Main
//****************

var BALL_NUM = 14;
var _points = new Array(BALL_NUM);

var spring = 0.05;//バネ係数
var friction = 0.95;//摩擦係数
var springLength = 50;//バネの最大の長さ

var pointsCnt = 0;
var mouseDown = false;

onload = function(){
    setup();
}

function setup(){
	var canvas = document.getElementById("ribbon");
  if(!canvas || !canvas.getContext){
      return false;
  }
  ctx = canvas.getContext('2d');

  setInterval(draw, 15);

  for(var i = 1 ; i <= BALL_NUM; i++){
     var ball = makePoint(Math.random()*WIDTH, Math.random()*HEIGHT,i*30);
     if(i==1){
        ball.solid = true;
     }
  }

  canvas.onmousemove = mouseMoveListner;
  canvas.onmousedown = mouseDownListner;
  canvas.onmouseup = mouseUpListner;
}
function makePoint(xpos, ypos,r) {
  var ball = new Ball();
  ball.init(xpos, ypos,r);
  _points[pointsCnt] = ball;
  pointsCnt++;
  return ball;
}
function updatePoints() {
  for (var i = 0; i < _points.length; i++) {
    _points[i].update();
  }
}
function renderPoints() {
  for (var i = 0; i < _points.length; i++) {
    _points[i].render();
  }
}

function mouseDownListner(e) {
  mouseDown = true;

}
function mouseUpListner(e) {
  mouseDown = false;

}
function mouseMoveListner(e) {
  if(mouseDown)
	adjustXY(e);

}
function adjustXY(e) {
		var rect = e.target.getBoundingClientRect();
		mouseX = e.clientX - rect.left;
		mouseY = e.clientY - rect.top;
   _points[0].x = mouseX;
   _points[0].y = mouseY;
}

function showPoints(){
  debug = !debug;
}
function update(){

  //_points[0]はマウスで操作

  for(var i = 1; i < BALL_NUM-1; i++ ){

    springTo(_points[i], _points[i-1]);
    springTo(_points[i], _points[i+1]);

  }

  //_points[BALL_NUM-1]は固定

  updatePoints();

}
function springTo(ballA, ballB){
  var dx = ballB.x - ballA.x;
  var dy = ballB.y - ballA.y;
  var angle = Math.atan2(dy, dx);
  var targetX = ballB.x - Math.cos(angle) * springLength;
  var targetY = ballB.y - Math.sin(angle) * springLength;
  ballA.vx += (targetX - ballA.x) * spring;
  ballA.vy += (targetY - ballA.y) * spring;
  ballA.vx *= friction;
  ballA.vy *= friction;
  if(!ballA.solid){
    ballA.x += ballA.vx;
  }
  ballA.y += ballA.vy;
}
function draw(){
	//描画をクリア
  ctx.clearRect(0,0,WIDTH,HEIGHT);

  update();

  if(debug)
  drawCurve();


  drawRibbon();

  if(debug)
  renderPoints();

}
function drawCurve(){

  ctx.beginPath();
  ctx.moveTo(_points[0].x, _points[0].y);

  for(var i = 1; i < BALL_NUM-1; i++){
    ctx.quadraticCurveTo(_points[i].x, _points[i].y, (_points[i].x+_points[i+1].x)/2,(_points[i].y+_points[i+1].y)/2);
  }

  ctx.quadraticCurveTo(_points[BALL_NUM-1].x, _points[BALL_NUM-1].y, (_points[BALL_NUM-1].x+_points[BALL_NUM-1].x)/2,(_points[BALL_NUM-1].y+_points[BALL_NUM-1].y)/2);
  ctx.moveTo(_points[BALL_NUM-1].x, _points[BALL_NUM-1].y);

  ctx.closePath();

  ctx.lineWidth = 2;
  ctx.strokeStyle = "#222222";
	ctx.stroke();

}
function drawRibbon(){

  ctx.beginPath();
  ctx.moveTo(_points[0].orbitA_x, _points[0].orbitA_y);

  for(var i = 1; i < BALL_NUM - 1; i++){
    ctx.quadraticCurveTo(_points[i].orbitA_x, _points[i].orbitA_y, (_points[i].orbitA_x+_points[i+1].orbitA_x)/2,(_points[i].orbitA_y+_points[i+1].orbitA_y)/2);
  }

  ctx.quadraticCurveTo(_points[BALL_NUM - 1].orbitA_x, _points[BALL_NUM - 1].orbitA_y, (_points[BALL_NUM - 1].orbitA_x+_points[BALL_NUM - 1].orbitA_x)/2,(_points[BALL_NUM - 1].orbitA_y+_points[BALL_NUM - 1].orbitA_y)/2);

  ctx.lineTo(_points[BALL_NUM - 1].orbitB_x, _points[BALL_NUM - 1].orbitB_y);

  ctx.quadraticCurveTo(_points[BALL_NUM - 1].orbitB_x, _points[BALL_NUM - 1].orbitB_y, (_points[BALL_NUM - 1].orbitB_x+_points[BALL_NUM - 1].orbitB_x)/2,(_points[BALL_NUM - 1].orbitB_y+_points[BALL_NUM - 1].orbitB_y)/2);

  for(var i = BALL_NUM - 2; i > 0; i--){
    ctx.quadraticCurveTo(_points[i].orbitB_x, _points[i].orbitB_y, (_points[i].orbitB_x+_points[i-1].orbitB_x)/2,(_points[i].orbitB_y+_points[i-1].orbitB_y)/2);
  }

  ctx.quadraticCurveTo(_points[0].orbitB_x, _points[0].orbitB_y, (_points[0].orbitB_x+_points[0].orbitB_x)/2,(_points[0].orbitB_y+_points[0].orbitB_y)/2);

  ctx.lineTo(_points[0].orbitA_x, _points[0].orbitA_y);

  ctx.closePath();
  ctx.fillStyle = "#000000";
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#AAAAAA";

  if(debug){
    ctx.stroke();
  }else{
    ctx.fill();
  }

}
